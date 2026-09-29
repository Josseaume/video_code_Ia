import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Tile} from './Tile';
import {clamp, FONT, K} from './theme';

export type Milestone = {year: string; label: string; photo: string; color?: string};

// Frise chronologique horizontale : la ligne se trace, chaque jalon apparaît avec sa photo.
export const Timeline: React.FC<{milestones: Milestone[]; y?: number; delay?: number; stagger?: number}> = ({
  milestones,
  y = 640,
  delay = 0,
  stagger = 22,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x0 = 200;
  const x1 = 1720;
  const step = (x1 - x0) / milestones.length;
  const draw = interpolate(frame - delay, [0, 20 + milestones.length * stagger], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  return (
    <>
      <div style={{position: 'absolute', left: x0, top: y - 2, width: (x1 - x0) * draw, height: 4, background: K.line}} />
      {milestones.map((m, i) => {
        const cx = x0 + step * (i + 0.5);
        const d = delay + 10 + i * stagger;
        const s = spring({frame: frame - d, fps, config: {damping: 12}});
        const color = m.color ?? [K.green, K.orange, K.teal, K.burgundy][i % 4];
        return (
          <div key={m.year}>
            <Tile name={m.photo} x={cx - 170} y={y - 330} w={340} h={250} delay={d + 2} />
            <div
              style={{
                position: 'absolute',
                left: cx - 18,
                top: y - 18,
                width: 36,
                height: 36,
                background: color,
                transform: `scale(${s}) rotate(${(1 - s) * 90}deg)`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: cx - 200,
                width: 400,
                top: y + 40,
                textAlign: 'center',
                fontFamily: FONT,
                opacity: Math.min(1, s),
                transform: `translateY(${(1 - s) * 30}px)`,
              }}
            >
              <div style={{fontWeight: 800, fontSize: 64, color}}>{m.year}</div>
              <div style={{fontWeight: 600, fontSize: 26, color: K.text, textTransform: 'uppercase', letterSpacing: '0.04em'}}>
                {m.label}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};
