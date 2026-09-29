/**
 * Sound-design hook: writes every key moment (keystrokes, impact, …) with
 * frame + time, so SFX can be synced in any DAW / NLE.
 *   npm run sfx
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {VIDEO, buildCues} from '../src/config.ts';

const payload = {
  video: {fps: VIDEO.fps, durationSec: VIDEO.durationSec, width: VIDEO.width, height: VIDEO.height},
  generatedFrom: 'src/config.ts',
  cues: buildCues(),
};

for (const dir of ['sfx', 'out']) {
  mkdirSync(dir, {recursive: true});
  writeFileSync(`${dir}/sfx-cues.json`, JSON.stringify(payload, null, 2) + '\n');
}
console.log(`wrote ${payload.cues.length} cues → sfx/sfx-cues.json, out/sfx-cues.json`);
