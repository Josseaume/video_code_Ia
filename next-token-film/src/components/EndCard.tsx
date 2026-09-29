import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, COPY, FONT, T, VIDEO, sec} from '../config';
import {clamp, easeInOutExpo, easeOutExpo, progress, rgba, smoothstep} from '../lib/math';
import {useFilmFrame} from '../lib/scene';
import {charW, fadeOutAt, springAt} from '../lib/timeline';

const SIZE = FONT.endCardSize;
const TEXT_W = COPY.endCard.length * charW(SIZE) * 1.08;

/**
 * Screen-space outro: the collapsed field becomes one orange point,
 * which then travels right and writes the end card behind it.
 */
export const EndCard: React.FC = () => {
  const frame = useFilmFrame();
  const t = frame / 60;

  // point is born as the world shrinks to nothing
  const born = smoothstep(T.collapse + T.collapseDur * 0.55, T.collapse + T.collapseDur, t);
  const settle = springAt(frame, T.point, {damping: 12, stiffness: 140, mass: 0.6});
  const pulse = Math.exp(-Math.max(0, t - T.point) * 3.5);
  const hold = 0.5 + 0.5 * Math.cos(Math.max(0, t - T.point) * 5.5);

  // reveal: point travels left→right, text appears behind it
  const rev = easeInOutExpo(progress(t, T.endReveal, T.endReveal + T.endRevealDur));
  const pre = easeOutExpo(progress(t, T.endReveal - 0.35, T.endReveal)); // slide to start
  const x = -TEXT_W / 2 * pre + TEXT_W * rev + (rev > 0 ? 10 * rev : 0);

  // point morphs into a small block caret at the end, which blinks twice then rests
  const toCaret = smoothstep(0.85, 1, rev);
  const blinkAge = t - (T.endReveal + T.endRevealDur);
  const blink = blinkAge > 0 && blinkAge < 1.2 ? clamp(0.5 + 1.6 * Math.cos(blinkAge * Math.PI * 2 * 1.6)) : 1;
  const r = (born * 7 + settle * 0) * (1 + 0.6 * pulse) * (1 - 0.15 * hold * (1 - rev));
  const w = r * 2 * (1 - toCaret) + 10 * toCaret;
  const h = r * 2 * (1 - toCaret) + SIZE * 1.05 * toCaret;

  const glow = born * (1 + 1.5 * pulse);
  const fade = fadeOutAt(frame);

  return (
    <AbsoluteFill style={{opacity: 1 - fade}}>
      <div
        style={{
          position: 'absolute',
          left: VIDEO.width / 2,
          top: VIDEO.height / 2,
          width: 0,
          height: 0,
        }}
      >
        {/* flash when the point locks */}
        <div
          style={{
            position: 'absolute',
            left: -300,
            top: -300,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${rgba(COLORS.accent, 0.28 * pulse * born)} 0%, ${rgba(COLORS.accent, 0)} 55%)`,
          }}
        />
        {/* text, revealed behind the travelling point */}
        <div
          style={{
            position: 'absolute',
            left: -TEXT_W / 2,
            top: -SIZE / 2 - 1,
            width: TEXT_W + 20,
            fontFamily: FONT.family,
            fontSize: SIZE,
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: `${0.08 * (1 - rev) + 0.05}em`,
            color: rgba(COLORS.line, 0.92),
            whiteSpace: 'pre',
            clipPath: `inset(-20px ${(1 - (rev > 0 ? clamp((x + TEXT_W / 2) / (TEXT_W + 20)) : 0)) * 100}% -20px 0)`,
            textShadow: `0 0 12px ${rgba(COLORS.line, 0.15)}`,
          }}
        >
          {COPY.endCard}
        </div>
        {/* the point / caret */}
        <div
          style={{
            position: 'absolute',
            left: x - w / 2,
            top: -h / 2,
            width: w,
            height: h,
            borderRadius: `${50 * (1 - toCaret)}%`,
            background: toCaret > 0.5 ? COLORS.accent : COLORS.highlight,
            opacity: born * blink,
            boxShadow: `0 0 ${8 * glow}px ${rgba(COLORS.accent, 0.95)}, 0 0 ${30 * glow}px ${rgba(COLORS.accent, 0.55)}, 0 0 ${90 * glow}px ${rgba(COLORS.accent, 0.25)}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const END_FRAME = sec(VIDEO.durationSec);
