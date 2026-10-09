import type { Profile } from './types';

import portrait from '../assets/media/portrait.png';
import morLifetimeInsights from '../assets/media/life-time-insights-mor.png';
import morContentLibrary from '../assets/media/mor-content-library.jpg';
import morTripGroup from '../assets/media/mor-trip-group.jpg';
import morTripStreet from '../assets/media/mor-trip-street.jpg';
import morBirthday from '../assets/media/mor-birthday.jpg';
import morSportsMc from '../assets/media/mor-sports-mc.jpg';
import morPickleball from '../assets/media/mor-pickleball.jpg';
import fmTrendSheet from '../assets/media/fm-trend-sheet.jpg';
import fmYtStats from '../assets/media/fm-yt-stats.jpg';
import fmTiktok1 from '../assets/media/fm-tiktok-1.jpg';
import fmTiktok2 from '../assets/media/fm-tiktok-2.jpg';
import fmTiktok3 from '../assets/media/fm-tiktok-3.jpg';
import fmBoysday1 from '../assets/media/fm-boysday-1.jpg';
import fmBoysday2 from '../assets/media/fm-boysday-2.jpg';
import meracesYtStats from '../assets/media/meraces-yt-stats.jpg';
import meracesShorts from '../assets/media/meraces-shorts.jpg';
import meracesThreads from '../assets/media/meraces-threads.jpg';
import buddy1 from '../assets/media/buddy-1.jpg';
import buddy2 from '../assets/media/buddy-2.jpg';
import ndcClub from '../assets/media/ndc-club.jpg';
import instaVocab from '../assets/media/insta-vocab.jpg';
import photo1 from '../assets/media/photo-1.jpg';
import photo2 from '../assets/media/photo-2.jpg';

export const profile: Profile = {
  name: 'Thuy Anh Phi',
  headline: 'Employer Branding & Internal Communication',
  bio: 'I enjoy fostering meaningful connections within organizations and creating clear, engaging communication that brings people together.',
  skills: ['Content strategy', 'Events & MC', 'Video editing', 'Recruitment'],
  avatar: { src: portrait, alt: 'Portrait of Thuy Anh Phi' },
  stats: [
    { value: '6M+', label: 'YouTube views' },
    { value: '+267%', label: 'Facebook reach' },
    { value: '160K', label: 'Top post views' },
  ],

  highlight: {
    title: 'MOR Software Careers page',
    stats: [
      { value: '1,087,268', label: 'total views' },
      { value: '+245%', label: 'views growth' },
      { value: '84,435', label: 'engagements' },
      { value: '+189%', label: 'engagement growth' },
    ],
    text: 'Since joining MOR Software, I’ve contributed to growing the Careers page through content about our people and everyday work life. The page recorded over 1 million views (+245%) and 84,435 engagements (+189%). My role covered content planning, copywriting, filming and editing, with colleagues helping bring these stories to life. It’s been rewarding to see more people connect with the culture we share.',
    image: { src: morLifetimeInsights, alt: 'Facebook Professional dashboard showing 1,087,268 views (+245%) and 84,435 engagements (+189%) for MOR Software Careers' },
  },

  posts: [
    {
      title: 'Whose idea was this?',
      views: '160K',
      detail: '100K unique viewers · 13.3K engagements · 99 new followers',
      url: undefined, // TODO(link)
    },
    {
      title: 'Our company is still home',
      views: '93K',
      detail: '71K viewers · 3.1K engagements',
      url: undefined, // TODO(link)
    },
    {
      title: "An intern's worries when job hunting",
      views: '66K',
      detail: '45K viewers · 5.5K engagements',
      url: undefined, // TODO(link)
    },
    {
      title: 'What nobody tells you',
      views: '54K+',
      detail: '36K viewers · 3.5K engagements',
      url: undefined, // TODO(link)
    },
  ],

  roles: [
    {
      id: 'mor',
      company: 'MOR Software JSC',
      title: 'Employer Branding Executive',
      // TODO(dates)
      bullets: [
        'Grew average monthly Facebook reach by 267% and monthly views by 141% through content development and optimisation.',
        'Managed employer branding content across Facebook, LinkedIn and TikTok: planning, copywriting, photo and video, editing and community engagement.',
        'Collaborated on recruitment activities and internal communication initiatives.',
        'Supported planning and execution of internal company events.',
      ],
      metrics: [
        { value: '+267%', label: 'monthly reach' },
        { value: '+141%', label: 'monthly views' },
        { value: '687,370', label: 'page views' },
      ],
      photos: [
        { src: morContentLibrary, alt: 'Content Library listing the top posts: 160,284, 92,606, 66,416 and 54,002 views' },
        { src: morTripGroup, alt: 'MOR Software employees from three branches on the beach in Ha Long for team building' },
        { src: morSportsMc, alt: 'Thuy Anh hosting the internal sports games as MC' },
      ],
      story: [
        'I owned the Facebook content strategy for MOR Software Careers. The page reached 687,370 total views (+209%), generated 49,110 engagements (+135%) and increased messaging conversations by 50%, all without paid promotion. It went from modest reach to a consistently high-performing employer branding channel.',
        "I created every lifetime top-performing post on the page, reaching 160K, 93K, 66K and 54K+ views organically. The best one delivered 13.3K engagements, 100K unique viewers and 99 new followers on its own. Along the way I built a repeatable framework for future employer branding campaigns.",
        'Company trip, Ha Long: I helped run a three-day engagement trip for employees from the Ha Noi, Da Nang and HCMC branches, coordinating beach team-building, group games and an evening gala with guest artist Da LAB.',
        '8th anniversary, Hanoi: I contributed ideas and built interactive games, coordinated food and drink vendors, and covered the day in photo and video.',
        'Internal sports games: I supported the organisation and hosted the tournaments as MC.',
      ],
    },
    {
      id: 'future-media',
      company: 'Future Media Technology Investment Co., Ltd',
      title: 'Social Media Channel Administrator',
      // TODO(dates)
      bullets: [
        'Built a YouTube channel from 0 to 1,451 subscribers in its first month, with 446,065 organic views.',
        'Managed and developed a 26,000-subscriber YouTube channel to 6M+ views within 5 months (2025).',
        'Researched trends and evaluated content to match videos to audience demand.',
        'Optimised performance through YouTube SEO, publishing and channel management.',
      ],
      metrics: [
        { value: '1,451', label: 'subscribers, month one' },
        { value: '446,065', label: 'organic views, month one' },
        { value: '6M+', label: 'views in 5 months' },
      ],
      photos: [
        { src: fmYtStats, alt: 'YouTube analytics: viewers watched the videos 446,065 times in February' },
        { src: fmTrendSheet, alt: 'Trend research spreadsheet used to plan video concepts' },
        { src: fmTiktok2, alt: 'TikTok employer branding video featuring Thuy Anh at the office' },
      ],
      story: [
        "Market and trend analysis: I monitored trending topics, viral formats and high-performing content in the channel's niche, analysed competitor channels and audience engagement, and turned those insights into video concepts. The proposals combined trending themes with original angles and went to the production team as directions for filming and editing.",
        'Content evaluation and channel optimisation: I reviewed drafts for clarity, pacing and engagement, checked each video against the content strategy, and managed publishing with optimised titles and descriptions. This helped the channel reach 446,065 organic views in its first month.',
        'Employer branding on TikTok: I helped develop short-form video ideas showing daily work life and team culture, and appeared on screen in several of them.',
        "Internal events: I helped organise department events such as Boy's Day. I brainstormed activities, set up and decorated the space, and hosted as MC.",
      ],
    },
    {
      id: 'meraces',
      company: 'Meraces Limited Company',
      title: 'Content Marketing Intern',
      // TODO(dates)
      bullets: [
        'Produced an average of 4 videos or visual posts per day for Facebook, Instagram, TikTok and YouTube.',
        "Built a YouTube channel for a company project, reaching 128,552 organic views in its first month.",
        'Ran a recruitment campaign that drew 100+ applicants per round, shortlisted 15+ candidates and helped hire 5.',
      ],
      metrics: [
        { value: '128,552', label: 'organic views, month one' },
        { value: '100+', label: 'CVs in one round' },
        { value: '5', label: 'hires' },
      ],
      photos: [
        { src: meracesYtStats, alt: 'YouTube analytics: the channel got 128,552 views in the selected period' },
        { src: meracesThreads, alt: 'Job post on Threads for Meraces' },
        { src: meracesShorts, alt: 'Short-form video produced for Meraces' },
      ],
      story: [
        'Short-form content: I created videos mainly for TikTok and YouTube Shorts. Before producing, I researched related keywords to see what was trending, tested different styles, then focused on the formats with the highest engagement.',
        'Onboarding and events: I ran onboarding sessions for new interns, introducing company policies and guiding them through their first tasks. I also helped organise Happy Hour, Halloween and Year-End Party events to build team spirit.',
        'Recruitment: I wrote and posted job ads, screened CVs, contacted candidates, scheduled interviews and kept applicants updated. Threads proved especially effective: one round brought in 100+ CVs, from which we interviewed 15+ strong candidates and hired 5.',
      ],
    },
  ],

  events: [
    {
      title: 'Company Trip · Ha Long',
      org: 'MOR Software',
      caption: 'Three branches, three days of team-building and an evening gala.',
      photo: { src: morTripGroup, alt: 'MOR Software employees gathered under a team-building arch on the beach' },
    },
    {
      title: '8th Anniversary',
      org: 'MOR Software',
      caption: 'Games, vendors and photo/video coverage for the company birthday.',
      photo: { src: morBirthday, alt: 'Four colleagues posing at the "Dream of Infinity" anniversary backdrop' },
    },
    {
      title: 'Sports Games · MC',
      org: 'MOR Software',
      caption: 'Hosted the internal sports tournaments.',
      photo: { src: morSportsMc, alt: 'Thuy Anh speaking into a microphone as MC' },
    },
    {
      title: 'Pickleball Season 1',
      org: 'MOR Software',
      caption: 'Internal sports tournament: supported the organisation and hosted as MC.',
      photo: { src: morPickleball, alt: 'Players posing at the MOR Pickleball Season 1 tournament' },
    },
    {
      title: 'Ha Long departure',
      org: 'MOR Software',
      caption: 'Getting three branches on the road together.',
      photo: { src: morTripStreet, alt: 'Employees with suitcases gathering before the company trip' },
    },
    {
      title: "Boy's Day",
      org: 'Future Media',
      caption: 'Brainstormed activities, decorated the space and hosted as MC.',
      photo: { src: fmBoysday1, alt: "Colleagues celebrating Boy's Day with balloons and photo cut-outs" },
    },
    {
      title: "Boy's Day",
      org: 'Future Media',
      caption: 'A small department event with a big atmosphere.',
      photo: { src: fmBoysday2, alt: "Team gathered around a decorated whiteboard for Boy's Day" },
    },
  ],

  videos: [
    {
      title: 'Personal edits',
      kind: 'file',
      src: '/video/edits.mp4',
      poster: '/video/edits.jpg',
      caption: 'Aesthetic edits, cinematic moments and lighthearted clips.',
    },
    {
      title: 'Dance',
      kind: 'file',
      src: '/video/dance.mp4',
      poster: '/video/dance.jpg',
      caption: 'Choreography I can bring to office celebrations and internal performances.',
    },
    {
      title: 'Workplace culture on TikTok',
      kind: 'tiktok',
      url: 'https://www.tiktok.com/@congsogenzchill/video/7569250303904648456?is_from_webapp=1&sender_device=pc',
      poster: { src: fmTiktok1, alt: 'TikTok video cover featuring Thuy Anh at the Future Media office' },
      caption: 'Future Media, on screen and behind the idea.',
    },
    {
      title: 'Team culture TikTok',
      kind: 'tiktok',
      url: 'https://www.tiktok.com/@congsogenzchill/video/7547702799019117845',
      poster: { src: fmTiktok3, alt: 'TikTok video cover from the Future Media office' },
      caption: 'Future Media employer branding.',
    },
    {
      title: 'YouTube channel · 6M+ views',
      kind: 'link',
      url: undefined, // TODO(link)
      poster: { src: fmYtStats, alt: 'YouTube analytics for the channel Thuy Anh managed' },
      caption: 'The 26K-subscriber channel I grew to 6M+ views in 5 months.',
    },
    {
      title: 'English vocab from movies',
      kind: 'link',
      url: undefined, // TODO(link)
      poster: { src: instaVocab, alt: 'Instagram page sharing English vocabulary learned from films' },
      caption: 'A personal Instagram project mixing language learning and film.',
    },
  ],

  photos: [
    { src: photo1, alt: 'Sunset over rooftops, photographed by Thuy Anh' },
    { src: photo2, alt: 'Street lamp glowing at dusk, photographed by Thuy Anh' },
  ],

  activities: [
    {
      title: 'FTU Buddy Program',
      role: 'Buddy · Event support',
      text: 'Supported international students at Foreign Trade University with paperwork, housing and settling into life in Vietnam, and helped the International Office run orientation days, welcome and farewell parties, city tours and cultural exchanges.',
      photo: { src: buddy1, alt: 'International students and buddies at an FTU event' },
    },
    {
      title: 'FTU Buddy Program · Orientation',
      role: 'Event organiser',
      text: 'Orientation days, welcome parties and cultural exchange activities for incoming international students.',
      photo: { src: buddy2, alt: 'International students in a classroom during orientation' },
    },
    {
      title: 'NDC Music Club',
      role: 'Head of Event Communications',
      text: 'Planned and led member recruitment campaigns, ran bonding events such as farewell parties and team-building, and coordinated communication for performances to keep members engaged.',
      photo: { src: ndcClub, alt: 'NDC Music Club members together after an event' },
    },
  ],

  education: [
    { school: 'Foreign Trade University', detail: 'International Business Administration', years: '2021 – 2025' },
    { school: 'Hallym University (Korea)', detail: 'Exchange student, English Language & Literature', years: '2022' },
  ],

  contact: {
    email: 'thuyanhphi.work@gmail.com',
    phone: '083-883-1319',
    cv: undefined, // TODO(cv)
  },
};

