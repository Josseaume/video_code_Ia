import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {Easing} from 'remotion';
import * as S from './scenes';

// Ordre et durée (en images à 30 fps) de chaque scène. Les transitions sont dans le JSX plus bas.
export const DC_SCENES = [
  {id: 'Ouverture', component: S.SceneOpening, duration: 150},
  {id: 'Territoire', component: S.SceneTerritory, duration: 170},
  {id: 'Question', component: S.SceneQuestion, duration: 200},
  {id: 'Presentation', component: S.ScenePresentation, duration: 170},
  {id: 'Site', component: S.SceneSite, duration: 180},
  {id: 'Carte', component: S.SceneMap, duration: 200},
  {id: 'Puissance', component: S.ScenePower, duration: 170},
  {id: 'Chaleur', component: S.SceneHeat, duration: 200},
  {id: 'MotsCles', component: S.SceneKeywords, duration: 210},
  {id: 'Calendrier', component: S.SceneTimeline, duration: 200},
  {id: 'Chiffres', component: S.SceneFigures, duration: 160},
  {id: 'Message', component: S.SceneMessage, duration: 150},
  {id: 'Verbes', component: S.SceneVerbs, duration: 190},
  {id: 'Fin', component: S.SceneOutro, duration: 220},
] as const;

const TRANSITION = 15;
const timing = linearTiming({durationInFrames: TRANSITION, easing: Easing.bezier(0.7, 0, 0.3, 1)});

const slideIn = () => slide({direction: 'from-right'});
const wipeIn = () => wipe({direction: 'from-left'});

export const DC_DURATION = DC_SCENES.reduce((sum, s) => sum + s.duration, 0) - (DC_SCENES.length - 1) * TRANSITION;

// Durée d'une scène, lue dans DC_SCENES (source unique des durées).
const d = (id: (typeof DC_SCENES)[number]['id']) => DC_SCENES.find((s) => s.id === id)!.duration;

// ⚠️ Une ligne JSX par scène, volontairement (pas de .map) : le Studio regroupe dans la timeline
// les séquences créées à la même ligne de code (« 01 · Ouverture +13 »). Écrites une à une,
// chaque scène a sa propre piste. Garder le même ordre que DC_SCENES.
export const DatacenterOise: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="01 · Ouverture" durationInFrames={d('Ouverture')}>
      <S.SceneOpening />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slideIn()} timing={timing} />
    <TransitionSeries.Sequence name="02 · Territoire" durationInFrames={d('Territoire')}>
      <S.SceneTerritory />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slideIn()} timing={timing} />
    <TransitionSeries.Sequence name="03 · Question" durationInFrames={d('Question')}>
      <S.SceneQuestion />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={timing} />
    <TransitionSeries.Sequence name="04 · Présentation" durationInFrames={d('Presentation')}>
      <S.ScenePresentation />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slideIn()} timing={timing} />
    <TransitionSeries.Sequence name="05 · Site" durationInFrames={d('Site')}>
      <S.SceneSite />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slideIn()} timing={timing} />
    <TransitionSeries.Sequence name="06 · Carte" durationInFrames={d('Carte')}>
      <S.SceneMap />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipeIn()} timing={timing} />
    <TransitionSeries.Sequence name="07 · Puissance" durationInFrames={d('Puissance')}>
      <S.ScenePower />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slideIn()} timing={timing} />
    <TransitionSeries.Sequence name="08 · Chaleur" durationInFrames={d('Chaleur')}>
      <S.SceneHeat />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipeIn()} timing={timing} />
    <TransitionSeries.Sequence name="09 · Mots-clés" durationInFrames={d('MotsCles')}>
      <S.SceneKeywords />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slideIn()} timing={timing} />
    <TransitionSeries.Sequence name="10 · Calendrier" durationInFrames={d('Calendrier')}>
      <S.SceneTimeline />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slideIn()} timing={timing} />
    <TransitionSeries.Sequence name="11 · Chiffres" durationInFrames={d('Chiffres')}>
      <S.SceneFigures />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipeIn()} timing={timing} />
    <TransitionSeries.Sequence name="12 · Message" durationInFrames={d('Message')}>
      <S.SceneMessage />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={timing} />
    <TransitionSeries.Sequence name="13 · Verbes" durationInFrames={d('Verbes')}>
      <S.SceneVerbs />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slideIn()} timing={timing} />
    <TransitionSeries.Sequence name="14 · Fin" durationInFrames={d('Fin')}>
      <S.SceneOutro />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
