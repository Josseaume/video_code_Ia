/**
 * Kit « institutionnel » — portage Three.js de src/kit/ (Remotion).
 *
 * Chaque brique est une fonction `brique(g, f, props)` appelée À CHAQUE IMAGE :
 *   g = le Stage (voir stage.js), f = l'image locale de la scène (équivalent de useCurrentFrame).
 * Elle calcule où en est l'animation et dessine tout de suite (pas d'objets gardés d'une image à l'autre).
 */
import {
  ASCENT, BURST_COLORS, CONTENT_H, Ease, FLOW_PATHS, FONT_TNUM, H, K, OISE, W,
  clamp01, fmtFr, interp, projectMap, rnd, spring,
} from '../shared/core.js';

const SHADOW = {color: 'rgba(0,0,0,0.35)', blur: 18, dy: 2};

// --------------------------------------------------------------- photos ----
/** Zoom lent sans borne, comme interpolate() par défaut dans l'original. */
const zoomAt = (f, [a, b], duration) => a + ((b - a) * f) / duration;

export const photo = (g, f, {name, zoom = [1.04, 1.14], duration = 180}) => g.image(name, 0, 0, W, H, zoomAt(f, zoom, duration));

/** Vignette photo qui « pop » depuis son centre, puis zoome doucement. */
export const tile = (g, f, {name, x, y, w, h, delay = 0, shade = false}) => {
  const s = spring(f - delay, {damping: 15, stiffness: 140});
  const inset = (1 - Math.min(1, s)) * 0.5;
  if (inset >= 0.5) return;
  g.group(() => {
    // scale(0.85 + 0.15 s) autour du centre de la vignette
    g.translate(x + w / 2, y + h / 2);
    g.scale(0.85 + 0.15 * s);
    g.translate(-w / 2, -h / 2);
    g.clip(w * inset, h * inset, w * (1 - 2 * inset), h * (1 - 2 * inset));
    g.image(name, 0, 0, w, h, zoomAt(f, [1.2, 1.05], 120));
    if (shade) g.gradient(0, 0, w, h, [0, 0, 0, 1], [0, 'rgba(0,0,0,0.6)', 0.55, 'rgba(0,0,0,0)']);
  });
};

/** Carré de couleur plein (accent du style institutionnel). */
export const square = (g, f, {x, y, size, color, delay = 0}) => {
  const s = spring(f - delay, {damping: 11, stiffness: 160});
  if (s <= 0) return;
  g.group(() => {
    g.translate(x + size / 2, y + size / 2);
    g.scale(s);
    g.rotate((1 - s) * 90);
    g.rect(-size / 2, -size / 2, size, size, color);
  });
};

// ---------------------------------------------------------------- texte ----
const styled = (line, fallback) => {
  const weight = line.weight ?? 800;
  const size = line.size ?? fallback;
  return {text: line.text.toUpperCase(), weight, size, color: line.color ?? K.burgundy, spacing: (weight >= 600 ? 0.01 : 0.03) * size};
};

/** Bloc de lignes révélées l'une après l'autre : « rise » (monte derrière un masque) ou « spread » (flou + lettres espacées). */
export const textBlock = (g, f, {lines, x, y, delay = 0, stagger = 5, size, mode = 'rise', align = 'left'}) => {
  let top = y;
  lines.forEach((line, i) => {
    const st = styled(line, size ?? (mode === 'rise' ? 56 : 40));
    const lineH = st.size * 1.05;
    const d = delay + i * stagger;
    if (mode === 'rise') {
      const s = spring(f - d, {damping: 200, stiffness: 120});
      g.group(() => {
        g.clip(-W, top, 4 * W, lineH + 4);
        g.text(st.text, x, top + (1 - s) * 1.1 * lineH, {...st, lh: 1.05, align});
      });
      top += lineH + 4;
    } else {
      const p = interp(f - d, [0, 16], [0, 1], Ease.outCubic);
      if (p > 0) {
        g.group(() => {
          g.alpha(p);
          g.text(st.text, x, top, {...st, lh: 1.05, align, spacing: ((1 - p) * 0.5 + 0.01) * st.size, blur: (1 - p) * 10});
        });
      }
      top += lineH;
    }
  });
};

// --------------------------------------------------------- ligne souple ----
/** Ligne fine qui se dessine (tête) puis s'efface par l'arrière (queue). */
export const flowLine = (g, f, {path = 'sweep', color = K.line, width = 2.5, delay = 0, draw = 45, tailDelay = null}) => {
  const head = interp(f - delay, [0, draw], [0, 1], Ease.inOutCubic);
  const tail = tailDelay === null ? 0 : interp(f - delay - tailDelay, [0, draw], [0, 1], Ease.inOutCubic);
  g.stroke(FLOW_PATHS[path], color, width, tail, head, {round: true});
};

// --------------------------------------------------------------- formes ----
const triPoints = (size, pts) => pts.map(([px, py]) => [(px / 100 - 0.5) * size, (py / 100 - 0.5) * size]);
/** Forme (carré ou triangle) centrée en (0,0), éventuellement floue : dessinée dans un canvas si flou. */
const shape = (g, kind, size, color, blur, pts) => {
  blur = Math.round(blur * 2) / 2;
  if (!blur) {
    if (kind === 'square') return g.rect(-size / 2, -size / 2, size, size, color);
    return g.polygon(`tri|${size}|${pts}`, triPoints(size, pts), color);
  }
  const pad = Math.ceil(blur * 3) + 2;
  const s = Math.round(size * 4) / 4;
  const tex = g.sprite(`shape|${kind}|${s}|${color}|${blur}|${pts}`, s + 2 * pad, s + 2 * pad, (ctx) => {
    ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = color;
    ctx.translate(pad + s / 2, pad + s / 2);
    if (kind === 'square') return ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.beginPath();
    triPoints(s, pts).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.fill();
  });
  g.textured(tex, -s / 2 - pad, -s / 2 - pad, s + 2 * pad, s + 2 * pad);
};

/** Salve de formes qui traversent l'écran à grande vitesse (flou de mouvement simulé). */
export const shapeBurst = (g, f, {count = 26, seed = 'burst', delay = 0, duration = 28}) => {
  for (let i = 0; i < count; i++) {
    const r = (k) => rnd(`${seed}-${k}-${i}`);
    const start = delay + r('start') * 10;
    const p = interp(f, [start, start + duration * (0.7 + r('speed') * 0.6)], [0, 1], Ease.outCubic);
    if (p <= 0 || p >= 1) continue;
    const size = 14 + r('size') * 46;
    const x = 2100 + r('fx') * 300 + (-300 - r('tx') * 300 - (2100 + r('fx') * 300)) * p;
    const y = 80 + r('y') * 920 + Math.sin(p * 6 + i) * 30;
    g.group(() => {
      g.translate(x + size / 2, y + size / 2);
      g.rotate(r('rot') * 360 + p * 180);
      g.scale(1 + (1 - p) * 1.8, 1);
      shape(g, r('kind') > 0.8 ? 'triangle' : 'square', size, BURST_COLORS[i % BURST_COLORS.length], (1 - p) * 6, [[50, 6], [96, 94], [4, 94]]);
    });
  }
};

/** Grappe de carrés : chacun arrive de loin en tournant, se pose, puis flotte légèrement. */
export const squareCluster = (g, f, {x, y, squares, delay = 0, seed = 'cluster', scale = 1}) => {
  g.group(() => {
    g.translate(x, y);
    g.scale(scale);
    squares.forEach((sq, i) => {
      const s = spring(f - delay - i * 2, {damping: 14, stiffness: 90});
      if (s <= 0.02) return;
      const angle = rnd(`${seed}-a-${i}`) * Math.PI * 2;
      g.group(() => {
        g.translate(sq.dx + Math.cos(angle) * 900 * (1 - s), sq.dy + Math.sin(angle) * 900 * (1 - s) + Math.sin((f + i * 20) / 22) * 4);
        g.rotate((1 - s) * 270);
        g.rect(-sq.size / 2, -sq.size / 2, sq.size, sq.size, sq.color);
      });
    });
  });
};

/** Logo du projet (fictif) : marque en 4 carrés + nom en deux graisses, centré en (cx, cy). */
export const projectLogo = (g, f, {name, size = 90, delay = 0, cx = W / 2, cy = H / 2}) => {
  const mark = spring(f - delay, {damping: 12});
  const word = interp(f - delay, [6, 22], [0, 1], Ease.outCubic);
  const unit = size * 0.36;
  const markW = unit * 2.12;
  const spacing = -0.01 * size;
  const w0 = g.measure(name[0], size, 300, spacing);
  const w1 = g.measure(name[1], size, 800, spacing);
  const left = cx - (markW + size * 0.28 + w0 + w1) / 2;
  const textLeft = left + markW + size * 0.28;
  if (mark > 0) {
    g.group(() => {
      g.translate(left + markW / 2, cy);
      g.rotate((1 - mark) * -90);
      g.scale(mark);
      [K.lime, K.green, K.orange, K.teal].forEach((c, i) => g.rect((i % 2) * unit * 1.12 - markW / 2, Math.floor(i / 2) * unit * 1.12 - markW / 2, unit, unit, c));
    });
  }
  if (word > 0) {
    g.group(() => {
      g.translate((1 - word) * -30, 0);
      g.clip(textLeft, cy - size, (w0 + w1) * word, 2 * size);
      g.text(name[0], textLeft, cy - size / 2, {size, weight: 300, color: K.green, lh: 1, spacing});
      g.text(name[1], textLeft + w0, cy - size / 2, {size, weight: 800, color: K.green, lh: 1, spacing});
    });
  }
};

/** Carré de couleur contenant le logo en blanc (le « badge » des vidéos institutionnelles). */
export const badge = (g, f, {x, y, size, color = K.orange, delay = 0, label = ['oise', 'datapark']}) => {
  const s = spring(f - delay, {damping: 13, stiffness: 150});
  if (s <= 0) return;
  const fs = size * 0.2;
  const blockW = Math.max(g.measure(label[0], fs, 300), g.measure(label[1], fs, 800));
  g.group(() => {
    g.translate(x + size / 2, y + size / 2);
    g.scale(s);
    // ombre portée : 0 6px 24px rgba(0,0,0,0.12)
    const pad = 60;
    const shadow = g.sprite(`boxshadow|${size}`, size + 2 * pad, size + 2 * pad, (ctx) => {
      ctx.filter = 'blur(12px)';
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(pad, pad + 6, size, size);
    });
    g.textured(shadow, -size / 2 - pad, -size / 2 - pad, size + 2 * pad, size + 2 * pad);
    g.rect(-size / 2, -size / 2, size, size, color);
    g.alpha(interp(f - delay, [6, 14], [0, 1]));
    g.text(label[0], -blockW / 2, -fs * 0.95, {size: fs, weight: 300, color: 'white', lh: 0.95, res: 2});
    g.text(label[1], -blockW / 2, 0, {size: fs, weight: 800, color: 'white', lh: 0.95, res: 2});
  });
};

// --------------------------------------------------------------- effets ----
/** Voile de couleur plein écran en mode « produit » (flash vert anis). */
export const colorWash = (g, f, {color = K.lime, at, hold = 6, max = 0.75}) => {
  const opacity = interp(f, [at, at + 5, at + 5 + hold, at + 14 + hold], [0, max, max, 0]);
  if (opacity > 0) g.group(() => (g.alpha(opacity), g.rect(0, 0, W, H, color, {multiply: true})));
};

/** Triangle qui arrive en tournant puis fonce vers la caméra (ou se rétracte). */
export const triangleZoom = (g, f, {color = K.orange, delay = 0, x = 960, y = 540, exit = 'zoom'}) => {
  const inS = spring(f - delay, {damping: 12});
  const zoom = exit === 'zoom' ? interp(f - delay, [18, 32], [1, 40], Ease.inCubic) : interp(f - delay, [16, 24], [1, 0], Ease.inBack(2));
  if (inS * zoom === 0) return;
  g.group(() => {
    g.translate(x, y);
    g.scale(inS * zoom);
    g.rotate((1 - inS) * 180);
    shape(g, 'triangle', 160, color, Math.max(0, (1 - inS) * 8), [[50, 8], [95, 92], [5, 92]]);
  });
};

/** Texte qui s'écrit lettre par lettre, chaque lettre « atterrit » depuis plus grand. */
export const typeOn = (g, f, {text, x, y, size = 64, color = K.burgundy, delay = 0, speed = 1.3}) => {
  const boxH = CONTENT_H * size;
  let left = x;
  text.split('').forEach((ch, i) => {
    const w = g.measure(ch, size, 800);
    const cx = left + w / 2;
    left += w;
    const p = interp(f - delay - i / speed, [0, 8], [0, 1], Ease.outBack(2));
    if (p <= 0 || ch === ' ') return;
    g.group(() => {
      // CSS : scale(k) translateY(d) autour du point (50 %, 80 %) de la lettre
      g.translate(cx, y + 0.8 * boxH);
      g.scale(2.2 - 1.2 * p);
      g.translate(0, (1 - p) * -20 - 0.8 * boxH);
      g.alpha(clamp01(p * 3));
      g.text(ch, 0, 0, {size, weight: 800, color, align: 'center', res: 2});
    });
  });
};

// -------------------------------------------------------------- collage ----
/** Mise en page libre (photos, carrés, badge, textes) avec une lente dérive latérale de l'ensemble. */
export const collage = (g, f, {items, drift = -60, duration = 180}) => {
  g.group(() => {
    g.translate((drift * f) / duration, 0);
    for (const item of items) {
      if (item.kind === 'photo') tile(g, f, item);
      if (item.kind === 'square') square(g, f, item);
      if (item.kind === 'badge') badge(g, f, item);
      if (item.kind === 'text') textBlock(g, f, item);
    }
  });
};

/** Rangée de vignettes alignées (mosaïque), centrée horizontalement. */
export const mosaicRow = (names, o) => {
  const gap = o.gap ?? 14;
  const x0 = (W - (names.length * o.w + (names.length - 1) * gap)) / 2;
  return names.map((name, i) => ({kind: 'photo', name, x: x0 + i * (o.w + gap), y: o.y, w: o.w, h: o.h, delay: (o.delay ?? 0) + i * (o.stagger ?? 4)}));
};

// ----------------------------------------------------------- chiffre clé ----
/** Carte photo + carré de couleur en coin + chiffre clé qui défile. */
export const statCard = (g, f, {name, lines, x, y, w, h, delay = 0, accent = K.orange}) => {
  tile(g, f, {name, x, y, w, h, delay});
  const shade = interp(f - delay, [8, 18], [0, 1]);
  if (shade > 0) {
    // dégradé CSS « to top right » : sa direction est perpendiculaire à la diagonale de la boîte
    const diag = Math.hypot(w, h);
    const half = (w * h) / diag;
    const [dx, dy] = [((h / diag) * half) / w, ((-w / diag) * half) / h];
    g.group(() => {
      g.alpha(shade);
      g.gradient(x, y, w, h, [0.5 - dx, 0.5 - dy, 0.5 + dx, 0.5 + dy], [0, 'rgba(0,0,0,0.55)', 0.65, 'rgba(0,0,0,0)']);
    });
  }
  square(g, f, {x: x - 40, y: y - 40, size: 80, color: accent, delay: delay + 4});
  const final = (l) => ('count' in l ? fmtFr(l.count) + (l.suffix ?? '') : l.text.toUpperCase());
  const heights = lines.map((l) => (l.big ? 150 * 0.95 : 44 * 1.1));
  const blockW = Math.max(...lines.map((l) => g.measure(final(l), l.big ? 150 : 44, 800)));
  let top = y + h - 50 - heights.reduce((a, b) => a + b, 0);
  lines.forEach((line, i) => {
    const d = delay + 14 + i * 6;
    const s = spring(f - d, {damping: 200});
    const content = 'count' in line ? fmtFr(interp(f - d, [0, 40], [0, line.count], Ease.outQuart)) + (line.suffix ?? '') : final(line);
    g.group(() => {
      g.clip(x + 50, top, blockW, heights[i]);
      g.text(content, x + 50 + (1 - s) * -1.1 * blockW, top, {
        size: line.big ? 150 : 44, weight: 800, color: 'white', lh: line.big ? 0.95 : 1.1, family: FONT_TNUM,
        shadow: {color: 'rgba(0,0,0,0.25)', blur: 20, dy: 2},
      });
    });
    top += heights[i];
  });
};

// ----------------------------------------------------- photo plein écran ----
/** Photo plein écran + groupes de mots-clés qui se succèdent (le suivant chasse le précédent). */
export const keywordsOverPhoto = (g, f, {name, groups, duration, x = 140, y = 420, size = 58}) => {
  photo(g, f, {name, duration});
  g.gradient(0, 0, W, H, [0, 0, 1, 0], [0, 'rgba(0,0,0,0.55)', 0.7, 'rgba(0,0,0,0.05)']);
  groups.forEach((group, gi) => {
    const end = groups[gi + 1]?.at ?? duration + 100;
    const out = interp(f, [end - 2, end + 6], [0, 1]);
    if (f < group.at || out >= 1) return;
    let top = y - out * 40;
    group.lines.forEach((line, li) => {
      const s = spring(f - group.at - li * 4, {damping: 200});
      const fs = line.size ?? size;
      if (s > 0) {
        g.group(() => {
          g.alpha((1 - out) * s);
          g.text(line.text.toUpperCase(), x, top + (1 - s) * 30, {size: fs, weight: line.weight ?? 800, color: line.color ?? 'white', lh: 1.1, blur: (1 - s) * 8, shadow: SHADOW});
        });
      }
      top += fs * 1.1;
    });
  });
};

/** Ouverture sur photo : l'image se dévoile de gauche à droite sous un voile de couleur, puis des mots s'empilent à droite. */
export const photoOpener = (g, f, {name, words, duration, color = K.lime, wordsDelay = 25, stagger = 12}) => {
  const reveal = spring(f, {damping: 200, durationInFrames: 24});
  g.group(() => {
    g.clip(0, 0, W * reveal, H);
    photo(g, f, {name, duration, zoom: [1.12, 1.02]});
    const veil = interp(f, [4, 24], [0.85, 0]);
    if (veil > 0) g.group(() => (g.alpha(veil), g.rect(0, 0, W, H, color, {multiply: true})));
  });
  let top = 380;
  words.forEach((w, i) => {
    const s = spring(f - wordsDelay - i * stagger, {damping: 200});
    const fs = w.size ?? 64;
    if (s > 0) {
      g.group(() => {
        g.alpha(s);
        g.text(w.text.toUpperCase(), W - 150 + (1 - s) * 60, top, {size: fs, weight: w.weight ?? 800, color: w.color ?? 'white', lh: 1.1, align: 'right', shadow: SHADOW});
      });
    }
    top += fs * 1.1;
  });
};

/** Mots géants « remplis » par une photo, dévoilés par un balayage gauche → droite. */
export const photoText = (g, f, {name, words, size = 190, delay = 0, stagger = 12, duration = 200}) => {
  const lineH = size * 0.92;
  const top = H / 2 - (words.length * lineH) / 2;
  words.forEach((word, i) => {
    const p = interp(f - delay - i * stagger, [0, 16], [0, 1], Ease.outCubic);
    if (p <= 0) return;
    // masque : le mot en plein écran, dessiné une seule fois
    const mask = g.sprite(`mask|${word}|${size}|${i}`, W, H, (ctx) => {
      ctx.font = `800 ${size}px Montserrat`;
      ctx.letterSpacing = `${-size * 0.02}px`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';
      ctx.fillText(word, W / 2, top + (i + 1) * lineH - size * 0.14);
    });
    g.maskedPhoto(name, mask, zoomAt(f, [1.0, 1.1], duration), p * W);
  });
};

// ---------------------------------------------------------------- carte ----
const PIN = 'M 0 0 C -10 -18, -26 -30, -26 -48 A 26 26 0 1 1 26 -48 C 26 -30, 10 -18, 0 0 Z';
const atBaseline = (size) => ({lh: CONTENT_H, size, dy: -ASCENT * size});

/** Carte de l'Oise : contour qui se trace, villes, épingle sur le site, lien pointillé vers Paris. */
export const mapOise = (g, f, {cities, site, paris, delay = 0}) => {
  const t = f - delay;
  const pts = OISE.outline.map(([lon, lat]) => projectMap(lon, lat));
  const data = 'M ' + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ') + ' Z';
  const s = projectMap(site.lon, site.lat);
  const P = projectMap(2.35, 48.86);
  const label = (text, x, baselineY, size, weight, color) => g.text(text, x, baselineY + atBaseline(size).dy, {size, weight, color});

  const fill = 0.18 * interp(t, [30, 50], [0, 1]);
  if (fill > 0) g.group(() => (g.alpha(fill), g.polygon('oise', pts.map((p) => [p.x, p.y]), K.lime)));
  g.stroke(data, K.green, 4, 0, interp(t, [0, 40], [0, 1], Ease.inOutCubic), {round: true});

  cities.forEach((c, i) => {
    const p = projectMap(c.lon, c.lat);
    const cs = spring(t - 40 - i * 5, {damping: 12});
    if (cs <= 0) return;
    g.group(() => {
      g.alpha(clamp01(cs));
      g.rect(p.x - 7 * cs, p.y - 7 * cs, 14 * cs, 14 * cs, c.main ? K.burgundy : K.teal);
      label(c.name.toUpperCase(), p.x + 16, p.y + 7, 24, c.main ? 800 : 600, K.text);
    });
  });

  const link = interp(t, [80, 110], [0, 1], Ease.inOutCubic);
  if (link > 0) g.line(s.x, s.y, s.x + (P.x - s.x) * link, s.y + (P.y - s.y) * link, K.burgundy, 3, 10);
  if (link > 0.98) g.circle(P.x, P.y, 10, K.burgundy);
  const parisA = interp(t, [105, 115], [0, 1]);
  if (parisA > 0) g.group(() => (g.alpha(parisA), label(`PARIS · ${paris}`, P.x + 20, P.y + 8, 28, 800, K.burgundy)));

  [0, 1, 2].forEach((r) => {
    if (t < 70 + r * 12) return;
    const rp = ((t - 70 - r * 12) % 40) / 40;
    g.group(() => (g.alpha(1 - rp), g.circle(s.x, s.y, 20 + rp * 90, K.orange, 3)));
  });

  const pin = spring(t - 60, {damping: 9, stiffness: 160});
  if (pin > 0) {
    g.group(() => {
      g.translate(s.x, s.y - (1 - pin) * 200);
      g.scale(pin);
      g.polygon('pin', g.samples(PIN, 1).pts, K.orange);
      g.rect(-9, -57, 18, 18, 'white');
    });
  }
  const siteA = interp(t, [72, 82], [0, 1]);
  if (siteA > 0) g.group(() => (g.alpha(siteA), label(site.label.toUpperCase(), s.x + 40, s.y - 50, 30, 800, K.orange)));
};

// ------------------------------------------------------- frise, compteurs ----
/** Frise chronologique horizontale : la ligne se trace, chaque jalon apparaît avec sa photo. */
export const timeline = (g, f, {milestones, y = 640, delay = 0, stagger = 22}) => {
  const [x0, x1] = [200, 1720];
  const step = (x1 - x0) / milestones.length;
  const draw = interp(f - delay, [0, 20 + milestones.length * stagger], [0, 1], Ease.inOutQuad);
  g.rect(x0, y - 2, (x1 - x0) * draw, 4, K.line);
  milestones.forEach((m, i) => {
    const cx = x0 + step * (i + 0.5);
    const d = delay + 10 + i * stagger;
    const s = spring(f - d, {damping: 12});
    const color = m.color ?? [K.green, K.orange, K.teal, K.burgundy][i % 4];
    tile(g, f, {name: m.photo, x: cx - 170, y: y - 330, w: 340, h: 250, delay: d + 2});
    if (s <= 0) return;
    g.group(() => {
      g.translate(cx, y);
      g.scale(s);
      g.rotate((1 - s) * 90);
      g.rect(-18, -18, 36, 36, color);
    });
    g.group(() => {
      g.alpha(clamp01(s));
      g.translate(0, (1 - s) * 30);
      g.text(m.year, cx, y + 40, {size: 64, weight: 800, color, align: 'center'});
      g.text(m.label.toUpperCase(), cx, y + 40 + 64 * CONTENT_H, {size: 26, weight: 600, color: K.text, align: 'center', spacing: 0.04 * 26});
    });
  });
};

/** Rangée de chiffres clés qui défilent, chacun coiffé d'un carré de couleur. */
export const counters = (g, f, {items, y = 380, delay = 0, stagger = 8}) => {
  const colW = 1600 / items.length;
  items.forEach((item, i) => {
    const d = delay + i * stagger;
    const s = spring(f - d, {damping: 13});
    if (s <= 0) return;
    const color = item.color ?? [K.green, K.orange, K.teal][i % 3];
    const cx = 160 + i * colW + colW / 2;
    g.group(() => {
      g.translate(cx, y + 23);
      g.scale(s);
      g.rotate((1 - s) * 180);
      g.rect(-23, -23, 46, 46, color);
    });
    g.group(() => {
      g.alpha(clamp01(s * 2));
      const value = fmtFr(interp(f - d, [0, 45], [0, item.value], Ease.outQuart)) + (item.suffix ?? '');
      g.text(value, cx, y + 76, {size: 140, weight: 800, color, lh: 1, align: 'center', family: FONT_TNUM});
    });
    const la = interp(f - d, [15, 28], [0, 1]);
    if (la > 0) g.group(() => (g.alpha(la), g.text(item.label.toUpperCase(), cx, y + 76 + 140 + 16, {size: 30, weight: 600, color: K.text, align: 'center', spacing: 0.05 * 30})));
  });
};
