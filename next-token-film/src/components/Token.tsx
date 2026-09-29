import React from 'react';
import {COLORS, COPY, FONT, T, sec} from '../config';
import {clamp, easeInOutExpo, easeOutExpo, lerp, progress, rgba} from '../lib/math';
import {useFilmFrame} from '../lib/scene';
import {springAt} from '../lib/timeline';
import {GlowText} from './GlowText';
import {winnerSlot} from './Panel';
import {landingPoint} from './PromptLine';

const TOKEN = COPY.candidates[COPY.winner].token;

/** Token pose (world space) at an absolute frame. */
const pose = (frame: number) => {
  const t = frame / 60;
  const a = winnerSlot();
  const b = landingPoint();
  const lift = springAt(frame, T.tokenLift, {damping: 16, stiffness: 140, mass: 0.8});
  const p = easeInOutExpo(progress(t, T.flightStart, T.impact));
  // lifted start point, slightly raised off the panel
  const sx = a.x + 6 * lift;
  const sy = a.y - 18 * lift;
  // quadratic arc that swings out and drops into the sentence
  const cx = lerp(sx, b.x, 0.15) + 140;
  const cy = lerp(sy, b.y, 0.55) - 40;
  const u = 1 - p;
  const x = u * u * sx + 2 * u * p * cx + p * p * b.x;
  const y = u * u * sy + 2 * u * p * cy + p * p * b.y;
  const size = lerp(FONT.panelSize * (1 + 0.22 * lift), FONT.promptSize, easeOutExpo(p));
  return {x, y, size, lift, p};
};

export const FlyingToken: React.FC = () => {
  const frame = useFilmFrame();
  if (frame < sec(T.tokenLift) || frame >= sec(T.impact)) return null;
  const now = pose(frame);
  const prev = pose(frame - 1);
  const vx = now.x - prev.x;
  const vy = now.y - prev.y;
  const speed = Math.hypot(vx, vy);
  const angle = Math.atan2(vy, vx);

  // palette-safe motion trail: past poses, fading
  const trail = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((k) => ({k, ...pose(frame - k * 0.45)}));

  return (
    <div style={{position: 'absolute', left: 0, top: 0}}>
      {speed > 4
        ? trail.map((g) => (
            <div key={g.k} style={{position: 'absolute', left: g.x, top: g.y - g.size / 2, opacity: 0.045 * (11 - g.k) * clamp(speed / 30)}}>
              <GlowText size={g.size} color={COLORS.accent} glow={0.3}>
                {TOKEN}
              </GlowText>
            </div>
          ))
        : null}
      <div style={{position: 'absolute', left: now.x, top: now.y - now.size / 2}}>
        <GlowText
          size={now.size}
          color={COLORS.highlight}
          weight={500}
          glow={1 + 1.2 * now.lift + 1.5 * Math.sin(now.p * Math.PI)}
          aberration={speed / 22}
          angle={angle}
        >
          {TOKEN}
        </GlowText>
      </div>
    </div>
  );
};

/** Impact flash + expanding orange ring at the landing point. */
export const ImpactFlash: React.FC = () => {
  const frame = useFilmFrame();
  const age = (frame - sec(T.impact)) / 60;
  if (age < 0 || age > 1.4) return null;
  const b = landingPoint();
  const ring = easeOutExpo(clamp(age / 0.9));
  const r = 20 + ring * 420;
  const glow = Math.exp(-age * 5);
  return (
    <div style={{position: 'absolute', left: 0, top: 0}}>
      <div
        style={{
          position: 'absolute',
          left: b.x + 14 - 260,
          top: b.y - 260,
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${rgba(COLORS.highlight, 0.55 * glow)} 0%, ${rgba(COLORS.accent, 0.22 * glow)} 18%, ${rgba(COLORS.accent, 0)} 60%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: b.x + 14 - r,
          top: b.y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          border: `${1.5 + 2 * glow}px solid ${rgba(COLORS.accent, 0.9 * (1 - ring))}`,
          boxShadow: `0 0 ${24 * (1 - ring)}px ${rgba(COLORS.accent, 0.7 * (1 - ring))}, inset 0 0 ${18 * (1 - ring)}px ${rgba(COLORS.accent, 0.4 * (1 - ring))}`,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};

/** Intro ember: the point the contour field is born from; it becomes the caret. */
export const Ember: React.FC = () => {
  const frame = useFilmFrame();
  const t = frame / 60;
  const born = springAt(frame, 0.02, {damping: 18, stiffness: 120});
  const gone = easeOutExpo(progress(t, T.cursorAppear - 0.1, T.cursorAppear + 0.25));
  const breath = 0.5 + 0.5 * Math.sin(t * 5);
  const s = 5 * born * (1 - gone);
  return (
    <div
      style={{
        position: 'absolute',
        left: -s,
        top: -s,
        width: s * 2,
        height: s * 2,
        borderRadius: '50%',
        background: COLORS.highlight,
        boxShadow: `0 0 ${10 + 8 * breath}px ${rgba(COLORS.accent, 0.95)}, 0 0 ${40 + 20 * breath}px ${rgba(COLORS.accent, 0.5)}, 0 0 120px ${rgba(COLORS.accent, 0.25)}`,
      }}
    />
  );
};
