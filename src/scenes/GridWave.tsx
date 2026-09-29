import {AbsoluteFill, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ChapterLabel} from '../components/ChapterLabel';
import {COLORS, FONTS} from '../theme';

const COLS = 16;
const ROWS = 9;
const CELL = 120;

// Scène 3 : une grille procédurale — chaque case réagit à une onde qui se déplace.
export const GridWave: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Le centre de l'onde suit une courbe de Lissajous.
  const waveX = 960 + 520 * Math.sin(frame * 0.05);
  const waveY = 540 + 260 * Math.cos(frame * 0.07);

  const cells = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cx = col * CELL + CELL / 2;
      const cy = row * CELL + CELL / 2;
      const distFromCenter = Math.hypot(cx - 960, cy - 540) / CELL;
      const distFromWave = Math.hypot(cx - waveX, cy - waveY) / CELL;

      const appear = spring({frame: frame - distFromCenter * 1.6, fps, config: {damping: 14}});
      const wave = Math.sin(frame * 0.22 - distFromWave * 0.55) * 0.5 + 0.5;
      const size = CELL * (0.15 + 0.72 * wave) * appear;

      cells.push(
        <div
          key={`${row}-${col}`}
          style={{
            position: 'absolute',
            left: cx - size / 2,
            top: cy - size / 2,
            width: size,
            height: size,
            // Cercle quand l'onde est basse, carré quand elle est haute.
            borderRadius: `${50 - wave * 42}%`,
            background: interpolateColors(wave, [0, 0.5, 1], [COLORS.violet, COLORS.orange, COLORS.yellow]),
            transform: `rotate(${wave * 180}deg)`,
          }}
        />,
      );
    }
  }

  const titleIn = spring({frame: frame - 14, fps, config: {damping: 200}});

  return (
    <AbsoluteFill style={{background: COLORS.bg}}>
      {cells}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', mixBlendMode: 'difference'}}>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 420,
            color: 'white',
            letterSpacing: `${(1 - titleIn) * 60 + 10}px`,
            opacity: titleIn,
          }}
        >
          RHYTHM
        </div>
      </AbsoluteFill>
      <ChapterLabel index="02" title="PROCEDURAL SYSTEMS" />
    </AbsoluteFill>
  );
};
