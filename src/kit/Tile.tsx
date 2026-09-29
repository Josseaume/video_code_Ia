import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Photo} from './Photo';

export type Box = {x: number; y: number; w: number; h: number};

// Vignette photo qui "pop" depuis son centre, puis zoome doucement.
// shade : dégradé sombre en haut pour qu'un titre blanc reste lisible.
export const Tile: React.FC<Box & {name: string; delay?: number; focus?: string; shade?: boolean}> = ({
  name,
  shade = false,
  x,
  y,
  w,
  h,
  delay = 0,
  focus,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 15, stiffness: 140}});
  const inset = (1 - Math.min(1, s)) * 50;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        overflow: 'hidden',
        clipPath: `inset(${inset}% ${inset}% ${inset}% ${inset}%)`,
        transform: `scale(${0.85 + 0.15 * s})`,
      }}
    >
      <Photo name={name} focus={focus} zoom={[1.2, 1.05]} duration={120} />
      {shade && (
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 55%)'}} />
      )}
    </div>
  );
};

// Carré de couleur plein (accents du style institutionnel).
export const Square: React.FC<{x: number; y: number; size: number; color: string; delay?: number; rotate?: number}> = ({
  x,
  y,
  size,
  color,
  delay = 0,
  rotate = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 11, stiffness: 160}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        background: color,
        transform: `scale(${s}) rotate(${(1 - s) * 90 + rotate}deg)`,
      }}
    />
  );
};
