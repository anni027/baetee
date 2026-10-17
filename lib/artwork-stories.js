import {newDesigns} from './new-designs.js';
// Interpretive collection copy, grounded in the visible artwork and BAETEE's brand dedication.
export const baeteeDedication = 'A tribute to the daughters of India, whose courage, care and imagination have shaped lives at home and across the world.';
export const artworkStories = {
  1: 'A single bud reaches towards a circle of gold, holding the promise of a bloom still to come. It honours the daughters whose dreams quietly grow into possibilities for others.',
  2: 'A red rose rises above a branching network of roots. It honours the often unseen strength of India’s daughters, whose resolve sustains families, communities and generations of growth.',
  3: 'A small blue flower rests among deep green leaves, bringing quiet colour to the canvas. It celebrates the daughters whose thoughtful presence gives others space to flourish.',
  4: 'A golden sunflower bows against a midnight sky, its colour undimmed by the darkness. It honours the daughters who carry hope through difficult seasons and illuminate the lives around them.',
  5: 'Two sweeping petals frame an open passage, turning a delicate bloom into a doorway. It celebrates the daughters who open new paths through creativity, courage and the freedom to imagine.',
  6: 'A young stem rises from a small root ball, crowned by a vivid red petal. It honours the daughters who carry their inheritance forward, making room for a spring of their own.',
  7: 'A layered blush bloom unfolds with a character entirely its own. It celebrates the individuality of India’s daughters, each bringing a distinct voice, gift and way of seeing to the world.',
  8: 'A pale lotus opens above still water, its reflection resting beneath it. It honours the daughters who rise beyond circumstance with grace, creating possibilities that reach far beyond their beginnings.',
  9: 'A pale leaf partly shelters a dark bloom, revealing beauty without revealing everything. It celebrates the inner worlds of India’s daughters and the dreams they choose to nurture in their own time.',
  10: 'Golden flowers curve towards one another around a smaller central bloom. It honours the daughters whose love helps shape our first sense of belonging, and whose influence reaches well beyond home.',
  11: 'A red rose stands above fallen petals and a wash of blue, holding its colour amid the fragments. It honours the daughters whose resilience makes space for beauty and renewal after hardship.',
  12: 'Tender seedlings emerge from a porcelain teacup, finding a home in something small and familiar. It celebrates the daughters whose everyday acts of care nurture futures larger than the moment.',
  13: 'A fruit-bearing branch stretches across a soft, open sky, carrying both blossom and harvest. It honours the daughters whose patient work nourishes communities and leaves a living legacy for those who follow.',
  14: 'White jasmine grows around a weathered window frame, bringing life to its edges. It celebrates the daughters whose tenderness restores belonging, wherever they build a home in the world.',
  15: 'A golden drop falls from a watering can towards a lone flower in dry earth. It honours the daughters whose smallest acts of care can sustain life and begin lasting change.'
};

for(const design of newDesigns)artworkStories[design.id]=design.story;

artworkStories[31]='A hooded figure meets the colour and weathered surface of a city bus. Inspired by the Riya Ahir reference shared with BAETEE, this expressive study celebrates a woman claiming creative space in everyday India.';
