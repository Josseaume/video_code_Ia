import React, {createContext, useContext} from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {sec} from '../config';

const OffsetCtx = createContext(0);

/**
 * A named <Sequence> whose children can still read the absolute film frame
 * (via useFilmFrame) so shared signals stay perfectly continuous across scenes.
 */
export const Scene: React.FC<{name: string; from: number; to: number; children: React.ReactNode}> = ({
  name,
  from,
  to,
  children,
}) => (
  <Sequence name={name} from={sec(from)} durationInFrames={sec(to) - sec(from)} layout="none">
    <OffsetCtx.Provider value={sec(from)}>{children}</OffsetCtx.Provider>
  </Sequence>
);

export const useFilmFrame = () => useCurrentFrame() + useContext(OffsetCtx);
