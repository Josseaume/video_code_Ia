import {getLength, getPointAtLength} from '@remotion/paths';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ChapterLabel} from '../components/ChapterLabel';
import {clamp, COLORS, FONTS} from '../theme';

const RIBBONS = 6;
const COMET_RIBBON = 3;
const EASE = Easing.bezier(0.65, 0, 0.35, 1);

const ribbonPath = (i: number, frame: number) => {
  const y = 600 + (i - 2.5) * 30;
  const w = Math.sin(frame * 0.07 + i * 0.45) * 90;
  return `M -200 ${y} C 400 ${y - 430 + w} 800 ${y + 430 - w} 1200 ${y} S 1800 ${y - 280 + w} 2200 ${y + 40}`;
};

const ribbonProgress = (i: number, frame: number) =>
  interpolate(frame - i * 3, [0, 48], [0, 1], {...clamp, easing: EASE});

const TRACKS: {label: string; ease: (t: number, frame: number, fps: number) => number}[] = [
  {label: 'LINEAR', ease: (t) => t},
  {label: 'EASE-IN-OUT', ease: (t) => Easing.inOut(Easing.cubic)(t)},
  {label: 'SPRING', ease: (_t, frame, fps) => spring({frame, fps, config: {damping: 7, stiffness: 120}})},
];
const LOOP = 36;

// Scène 5 : courbes de Bézier dessinées au trait, comète qui les suit, démonstration d'easings.
export const Curves: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const cometPath = ribbonPath(COMET_RIBBON, frame);
  const cometLength = getLength(cometPath);
  const cometP = ribbonProgress(COMET_RIBBON, frame);

  return (
    <AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
      <svg width="100%" height="100%" style={{position: 'absolute'}}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {new Array(RIBBONS).fill(0).map((_, i) => {
          const d = ribbonPath(i, frame);
          const length = getLength(d);
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={interpolateColors(i / (RIBBONS - 1), [0, 0.5, 1], [COLORS.cyan, COLORS.violet, COLORS.orange])}
              strokeWidth={i === COMET_RIBBON ? 5 : 3}
              strokeLinecap="round"
              strokeDasharray={length}
              strokeDashoffset={length * (1 - ribbonProgress(i, frame))}
            />
          );
        })}
        {new Array(12).fill(0).map((_, k) => {
          const p = Math.max(0, cometP - k * 0.01);
          const point = getPointAtLength(cometPath, cometLength * p);
          if (!point) return null;
          return (
            <circle
              key={k}
              cx={point.x}
              cy={point.y}
              r={16 - k * 1.1}
              fill={k === 0 ? 'white' : COLORS.yellow}
              opacity={cometP > 0 && cometP < 1 ? 1 - k / 12 : 0}
              filter="url(#glow)"
            />
          );
        })}
      </svg>

      <div style={{position: 'absolute', left: 150, top: 120}}>
        {['EASE IN.', 'EASE OUT.'].map((text, i) => {
          const s = spring({frame: frame - 6 - i * 6, fps, config: {damping: 15}});
          return (
            <div key={text} style={{height: 160, overflow: 'hidden'}}>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 170,
                  lineHeight: '160px',
                  color: i === 0 ? COLORS.ink : 'transparent',
                  WebkitTextStroke: i === 1 ? `3px ${COLORS.ink}` : undefined,
                  transform: `translateY(${(1 - s) * 105}%)`,
                }}
              >
                {text}
              </div>
            </div>
          );
        })}
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 24,
            letterSpacing: 2,
            color: COLORS.orange,
            marginTop: 20,
            display: 'inline-block',
            padding: '6px 12px',
            background: COLORS.bg,
            opacity: interpolate(frame, [20, 30], [0, 1], clamp),
          }}
        >
          cubic-bezier(0.65, 0, 0.35, 1)
        </div>
      </div>

      <div style={{position: 'absolute', left: 1180, top: 790, width: 580}}>
        {TRACKS.map((track, i) => {
          const local = Math.max(0, frame - 16 - i * 2);
          const loopFrame = local % LOOP;
          const t = Math.min(1, loopFrame / (LOOP * 0.8));
          const x = track.ease(t, loopFrame, fps) * 520;
          const appear = interpolate(frame, [10 + i * 3, 20 + i * 3], [0, 1], clamp);
          return (
            <div key={track.label} style={{position: 'relative', height: 64, opacity: appear}}>
              <div style={{position: 'absolute', left: 0, top: 0, fontFamily: FONTS.mono, fontSize: 16, letterSpacing: 3, color: COLORS.ink, opacity: 0.6}}>
                {track.label}
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 38, height: 2, background: 'rgba(244,239,230,0.2)'}} />
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: 28,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: [COLORS.cyan, COLORS.violet, COLORS.orange][i],
                }}
              />
            </div>
          );
        })}
      </div>

      <ChapterLabel index="04" title="EASING & CURVES" />
    </AbsoluteFill>
  );
};
