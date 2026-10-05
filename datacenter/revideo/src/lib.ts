/** Pure, deterministic helpers + layout derived from shared/spec.json. */
import spec from '../../shared/spec.json';

export {spec};
export const T = spec.t;
export const C = spec.colors;
export const FONT = spec.font;

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const outExpo = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
export const inOutExpo = (k: number) =>
  k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2;
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const frac = (v: number) => v - Math.floor(v);
export const hash = (a: number, b = 0) => frac(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp(a)})`;
};

// ------------------------------------------------------------ layout ----
export const EDGE = {x: 0, y: -440};
export const FIBER_START = {x: -1300, y: -440};
export const SPINE_Y = -300;
export const LEAF_Y = -60;
export const spineX = (i: number) => -450 + i * 300;
export const leafX = (j: number) => -525 + j * 150;
export const RACK = {w: 130, h: 380, top: 40, step: 175};
export const rackX = (i: number) => -((spec.layout.racks - 1) * RACK.step) / 2 + i * RACK.step;
export const slotY = (j: number) => RACK.top + 22 + j * 29.5;

const L = spec.layout;
export const SPINE = {x: spineX(L.targetSpine), y: SPINE_Y};
export const LEAF = {x: leafX(L.targetLeaf), y: LEAF_Y};
export const RACK_IN = {x: rackX(L.targetRack), y: RACK.top};

// ------------------------------------------------------------ camera ----
export const camera = (t: number) => {
  const p1 = inOutExpo(prog(t, T.pullBack, T.pullBack + 1.7));
  const p2 = inOutExpo(prog(t, T.racksIn - 0.1, T.racksIn + 1.5));
  const p3 = inOutExpo(prog(t, T.cooling, T.response));
  const c = inOutExpo(prog(t, T.collapse, T.point));
  const y = lerp(lerp(EDGE.y, -120, p1), 175, p2);
  const s = lerp(lerp(1.9, 1.0, p1), 1.06, p2) * (1 + 0.05 * p3) * (1 - c);
  return {x: 0, y, s};
};

// ------------------------------------------------------------ packet ----
type P = {x: number; y: number};
const mix = (a: P, b: P, k: number): P => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)});

export const packet = (t: number) => {
  const arrive = {x: EDGE.x - 36, y: EDGE.y};
  let pos: P = FIBER_START;
  if (t < T.packetArrive) pos = mix(FIBER_START, arrive, inOutExpo(prog(t, T.packetIn, T.packetArrive)));
  else if (t < T.hopSpine) pos = mix(arrive, EDGE, outExpo(prog(t, T.packetArrive, T.packetArrive + 0.4)));
  else if (t < T.hopLeaf) pos = mix(EDGE, SPINE, inOutExpo(prog(t, T.hopSpine, T.hopSpine + 0.6)));
  else if (t < T.packetToRack) pos = mix(SPINE, LEAF, inOutExpo(prog(t, T.hopLeaf, T.hopLeaf + 0.7)));
  else pos = mix(LEAF, RACK_IN, inOutExpo(prog(t, T.packetToRack, T.packetToRack + 0.4)));
  const opacity = prog(t, T.packetIn - 0.3, T.packetIn) * (1 - prog(t, T.packetToRack + 0.35, T.packetToRack + 0.5));
  return {...pos, opacity};
};

/** Rack slot activation for the compute wave (0..1). */
export const slotActivation = (t: number, i: number, j: number) => {
  const d = Math.abs(i - L.targetRack) + Math.abs(j - L.slotsPerRack / 2) * 0.35;
  const s = T.computeWave + d * 0.22;
  return outExpo(prog(t, s, s + 0.5));
};

export const fmt = (v: number, decimals: number) =>
  v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
