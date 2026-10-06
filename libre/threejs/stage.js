/**
 * Stage — une petite couche 2D « mode immédiat » au-dessus de Three.js (WebGL).
 *
 * Three.js est un moteur 3D : il ne connaît ni le texte, ni le CSS. Ici, à chaque image :
 *   1. les briques du kit appellent g.rect(), g.image(), g.text()… dans l'ordre d'empilement ;
 *   2. chaque appel réutilise un rectangle (deux triangles) pris dans une réserve et règle
 *      sa matrice, sa couleur ou sa texture ;
 *   3. Three.js dessine le tout avec la carte graphique.
 * Le texte et les formes floues sont d'abord dessinés dans un petit canvas 2D, puis envoyés
 * comme texture (c'est la façon habituelle d'afficher du texte en WebGL).
 *
 * Repère : comme en CSS, (0,0) en haut à gauche, y vers le bas.
 */
import * as THREE from 'three';
import {ASCENT, CONTENT_H, FONT, H, W} from '../shared/core.js';

// On garde les couleurs telles quelles (sRGB) pour que les transparences se mélangent
// exactement comme dans un navigateur — sinon les dégradés et fondus sortent plus clairs.
THREE.ColorManagement.enabled = false;

const VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vPos;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPos = world.xy;
    gl_Position = projectionMatrix * viewMatrix * world;
  }`;
const FRAG = /* glsl */ `
  uniform vec4 uColor;      // couleur unie (si pas de texture)
  uniform sampler2D uMap;   // texture (alpha prémultiplié)
  uniform float uUseMap;
  uniform float uOpacity;
  uniform vec4 uClip;       // masque rectangulaire x0, y0, x1, y1 (pixels de la scène)
  uniform float uShape;     // 0 rectangle · 1 disque · 2 anneau
  uniform vec2 uSize;       // taille du rectangle en pixels (pour disque / anneau)
  uniform float uLine;      // épaisseur de l'anneau
  uniform float uMultiply;  // 1 = mode « produit » (voile de couleur)
  varying vec2 vUv;
  varying vec2 vPos;
  void main() {
    // couverture du masque, adoucie sur 1 pixel
    float cov = clamp(vPos.x - uClip.x + 0.5, 0.0, 1.0) * clamp(uClip.z - vPos.x + 0.5, 0.0, 1.0)
              * clamp(vPos.y - uClip.y + 0.5, 0.0, 1.0) * clamp(uClip.w - vPos.y + 0.5, 0.0, 1.0);
    if (uShape > 0.5) {
      float d = length((vUv - 0.5) * uSize);
      float r = min(uSize.x, uSize.y) * 0.5;
      cov *= uShape < 1.5 ? clamp(r - d + 0.5, 0.0, 1.0) : clamp(uLine * 0.5 - abs(d - (r - uLine * 0.5)) + 0.5, 0.0, 1.0);
    }
    if (cov <= 0.0) discard;
    if (uMultiply > 0.5) {
      gl_FragColor = vec4(mix(vec3(1.0), uColor.rgb, uOpacity * cov * uColor.a), 1.0);
      return;
    }
    vec4 c = uUseMap > 0.5 ? texture2D(uMap, vUv) : vec4(uColor.rgb * uColor.a, uColor.a);
    gl_FragColor = c * uOpacity * cov;
  }`;

// Photo visible seulement à travers un masque de texte (mots géants « remplis » par une image).
const MASK_FRAG = /* glsl */ `
  uniform sampler2D uPhoto;
  uniform sampler2D uMask;
  uniform vec4 uPhotoRect;  // x, y, largeur, hauteur de la photo à l'écran (cover + zoom)
  uniform float uReveal;    // part visible depuis la gauche, en pixels
  varying vec2 vUv;
  varying vec2 vPos;
  void main() {
    float a = texture2D(uMask, vUv).a * clamp(uReveal - vPos.x + 0.5, 0.0, 1.0);
    if (a <= 0.0) discard;
    vec2 puv = (vPos - uPhotoRect.xy) / uPhotoRect.zw;
    gl_FragColor = vec4(texture2D(uPhoto, puv).rgb * a, a);
  }`;

const NO_CLIP = [-1e6, -1e6, 1e6, 1e6];
const hexToRgba = (() => {
  const cache = new Map();
  const ctx = document.createElement('canvas').getContext('2d', {willReadFrequently: true});
  return (css) => {
    if (!cache.has(css)) {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      // getImageData renvoie des valeurs non prémultipliées
      cache.set(css, [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255]);
    }
    return cache.get(css);
  };
})();

export class Stage {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true, premultipliedAlpha: true});
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(W, H);
    this.renderer.autoClear = false;
    document.body.prepend(this.renderer.domElement);

    // caméra orthographique : 1 unité = 1 pixel, origine en haut à gauche, y vers le bas
    this.camera = new THREE.OrthographicCamera(0, W, 0, H, -10, 10);
    this.scene = new THREE.Scene();
    this.unit = new THREE.PlaneGeometry(1, 1).translate(0.5, 0.5, 0); // rectangle 0..1

    this.pool = [];
    this.used = 0;
    this.textures = new Map();
    this.geometries = new Map();
    this.photos = new Map();
    this.target = new THREE.WebGLRenderTarget(W, H, {samples: 4});
    this.reset();
  }

  // ------------------------------------------------------------ état ----
  reset() {
    this.m = [1, 0, 0, 1, 0, 0]; // matrice affine 2D courante [a b c d e f]
    this.opacity = 1;
    this.clipRect = NO_CLIP;
    this.stack = [];
  }
  save() {
    this.stack.push([this.m.slice(), this.opacity, this.clipRect]);
  }
  restore() {
    [this.m, this.opacity, this.clipRect] = this.stack.pop();
  }
  /** Exécute `fn` dans un état sauvegardé puis restauré (comme un groupe). */
  group(fn) {
    this.save();
    fn();
    this.restore();
  }
  mul(n) {
    const [a, b, c, d, e, f] = this.m;
    this.m = [a * n[0] + c * n[1], b * n[0] + d * n[1], a * n[2] + c * n[3], b * n[2] + d * n[3], a * n[4] + c * n[5] + e, b * n[4] + d * n[5] + f];
  }
  translate(x, y) {
    this.mul([1, 0, 0, 1, x, y]);
  }
  scale(sx, sy = sx) {
    this.mul([sx, 0, 0, sy, 0, 0]);
  }
  rotate(deg) {
    const r = (deg * Math.PI) / 180;
    this.mul([Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0]);
  }
  alpha(a) {
    this.opacity *= a;
  }
  /** Masque rectangulaire (dans le repère courant, supposé sans rotation), cumulé avec le masque parent. */
  clip(x, y, w, h) {
    const [a, , , d, e, f] = this.m;
    const xs = [a * x + e, a * (x + w) + e];
    const ys = [d * y + f, d * (y + h) + f];
    const c = this.clipRect;
    this.clipRect = [Math.max(c[0], Math.min(...xs)), Math.max(c[1], Math.min(...ys)), Math.min(c[2], Math.max(...xs)), Math.min(c[3], Math.max(...ys))];
  }

  // -------------------------------------------------------- réserve ----
  mesh(geometry, x, y, w, h) {
    let mesh = this.pool[this.used];
    if (!mesh) {
      const material = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.CustomBlending,
        uniforms: {
          uColor: {value: new THREE.Vector4()}, uMap: {value: null}, uUseMap: {value: 0}, uOpacity: {value: 1},
          uClip: {value: new THREE.Vector4()}, uShape: {value: 0}, uSize: {value: new THREE.Vector2()}, uLine: {value: 0}, uMultiply: {value: 0},
        },
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.matrixAutoUpdate = false;
      mesh.frustumCulled = false;
      this.pool.push(mesh);
      this.scene.add(mesh);
    }
    mesh.geometry = geometry;
    mesh.visible = true;
    mesh.renderOrder = this.used++;
    // matrice courante × (translation, échelle) du rectangle
    const [a, b, c, d, e, f] = this.m;
    mesh.matrix.set(a * w, c * h, 0, a * x + c * y + e, b * w, d * h, 0, b * x + d * y + f, 0, 0, 1, 0, 0, 0, 0, 1);
    mesh.matrixWorld.copy(mesh.matrix);
    const u = mesh.material.uniforms;
    u.uOpacity.value = this.opacity;
    u.uClip.value.set(...this.clipRect);
    u.uUseMap.value = 0;
    u.uShape.value = 0;
    u.uMultiply.value = 0;
    // alpha prémultiplié : source + destination × (1 − alpha)
    mesh.material.blendSrc = THREE.OneFactor;
    mesh.material.blendDst = THREE.OneMinusSrcAlphaFactor;
    return mesh;
  }

  // ------------------------------------------------------ primitives ----
  rect(x, y, w, h, color, {multiply = false} = {}) {
    const mesh = this.mesh(this.unit, x, y, w, h);
    const u = mesh.material.uniforms;
    u.uColor.value.set(...hexToRgba(color));
    if (multiply) {
      u.uMultiply.value = 1;
      mesh.material.blendSrc = THREE.DstColorFactor;
      mesh.material.blendDst = THREE.ZeroFactor;
    }
  }
  /** Disque plein (r) ou anneau (stroke + lineWidth), centré en (cx, cy). */
  circle(cx, cy, r, color, lineWidth = 0) {
    const R = r + lineWidth / 2;
    const u = this.mesh(this.unit, cx - R, cy - R, 2 * R, 2 * R).material.uniforms;
    u.uColor.value.set(...hexToRgba(color));
    u.uShape.value = lineWidth ? 2 : 1;
    u.uSize.value.set(2 * R, 2 * R);
    u.uLine.value = lineWidth;
  }
  /** Polygone plein. `key` identifie la géométrie (mise en cache). */
  polygon(key, points, color) {
    if (!this.geometries.has(key)) {
      const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
      this.geometries.set(key, new THREE.ShapeGeometry(shape));
    }
    this.mesh(this.geometries.get(key), 0, 0, 1, 1).material.uniforms.uColor.value.set(...hexToRgba(color));
  }
  /** Texture quelconque dans un rectangle. */
  textured(texture, x, y, w, h) {
    const u = this.mesh(this.unit, x, y, w, h).material.uniforms;
    u.uMap.value = texture;
    u.uUseMap.value = 1;
  }

  /**
   * Petit canvas 2D dessiné une fois puis gardé comme texture (texte, formes floues, dégradés).
   * `draw(ctx)` dessine dans un repère où (0,0) est le coin du canvas.
   */
  sprite(key, w, h, draw) {
    if (!this.textures.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.ceil(w));
      canvas.height = Math.max(1, Math.ceil(h));
      draw(canvas.getContext('2d'));
      const tex = new THREE.CanvasTexture(canvas);
      tex.premultiplyAlpha = true;
      tex.flipY = false;
      tex.generateMipmaps = false;
      tex.minFilter = tex.magFilter = THREE.LinearFilter;
      tex.userData = {w: canvas.width, h: canvas.height};
      this.textures.set(key, tex);
    }
    return this.textures.get(key);
  }
  /** Dégradé linéaire CSS dans un rectangle : (x0,y0)→(x1,y1) en fraction de la boîte. */
  gradient(x, y, w, h, [x0, y0, x1, y1], stops) {
    const key = `grad|${w}|${h}|${x0},${y0},${x1},${y1}|${stops.join()}`;
    const tex = this.sprite(key, w, h, (ctx) => {
      const g = ctx.createLinearGradient(x0 * w, y0 * h, x1 * w, y1 * h);
      for (let i = 0; i < stops.length; i += 2) g.addColorStop(stops[i], stops[i + 1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    this.textured(tex, x, y, w, h);
  }

  // ----------------------------------------------------------- texte ----
  /** Largeur d'un texte en pixels. */
  measure(text, size, weight, spacing = 0, family = FONT) {
    const ctx = (this.measureCtx ??= document.createElement('canvas').getContext('2d'));
    ctx.font = `${weight} ${size}px "${family}"`;
    ctx.letterSpacing = `${spacing}px`;
    return ctx.measureText(text).width;
  }
  /**
   * Une ligne de texte posée comme en CSS : `top` = haut de la boîte de ligne, `lh` = line-height.
   * Le texte est dessiné dans un canvas 2D (avec flou et ombre éventuels) puis affiché comme texture.
   * `res` : sur-échantillonnage, utile quand le texte est ensuite agrandi.
   */
  text(text, x, top, {size, weight = 800, color, lh = CONTENT_H, align = 'left', spacing = 0, blur = 0, shadow = null, family = FONT, res = 1}) {
    if (!text) return;
    spacing = Math.round(spacing * 4) / 4;
    blur = Math.round(blur * 2) / 2;
    const width = this.measure(text, size, weight, spacing, family);
    const pad = Math.ceil(blur * 3 + (shadow ? shadow.blur * 1.5 + Math.abs(shadow.dy) : 0) + 6);
    const w = width + 2 * pad;
    const h = lh * size + 2 * pad;
    const key = `txt|${text}|${size}|${weight}|${color}|${lh}|${spacing}|${blur}|${shadow ? shadow.color + shadow.blur : ''}|${family}|${res}`;
    const tex = this.sprite(key, w * res, h * res, (ctx) => {
      ctx.scale(res, res);
      ctx.font = `${weight} ${size}px "${family}"`;
      ctx.letterSpacing = `${spacing}px`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = color;
      if (blur) ctx.filter = `blur(${blur}px)`;
      if (shadow) {
        ctx.shadowColor = shadow.color;
        ctx.shadowBlur = shadow.blur * res;
        ctx.shadowOffsetY = shadow.dy * res;
      }
      ctx.fillText(text, pad, pad + ((lh - CONTENT_H) / 2 + ASCENT) * size);
    });
    const left = x - (align === 'left' ? 0 : align === 'center' ? width / 2 : width);
    this.textured(tex, left - pad, top - pad, w, h);
  }

  // ---------------------------------------------------------- photos ----
  async loadPhotos(names, url) {
    const loader = new THREE.TextureLoader();
    await Promise.all(
      names.map(async (name) => {
        const tex = await loader.loadAsync(url(name));
        tex.flipY = false;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.anisotropy = 8;
        this.photos.set(name, tex);
      }),
    );
  }
  /** Rectangle écran d'une photo qui remplit la boîte (object-fit: cover), centrée, avec un zoom. */
  coverRect(name, x, y, w, h, zoom) {
    const img = this.photos.get(name).image;
    const k = Math.max(w / img.width, h / img.height) * zoom;
    return [x + w / 2 - (img.width * k) / 2, y + h / 2 - (img.height * k) / 2, img.width * k, img.height * k];
  }
  /** Photo recadrée dans la boîte x, y, w, h. */
  image(name, x, y, w, h, zoom = 1) {
    this.group(() => {
      this.clip(x, y, w, h);
      this.textured(this.photos.get(name), ...this.coverRect(name, x, y, w, h, zoom));
    });
  }
  /** Photo plein écran visible seulement dans le masque (texture) et à gauche de `reveal` pixels. */
  maskedPhoto(name, mask, zoom, reveal) {
    if (!this.maskMaterial) {
      this.maskMaterial = [];
    }
    const mesh = this.mesh(this.unit, 0, 0, W, H);
    let mat = this.maskMaterial[mesh.renderOrder];
    if (!mat) {
      mat = this.maskMaterial[mesh.renderOrder] = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: MASK_FRAG, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
        blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
        uniforms: {uPhoto: {value: null}, uMask: {value: null}, uPhotoRect: {value: new THREE.Vector4()}, uReveal: {value: 0}},
      });
    }
    mesh.userData.base = mesh.userData.base ?? mesh.material;
    mesh.material = mat;
    mesh.userData.swapped = true;
    mat.uniforms.uPhoto.value = this.photos.get(name);
    mat.uniforms.uMask.value = mask;
    mat.uniforms.uPhotoRect.value.set(...this.coverRect(name, 0, 0, W, H, zoom));
    mat.uniforms.uReveal.value = reveal;
  }

  // ---------------------------------------------------------- tracés ----
  /** Points régulièrement espacés le long d'un tracé SVG (mis en cache). */
  samples(d, step = 2) {
    const key = `samples|${step}|${d}`;
    if (!this.geometries.has(key)) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      const length = path.getTotalLength();
      const n = Math.ceil(length / step);
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const p = path.getPointAtLength((i / n) * length);
        pts.push([p.x, p.y]);
      }
      this.geometries.set(key, {pts, length});
    }
    return this.geometries.get(key);
  }
  /** Trait d'épaisseur `width` le long d'un tracé SVG, dessiné de `start` à `end` (fractions 0..1). */
  stroke(d, color, width, start = 0, end = 1, {round = false} = {}) {
    if (end - start <= 0.0005) return;
    const {pts} = this.samples(d);
    const key = `ribbon|${width}|${d}`;
    if (!this.geometries.has(key)) {
      const pos = [];
      const idx = [];
      pts.forEach(([x, y], i) => {
        const [px, py] = pts[Math.max(0, i - 1)];
        const [nx, ny] = pts[Math.min(pts.length - 1, i + 1)];
        const len = Math.hypot(nx - px, ny - py) || 1;
        const ox = (-(ny - py) / len) * (width / 2);
        const oy = ((nx - px) / len) * (width / 2);
        pos.push(x + ox, y + oy, 0, x - ox, y - oy, 0);
        if (i < pts.length - 1) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
      geo.setIndex(idx);
      this.geometries.set(key, geo);
    }
    // une géométrie par tranche dessinée serait coûteuse : on clone la référence et on borne le dessin
    const base = this.geometries.get(key);
    const n = pts.length - 1;
    const i0 = Math.floor(start * n);
    const i1 = Math.ceil(end * n);
    const rangeKey = `${key}|${i0}|${i1}`;
    if (!this.geometries.has(rangeKey)) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', base.attributes.position);
      geo.setAttribute('uv', base.attributes.uv);
      geo.setIndex(base.index);
      geo.setDrawRange(i0 * 6, (i1 - i0) * 6);
      this.geometries.set(rangeKey, geo);
    }
    this.mesh(this.geometries.get(rangeKey), 0, 0, 1, 1).material.uniforms.uColor.value.set(...hexToRgba(color));
    if (round) {
      this.circle(...pts[i0], width / 2, color);
      this.circle(...pts[i1], width / 2, color);
    }
  }
  /** Segment droit (éventuellement en pointillés réguliers `dash` pixels pleins / `dash` vides). */
  line(x0, y0, x1, y1, color, width, dash = 0) {
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (len < 0.01) return;
    this.group(() => {
      this.translate(x0, y0);
      this.rotate((Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI);
      if (!dash) return this.rect(0, -width / 2, len, width, color);
      for (let s = 0; s < len; s += 2 * dash) this.rect(s, -width / 2, Math.min(dash, len - s), width, color);
    });
  }

  // ----------------------------------------------------------- rendu ----
  /** Démarre le dessin d'une scène (remet la réserve à zéro). */
  begin() {
    this.reset();
    this.used = 0;
    for (const mesh of this.pool) {
      mesh.visible = false;
      if (mesh.userData.swapped) {
        mesh.material = mesh.userData.base;
        mesh.userData.swapped = false;
      }
    }
  }
  /**
   * Envoie la scène à l'écran. `x` = décalage horizontal (glissement), `reveal` = part visible
   * depuis la gauche (volet), `opacity` = fondu (la scène est alors dessinée à part puis recollée).
   */
  flush({x = 0, reveal = 1, opacity = 1} = {}) {
    const r = this.renderer;
    if (opacity < 1) {
      r.setRenderTarget(this.target);
      r.setViewport(0, 0, W, H);
      r.setScissorTest(false);
      r.setClearColor(0xffffff, 1);
      r.clear();
      r.render(this.scene, this.camera);
      r.setRenderTarget(null);
      this.begin();
      this.alpha(opacity);
      // la cible de rendu a l'axe y de WebGL : on la retourne
      this.group(() => {
        this.translate(0, H);
        this.scale(1, -1);
        this.textured(this.target.texture, 0, 0, W, H);
      });
      x = 0;
      reveal = 1;
    }
    r.setRenderTarget(null);
    r.setViewport(x, 0, W, H);
    r.setScissor(Math.max(0, x), 0, Math.max(0, Math.min(W, x + W * reveal) - Math.max(0, x)), H);
    r.setScissorTest(true);
    r.render(this.scene, this.camera);
  }
  clear() {
    const r = this.renderer;
    r.setRenderTarget(null);
    r.setScissorTest(false);
    r.setViewport(0, 0, W, H);
    r.setClearColor(0xffffff, 1);
    r.clear();
  }
}
