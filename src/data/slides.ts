import { SECTIONS } from './types';

export type Tone = 'lavender' | 'yellow' | 'mint' | 'pink' | 'lilac';
export type SectionId = (typeof SECTIONS)[number]['id'];

export interface SlideDef {
  n: number;
  id: string;
  title: string;
  icon: string;
  section: SectionId | 'profile';
  tone: Tone;
  /** legacy section anchor (e.g. "events"), set on a section's first slide */
  anchor?: SectionId;
}

const TONES: Tone[] = ['lavender', 'yellow', 'mint', 'pink', 'lilac'];

const ORDER: { title: string; icon: string; section: SlideDef['section'] }[] = [
  { title: 'Thuy Anh Phi', icon: '👋', section: 'profile' },
  { title: 'Top Posts · Careers page', icon: '🔥', section: 'top-posts' },
  { title: 'Top Posts', icon: '🔥', section: 'top-posts' },
  { title: 'Experience · MOR Software', icon: '📌', section: 'experience' },
  { title: 'Experience · Future Media', icon: '📌', section: 'experience' },
  { title: 'Experience · Meraces', icon: '📌', section: 'experience' },
  { title: 'Events', icon: '🎉', section: 'events' },
  { title: 'Videos', icon: '🎬', section: 'videos' },
  { title: 'Beyond Work', icon: '🌱', section: 'beyond-work' },
  { title: 'Contact', icon: '💌', section: 'contact' },
];

export const SLIDES: SlideDef[] = ORDER.map((s, i) => {
  const first = s.section !== 'profile' && ORDER.findIndex((o) => o.section === s.section) === i;
  return {
    ...s,
    n: i + 1,
    id: `slide-${i + 1}`,
    tone: TONES[i % TONES.length],
    ...(first ? { anchor: s.section as SectionId } : {}),
  };
});

export const SECTION_FIRST_SLIDE = Object.fromEntries(
  SLIDES.filter((s) => s.anchor).map((s) => [s.anchor, s.id]),
) as Record<SectionId, string>;
