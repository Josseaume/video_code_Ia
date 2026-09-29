import React from 'react';
import {useCurrentFrame} from 'remotion';
import {VIDEO} from '../config';
import {camera} from '../lib/timeline';

/** World-space container: origin at frame center, driven by the virtual camera. */
export const World: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const cam = camera(frame);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        transformOrigin: '0 0',
        transform: `translate(${VIDEO.width / 2 + cam.tx}px, ${VIDEO.height / 2 + cam.ty}px) scale(${Math.max(cam.s, 0.0001)})`,
        opacity: cam.s < 0.003 ? 0 : 1,
      }}
    >
      {children}
    </div>
  );
};
