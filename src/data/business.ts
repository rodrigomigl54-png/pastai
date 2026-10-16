/**
 * Verified business data for Pastai Bar & Restaurant.
 * Source: owner brief (Google Business profile + Wolt listing).
 * Do not add anything here that has not been confirmed by the owner.
 */

/** 0 = nedelja (Sunday) … 6 = subota (Saturday), matching Date#getDay(). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DayHours = {
  /** Opening time, "HH:MM", Europe/Belgrade. */
  open: string;
  /** Closing time, "HH:MM". If `closesNextDay` it belongs to the following calendar day. */
  close: string;
  closesNextDay: boolean;
};

export const business = {
  name: 'Pastai Bar & Restaurant',
  shortName: 'Pastai',
  /** The restaurant's own tagline (from Wolt). */
  tagline: 'Najoriginalniji ukusi paste',
  cuisine: 'Italijanski restoran / pasta bar',

  address: {
    street: 'Trg republike 18',
    postalCode: '21000',
    city: 'Novi Sad',
    district: 'Stari Grad',
    country: 'RS',
    /** Human context shown next to the address. */
    note: 'u sklopu Riblje pijace',
  },
  geo: { lat: 45.25753, lng: 19.849956 },
  plusCode: '7R5X+2X Novi Sad',

  phone: {
    display: '063 701 9741',
    international: '+381 63 701 9741',
    tel: 'tel:+381637019741',
    whatsapp: 'https://wa.me/381637019741',
    /** Digits only, for wa.me deep links with ?text= */
    whatsappNumber: '381637019741',
  },

  priceRange: { min: 1000, max: 1500, currency: 'RSD', label: '1.000–1.500 RSD po osobi' },

  /** Opening hours per weekday (Europe/Belgrade). Index = Date#getDay(). */
  hours: {
    1: { open: '08:00', close: '23:00', closesNextDay: false }, // ponedeljak
    2: { open: '08:00', close: '23:00', closesNextDay: false }, // utorak
    3: { open: '08:00', close: '23:00', closesNextDay: false }, // sreda
    4: { open: '08:00', close: '23:00', closesNextDay: false }, // četvrtak
    5: { open: '08:00', close: '01:00', closesNextDay: true }, // petak -> subota 01:00
    6: { open: '08:00', close: '01:00', closesNextDay: true }, // subota -> nedelja 01:00
    0: { open: '08:00', close: '23:00', closesNextDay: false }, // nedelja
  } satisfies Record<Weekday, DayHours>,

  services: [
    'Obrok u restoranu',
    'Za poneti',
    'Dostava (Wolt)',
    'Bašta',
    'Prijateljski nastrojeno prema LGBTQ+ osobama',
  ],

  links: {
    wolt: 'https://wolt.com/sr/srb/novi_sad/restaurant/bistro-pastai',
    instagram: 'https://www.instagram.com/pastai.ns/',
    facebook: 'https://www.facebook.com/PastaiNoviSad/',
    googleMaps: 'https://www.google.com/maps/search/?api=1&query=45.25753%2C19.849956',
  },

  googleRating: {
    value: 4.4,
    count: 505,
    /** Date the rating/count were copied from Google. Update together with the numbers. */
    lastUpdated: '2026-10-16',
  },
} as const;

export const weekdayNames: Record<Weekday, string> = {
  1: 'Ponedeljak',
  2: 'Utorak',
  3: 'Sreda',
  4: 'Četvrtak',
  5: 'Petak',
  6: 'Subota',
  0: 'Nedelja',
};

/** Monday-first display order used by the hours table. */
export const weekOrder: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
