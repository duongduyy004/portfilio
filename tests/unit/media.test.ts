import { existsSync, readFileSync, statSync } from 'node:fs';
import { imageSize } from 'image-size';
import { describe, expect, it } from 'vitest';

const MEDIA = 'src/assets/media';
const IMAGES = [
  'portrait.png', 'mor-fb-insights.jpg', 'mor-content-library.jpg', 'mor-trip-group.jpg',
  'mor-trip-street.jpg', 'mor-birthday.jpg', 'mor-sports-mc.jpg', 'mor-pickleball.jpg',
  'fm-trend-sheet.jpg', 'fm-yt-stats.jpg', 'fm-tiktok-1.jpg', 'fm-tiktok-2.jpg', 'fm-tiktok-3.jpg',
  'fm-boysday-1.jpg', 'fm-boysday-2.jpg', 'meraces-yt-stats.jpg', 'meraces-shorts.jpg',
  'meraces-jobad.jpg', 'meraces-threads.jpg', 'buddy-1.jpg', 'buddy-2.jpg', 'ndc-club.jpg',
  'hallym.jpg', 'insta-vocab.jpg', 'photo-1.jpg', 'photo-2.jpg',
];
const VIDEOS = ['edits', 'dance'];
const MAX_VIDEO_BYTES = 10_485_760;

describe('extracted media', () => {
  it.each(IMAGES)('%s exists and is at most 2000px on its longest side', (name) => {
    const path = `${MEDIA}/${name}`;
    expect(existsSync(path)).toBe(true);
    const { width, height } = imageSize(readFileSync(path));
    expect(Math.max(width, height)).toBeLessThanOrEqual(2000);
  });

  it('portrait keeps its transparency', () => {
    const buf = readFileSync(`${MEDIA}/portrait.png`);
    // PNG colour type 6 = RGBA
    expect(buf[25]).toBe(6);
  });

  it.each(VIDEOS)('public/video/%s.mp4 exists, is at most 10 MB and has a poster', (name) => {
    const mp4 = `public/video/${name}.mp4`;
    expect(existsSync(mp4)).toBe(true);
    expect(statSync(mp4).size).toBeLessThanOrEqual(MAX_VIDEO_BYTES);
    expect(existsSync(`public/video/${name}.jpg`)).toBe(true);
  });
});
