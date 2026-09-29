import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, COLORS, FONTS} from '../theme';

const NAME = 'CLAUDE';
const ROLE = 'MOTION DESIGNER — SHOWREEL 2026';

// Scène 6 : iris orange, nom en grand, puis tout se referme en un point (écho à l'intro).
export const Outro: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const iris = spring({frame, fps, config: {damping: 200}, durationInFrames: 22});
  const radius = iris * 1300;
  const bar = spring({frame: frame - 28, fps, config: {damping: 200}});
  const typed = ROLE.slice(0, Math.max(0, Math.floor((frame - 32) * 1.6)));
  const credits = interpolate(frame, [46, 56], [0, 1], clamp);

  const close = interpolate(frame, [duration - 18, duration - 6], [1, 0], {...clamp, easing: Easing.in(Easing.exp)});
  const finalDot = interpolate(frame, [duration - 8, duration - 6, duration - 1], [0, 1, 0], clamp);

  return (
    <AbsoluteFill style={{background: 'black'}}>
      <AbsoluteFill style={{clipPath: `circle(${close * 120}% at 50% 50%)`, background: COLORS.bg}}>
        <div
          style={{
            position: 'absolute',
            left: 960 - radius,
            top: 540 - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: '50%',
            background: COLORS.orange,
          }}
        />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
          <div style={{display: 'flex', overflow: 'hidden', height: 400, marginTop: -40}}>
            {NAME.split('').map((letter, i) => {
              const s = spring({frame: frame - 10 - i * 2.5, fps, config: {damping: 14, mass: 0.7}});
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 420,
                    lineHeight: '400px',
                    color: COLORS.bg,
                    transform: `translateY(${(1 - s) * 105}%) rotate(${(1 - s) * 12}deg)`,
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>
          <div style={{width: 1000 * bar, height: 14, background: COLORS.bg, marginTop: 10}} />
          <div style={{fontFamily: FONTS.mono, fontSize: 34, letterSpacing: 8, color: COLORS.bg, marginTop: 36, height: 44}}>
            {typed}
          </div>
          <div style={{fontFamily: FONTS.mono, fontSize: 20, letterSpacing: 5, color: COLORS.bg, marginTop: 30, opacity: credits * 0.7}}>
            RENDERED WITH REACT + REMOTION · 450 FRAMES · 0 KEYFRAMES
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 950,
          top: 530,
          width: 20,
          height: 20,
          borderRadius: 10,
          background: COLORS.orange,
          opacity: finalDot,
          boxShadow: `0 0 40px ${COLORS.orange}`,
        }}
      />
    </AbsoluteFill>
  );
};
