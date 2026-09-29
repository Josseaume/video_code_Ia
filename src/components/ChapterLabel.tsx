import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../theme';

export const ChapterLabel: React.FC<{index: string; title: string; delay?: number}> = ({
  index,
  title,
  delay = 6,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200}});

  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        bottom: 110,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        fontFamily: FONTS.mono,
        fontSize: 24,
        letterSpacing: 4,
        color: COLORS.ink,
        overflow: 'hidden',
        zIndex: 50,
      }}
    >
      <span style={{color: COLORS.orange, display: 'inline-block', transform: `translateY(${(1 - s) * 40}px)`}}>
        {index}
      </span>
      <span style={{width: 70 * s, height: 2, background: COLORS.ink, display: 'inline-block'}} />
      <span style={{display: 'inline-block', opacity: s, transform: `translateY(${(1 - s) * 40}px)`}}>{title}</span>
    </div>
  );
};
