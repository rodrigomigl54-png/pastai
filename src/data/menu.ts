/**
 * Menu data. Names and prices come from the restaurant's Wolt listing
 * (priceSource: 'wolt'). Descriptions and ingredients are null until the owner
 * provides them — the card then flips automatically to show them.
 *
 * Motif rule: a motif may only show an ingredient that is explicit in the dish
 * name (or the universally defining element of a classic Italian name).
 * Dishes with no evident ingredients get `motifs: null` + an abstract theme.
 */
import type { MotifName } from '../components/menu/motifs/names';

export type Category = 'dorucak' | 'sendvici' | 'paste' | 'paste-vojvodjanski' | 'paste-more' | 'salate' | 'pice';
export type Tag = 'popularno' | 'vege' | 'specijalitet';
export type Aroma = 'steam' | 'poppy' | 'chili' | 'bubbles' | 'cheese' | 'sun' | 'herbs' | null;

export type MenuItem = {
  id: string;
  name: string;
  category: Category;
  price: number | null; // RSD
  priceSource: 'wolt' | 'restaurant' | null;
  description: string | null; // TODO from owner
  ingredients: string[] | null; // TODO from owner
  tags: Tag[];
  theme: { from: string; to: string; motifs: MotifName[] | null; aroma: Aroma };
  image: string | null;
  published: boolean;
  /** Optional drinks sub-group (Kafa, Vino, …). */
  group?: string;
};

export const categories: { id: Category; label: string }[] = [
  { id: 'dorucak', label: 'Doručak' },
  { id: 'sendvici', label: 'Sendviči' },
  { id: 'paste', label: 'Paste' },
  { id: 'paste-vojvodjanski', label: 'Paste po vojvođanski' },
  { id: 'paste-more', label: 'Paste sa morskim plodovima' },
  { id: 'salate', label: 'Salate' },
  { id: 'pice', label: 'Piće' },
];

type Seed = Omit<MenuItem, 'priceSource' | 'description' | 'ingredients' | 'image' | 'published' | 'tags'> &
  Partial<Pick<MenuItem, 'tags' | 'published' | 'priceSource'>>;

const wolt = (s: Seed): MenuItem => ({
  priceSource: 'wolt',
  description: null,
  ingredients: null,
  image: null,
  published: true,
  tags: [],
  ...s,
});

/** Theme presets (gradient stops). */
const T = {
  morning: { from: '#F7E7C4', to: '#E9B872' }, // soft sunrise
  bread: { from: '#EFDDB8', to: '#C99A5B' },
  tomato: { from: '#C63A22', to: '#3A1510' },
  gold: { from: '#F4C64E', to: '#F3E6CC' }, // egg yolk -> cream
  basil: { from: '#3E6B3A', to: '#E9E0C6' },
  cheese: { from: '#F6E7B0', to: '#E2C779' },
  mushroom: { from: '#6B4E37', to: '#D8C3A1' },
  garlic: { from: '#EFE6D2', to: '#9C8F5E' }, // garlic white -> olive oil
  broccoli: { from: '#7FA65A', to: '#EDE4C8' },
  chicken: { from: '#E7B77A', to: '#7A4A26' },
  ink: { from: '#0B1416', to: '#1F4A4F' }, // squid ink with teal sheen
  spinach: { from: '#2F5A2C', to: '#E9C3A8' }, // spinach green -> prawn blush
  dough: { from: '#F2E8D5', to: '#C9A86A' }, // abstract: dough + steam
  vojvodina: { from: '#F2E8D5', to: '#A9B98A' }, // cream + basil
  plum: { from: '#5B2A45', to: '#D9B48A' },
  curry: { from: '#E0A030', to: '#6E3A16' },
  ham: { from: '#C97B6B', to: '#F0DCC4' },
  cola: { from: '#2A1610', to: '#7A3B22' },
  citrus: { from: '#E9E46A', to: '#F7F2CE' },
  tonic: { from: '#DDEBE8', to: '#9FC2BC' },
  guarana: { from: '#C2410C', to: '#3B1206' },
} as const;

export const menu: MenuItem[] = [
  // ---- Doručak --------------------------------------------------------------
  wolt({ id: 'jaja-povrce', name: 'Jaja sa povrćem', category: 'dorucak', price: 620, theme: { ...T.morning, motifs: ['egg'], aroma: 'sun' } }),
  wolt({ id: 'jaja-prsut', name: 'Jaja sa pršutom', category: 'dorucak', price: 620, theme: { ...T.morning, motifs: ['egg', 'ham'], aroma: 'sun' } }),
  wolt({ id: 'jaja-slanina', name: 'Jaja sa slaninom', category: 'dorucak', price: 620, theme: { ...T.morning, motifs: ['egg', 'bacon'], aroma: 'sun' } }),

  // ---- Sendviči -------------------------------------------------------------
  wolt({ id: 'sendvic-povrce-sir', name: 'Sendvič sa grilovanim povrćem i sirom', category: 'sendvici', price: 880, tags: ['vege'], theme: { ...T.bread, motifs: ['cheese'], aroma: 'steam' } }),
  wolt({ id: 'sendvic-prsut-sir', name: 'Sendvič sa pršutom i sirom', category: 'sendvici', price: 880, theme: { ...T.bread, motifs: ['ham', 'cheese'], aroma: null } }),
  wolt({ id: 'tortilja-butkica', name: 'Tortilja sa dimljenom butkicom', category: 'sendvici', price: 880, theme: { ...T.ham, motifs: ['tortilla', 'ham'], aroma: 'steam' } }),
  wolt({ id: 'tortilja-piletina-kari', name: 'Tortilja sa piletinom i karijem', category: 'sendvici', price: 880, theme: { ...T.curry, motifs: ['tortilla', 'chicken', 'curry'], aroma: 'chili' } }),

  // ---- Paste ----------------------------------------------------------------
  wolt({ id: 'bolognese', name: 'Bolognese pasta', category: 'paste', price: 1180, tags: ['popularno'], theme: { ...T.tomato, motifs: ['tomato'], aroma: 'steam' } }),
  wolt({ id: 'piletina-brokoli', name: 'Piletina brokoli pasta', category: 'paste', price: 1180, theme: { ...T.broccoli, motifs: ['chicken', 'broccoli'], aroma: 'steam' } }),
  wolt({ id: 'cetiri-sira', name: 'Četiri vrste sira pasta', category: 'paste', price: 1180, theme: { ...T.cheese, motifs: ['cheese'], aroma: 'cheese' } }),
  // TODO: confirm ingredients with owner
  wolt({ id: 'pasta-pista', name: 'Pašta pišta', category: 'paste', price: 1180, tags: ['popularno'], theme: { ...T.dough, motifs: null, aroma: 'steam' } }),
  // TODO: confirm ingredients with owner ("vege" is not an ingredient)
  wolt({ id: 'vege-pasta', name: 'Vege pasta', category: 'paste', price: 1180, tags: ['vege'], theme: { ...T.basil, motifs: null, aroma: 'herbs' } }),
  wolt({ id: 'pesto', name: 'Pesto pasta', category: 'paste', price: 1080, theme: { ...T.basil, motifs: ['basil'], aroma: 'herbs' } }),
  wolt({ id: 'amatriciana', name: 'Amatriciana pasta', category: 'paste', price: 1180, theme: { ...T.tomato, motifs: ['tomato'], aroma: 'steam' } }),
  // TODO: confirm ingredients with owner
  wolt({ id: 'ludi-sremac', name: 'Ludi Sremac pasta', category: 'paste', price: 1280, tags: ['popularno', 'specijalitet'], theme: { from: '#C63A22', to: '#F2E8D5', motifs: null, aroma: 'steam' } }),
  // TODO: confirm ingredients with owner
  wolt({ id: 'manje-ludi-sremac', name: 'Manje ludi Sremac pasta', category: 'paste', price: 1180, theme: { from: '#E07A52', to: '#F2E8D5', motifs: null, aroma: 'steam' } }),
  wolt({ id: 'aglio-olio', name: 'Aglio e olio pasta', category: 'paste', price: 980, theme: { ...T.garlic, motifs: ['garlic', 'oil'], aroma: 'steam' } }),
  wolt({ id: 'raviole-prsut-sir', name: 'Raviole sa pršutom i sirom', category: 'paste', price: 1430, theme: { ...T.ham, motifs: ['ham', 'cheese'], aroma: 'steam' } }),
  // TODO: confirm ingredients with owner
  wolt({ id: 'pasta-suta', name: 'Pasta šuta', category: 'paste', price: 1220, theme: { from: '#8A6A43', to: '#F2E8D5', motifs: null, aroma: 'steam' } }),
  wolt({ id: 'carbonara', name: 'Carbonara', category: 'paste', price: 1180, tags: ['popularno'], theme: { ...T.gold, motifs: ['egg'], aroma: 'steam' } }),
  wolt({ id: 'fungi', name: 'Fungi', category: 'paste', price: 1180, theme: { ...T.mushroom, motifs: ['mushroom'], aroma: 'steam' } }),
  // TODO: confirm ingredients with owner
  wolt({ id: 'vege-raviole', name: 'Vege raviole', category: 'paste', price: 1380, tags: ['vege'], theme: { ...T.basil, motifs: null, aroma: 'herbs' } }),
  wolt({ id: 'njoke-butkica-ren', name: 'Gratinirane njoke sa butkicom u sosu od rena', category: 'paste', price: 1280, theme: { ...T.cheese, motifs: ['ham', 'horseradish'], aroma: 'cheese' } }),
  // TODO: confirm ingredients with owner
  wolt({ id: 'lee-chan', name: 'Lee Chan', category: 'paste', price: 1180, theme: { from: '#2B2320', to: '#C9A86A', motifs: null, aroma: 'steam' } }),
  wolt({ id: 'piletina-spanski-sos', name: 'Piletina u španskom sosu', category: 'paste', price: 1280, theme: { ...T.chicken, motifs: ['chicken'], aroma: 'steam' } }),

  // ---- Paste po vojvođanski -------------------------------------------------
  wolt({ id: 'nasuvo-mak', name: 'Pasta nasuvo sa makom', category: 'paste-vojvodjanski', price: 880, theme: { ...T.vojvodina, motifs: ['poppy', 'wheat'], aroma: 'poppy' } }),
  wolt({ id: 'nasuvo-krompir', name: 'Pasta nasuvo sa krompirom', category: 'paste-vojvodjanski', price: 880, tags: ['popularno'], theme: { ...T.vojvodina, motifs: ['potato', 'wheat'], aroma: 'steam' } }),

  // ---- Paste sa morskim plodovima ------------------------------------------
  wolt({ id: 'taljatele-spanac-kozice', name: 'Taljatele od spanaća sa kozicama', category: 'paste-more', price: 1350, theme: { ...T.spinach, motifs: ['spinach', 'shrimp', 'wave'], aroma: 'bubbles' } }),
  wolt({ id: 'crna-pasta-dagnje', name: 'Crna pasta sa dagnjama i kaparom', category: 'paste-more', price: 1350, theme: { ...T.ink, motifs: ['mussel', 'caper', 'wave'], aroma: 'bubbles' } }),

  // ---- Salate ---------------------------------------------------------------
  wolt({ id: 'salata-piletina-kari', name: 'Obrok salata sa piletinom i karijem', category: 'salate', price: 1180, theme: { ...T.curry, motifs: ['chicken', 'curry'], aroma: 'herbs' } }),
  wolt({ id: 'salata-butkica-sljive', name: 'Obrok salata sa butkicom i suvim šljivama', category: 'salate', price: 1220, theme: { ...T.plum, motifs: ['ham', 'plum'], aroma: 'herbs' } }),

  // ---- Piće (Wolt lists only soft drinks) -----------------------------------
  wolt({ id: 'pepsi', name: 'Pepsi 0,33l', category: 'pice', price: 180, group: 'Bezalkoholna pića', theme: { ...T.cola, motifs: null, aroma: 'bubbles' } }),
  wolt({ id: 'everest-bitter-lemon', name: 'Everest bitter lemon 0,25l', category: 'pice', price: 180, group: 'Bezalkoholna pića', theme: { ...T.citrus, motifs: ['lemon'], aroma: 'bubbles' } }),
  wolt({ id: 'everest-tonic', name: 'Everest tonic 0,25l', category: 'pice', price: 180, group: 'Bezalkoholna pića', theme: { ...T.tonic, motifs: null, aroma: 'bubbles' } }),
  wolt({ id: 'guarana', name: 'Guarana 0,25l', category: 'pice', price: 180, group: 'Bezalkoholna pića', theme: { ...T.guarana, motifs: null, aroma: 'bubbles' } }),
  wolt({ id: 'pepsi-zero', name: 'Pepsi Zero 0,25l', category: 'pice', price: 180, group: 'Bezalkoholna pića', theme: { ...T.cola, motifs: null, aroma: 'bubbles' } }),

  // ---- Not on Wolt, seen on Google. Unpublished until confirmed ---------------
  // TODO: confirm with owner (may be duplicates or in-house only)
  ...(
    [
      ['egs-ala-cif', 'Egs ala čif', 'dorucak'],
      ['velika-plata', 'Velika plata', 'dorucak'],
      ['njoke-piletina-slanina', 'Njoke sa piletinom i slaninom', 'paste'],
      ['ne-tako-ludi-sremac', 'Ne tako ludi Sremac', 'paste'],
      ['ludi-sremac-pola', 'Ludi Sremac ½ porcije', 'paste'],
      ['taske-dzem-sljive', 'Taške sa džemom od šljiva', 'paste-vojvodjanski'],
    ] as const
  ).map(([id, name, category]) =>
    wolt({ id, name, category, price: null, priceSource: null, published: false, theme: { ...T.dough, motifs: null, aroma: 'steam' } }),
  ),
];

/**
 * Drinks sub-categories still missing from Wolt — the bar menu.
 * TODO: fill from the restaurant's bar menu; set published: true per group.
 */
export const drinkGroupsTodo: { group: string; published: boolean }[] = [
  { group: 'Kafa', published: false },
  { group: 'Vino', published: false },
  { group: 'Pivo', published: false },
  { group: 'Kokteli / Bar', published: false },
];

export const publishedMenu = menu.filter((m) => m.published);
export const menuByCategory = (c: Category) => publishedMenu.filter((m) => m.category === c);
