import {makeScene2D, Node, Rect} from '@revideo/2d';
import {createSignal} from '@revideo/core';
import latin from '../../shared/fonts/Montserrat-latin.woff2?url';
import latinExt from '../../shared/fonts/Montserrat-latin-ext.woff2?url';
import {DURATION, FONT, FONT_TNUM, H, K, SCENES, W, sceneStates} from '../../shared/core.js';
import {buildScene} from './kit';
import {SCENE_BUILDERS} from './scenes';

export default makeScene2D('datacenter-oise', function* (view) {
  // Montserrat : mêmes fichiers Google Fonts que l'original, mais servis en local
  for (const [url, range] of [
    [latin, 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212, U+2215'],
    [latinExt, 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+20A0-20C0, U+2113'],
  ]) {
    for (const [family, featureSettings] of [[FONT, 'normal'], [FONT_TNUM, '"tnum"']]) {
      const face = new FontFace(family, `url(${url})`, {weight: '100 900', unicodeRange: range, featureSettings});
      (document.fonts as unknown as {add(f: FontFace): void}).add(face);
      yield face.load();
    }
  }

  view.fill(K.white);
  const frame = createSignal(0); // image globale du film

  // Une « piste » par scène : glissement (x), volet (largeur visible), fondu (opacité).
  const tracks = SCENES.map((scene, i) => {
    const st = () => sceneStates(frame()).find((s) => s.index === i) ?? {x: 0, opacity: 1, reveal: 1};
    const {node, updaters} = buildScene(() => frame() - (scene as {start: number}).start, () => SCENE_BUILDERS[scene.id]());
    const wrapper = (
      <Node x={() => st().x}>
        <Rect clip size={() => [W * st().reveal, H]} x={() => -W / 2 + (W * st().reveal) / 2}>
          <Node x={() => W / 2 - (W * st().reveal) / 2} opacity={() => st().opacity} cache={() => st().opacity < 1}>
            <Rect size={[W, H]} fill={K.white} />
            <Node position={[-W / 2, -H / 2]}>{node}</Node>
          </Node>
        </Rect>
      </Node>
    ) as Node;
    return {wrapper, updaters, mounted: false};
  });

  // Boucle principale : une image par tour. On ne garde dans l'arbre que les scènes visibles.
  // FROM/TO (variables du projet) permettent de ne rendre qu'un extrait.
  for (let g = 0; g < DURATION; g++) {
    frame(g);
    const active = new Set(sceneStates(g).map((s) => s.index));
    tracks.forEach((track, i) => {
      if (active.has(i) && !track.mounted) view.add(track.wrapper);
      if (!active.has(i) && track.mounted) track.wrapper.remove();
      track.mounted = active.has(i);
      if (track.mounted) track.updaters.forEach((u) => u());
    });
    yield;
  }
});
