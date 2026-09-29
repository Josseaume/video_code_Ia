import {linearTiming, TransitionSeries, type TransitionPresentation} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {Easing} from 'remotion';
import * as S from './scenes';

// Ordre, durée (en images à 30 fps) et transition d'entrée de chaque scène.
export const DC_SCENES = [
  {id: 'Ouverture', component: S.SceneOpening, duration: 150},
  {id: 'Territoire', component: S.SceneTerritory, duration: 170, enter: 'slide'},
  {id: 'Question', component: S.SceneQuestion, duration: 200, enter: 'slide'},
  {id: 'Presentation', component: S.ScenePresentation, duration: 170, enter: 'fade'},
  {id: 'Site', component: S.SceneSite, duration: 180, enter: 'slide'},
  {id: 'Carte', component: S.SceneMap, duration: 200, enter: 'slide'},
  {id: 'Puissance', component: S.ScenePower, duration: 170, enter: 'wipe'},
  {id: 'Chaleur', component: S.SceneHeat, duration: 200, enter: 'slide'},
  {id: 'MotsCles', component: S.SceneKeywords, duration: 210, enter: 'wipe'},
  {id: 'Calendrier', component: S.SceneTimeline, duration: 200, enter: 'slide'},
  {id: 'Chiffres', component: S.SceneFigures, duration: 160, enter: 'slide'},
  {id: 'Message', component: S.SceneMessage, duration: 150, enter: 'wipe'},
  {id: 'Verbes', component: S.SceneVerbs, duration: 190, enter: 'fade'},
  {id: 'Fin', component: S.SceneOutro, duration: 220, enter: 'slide'},
] as const;

const TRANSITION = 15;
const timing = linearTiming({durationInFrames: TRANSITION, easing: Easing.bezier(0.7, 0, 0.3, 1)});

// Le cast unifie les trois types de transition pour TransitionSeries.
const presentation = (kind: 'slide' | 'fade' | 'wipe') =>
  (kind === 'slide' ? slide({direction: 'from-right'}) : kind === 'wipe' ? wipe({direction: 'from-left'}) : fade()) as TransitionPresentation<Record<string, unknown>>;

export const DC_DURATION = DC_SCENES.reduce((sum, s) => sum + s.duration, 0) - (DC_SCENES.length - 1) * TRANSITION;

export const DatacenterOise: React.FC = () => (
  <TransitionSeries>
    {DC_SCENES.flatMap((scene, i) => {
      const Scene = scene.component;
      const items = [];
      if (i > 0 && 'enter' in scene) {
        items.push(
          <TransitionSeries.Transition key={`t-${scene.id}`} presentation={presentation(scene.enter)} timing={timing} />,
        );
      }
      items.push(
        <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.duration}>
          <Scene />
        </TransitionSeries.Sequence>,
      );
      return items;
    })}
  </TransitionSeries>
);
