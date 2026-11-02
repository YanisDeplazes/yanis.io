import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yanis.io',
  integrations: [sitemap()],
  output: 'static',
});
