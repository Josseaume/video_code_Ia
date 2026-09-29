import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, FONT, K} from './theme';

// Logo du projet (fictif) : marque en 4 carrés + nom en deux graisses.
export const ProjectLogo: React.FC<{
  name?: [string, string];
  size?: number;
  mono?: string | null;
  delay?: number;
}> = ({name = ['oise', 'datapark'], size = 90, mono = null, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mark = spring({frame: frame - delay, fps, config: {damping: 12}});
  const word = interpolate(frame - delay, [6, 22], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const unit = size * 0.36;
  const squares = [
    {x: 0, y: 0, c: K.lime},
    {x: unit * 1.12, y: 0, c: K.green},
    {x: 0, y: unit * 1.12, c: K.orange},
    {x: unit * 1.12, y: unit * 1.12, c: K.teal},
  ];
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.28}}>
      <div style={{position: 'relative', width: unit * 2.12, height: unit * 2.12, transform: `rotate(${(1 - mark) * -90}deg) scale(${mark})`}}>
        {squares.map((sq, i) => (
          <div key={i} style={{position: 'absolute', left: sq.x, top: sq.y, width: unit, height: unit, background: mono ?? sq.c}} />
        ))}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: size,
          lineHeight: 1,
          color: mono ?? K.green,
          letterSpacing: '-0.01em',
          clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`,
          transform: `translateX(${(1 - word) * -30}px)`,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{fontWeight: 300}}>{name[0]}</span>
        <span style={{fontWeight: 800}}>{name[1]}</span>
      </div>
    </div>
  );
};

// Carré de couleur contenant le logo en blanc (le "badge" des vidéos institutionnelles).
export const Badge: React.FC<{
  x: number;
  y: number;
  size: number;
  color?: string;
  delay?: number;
  label?: [string, string];
}> = ({x, y, size, color = K.orange, delay = 0, label = ['oise', 'datapark']}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 13, stiffness: 150}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        background: color,
        transform: `scale(${s})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          color: 'white',
          fontSize: size * 0.2,
          lineHeight: 0.95,
          textAlign: 'left',
          opacity: interpolate(frame - delay, [6, 14], [0, 1], clamp),
        }}
      >
        <div style={{fontWeight: 300}}>{label[0]}</div>
        <div style={{fontWeight: 800}}>{label[1]}</div>
      </div>
    </div>
  );
};
