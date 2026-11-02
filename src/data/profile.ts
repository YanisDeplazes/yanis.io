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
 * Every published piece, one entry per article. The same outlet can appear many times.
 * `project` links the article to a work entry (its slug); it then shows on that project page.
 * `show: false` keeps an entry on file without listing it.
 */
export const publications: {
  outlet: string;
  title: string;
  date?: string; // YYYY-MM-DD
  href: string;
  project?: string;
  show?: boolean;
}[] = [
  {
    outlet: 'The New York Times',
    title: 'Riots in Paris', // TODO: use the article's headline
    date: '2026-10-31',
    href: 'https://www.nytimes.com/2026/10/31/world/europe/france-riots-protests-paris-rue-beaurepaire.html',
    project: 'paris-riots-2026',
  },
  {
    outlet: 'Ultra Sawt',
    title: 'تجدد الاحتجاجات في دول أوروبية: أين وقعت وما تفاصيلها؟',
    href: 'https://www.ultrasawt.com/%D8%AA%D8%AC%D8%AF%D8%AF-%D8%A7%D9%84%D8%A7%D8%AD%D8%AA%D8%AC%D8%A7%D8%AC%D8%A7%D8%AA-%D9%81%D9%8A-%D8%AF%D9%88%D9%84-%D8%A3%D9%88%D8%B1%D9%88%D8%A8%D9%8A%D8%A9-%D8%A3%D9%8A%D9%86-%D9%88%D9%82%D8%B9%D8%AA-%D9%88%D9%85%D8%A7-%D8%AA%D9%81%D8%A7%D8%B5%D9%8A%D9%84%D9%87%D8%A7%D8%9F/%D8%A3%D8%BA%D9%8A%D8%AF-%D8%AD%D8%AC%D8%A7%D8%B2%D9%8A/%D8%B3%D9%8A%D8%A7%D9%82-%D9%85%D8%AA%D8%B5%D9%84/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9',
    project: 'groundswell', // TODO: move to the story it belongs to (collections don't list publications)
  },
  {
    outlet: 'SRF',
    title: 'Kräftemessen der Nachwuchshacker in Morges',
    date: '2024-07-16',
    href: 'https://www.srf.ch/news/schweiz/cybersecurity-statt-darknet-kraeftemessen-der-nachwuchshacker-in-morges',
  },
  {
    outlet: 'Luzerner Zeitung',
    title:
      'Ein Tag voller Kunst, Musik und guter Vibes: MSA Dayz gehen in die zweite Runde',
    href: 'https://www.luzernerzeitung.ch/zentralschweiz/uri/altdorf-ein-tag-voller-kunst-musik-und-guter-vibes-msa-dayz-gehen-in-die-zweite-runde-ld.2655098',
    project: 'msa-dayz',
  },
  {
    outlet: 'Urner Wochenblatt',
    title: 'Ein Urner rappt über sein bewegtes Leben',
    href: 'https://www.urnerwochenblatt.ch/artikel/ein-urner-rappt-ueber-sein-bewegtes-leben',
  },
  {
    outlet: 'Zsido.com',
    title: 'Párizsi zavargások',
    href: 'https://zsido.com/parizsi-zavargasok-chabad-rabbi-felgyujtott-autok/',
    show: false,
  },
  {
    outlet: 'Le Journal du Dimanche',
    title: 'Taxe émeutes',
    href: 'https://www.lejdd.fr/economie/taxe-emeutes-une-contribution-de-08-sur-les-assurances-dommages-des-2027-187170',
    show: false,
  },
];

/** Published pieces, newest first. Undated ones go last. */
export const getPublications = (project?: string) =>
  publications
    .filter(
      (item) => item.show !== false && (!project || item.project === project),
    )
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

/**
 * Outlet names for the info page, in order of the latest piece.
 * The articles themselves sit on their project pages; the full list lives on Hans Lucas.
 */
export const getOutlets = () => {
  const outlets = new Map<string, { outlet: string; count: number }>();
  for (const { outlet } of getPublications()) {
    const known = outlets.get(outlet);
    if (known) known.count += 1;
    else outlets.set(outlet, { outlet, count: 1 });
  }
  return [...outlets.values()];
};

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
