// Frame-by-frame capture: a tiny static server + headless Chromium (Playwright, Apache-2.0)
// calls window.renderFrame(f) for every frame and pipes screenshots into FFmpeg.
//   node render.mjs                 → ../out/raw-threejs.mp4
//   node render.mjs --stills 90,780 → ../out/stills/threejs-<frame>.png
//   node render.mjs --serve         → http://localhost:8123/threejs/ (open in a browser, call renderFrame(f))
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {createReadStream, existsSync, mkdirSync, readFileSync, statSync} from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const spec = JSON.parse(readFileSync(path.join(root, 'shared/spec.json'), 'utf8'));
const {fps, duration} = spec.video;
const args = process.argv.slice(2);
const PORT = 8123;

const types = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2'};
const server = http
  .createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const file = existsSync(p) && statSync(p).isDirectory() ? path.join(p, 'index.html') : p;
    if (!file.startsWith(root) || !existsSync(file)) return res.writeHead(404).end();
    res.setHeader('content-type', types[path.extname(file)] ?? 'application/octet-stream');
    createReadStream(file).pipe(res);
  })
  .listen(PORT);
const url = `http://localhost:${PORT}/threejs/`;
if (args.includes('--serve')) {
  console.log(`serving ${url}`);
} else {
  const chrome = process.env.CHROME_PATH ?? ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync);
  const browser = await chromium.launch({
    ...(chrome ? {executablePath: chrome} : {}),
    // software WebGL when there is no GPU (CI / containers); harmless with a GPU
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({viewport: {width: spec.video.width, height: spec.video.height}});
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(url);
  await page.waitForFunction('window.ready === true', null, {timeout: 60000});

  const stillsArg = args[args.indexOf('--stills') + 1];
  if (args.includes('--stills')) {
    mkdirSync(path.join(root, 'out/stills'), {recursive: true});
    for (const f of stillsArg.split(',').map(Number)) {
      await page.evaluate((f) => window.renderFrame(f), f);
      await page.screenshot({path: path.join(root, `out/stills/threejs-${f}.png`)});
      console.log('still', f);
    }
  } else {
    mkdirSync(path.join(root, 'out'), {recursive: true});
    const out = path.join(root, 'out/raw-threejs.mp4');
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', out], {stdio: ['pipe', 'inherit', 'inherit']});
    const total = fps * duration;
    const t0 = Date.now();
    for (let f = 0; f < total; f++) {
      await page.evaluate((f) => window.renderFrame(f), f);
      const buf = await page.screenshot({type: 'jpeg', quality: 95});
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (f % 120 === 0) console.log(`frame ${f}/${total} · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    console.log(`three.js render: ${((Date.now() - t0) / 1000).toFixed(1)}s → ${out}`);
  }
  await browser.close();
  server.close();
}
