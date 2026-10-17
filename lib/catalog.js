import {createLucideIcon} from 'lucide-react';

export const paintings = [
  {
    "id": 1,
    "title": "The Flower That Waited",
    "image": "/art/01-flower-that-waited.png",
    "manifestation": "What is meant for me is already approaching.",
    "palette": "Ivory · Moss · Pale gold",
    "remaining": 82,
    "biddingAvailable": true
  },
  {
    "id": 2,
    "title": "Roots Before Roses",
    "image": "/art/02-roots-before-roses.png",
    "manifestation": "Unseen discipline creates visible abundance.",
    "palette": "Raw umber · Oxblood",
    "remaining": 67,
    "biddingAvailable": true
  },
  {
    "id": 3,
    "title": "The Quiet Garden",
    "image": "/art/03-quiet-garden.png",
    "manifestation": "Peace is the highest form of wealth.",
    "palette": "Forest · Lapis · Cream",
    "remaining": 74,
    "biddingAvailable": true
  },
  {
    "id": 4,
    "title": "Sunflower After Midnight",
    "image": "/art/04-sunflower-after-midnight.png",
    "manifestation": "My light remains mine, even in darkness.",
    "palette": "Midnight · Antique gold",
    "remaining": 41,
    "biddingAvailable": true
  },
  {
    "id": 5,
    "title": "A Door Made of Petals",
    "image": "/art/05-door-made-of-petals.png",
    "manifestation": "Beauty opens the life I am ready to enter.",
    "palette": "Coral · Burgundy · Blush",
    "remaining": 59,
    "biddingAvailable": true
  },
  {
    "id": 6,
    "title": "Inherited Spring",
    "image": "/art/06-inherited-spring.png",
    "manifestation": "I turn what I receive into something that blooms.",
    "palette": "Tea · Tender green · Vermilion",
    "remaining": 71,
    "biddingAvailable": true
  },
  {
    "id": 7,
    "title": "Garden of One Hundred",
    "image": "/art/07-garden-of-one-hundred.png",
    "manifestation": "Rarity is a way of living deliberately.",
    "palette": "Smoked rose · Gold · Black",
    "remaining": 36,
    "biddingAvailable": true
  },
  {
    "id": 8,
    "title": "Water Remembers the Lotus",
    "image": "/art/08-water-remembers-the-lotus.png",
    "manifestation": "I rise without carrying the weight of where I began.",
    "palette": "Lotus · Mist · Gold",
    "remaining": 64,
    "biddingAvailable": true
  },
  {
    "id": 9,
    "title": "The Garden Kept a Secret",
    "image": "/art/09-garden-kept-a-secret.png",
    "manifestation": "Mystery protects what is still becoming.",
    "palette": "Bone · Charcoal · Sage",
    "remaining": 48,
    "biddingAvailable": true
  },
  {
    "id": 10,
    "title": "Home Is the First Kingdom",
    "image": "/art/10-home-is-the-first-kingdom.png",
    "manifestation": "Abundance begins in the love that surrounds me.",
    "palette": "Emerald · Saffron · Terracotta",
    "remaining": 29,
    "biddingAvailable": true
  },
  {
    "id": 11,
    "title": "The Rose After the Sirens",
    "image": "/art/11-rose-after-the-sirens.png",
    "manifestation": "What was broken can still become beautiful.",
    "palette": "Carmine · Storm grey · Antique gold",
    "remaining": 91,
    "biddingAvailable": true
  },
  {
    "id": 12,
    "title": "Seeds Kept in a Teacup",
    "image": "/art/12-seeds-kept-in-a-teacup.png",
    "manifestation": "I carry tomorrow in the smallest things.",
    "palette": "Porcelain · Cobalt · Tender green",
    "remaining": 94,
    "biddingAvailable": true
  },
  {
    "id": 13,
    "title": "The Orchard Learned Our Names",
    "image": "/art/13-orchard-learned-our-names.png",
    "manifestation": "What we rebuild will remember our care.",
    "palette": "Charcoal · Pear green · Mist blue",
    "remaining": 88,
    "biddingAvailable": true
  },
  {
    "id": 14,
    "title": "Jasmine Returned to the Window",
    "image": "/art/14-jasmine-returned-to-window.png",
    "manifestation": "Home begins wherever tenderness returns.",
    "palette": "Jasmine · Sage · Weathered umber",
    "remaining": 92,
    "biddingAvailable": true
  },
  {
    "id": 15,
    "title": "The Last Watering Can",
    "image": "/art/15-last-watering-can.png",
    "manifestation": "Even one careful act can call life forward.",
    "palette": "Pewter · Dry sienna · Luminous gold",
    "remaining": 89,
    "biddingAvailable": true
  }
];

export const collectibles = [
  {
    "id": 1,
    "name": "The Waiting One",
    "painting": "The Flower That Waited",
    "image": "/collectible/baegirl-01-flower-that-waited.png",
    "character": "Ivory, moss and pale gold. A quiet study in patience.",
    "remaining": 84,
    "biddingAvailable": true
  },
  {
    "id": 2,
    "name": "The Rooted One",
    "painting": "Roots Before Roses",
    "image": "/collectible/baegirl-02-roots-before-roses.png",
    "character": "Oxblood, raw umber and antique gold. Discipline before bloom.",
    "remaining": 72,
    "biddingAvailable": true
  },
  {
    "id": 3,
    "name": "The Quiet One",
    "painting": "The Quiet Garden",
    "image": "/collectible/baegirl-03-quiet-garden.png",
    "character": "Forest, lapis and cream. A private garden made collectible.",
    "remaining": 79,
    "biddingAvailable": true
  },
  {
    "id": 4,
    "name": "The Midnight Sun",
    "painting": "Sunflower After Midnight",
    "image": "/collectible/baegirl-04-sunflower-after-midnight.png",
    "character": "Midnight black and antique gold. Light that belongs to itself.",
    "remaining": 43,
    "biddingAvailable": true
  },
  {
    "id": 5,
    "name": "The Petal Door",
    "painting": "A Door Made of Petals",
    "image": "/collectible/baegirl-05-door-made-of-petals.png",
    "character": "Coral, burgundy and blush. An invitation into another world.",
    "remaining": 61,
    "biddingAvailable": true
  },
  {
    "id": 6,
    "name": "The Inherited Bloom",
    "painting": "Inherited Spring",
    "image": "/collectible/baegirl-06-inherited-spring.png",
    "character": "Tea, tender green and vermilion. What is inherited, blooms.",
    "remaining": 75,
    "biddingAvailable": true
  },
  {
    "id": 7,
    "name": "The Hundredth Garden",
    "painting": "Garden of One Hundred",
    "image": "/collectible/baegirl-07-garden-of-one-hundred.png",
    "character": "Smoked rose, gold and black. Abundance with ceremony.",
    "remaining": 38,
    "biddingAvailable": true
  },
  {
    "id": 8,
    "name": "The Lotus Memory",
    "painting": "Water Remembers the Lotus",
    "image": "/collectible/baegirl-08-water-remembers-lotus.png",
    "character": "Lotus, mist and pale gold. Weightless, calm and luminous.",
    "remaining": 66,
    "biddingAvailable": true
  },
  {
    "id": 9,
    "name": "The Secret Keeper",
    "painting": "The Garden Kept a Secret",
    "image": "/collectible/baegirl-09-garden-kept-secret.png",
    "character": "Bone, charcoal and sage. Mystery, held beautifully.",
    "remaining": 51,
    "biddingAvailable": true
  },
  {
    "id": 10,
    "name": "The First Kingdom",
    "painting": "Home Is the First Kingdom",
    "image": "/collectible/baegirl-10-home-first-kingdom.png",
    "character": "Emerald, saffron and terracotta. Home, made sovereign.",
    "remaining": 31,
    "biddingAvailable": true
  },
  {
    "id": 11,
    "name": "The Mended Rose",
    "painting": "The Rose After the Sirens",
    "image": "/collectible/baetee-11-mended-rose.png",
    "character": "Carmine, storm grey and antique gold. Beauty that carries its repairs with grace.",
    "remaining": 93,
    "biddingAvailable": true
  },
  {
    "id": 12,
    "name": "The Seed Keeper",
    "painting": "Seeds Kept in a Teacup",
    "image": "/collectible/baetee-12-seed-keeper.png",
    "character": "Porcelain, cobalt and tender green. Tomorrow held carefully in small hands.",
    "remaining": 96,
    "biddingAvailable": true
  },
  {
    "id": 13,
    "name": "The Orchard Heir",
    "painting": "The Orchard Learned Our Names",
    "image": "/collectible/baetee-13-orchard-heir.png",
    "character": "Charcoal, pear green and mist blue. A quiet inheritance of repair and return.",
    "remaining": 90,
    "biddingAvailable": true
  },
  {
    "id": 14,
    "name": "The Returning Jasmine",
    "painting": "Jasmine Returned to the Window",
    "image": "/collectible/baetee-14-returning-jasmine.png",
    "character": "Jasmine, sage and weathered umber. Tenderness finding its way home.",
    "remaining": 94,
    "biddingAvailable": true
  },
  {
    "id": 15,
    "name": "The Golden Drop",
    "painting": "The Last Watering Can",
    "image": "/collectible/baetee-15-golden-drop.png",
    "character": "Pewter, chalk white and luminous gold. One act of care, made everlasting.",
    "remaining": 91,
    "biddingAvailable": true
  }
];

export const tees = [
  {
    "id": 1,
    "title": "The Flower That Waited Tee",
    "painting": "The Flower That Waited",
    "image": "/tee/01-flower-that-waited.webp",
    "manifestation": "What is meant for me is already approaching.",
    "price": 3999
  },
  {
    "id": 2,
    "title": "Roots Before Roses Tee",
    "painting": "Roots Before Roses",
    "image": "/tee/02-roots-before-roses.webp",
    "manifestation": "Unseen discipline creates visible abundance.",
    "price": 4499
  },
  {
    "id": 3,
    "title": "The Quiet Garden Tee",
    "painting": "The Quiet Garden",
    "image": "/tee/03-quiet-garden.webp",
    "manifestation": "Peace is the highest form of wealth.",
    "price": 4499
  },
  {
    "id": 4,
    "title": "Sunflower After Midnight Tee",
    "painting": "Sunflower After Midnight",
    "image": "/tee/04-sunflower-after-midnight.webp",
    "manifestation": "My light remains mine, even in darkness.",
    "price": 4999
  },
  {
    "id": 5,
    "title": "A Door Made of Petals Tee",
    "painting": "A Door Made of Petals",
    "image": "/tee/05-door-made-of-petals.webp",
    "manifestation": "Beauty opens the life I am ready to enter.",
    "price": 5499
  },
  {
    "id": 6,
    "title": "Inherited Spring Tee",
    "painting": "Inherited Spring",
    "image": "/tee/06-inherited-spring.webp",
    "manifestation": "I turn what I receive into something that blooms.",
    "price": 4999
  },
  {
    "id": 7,
    "title": "Garden of One Hundred Tee",
    "painting": "Garden of One Hundred",
    "image": "/tee/07-garden-of-one-hundred.webp",
    "manifestation": "Rarity is a way of living deliberately.",
    "price": 3499
  },
  {
    "id": 8,
    "title": "Water Remembers the Lotus Tee",
    "painting": "Water Remembers the Lotus",
    "image": "/tee/08-water-remembers-the-lotus.webp",
    "manifestation": "I rise without carrying the weight of where I began.",
    "price": 3499
  },
  {
    "id": 9,
    "title": "The Garden Kept a Secret Tee",
    "painting": "The Garden Kept a Secret",
    "image": "/tee/09-garden-kept-a-secret.webp",
    "manifestation": "Mystery protects what is still becoming.",
    "price": 3999
  },
  {
    "id": 10,
    "title": "Home Is the First Kingdom Tee",
    "painting": "Home Is the First Kingdom",
    "image": "/tee/10-home-is-the-first-kingdom.webp",
    "manifestation": "Abundance begins in the love that surrounds me.",
    "price": 5499
  },
  {
    "id": 11,
    "title": "The Rose After the Sirens Tee",
    "painting": "The Rose After the Sirens",
    "image": "/tee/11-rose-after-the-sirens.webp",
    "manifestation": "What was broken can still become beautiful.",
    "price": 5499
  },
  {
    "id": 12,
    "title": "Seeds Kept in a Teacup Tee",
    "painting": "Seeds Kept in a Teacup",
    "image": "/tee/12-seeds-kept-in-a-teacup.webp",
    "manifestation": "I carry tomorrow in the smallest things.",
    "price": 4499
  },
  {
    "id": 13,
    "title": "The Orchard Learned Our Names Tee",
    "painting": "The Orchard Learned Our Names",
    "image": "/tee/13-orchard-learned-our-names.webp",
    "manifestation": "What we rebuild will remember our care.",
    "price": 3499
  },
  {
    "id": 14,
    "title": "Jasmine Returned to the Window Tee",
    "painting": "Jasmine Returned to the Window",
    "image": "/tee/14-jasmine-returned-to-window.webp",
    "manifestation": "Home begins wherever tenderness returns.",
    "price": 3999
  },
  {
    "id": 15,
    "title": "The Last Watering Can Tee",
    "painting": "The Last Watering Can",
    "image": "/tee/15-last-watering-can.webp",
    "manifestation": "Even one careful act can call life forward.",
    "price": 4999
  }
];

export const portraits = [
  {
    "id": 1,
    "image": "/editorial/flower-waited.webp"
  },
  {
    "id": 4,
    "image": "/editorial/sunflower-midnight.webp"
  },
  {
    "id": 8,
    "image": "/editorial/lotus-memory.webp"
  },
  {
    "id": 11,
    "image": "/editorial/rose-sirens.webp"
  },
  {
    "id": 15,
    "image": "/editorial/last-watering-can.webp"
  }
];

export const collectorBox = [
  [
    "01",
    "The original",
    "A signed miniature painting on deckled paper."
  ],
  [
    "02",
    "The hand-painted tee",
    "Your numbered, made-to-order BAETEE garment."
  ],
  [
    "03",
    "The BFF tee",
    "A second coordinated piece, fitted for your person."
  ],
  [
    "04",
    "Mismatched earrings",
    "A deliberately unmatched sculptural pair."
  ],
  [
    "05",
    "Loc transformation pieces",
    "Removable handcrafted loc pieces with loop attachments."
  ],
  [
    "06",
    "The bandana",
    "A silk garden study for an entirely different look."
  ],
  [
    "07",
    "The companion bag",
    "An architectural bag made for the edition."
  ],
  [
    "08",
    "Fortunes",
    "Bespoke fortune cookies, sealed for the opening."
  ],
  [
    "09",
    "Water ritual",
    "Youth-conceived water-based skincare, laboratory made."
  ],
  [
    "10",
    "Provenance",
    "Numbered 001—100, protected inside the collector trunk."
  ]
];

export const currency = new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0});
export {paintings as i,collectibles as t,tees as c,portraits as l,collectorBox as r,currency as s,createLucideIcon as u};
