// Vectorises the supplied raster logo (451x443 JPEG) into a clean SVG.
// The raster is only upscaled *internally* as tracing input (smoother Bézier
// fitting); nothing upscaled is ever shown on the site.
// Usage: node scripts/trace-logo.mjs
import sharp from 'sharp';
import potrace from 'potrace';
import { writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const SRC = 'src/assets/raw/logo-original.jpg';
const OUT = 'src/assets/brand/logo.svg';
const SCALE = 4;

const meta = await sharp(SRC).metadata();
const input = await sharp(SRC)
  .resize(meta.width * SCALE, meta.height * SCALE, { kernel: 'lanczos3' })
  .greyscale()
  .blur(1.2)
  .threshold(150)
  .png()
  .toBuffer();

const trace = promisify(potrace.trace);
let svg = await trace(input, {
  threshold: 128,
  turdSize: 40,
  optTolerance: 0.35,
  alphaMax: 1.0,
  color: 'currentColor',
  background: 'transparent',
});

// Normalise to the original coordinate system and make it themeable.
const w = meta.width * SCALE;
const h = meta.height * SCALE;
svg = svg
  .replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor" role="img" aria-label="Pastai">`)
  .replace(/ fill="currentColor"(?=[^>]*\/>)/g, '')
  .replace(/<rect[^>]*transparent[^>]*\/>/, '');
// Integer precision in the 4x space = 0.25px of the original: visually lossless.
svg = svg.replace(/(\d+)\.\d+/g, "$1");
await writeFile(OUT, svg);
console.log(`${OUT}: ${(svg.length / 1024).toFixed(1)} KB`);

// --- Split into named, individually animatable parts -----------------------
// Sub-paths are classified by bounding box (coordinates in the 4x space).
// Holes (counters of a, P...) sit inside their letter's box, so they follow it.
const d = svg.match(/ d="([^"]*)"/)[1];
const subs = d.split(/(?=M )/).map((s) => s.trim()).filter(Boolean);
const bbox = (s) => {
  const n = s.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const xs = n.filter((_, i) => i % 2 === 0);
  const ys = n.filter((_, i) => i % 2 === 1);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
};
const groups = { emblem: [], wordmark: [], swoosh: [], year: [], handmade: [] };
for (const s of subs) {
  const b = bbox(s);
  if (b.y1 < 360) groups.emblem.push(s);
  else if (b.x1 - b.x0 > 1000 && b.y1 - b.y0 < 300) groups.swoosh.push(s);
  else if (b.y0 < 1240) groups.wordmark.push(s);
  else if (b.y0 < 1450) groups.year.push(s);
  else groups.handmade.push(s);
}
const parts = Object.entries(groups)
  .map(([id, ps]) => `  <path data-part="${id}" fill-rule="evenodd" d="${ps.join(' ')}"/>`)
  .join('\n');
const partsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor">\n${parts}\n</svg>\n`;
await writeFile('src/assets/brand/logo-parts.svg', partsSvg);
console.log(
  'logo-parts.svg:',
  Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])),
);
