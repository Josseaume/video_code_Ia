// Sound-design hook: writes sfx-cues.json (frame + time for every key moment) from spec.json.
//   node shared/export-cues.mjs
import {readFileSync, writeFileSync} from 'node:fs';
const spec = JSON.parse(readFileSync(new URL('./spec.json', import.meta.url)));
const {fps} = spec.video;
const cues = spec.cues.map((c, i) => ({id: `${c.type}_${i}`, ...c, frame: Math.round(c.time * fps)}));
writeFileSync(new URL('../sfx-cues.json', import.meta.url), JSON.stringify({video: spec.video, cues}, null, 2) + '\n');
console.log(`wrote ${cues.length} cues → sfx-cues.json`);
