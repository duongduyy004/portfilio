import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

// mean per-pixel chroma (max channel - min channel) over visible pixels; 0 for greyscale
async function meanChroma(path: string): Promise<number> {
  const { data } = await sharp(path).ensureAlpha().resize(120).raw().toBuffer({ resolveWithObject: true });
  let sum = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // transparent background of cut-outs
    sum += Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
    n++;
  }
  return sum / n;
}

// fm-tiktok-3.jpg stays black-and-white on purpose: it is a screenshot of a real published post
const COLOURISED = ['buddy-1.jpg', 'buddy-2.jpg', 'portrait.png', 'hallym.jpg'];

describe('colourised photos', () => {
  it.each(COLOURISED)('%s has real colour', async (name) => {
    expect(await meanChroma(`src/assets/media/${name}`)).toBeGreaterThan(10);
  });
});
