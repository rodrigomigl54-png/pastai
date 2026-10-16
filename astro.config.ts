import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/config/site';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    // Hashed asset filenames live here -> long-term cacheable.
    assets: '_astro',
    // CSS is ~10 KB gzipped: inline it all so nothing blocks the first render.
    inlineStylesheets: 'always',
  },
  image: {
    // AVIF + WebP are produced per <Picture>; sharp is the default service.
    responsiveStyles: false,
  },
  vite: {
    build: {
      // Never base64-inline fonts into CSS: keep them as separate, cacheable files.
      assetsInlineLimit: (file: string) => (file.endsWith('.woff2') ? false : undefined),
    },
  },
  prefetch: false,
  devToolbar: { enabled: false },
});
