// Data center film — Three.js (MIT) version.
// Same storyboard as the Revideo and Manim versions (../shared/spec.json), but as a real 3D
// data hall. Nothing animates on its own: window.renderFrame(f) sets the whole scene from
// t = f / fps, so every render is identical (frame-by-frame capture in render.mjs).
import * as THREE from 'three';

const spec = await (await fetch('../shared/spec.json')).json();
const T = spec.t;
const C = spec.colors;
const L = spec.layout;
const {width: W, height: H, fps, duration} = spec.video;

// ------------------------------------------------------------- math ----
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const outExpo = (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const inOutExpo = (k) =>
  k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2;
const smooth = (k) => k * k * (3 - 2 * k);
const frac = (v) => v - Math.floor(v);
const hash = (a, b = 0) => frac(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

const ACCENT = new THREE.Color(C.accent);
const HIGHLIGHT = new THREE.Color(C.highlight);
const WHITE = new THREE.Color(C.line);

// ----------------------------------------------------------- renderer ----
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.setClearColor(C.bg);
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.055);
const camera = new THREE.PerspectiveCamera(38, W / H, 0.05, 200);
const world = new THREE.Group();
scene.add(world);

// ------------------------------------------------------------ textures ----
const canvasTex = (draw, size = 128) => {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};
const glowTex = canvasTex((g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  r.addColorStop(0.5, 'rgba(255,255,255,0.12)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, s, s);
});
const ringTex = canvasTex((g, s) => {
  g.strokeStyle = 'white';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2);
  g.stroke();
}, 256);
const dotTex = canvasTex((g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, s, s);
}, 32);

const sprite = (color, scale, opacity = 1) => {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false}),
  );
  s.scale.setScalar(scale);
  world.add(s);
  return s;
};
const lineMat = (color, opacity) =>
  new THREE.LineBasicMaterial({color, transparent: true, opacity, depthWrite: false});

/** A 2-point line whose far end can be animated (draw-on). */
const segment = (a, b, color, opacity) => {
  const geo = new THREE.BufferGeometry().setFromPoints([a, a.clone()]);
  const line = new THREE.Line(geo, lineMat(color, opacity));
  line.userData = {a, b};
  line.frustumCulled = false;
  world.add(line);
  return line;
};
const setDraw = (line, k) => {
  const {a, b} = line.userData;
  const p = line.geometry.attributes.position;
  p.setXYZ(1, lerp(a.x, b.x, k), lerp(a.y, b.y, k), lerp(a.z, b.z, k));
  p.needsUpdate = true;
  line.visible = k > 0.001;
};

const boxEdges = (w, h, d, color, opacity) => {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({color: 0x030303, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1}));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry), lineMat(color, opacity));
  g.add(body, edges);
  g.userData.edges = edges;
  world.add(g);
  return g;
};

// -------------------------------------------------------------- layout ----
const PER_ROW = 8;
const RACK = {w: 0.6, h: 2.0, d: 1.1, pitch: 0.7};
const ROW_Z = [-1.3, 1.3];
const FRONT = 0.75; // |z| of the rack fronts facing the cold aisle
const rackX = (i) => (i - (PER_ROW - 1) / 2) * RACK.pitch;
const SLOTS = L.slotsPerRack;
const slotY = (j) => 0.3 + j * 0.132;

const EDGE = V(0, 4.6, 0);
const FIBER_START = V(-18, 4.6, 0);
const spinePos = (i) => V((i - (L.spines - 1) / 2) * 1.3, 3.5, 0);
const leafPos = (j) => V(rackX(j), 2.06, ROW_Z[0]);
const SPINE = spinePos(L.targetSpine);
const LEAF = leafPos(L.targetLeaf);
const RACK_IN = V(rackX(L.targetLeaf), 1.92, -FRONT);

// floor grid
const grid = new THREE.GridHelper(60, 120, C.line, C.line);
grid.material.transparent = true;
grid.material.opacity = 0.06;
grid.material.depthWrite = false;
world.add(grid);

// racks: black bodies + white edges (merged into one LineSegments)
const rackBodies = new THREE.InstancedMesh(new THREE.BoxGeometry(RACK.w, RACK.h, RACK.d), new THREE.MeshBasicMaterial({color: 0x020202, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1}), PER_ROW * 2);
const edgeProto = new THREE.EdgesGeometry(new THREE.BoxGeometry(RACK.w, RACK.h, RACK.d)).attributes.position.array;
const edgePos = [];
const m4 = new THREE.Matrix4();
ROW_Z.forEach((z, r) =>
  Array.from({length: PER_ROW}, (_, i) => {
    m4.makeTranslation(rackX(i), RACK.h / 2, z);
    rackBodies.setMatrixAt(r * PER_ROW + i, m4);
    for (let k = 0; k < edgeProto.length; k += 3) edgePos.push(edgeProto[k] + rackX(i), edgeProto[k + 1] + RACK.h / 2, edgeProto[k + 2] + z);
  }),
);
world.add(rackBodies);
const rackEdgesGeo = new THREE.BufferGeometry();
rackEdgesGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePos, 3));
const rackEdges = new THREE.LineSegments(rackEdgesGeo, lineMat(C.line, 0.3));
world.add(rackEdges);

// overhead cable trays along each row
ROW_Z.forEach((z) => {
  [z - 0.25, z + 0.25].forEach((zz) => world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-3.2, 2.6, zz), V(3.2, 2.6, zz)]), lineMat(C.line, 0.12))));
});

// server slots + status LEDs on the rack fronts (instanced, per-instance color)
const SLOT_COUNT = PER_ROW * 2 * SLOTS;
const slots = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.42, 0.062), new THREE.MeshBasicMaterial({toneMapped: false}), SLOT_COUNT);
const leds = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.022, 0.022), new THREE.MeshBasicMaterial({toneMapped: false}), SLOT_COUNT);
const obj = new THREE.Object3D();
for (let r = 0; r < 2; r++)
  for (let i = 0; i < PER_ROW; i++)
    for (let j = 0; j < SLOTS; j++) {
      const n = (r * PER_ROW + i) * SLOTS + j;
      const z = (r === 0 ? -FRONT : FRONT) + (r === 0 ? 0.004 : -0.004);
      obj.rotation.set(0, r === 0 ? 0 : Math.PI, 0);
      obj.position.set(rackX(i) + (r === 0 ? -0.04 : 0.04), slotY(j), z);
      obj.updateMatrix();
      slots.setMatrixAt(n, obj.matrix);
      obj.position.set(rackX(i) + (r === 0 ? 0.24 : -0.24), slotY(j), z);
      obj.updateMatrix();
      leds.setMatrixAt(n, obj.matrix);
      slots.setColorAt(n, new THREE.Color(0x111111));
      leds.setColorAt(n, new THREE.Color(0x222222));
    }
world.add(slots, leds);

// network
const edgeBox = boxEdges(0.5, 0.5, 0.5, C.line, 0.5);
edgeBox.position.copy(EDGE);
const spines = Array.from({length: L.spines}, (_, i) => {
  const b = boxEdges(0.5, 0.2, 0.5, C.line, 0.45);
  b.position.copy(spinePos(i));
  return b;
});
const leaves = Array.from({length: L.leaves}, (_, j) => {
  const b = boxEdges(0.58, 0.1, 0.8, C.line, 0.45);
  b.position.copy(leafPos(j));
  return b;
});
const fiber = segment(FIBER_START, V(EDGE.x - 0.27, EDGE.y, 0), C.line, 0.35);
const fiberLit = segment(FIBER_START, V(EDGE.x - 0.27, EDGE.y, 0), C.accent, 0.9);
const upLinks = spines.map((s, i) => segment(V(EDGE.x, EDGE.y - 0.25, 0), V(s.position.x, s.position.y + 0.1, 0), C.line, 0.22));
const downLinks = [];
spines.forEach((s, i) =>
  leaves.forEach((l, j) => downLinks.push({i, j, line: segment(V(s.position.x, s.position.y - 0.1, 0), V(l.position.x, l.position.y + 0.05, l.position.z), C.line, 0.12)})),
);
const route = [
  [segment(V(EDGE.x, EDGE.y - 0.25, 0), V(SPINE.x, SPINE.y + 0.1, 0), C.accent, 1), T.hopSpine, 0.6],
  [segment(V(SPINE.x, SPINE.y - 0.1, 0), V(LEAF.x, LEAF.y + 0.05, LEAF.z), C.accent, 1), T.hopLeaf, 0.7],
  [segment(V(LEAF.x, LEAF.y - 0.05, LEAF.z), RACK_IN, C.accent, 1), T.packetToRack, 0.4],
];

// packet, pings, response tokens
const packetGlow = sprite(ACCENT, 0.7);
const packetCore = sprite(HIGHLIGHT, 0.16);
const pings = [
  [EDGE, T.packetArrive],
  [SPINE, T.hopSpine + 0.6],
  [LEAF, T.hopLeaf + 0.7],
].map(([p, at]) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: ringTex, color: ACCENT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false}));
  s.position.copy(p);
  world.add(s);
  return {s, at};
});
const hitGlows = [
  [edgeBox, EDGE, T.packetArrive],
  [spines[L.targetSpine], SPINE, T.hopSpine + 0.6],
  [leaves[L.targetLeaf], LEAF, T.hopLeaf + 0.7],
].map(([box, p, at]) => {
  const g = sprite(ACCENT, 0.9, 0);
  g.position.copy(p);
  return {box, g, at};
});
const respPath = [RACK_IN, V(LEAF.x, LEAF.y, LEAF.z), V(SPINE.x, SPINE.y, 0), V(EDGE.x, EDGE.y, 0), V(EDGE.x, 9, 0)];
const tokens = Array.from({length: 10}, (_, k) => sprite(k === 0 ? HIGHLIGHT : ACCENT, k === 0 ? 0.35 : 0.22, 0));

// airflow particles
const COLD = 420;
const HOT = 480;
const airGeo = new THREE.BufferGeometry();
const airPos = new Float32Array((COLD + HOT) * 3);
const airCol = new Float32Array((COLD + HOT) * 3);
airGeo.setAttribute('position', new THREE.BufferAttribute(airPos, 3));
airGeo.setAttribute('color', new THREE.BufferAttribute(airCol, 3));
const air = new THREE.Points(
  airGeo,
  new THREE.PointsMaterial({size: 0.045, map: dotTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false}),
);
air.frustumCulled = false;
world.add(air);

// ----------------------------------------------------------------- DOM ----
const $ = (id) => document.getElementById(id);
const hud = $('hud');
const maxes = [100, 50, 15000];
const statEls = spec.copy.stats.map((s, k) => {
  const el = document.createElement('div');
  el.className = 'stat';
  el.style.top = `${k * 92}px`;
  el.innerHTML = `<div class="k">${s.label}</div><div class="v"></div><div class="track"><div class="bar"></div></div>`;
  hud.appendChild(el);
  return el;
});
const tempEls = spec.copy.temps.map((s, k) => {
  const el = document.createElement('div');
  el.className = 'temp';
  el.style.top = `${3 * 92 + 26 + k * 56}px`;
  el.innerHTML = `<span class="k">${s.label}</span><span class="v" style="color:${k === 0 ? 'rgba(255,255,255,0.85)' : C.accent}"></span>`;
  hud.appendChild(el);
  return el;
});
hud.querySelector('.rule').style.height = '0px';
const fmt = (v, d) => v.toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});

const project = (p) => {
  const v = p.clone().applyMatrix4(world.matrixWorld).project(camera);
  return {x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H, behind: v.z > 1};
};

// -------------------------------------------------------------- camera ----
const packetPos = (t) => {
  const arrive = V(EDGE.x - 0.3, EDGE.y, 0);
  if (t < T.packetArrive) return FIBER_START.clone().lerp(arrive, inOutExpo(prog(t, T.packetIn, T.packetArrive)));
  if (t < T.hopSpine) return arrive.clone().lerp(EDGE, outExpo(prog(t, T.packetArrive, T.packetArrive + 0.4)));
  if (t < T.hopLeaf) return EDGE.clone().lerp(SPINE, inOutExpo(prog(t, T.hopSpine, T.hopSpine + 0.6)));
  if (t < T.packetToRack) return SPINE.clone().lerp(LEAF, inOutExpo(prog(t, T.hopLeaf, T.hopLeaf + 0.7)));
  return LEAF.clone().lerp(RACK_IN, inOutExpo(prog(t, T.packetToRack, T.packetToRack + 0.4)));
};

const pose = (pos, target) => ({pos, target});
const mixPose = (a, b, k) => pose(a.pos.clone().lerp(b.pos, k), a.target.clone().lerp(b.target, k));

const cameraAt = (t) => {
  // S1: ride along the fiber next to the packet
  const px = Math.min(packetPos(Math.min(t, T.packetArrive)).x, EDGE.x - 0.3);
  const follow = pose(V(px - 1.7, 4.95, 2.1), V(px + 1.0, 4.55, 0));
  // S2: crane back to reveal the network and the hall below, with a slow orbit
  const orbit = 0.18 * smooth(prog(t, T.pullBack + 1.6, T.racksIn));
  const wide = pose(V(5.4 * Math.cos(orbit) - 8.6 * Math.sin(orbit) * 0.3, 5.8, 8.6 - 2 * orbit), V(0, 2.5, 0));
  // S3/S4: down into the cold aisle, slow dolly along it
  const dolly = smooth(prog(t, T.racksIn + 1.6, T.collapse));
  const aisle = pose(V(lerp(-8.2, -6.0, dolly), lerp(1.35, 1.5, dolly), 0.02), V(lerp(1.5, 2.6, dolly), 1.05, 0));
  // S5: tilt up to follow the response
  const up = pose(aisle.pos.clone().add(V(0, 0.25, 0)), V(aisle.target.x - 0.6, 2.6, -0.2));

  let p = mixPose(follow, wide, inOutExpo(prog(t, T.pullBack, T.pullBack + 1.8)));
  p = mixPose(p, aisle, inOutExpo(prog(t, T.racksIn - 0.1, T.racksIn + 1.7)));
  p = mixPose(p, up, inOutExpo(prog(t, T.response - 0.2, T.response + 0.7)));
  return p;
};

const slotActivation = (t, r, i, j) => {
  const d = Math.abs(i - L.targetLeaf) + r * 1.6 + Math.abs(j - SLOTS / 2) * 0.3;
  const s = T.computeWave + d * 0.2;
  return outExpo(prog(t, s, s + 0.5));
};

// --------------------------------------------------------------- frame ----
const tmpC = new THREE.Color();
const setOpacity = (o, a) => {
  o.material.opacity = a;
  o.visible = a > 0.003;
};

window.renderFrame = (frame) => {
  const t = frame / fps;

  // camera + collapse (world shrinks into the camera target = screen center)
  const cp = cameraAt(t);
  camera.position.copy(cp.pos);
  camera.lookAt(cp.target);
  const collapse = inOutExpo(prog(t, T.collapse, T.point));
  const k = Math.max(1 - collapse, 1e-4);
  world.scale.setScalar(k);
  world.position.copy(cp.target).multiplyScalar(1 - k);
  world.visible = collapse < 0.999;
  world.updateMatrixWorld(true);

  // fiber + packet
  setDraw(fiber, outExpo(prog(t, T.fiberDraw, T.fiberDraw + 1.4)));
  const pk = packetPos(t);
  const lit = t < T.hopSpine ? 0.9 * (1 - prog(t, T.packetArrive + 0.4, T.hopSpine)) : 0;
  setOpacity(fiberLit, lit);
  fiberLit.userData.b = V(Math.min(pk.x, EDGE.x - 0.27), EDGE.y, 0);
  setDraw(fiberLit, 1);
  const pkA = prog(t, T.packetIn - 0.3, T.packetIn) * (1 - prog(t, T.packetToRack + 0.35, T.packetToRack + 0.5));
  const pulse = 1 + 0.25 * Math.sin(t * 8) * prog(t, T.packetArrive, T.packetArrive + 0.2) * (1 - prog(t, T.hopSpine - 0.1, T.hopSpine));
  packetGlow.position.copy(pk);
  packetCore.position.copy(pk);
  packetGlow.scale.setScalar(0.7 * pulse);
  setOpacity(packetGlow, pkA);
  setOpacity(packetCore, pkA);

  // network draw-on
  upLinks.forEach((l, i) => {
    const s0 = T.linksDraw + i * 0.07;
    setDraw(l, outExpo(prog(t, s0, s0 + 0.9)));
  });
  downLinks.forEach(({i, j, line}) => {
    const s1 = T.linksDraw + 0.3 + (i * L.leaves + j) * 0.014;
    setDraw(line, outExpo(prog(t, s1, s1 + 0.9)));
  });
  route.forEach(([line, s, d]) => {
    setDraw(line, inOutExpo(prog(t, s, s + d)));
    setOpacity(line, (1 - 0.6 * prog(t, s + d + 0.6, s + d + 2.5)) * (1 - prog(t, T.collapse - 0.2, T.collapse)));
  });
  const nodeIn = (o, appear) => {
    const a = outExpo(prog(t, appear, appear + 0.6));
    o.scale.setScalar(0.6 + 0.4 * a);
    o.visible = a > 0.001;
  };
  nodeIn(edgeBox, 0.35);
  spines.forEach((s, i) => nodeIn(s, T.linksDraw + 0.1 + i * 0.06));
  leaves.forEach((l, j) => nodeIn(l, T.linksDraw + 0.5 + j * 0.05));
  hitGlows.forEach(({box, g, at}) => {
    const on = t >= at;
    box.userData.edges.material.color.set(on ? C.accent : C.line);
    box.userData.edges.material.opacity = on ? 1 : 0.45;
    setOpacity(g, on ? 0.25 + 0.75 * Math.exp(-(t - at) * 2.2) : 0);
  });
  pings.forEach(({s, at}) => {
    const kk = outExpo(prog(t, at, at + 1.1));
    s.scale.setScalar(0.3 + 2.6 * kk);
    setOpacity(s, t >= at ? 0.8 * (1 - prog(t, at, at + 1.1)) : 0);
  });

  // racks rise in
  const hall = outExpo(prog(t, T.racksIn - 3.6, T.racksIn - 2.2)); // dim reveal during the crane-back
  rackEdges.material.opacity = 0.08 + 0.24 * hall + 0.1 * outExpo(prog(t, T.racksIn, T.racksIn + 1));

  // slots + LEDs
  for (let r = 0; r < 2; r++)
    for (let i = 0; i < PER_ROW; i++)
      for (let j = 0; j < SLOTS; j++) {
        const n = (r * PER_ROW + i) * SLOTS + j;
        const a = slotActivation(t, r, i, j);
        const h = hash(r * 31 + i, j);
        const flick = 0.55 + 0.45 * Math.sin(t * (4 + h * 5) + h * 9);
        tmpC.setRGB(0.045, 0.045, 0.045).lerp(ACCENT, a * (0.22 + 0.4 * flick));
        slots.setColorAt(n, tmpC);
        const blink = frac(t * (0.7 + h * 1.6) + h) > 0.35 ? 1 : 0.2;
        if (a > 0.05) tmpC.copy(HIGHLIGHT).multiplyScalar(blink);
        else tmpC.setRGB(0.35, 0.35, 0.35).multiplyScalar(blink * (0.3 + 0.7 * hall));
        leds.setColorAt(n, tmpC);
      }
  slots.instanceColor.needsUpdate = true;
  leds.instanceColor.needsUpdate = true;

  // airflow
  const airA = outExpo(prog(t, T.cooling, T.cooling + 0.8)) * (1 - prog(t, T.collapse - 0.3, T.collapse + 0.1));
  air.visible = airA > 0.003;
  if (air.visible) {
    const tc = t - T.cooling;
    for (let n = 0; n < COLD; n++) {
      const f = frac(hash(n, 5) + tc * (0.35 + hash(n, 4) * 0.3));
      const z0 = (hash(n, 2) - 0.5) * 1.0;
      airPos.set([(hash(n, 1) - 0.5) * 6, f * 2.1, z0 * 1.4 + Math.sign(z0 || 1) * f * 0.35], n * 3);
      const a = Math.sin(Math.PI * f) * airA * 0.55;
      airCol.set([a, a, a], n * 3);
    }
    for (let m = 0; m < HOT; m++) {
      const n = COLD + m;
      const f = frac(hash(n, 9) + tc * (0.4 + hash(n, 8) * 0.35));
      const side = m % 2 ? 1 : -1;
      const x = (hash(n, 7) - 0.5) * 6 + Math.sin(f * 7 + m) * 0.08;
      airPos.set([x, 0.4 + f * 3.2, side * (1.95 + hash(n, 6) * 0.35)], n * 3);
      const a = Math.sin(Math.PI * f) * airA;
      airCol.set([ACCENT.r * a, ACCENT.g * a, ACCENT.b * a], n * 3);
    }
    airGeo.attributes.position.needsUpdate = true;
    airGeo.attributes.color.needsUpdate = true;
  }

  // response tokens
  tokens.forEach((s, kk) => {
    const st = T.response + kk * 0.06;
    const on = t >= st && t < st + 0.95;
    setOpacity(s, on ? 1 - 0.07 * kk : 0);
    if (!on) return;
    const u = inOutExpo(prog(t, st, st + 0.9)) * (respPath.length - 1);
    const i = Math.min(respPath.length - 2, Math.floor(u));
    s.position.copy(respPath[i]).lerp(respPath[i + 1], u - i);
  });

  renderer.render(scene, camera);

  // ------------------------------------------------------ DOM overlay ----
  const req = spec.copy.request;
  const reqEl = $('reqLabel');
  const rp = project(V(EDGE.x - 0.45, EDGE.y + 0.32, 0));
  reqEl.textContent = req.slice(0, Math.floor(prog(t, T.requestLabel, T.requestLabel + 0.8) * req.length));
  reqEl.style.transform = `translate(${rp.x}px, ${rp.y}px) translate(-100%, -50%)`;
  reqEl.style.opacity = String(1 - prog(t, T.pullBack + 0.4, T.pullBack + 1.0));

  const net = spec.copy.network;
  const netEl = $('netLabel');
  const np = project(V(EDGE.x + 0.45, EDGE.y, 0));
  netEl.textContent = net.slice(0, Math.floor(prog(t, T.networkLabel, T.networkLabel + 0.6) * net.length));
  netEl.style.transform = `translate(${np.x}px, ${np.y}px) translate(0, -50%)`;
  netEl.style.opacity = String(1 - prog(t, T.racksIn - 0.2, T.racksIn + 0.4));

  const hudIn = outExpo(prog(t, T.stats - 0.1, T.stats + 0.6)) * (1 - prog(t, T.collapse - 0.2, T.collapse + 0.2));
  hud.style.opacity = String(hudIn);
  $('hudShade').style.opacity = String(hudIn);
  hud.style.transform = `translateX(${40 * (1 - hudIn)}px)`;
  hud.querySelector('.rule').style.height = `${430 * hudIn}px`;
  spec.copy.stats.forEach((s, kk) => {
    const n = outExpo(prog(t, T.stats + kk * 0.18, T.stats + kk * 0.18 + 1.6));
    statEls[kk].querySelector('.v').textContent = fmt(s.value * n, s.decimals) + s.unit;
    statEls[kk].querySelector('.bar').style.width = `${220 * (s.value / maxes[kk]) * n}px`;
  });
  spec.copy.temps.forEach((s, kk) => {
    const at = T.temps + kk * 0.2;
    const n = outExpo(prog(t, at, at + 1.4));
    tempEls[kk].style.opacity = String(prog(t, at, at + 0.3));
    tempEls[kk].querySelector('.v').textContent = Math.round(s.value * n) + s.unit;
  });

  // point + end card
  const SIZE = 22;
  const end = spec.copy.endCard;
  const TW = end.length * SIZE * 0.6 * 1.08;
  const born = smooth(prog(t, T.collapse + 0.55, T.point));
  const pls = Math.exp(-Math.max(0, t - T.point) * 3.5) * (t >= T.point ? 1 : 0.4);
  const rev = inOutExpo(prog(t, T.endReveal, T.endReveal + T.endRevealDur));
  const pre = outExpo(prog(t, T.endReveal - 0.35, T.endReveal));
  const px = (-TW / 2) * pre + TW * rev + 10 * rev;
  const toCaret = smooth(prog(rev, 0.85, 1));
  const ae = t - (T.endReveal + T.endRevealDur);
  const blink = ae > 0 && ae < 1.2 ? clamp(0.5 + 1.6 * Math.cos(ae * Math.PI * 2 * 1.6)) : 1;
  const fade = outExpo(prog(t, T.fadeOut, duration - 0.04));

  const et = $('endText');
  et.textContent = end;
  et.style.left = `${-TW / 2}px`;
  et.style.letterSpacing = `${SIZE * (0.05 + 0.08 * (1 - rev))}px`;
  et.style.width = `${rev > 0 ? Math.max(0, px + TW / 2) : 0}px`;
  et.style.opacity = String(1 - fade);
  const r = born * 7 * (1 + 0.6 * pls);
  const w = r * 2 * (1 - toCaret) + 10 * toCaret;
  const h = r * 2 * (1 - toCaret) + SIZE * 1.05 * toCaret;
  const glow = 30 * born * (1 + 1.5 * pls);
  Object.assign($('point').style, {
    left: `${px - w / 2}px`,
    top: `${-h / 2}px`,
    width: `${w}px`,
    height: `${h}px`,
    borderRadius: `${50 * (1 - toCaret)}%`,
    background: toCaret > 0.5 ? C.accent : C.highlight,
    boxShadow: `0 0 ${glow * 0.3}px ${C.accent}, 0 0 ${glow}px rgba(255,106,26,0.6)`,
    opacity: String(born * blink * (1 - fade)),
  });
  $('fade').style.opacity = String(fade);
  return true;
};

await document.fonts.load("22px 'JetBrains Mono'");
window.renderFrame(0);
window.ready = true;
