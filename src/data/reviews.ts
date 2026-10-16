/**
 * Real Google reviews, verbatim, in their original language.
 * Do NOT add aggregateRating/Review structured data for these (self-serving
 * review markup violates Google's guidelines).
 */
export type Review = { author: string; text: string; lang: string };

export const reviews: Review[] = [
  {
    author: 'Miljan Stamenković',
    text: 'Најбољи локал у Новом Саду што се тиче пасте. Особље веома љубазно. Све похвале, вратићу се опет! ❤️',
    lang: 'sr-Cyrl',
  },
  {
    author: 'Jovana Novakov',
    text: 'Excellent homemade pasta and garden setting, a beautiful experience, we will definitely come back!',
    lang: 'en',
  },
  {
    author: 'Đorđe Dašić',
    text: 'Everything best for this place all 5 stars',
    lang: 'en',
  },
];
