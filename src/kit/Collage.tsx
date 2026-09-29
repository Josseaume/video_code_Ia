import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Badge} from './Logo';
import {TextBlock, type RevealMode} from './Text';
import {Square, Tile} from './Tile';
import type {TextLine} from './theme';

export type CollageItem =
  | {kind: 'photo'; name: string; x: number; y: number; w: number; h: number; delay?: number; focus?: string; shade?: boolean}
  | {kind: 'square'; x: number; y: number; size: number; color: string; delay?: number}
  | {kind: 'badge'; x: number; y: number; size: number; color?: string; delay?: number}
  | {
      kind: 'text';
      lines: TextLine[];
      x: number;
      y: number;
      size?: number;
      delay?: number;
      mode?: RevealMode;
      align?: 'left' | 'right';
    };

// Mise en page libre : photos, carrés, badge et textes posés sur fond blanc,
// avec une lente dérive latérale de l'ensemble (sensation de travelling).
export const Collage: React.FC<{items: CollageItem[]; drift?: number; duration?: number}> = ({
  items,
  drift = -60,
  duration = 180,
}) => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, duration], [0, drift]);
  return (
    <AbsoluteFill style={{transform: `translateX(${shift}px)`}}>
      {items.map((item, i) => {
        switch (item.kind) {
          case 'photo':
            return <Tile key={i} {...item} />;
          case 'square':
            return <Square key={i} {...item} />;
          case 'badge':
            return <Badge key={i} {...item} />;
          case 'text':
            return (
              <TextBlock
                key={i}
                lines={item.lines}
                delay={item.delay}
                size={item.size}
                mode={item.mode}
                align={item.align}
                style={item.align === 'right' ? {right: 1920 - item.x, top: item.y} : {left: item.x, top: item.y}}
              />
            );
        }
      })}
    </AbsoluteFill>
  );
};

// Rangée de vignettes alignées (mosaïque), centrée horizontalement.
export const mosaicRow = (
  names: string[],
  opts: {y: number; w: number; h: number; gap?: number; delay?: number; stagger?: number},
): CollageItem[] => {
  const gap = opts.gap ?? 14;
  const total = names.length * opts.w + (names.length - 1) * gap;
  const x0 = (1920 - total) / 2;
  return names.map((name, i) => ({
    kind: 'photo',
    name,
    x: x0 + i * (opts.w + gap),
    y: opts.y,
    w: opts.w,
    h: opts.h,
    delay: (opts.delay ?? 0) + i * (opts.stagger ?? 4),
  }));
};
