import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TEXTURE, VIDEO} from '../config';
import {mulberry32} from '../lib/math';

const GW = VIDEO.width / 2;
const GH = VIDEO.height / 2;

/** Per-frame seeded film grain (half-res, upscaled for a soft analog feel). */
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(GW, GH);
    const rand = mulberry32(frame * 9973 + 17);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = rand();
      const c = v > 0.5 ? 255 : 0;
      d[i] = c;
      d[i + 1] = c;
      d[i + 2] = c;
      d[i + 3] = Math.abs(v - 0.5) * 2 * 255 * TEXTURE.grainOpacity * 2;
    }
    ctx.putImageData(img, 0, 0);
  }, [frame]);
  return (
    <canvas
      ref={ref}
      width={GW}
      height={GH}
      style={{position: 'absolute', inset: 0, width: VIDEO.width, height: VIDEO.height}}
    />
  );
};

/** Grain + scanlines + vignette. Sits above everything. */
export const Texture: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.25) % 4;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Grain />
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,${TEXTURE.scanlineOpacity}) 0px, rgba(0,0,0,${TEXTURE.scanlineOpacity}) 1px, transparent 1px, transparent 4px)`,
          backgroundPosition: `0 ${drift}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,${TEXTURE.vignette}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
