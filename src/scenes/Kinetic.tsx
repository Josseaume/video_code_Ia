import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ChapterLabel} from '../components/ChapterLabel';
import {clamp, COLORS, FONTS} from '../theme';

const WORDS = [
  {text: 'IDEAS', bg: COLORS.orange, fg: COLORS.bg},
  {text: 'IN', bg: COLORS.bg, fg: COLORS.ink},
  {text: 'MOTION', bg: COLORS.violet, fg: COLORS.ink},
  {text: 'EVERY', bg: COLORS.ink, fg: COLORS.bg},
  {text: 'FRAME', bg: COLORS.cyan, fg: COLORS.bg},
  {text: 'COUNTS', bg: COLORS.bg, fg: COLORS.orange},
];
const FRAMES_PER_WORD = 8;
const FLICKER_END = WORDS.length * FRAMES_PER_WORD;

const LINES = [
  {text: 'TYPE', color: COLORS.ink},
  {text: 'TIMING', color: COLORS.orange},
  {text: 'TENSION', color: COLORS.ink},
];

const Star: React.FC<{size: number; rotation: number; scale: number}> = ({size, rotation, scale}) => (
  <svg
    width={size}
    height={size}
    viewBox="-50 -50 100 100"
    style={{position: 'absolute', right: 180, top: 540 - size / 2, transform: `rotate(${rotation}deg) scale(${scale})`}}
  >
    {new Array(8).fill(0).map((_, i) => (
      <rect key={i} x={-5} y={-50} width={10} height={100} rx={5} fill={COLORS.orange} transform={`rotate(${i * 22.5})`} />
    ))}
  </svg>
);

// Scène 2 : mots en rafale sur fonds qui changent, puis trois lignes révélées par masque.
export const Kinetic: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  if (frame < FLICKER_END) {
    const index = Math.floor(frame / FRAMES_PER_WORD);
    const local = frame % FRAMES_PER_WORD;
    const word = WORDS[index];
    const scale = interpolate(local, [0, FRAMES_PER_WORD], [1.35, 1], {...clamp, easing: Easing.out(Easing.cubic)});
    const rotation = (random(`rot-${index}`) - 0.5) * 10;
    return (
      <AbsoluteFill style={{background: word.bg, justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 480,
            lineHeight: 1,
            color: word.fg,
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          {word.text}
        </div>
      </AbsoluteFill>
    );
  }

  const local = frame - FLICKER_END;
  const marqueeX = -local * 14;
  const starIn = spring({frame: local - 8, fps, config: {damping: 11}});

  return (
    <AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
      {/* Texte contour qui défile derrière */}
      {[0, 1].map((row) => (
        <div
          key={row}
          style={{
            position: 'absolute',
            top: row === 0 ? 40 : 700,
            whiteSpace: 'nowrap',
            fontFamily: FONTS.display,
            fontSize: 340,
            color: 'transparent',
            WebkitTextStroke: `2px ${COLORS.violet}`,
            opacity: 0.35,
            transform: `translateX(${row === 0 ? marqueeX - 200 : -marqueeX - 1400}px)`,
          }}
        >
          TYPE · TIMING · TENSION · TYPE · TIMING · TENSION ·
        </div>
      ))}

      <div style={{position: 'absolute', left: 150, top: 120}}>
        {LINES.map((line, i) => {
          const s = spring({frame: local - i * 5, fps, config: {damping: 16, mass: 0.7}});
          return (
            <div key={line.text} style={{height: 245, overflow: 'hidden'}}>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 250,
                  lineHeight: '245px',
                  color: line.color,
                  transform: `translateY(${(1 - s) * 110}%) skewY(${(1 - s) * 10}deg)`,
                }}
              >
                {line.text}
              </div>
            </div>
          );
        })}
      </div>

      <Star size={340} rotation={local * 4} scale={starIn} />
      <ChapterLabel index="01" title="KINETIC TYPE" />
    </AbsoluteFill>
  );
};
