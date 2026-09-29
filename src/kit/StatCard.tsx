import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Square, Tile, type Box} from './Tile';
import {clamp, FONT, K} from './theme';

export type StatLine = {text: string; big?: boolean} | {count: number; suffix?: string; big?: boolean};

const formatNumber = (n: number) => Math.round(n).toLocaleString('fr-FR').replace(/ /g, ' ');

// Carte photo + carré orange en coin + chiffre clé qui défile.
export const StatCard: React.FC<Box & {name: string; lines: StatLine[]; delay?: number; accent?: string}> = ({
  name,
  lines,
  x,
  y,
  w,
  h,
  delay = 0,
  accent = K.orange,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      <Tile name={name} x={x} y={y} w={w} h={h} delay={delay} />
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          background: 'linear-gradient(to top right, rgba(0,0,0,0.55), transparent 65%)',
          opacity: interpolate(frame - delay, [8, 18], [0, 1], clamp),
        }}
      />
      <Square x={x - 40} y={y - 40} size={80} color={accent} delay={delay + 4} />
      <div style={{position: 'absolute', left: x + 50, bottom: 1080 - (y + h) + 50, fontFamily: FONT, color: 'white'}}>
        {lines.map((line, i) => {
          const d = delay + 14 + i * 6;
          const s = spring({frame: frame - d, fps, config: {damping: 200}});
          const size = line.big ? 150 : 44;
          const content =
            'count' in line
              ? formatNumber(interpolate(frame - d, [0, 40], [0, line.count], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 4)})) +
                (line.suffix ?? '')
              : line.text;
          return (
            <div key={i} style={{overflow: 'hidden'}}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: size,
                  lineHeight: line.big ? 0.95 : 1.1,
                  textTransform: 'uppercase',
                  transform: `translateX(${(1 - s) * -110}%)`,
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: '0 2px 20px rgba(0,0,0,0.25)',
                }}
              >
                {content}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
