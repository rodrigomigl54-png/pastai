/** Every motif in the sprite. Add a <symbol id="m-<name>"> in MotifSprite.astro when extending. */
export const MOTIFS = [
  'basil', 'garlic', 'oil', 'chili', 'mushroom', 'cheese', 'poppy', 'potato', 'broccoli',
  'shrimp', 'mussel', 'caper', 'egg', 'wheat', 'tomato', 'chicken', 'ham', 'bacon',
  'tortilla', 'curry', 'horseradish', 'spinach', 'plum', 'lemon', 'wave',
] as const;
export type MotifName = (typeof MOTIFS)[number];
