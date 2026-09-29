import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, K} from './theme';

const COLORS = [K.lime, K.green, K.orange, K.teal, K.burgundy, K.rust];

const Shape: React.FC<{kind: 'square' | 'triangle'; size: number; color: string}> = ({kind, size, color}) =>
  kind === 'square' ? (
    <div style={{width: size, height: size, background: color}} />
  ) : (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block'}}>
      <polygon points="50,6 96,94 4,94" fill={color} />
    </svg>
  );

// Salve de formes qui traversent l'écran à grande vitesse (flou de mouvement simulé).
export const ShapeBurst: React.FC<{count?: number; seed?: string; delay?: number; duration?: number}> = ({
  count = 26,
  seed = 'burst',
  delay = 0,
  duration = 28,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${k}-${i}`);
        const start = delay + r('start') * 10;
        const p = interpolate(frame, [start, start + duration * (0.7 + r('speed') * 0.6)], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        if (p <= 0 || p >= 1) return null;
        const fromX = 2100 + r('fx') * 300;
        const toX = -300 - r('tx') * 300;
        const y = 80 + r('y') * 920;
        const x = interpolate(p, [0, 1], [fromX, toX]);
        const velocity = 1 - p; // plus rapide au début
        const size = 14 + r('size') * 46;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y + Math.sin(p * 6 + i) * 30,
              transform: `rotate(${r('rot') * 360 + p * 180}deg) scaleX(${1 + velocity * 1.8})`,
              filter: `blur(${velocity * 6}px)`,
            }}
          >
            <Shape kind={r('kind') > 0.8 ? 'triangle' : 'square'} size={size} color={COLORS[i % COLORS.length]} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export type ClusterSquare = {dx: number; dy: number; size: number; color: string};

// Grappe de carrés : chaque carré arrive de loin en tournant, se pose, puis flotte légèrement.
export const SquareCluster: React.FC<{
  x: number;
  y: number;
  squares: ClusterSquare[];
  delay?: number;
  seed?: string;
  scale?: number;
}> = ({x, y, squares, delay = 0, seed = 'cluster', scale = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${scale})`}}>
      {squares.map((sq, i) => {
        const s = spring({frame: frame - delay - i * 2, fps, config: {damping: 14, stiffness: 90}});
        const angle = random(`${seed}-a-${i}`) * Math.PI * 2;
        const far = 900;
        const float = Math.sin((frame + i * 20) / 22) * 4;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: sq.dx + Math.cos(angle) * far * (1 - s) - sq.size / 2,
              top: sq.dy + Math.sin(angle) * far * (1 - s) + float - sq.size / 2,
              width: sq.size,
              height: sq.size,
              background: sq.color,
              opacity: s > 0.02 ? 1 : 0,
              transform: `rotate(${(1 - s) * 270}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

// Grappe prête à l'emploi, inspirée des génériques institutionnels.
export const DEFAULT_CLUSTER: ClusterSquare[] = [
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
