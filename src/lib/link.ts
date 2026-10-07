export type LinkState = { href: string; external: true } | { href: null; label: 'coming soon' };

/** Only https URLs become links; anything else renders the "coming soon" state. */
export function linkState(url?: string): LinkState {
  if (url && url.startsWith('https://')) return { href: url, external: true };
  return { href: null, label: 'coming soon' };
}
