/**
 * Build-time photo registry: maps a file name (without extension) in
 * src/assets/photos to its ImageMetadata, plus a tiny blurred LQIP data URI.
 */
import sharp from 'sharp';
import { join } from 'node:path';

const modules = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });

export const photos: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [path.split('/').pop()!.replace(/\.jpg$/, ''), mod.default]),
);

export function getPhoto(name: string): ImageMetadata {
  const img = photos[name];
  if (!img) throw new Error(`Unknown photo "${name}" (expected src/assets/photos/${name}.jpg)`);
  return img;
}

/** Responsive widths from the brief, capped at the source width. */
export const WIDTHS = [480, 768, 1080, 1440, 1920, 2560, 3840];
export const widthsFor = (img: ImageMetadata, max = Infinity) => {
  const cap = Math.min(img.width, max);
  const w = WIDTHS.filter((x) => x < cap);
  return [...w, cap];
};

const lqipCache = new Map<string, string>();
/** ~300-byte blurred placeholder, inlined as a background behind lazy images. */
export async function lqip(name: string): Promise<string> {
  const hit = lqipCache.get(name);
  if (hit) return hit;
  // Resolved from the project root: import.meta.url points into the build output after bundling.
  const file = join(process.cwd(), 'src/assets/photos', `${name}.jpg`);
  const buf = await sharp(file).resize(16, 16, { fit: 'inside' }).blur(0.6).webp({ quality: 40 }).toBuffer();
  const uri = `data:image/webp;base64,${buf.toString('base64')}`;
  lqipCache.set(name, uri);
  return uri;
}
