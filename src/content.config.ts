import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// ----- Gallery blocks: chapters, text, photographs and films, in reading order -----
const chapterBlock = z.object({
  chapter: z.string(),
  place: z.string().optional(), // "Paris, France"
  date: z.string().optional(), // "31 October 2026", written as it should read
  text: z.string().optional(), // blank lines start new paragraphs; inline HTML allowed
});

const textBlock = z.object({
  text: z.string(),
});

const imageBlock = z.object({
  image: z.string(), // path inside src/assets, e.g. /images/galleries/faces/1.jpg
  caption: z.string().optional(), // what we see: who, what, where
  alt: z.string().optional(), // only if it should differ from the caption
});

const videoBlock = z.object({
  video: z.string(),
  poster: z.string().optional(),
  caption: z.string().optional(),
  autoplay: z.boolean().default(false), // silent loop without controls
});

// ----- Projects -----
// Each file in src/content/work is one project; its `slug` in the frontmatter becomes the entry id
// and the URL (/work/<slug>).
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    start: z.date(),
    end: z.date().optional(),
    ongoing: z.boolean().default(false),
    category: z.enum(['reportage', 'collection', 'event', 'design-research', 'technology']),
    type: z.array(
      z.enum(['stills', 'moving', 'installation', 'hardware', 'system', 'web', 'game']),
    ),
    location: z.union([z.string(), z.array(z.string())]).optional(),
    client: z.string().optional(), // who it was made for, e.g. 'Chollerhalle'
    institution: z.string().optional(), // where it was made, e.g. a university
    topics: z.array(z.enum(['social-movements', 'subcultures', 'everyday-life'])).default([]),

    // A story filed under a collection: the collection's slug, e.g. 'groundswell'
    series: z.string().optional(),
    thumbnail: z.string().optional(),
    selected: z.boolean().default(false), // shown on the home page
    featured: z.boolean().default(false), // reportage: shown on the reportage page (all of it stays in the archive)
    storiesHeading: z.string().optional(),

    // Two ways to take a project off the site:
    hidden: z.boolean().default(false), // not listed anywhere, not in search engines, page still works via its link
    draft: z.boolean().default(false), // no page at all

    /** External links: website, code, film */
    links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),

    /** Extra lists on the project page, e.g. "Collaboration with", "Stack" */
    lists: z.array(z.object({ title: z.string(), items: z.array(z.string()) })).default([]),

    gallery: z.array(z.union([chapterBlock, textBlock, imageBlock, videoBlock])).default([]),

    /** Which gallery layout opens first */
    layout: z.enum(['grid', 'sheet']).optional(),
  }),
});

export const collections = { work };
