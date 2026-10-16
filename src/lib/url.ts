/**
 * Base-path aware URLs. The site normally lives at the domain root, but a
 * preview build (GitHub Pages) is served from /pastai/ — set via BASE_PATH.
 */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** "/og-image.jpg" -> "/pastai/og-image.jpg" on a sub-path build. */
export const withBase = (path: string) => `${base}/${path.replace(/^\//, '')}`;

/** Absolute URL on the configured site (canonical, OG, JSON-LD, robots). */
export const absoluteUrl = (path: string) => new URL(withBase(path), import.meta.env.SITE).href;

/** Preview builds (PUBLIC_PREVIEW=1) are kept out of search engines. */
export const IS_PREVIEW = import.meta.env.PUBLIC_PREVIEW === '1';
