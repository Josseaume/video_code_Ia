import {Composition} from 'remotion';
import {Showreel, SHOWREEL_DURATION} from './Showreel';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Showreel"
    component={Showreel}
    durationInFrames={SHOWREEL_DURATION}
    fps={30}
    width={1920}
    height={1080}
  />
);
