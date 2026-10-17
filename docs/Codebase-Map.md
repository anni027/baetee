---
title: Codebase map
type: reference
tags: [code, structure]
updated: 2026-10-10
---

# Codebase map

Verified by scanning every source file on 2026-10-10. `node_modules/`, `.next/`, `_next/` excluded.

## App routes — `app/`

| File | Role | Status |
|---|---|---|
| `layout.tsx` | Root layout: metadata, `CartProvider`, `Header`, `Footer` | live |
| `page.jsx` | Home → renders `Storefront` | live |
| `globals.css` | All styling (Tailwind v4 import + hand-written CSS) | live |
| `product/[kind]/[id]/page.tsx` | Product detail page, inline legacy markup, tee-only lookup | live but stale — see [[Known-Drift]] |
| `checkout/page.jsx` | Placeholder "Checkout is not ready yet" | live placeholder |
| `commissions/page.jsx` | Placeholder "Commission submissions are disabled" | live placeholder |
| `privacy/page.tsx`, `cookies/page.tsx` | Static policy pages | live |
| `api/bids/route.ts`, `api/requests/route.ts` | POST handlers, always HTTP 503 | live (fail-closed) |

## Components — `components/`

### Live (reachable from a route)

- `store/Storefront.jsx` — home: hero, sorting tee grid, quick-add dialog, commission teaser, artist section
- `store/Header.jsx` — announcement bar, logo, nav, bag count; mounts `CollectionTools`
- `store/Footer.jsx` — wordmark and links
- `store/CartProvider.jsx` — cart context + localStorage persistence
- `store/ProductBrandStory.jsx` — right-hand brand panel (PDP/quick-shop), uses `BaeteeDedication`
- `store/BaeteeDedication.jsx` — rotates 12 dedication variations
- `store/SizeGuide.jsx` — loose-fit measurement dialog
- `store/ArtistSection.jsx` — About Zeki Gilani
- `store/BenefitTicker.jsx` — scrolling benefits with pause control
- `store/BrandMnemonic.jsx` — ribbon mark badge on images
- `store/CollectionTools.jsx` — registers two Model Context Protocol tools (`list_baetee_editions`, `start_baetee_commission`) via `document.modelContext`, feature-detected

### Orphaned (implemented, imported by nothing)

- `ProductView.jsx` — full PDP: tee sizes, artwork story, commission enquiry form, related tees
- `store/CommissionCollection.jsx` — paintings/collectibles tabs grid
- `store/Bag.jsx` — full bag UI: quantities, subtotal, removal

Routes render older inline/placeholder markup instead. See [[Known-Drift]] before assuming a doc's component is live.

### shadcn primitives — `components/ui/`

`button`, `dialog`, `select` live (used by Storefront/SizeGuide/BenefitTicker).
`tabs` and `input` are only imported by the orphaned components.
Radix primitives resolve through the `radix-ui` package's `@radix-ui/react-*` dependencies.

## Data — `lib/`

| File | Exports | Notes |
|---|---|---|
| `catalog.js` | `paintings`, `collectibles`, `tees`, `portraits`, `collectorBox`, `currency` | Single source of truth for products and prices. Ends with minified re-exports (`i`, `t`, `c`, `l`, `r`, `s`, `u`) left over from the static-clone bundle |
| `artwork-stories.js` | `baeteeDedication`, `artworkStories` (15 keyed notes) | Copy only |
| `dedication-copy.js` | `dedicationCopy` (12 variations) | Copy only |
| `home-copy.js` | `homeCopy` (5 headlines), `nextCopyIndex` | Rotating home copy |
| `hero-images.js` | `heroImages` (5 editorial images) | Rotating hero |
| `cart.js` | `cleanCart` | Sanitises stored cart |
| `utils.ts` | `cn` | shadcn class merge |
| `hooks/use-mobile.ts` | `useIsMobile` | Scaffold, imported by nothing |

## Assets

- `public/` is the live asset root: `art/` (15 PNG), `tee/` (15 WebP), `collectible/` (15 PNG), `editorial/` (5 WebP), `brand/` (SVG logos), `experience/` (3 PNG), `favicon.svg`.
- Root `art/`, `collectible/`, `experience/`, `brand/` are static-clone duplicates (root `art/` only holds 10 PNGs — `public/art/` has all 15).

## Legacy static clone

`index.html` (~52 KB SSR output), `_next/` (chunks + CSS), `api/image.js` (Vercel function emulating `/_next/image` by redirecting to the raw file), root image folders. Root `README.md` documents this clone and references `serve.js`, which no longer exists.

## Config

`next.config.ts` empty · `tsconfig.json` strict, `@/*` path alias, allowJs · `eslint.config.mjs` flat config (Next + react-hooks + typescript-eslint) · `components.json` shadcn new-york · `vercel.json` install/build commands · `.gitignore` excludes `node_modules`, `.next`, `.vercel`, `.env*`.

## Scripts

`npm run dev` · `npm run build` (`next build --webpack`) · `npm run start` · `npm run typecheck` (`tsc --noEmit`) · `npm run lint` (`eslint .`). See [[Agent-Playbook]].
