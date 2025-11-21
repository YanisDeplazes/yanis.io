import { getCollection } from 'astro:content';

// Utility to get a sorted collection of work based on a condition
export const getSortedWork = async (filterCondition: (data: any) => boolean) => {
  const images = import.meta.glob<{ default: ImageMetadata }>(
    '/src/assets/images/**/*.{jpg,jpeg,png,webp}',
  );

  const resolveImage = async (url: string) => images[`/src/assets${url}`]?.();

  const getDateForSorting = (data: { start: Date; end?: Date }) => {
    const dateString =
      data.start instanceof Date ? data.start.toISOString() : data.start;
    const untilString =
      data.end instanceof Date ? data.end.toISOString() : data.end;
    return new Date(untilString || dateString).getTime();
  };

  const work = (await getCollection('work'))
    .filter(({ data }) => filterCondition(data))
    .sort((a, b) => getDateForSorting(b.data) - getDateForSorting(a.data));

  return Promise.all(
    work.map(async ({ data, slug }) => ({
      slug,
      start: data.start,
      title: data.title,
      type: data.type.join(', '),
      ongoing: data.ongoing,
      end: data.end ? data.end : undefined,
      resolvedThumbnail: data.thumbnail
        ? (await resolveImage(data.thumbnail))?.default
        : undefined,
    }))
  );
};
