const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

(async () => {
  const { globby } = await import('globby');

  const DIST_DIR = './dist';
  const BASE_URL = 'https://yanis.io';
  const VALID_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];

  const hasValidExtension = (src) =>
    VALID_EXTENSIONS.some(ext => src.toLowerCase().includes(ext));

  const htmlFiles = await globby([`${DIST_DIR}/**/*.html`]);
  const sitemapEntries = [];

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);
    const relativePath = file.replace(`${DIST_DIR}`, '').replace(/\\/g, '/');

    const cleanPath = relativePath
      .replace(/index\.html$/, '')      // remove index.html
      .replace(/\.html$/, '')           // remove .html
      .replace(/\/$/, '') + '/';        // ensure trailing slash
    const pageUrl = `${BASE_URL}${cleanPath}`;

    const imageEntries = [];

    $('img, source').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      const alt = $(el).attr('alt') || '';

      if (
        src &&
        src.startsWith('/_astro/') &&
        hasValidExtension(src) &&
        !src.startsWith('data:') &&
        !src.startsWith('blob:') &&
        !src.startsWith('http')
      ) {
        imageEntries.push(`
      <image:image>
        <image:loc>${BASE_URL}${src}</image:loc>
        ${alt ? `<image:caption>${alt}</image:caption>` : ''}
      </image:image>`);
      }
    });

    const videoEntries = [];

    $('video').each((_, el) => {
      const $video = $(el);
      const $source = $video.find('source');
      const $track = $video.find('track');

      const src = $video.attr('src') || $source.attr('src');
      const poster = $video.attr('poster') || '';
      const label = $track.attr('label') || '';

      const title = label || 'Video';
      const description = label || 'Video content';
      if (
        src &&
        label &&
        !src.startsWith('data:') &&
        !src.startsWith('blob:')
      ) {
        const videoUrl = src.startsWith('http') ? src : `${BASE_URL}${src}`;
        const posterUrl = poster.startsWith('http') ? poster : `${BASE_URL}${poster}`;

        videoEntries.push(`
      <video:video>
        ${poster ? `<video:thumbnail_loc>${posterUrl}</video:thumbnail_loc>` : ''}
        <video:title><![CDATA[${title}]]></video:title>
        <video:description><![CDATA[${description}]]></video:description>
        <video:player_loc>${videoUrl}</video:player_loc>
      </video:video>`);
      }
    })

    if (imageEntries.length > 0 || videoEntries.length > 0) {
      sitemapEntries.push(`
  <url>
    <loc>${pageUrl}</loc>
    ${imageEntries.join('\n')}
    ${videoEntries.join('\n')}
  </url>`);

    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${sitemapEntries.join('\n')}
</urlset>`;


  fs.writeFileSync(path.join(DIST_DIR, 'media-sitemap.xml'), sitemap);
  console.log('Media sitemap generated');
})();
