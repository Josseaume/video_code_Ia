// Headless render with Revideo's renderer (puppeteer + ffmpeg). MIT licensed.
import {renderVideo} from '@revideo/renderer';
import {existsSync, renameSync, mkdirSync} from 'node:fs';

const chrome = process.env.CHROME_PATH ??
  ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find(existsSync);

const t0 = Date.now();
const file = await renderVideo({
  projectFile: './src/project.ts',
  settings: {
    outFile: 'raw-revideo.mp4',
    workers: Number(process.env.WORKERS ?? 1),
    logProgress: true,
    viteConfig: {server: {fs: {allow: ['..']}}},
    puppeteer: {args: ['--no-sandbox'], ...(chrome ? {executablePath: chrome} : {})},
  },
});
mkdirSync('../out', {recursive: true});
renameSync(file, '../out/raw-revideo.mp4');
console.log(`revideo render: ${((Date.now() - t0) / 1000).toFixed(1)}s → ../out/raw-revideo.mp4`);
