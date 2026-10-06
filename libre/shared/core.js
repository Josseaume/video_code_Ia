// Cœur commun aux deux moteurs (Revideo et Three.js) : contenu, palette, timings,
// maths d'animation. Aucun import de moteur ici — du JavaScript pur.
//
// Les animations de la vidéo d'origine (Remotion) sont des fonctions de l'image courante :
// spring(), interpolate(), Easing. On les réécrit ici pour obtenir les mêmes courbes.

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const FONT = 'Montserrat';
// Même police avec les chiffres à largeur fixe (équivalent de font-variant-numeric: tabular-nums).
export const FONT_TNUM = 'Montserrat Tnum';

export const K = {
  white: '#FFFFFF',
  lime: '#9CC31C',
  green: '#1F9A43',
  orange: '#E3900F',
  teal: '#3BA5BF',
  burgundy: '#852245',
  rust: '#8E3B26',
  text: '#3A3A3A',
  line: '#9FB48C',
};

// ⚠️ Chiffres fictifs, repris tels quels de src/datacenter/content.ts.
export const PROJECT = {
  name: ['oise', 'datapark'],
  tagline: 'Campus numérique bas carbone',
  hectares: 12,
  megawatts: 40,
  jobs: 150,
  homesHeated: 8000,
  parisDistance: '50 KM',
  site: {lon: 2.45, lat: 49.4, label: 'Le site'},
  cities: [
    {name: 'Beauvais', lon: 2.08, lat: 49.43, main: true},
    {name: 'Compiègne', lon: 2.83, lat: 49.42, main: true},
    {name: 'Creil', lon: 2.47, lat: 49.26},
    {name: 'Noyon', lon: 3.0, lat: 49.58},
  ],
  milestones: [
    {year: '2026', label: 'Concertation', photo: 'fields1'},
    {year: '2027', label: 'Permis & travaux', photo: 'crane'},
    {year: '2028', label: 'Raccordement', photo: 'power'},
    {year: '2029', label: 'Mise en service', photo: 'servers4'},
  ],
  verbs: ['HÉBERGER', 'CONNECTER', 'CHAUFFER', 'EMPLOYER'],
};

// ------------------------------------------------------------ scènes ----
// `enter` = transition d'entrée de la scène (15 images, comme dans DatacenterOise.tsx).
export const TRANSITION = 15;
export const SCENES = [
  {id: 'Ouverture', duration: 150, enter: /** @type {string | null} */ (null), start: 0},
  {id: 'Territoire', duration: 170, enter: 'slide'},
  {id: 'Question', duration: 200, enter: 'slide'},
  {id: 'Presentation', duration: 170, enter: 'fade'},
  {id: 'Site', duration: 180, enter: 'slide'},
  {id: 'Carte', duration: 200, enter: 'slide'},
  {id: 'Puissance', duration: 170, enter: 'wipe'},
  {id: 'Chaleur', duration: 200, enter: 'slide'},
  {id: 'MotsCles', duration: 210, enter: 'wipe'},
  {id: 'Calendrier', duration: 200, enter: 'slide'},
  {id: 'Chiffres', duration: 160, enter: 'slide'},
  {id: 'Message', duration: 150, enter: 'wipe'},
  {id: 'Verbes', duration: 190, enter: 'fade'},
  {id: 'Fin', duration: 220, enter: 'slide'},
];
let acc = 0;
SCENES.forEach((/** @type {any} */ s, i) => {
  s.start = acc - i * TRANSITION;
  acc += s.duration;
});
export const DURATION = acc - (SCENES.length - 1) * TRANSITION; // 2375 images ≈ 79 s

/**
 * Pour une image globale, renvoie les scènes visibles et comment les composer :
 * x (glissement), opacity (fondu), reveal (volet : part visible depuis la gauche, 0..1).
 */
export const sceneStates = (g) => {
  const out = [];
  SCENES.forEach((s, i) => {
    const frame = g - s.start;
    if (frame < 0 || frame >= s.duration) return;
    const st = {index: i, id: s.id, frame, x: 0, opacity: 1, reveal: 1};
    // cette scène entre
    if (s.enter && frame < TRANSITION) {
      const p = transitionEase(frame / TRANSITION);
      if (s.enter === 'slide') st.x = (1 - p) * W;
      if (s.enter === 'fade') st.opacity = p;
      if (s.enter === 'wipe') st.reveal = p;
    }
    // la scène suivante entre en glissant : celle-ci sort par la gauche
    const next = SCENES[i + 1];
    if (next && next.enter === 'slide' && g >= next.start) {
      st.x = -transitionEase((g - next.start) / TRANSITION) * W;
    }
    out.push(st);
  });
  return out;
};

// -------------------------------------------------------------- maths ----
export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const lerp = (a, b, t) => a + (b - a) * t;

/** Équivalent d'interpolate() de Remotion, toujours borné (clamp), easing par segment. */
export const interp = (v, input, output, easing = (t) => t) => {
  if (v <= input[0]) return output[0];
  const last = input.length - 1;
  if (v >= input[last]) return output[last];
  let i = 0;
  while (v > input[i + 1]) i++;
  const t = (v - input[i]) / (input[i + 1] - input[i]);
  return lerp(output[i], output[i + 1], easing(t));
};

export const Ease = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inCubic: (t) => t * t * t,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inBack: (s) => (t) => t * t * ((s + 1) * t - s),
  outBack: (s) => (t) => 1 - Math.pow(1 - t, 2) * ((s + 1) * (1 - t) - s),
};

/** cubic-bezier(x1, y1, x2, y2), comme en CSS. */
export const bezier = (x1, y1, x2, y2) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t;
  const fy = (t) => ((ay * t + by) * t + cy) * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 30; i++) {
      const v = fx(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return fy(t);
  };
};
const transitionEase = bezier(0.7, 0, 0.3, 1);

/** Position d'un ressort amorti parti de 0 vers 1 (solution exacte), t en secondes. */
const springAt = (t, damping, stiffness, mass) => {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  }
  // Remotion traite tout ressort sur-amorti (zeta ≥ 1) comme un amortissement critique.
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
};

const naturalFrames = new Map();
const settleFrames = (damping, stiffness, mass) => {
  const key = `${damping}/${stiffness}/${mass}`;
  if (!naturalFrames.has(key)) {
    let last = 0;
    for (let f = 0; f < 3000; f++) if (Math.abs(1 - springAt(f / FPS, damping, stiffness, mass)) >= 0.005) last = f;
    naturalFrames.set(key, last + 1);
  }
  return naturalFrames.get(key);
};

/**
 * Équivalent de spring() de Remotion (mêmes valeurs par défaut : damping 10, stiffness 100, mass 1).
 * @param {number} frame
 * @param {{damping?: number, stiffness?: number, mass?: number, durationInFrames?: number}} [config]
 */
export const spring = (frame, {damping = 10, stiffness = 100, mass = 1, durationInFrames} = {}) => {
  if (frame <= 0) return 0;
  const f = durationInFrames ? (frame * settleFrames(damping, stiffness, mass)) / durationInFrames : frame;
  if (durationInFrames && frame >= durationInFrames) return 1;
  return springAt(f / FPS, damping, stiffness, mass);
};

/** Hasard déterministe à partir d'une chaîne (même graine → même valeur, à chaque rendu). */
export const rnd = (seed) => {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export const fmtFr = (n) => Math.round(n).toLocaleString('fr-FR').replace(/[  ]/g, ' ');

// ---------------------------------------------------------- géométrie ----
// Tracés des lignes souples (coordonnées 1920×1080), repris de src/kit/FlowLine.tsx.
export const FLOW_PATHS = {
  sweep:
    'M -60 760 C 220 700, 380 860, 560 780 C 700 720, 760 600, 690 560 C 610 520, 560 640, 660 680 C 820 740, 1040 560, 1240 560 C 1480 560, 1560 760, 1760 700 C 1880 660, 1940 600, 1990 560',
  high:
    'M -60 300 C 200 200, 420 380, 640 300 C 760 260, 820 150, 760 110 C 690 70, 640 180, 720 220 C 900 300, 1180 120, 1420 180 C 1640 240, 1780 120, 1990 80',
  low:
    'M -60 980 C 260 900, 500 1040, 760 960 C 900 920, 960 820, 900 790 C 830 760, 790 860, 880 900 C 1060 980, 1320 820, 1560 880 C 1760 930, 1860 860, 1990 820',
  diagonal:
    'M 1990 140 C 1700 260, 1600 120, 1460 260 C 1380 340, 1420 440, 1500 420 C 1580 400, 1560 300, 1470 320 C 1280 360, 1180 620, 900 700 C 620 780, 360 700, -60 900',
};

// Contour simplifié de l'Oise (longitude, latitude), repris de src/kit/MapRegion.tsx.
export const OISE = {
  lon0: 1.65,
  lat0: 49.8,
  latScale: 1.53,
  outline: [
    [1.72, 49.68], [1.8, 49.76], [2.05, 49.71], [2.3, 49.72], [2.55, 49.63], [2.78, 49.72], [3.06, 49.71],
    [3.12, 49.58], [3.16, 49.4], [3.06, 49.3], [3.1, 49.18], [2.85, 49.08], [2.6, 49.1], [2.45, 49.15],
    [2.2, 49.13], [2.0, 49.18], [1.8, 49.2], [1.7, 49.25], [1.78, 49.4], [1.72, 49.5],
  ],
};
export const MAP = {x: 980, y: 120, scale: 560};
export const projectMap = (lon, lat) => ({
  x: MAP.x + (lon - OISE.lon0) * MAP.scale,
  y: MAP.y + (OISE.lat0 - lat) * MAP.scale * OISE.latScale,
});

export const DEFAULT_CLUSTER = [
  {dx: -120, dy: -70, size: 34, color: K.lime},
  {dx: -40, dy: -110, size: 30, color: K.teal},
  {dx: -70, dy: -50, size: 24, color: K.green},
  {dx: -150, dy: 10, size: 28, color: K.orange},
  {dx: -110, dy: 30, size: 16, color: K.rust},
  {dx: 60, dy: -20, size: 46, color: K.green},
  {dx: 20, dy: 20, size: 34, color: K.lime},
  {dx: 110, dy: 30, size: 12, color: K.teal},
  {dx: -60, dy: 70, size: 10, color: K.burgundy},
];
export const BURST_COLORS = [K.lime, K.green, K.orange, K.teal, K.burgundy, K.rust];

// Métriques verticales de Montserrat (en em) : sert à placer la ligne de base comme le fait le CSS.
export const ASCENT = 0.968;
export const CONTENT_H = 1.219;
/** Ligne de base d'une ligne de texte dont la boîte commence en `top`, pour un line-height donné. */
export const baseline = (top, size, lineHeight) => top + ((lineHeight - CONTENT_H) / 2 + ASCENT) * size;
