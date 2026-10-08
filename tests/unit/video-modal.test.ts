import { describe, expect, it } from 'vitest';
import VideoModal from '../../src/components/VideoModal.astro';
import { render } from './render';

describe('VideoModal', () => {
  it('renders an empty dialog with a labelled close button and caption slots', async () => {
    const html = await render(VideoModal);
    expect(html).toMatch(/<dialog[^>]*id="video-modal"/);
    expect(html).toMatch(/<button[^>]*aria-label="Close video"/);
    expect(html).toContain('video-modal__stage');
    expect(html).not.toContain('<video');
    expect(html).not.toContain('<iframe');
  });
});
