---
title: Known drift
type: status
tags: [drift, dead-code, warnings, review]
updated: 2026-10-14
---

# Known drift

The active app is the Next.js storefront connected to local Medusa. See [[Backend-Implementation]] and [[Keys-and-Access-Needed]] for exact checks and external-service gates. Earlier installation blockers were resolved by the owner installing dependencies and Docker; the coding session can reach the database services directly.

## External services remain unverified

The current hosting target is Vercel + Oracle Cloud VM + Supabase database/Storage/Edge Functions. Root `deploy.md` and `deployment-needed.md` supersede the earlier Render plan. Docker/Compose/Caddy and private-schema/TLS configuration are prepared; the actual Linux/ARM image build and hosted checks remain unverified because Docker Engine access and cloud credentials are unavailable in this session. `render.yaml` is historical and must not be deployed unchanged with the new private-schema/TLS requirements.

The backend now has installed dependencies and a lockfile; TypeScript, backend/Admin build, seed and local cart integration pass. Razorpay keys, real payment/refund/webhook tests, Supabase migrations/deployment, mail delivery and hosted operations are still pending. The Windows dev watcher's `taskkill` is restricted in this sandbox; the local server can run without the watcher with development-mode `medusa start`.

## Static mirror remains beside the storefront

Root `index.html`, `_next/`, `art/`, `collectible/`, `experience/`, `brand/` and `api/image.js` are the older mirror bundle. Live assets are under `public/`. The root `README.md` now identifies the active app, but the mirror has not been removed.

## Catalog has a transition path

With complete Medusa settings, tee content, prices and size variants come from the Store API. Painting/collectible content comes from an explicit visible, channel-linked commission projection; request validation uses this same database-backed list. Without settings, `lib/catalog.js` supplies the local preview and the bag stays device-local. Locally verified seed: 15 published tees, 90 variants, 30 unpriced drafts. See [[Database-and-Storefront]] for Admin editing and visibility. The production seed still requires inspection after deployment.

## Inventory and operations remain inactive

Legacy `remaining` counts and `biddingAvailable` in `lib/catalog.js` are static. Shipping is seeded with a zero-price placeholder, and tax/stock rules require approval. Razorpay checkout is implemented but gated. Commission/order mail contracts pass local mocked tests; actual delivery remains unverified.

## Project hygiene

- There is no Git repository in this workspace. The backend lockfile is now present.
- Unused legacy dependencies and static assets remain. Keep them out of new integrations and remove them in a separate cleanup.
- The backend's temporary `.npm-cache` from the failed install is ignored. Platform approval policy prevented its recursive cleanup in this workspace.

## UI behaviours still worth checking in a browser

- Quick-add dialog focus trap and scroll lock on narrow screens.
- Medusa-backed add/update/remove cart flow after the backend is running.
- Commission form delivery and its error states after Supabase and Resend are configured.
