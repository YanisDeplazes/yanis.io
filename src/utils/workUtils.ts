import { getCollection, type CollectionEntry, getEntry } from 'astro:content';
import { resolveImage } from './media';
import { formatList, formatYears } from './format';

export type WorkEntry = CollectionEntry<'work'>;
type WorkData = WorkEntry['data'];
export type Category = WorkData['category'];
export type GalleryBlock = WorkData['gallery'][number];

/** Labels and display order, used by menus and filters */
export const categories: { value: Category; label: string }[] = [
  { value: 'reportage', label: 'Reportage' },
  { value: 'collection', label: 'Collections' },
  { value: 'event', label: 'Events' },
  { value: 'design-research', label: 'Design & Research' },
  { value: 'technology', label: 'Technology' },
];

export const getCategoryLabel = (category: Category) =>
  categories.find((c) => c.value === category)?.label ?? category;

export type Topic = WorkData['topics'][number];

/** Themes that cut across categories, used by the home page links */
export const topics: { value: Topic; label: string }[] = [
  { value: 'social-movements', label: 'Social movements' },
  { value: 'subcultures', label: 'Subcultures' },
  { value: 'everyday-life', label: 'Everyday life' },
];

/** Newest first: by end date, or start date when there is none */
const sortDate = (data: WorkData) => (data.end ?? data.start).getTime();

/** Safe even when an entry was cached before `topics` existed */
export const hasTopic = (data: WorkData, topic: Topic) => (data.topics ?? []).includes(topic);

/** Every entry that gets a page: everything except drafts */
export const getPublished = async () =>
  (await getCollection('work')).filter(({ data }) => !data.draft);

/**
 * Entries for listings, newest first. Hidden entries are left out
 * unless includeHidden is set (their pages still exist).
 */
export const getWork = async (
  filter: (data: WorkData) => boolean = () => true,
  { includeHidden = false }: { includeHidden?: boolean } = {},
) =>
  (await getPublished())
    .filter(({ data }) => (includeHidden || !data.hidden) && filter(data))
    .sort((a, b) => sortDate(b.data) - sortDate(a.data));

/** Everything a listing needs, with the thumbnail resolved */
export const toListItem = async ({ id, data }: WorkEntry) => ({
  slug: id,
  title: data.title,
  description: data.description,
  category: data.category,
  categoryLabel: getCategoryLabel(data.category),
  type: data.type.join(', '),
  start: data.start,
  end: data.end,
  ongoing: data.ongoing,
  years: formatYears(data),
  location: formatList(data.location),
  client: data.client,
  institution: data.institution,
  topics: data.topics ?? [],
  series: data.series,
  /** Title of the collection it belongs to, e.g. "Groundswell" */
  seriesTitle: data.series ? (await getEntry('work', data.series))?.data.title : undefined,
  thumbnail: await resolveImage(data.thumbnail),
});

export type WorkItem = Awaited<ReturnType<typeof toListItem>>;

export const getSortedWork = async (
  ...args: Parameters<typeof getWork>
): Promise<WorkItem[]> => Promise.all((await getWork(...args)).map(toListItem));

// ----- Named helpers -----
export const getSelected = () => getSortedWork((data) => data.selected);

export const getReportage = () => getSortedWork((data) => data.category === 'reportage');

/** The reportage page: the stories marked `featured`, or all of them while none are */
export const getFeaturedReportage = async () => {
  const all = await getReportage();
  const featured = (await getWork((data) => data.category === 'reportage' && data.featured)).map(
    ({ id }) => id,
  );
  return { stories: featured.length ? all.filter(({ slug }) => featured.includes(slug)) : all, total: all.length };
};

/** The stories filed under a collection, e.g. every day of Groundswell */
export const getSeriesParts = (series: string) => getSortedWork((data) => data.series === series);

/** The archive holds everything: every story, every event, and the collections that group them */
export const getArchive = () => getSortedWork();

// ----- Gallery block helpers -----
export const isChapter = (block: GalleryBlock): block is Extract<GalleryBlock, { chapter: string }> =>
  'chapter' in block;
export const isText = (block: GalleryBlock): block is Extract<GalleryBlock, { text: string }> =>
  'text' in block && !('chapter' in block);
export const isImage = (block: GalleryBlock): block is Extract<GalleryBlock, { image: string }> =>
  'image' in block;
export const isVideo = (block: GalleryBlock): block is Extract<GalleryBlock, { video: string }> =>
  'video' in block;
