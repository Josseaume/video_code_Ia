import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Photo} from './Photo';
import {clamp, FONT} from './theme';

// Mots géants "remplis" par une photo : chaque mot est un masque SVG sur la même image,
// dévoilé par un balayage gauche → droite.
export const PhotoText: React.FC<{
  name: string;
  words: string[];
  size?: number;
  delay?: number;
  stagger?: number;
  duration?: number;
  id?: string;
}> = ({name, words, size = 190, delay = 0, stagger = 12, duration = 200, id = 'pt'}) => {
  const frame = useCurrentFrame();
  const lineH = size * 0.92;
  const top = 540 - (words.length * lineH) / 2;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          {words.map((word, i) => (
            <clipPath key={word} id={`${id}-${i}`} clipPathUnits="userSpaceOnUse">
              <text
                x={960}
                y={top + (i + 1) * lineH - size * 0.14}
                textAnchor="middle"
                fontFamily={FONT}
                fontWeight={800}
                fontSize={size}
                letterSpacing={-size * 0.02}
              >
                {word}
              </text>
            </clipPath>
          ))}
        </defs>
      </svg>
      {words.map((word, i) => {
        const p = interpolate(frame - delay - i * stagger, [0, 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <AbsoluteFill key={word} style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>
            <AbsoluteFill style={{clipPath: `url(#${id}-${i})`}}>
              <Photo name={name} duration={duration} zoom={[1.0, 1.1]} />
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
