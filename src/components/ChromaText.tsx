import type {CSSProperties, ReactNode} from 'react';
import {COLORS} from '../theme';

// Aberration chromatique : deux copies décalées (cyan / orange) derrière le texte.
export const ChromaText: React.FC<{
  children: ReactNode;
  offset: number;
  style?: CSSProperties;
}> = ({children, offset, style}) => (
  <span style={{position: 'relative', display: 'inline-block', ...style}}>
    <span style={{position: 'absolute', inset: 0, color: COLORS.cyan, transform: `translateX(${-offset}px)`}}>
      {children}
    </span>
    <span style={{position: 'absolute', inset: 0, color: COLORS.orange, transform: `translateX(${offset}px)`}}>
      {children}
    </span>
    <span style={{position: 'relative'}}>{children}</span>
  </span>
);
