---
title: Brand and copy
type: reference
tags: [brand, copy, rules]
updated: 2026-10-10
---

# Brand and copy

## Brand facts (supplied, do not expand on them)

- **BAETEE** — hand-painted art brand, "Born in India". Tagline options in use: "Collectibles, Painting, Worn." / "Art. Objects. Worn."
- **Dedication**: a tribute to the daughters of India — their courage, care and imagination, and their influence at home and around the world. Attributed to **Malik Gilani**.
- **Artist**: **Zeki Gilani**, a four-year-old boy, president of the Green Park Gardening Club, who relates gardening to life. Rendered in `ArtistSection` using existing artwork only — no portrait or photo of the child is used, and none may be added.
- Original site is `https://baetee.com/`; artwork and branding are copied locally into `public/`.

## Naming (user-approved, 5 Oct 2026)

- Navigation/category labels: **"Tee's"** (plural, with apostrophe) and **"Collectibles"** — even though "Commissions" is the internal concept.
- Singular product reference: **"Tee"**.
- Routes and enquiry actions keep the commission wording (`/commissions`, "Submit your commission").
- Product IDs stay internal — never shown as product numbers on cards (they were replaced by the ribbon mnemonic).

## Copy inventory

| Asset | File | Count | Behaviour |
|---|---|---|---|
| Homepage headlines | `lib/home-copy.js` | 5 | advances once per visit, no repeat, no timer |
| Hero editorial images | `lib/hero-images.js` | 5 | same rotation logic |
| Dedication variations | `lib/dedication-copy.js` | 12 | advances on each product view / quick-shop open, remembers last shown |
| Artwork stories | Medusa descriptions; `lib/artwork-stories.js` for seed/preview | 15 original stories | product pages, commission cards and tee quick-add read current database copy when configured |
| Base dedication | `artwork-stories.js` → `baeteeDedication` | 1 | the canonical sentence |

Rotations use `nextCopyIndex(previous, length)` and are stored in `localStorage` — see [[Client-State]].

## Hard "do not invent" rules

1. **No fabricated social proof** — no reviews, ratings, certifications, guarantees, fulfilment promises.
2. **No invented supply facts** — no physical stock, workshop, shipping times or "editions remaining" claims beyond what's already in the catalogue copy.
3. **No named historical figures or biographical claims** in artwork stories; stories describe visible motifs only ([[Artwork-Stories]]).
4. **No numeric size chart** until the supplier confirms laid-flat chest/length/shoulder for XS–XXL — the UI must keep saying measurements are awaiting confirmation ([[Size-Guide]]).
5. **No listed prices on paintings/collectibles** and no "buy now" path for them — commission enquiries only.
6. **No AI-generated labels or "AI-created" wording** on imagery (Malik's explicit instruction, see [[Weekly-Updates]]).
7. **No simulated transactions** — never claim an order, payment or enquiry was processed.
8. **No image generation of people** — existing collection artwork only.

## Voice

Plain, warm, short sentences. Garden imagery (petals, roots, seeds, watering). Second person for affirmations ("I rise…"). Prefer the user's own wording from [[Changes]] over freshly coined marketing language; when copying, keep language simple and explain technical terms in plain words (constitution §5).
