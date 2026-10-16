# Pastai Bar & Restaurant — website

Static, mobile-first one-page site for Pastai (Trg republike 18, Novi Sad), built with
**Astro 7** (static output), vanilla TypeScript islands and **GSAP**. All visible copy is
Serbian (Latin); code and docs are English.

Concept: **"Nit testa"**: one ribbon of fresh dough forms in the intro, settles into the
logo's swoosh and then runs through the whole page as a scroll-drawn thread.

## Quick start

```bash
nvm use            # Node 22.22+
npm install
npm run dev        # http://localhost:4321
npm test           # Vitest: open-now logic, reservation slots, WhatsApp encoding, prices
npm run build      # astro check + static build -> dist/
npm run preview    # serve dist/ locally
```

## Deploying (Hostinger / GoDaddy / any static host)

1. Set the real domain in `src/config/site.ts` → `SITE_URL` (canonical, sitemap, robots, OG, JSON-LD all follow).
2. `npm run build`
3. Upload the **contents** of `dist/` to the web root (`public_html/`).
4. Optional caching: files in `/_astro/` have hashed names, so serve them with
   `Cache-Control: public, max-age=31536000, immutable`. `index.html` should not be cached long.

## Editing content

| What | Where |
|---|---|
| Name, address, phone, hours, links, Google rating | `src/data/business.ts` |
| Menu (names, prices, tags, themes, descriptions, ingredients) | `src/data/menu.ts` |
| Hide all prices | `SHOW_PRICES` in `src/config/site.ts` |
| Reservation: last slot before closing, slot step | `LAST_RESERVATION_OFFSET_MIN`, `RESERVATION_SLOT_STEP_MIN` in `src/config/site.ts` |
| Events ("Večeri i događaji") | `src/data/events.ts` (section is hidden while the list is empty; a template is in the file) |
| Reviews (verbatim only) | `src/data/reviews.ts` |
| Gallery photos + alt text | `src/data/gallery.ts` (files in `src/assets/photos/`) |
| Garden / "Ludi Sremac" photo slots | `gardenPhoto`, `specialtyPhoto` in `src/data/gallery.ts` |
| Hero photo | `src/components/sections/hero-config.ts` |
| Owner's story ("O nama") | `ownerStory` in `src/components/sections/About.astro` |

**Menu items.** When the owner provides a `description` or `ingredients`, the card
automatically gets a "Sastojci" button and flips to show them. `theme.motifs` lists line-art
motifs (see `src/components/menu/motifs/names.ts`). Use only ingredients that are explicit
in the dish name. `motifs: null` gives the abstract dough theme. `published: false` hides an item.

**Google rating.** Update `googleRating.value`, `count` **and** `lastUpdated` together.
Never add `aggregateRating`/`Review` structured data (self-serving review markup is against
Google's guidelines).

**Photos.** Drop a higher-resolution original into `src/assets/photos/` under the **same
file name** and rebuild. AVIF/WebP, responsive widths (480…3840, capped at the source)
and blurred placeholders are generated automatically.

## Asset pipelines

| Command | What it does |
|---|---|
| `python3 scripts/upscale_images.py` | 4× neural upscaling (OpenCV EDSR) of `src/assets/raw/**` → `src/assets/photos/`. Model download is in the script header. |
| `python3 -I scripts/make_dough_texture.py` | Seamless dough texture (`src/assets/texture/dough.webp`), colour sampled from the real pasta photo. |
| `node scripts/make-brand-assets.mjs` | Favicons, app icons, `logo.png` and the 1200×630 OG image → `public/`. For the OG text, install Fraunces/Manrope TTFs into `~/.fonts`. |
| `npm run logo` | Re-trace the logo from `src/assets/raw/logo-original.jpg` → `src/assets/brand/`. |
| `npm run fonts` | Rebuild font subsets (Fraunces static cuts + Manrope variable; Latin core + Serbian diacritics). Needs `pip install fonttools brotli`. |
| `bash scripts/encode-video.sh media/raw/clip.mov` | AV1 + H.264 renditions (2160/1440/1080/720p + 9:16 1920/1280 for phones), no audio, AVIF poster → `public/video/`. `CROP_X=0.3` moves the portrait crop. Picker: `src/lib/video.ts`. |

## Architecture

```
src/
  config/site.ts            SITE_URL, SHOW_PRICES, reservation constants, timezone
  data/                     business, menu, events, reviews, gallery (single source of truth)
  lib/                      hours (open-now, slots), whatsapp, format, schema (JSON-LD), photos, video
  components/
    intro/                  overlay + GSAP timeline (ribbon, film strip, shared-element FLIP)
    thread/                 scroll thread geometry + ScrollTrigger (lazy-loaded)
    menu/                   cards, themes, motif sprite, aroma CSS, island script
    sections/               header, hero, about, specialty, gallery, garden, events,
                            reviews, reservation, delivery, location, footer, action bar
    ui/                     Logo (<use> refs), Photo (<picture>), DoughDefs, DoughNest, Icon
  styles/                   tokens (WCAG-checked colours), fonts, base
tests/                      Vitest suites
docs/faza-1-revizija.md     asset audit + intro storyboard (Serbian)
```

- **Open-now / hours** are always computed in `Europe/Belgrade`, including Fri/Sat shifts
  that close at 01:00 (Saturday 00:30 still counts as Friday's shift).
- **Intro** plays on every visit. Skip with "Preskoči", Esc or tap-and-hold. With
  `prefers-reduced-motion` it becomes a ~1.2 s crossfade. On low-power devices
  (`hardwareConcurrency ≤ 4`) the SVG filters are dropped. If the intro script ever fails,
  the page is revealed after 8 s.
- **Performance:** CSS inlined (~10 KB gz). Initial JS is ~37 KB gz (GSAP core included;
  ScrollTrigger loads lazily). The hero image is preloaded, and the menu and reservation
  islands initialise when they approach the viewport.

## Open TODOs (owner data still needed)

- [ ] **Domain**: confirm `SITE_URL` (placeholder `https://www.pastai.rs`).
- [ ] **Photos**: original, high-resolution photos. The current ones are 175 px thumbnails upscaled 4×.
- [ ] **Dough photo**: a real top-down photo of rolled egg dough (≥ 3000 px). It replaces the
      generated texture in `src/assets/texture/dough.webp`.
- [ ] **Vector logo** (AI/SVG/PDF), if it exists. The current one is traced from a 451 px JPEG.
- [ ] **Intro / hero videos**, if any: run `scripts/encode-video.sh`.
- [ ] **"O nama"**: the owner's own text (`ownerStory`).
- [ ] **Garden photo** (`gardenPhoto`).
- [ ] **"Ludi Sremac" photo** (`specialtyPhoto`), plus its description and ingredients.
- [ ] **Descriptions and ingredients** for every dish (all `null` now).
- [ ] **Ingredients to confirm** (abstract theme until then): Pašta pišta, Vege pasta, Ludi Sremac,
      Manje ludi Sremac, Pasta šuta, Vege raviole, Lee Chan.
- [ ] **Google-only items** (unpublished, `price: null`): Egs ala čif, Velika plata,
      Njoke sa piletinom i slaninom, Ne tako ludi Sremac, Ludi Sremac ½ porcije,
      Taške sa džemom od šljiva. Confirm or delete.
- [ ] **Bar menu**: Kafa, Vino, Pivo, Kokteli / Bar (`drinkGroupsTodo` in `menu.ts`).
- [ ] **Events**: add to `src/data/events.ts` when there are any.
- [ ] **Google rating**: refresh value, count and date before launch.
