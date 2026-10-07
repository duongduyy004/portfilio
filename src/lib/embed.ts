import type { Video } from '../data/types';

/** Build the click-to-load player URL for a YouTube or TikTok video, or null if there isn't one. */
export function embedUrl(kind: Video['kind'], url?: string): string | null {
  if (!url) return null;
  if (kind === 'youtube') {
    const id = /(?:[?&]v=|youtu\.be\/|\/shorts\/|\/embed\/)([\w-]{6,})/.exec(url)?.[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1` : null;
  }
  if (kind === 'tiktok') {
    const id = /\/video\/(\d+)/.exec(url)?.[1];
    return id ? `https://www.tiktok.com/player/v1/${id}` : null;
  }
  return null;
}
