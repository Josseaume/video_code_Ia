import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, FONT, K} from './theme';

export type Counter = {value: number; prefix?: string; suffix?: string; label: string; color?: string};

const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR').replace(/ /g, ' ');

// Rangée de chiffres clés qui défilent, chacun coiffé d'un carré de couleur.
export const Counters: React.FC<{items: Counter[]; y?: number; delay?: number; stagger?: number}> = ({
  items,
  y = 380,
  delay = 0,
  stagger = 8,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const colW = 1600 / items.length;
  return (
    <>
      {items.map((item, i) => {
        const d = delay + i * stagger;
        const s = spring({frame: frame - d, fps, config: {damping: 13}});
        const value = interpolate(frame - d, [0, 45], [0, item.value], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 4)});
        const color = item.color ?? [K.green, K.orange, K.teal][i % 3];
        return (
          <div key={item.label} style={{position: 'absolute', left: 160 + i * colW, top: y, width: colW, textAlign: 'center', fontFamily: FONT}}>
            <div
              style={{
                width: 46,
                height: 46,
                background: color,
                margin: '0 auto 30px',
                transform: `scale(${s}) rotate(${(1 - s) * 180}deg)`,
              }}
            />
            <div style={{fontWeight: 800, fontSize: 140, lineHeight: 1, color, fontVariantNumeric: 'tabular-nums', opacity: Math.min(1, s * 2)}}>
              {item.prefix}
              {fmt(value)}
              {item.suffix}
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 30,
                marginTop: 16,
                color: K.text,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                opacity: interpolate(frame - d, [15, 28], [0, 1], clamp),
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </>
  );
};
