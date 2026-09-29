import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Photo} from './Photo';
import {clamp, FONT, K, type TextLine} from './theme';

export type KeywordGroup = {at: number; lines: TextLine[]};

// Photo plein écran + groupes de mots-clés qui se succèdent (le groupe suivant chasse le précédent).
export const KeywordsOverPhoto: React.FC<{
  name: string;
  groups: KeywordGroup[];
  duration: number;
  x?: number;
  y?: number;
  size?: number;
  align?: 'left' | 'right';
  focus?: string;
}> = ({name, groups, duration, x = 140, y = 420, size = 58, align = 'left', focus}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Photo name={name} duration={duration} focus={focus} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(to ${align === 'left' ? 'right' : 'left'}, rgba(0,0,0,0.55), rgba(0,0,0,0.05) 70%)`,
        }}
      />
      {groups.map((group, gi) => {
        const end = groups[gi + 1]?.at ?? duration + 100;
        const out = interpolate(frame, [end - 2, end + 6], [0, 1], clamp);
        if (frame < group.at || out >= 1) return null;
        return (
          <div
            key={gi}
            style={{
              position: 'absolute',
              top: y,
              ...(align === 'left' ? {left: x} : {right: x}),
              textAlign: align,
              opacity: 1 - out,
              transform: `translateY(${-out * 40}px)`,
            }}
          >
            {group.lines.map((line, li) => {
              const s = spring({frame: frame - group.at - li * 4, fps, config: {damping: 200}});
              return (
                <div
                  key={li}
                  style={{
                    fontFamily: FONT,
                    fontWeight: line.weight ?? 800,
                    fontSize: line.size ?? size,
                    color: line.color ?? 'white',
                    textTransform: 'uppercase',
                    lineHeight: 1.1,
                    opacity: s,
                    filter: `blur(${(1 - s) * 8}px)`,
                    transform: `translateY(${(1 - s) * 30}px)`,
                    textShadow: '0 2px 18px rgba(0,0,0,0.35)',
                  }}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Ouverture sur photo : un aplat de couleur se rétracte pour dévoiler l'image, puis une liste de mots s'empile.
export const PhotoOpener: React.FC<{
  name: string;
  words: TextLine[];
  duration: number;
  color?: string;
  wordsDelay?: number;
  stagger?: number;
}> = ({name, words, duration, color = K.lime, wordsDelay = 25, stagger = 12}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = spring({frame, fps, config: {damping: 200}, durationInFrames: 24});
  const veil = interpolate(frame, [4, 24], [0.85, 0], clamp);
  return (
    <AbsoluteFill style={{background: 'white'}}>
      <AbsoluteFill style={{clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`}}>
        <Photo name={name} duration={duration} zoom={[1.12, 1.02]} />
        <AbsoluteFill style={{background: color, opacity: veil, mixBlendMode: 'multiply'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', right: 150, top: 380, textAlign: 'right'}}>
        {words.map((w, i) => {
          const s = spring({frame: frame - wordsDelay - i * stagger, fps, config: {damping: 200}});
          return (
            <div
              key={i}
              style={{
                fontFamily: FONT,
                fontWeight: w.weight ?? 800,
                fontSize: w.size ?? 64,
                color: w.color ?? 'white',
                lineHeight: 1.1,
                textTransform: 'uppercase',
                opacity: s,
                transform: `translateX(${(1 - s) * 60}px)`,
                textShadow: '0 2px 18px rgba(0,0,0,0.35)',
              }}
            >
              {w.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
