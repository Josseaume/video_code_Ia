import {getLength} from '@remotion/paths';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, FONT, K} from './theme';

// Contour simplifié du département de l'Oise (longitude, latitude) — stylisé, pas cartographique.
const OISE: [number, number][] = [
  [1.72, 49.68], [1.8, 49.76], [2.05, 49.71], [2.3, 49.72], [2.55, 49.63], [2.78, 49.72], [3.06, 49.71],
  [3.12, 49.58], [3.16, 49.4], [3.06, 49.3], [3.1, 49.18], [2.85, 49.08], [2.6, 49.1], [2.45, 49.15],
  [2.2, 49.13], [2.0, 49.18], [1.8, 49.2], [1.7, 49.25], [1.78, 49.4], [1.72, 49.5],
];

export type City = {name: string; lon: number; lat: number; main?: boolean};

// Projection simple (équirectangulaire corrigée de la latitude) vers les pixels.
const makeProject = (x0: number, y0: number, k: number) => (lon: number, lat: number) => ({
  x: x0 + (lon - 1.65) * k,
  y: y0 + (49.8 - lat) * k * 1.53,
});

export const MapOise: React.FC<{
  x?: number;
  y?: number;
  scale?: number;
  cities: City[];
  site: {lon: number; lat: number; label: string};
  paris?: string;
  delay?: number;
}> = ({x = 980, y = 120, scale = 560, cities, site, paris, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - delay;
  const project = makeProject(x, y, scale);

  const outline = 'M ' + OISE.map(([lon, lat]) => {
    const p = project(lon, lat);
    return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(' L ') + ' Z';
  const outlineLength = getLength(outline);
  const draw = interpolate(t, [0, 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const fill = interpolate(t, [30, 50], [0, 1], clamp);

  const s = project(site.lon, site.lat);
  const pin = spring({frame: t - 60, fps, config: {damping: 9, stiffness: 160}});
  const P = project(2.35, 48.86);
  const parisDraw = interpolate(t, [80, 110], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});

  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <path d={outline} fill={K.lime} fillOpacity={0.18 * fill} stroke="none" />
      <path
        d={outline}
        fill="none"
        stroke={K.green}
        strokeWidth={4}
        strokeLinejoin="round"
        strokeDasharray={outlineLength}
        strokeDashoffset={outlineLength * (1 - draw)}
      />
      {cities.map((c, i) => {
        const p = project(c.lon, c.lat);
        const cs = spring({frame: t - 40 - i * 5, fps, config: {damping: 12}});
        return (
          <g key={c.name} opacity={Math.min(1, cs)}>
            <rect x={p.x - 7 * cs} y={p.y - 7 * cs} width={14 * cs} height={14 * cs} fill={c.main ? K.burgundy : K.teal} />
            <text x={p.x + 16} y={p.y + 7} fontFamily={FONT} fontWeight={c.main ? 800 : 600} fontSize={24} fill={K.text}>
              {c.name.toUpperCase()}
            </text>
          </g>
        );
      })}
      {paris && (
        <g>
          <line
            x1={s.x}
            y1={s.y}
            x2={s.x + (P.x - s.x) * parisDraw}
            y2={s.y + (P.y - s.y) * parisDraw}
            stroke={K.burgundy}
            strokeWidth={3}
            strokeDasharray="10 10"
          />
          <circle cx={P.x} cy={P.y} r={10 * (parisDraw > 0.98 ? 1 : 0)} fill={K.burgundy} />
          <text
            x={P.x + 20}
            y={P.y + 8}
            fontFamily={FONT}
            fontWeight={800}
            fontSize={28}
            fill={K.burgundy}
            opacity={interpolate(t, [105, 115], [0, 1], clamp)}
          >
            PARIS · {paris}
          </text>
        </g>
      )}
      {[0, 1, 2].map((r) => {
        const rp = ((t - 70 - r * 12) % 40) / 40;
        if (t < 70 + r * 12) return null;
        return <circle key={r} cx={s.x} cy={s.y} r={20 + rp * 90} fill="none" stroke={K.orange} strokeWidth={3} opacity={1 - rp} />;
      })}
      <g transform={`translate(${s.x} ${s.y - (1 - pin) * 200}) scale(${Math.max(0, pin)})`}>
        <path d="M 0 0 C -10 -18, -26 -30, -26 -48 A 26 26 0 1 1 26 -48 C 26 -30, 10 -18, 0 0 Z" fill={K.orange} />
        <rect x={-9} y={-57} width={18} height={18} fill="white" />
      </g>
      <text
        x={s.x + 40}
        y={s.y - 50}
        fontFamily={FONT}
        fontWeight={800}
        fontSize={30}
        fill={K.orange}
        opacity={interpolate(t, [72, 82], [0, 1], clamp)}
      >
        {site.label.toUpperCase()}
      </text>
    </svg>
  );
};
