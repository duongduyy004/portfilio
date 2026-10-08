import { describe, expect, it } from 'vitest';
import VideoEmbed from '../../src/components/VideoEmbed.astro';
import { profile } from '../../src/data/profile';
import { embedUrl } from '../../src/lib/embed';
import { render } from './render';

const poster = profile.videos.find((v) => typeof v.poster !== 'string')!.poster;

describe('embedUrl', () => {
  it('parses youtube watch, short and shorts urls', () => {
    const want = 'https://www.youtube-nocookie.com/embed/abc123?autoplay=1';
    expect(embedUrl('youtube', 'https://www.youtube.com/watch?v=abc123')).toBe(want);
    expect(embedUrl('youtube', 'https://youtu.be/abc123')).toBe(want);
    expect(embedUrl('youtube', 'https://www.youtube.com/shorts/abc123')).toBe(want);
  });
  it('parses tiktok video urls', () => {
    expect(embedUrl('tiktok', 'https://www.tiktok.com/@user/video/7301234567890123456'))
      .toBe('https://www.tiktok.com/player/v1/7301234567890123456');
  });
  it('returns null for unparseable or missing urls', () => {
    expect(embedUrl('youtube', 'https://www.youtube.com/@channel')).toBeNull();
    expect(embedUrl('tiktok', undefined)).toBeNull();
    expect(embedUrl('link', 'https://instagram.com/x')).toBeNull();
  });
});

describe('VideoEmbed', () => {
  it('file video is a poster link to the mp4 that opens the modal, with no <video> on the server', async () => {
    const html = await render(VideoEmbed, {
      video: { title: 'Dance', kind: 'file', src: '/video/dance.mp4', poster: '/video/dance.jpg', caption: 'Moves' },
    });
    expect(html).not.toContain('<video');
    expect(html).toMatch(/<a[^>]*href="\/video\/dance\.mp4"/);
    expect(html).toMatch(/<a[^>]*data-video-modal/);
    expect(html).toContain('data-kind="file"');
    expect(html).toContain('data-caption="Moves"');
    expect(html).toMatch(/<img[^>]*src="\/video\/dance\.jpg"[^>]*loading="lazy"/);
    expect(html).toContain('aria-label="Play Dance"');
  });

  it('youtube renders a link that the script upgrades, never an iframe on the server', async () => {
    const html = await render(VideoEmbed, {
      video: { title: 'Channel', kind: 'youtube', url: 'https://youtu.be/abc123', poster },
    });
    expect(html).not.toContain('<iframe');
    expect(html).toContain('href="https://youtu.be/abc123"');
    expect(html).toContain('data-embed="https://www.youtube-nocookie.com/embed/abc123?autoplay=1"');
    expect(html).toMatch(/<a[^>]*data-video-modal/);
  });

  it('tiktok without a url says coming soon, links nowhere external and opens no player', async () => {
    const html = await render(VideoEmbed, {
      video: { title: 'TikTok', kind: 'tiktok', url: undefined, poster },
    });
    expect(html).toContain('coming soon');
    expect(html).not.toMatch(/<a[^>]*href="https?:/);
    expect(html).not.toContain('data-video-modal');
    // the screenshot itself can still be enlarged
    expect(html).toMatch(/<a[^>]*data-lightbox/);
  });
});
