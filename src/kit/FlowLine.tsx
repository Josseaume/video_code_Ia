import {getLength} from '@remotion/paths';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, K} from './theme';

// Tracés prédéfinis (en coordonnées 1920×1080) : lignes souples avec boucles.
export const FLOW_PATHS = {
  sweep:
    'M -60 760 C 220 700, 380 860, 560 780 C 700 720, 760 600, 690 560 C 610 520, 560 640, 660 680 C 820 740, 1040 560, 1240 560 C 1480 560, 1560 760, 1760 700 C 1880 660, 1940 600, 1990 560',
  high:
    'M -60 300 C 200 200, 420 380, 640 300 C 760 260, 820 150, 760 110 C 690 70, 640 180, 720 220 C 900 300, 1180 120, 1420 180 C 1640 240, 1780 120, 1990 80',
  low:
    'M -60 980 C 260 900, 500 1040, 760 960 C 900 920, 960 820, 900 790 C 830 760, 790 860, 880 900 C 1060 980, 1320 820, 1560 880 C 1760 930, 1860 860, 1990 820',
  diagonal:
    'M 1990 140 C 1700 260, 1600 120, 1460 260 C 1380 340, 1420 440, 1500 420 C 1580 400, 1560 300, 1470 320 C 1280 360, 1180 620, 900 700 C 620 780, 360 700, -60 900',
};

export type FlowName = keyof typeof FLOW_PATHS;

// Ligne fine qui se dessine (tête) puis s'efface par l'arrière (queue).
export const FlowLine: React.FC<{
  path?: FlowName;
  color?: string;
  width?: number;
  delay?: number;
  draw?: number;
  tailDelay?: number | null;
}> = ({path = 'sweep', color = K.line, width = 2.5, delay = 0, draw = 45, tailDelay = null}) => {
  const frame = useCurrentFrame();
  const d = FLOW_PATHS[path];
  const length = getLength(d);
  const ease = Easing.inOut(Easing.cubic);
  const head = interpolate(frame - delay, [0, draw], [0, 1], {...clamp, easing: ease});
  const tail = tailDelay === null ? 0 : interpolate(frame - delay - tailDelay, [0, draw], [0, 1], {...clamp, easing: ease});
  const visible = Math.max(0, head - tail) * length;

  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={`${visible} ${length}`}
        strokeDashoffset={-tail * length}
      />
    </svg>
  );
};
