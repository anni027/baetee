---
title: Backend plan
type: plan
tags: [plan, backend, medusa, pending-approval]
status: in-progress
created: 2026-10-10
updated: 2026-10-10
---

# Backend plan — original proposal and acceptance checks

**Status: approved and in progress.** The user requested implementation on 10 October 2026. See [[Backend-Implementation]] for what is built, verified and still gated. Hosting decisions changed to Vercel + Render, and email to Supabase Edge Function + an email provider.

> [!warning] Hosting and email sections below are historical proposal text. The selected architecture is Vercel + Render + Supabase Edge Functions with Resend as the email sender scaffold. Follow [[Backend-Implementation]] and `render.yaml` for current setup. The phase acceptance checks still apply.

Plain-English terms are explained the first time they appear. Read with [[Pending-Work]] (what's disabled today) and [[Known-Drift]] (what the current code actually does).

## 1. The goal

Replace the "hosted-commerce" way of running a shop with **your own backend made entirely of free, open-source, self-hosted software**. No Shopify, no monthly commerce SaaS, no per-sale platform fee. You own the code and the server.

You still need two paid third parties that *cannot* be self-hosted (they move real money and must be licensed):

1. **Payment provider** — e.g. Razorpay or Stripe, the company that actually charges the card/UPI and sends you money. They take a small % per sale.
2. **Server** — one virtual server (VPS) to run everything (~€5–10/month).

Everything else — store engine, admin panel, database, email sending, HTTPS, deployments — is open source running on that server.

## 2. What replaces what

| Job | Today | Replaced by (open source) |
|---|---|---|
| Commerce engine (products, cart, orders, prices) | nothing — disabled | **Medusa** (Node.js/TypeScript, MIT licence, self-hosted) |
| Store manager UI (the "Shopify admin") | none | **Medusa Admin** — included, runs on your server |
| Product/cart/checkout APIs for the site | none | **Medusa Store API** |
| Database | none | **PostgreSQL** |
| Cache / background jobs | none | **Redis** |
| Image uploads | files in the repo | **Medusa uploads** on a backed-up server volume (MinIO later if needed) |
| Sending commission + order emails | disabled (503) | Medusa notification module over **SMTP** (self-hosted Postfix or your existing mailbox — see open questions) |
| Payments | disabled | **Razorpay or Stripe** via a Medusa provider (the one paid piece, unavoidable) |
| Running it all (HTTPS, deploys, backups) | Vercel (serverless, can't host this) | **Coolify** — open-source, self-hosted PaaS on your VPS |
| Your storefront | current Next.js app | **stays** — it becomes the custom storefront talking to Medusa |

Why Medusa (vs Saleor/Vendure/Sylius): it's the same language as your existing store (one TypeScript stack), MIT-licensed (no strings), lightest to run (~2 GB RAM vs 4 GB), monthly releases (v2.19, Aug 2026), and it calls itself "the open-source Shopify alternative". Saleor (Python) was the runner-up — see [[Project-Overview]] for the preflight.

## 3. How it will look

```
Browser
  └─ Your Next.js storefront (design unchanged: burgundy/ivory, 4:5 frames)
        │  Store API (read products, cart, checkout)
        ▼
Medusa backend ── server + worker processes
        ├─ PostgreSQL   (products, orders, customers)
        ├─ Redis        (jobs, cache)
        ├─ uploads vol  (product images)
        └─ SMTP ──────► commission + order emails
                 ▲
   Razorpay/Stripe ── webhook (payment confirmed) ─┘
                 ▲
   Medusa Admin (you: change prices, see orders, manage stock)

All of the above: Docker Compose on your VPS, managed by Coolify
```

**Key simplification:** you never write cart/order/payment logic yourself. Medusa already has it, tested and maintained by a community. You configure it and connect your storefront.

## 4. Plan phases

Each phase has an acceptance check. A phase is done only when its check passes; failed checks are reported honestly, never faked (constitution §1).

### Phase 0 — Decisions & prep (half day)
- `git init` this folder (no repo exists today — see [[Known-Drift]] §7).
- Choose domain name, payment provider, and where transactional email comes from (open questions §7).
- Install Docker locally; run the stock Medusa starter to see it working before touching our code.

**Check:** Medusa demo store runs on your machine with its admin panel.

### Phase 1 — Server foundations (1–2 days)
- Buy/prepare VPS (4 GB RAM minimum), install **Coolify**.
- Deploy via Docker Compose: PostgreSQL, Redis, Medusa (server + worker modes), Medusa Admin behind HTTPS.
- Secrets generated per server (`JWT_SECRET`, `COOKIE_SECRET`, etc.), automated daily backups of Postgres + uploads, health checks.

**Check:** admin panel reachable at `admin.yourdomain.com` over HTTPS; backup restores into a clean instance.

### Phase 2 — Catalog migration (1 day)
- Create the **15 tees** in Medusa: each size (XS–XXL) becomes a *variant* — that's how Medusa models size/SKU — with the exact fixed prices from [[Pricing]]. Nothing else: prices stay approved, never re-rolled.
- Paintings (15) and collectibles (15) added as **commission-only products** with purchasing disabled (enquiry, not checkout) — same rule as today ([[Brand-and-Copy]]).
- Upload images; attach artwork stories/manifestations as product metadata (content from `lib/artwork-stories.js`, [[Artwork-Stories]]).
- `lib/catalog.js` stops being the source of truth; it becomes a read-through or is deleted once the storefront pulls from Medusa. [[Catalog-Data]] gets rewritten.

**Check:** admin shows 15 tees × 6 sizes with prices matching [[Pricing]] to the rupee; no painting/collectible has a buy button.

### Phase 3 — Storefront integration (3–5 days)
- Existing Next.js app talks to Medusa Store API: catalogue list, product page, cart, checkout. Design tokens untouched — it must look identical ([[Design-System]]).
- Cart moves from `localStorage` to a Medusa server-side cart (cookie session). [[Client-State]] rewritten.
- **Fix the drift while here:** wire or delete the orphaned `ProductView`, `CommissionCollection`, `Bag` ([[Known-Drift]]) — the Medusa-backed versions replace them.
- Payment provider integration (spike first: confirm a maintained Medusa provider exists for Razorpay; if not, use Stripe or write a thin provider — decision gate before coding).
- Test mode: full purchase end-to-end with test keys.

**Check:** on your own machine, add tee → choose size → pay with test card → order appears in Medusa Admin with the correct total.

### Phase 4 — Commissions that actually send (1–2 days)
- Real enquiry form (name, email, piece, budget, message) → Medusa custom endpoint → email to you + confirmation to customer.
- Replace the 503 endpoints; server-side validation, body-size limits, **rate limiting**, same-origin checks, spam protection (honeypot first) — requirements from [[Security]].

**Check:** submitting the form delivers a real email; hammering it gets rate-limited; nothing is stored beyond what the privacy policy says.

### Phase 5 — Orders & operations (1–2 days)
- Transactional emails (order received / payment confirmed / commission received).
- Order statuses you actually use (e.g. pending → painting → shipped), refund procedure, and a plain daily routine: check admin, fulfil orders.

**Check:** a real test order runs through statuses with emails at each step you keep.

### Phase 6 — Security & compliance (1–2 days)
Work straight down the checklist already written in [[Security]]:
- webhook signature verification, server-side price calculation (Medusa default — do not bypass), duplicate-order prevention
- HTTPS everywhere, rate limiting, no secrets in repo, CORS locked to your domains
- privacy + cookie pages updated for the real data you now store ([[Pending-Work]] context), retention/contact details published
- dependency audit, admin panel not exposed without auth, backup restore drill

**Check:** every item in [[Security]] marked done with evidence; `npm run lint`, `typecheck`, `build` green.

### Phase 7 — Cutover (half day)
- Move DNS to the VPS; storefront deployed (recommendation: also on Coolify so the whole thing is self-hosted and Vercel can be dropped; fallback: keep the frontend on Vercel — it can call the backend over HTTPS fine).
- Final smoke: buy a real low-value item with a test/live payment, receive the email, see the order.

**Check:** a stranger can complete a purchase; you can fulfil it from the admin; the demo/disabled states are gone.

## 5. Effort, cost, risk

**Rough effort:** ~2 weeks of focused work (Phases 0–2 fast; Phase 3 is the bulk).
**Running cost:** VPS ~€5–10/mo + domain + payment-provider per-transaction fee. Zero licence fees (MIT/BSD all the way down).
**Main risks, stated plainly:**
1. **Email deliverability** — email sent from a fresh VPS can land in spam unless SPF/DKIM/DMARC are set up. Mitigation: Phase 4 includes authenticated sending; if it struggles, use an SMTP relay you already trust (decision in §7).
2. **Payment provider plugin availability** — spike before coding Phase 3; fallbacks named above.
3. **You become the operator** — patches, backups, uptime are ours, not a vendor's. Mitigation: Coolify + automated backups + the Phase 6 restore drill.
4. **Scope creep** — this plan deliberately excludes accounts/wishlists/ discounts/ multi-currency. Add later, separately.

## 6. What we will NOT do

- No Shopify or paid commerce SaaS anywhere.
- No hand-written cart/order/payment engine — we configure Medusa instead (existing-solutions preflight).
- No fake success: checkout/commission stay visibly "not connected" until Phase 3/4 acceptance checks genuinely pass ([[Security]]).
- No invented prices, sizes, stock counts, or claims ([[Brand-and-Copy]]).
- No schema/DB migrations to production without telling you first.

## 7. Decisions and open questions

1. **Payment provider:** Razorpay selected; custom provider, callback, webhook and refund recovery are implemented. Actual gateway tests and live verification remain gated.
2. **Domain name:** not supplied. Use the Render and Vercel generated HTTPS origins for setup, then update CORS when a domain is chosen.
3. **Email sending:** Supabase Edge Function plus an email provider selected. Resend is scaffolded as the sender; provider account, sender domain and recipient remain to be configured.
4. **Hosting:** Vercel storefront and Render backend selected, replacing the VPS/Coolify proposal.
5. **Repo:** not initialized here; this workspace exposes `.git` as read-only and no repository existed at the start.

## Approval

Implementation was requested by the user on 10 October 2026. See [[Backend-Implementation]] for current status.
