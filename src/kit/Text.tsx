import type {CSSProperties} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, FONT, K, type TextLine} from './theme';

const lineStyle = (line: TextLine, fallbackSize: number): CSSProperties => ({
  fontFamily: FONT,
  fontWeight: line.weight ?? 800,
  color: line.color ?? K.burgundy,
  fontSize: line.size ?? fallbackSize,
  lineHeight: 1.05,
  textTransform: 'uppercase',
  letterSpacing: (line.weight ?? 800) >= 600 ? '0.01em' : '0.03em',
  whiteSpace: 'nowrap',
});

// Ligne qui monte derrière un masque (révélation classique).
export const RiseLine: React.FC<{line: TextLine; delay: number; size?: number; align?: 'left' | 'right' | 'center'}> = ({
  line,
  delay,
  size = 56,
  align = 'left',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 120}});
  return (
    <div style={{overflow: 'hidden', textAlign: align, paddingBottom: 4}}>
      <div style={{...lineStyle(line, size), transform: `translateY(${(1 - s) * 110}%)`}}>{line.text}</div>
    </div>
  );
};

// Ligne qui arrive floue et très espacée, puis se resserre (effet "focus").
export const SpreadLine: React.FC<{line: TextLine; delay: number; size?: number; align?: 'left' | 'right' | 'center'}> = ({
  line,
  delay,
  size = 40,
  align = 'left',
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 16], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  return (
    <div
      style={{
        ...lineStyle(line, size),
        textAlign: align,
        opacity: p,
        filter: `blur(${(1 - p) * 10}px)`,
        letterSpacing: `${(1 - p) * 0.5 + 0.01}em`,
      }}
    >
      {line.text}
    </div>
  );
};

export type RevealMode = 'rise' | 'spread';

// Bloc de lignes révélées l'une après l'autre.
export const TextBlock: React.FC<{
  lines: TextLine[];
  delay?: number;
  stagger?: number;
  size?: number;
  mode?: RevealMode;
  align?: 'left' | 'right' | 'center';
  style?: CSSProperties;
}> = ({lines, delay = 0, stagger = 5, size, mode = 'rise', align = 'left', style}) => {
  const Line = mode === 'rise' ? RiseLine : SpreadLine;
  return (
    <div style={{position: 'absolute', ...style}}>
      {lines.map((line, i) => (
        <Line key={`${line.text}-${i}`} line={line} delay={delay + i * stagger} size={size} align={align} />
      ))}
    </div>
  );
};
