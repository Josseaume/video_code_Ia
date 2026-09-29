import {getLength} from '@remotion/paths';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, FONT, K} from './theme';

type LonLat = [number, number];

// Contours simplifiés (longitude, latitude) — stylisés, pas cartographiques.
// lon0/lat0 = coin haut-gauche du cadrage ; latScale ≈ 1 / cos(latitude) pour ne pas écraser la forme.
export const REGIONS = {
  oise: {
    lon0: 1.65,
    lat0: 49.8,
    latScale: 1.53,
    outline: [
      [1.72, 49.68], [1.8, 49.76], [2.05, 49.71], [2.3, 49.72], [2.55, 49.63], [2.78, 49.72], [3.06, 49.71],
      [3.12, 49.58], [3.16, 49.4], [3.06, 49.3], [3.1, 49.18], [2.85, 49.08], [2.6, 49.1], [2.45, 49.15],
      [2.2, 49.13], [2.0, 49.18], [1.8, 49.2], [1.7, 49.25], [1.78, 49.4], [1.72, 49.5],
    ] as LonLat[],
  },
  bretagne: {
    lon0: -4.9,
    lat0: 48.95,
    latScale: 1.49,
    outline: [
      // Côte nord, du Mont-Saint-Michel vers l'ouest
      [-1.51, 48.63], [-1.85, 48.7], [-2.03, 48.65], [-2.32, 48.68], [-2.55, 48.6], [-2.75, 48.52],
      [-2.95, 48.72], [-3.08, 48.83], [-3.45, 48.84], [-3.58, 48.72], [-3.98, 48.73], [-4.35, 48.67],
      [-4.62, 48.58], [-4.78, 48.36],
      // Rade de Brest, presqu'île de Crozon, pointe du Raz
      [-4.5, 48.33], [-4.62, 48.24], [-4.55, 48.16], [-4.35, 48.1], [-4.73, 48.03],
      // Côte sud, vers l'est
      [-4.37, 47.8], [-4.1, 47.87], [-3.85, 47.8], [-3.53, 47.73], [-3.37, 47.7], [-3.13, 47.48],
      [-2.95, 47.55], [-2.8, 47.52], [-2.45, 47.5],
      // Limite sud (Vilaine) puis frontière est de l'Ille-et-Vilaine
      [-2.1, 47.6], [-1.7, 47.72], [-1.25, 47.78], [-1.02, 48.1], [-1.08, 48.35], [-1.07, 48.52],
    ] as LonLat[],
  },
} as const;

export type RegionName = keyof typeof REGIONS;
export type City = {name: string; lon: number; lat: number; main?: boolean};
export type MapLink = {lon: number; lat: number; label: string};

// Carte animée d'une région : contour qui se trace, villes, épingle sur le site, lien pointillé vers une destination.
export const MapRegion: React.FC<{
  region: RegionName;
  x?: number;
  y?: number;
  scale?: number;
  cities: City[];
  site: {lon: number; lat: number; label: string};
  link?: MapLink;
  delay?: number;
}> = ({region, x = 980, y = 120, scale = 560, cities, site, link, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - delay;
  const {lon0, lat0, latScale, outline: points} = REGIONS[region];
  const project = (lon: number, lat: number) => ({x: x + (lon - lon0) * scale, y: y + (lat0 - lat) * scale * latScale});
  const outline = 'M ' + points.map(([lon, lat]) => {
    const p = project(lon, lat);
    return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(' L ') + ' Z';
  const outlineLength = getLength(outline);
  const draw = interpolate(t, [0, 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const fill = interpolate(t, [30, 50], [0, 1], clamp);

  const s = project(site.lon, site.lat);
  const pin = spring({frame: t - 60, fps, config: {damping: 9, stiffness: 160}});
  const P = link ? project(link.lon, link.lat) : {x: 0, y: 0};
  const linkDraw = interpolate(t, [80, 110], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});

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
      {link && (
        <g>
          <line
            x1={s.x}
            y1={s.y}
            x2={s.x + (P.x - s.x) * linkDraw}
            y2={s.y + (P.y - s.y) * linkDraw}
            stroke={K.burgundy}
            strokeWidth={3}
            strokeDasharray="10 10"
          />
          <circle cx={P.x} cy={P.y} r={10 * (linkDraw > 0.98 ? 1 : 0)} fill={K.burgundy} />
          <text
            x={P.x + 20}
            y={P.y + 8}
            fontFamily={FONT}
            fontWeight={800}
            fontSize={28}
            fill={K.burgundy}
            opacity={interpolate(t, [105, 115], [0, 1], clamp)}
          >
            {link.label}
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

// Raccourci conservé pour la vidéo data center (mêmes props qu'avant).
export const MapOise: React.FC<Omit<React.ComponentProps<typeof MapRegion>, 'region' | 'link'> & {paris?: string}> = ({
  paris,
  ...props
}) => <MapRegion region="oise" link={paris ? {lon: 2.35, lat: 48.86, label: `PARIS · ${paris}`} : undefined} {...props} />;
