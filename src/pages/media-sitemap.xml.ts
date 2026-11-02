// /media-sitemap.xml: every photograph, per project page, so they can show up in image search.
// The page sitemap itself comes from @astrojs/sitemap (sitemap-index.xml).
// Hidden projects are left out (their pages carry noindex).
import type { APIRoute } from 'astro';
import { getWork, isImage } from '../utils/workUtils';
import { resolveImage } from '../utils/media';
import { absoluteUrl } from '../utils/seo';

export const GET: APIRoute = async () => {
  const work = await getWork();

  const pages = await Promise.all(
    work.map(async ({ id, data }) => {
      const paths = [data.thumbnail, ...data.gallery.filter(isImage).map((block) => block.image)];
      const images = await Promise.all(paths.map((path) => resolveImage(path)));
      const urls = [...new Set(images.filter((image) => image).map((image) => absoluteUrl(image!.src)))];
      return { loc: absoluteUrl(`/work/${id}`), urls };
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages
  .filter(({ urls }) => urls.length > 0)
  .map(
    ({ loc, urls }) => `  <url>
    <loc>${loc}</loc>
${urls.map((url) => `    <image:image><image:loc>${url}</image:loc></image:image>`).join('\n')}
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
