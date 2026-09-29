import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, FONT, K} from './theme';

// Voile de couleur plein écran (transition "flash" vert anis).
export const ColorWash: React.FC<{color?: string; at: number; hold?: number; max?: number}> = ({
  color = K.lime,
  at,
  hold = 6,
  max = 0.75,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [at, at + 5, at + 5 + hold, at + 14 + hold], [0, max, max, 0], clamp);
  return <AbsoluteFill style={{background: color, opacity, mixBlendMode: 'multiply'}} />;
};

// Rectangle de couleur qui balaie l'écran et dévoile la suite (volet).
export const BlockWipe: React.FC<{color?: string; at: number; duration?: number; direction?: 'left' | 'right'}> = ({
  color = K.lime,
  at,
  duration = 18,
  direction = 'right',
}) => {
  const frame = useCurrentFrame();
  const ease = Easing.inOut(Easing.cubic);
  const inP = interpolate(frame, [at, at + duration / 2], [0, 1], {...clamp, easing: ease});
  const outP = interpolate(frame, [at + duration / 2, at + duration], [0, 1], {...clamp, easing: ease});
  const left = direction === 'right' ? outP * 100 : (1 - inP) * 100;
  const right = direction === 'right' ? (1 - inP) * 100 : outP * 100;
  if (inP === 0 || outP === 1) return null;
  return <AbsoluteFill style={{background: color, clipPath: `inset(0 ${right}% 0 ${left}%)`}} />;
};

// Triangle qui arrive en tournant puis fonce vers la caméra.
export const TriangleZoom: React.FC<{color?: string; delay?: number; x?: number; y?: number; exit?: 'zoom' | 'shrink'}> = ({
  color = K.orange,
  delay = 0,
  x = 960,
  y = 540,
  exit = 'zoom',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inS = spring({frame: frame - delay, fps, config: {damping: 12}});
  const zoom =
    exit === 'zoom'
      ? interpolate(frame - delay, [18, 32], [1, 40], {...clamp, easing: Easing.in(Easing.cubic)})
      : interpolate(frame - delay, [16, 24], [1, 0], {...clamp, easing: Easing.in(Easing.back(2))});
  const size = 160;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        transform: `scale(${inS * zoom}) rotate(${(1 - inS) * 180}deg)`,
        filter: `blur(${Math.max(0, (1 - inS) * 8)}px)`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <polygon points="50,8 95,92 5,92" fill={color} />
      </svg>
    </div>
  );
};

// Texte qui s'écrit lettre par lettre, chaque lettre "atterrit" depuis plus grand.
export const TypeOn: React.FC<{
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  delay?: number;
  speed?: number;
}> = ({text, x, y, size = 64, color = K.burgundy, delay = 0, speed = 1.3}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', fontFamily: FONT, fontWeight: 800, fontSize: size, color}}>
      {text.split('').map((ch, i) => {
        const p = interpolate(frame - delay - i / speed, [0, 8], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: Math.min(1, p * 3),
              transform: `scale(${2.2 - 1.2 * p}) translateY(${(1 - p) * -20}px)`,
              transformOrigin: '50% 80%',
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};
