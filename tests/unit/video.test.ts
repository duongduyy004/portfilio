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
  it('file video uses a lazy <video>', async () => {
    const html = await render(VideoEmbed, {
      video: { title: 'Dance', kind: 'file', src: '/video/dance.mp4', poster: '/video/dance.jpg' },
    });
    expect(html).toContain('<video');
    expect(html).toContain('preload="none"');
    expect(html).toContain('src="/video/dance.mp4"');
  });

  it('youtube renders a link that the script upgrades, never an iframe on the server', async () => {
    const html = await render(VideoEmbed, {
      video: { title: 'Channel', kind: 'youtube', url: 'https://youtu.be/abc123', poster },
    });
    expect(html).not.toContain('<iframe');
    expect(html).toContain('href="https://youtu.be/abc123"');
    expect(html).toContain('data-embed="https://www.youtube-nocookie.com/embed/abc123?autoplay=1"');
  });

  it('tiktok without a url says coming soon and renders no link', async () => {
    const html = await render(VideoEmbed, {
      video: { title: 'TikTok', kind: 'tiktok', url: undefined, poster },
    });
    expect(html).toContain('coming soon');
    expect(html).not.toMatch(/<a[\s>]/);
  });
});
