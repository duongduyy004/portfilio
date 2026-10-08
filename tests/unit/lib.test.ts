import { describe, expect, it } from 'vitest';
import { linkState } from '../../src/lib/link';

describe('linkState', () => {
  it('missing url is coming soon', () => {
    expect(linkState(undefined)).toEqual({ href: null, label: 'coming soon' });
    expect(linkState('')).toEqual({ href: null, label: 'coming soon' });
  });
  it('https url is an external link', () => {
    expect(linkState('https://youtube.com/x')).toEqual({ href: 'https://youtube.com/x', external: true });
  });
  it('non-https url is rejected', () => {
    expect(linkState('javascript:alert(1)')).toEqual({ href: null, label: 'coming soon' });
    expect(linkState('http://example.com')).toEqual({ href: null, label: 'coming soon' });
  });
});
