import {loadFont} from '@remotion/google-fonts/JetBrainsMono';
import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT} from './config';

/**
 * Default: JetBrains Mono via @remotion/google-fonts.
 * Set REMOTION_LOCAL_FONTS=1 to load the vendored copy of the exact same
 * Google Fonts file from public/fonts (for sandboxed / offline renders).
 */
if (process.env.REMOTION_LOCAL_FONTS === '1') {
  const handle = delayRender('Loading local JetBrains Mono');
  const face = new FontFace(FONT.family, `url(${staticFile('fonts/JetBrainsMono-latin.woff2')}) format('woff2')`, {
    weight: '100 800',
    style: 'normal',
  });
  face
    .load()
    .then(() => {
      document.fonts.add(face);
      continueRender(handle);
    })
    .catch((err) => {
      throw err;
    });
} else {
  loadFont('normal', {weights: [...FONT.weights], subsets: ['latin']});
}
