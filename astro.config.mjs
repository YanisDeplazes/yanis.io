import { defineConfig } from 'astro/config';
import events from './src/data/events.json'; // Ensure this path is correct

// https://astro.build/config
export default defineConfig({
  site: 'https://yanis.io',
  output: 'static',
});
