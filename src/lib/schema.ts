/**
 * JSON-LD for the Restaurant (schema.org). Intentionally NO aggregateRating
 * or Review markup: self-serving review markup violates Google's guidelines.
 */
import { business } from '../data/business';
import { categories, menuByCategory } from '../data/menu';
import { SITE_URL } from '../config/site';

const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export function restaurantSchema() {
  const url = new URL('/', SITE_URL).href;

  // Group weekdays with identical hours. A shift that closes after midnight keeps
  // its "closes" time (e.g. Friday opens 08:00, closes 01:00), as Google documents.
  const groups = new Map<string, string[]>();
  for (const d of [1, 2, 3, 4, 5, 6, 0] as const) {
    const h = business.hours[d];
    const key = `${h.open}-${h.close}`;
    groups.set(key, [...(groups.get(key) ?? []), DAY[d]]);
  }
  const openingHoursSpecification = [...groups].map(([key, days]) => {
    const [opens, closes] = key.split('-');
    return { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens, closes };
  });

  const hasMenu = {
    '@type': 'Menu',
    '@id': `${url}#meni`,
    url: `${url}#meni`,
    name: 'Meni',
    inLanguage: 'sr-Latn',
    hasMenuSection: categories
      .map((c) => ({ c, items: menuByCategory(c.id) }))
      .filter(({ items }) => items.length)
      .map(({ c, items }) => ({
        '@type': 'MenuSection',
        name: c.label,
        hasMenuItem: items.map((it) => ({
          '@type': 'MenuItem',
          name: it.name,
          ...(it.description ? { description: it.description } : {}),
          ...(it.tags.includes('vege') ? { suitableForDiet: 'https://schema.org/VegetarianDiet' } : {}),
          ...(it.price !== null
            ? { offers: { '@type': 'Offer', price: String(it.price), priceCurrency: 'RSD' } }
            : {}),
        })),
      })),
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${url}#restaurant`,
    name: business.name,
    alternateName: business.shortName,
    slogan: business.tagline,
    url,
    image: [new URL('/og-image.jpg', SITE_URL).href],
    logo: new URL('/logo.png', SITE_URL).href,
    telephone: business.phone.international.replace(/\s/g, ''),
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: business.geo.lat, longitude: business.geo.lng },
    hasMap: business.links.googleMaps,
    servesCuisine: ['Italian', 'Pasta'],
    priceRange: '1000–1500 RSD',
    currenciesAccepted: 'RSD',
    acceptsReservations: true,
    openingHoursSpecification,
    hasMenu,
    sameAs: [business.links.instagram, business.links.facebook, business.links.wolt],
  };
}
