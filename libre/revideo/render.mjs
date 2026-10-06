// Rendu headless avec Revideo (MIT).
//   node render.mjs              → ../out/datacenter-oise-revideo.mp4  (film entier)
//   node render.mjs --frame 300  → ../out/stills/revideo-300.png        (image extraite du dernier rendu)
import {renderVideo} from '@revideo/renderer';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, rmSync} from 'node:fs';
import {createRequire} from 'node:module';

const ffmpeg = createRequire(import.meta.url)('@ffmpeg-installer/ffmpeg').path; // ffmpeg embarqué, rien à installer
const chrome = process.env.CHROME_PATH ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
const OUT = '../out/datacenter-oise-revideo.mp4';
const i = process.argv.indexOf('--frame');

if (i > -1) {
  const n = Number(process.argv[i + 1]);
  mkdirSync('../out/stills', {recursive: true});
  execFileSync(ffmpeg, ['-y', '-v', 'error', '-i', OUT, '-vf', `select=eq(n\\,${n})`, '-frames:v', '1', `../out/stills/revideo-${n}.png`]);
  console.log(`../out/stills/revideo-${n}.png`);
} else {
  const t0 = Date.now();
  const file = await renderVideo({
    projectFile: './src/project.ts',
    settings: {
      outFile: 'tmp.mp4',
      workers: 1,
      logProgress: false,
      viteConfig: {server: {fs: {allow: ['../..']}}},
      puppeteer: {args: ['--no-sandbox'], ...(chrome ? {executablePath: chrome} : {})},
    },
  });
  mkdirSync('../out', {recursive: true});
  // Revideo ajoute une piste audio vide et une image de trop : on garde la vidéo seule (sans réencoder), exactement 2375 images.
  execFileSync(ffmpeg, ['-y', '-v', 'error', '-i', file, '-an', '-frames:v', '2375', '-c:v', 'copy', '-movflags', '+faststart', OUT]);
  rmSync(file);
  console.log(`rendu Revideo : ${((Date.now() - t0) / 1000).toFixed(0)} s → libre/out/datacenter-oise-revideo.mp4`);
}

