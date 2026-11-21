// One place for who Yanis is and how to reach them.
// Used by the header, home page, info page, footer and search engine data.

export const site = {
  url: 'https://yanis.io',
  name: 'Yanis Deplazes',
};

export const profile = {
  name: 'Yanis Deplazes',
  role: 'Visual journalist & researcher',
  /** Short line next to the name in the header */
  tagline: 'Visual Journalist & Researcher',
  /** The front page statement, after the name */
  statement: 'exploring people and society through multimedia.',
  summary:
    'Visual journalist and researcher exploring people and society through multimedia, between the Netherlands and Switzerland. Information Design MA at Design Academy Eindhoven, in computer science since 2016.',
  email: 'work@yanis.io',

  // Where editors can find you: working between two countries
  location: {
    /** "Between the Netherlands and Switzerland" */
    text: 'the Netherlands and Switzerland',
    /** Under the name in the header */
    label: 'Based in the Netherlands',
    countries: [
      { name: 'Netherlands', code: 'NL' },
      { name: 'Switzerland', code: 'CH' },
    ],
  },
  /** Regions you cover on short notice */
  coverage: ['Netherlands', 'Belgium', 'France', 'Switzerland'],

  agency: {
    name: 'Hans Lucas',
    href: 'https://hanslucas.com/ydeplazes/photo',
    /** Every published piece, kept up to date by the agency */
    tearsheets: 'https://hanslucas.com/ydeplazes/tearsheet',
  },
};

export const socials = [
  { name: 'Instagram', href: 'https://www.instagram.com/yanisdeplazes/' },
  {
    name: 'Signal',
    href: 'https://signal.me/#eu/WTYbqUCFw4UvJvImlzKoe5HkyYTBJSPaBvZ8KyKYhqoAs4Ie6UlCZ70oG0Jzs2pL',
  },
  { name: 'GitHub', href: 'https://github.com/YanisDeplazes' },
  { name: 'Bluesky', href: 'https://bsky.app/profile/yanis.io' },
  { name: 'X', href: 'https://x.com/Yanis_Deplazes' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/yanis-deplazes/' },
];

/**
 * Outlets that have published my work, in the order they should be listed.
 * Just add a name; the articles themselves are tracked on Hans Lucas (profile.agency.tearsheets).
 */
export const outlets = [
  'Bloomberg',
  'The New York Times',
  'SRF',
  'Suspilne',
  'Luzerner Zeitung',
  'Urner Wochenblatt',
  'Ultra Sawt',
];

export const exhibitions = [
  {
    when: '2026',
    title: 'Social Footprints: Innocence and otherwise',
    where: 'Wanakam, Amsterdam',
    href: 'https://social-footprints.com/?artist=yanis-deplazes',
  },
  {
    when: '2025',
    title: 'Parallel Documentary Premiere',
    where: 'FC Hyena, Amsterdam',
  },
  { when: '2025', title: 'ECHO Recordings and AOS', where: 'OT301, Amsterdam' },
  { when: '2025', title: 'Disconnect', where: "MA'DAM, Amsterdam" },
];

export const education = [
  {
    when: '2026–2028',
    title: 'MA Information Design',
    where: 'Design Academy Eindhoven',
  },
  {
    when: '2023–2026',
    title: 'BSc Computer Science, Digital Ideation',
    where: 'Lucerne University of Applied Sciences and Arts',
  },
  {
    when: '2025',
    title: 'Internet of Things, exchange semester',
    where: 'Amsterdam University of Applied Sciences',
  },
  {
    when: '2018–2022',
    title: 'Mediamatics Technician EFZ with technical FVB',
    where: 'SBW Neue Medien',
  },
];

export const memberships = [
  { name: 'pool collective', href: 'https://poolcollective.ch/' },
  {
    name: 'thick collective',
    href: 'https://www.instagram.com/thick.collective/',
  },
  {
    name: 'Noise Collective',
    href: 'https://www.instagram.com/noise.collective/',
  },
];
