// usage: node stills.mjs <video-id> <outdir> [sceneId ...] [scene:beat:fraction ...]
//   no picks  -> one still at the end of every beat + a contact sheet per scene
//   picks     -> one still per scene:beat:fraction (e.g. stack:9:0.5)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root = import.meta.dirname;
const vid = process.argv[2];
const out = path.resolve(process.argv[3]);
const args = process.argv.slice(4);
const picks = args.filter((a) => a.includes(':'));
const only = args.filter((a) => !a.includes(':'));
fs.mkdirSync(out, {recursive: true});
const tl = JSON.parse(fs.readFileSync(path.join(root, 'public', vid, 'timeline.json')));
const serveUrl = await bundle({entryPoint: fs.existsSync(path.join(root, 'src', vid, 'index.tsx')) ? path.join(root, 'src', vid, 'index.tsx') : path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: vid});
if (picks.length) {
  for (const pk of picks) {
    const [id, bi, fr] = pk.split(':');
    const s = tl.scenes.find((x) => x.id === id);
    const b = s.beats[+bi];
    const f = s.from + b.from + Math.round(+fr * b.dur);
    await renderStill({serveUrl, composition, frame: f, output: path.join(out, `pick_${id}_${bi}_${fr}.jpeg`), imageFormat: 'jpeg', overwrite: true});
  }
  process.exit(0);
}
for (const s of tl.scenes) {
  if (only.length && !only.includes(s.id)) continue;
  const files = [];
  for (const [i, b] of s.beats.entries()) {
    const f = s.from + b.from + b.dur + 4;
    const file = path.join(out, `${s.id}_${String(i).padStart(2, '0')}.jpeg`);
    await renderStill({serveUrl, composition, frame: f, output: file, imageFormat: 'jpeg', scale: 0.5, overwrite: true});
    files.push(file);
  }
  execFileSync('magick', ['montage', ...files, '-tile', '2x', '-geometry', '+6+6', '-background', '#333', path.join(out, `sheet_${s.id}.jpeg`)]);
  console.log('done', s.id, files.length);
}
