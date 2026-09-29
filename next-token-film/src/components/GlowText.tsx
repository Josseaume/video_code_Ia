import React from 'react';
import {COLORS, FONT, TEXTURE} from '../config';
import {rgba} from '../lib/math';

/** Layered text-shadow bloom in the accent color. */
export const bloom = (k: number, color: string = COLORS.accent) =>
  k <= 0
    ? 'none'
    : [
        `0 0 ${4 * k}px ${rgba(color, 0.9)}`,
        `0 0 ${14 * k}px ${rgba(COLORS.accent, 0.55)}`,
        `0 0 ${38 * k}px ${rgba(COLORS.accent, 0.35)}`,
        `0 0 ${80 * k}px ${rgba(COLORS.accent, 0.18)}`,
      ].join(', ');

export const boxBloom = (k: number) =>
  k <= 0
    ? 'none'
    : `0 0 ${6 * k}px ${rgba(COLORS.accent, 0.85)}, 0 0 ${22 * k}px ${rgba(COLORS.accent, 0.45)}, 0 0 ${56 * k}px ${rgba(COLORS.accent, 0.2)}`;

type Props = {
  children: React.ReactNode;
  size: number;
  color?: string;
  glow?: number;
  /** Chromatic aberration amount 0..1 (palette-safe: split into the two accents). */
  aberration?: number;
  /** Direction of travel for the split, in radians. */
  angle?: number;
  weight?: number;
  style?: React.CSSProperties;
};

/**
 * Monospace text with bloom, plus palette-constrained chromatic aberration:
 * the fringes are the two accent tones, offset along the motion vector.
 */
export const GlowText: React.FC<Props> = ({
  children,
  size,
  color = COLORS.highlight,
  glow = 1,
  aberration = 0,
  angle = 0,
  weight = 400,
  style,
}) => {
  const base: React.CSSProperties = {
    fontFamily: FONT.family,
    fontSize: size,
    fontWeight: weight,
    lineHeight: 1,
    whiteSpace: 'pre',
    letterSpacing: 0,
  };
  const off = Math.min(1, aberration) * TEXTURE.aberrationMax;
  const dx = Math.cos(angle) * off;
  const dy = Math.sin(angle) * off;
  return (
    <span style={{position: 'relative', display: 'inline-block', ...style}}>
      {off > 0.15 ? (
        <>
          <span
            style={{...base, position: 'absolute', left: 0, top: 0, color: COLORS.highlight, opacity: 0.55, transform: `translate(${dx}px, ${dy}px)`, mixBlendMode: 'screen'}}
          >
            {children}
          </span>
          <span
            style={{...base, position: 'absolute', left: 0, top: 0, color: COLORS.accent, opacity: 0.7, transform: `translate(${-dx}px, ${-dy}px)`, mixBlendMode: 'screen'}}
          >
            {children}
          </span>
        </>
      ) : null}
      <span style={{...base, position: 'relative', color, textShadow: bloom(glow)}}>{children}</span>
    </span>
  );
};
