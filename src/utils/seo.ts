// Structured data (JSON-LD) so search engines understand who Yanis is and what each page shows.
// https://schema.org — validated shapes: Person, ImageGallery, NewsArticle, BreadcrumbList
import { education, memberships, profile, site, socials } from '../data/profile';

export const absoluteUrl = (path: string) => new URL(path, site.url).href;

const personId = `${site.url}/#person`;

/** Who Yanis is. Used on the home and info pages, referenced everywhere else. */
export const personSchema = (image?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': personId,
  name: profile.name,
  url: site.url,
  image: image ? absoluteUrl(image) : undefined,
  email: `mailto:${profile.email}`,
  jobTitle: ['Visual journalist', 'Researcher', 'Information designer', 'Developer'],
  description: profile.summary,
  // Works between two countries
  homeLocation: profile.location.countries.map(({ name, code }) => ({
    '@type': 'Country',
    name,
    identifier: code,
  })),
  memberOf: [
    { '@type': 'Organization', name: profile.agency.name, url: profile.agency.href },
    ...memberships.map(({ name, href }) => ({ '@type': 'Organization', name, url: href })),
  ],
  alumniOf: education.map(({ where }) => ({ '@type': 'EducationalOrganization', name: where })),
  knowsAbout: [
    'Photojournalism',
    'Documentary photography',
    'Social movements',
    'Information design',
    'Installation art',
    'Computer science',
    'Web development',
  ],
  sameAs: socials.filter(({ name }) => name !== 'Signal').map(({ href }) => href),
});

interface ProjectSchema {
  title: string;
  description: string;
  path: string;
  isNews: boolean;
  start: Date;
  end?: Date;
  location?: string;
  category: string;
  images: string[];
}

/** A project page: a news story for reportage, an image gallery for everything else */
export const projectSchema = ({
  title,
  description,
  path,
  isNews,
  start,
  end,
  location,
  category,
  images,
}: ProjectSchema) => ({
  '@context': 'https://schema.org',
  '@type': isNews ? 'NewsArticle' : 'ImageGallery',
  [isNews ? 'headline' : 'name']: title,
  description,
  url: absoluteUrl(path),
  image: images.map(absoluteUrl),
  author: { '@type': 'Person', '@id': personId, name: profile.name },
  [isNews ? 'datePublished' : 'dateCreated']: start.toISOString(),
  dateModified: (end ?? start).toISOString(),
  genre: category,
  contentLocation: location ? { '@type': 'Place', name: location } : undefined,
});

/** Home › Archive › Groundswell */
export const breadcrumbSchema = (trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(({ name, path }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: absoluteUrl(path),
  })),
});
