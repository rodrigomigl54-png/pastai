# Pastai Bar & Restaurant — website

Static, mobile-first one-page site built with Astro. Work is delivered in phases;
the full README (editing the menu, events, prices, TODO list, deployment) lands in phase 7.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + static build -> dist/
npm test           # vitest
npm run fonts      # rebuild font subsets (needs: pip install fonttools brotli)
npm run logo       # re-trace the logo SVG from src/assets/raw/logo-original.jpg
```

- Site URL: `src/config/site.ts` → `SITE_URL`
- Business data: `src/data/business.ts`
- Design tokens: `src/styles/tokens.css`
- Phase 1 asset audit & intro storyboard (Serbian): `docs/faza-1-revizija.md`
