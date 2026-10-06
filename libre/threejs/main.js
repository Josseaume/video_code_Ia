// Point d'entrée : charge polices et photos, puis expose window.renderFrame(n).
// Rien ne s'anime tout seul : render.mjs appelle renderFrame pour chaque image et la capture.
import {DURATION, FONT, FONT_TNUM, SCENES, sceneStates} from '../shared/core.js';
import {SCENE_DRAWERS} from './scenes.js';
import {Stage} from './stage.js';

const photoSizes = await (await fetch('../shared/photos.json')).json();
await Promise.all([300, 400, 600, 800].flatMap((w) => [document.fonts.load(`${w} 40px "${FONT}"`, 'aé≈'), document.fonts.load(`${w} 40px "${FONT_TNUM}"`, '0')]));

const stage = new Stage();
await stage.loadPhotos(Object.keys(photoSizes), (name) => `../../public/photos/${name}.jpg`);

window.DURATION = DURATION;
window.renderFrame = (n) => {
  stage.clear();
  // une ou deux scènes visibles (deux pendant une transition), dessinées dans l'ordre
  for (const st of sceneStates(n)) {
    stage.begin();
    SCENE_DRAWERS[SCENES[st.index].id](stage, st.frame);
    stage.flush(st);
  }
  return true;
};
window.renderFrame(0);
window.ready = true;
