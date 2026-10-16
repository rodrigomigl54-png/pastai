// Generates favicons, app icons, the JSON-LD logo and the 1200×630 Open Graph
// image from the vector logo, the dough texture and a dish photo.
// Usage: node scripts/make-brand-assets.mjs   (outputs into public/)
// The OG text uses Fraunces/Manrope; install them for fontconfig first
// (see README) or the text falls back to a system serif/sans.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const OUT = 'public';
const INK = '#121110';
const DOUGH = '#F2E8D5';
const BASIL_ON_INK = '#7FA877';

const raw = await readFile('src/assets/brand/logo-parts.svg', 'utf8');
const parts = Object.fromEntries([...raw.matchAll(/data-part="(\w+)"[^>]*\sd="([^"]+)"/g)].map((m) => [m[1], m[2]]));
const dough = await readFile('src/assets/texture/dough.webp');
const doughPng = (await sharp(dough).png().toBuffer()).toString('base64');

const doughPattern = (id, size) =>
  `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${size}" height="${size}"><image href="data:image/png;base64,${doughPng}" width="${size}" height="${size}"/></pattern>`;

/** Full logo group in logo units (1804 × 1772). */
const logoGroup = ({ color = DOUGH, emblem = BASIL_ON_INK, swoosh = 'url(#dl)', full = true } = {}) => `
  ${full ? `<path fill="${emblem}" fill-rule="evenodd" d="${parts.emblem}"/>` : ''}
  <path fill="${color}" fill-rule="evenodd" d="${parts.wordmark}"/>
  <path fill="rgba(0,0,0,.35)" d="${parts.swoosh}" transform="translate(10 22)"/>
  <path fill="${swoosh}" fill-rule="evenodd" d="${parts.swoosh}"/>
  ${full ? `<path fill="${color}" fill-rule="evenodd" d="${parts.year}"/><path fill="${color}" fill-rule="evenodd" d="${parts.handmade}"/>` : ''}`;

// ---- Favicon (emblem only: legible at 16–32 px) -----------------------------
// Emblem bbox in logo units ≈ x 686–1177, y 50–349.
const emblemSvg = (size, radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <rect width="64" height="64" rx="${radius}" fill="${INK}"/>
  <g transform="translate(8.5 16.5) scale(${47 / 491}) translate(-686 -50)"><path fill="${DOUGH}" fill-rule="evenodd" d="${parts.emblem}"/></g>
</svg>`;
await writeFile(`${OUT}/favicon.svg`, emblemSvg(64, 14));
await sharp(Buffer.from(emblemSvg(32, 14))).png().toFile(`${OUT}/favicon-32.png`);

// ---- App icons (emblem + wordmark + swoosh) ------------------------------------
const appIcon = (size, pad) => {
  const inner = size * (1 - pad * 2);
  const scale = inner / 1804;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>${doughPattern('dl', 900)}</defs>
  <rect width="${size}" height="${size}" fill="${INK}"/>
  <g transform="translate(${size * pad} ${(size - 1300 * scale) / 2 - 30 * scale}) scale(${scale})">${logoGroup({ full: false }).replace(
    '<path fill="' + DOUGH,
    `<path fill="${BASIL_ON_INK}" fill-rule="evenodd" d="${parts.emblem}" transform="translate(0 40)"/><path fill="${DOUGH}`,
  )}</g></svg>`;
};
await sharp(Buffer.from(appIcon(180, 0.12))).png().toFile(`${OUT}/apple-touch-icon.png`);
await sharp(Buffer.from(appIcon(192, 0.12))).png().toFile(`${OUT}/icon-192.png`);
await sharp(Buffer.from(appIcon(512, 0.12))).png().toFile(`${OUT}/icon-512.png`);
await sharp(Buffer.from(appIcon(512, 0.2))).png().toFile(`${OUT}/icon-maskable-512.png`);

// ---- Logo for structured data (dark on light) ----------------------------------
const logoLight = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="590" viewBox="-20 -20 1844 1812">
  <defs>${doughPattern('dl', 900)}</defs><rect x="-20" y="-20" width="1844" height="1812" fill="#ffffff"/>
  ${logoGroup({ color: INK, emblem: '#3E6B3A', swoosh: '#C63A22' })}</svg>`;
await sharp(Buffer.from(logoLight)).png().toFile(`${OUT}/logo.png`);

// ---- Open Graph 1200 × 630 ----------------------------------------------------------
const W = 1200;
const H = 630;
const photo = await sharp('src/assets/photos/crna-pasta-dagnje.jpg')
  .resize(470, 600, { fit: 'cover', position: 'attention' })
  .modulate({ brightness: 1.02, saturation: 1.05 })
  .jpeg({ quality: 90 })
  .toBuffer();
const photoB64 = photo.toString('base64');
const logoScale = 330 / 1804;
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    ${doughPattern('dl', 1100)}${doughPattern('dr', 256)}
    <clipPath id="arch"><path d="M690 615V250a235 235 0 0 1 470 0v365z"/></clipPath>
    <filter id="sh" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity=".5"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <image href="data:image/jpeg;base64,${photoB64}" x="690" y="15" width="470" height="600" clip-path="url(#arch)" preserveAspectRatio="xMidYMid slice"/>
  <path d="M-20 600C160 540 330 640 520 590S800 470 1000 540 1170 640 1240 600" fill="none" stroke="url(#dr)" stroke-width="26" stroke-linecap="round" filter="url(#sh)"/>
  <g transform="translate(70 36) scale(${logoScale})">${logoGroup()}</g>
  <text x="76" y="410" font-family="Fraunces" font-size="42" fill="${DOUGH}">Domaća pasta</text><text x="76" y="460" font-family="Fraunces" font-size="42" fill="${DOUGH}">u centru Novog Sada</text>
  <text x="78" y="506" font-family="Manrope" font-weight="600" font-size="22" letter-spacing="2" fill="${BASIL_ON_INK}">TRG REPUBLIKE 18 · RIBLJA PIJACA</text>
</svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 86, mozjpeg: true }).toFile(`${OUT}/og-image.jpg`);
console.log('brand assets written to public/');
