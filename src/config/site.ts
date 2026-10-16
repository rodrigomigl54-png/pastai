/**
 * Global site configuration. Change SITE_URL here only — it feeds Astro's
 * `site` option (canonical URLs, sitemap, Open Graph) and the JSON-LD.
 */
export const SITE_URL = 'https://www.pastai.rs'; // TODO: confirm final domain before launch

/** Render menu prices. Set to false to hide every price on the site. */
export const SHOW_PRICES = true;

/** Last reservable slot = closing time minus this many minutes. */
export const LAST_RESERVATION_OFFSET_MIN = 60;

/** Reservation time-slot step, in minutes. */
export const RESERVATION_SLOT_STEP_MIN = 30;

/** All "open now" and reservation logic runs in the restaurant's timezone. */
export const TIMEZONE = 'Europe/Belgrade';
