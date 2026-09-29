import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, FONTS} from '../theme';

const pad = (n: number) => String(n).padStart(2, '0');

const CropMark: React.FC<{top?: number; left?: number; right?: number; bottom?: number; rotate: number}> = ({
  rotate,
  ...pos
}) => (
  <div
    style={{
      position: 'absolute',
      ...pos,
      width: 36,
      height: 36,
      borderTop: '2px solid white',
      borderLeft: '2px solid white',
      transform: `rotate(${rotate}deg)`,
    }}
  />
);

// Habillage "caméra" commun à toute la vidéo : grain, repères, timecode, barre de progression.
export const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const fadeOut = interpolate(frame, [durationInFrames - 22, durationInFrames - 12], [1, 0], clamp);
  const recOn = Math.floor(frame / 12) % 2 === 0;
  const timecode = `00:00:${pad(Math.floor(frame / fps))}:${pad(frame % fps)}`;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)'}}
      />
      <svg width="100%" height="100%" style={{position: 'absolute', opacity: 0.12, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill
        style={{
          opacity: fadeOut,
          mixBlendMode: 'difference',
          color: 'white',
          fontFamily: FONTS.mono,
          fontSize: 20,
          letterSpacing: 3,
        }}
      >
        <CropMark top={44} left={44} rotate={0} />
        <CropMark top={44} right={44} rotate={90} />
        <CropMark bottom={44} right={44} rotate={180} />
        <CropMark bottom={44} left={44} rotate={270} />
        <div style={{position: 'absolute', top: 56, left: 100}}>CLAUDE / REEL_26</div>
        <div style={{position: 'absolute', top: 56, right: 100, display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{width: 14, height: 14, borderRadius: 7, background: 'white', opacity: recOn ? 1 : 0.2}} />
          REC
        </div>
        <div style={{position: 'absolute', bottom: 56, right: 100}}>TC {timecode}</div>
        <div style={{position: 'absolute', bottom: 36, left: 100, right: 100, height: 2, background: 'rgba(255,255,255,0.2)'}}>
          <div style={{width: `${(frame / (durationInFrames - 1)) * 100}%`, height: '100%', background: 'white'}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
