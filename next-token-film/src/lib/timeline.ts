/**
 * Global, frame-deterministic signals shared by several layers
 * (camera, ripples, typing, grid morph, collapse).
 */
import {spring, type SpringConfig} from 'remotion';
import {CONTOURS, COPY, FONT, T, VIDEO, sec} from '../config';
import {easeInOutExpo, easeOutExpo, lerp, progress} from './math';

const fps = VIDEO.fps;

const CALM: Partial<SpringConfig> = {damping: 200, stiffness: 90, mass: 1};
const SNAPPY: Partial<SpringConfig> = {damping: 22, stiffness: 180, mass: 0.7};

export const springAt = (
  frame: number,
  startSec: number,
  config: Partial<SpringConfig> = CALM,
  durationSec?: number,
) =>
  spring({
    frame: frame - sec(startSec),
    fps,
    config,
    durationInFrames: durationSec ? sec(durationSec) : undefined,
  });

export const snappyAt = (frame: number, startSec: number) => springAt(frame, startSec, SNAPPY);

// --------------------------------------------------------------- typing ----

export const typedCount = (frame: number) =>
  T.keystrokes.filter((k) => frame >= sec(k)).length;

/** Frames since the most recent keystroke (Infinity if none yet). */
export const sinceLastKey = (frame: number) => {
  const past = T.keystrokes.filter((k) => frame >= sec(k));
  return past.length ? frame - sec(past[past.length - 1]) : Infinity;
};

export const charW = (size: number) => size * FONT.advance;

/** Smoothly animated sentence width in characters (drives re-centering). */
export const sentenceChars = (frame: number) => {
  let chars = 0;
  for (const k of T.keystrokes) chars += springAt(frame, k, SNAPPY);
  // the landed token adds " T"
  chars += (COPY.candidates[COPY.winner].token.length + 1) * springAt(frame, T.impact, SNAPPY);
  return chars;
};

// -------------------------------------------------------------- camera ----

export type Camera = {s: number; tx: number; ty: number; speed: number};

const cameraRaw = (frame: number): Omit<Camera, 'speed'> => {
  const drift = easeInOutExpo(progress(frame, sec(T.leaderLine), sec(T.pushIn))) * 0.035;
  const push = springAt(frame, T.pushIn, CALM, 1.7);
  const release = springAt(frame, T.cameraRelease, CALM, 1.6);
  const s0 = 1 + (drift + 0.22 * push) * (1 - release);

  const fx = lerp(40, 300, push);
  const fy = lerp(-40, -150, push);
  let tx = fx * (1 - s0);
  let ty = fy * (1 - s0);

  // damped impact shake — tiny, engineered
  const age = (frame - sec(T.impact)) / fps;
  if (age >= 0) {
    const k = Math.exp(-age * 7) * 5;
    tx += Math.sin(age * 71) * k;
    ty += Math.cos(age * 53) * k * 0.7;
  }

  const collapse = easeInOutExpo(progress(frame, sec(T.collapse), sec(T.collapse + T.collapseDur)));
  const s = s0 * (1 - collapse);
  return {s, tx: tx * (1 - collapse), ty: ty * (1 - collapse)};
};

export const camera = (frame: number): Camera => {
  const a = cameraRaw(frame);
  const b = cameraRaw(frame - 1);
  const speed = Math.abs(a.s - b.s) * 900 + Math.hypot(a.tx - b.tx, a.ty - b.ty);
  return {...a, speed};
};

// ------------------------------------------------------------- ripples ----

export type Ripple = {t0: number; amp: number; width: number; speed: number; decay: number; hot: boolean};

export const RIPPLES: Ripple[] = [
  ...T.keystrokes.map((k, i) => ({
    t0: k,
    amp: COPY.prompt[i] === ' ' ? 4 : 10,
    width: 34,
    speed: 780,
    decay: 1.25,
    hot: false,
  })),
  {t0: T.impact, amp: 58, width: 110, speed: 1450, decay: 0.9, hot: true},
];

/** Radial displacement (px) of a line at base radius r at a given frame. */
export const rippleAt = (frame: number, r: number) => {
  const t = frame / fps;
  let d = 0;
  let heat = 0;
  let glint = 0;
  for (const e of RIPPLES) {
    const age = t - e.t0;
    if (age < 0) continue;
    const env = Math.exp(-age * e.decay);
    if (env < 0.01) continue;
    const x = (r - age * e.speed) / e.width;
    const g = Math.exp(-x * x);
    // leading compression + trailing rebound
    d += e.amp * env * g * Math.cos(x * 1.6);
    if (e.hot) heat = Math.max(heat, g * Math.min(1, env * 1.4));
    else glint = Math.max(glint, g * env);
  }
  return {d, heat, glint};
};

// ------------------------------------------------------- grid morph ----

/** 0 → ring, 1 → straight grid row. Triggered as the shockwave passes. */
export const morphAt = (frame: number, r: number) => {
  const reach = T.impact + r / 1450 + 0.05;
  return easeInOutExpo(progress(frame, sec(reach), sec(reach + 0.95)));
};

/** Row y (world px) a ring unrolls into: alternating around the center lane. */
export const rowY = (i: number) => {
  const k = Math.ceil((i + 1) / 2);
  const sign = i % 2 === 0 ? 1 : -1;
  return sign * (CONTOURS.gridLaneClear + (k - 1) * CONTOURS.rowSpacing);
};

export const collapseAt = (frame: number) =>
  progress(frame, sec(T.collapse), sec(T.collapse + T.collapseDur));

export const fadeOutAt = (frame: number) =>
  easeOutExpo(progress(frame, sec(T.fadeOut), sec(VIDEO.durationSec) - 2));
