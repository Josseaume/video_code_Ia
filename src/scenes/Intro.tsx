import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ChromaText} from '../components/ChromaText';
import {clamp, COLORS, FONTS} from '../theme';

const RING_COLORS = [COLORS.orange, COLORS.violet, COLORS.cyan, COLORS.ink];
const RAYS = 28;
const TITLE = 'MOTION';
const SUBTITLE = 'SHOWREEL · 2026 · MOTION DESIGN';

// Scène 1 : un point apparaît, explose en onde de choc, puis le titre claque.
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const dotIn = spring({frame, fps, config: {damping: 10, stiffness: 180}});
  const dotOut = interpolate(frame, [11, 16], [1, 0], clamp);
  const dotSize = 70 * dotIn * dotOut;

  const flash = interpolate(frame, [14, 16, 24], [0, 0.85, 0], clamp);
  const glow = interpolate(frame, [14, 45], [0, 0.55], clamp);
  const camera = interpolate(frame, [0, 80], [1, 1.12], {easing: Easing.out(Easing.quad)});

  // Petit glitch volontaire sur le titre vers la fin de la scène.
  const glitching = frame >= 56 && frame <= 61;
  const glitchX = glitching ? (random(`gx-${frame}`) - 0.5) * 60 : 0;

  const typed = SUBTITLE.slice(0, Math.max(0, Math.floor((frame - 40) * 1.4)));
  const caret = Math.floor(frame / 6) % 2 === 0;

  return (
    <AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          opacity: glow,
          background: `radial-gradient(circle at 50% 50%, ${COLORS.violet} 0%, transparent 55%)`,
        }}
      />
      <AbsoluteFill style={{transform: `scale(${camera})`}}>
        {/* Rayons */}
        {new Array(RAYS).fill(0).map((_, i) => {
          const angle = (i / RAYS) * 360 + random(`ray-${i}`) * 8;
          const speed = 0.7 + random(`speed-${i}`) * 0.6;
          const head = interpolate(frame, [14, 32], [40, 1400 * speed], {...clamp, easing: Easing.out(Easing.exp)});
          const tail = interpolate(frame, [18, 42], [0, 1400 * speed], {...clamp, easing: Easing.out(Easing.exp)});
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 960,
                top: 540,
                width: Math.max(0, head - tail),
                height: i % 3 === 0 ? 4 : 2,
                background: i % 4 === 0 ? COLORS.orange : COLORS.ink,
                transformOrigin: '0 50%',
                transform: `rotate(${angle}deg) translateX(${tail}px)`,
                opacity: frame < 14 ? 0 : 1,
              }}
            />
          );
        })}

        {/* Ondes de choc */}
        {[0, 3, 6, 9].map((delay, i) => {
          const p = interpolate(frame, [14 + delay, 46 + delay], [0, 1], {...clamp, easing: Easing.out(Easing.exp)});
          const size = p * 2300;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 960 - size / 2,
                top: 540 - size / 2,
                width: size,
                height: size,
                borderRadius: '50%',
                border: `${Math.max(1, (1 - p) * 26)}px solid ${RING_COLORS[i]}`,
                opacity: p === 0 ? 0 : 1 - p,
              }}
            />
          );
        })}

        {/* Le point de départ */}
        <div
          style={{
            position: 'absolute',
            left: 960 - dotSize / 2,
            top: 540 - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: COLORS.orange,
            boxShadow: `0 0 60px ${COLORS.orange}`,
          }}
        />

        {/* Titre lettre par lettre */}
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{display: 'flex', transform: `translateX(${glitchX}px)`, marginTop: -60}}>
            {TITLE.split('').map((letter, i) => {
              const s = spring({frame: frame - 18 - i * 3, fps, config: {damping: 13, mass: 0.6}});
              const rest = Math.max(0, 1 - s);
              return (
                <ChromaText
                  key={i}
                  offset={rest * 40 + (glitching ? 18 : 0)}
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 360,
                    lineHeight: 1,
                    color: COLORS.ink,
                    opacity: interpolate(s, [0, 0.25], [0, 1], clamp),
                    transform: `scale(${interpolate(s, [0, 1], [3.2, 1])})`,
                    filter: `blur(${rest * 22}px)`,
                  }}
                >
                  {letter}
                </ChromaText>
              );
            })}
          </div>
          <div
            style={{
              position: 'absolute',
              top: 540 + 170,
              fontFamily: FONTS.mono,
              fontSize: 30,
              letterSpacing: 8,
              color: COLORS.ink,
            }}
          >
            {typed}
            <span style={{color: COLORS.orange, opacity: frame >= 40 && caret ? 1 : 0}}>▍</span>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'white', opacity: flash}} />
    </AbsoluteFill>
  );
};
