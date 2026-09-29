import {linearTiming, springTiming, TransitionSeries} from '@remotion/transitions';
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {AbsoluteFill, Easing, Sequence} from 'remotion';
import {Overlay} from './components/Overlay';
import {Curves} from './scenes/Curves';
import {GridWave} from './scenes/GridWave';
import {Intro} from './scenes/Intro';
import {Kinetic} from './scenes/Kinetic';
import {Orbit} from './scenes/Orbit';
import {Outro} from './scenes/Outro';
import {H, W} from './theme';

// Durées en images (30 fps). Les transitions se chevauchent : elles "mangent" du temps.
const SCENES = {intro: 80, kinetic: 90, grid: 85, orbit: 85, curves: 80, outro: 93};
const TRANSITIONS = [15, 12, 12, 12, 12];

export const SHOWREEL_DURATION =
  Object.values(SCENES).reduce((a, b) => a + b, 0) - TRANSITIONS.reduce((a, b) => a + b, 0); // = 450 → 15 s

const snappy = (frames: number) => linearTiming({durationInFrames: frames, easing: Easing.bezier(0.8, 0, 0.2, 1)});

export const Showreel: React.FC = () => (
  <AbsoluteFill style={{background: 'black'}}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="01 · Intro" durationInFrames={SCENES.intro}>
        <Intro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={clockWipe({width: W, height: H})} timing={snappy(TRANSITIONS[0])} />
      <TransitionSeries.Sequence name="02 · Kinetic" durationInFrames={SCENES.kinetic}>
        <Kinetic />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={snappy(TRANSITIONS[1])} />
      <TransitionSeries.Sequence name="03 · Grille" durationInFrames={SCENES.grid}>
        <GridWave />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({direction: 'from-top-left'})} timing={snappy(TRANSITIONS[2])} />
      <TransitionSeries.Sequence name="04 · Orbite" durationInFrames={SCENES.orbit}>
        <Orbit />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({direction: 'from-bottom'})}
        timing={springTiming({durationInFrames: TRANSITIONS[3], config: {damping: 200}})}
      />
      <TransitionSeries.Sequence name="05 · Courbes" durationInFrames={SCENES.curves}>
        <Curves />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={snappy(TRANSITIONS[4])} />
      <TransitionSeries.Sequence name="06 · Outro" durationInFrames={SCENES.outro}>
        <Outro duration={SCENES.outro} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Sequence name="Habillage (grain, timecode)">
      <Overlay />
    </Sequence>
  </AbsoluteFill>
);
