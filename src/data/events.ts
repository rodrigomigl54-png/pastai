/**
 * "Večeri i događaji". Every field is optional; the section is hidden
 * entirely while this list is empty.
 *
 * Template — copy, fill and uncomment:
 * {
 *   title: 'Veče svežih tagliatela',
 *   date: '2026-11-14',          // ISO YYYY-MM-DD
 *   time: '20:00',
 *   description: 'Kratak opis događaja.',
 *   image: 'enterijer-separe',   // file name (without .jpg) from src/assets/photos
 * },
 */
export type EventItem = {
  title?: string | null;
  date?: string | null;
  time?: string | null;
  description?: string | null;
  image?: string | null;
};

export const events: EventItem[] = [];
