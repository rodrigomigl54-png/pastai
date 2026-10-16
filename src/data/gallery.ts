/**
 * Gallery photos (files in src/assets/photos, upscaled 4x from small sources —
 * replace with originals of the same name when available).
 * `alt` is descriptive Serbian text of what is visible.
 */
export type GalleryPhoto = { file: string; alt: string };

export const gallery: GalleryPhoto[] = [
  { file: 'taljatele-meso-pecurke', alt: 'Taljatele sa komadićima mesa, pečurkama i sušenim paradajzom, posute rendanim sirom' },
  { file: 'enterijer-separe', alt: 'Enterijer restorana Pastai: separe sa šarenim tekstilom, drveni stolovi i pletene lampe' },
  { file: 'crna-pasta-dagnje', alt: 'Crna pasta sa dagnjama, kriškom limuna i peršunom' },
  { file: 'rendanje-sira', alt: 'Rendanje sira preko tanjira sveže paste' },
  { file: 'zelene-taljatele-gnezda', alt: 'Gnezda zelenih taljatela od spanaća na crnom tanjiru' },
  { file: 'pasta-brokoli', alt: 'Pasta u krem sosu sa brokolijem' },
  { file: 'maslinovo-ulje-pasta', alt: 'Prelivanje maslinovog ulja preko tanjira paste' },
  { file: 'pakovana-pasta', alt: 'Pakovana domaća pasta sa Pastai etiketom' },
  { file: 'sendvic-povrce', alt: 'Sendvič sa grilovanim povrćem i rukolom na drvenoj dasci' },
  { file: 'pasta-plavi-tanjir', alt: 'Pasta sa mesom na plavo-belom tanjiru, na drvenom stolu' },
  { file: 'biftek-rukola', alt: 'Isečeno meso sa rukolom, čeri paradajzom i krompirom' },
  { file: 'salata-avokado-pomorandza', alt: 'Salata sa avokadom, pomorandžom i cveklom' },
  { file: 'penne-sto', alt: 'Pene sa mesom u tanjiru na stolu sa šarenim stolnjakom' },
];

/** Garden photo slot — TODO: add a real photo of the garden (file name). */
export const gardenPhoto: string | null = null;

/** "Ludi Sremac" photo slot — TODO: add a real photo of the dish (file name). */
export const specialtyPhoto: string | null = null;
