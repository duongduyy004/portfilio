import { describe, expect, it } from 'vitest';
import { linkState } from '../../src/lib/link';
import { parseStat } from '../../src/lib/stat';

describe('parseStat', () => {
  it('percentage with sign', () => {
    expect(parseStat('+267%')).toEqual({ prefix: '+', number: 267, decimals: 0, suffix: '%', grouping: false });
  });
  it('magnitude suffix', () => {
    expect(parseStat('6M+')).toEqual({ prefix: '', number: 6, decimals: 0, suffix: 'M+', grouping: false });
  });
  it('grouped thousands', () => {
    expect(parseStat('687,370')).toEqual({ prefix: '', number: 687370, decimals: 0, suffix: '', grouping: true });
  });
  it('K+ suffix', () => {
    expect(parseStat('54K+')).toMatchObject({ number: 54, suffix: 'K+' });
  });
  it('decimals', () => {
    expect(parseStat('13.3K')).toMatchObject({ number: 13.3, decimals: 1, suffix: 'K' });
  });
  it('non-numeric returns null', () => {
    expect(parseStat('Hallym')).toBeNull();
  });
});

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
