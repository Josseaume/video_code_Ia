/**
 * Single source of truth for the film.
 * Colors, typography, timings (in seconds) and copy all live here.
 * This file is pure TS (no React / Remotion imports) so the SFX export
 * script can import it straight from Node.
 */

export const VIDEO = {
  id: 'NextToken',
  width: 1920,
  height: 1080,
  fps: 60,
  durationSec: 20,
} as const;

export const COLORS = {
  bg: '#000000',
  accent: '#FF6A1A',
  highlight: '#FFB070',
  /** Contour lines / neutral UI. White is used only at low opacity. */
  line: '#FFFFFF',
} as const;

export const FONT = {
  family: 'JetBrains Mono',
  weights: ['300', '400', '500', '700'] as const,
  /** Monospace advance width as a fraction of font size (JetBrains Mono = 0.6). */
  advance: 0.6,
  promptSize: 46,
  panelSize: 24,
  gridSize: 13,
  endCardSize: 22,
} as const;

export const TEXTURE = {
  grainOpacity: 0.035,
  scanlineOpacity: 0.16,
  vignette: 0.55,
  /** Max chromatic-aberration offset in px, reached on the fastest moves. */
  aberrationMax: 7,
} as const;

export const CONTOURS = {
  rings: 44,
  innerRadius: 34,
  spacing: 27,
  points: 256,
  opacity: 0.19,
  lineWidth: 1.25,
  noiseScale: 0.0022,
  noiseSpeed: 0.11,
  noiseAmp: 9,
  noiseAmpGrowth: 0.034,
  breatheAmp: 0.014,
  breathePeriodSec: 6.5,
  /** Grid that the rings reorganize into at the shockwave. */
  rowSpacing: 30,
  gridLaneClear: 52,
} as const;

/** Scene boundaries (seconds). */
export const SCENES = {
  intro: {from: 0, to: 3},
  prompt: {from: 3, to: 7},
  predict: {from: 7, to: 12},
  commit: {from: 12, to: 16},
  outro: {from: 16, to: 20},
} as const;

/** Every animated beat, in absolute seconds. Tweak freely. */
export const T = {
  contourDrawStart: 0.1,
  contourRingStagger: 0.034,
  contourRingDraw: 1.35,
  cursorAppear: 1.9,

  // prompt typing — keystroke times are absolute seconds
  keystrokes: [3.25, 3.4, 3.78, 3.9, 4.01, 4.12, 4.33, 4.44, 4.56, 4.8],

  // prediction HUD
  leaderLine: 7.15,
  panelIn: 7.35,
  panelHeader: 7.6,
  rowsStart: 8.0,
  rowStagger: 0.24,
  barFill: 1.3,
  winnerPulse: 10.2,

  // commit
  pushIn: 12.0,
  tokenLift: 12.35,
  flightStart: 12.75,
  impact: 13.65,
  panelOut: 13.8,
  cameraRelease: 14.0,
  gridStream: 14.3,

  // outro
  collapse: 16.0,
  collapseDur: 1.15,
  point: 17.0,
  endReveal: 17.55,
  endRevealDur: 0.9,
  fadeOut: 19.2,
} as const;

export const COPY = {
  prompt: '> ChatGPT,',
  panelLabel: 'p( next | context )',
  endCard: 'next token prediction',
  candidates: [
    {token: 'T', p: 0.99},
    {token: 'Claude', p: 0.61},
    {token: 'the', p: 0.12},
    {token: 'a', p: 0.003},
  ],
  /** Index into candidates of the token that gets sampled. */
  winner: 0,
  /** Vocabulary streamed through the token grid. */
  vocab: [
    'the', ' of', 'ing', ' model', 'token', '<s>', ' is', ' a', 'ation', ' next',
    '\\n', ' to', ' attention', 'ed', ' in', ' predict', '0.42', ' and', 'emb',
    ' logits', ' softmax', ' layer', ' 7', 'er', ' context', ' the', ' head',
    ' vector', 'ly', ' it', ' q', ' k', ' v', '</s>', ' sample', ' prob', ' ,',
    ' .', ' 12', 'ize', ' weight', ' norm', ' dim', ' 4096', ' +', ' =',
    ' Claude', ' T', ' was', ' that', ' on', ' GPT', ' for', ' ...',
  ],
} as const;

// ---------------------------------------------------------------------------
// helpers + sound-design cues (derived from the timings above)
// ---------------------------------------------------------------------------

export const sec = (s: number) => Math.round(s * VIDEO.fps);
export const DURATION_FRAMES = sec(VIDEO.durationSec);

export type Cue = {
  id: string;
  type: string;
  frame: number;
  time: number;
  label: string;
  intensity: number;
};

export const buildCues = (): Cue[] => {
  const cues: Omit<Cue, 'frame'>[] = [];
  const add = (type: string, time: number, label: string, intensity = 0.5) =>
    cues.push({id: `${type}_${cues.length}`, type, time, label, intensity});

  add('contour_draw', T.contourDrawStart, 'Contour lines draw from center', 0.3);
  add('cursor_appear', T.cursorAppear, 'Orange cursor appears', 0.4);
  COPY.prompt.split('').forEach((ch, i) =>
    add('keystroke', T.keystrokes[i], `Key "${ch}"`, ch === ' ' ? 0.25 : 0.45),
  );
  add('leader_line', T.leaderLine, 'Leader line to HUD', 0.2);
  add('panel_in', T.panelIn, 'HUD panel slides in', 0.5);
  COPY.candidates.forEach((c, i) =>
    add('bar_fill', T.rowsStart + i * T.rowStagger, `Bar "${c.token}" -> ${c.p}`, 0.2 + c.p * 0.3),
  );
  add('winner_pulse', T.winnerPulse, 'Winning token pulses (loopable)', 0.4);
  add('camera_push', T.pushIn, 'Camera push-in', 0.4);
  add('token_lift', T.tokenLift, 'Winning token lifts off panel', 0.5);
  add('token_whoosh', T.flightStart, 'Token flight', 0.7);
  add('impact_shockwave', T.impact, 'Token lands – shockwave', 1);
  add('grid_stream', T.gridStream, 'Token grid streams', 0.5);
  add('collapse', T.collapse, 'Everything collapses to a point', 0.8);
  add('point', T.point, 'Single orange point', 0.6);
  add('end_card', T.endReveal, 'End card reveal', 0.5);
  add('fade_out', T.fadeOut, 'Fade to black', 0.3);

  return cues
    .map((c) => ({...c, frame: sec(c.time), time: Math.round(c.time * 1000) / 1000}))
    .sort((a, b) => a.frame - b.frame);
};
