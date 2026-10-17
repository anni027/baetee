---
title: Project overview
type: reference
tags: [meta, stack, status]
updated: 2026-10-10
---

# Project overview

**BAETEE** — a hand-painted T-shirt storefront for an Indian art brand, plus paintings and collectibles sold by commission only. Single-operator project; no git repo initialised in this folder.

## What is in this folder

Two identities share one directory:

1. **Current app** — a Next.js storefront (the thing that runs and deploys). Package name `baetee-vercel`.
2. **Static clone leftovers** — `index.html`, `_next/`, root `art/`, `collectible/`, `experience/`, `brand/`, `api/image.js`. An earlier single-file mirror of baetee.com. Kept as reference assets; the Next app does not serve them. See [[Known-Drift]].

## Stack (verified from `package.json`)

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3.4, App Router |
| UI | React 19.2.6, mixed TSX/JSX |
| Styling | Tailwind CSS 4.2.1 via `@tailwindcss/postcss`, plain CSS in `app/globals.css` |
| Components | shadcn/ui style (`components/ui/*`), Radix primitives through the `radix-ui` package |
| Animation | `motion` (motion/react) with `useReducedMotion` |
| Icons | `lucide-react` |
| Forms/validation | `zod` installed, **not imported anywhere in app code** |
| Runtime | Node 22.x (`engines`), validated on Node 24.19.0 |
| Host target | Vercel (`vercel.json`: `npm ci` + `npm run build`) |
| Build | `next build --webpack` (webpack, not Turbopack) |

## History

- Original site mirrored as a static page (React SSR output with embedded RSC payload, "Vinext" runtime — see `index.html`).
- Exported 5 October 2026 from source revision `5d1b9fc7010c36a2d0be158ab743042fcc2653c8` with export-only build changes — see [[Vercel-Export]].
- Rewritten into editable React components: T-shirt-first storefront, commission section, device-local bag — see [[Changes]].
- Export validated locally (build, typecheck, route smoke) — see [[Export-Validation]]. No Vercel deployment verified from this folder.

## Current status (2026-10-10)

- Home, tee quick-add, header/footer, policies render the full experience.
- Checkout, bag page and commission submission are **deliberately disabled** (503 / placeholder pages) until payment and email services exist — see [[Pending-Work]].
- Several finished components are wired to nothing; the product and commission routes render older inline markup. This is the most important thing to know before editing — see [[Known-Drift]].

## Non-negotiables

Read [[Brand-and-Copy]] and [[Security]] before writing copy or touching data flow. Short version: no invented claims, no fake transactions, prices only from the catalogue, no credentials in the repo.
