---
title: Architecture
type: reference
tags: [architecture]
updated: 2026-10-10
---

# Architecture

The active storefront is Next.js on Vercel. `app/`, `components/store/` and `lib/` render the current site; `public/` holds its images. The older root `index.html` and `serve.js` are a static mirror, not the active storefront.

Medusa in `backend/` is the commerce authority when configured and is running locally. The current deployment target runs separate server and worker containers, private persistent Redis and Caddy HTTPS on an Oracle Cloud VM. Supabase hosts PostgreSQL in a private `medusa` schema with a dedicated login role and verified TLS, plus Storage and mail Edge Functions. The seed imports 15 tees, six sizes each, and 30 draft commission-only products. Its Razorpay provider uses a durable PostgreSQL refund ledger. Deployment files are in `deploy/`; root `deploy.md` is the runbook. The earlier `render.yaml` is historical.

When Medusa environment values are complete, the storefront reads tee content/prices/variants from its Store API and commission display content from an explicit, channel-scoped public projection. Admin edits appear on a refreshed server request. `/api/cart` is the storefront's same-origin server proxy: it validates items, holds the Medusa cart ID in an HTTP-only cookie and returns actual Medusa line amounts and totals. With no Medusa configuration, the existing local preview remains available. A configured API failure does not fall back to local content. See [[Database-and-Storefront]]. Payment checkout stays closed until the Razorpay and operational checks in [[Backend-Implementation]] pass.

Commission requests go from `/api/requests` or `/api/bids` through validation and a durable Supabase SQL quota to an authenticated Edge Function. An `order.placed` Medusa subscriber calls a separate Edge Function. Both functions use Resend for owner and customer email. They require real service configuration and test delivery before their verification gates open.

Admin keys, Razorpay secrets, Supabase service keys and mail tokens stay server-side. The browser receives only public catalog data and bag summaries. See [[Security]], [[Routes-and-API]] and [[Backend-Implementation]] for boundaries, routes and current verification status.
