// Capture image par image : un mini serveur de fichiers + Chrome sans fenêtre (Playwright, Apache-2.0)
// appelle window.renderFrame(n) pour chaque image et envoie les captures à ffmpeg.
//   node render.mjs              → ../out/datacenter-oise-threejs.mp4
//   node render.mjs --frame 300  → ../out/stills/threejs-300.png  (une image, rendue directement)
//   node render.mjs --serve      → http://localhost:8124/libre/threejs/  (dans la console : renderFrame(300))
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {createReadStream, existsSync, mkdirSync, statSync} from 'node:fs';
import http from 'node:http';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..'); // racine du dépôt : donne accès à public/photos et à libre/shared
const out = path.resolve(here, '../out');
const PORT = 8124;
const FPS = 30;
const args = process.argv.slice(2);

// ffmpeg : celui du système s'il existe, sinon celui embarqué par la version Revideo voisine
const ffmpeg = (() => {
  try {
    return createRequire(path.join(here, '../revideo/'))('@ffmpeg-installer/ffmpeg').path;
  } catch {
    return 'ffmpeg';
  }
})();

const types = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.jpg': 'image/jpeg'};
// Le serveur n'écoute que sur 127.0.0.1 (cette machine) et ne sert que les fichiers du dépôt.
const server = http
  .createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const file = existsSync(p) && statSync(p).isDirectory() ? path.join(p, 'index.html') : p;
    if (!file.startsWith(root + path.sep) || !existsSync(file)) return res.writeHead(404).end();
    res.setHeader('content-type', types[path.extname(file)] ?? 'application/octet-stream');
    createReadStream(file).pipe(res);
  })
  .listen(PORT, '127.0.0.1');
const url = `http://127.0.0.1:${PORT}/libre/threejs/`;

if (args.includes('--serve')) {
  console.log(`aperçu : ${url}`);
} else {
  const chrome = process.env.CHROME_PATH ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
  const browser = await chromium.launch({...(chrome ? {executablePath: chrome} : {}), args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader']});
  const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
  page.on('pageerror', (e) => console.error('erreur page :', e.message));
  page.on('console', (m) => m.type() === 'error' && console.error('console :', m.text()));
  await page.goto(url);
  await page.waitForFunction('window.ready === true', null, {timeout: 60000});
  const total = await page.evaluate('window.DURATION');

  const i = args.indexOf('--frame');
  if (i > -1) {
    mkdirSync(path.join(out, 'stills'), {recursive: true});
    for (const n of args[i + 1].split(',').map(Number)) {
      await page.evaluate((n) => window.renderFrame(n), n);
      await page.screenshot({path: path.join(out, `stills/threejs-${n}.png`)});
      console.log(`../out/stills/threejs-${n}.png`);
    }
  } else {
    mkdirSync(out, {recursive: true});
    const file = path.join(out, 'datacenter-oise-threejs.mp4');
    const ff = spawn(ffmpeg, ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file], {stdio: ['pipe', 'inherit', 'inherit']});
    const t0 = Date.now();
    for (let n = 0; n < total; n++) {
      await page.evaluate((n) => window.renderFrame(n), n);
      const buf = await page.screenshot({type: 'png'});
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (n % 300 === 0) console.log(`image ${n}/${total}`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    console.log(`rendu Three.js : ${((Date.now() - t0) / 1000).toFixed(0)} s → libre/out/datacenter-oise-threejs.mp4`);
  }
  await browser.close();
  server.close();
}
