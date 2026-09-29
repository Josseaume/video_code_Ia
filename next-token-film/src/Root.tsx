import React from 'react';
import {Composition} from 'remotion';
import {DURATION_FRAMES, VIDEO} from './config';
import {Film} from './Film';

export const RemotionRoot: React.FC = () => (
  <Composition
    id={VIDEO.id}
    component={Film}
    durationInFrames={DURATION_FRAMES}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);
