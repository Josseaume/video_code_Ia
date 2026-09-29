import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, SCENES, T, VIDEO} from './config';
import {Contours} from './components/Contours';
import {EndCard} from './components/EndCard';
import {LeaderLine, Panel} from './components/Panel';
import {PromptLine} from './components/PromptLine';
import {Texture} from './components/Texture';
import {Ember, FlyingToken, ImpactFlash} from './components/Token';
import {World} from './components/World';
import {Scene} from './lib/scene';
import {fadeOutAt} from './lib/timeline';
import './fonts';

/**
 * Layer stack (bottom → top):
 *   contour field (canvas, own camera) → world-space DOM (camera) → end card → texture → fade
 * Scene-specific elements live in named <Scene> sequences; the prompt line spans scenes 1–4.
 */
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg, overflow: 'hidden'}}>
      <Scene name="bg · contour field" from={0} to={VIDEO.durationSec}>
        <Contours />
      </Scene>

      <World>
        <Scene name="01 · intro — ember" from={SCENES.intro.from} to={SCENES.intro.to}>
          <Ember />
        </Scene>
        <Scene name="01–04 · prompt line" from={SCENES.intro.from} to={SCENES.outro.from + 1.5}>
          <PromptLine />
        </Scene>
        <Scene name="03 · predict — HUD" from={SCENES.predict.from} to={T.panelOut + 0.7}>
          <LeaderLine />
          <Panel />
        </Scene>
        <Scene name="04 · commit — token flight" from={SCENES.commit.from} to={SCENES.commit.to}>
          <FlyingToken />
          <ImpactFlash />
        </Scene>
      </World>

      <Scene name="05 · outro — end card" from={SCENES.outro.from} to={SCENES.outro.to}>
        <EndCard />
      </Scene>

      <Texture />
      <AbsoluteFill style={{backgroundColor: COLORS.bg, opacity: fadeOutAt(frame)}} />
    </AbsoluteFill>
  );
};
