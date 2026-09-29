import React from 'react';
import {COLORS, COPY, FONT, T, sec} from '../config';
import {clamp, easeOutExpo, progress, rgba} from '../lib/math';
import {useFilmFrame} from '../lib/scene';
import {camera, charW, sentenceChars, sinceLastKey, snappyAt, springAt, typedCount} from '../lib/timeline';
import {GlowText, boxBloom} from './GlowText';

const SIZE = FONT.promptSize;
const CW = charW(SIZE);

/** Where the landed token's first character sits once the sentence is complete. */
export const landingPoint = () => {
  const total = COPY.prompt.length + 1 + COPY.candidates[COPY.winner].token.length;
  return {x: (-total * CW) / 2 + (COPY.prompt.length + 1) * CW, y: 0};
};

/**
 * The prompt: "> ChatGPT," typed char by char, smoothly re-centering,
 * with a glowing underline and a blinking orange caret.
 */
export const PromptLine: React.FC = () => {
  const frame = useFilmFrame();
  const t = frame / 60;
  const cam = camera(frame);

  const typed = typedCount(frame);
  const landed = frame >= sec(T.impact);
  const winner = COPY.candidates[COPY.winner].token;
  const chars = (COPY.prompt.slice(0, typed) + (landed ? ' ' + winner : '')).split('');

  const smoothChars = sentenceChars(frame);
  const left = (-smoothChars * CW) / 2;

  // caret
  const caretIn = springAt(frame, T.cursorAppear, {damping: 14, stiffness: 160, mass: 0.6});
  const idle = sinceLastKey(frame);
  const flying = t >= T.tokenLift && t < T.impact + 0.3;
  const blinkPhase = ((frame - sec(T.cursorAppear)) / 64) * Math.PI * 2;
  const blink = idle < 34 || flying ? 1 : clamp(0.5 + 1.7 * Math.cos(blinkPhase));
  const caretX = left + chars.length * CW + 4;

  // underline: arrives with the first keystroke, glows with every key
  const underIn = springAt(frame, T.keystrokes[0] - 0.05, undefined, 0.9);
  const keyKick = Math.exp(-idle / 10);
  const impactKick = landed ? Math.exp(-(frame - sec(T.impact)) / 18) : 0;

  const aberr = clamp(cam.speed / 9);

  return (
    <div style={{position: 'absolute', left: 0, top: 0}}>
      {/* text */}
      <div style={{position: 'absolute', left, top: -SIZE / 2 - 2, display: 'flex'}}>
        {chars.map((ch, i) => {
          const isLanded = landed && i >= COPY.prompt.length;
          const at = isLanded ? T.impact : T.keystrokes[i];
          const age = (frame - sec(at)) / 60;
          const pop = snappyAt(frame, at);
          const flash = Math.exp(-age * (isLanded ? 3 : 7));
          const isPromptSign = i === 0;
          return (
            <span
              key={i}
              style={{
                width: CW,
                display: 'inline-block',
                transform: `translateY(${(1 - pop) * 10}px) scale(${0.85 + 0.15 * pop + (isLanded ? 0.18 * flash : 0)})`,
                opacity: clamp(pop * 1.4),
              }}
            >
              <GlowText
                size={SIZE}
                weight={isPromptSign ? 500 : 400}
                color={isPromptSign ? COLORS.accent : COLORS.highlight}
                glow={0.55 + 1.6 * flash + 0.5 * impactKick}
                aberration={aberr}
              >
                {ch}
              </GlowText>
            </span>
          );
        })}
      </div>

      {/* underline */}
      {typed > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: left - 6,
            top: SIZE * 0.72,
            width: (smoothChars * CW + 16) * underIn,
            height: 2,
            background: `linear-gradient(90deg, ${rgba(COLORS.accent, 0)}, ${COLORS.accent} 12%, ${COLORS.highlight} ${50}%, ${COLORS.accent} 88%, ${rgba(COLORS.accent, 0)})`,
            boxShadow: boxBloom(0.7 + keyKick * 1.1 + impactKick * 1.5),
            opacity: 0.55 + 0.45 * Math.max(keyKick, impactKick),
          }}
        />
      ) : null}

      {/* caret */}
      <div
        style={{
          position: 'absolute',
          left: caretX,
          top: -SIZE * 0.62,
          width: 5,
          height: SIZE * 1.18,
          background: COLORS.accent,
          boxShadow: boxBloom(1.2),
          transformOrigin: '50% 50%',
          transform: `scaleY(${caretIn})`,
          opacity: blink * clamp(caretIn * 2) * (1 - easeOutExpo(progress(t, T.collapse + 0.6, T.collapse + 1.1))),
        }}
      />
    </div>
  );
};
