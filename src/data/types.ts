import type { ImageMetadata } from 'astro';

export interface Stat { value: string; label: string }
export interface Photo { src: ImageMetadata; alt: string; caption?: string }
export interface Post { title: string; views: string; image?: Photo; url?: string; detail?: string }
export interface Role {
  id: string;
  company: string;
  title: string;
  dates?: string;
  bullets: string[];
  metrics: Stat[];
  photos: Photo[];
  story: string[];
}
export interface EventItem { title: string; org: string; caption: string; photo: Photo }
export interface Video {
  title: string;
  kind: 'youtube' | 'tiktok' | 'file' | 'link';
  url?: string;
  src?: string;
  poster: Photo | string;
  caption?: string;
}
export interface Activity { title: string; role: string; text: string; photo?: Photo }
export interface Education { school: string; detail: string; years: string }
export interface Contact { email: string; phone: string; cv?: string }
export interface Profile {
  name: string;
  headline: string;
  bio: string;
  skills: string[];
  avatar: Photo;
  stats: Stat[];
  highlight: { title: string; stats: Stat[]; text: string; image: Photo };
  posts: Post[];
  roles: Role[];
  events: EventItem[];
  videos: Video[];
  photos: Photo[];
  activities: Activity[];
  education: Education[];
  contact: Contact;
}

export const SECTIONS = [
  { id: 'top-posts', label: 'Top Posts' },
  { id: 'experience', label: 'Experience' },
  { id: 'events', label: 'Events' },
  { id: 'videos', label: 'Videos' },
  { id: 'beyond-work', label: 'Beyond Work' },
  { id: 'contact', label: 'Contact' },
] as const;
