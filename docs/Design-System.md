---
title: Design system
type: reference
tags: [design, css, tokens]
updated: 2026-10-10
---

# Design system

All styling lives in `app/globals.css` (Tailwind v4 import for utilities + hand-written CSS). `components.json` configures shadcn, but the storefront classes (`.store-*`, `.tee-*`, `.product-*`) are bespoke.

## Colour tokens (`:root`)

| Token | Value | Use |
|---|---|---|
| `--background` | `#fffdf9` | ivory page background |
| `--foreground` | `#261719` | body text |
| `--primary` | `#531a29` | burgundy buttons, headings, brand accents |
| `--border` | `#ded6cf` | hairlines |
| `--paper` | `#f3efe8` | paper surfaces |
| `--muted` | `#756761` | secondary text |

Derived: hover burgundy `#38111d` · warm panel `#ede5db` · soft panel `#f1ece5` · image well `#f0ede7` · focus outline `#916541` · destructive `#a52236` · selection `#ddc6c4` on `#261719`.
Tailwind `@theme inline` maps these to `--color-*` utilities; `--radius-*` are all `0`.

## Type

- Headings: `Georgia, 'Times New Roman', serif`, weight 400 — hero `clamp(60px,6.7vw,104px)` desktop / 68px mobile; section `clamp(34px,3.4vw,52px)`.
- Body: `Arial, Helvetica, sans-serif`, 16px/1.5.
- Kickers: 12px uppercase, letter-spacing `.16em`.
- Prices/labels: sans, weight 400 (never bold display).

## Geometry

- **Everything is square-cornered** (`border-radius: 0` is a brand rule; dialogs and selects are overridden to `0` too).
- Product/card images use a fixed **4:5 frame** with `object-fit: cover` + centred crop — full uncropped art only on PDPs. This fixed the letterboxing bugs recorded in [[Changes]].
- Buttons: `.store-button` min-height 52px, 16px/30px padding, burgundy fill; `.store-button-light` for dark panels; `.card-quick-add` is the outlined card CTA.
- Cards reserve space deliberately (titles 2 lines, captions sized to content) so grids stay aligned.

## Layout

- Grid: tee/commission grids 3-up desktop, 2-up ≤700px.
- Breakpoints: 1500px (max-width container 1650px), 1000px, 700px, 380px.
- Sticky header (88px desktop / 75px mobile) + announcement bar; `scroll-padding-top: 108px` (84px mobile).
- Product page: `1.12fr / 1fr` two-column, stacks ≤700px.

## Motion

- `motion/react` for card hover lift (`y: -3`, 0.2s) and entrances.
- `useReducedMotion()` disables hover transforms; global `@media (prefers-reduced-motion: reduce)` kills animations/transitions/smooth scroll.
- Benefit ticker: seamless CSS loop from two repeated groups, keyboard-accessible pause/resume, static list for reduced-motion users.
- Hero image hover: scale 1.025 / 0.8s. No zoom on the five rotating editorial images (keeps the model's head framed — see [[Changes]]).

## Accessibility patterns already in place

- Skip link to `#main`, visible `:focus-visible` outlines.
- `aria-labelledby` on every select/label pair, `role="status"` for cart feedback, `aria-live` quantities.
- Decorative mnemonic badges `aria-hidden`; repeated ticker text hidden from AT (announced once).
- Thumbnails keep keyboard focus visible inside the frame.

## Editing rules

- Prefer editing existing `.store-*` rules over adding a new layer of utility soup.
- Any new component follows: square corners, ivory/burgundy palette, Georgia headings, 4:5 image frames, reduced-motion support.
- Do not introduce a second radius/colour system or a CSS-in-JS layer.
