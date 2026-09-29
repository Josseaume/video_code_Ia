import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ChapterLabel} from '../components/ChapterLabel';
import {clamp, COLORS, FONTS} from '../theme';

const CX = 800;
const CY = 540;

const STARS = new Array(170).fill(0).map((_, i) => ({
  x: random(`sx-${i}`) * 2 - 1,
  y: random(`sy-${i}`) * 2 - 1,
  z: random(`sz-${i}`),
}));

const ORBITS = [
  {rx: 380, speed: 0.07, tilt: -18, color: COLORS.cyan, size: 34, phase: 0},
  {rx: 500, speed: -0.05, tilt: 10, color: COLORS.orange, size: 46, phase: 2},
  {rx: 640, speed: 0.035, tilt: -4, color: COLORS.ink, size: 22, phase: 4},
];

const STATS = [
  {value: 30, label: 'FPS'},
  {value: 450, label: 'FRAMES'},
  {value: -1, label: 'IDEAS'},
];

// Scène 4 : pseudo-3D — champ d'étoiles en hyperespace, sphère et planètes en orbite.
export const Orbit: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Vitesse de l'hyperespace qui accélère avec le temps.
  const travel = frame * 0.006 + frame * frame * 0.00012;
  const flatten = interpolate(frame, [0, 85], [0.22, 0.34]);
  const sphereIn = spring({frame: frame - 4, fps, config: {damping: 12}});

  const project = (x: number, y: number, z: number) => ({x: CX + (x / z) * 240, y: CY + (y / z) * 240});

  return (
    <AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
      <svg width="100%" height="100%" style={{position: 'absolute'}}>
        {STARS.map((star, i) => {
          const z = ((((star.z - travel) % 1) + 1) % 1) + 0.03;
          const head = project(star.x, star.y, z);
          const tail = project(star.x, star.y, z + 0.06);
          return (
            <line
              key={i}
              x1={head.x}
              y1={head.y}
              x2={tail.x}
              y2={tail.y}
              stroke={i % 7 === 0 ? COLORS.violet : COLORS.ink}
              strokeWidth={(1 - z) * 3 + 0.5}
              strokeLinecap="round"
              opacity={1 - z}
            />
          );
        })}
        {ORBITS.map((orbit, i) => {
          const drawn = interpolate(frame, [4 + i * 4, 30 + i * 4], [0, 1], clamp);
          const circumference = 2 * Math.PI * orbit.rx;
          return (
            <ellipse
              key={i}
              cx={CX}
              cy={CY}
              rx={orbit.rx}
              ry={orbit.rx * flatten}
              fill="none"
              stroke={orbit.color}
              strokeOpacity={0.4}
              strokeWidth={2}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - drawn)}
              transform={`rotate(${orbit.tilt} ${CX} ${CY})`}
            />
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: CX - 150,
          top: CY - 150,
          width: 300,
          height: 300,
          borderRadius: '50%',
          zIndex: 5,
          transform: `scale(${sphereIn})`,
          background: `radial-gradient(circle at 34% 30%, #ffffff 0%, ${COLORS.orange} 22%, ${COLORS.violet} 62%, #150d33 100%)`,
          boxShadow: `0 0 120px ${COLORS.violet}, inset -30px -40px 80px rgba(0,0,0,0.6)`,
        }}
      />

      {ORBITS.map((orbit, i) => {
        const angle = frame * orbit.speed + orbit.phase;
        const depth = Math.sin(angle); // > 0 : devant la sphère
        const x = orbit.rx * Math.cos(angle);
        const y = orbit.rx * flatten * depth;
        const theta = (orbit.tilt * Math.PI) / 180;
        const px = CX + x * Math.cos(theta) - y * Math.sin(theta);
        const py = CY + x * Math.sin(theta) + y * Math.cos(theta);
        const size = orbit.size * (0.75 + 0.35 * depth) * sphereIn;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - size / 2,
              top: py - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              background: orbit.color,
              zIndex: depth > 0 ? 10 : 1,
              boxShadow: `0 0 30px ${orbit.color}`,
              opacity: 0.55 + 0.45 * (depth * 0.5 + 0.5),
            }}
          />
        );
      })}

      <div style={{position: 'absolute', right: 150, top: 240, display: 'flex', flexDirection: 'column', gap: 40, zIndex: 20}}>
        {STATS.map((stat, i) => {
          const s = spring({frame: frame - 10 - i * 6, fps, config: {damping: 200}});
          const count = interpolate(frame, [10 + i * 6, 50 + i * 6], [0, stat.value], clamp);
          const shown = stat.value < 0 ? (frame > 40 + i * 6 ? '∞' : String(Math.floor(random(`n-${frame}`) * 999))) : Math.round(count);
          return (
            <div key={stat.label} style={{opacity: s, transform: `translateX(${(1 - s) * 80}px)`, textAlign: 'right'}}>
              <div style={{fontFamily: FONTS.display, fontSize: 120, lineHeight: 1, color: COLORS.ink}}>{shown}</div>
              <div style={{fontFamily: FONTS.mono, fontSize: 22, letterSpacing: 6, color: COLORS.orange}}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <ChapterLabel index="03" title="DEPTH & PHYSICS" />
    </AbsoluteFill>
  );
};
