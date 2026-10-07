// Pull the deck's videos out of the .pptx and transcode them for the web.
// Usage: node scripts/transcode.mjs <deck.pptx>
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const MAX_BYTES = 10_485_760;
const VIDEOS = [
  { name: 'edits', src: 'media1.mp4', poster: 'image56.jpeg' },
  { name: 'dance', src: 'media2.mov', poster: 'image60.png' },
];

const deck = process.argv[2];
const tmp = mkdtempSync(join(tmpdir(), 'deck-'));
const outDir = 'public/video';
mkdirSync(outDir, { recursive: true });

const files = VIDEOS.flatMap((v) => [`ppt/media/${v.src}`, `ppt/media/${v.poster}`]);
execFileSync('python', ['-c',
  'import sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); [z.extract(n, sys.argv[2]) for n in sys.argv[3:]]',
  deck, tmp, ...files], { stdio: 'inherit' });

const run = (args) => execFileSync(ffmpeg, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });

for (const v of VIDEOS) {
  const input = join(tmp, 'ppt/media', v.src);
  const output = join(outDir, `${v.name}.mp4`);
  for (const crf of [28, 32, 36]) {
    run(['-i', input, '-vf', 'scale=-2:720', '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow',
      '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', output]);
    const size = statSync(output).size;
    console.log(`${v.name}.mp4 crf ${crf}: ${(size / 1048576).toFixed(1)} MB`);
    if (size <= MAX_BYTES) break;
  }
  run(['-i', join(tmp, 'ppt/media', v.poster), '-vf', "scale='min(1280,iw)':-2", '-q:v', '4', join(outDir, `${v.name}.jpg`)]);
}
