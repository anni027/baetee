---
title: Catalog data
type: reference
tags: [data, pricing, catalogue]
updated: 2026-10-10
---

# Catalog data

> [!note] Backend transition
> `lib/catalog.js` is the approved import snapshot and explicit local preview fallback when Medusa is unconfigured. With complete settings, tee titles/images/descriptions/prices and commission content come from the database through Medusa. Checkout activation is a separate gate. See [[Database-and-Storefront]].

Medusa is the configured store's source of truth. Its original seed prices match the approved snapshot below; the seed preserves existing Admin edits. The bag displays Medusa line amounts, and the browser never supplies a price to checkout ([[Security]]). Brand/editorial content remains in the site's copy files and assets.

## Collections

### `tees` — 15 items, the only purchasable products

Shape: `{ id, title, painting, image, manifestation, price }`
`image` → `/tee/NN-slug.webp`, `painting` → source artwork title, `manifestation` → one-line affirmation.

Fixed prices (INR, assigned once 5 Oct 2026, must not drift — matches [[Pricing]]):

| # | Painting | ₹ |
|---|---|---:|
| 1 | The Flower That Waited | 3999 |
| 2 | Roots Before Roses | 4499 |
| 3 | The Quiet Garden | 4499 |
| 4 | Sunflower After Midnight | 4999 |
| 5 | A Door Made of Petals | 5499 |
| 6 | Inherited Spring | 4999 |
| 7 | Garden of One Hundred | 3499 |
| 8 | Water Remembers the Lotus | 3499 |
| 9 | The Garden Kept a Secret | 3999 |
| 10 | Home Is the First Kingdom | 5499 |
| 11 | The Rose After the Sirens | 5499 |
| 12 | Seeds Kept in a Teacup | 4499 |
| 13 | The Orchard Learned Our Names | 3499 |
| 14 | Jasmine Returned to the Window | 3999 |
| 15 | The Last Watering Can | 4999 |

Range: ₹3,499–₹5,499 (used verbatim in the page metadata description).

### `paintings` — 15 items, commission only, no price field

Shape: `{ id, title, image, manifestation, palette, remaining, biddingAvailable }`
`remaining` counts (29–94) are decorative inventory copy from the original site — there is no inventory system behind them.

### `collectibles` — 15 items, commission only, no price field

Shape: `{ id, name, painting, image, character, remaining, biddingAvailable }`
Each has a display `name` (e.g. "The Lotus Memory") distinct from its source `painting` title. Image filenames are inconsistent by design: `baegirl-01…10` vs `baetee-11…15` — copy them exactly.

### `portraits` — 5 items

Editorial images `/editorial/*.webp` for homepage hero rotation (ids 1, 4, 8, 11, 15).

### `collectorBox` — 10 rows

`[number, title, description]` tuples for the collector-box ledger copy.

### `currency`

`Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })` — always use this for display (₹3,999 style).

## Copy companion files

- `lib/artwork-stories.js` — `artworkStories[1..15]` interpretive notes + `baeteeDedication` (the base dedication)
- `lib/dedication-copy.js` — 12 rotating dedication variations (index 0 = base dedication)
- `lib/home-copy.js` — 5 rotating headline/description pairs + `nextCopyIndex()`
- `lib/hero-images.js` — 5 `{id, image}` editorial hero entries

See [[Brand-and-Copy]] for the rules that govern this text.

## Rules when editing

1. New tee → append after existing ids, keep ids stable (bag entries reference ids), add the price to [[Pricing]], add artwork/story/tee image in `public/`.
2. Prices are fixed by the user's approval; never re-roll or "balance" them.
3. Paintings and collectibles never get price fields or listed prices — they are commission-only ([[Changes]]).
4. Do not rename collectible image files or their `baegirl`/`baetee` prefixes without updating `catalog.js` in the same change.
