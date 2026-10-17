---
title: Backend implementation
type: status
tags: [backend, medusa, render, supabase]
updated: 2026-10-14
---

# Backend implementation

The user selected Medusa and Razorpay, and updated hosting to **Vercel + Oracle Cloud VM + Supabase PostgreSQL/Storage/Edge Functions**. Resend is implemented as the mail transport. Root `deploy.md` is the current deployment runbook; `deployment-needed.md` lists owner inputs. On 14 October, Medusa 2.21.2 runs locally against Docker PostgreSQL and Redis. Its Admin and backend build pass. The storefront is connected to the local Store API through ignored `.env.local` settings.

## Implemented and checked locally

- Catalog: 15 published tees, six size variants each with the approved INR prices, and 30 unpriced commission-only drafts. The seed is repeatable and preserves existing products and prices. A dedicated publishable key is linked only to BAETEE Online; a previously shared key caused ambiguous cart sales channels and was replaced in the local storefront settings.
- Catalog/cart integration: Medusa titles, images, descriptions, prices and variants on the homepage, product pages, commission listing, bag and optional collection tools. Explicit commission visibility and sales-channel checks protect drafts; the public projection excludes internal metadata and prices. HTTP-only cart cookie, same-origin cart proxy, bounded request parsing and actual Medusa line totals. See [[Database-and-Storefront]] for Admin editing and local checks.
- Cart policy: quantity checks execute inside Medusa's shared cart lock. Concurrent additions stop at 10 per variant. Commission products cannot be bought. Public manual payment session creation is blocked, and the completion hook requires Razorpay, India delivery, a matching payment amount and all activation gates.
- Checkout: contact/address, eligible shipping options, Razorpay session preparation, signature-verified callback, authenticated API verification of capture, idempotent Medusa order completion and a receipt. The backend coordinates repeated preparations with a shared lock. The normal public payment-session endpoint is blocked so the custom checkout controls preparation.
- Razorpay provider: INR-to-paise conversion, gateway order/session association, raw-body webhook signatures, capture verification and refund support. It requires automatic capture in Razorpay. Paid orders require explicit refunds; gateway orders cannot be voided, so session replacement is refused.
- Refund recovery: a PostgreSQL ledger persists the gateway idempotency key before sending money. Lost responses and lost Medusa writes reuse the recorded refund. An unresolved or external refund requires reconciliation before changing the amount. Its migration is included in the deployment build.
- Email: validated commission requests, durable Supabase quota, authenticated Edge Functions, plain-text owner/customer messages, stable delivery keys and timeouts. Order emails use `order.placed`; Redis event retries have bounded exponential backoff and stable subscriber identity.

Verification: backend and storefront typechecks/builds pass. Sixteen backend tests cover configuration, database TLS/schema restrictions, commission visibility, payment checks and durable refund recovery/concurrency; three Edge Function contract tests use a mocked email service. Live local Store API checks cover tee prices, six sizes each, concurrent quantity limits and closed checkout gates. Storefront HTTP checks cover page responses, cookie cart add/update/remove, server totals, Origin/JSON guards and disabled delivery. Lint passes with 12 image warnings. No real Razorpay payment/refund or delivered email was tested; no real order was created by these checks. The npm dependency audit could not reach its advisory endpoint in this sandbox and remains unverified. The new Oracle Compose configuration validates, but the Docker image/HTTPS/cloud connections still require VM checks.

## Run locally

```powershell
cd D:\print\baetee\backend
./scripts/prepare-local-env.ps1
docker compose up -d --wait
npm ci
npm run migrate
npm run seed
npm run connect:storefront
npm run dev
```

Start the storefront from the project root with `npm run dev`. Admin is `http://localhost:9000/app`. If no Admin user exists, create an invite in your own terminal with `npx medusa user -e YOUR_ADMIN_EMAIL --invite` and open the private invite URL locally. Never share the invite token or an Admin password. A password exposed in chat must be changed.

The generated local secrets stay in ignored `backend/.env`. The storefront connector preserves unrelated `.env.local` settings and never prints key values. Node 22.12+ or Node 24 LTS is supported. Backend scripts use TypeScript transpilation to avoid a Windows SWC cache ownership problem in this sandbox. Normal development uses the watcher; this sandbox can run `NODE_ENV=development npm start` without the watcher's restricted `taskkill` call.

Useful checks: `npm run typecheck`, `npm test`, and `npm run build` inside `backend/`; `npm run verify:backend` and `npm run test:email` from the root. `verify:backend` only targets localhost and creates development carts; it intentionally expects checkout to be disabled. Ledger tests create and remove their own fixture records in the local database.

## Activate Razorpay in a test deployment

1. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` to `backend/.env` or Render's secret settings. Use **test keys** first, and enable automatic capture in Razorpay. Restart Medusa, then run `npm run configure:razorpay` to attach `pp_razorpay_razorpay` to the India region.
2. Configure the webhook at `https://YOUR_MEDUSA_HOST/hooks/payment/razorpay_razorpay`, subscribe to `payment.captured`, and use the matching webhook secret. A public staging URL is required; do not use localhost.
3. Approve and configure shipping charges, taxes/GST and made-to-order stock rules. The existing zero shipping price is a placeholder. Publish the privacy contact and review order retention and refund policies. Set `PRIVACY_CONTACT_EMAIL` on both storefront and backend, and `STORE_RULES_VERIFIED=true` only after review.
4. Verify order email delivery in a test deployment, then set `ORDER_DELIVERY_VERIFIED=true` and `CHECKOUT_ENABLED=true` there. These flags are operator assertions, not automated evidence. Keep the public store closed during testing.
5. Complete real Razorpay **test-mode** purchases, exercise duplicate callbacks/webhooks and partial/full refunds, and inspect one correct order, capture and refund record in both Medusa and Razorpay. Gateway-mocked tests do not replace this step.
6. Live keys also require `RAZORPAY_LIVE_VERIFIED=true`. Only enable that during the controlled live cutover after sandbox checks pass. Confirm one small live purchase/refund before opening publicly.

Razorpay refunds must go through Medusa Admin. If a Dashboard refund or unresolved operation is detected, reconcile both systems and the refund ledger before retrying a different amount. Do not delete pending ledger rows to bypass this check. Automatic Redis retries occur within the email provider's idempotency window; inspect delivery state before manually replaying an old email event.

## Supabase and email

Apply both SQL files under `supabase/migrations/`, then deploy `send-commission` and `send-order`. Supabase secrets are `EMAIL_FUNCTION_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`, `COMMISSION_RECIPIENT` and `ORDER_RECIPIENT`. Verify the sender domain. The functions disable gateway JWT checking and enforce the shared token themselves; they reject missing/incorrect tokens.

Vercel needs the server-only commission settings in `.env.example`; Medusa's worker needs `SUPABASE_URL` and the matching email token. Set a real privacy contact and retention period, and arrange deletion in the email provider/mailbox; an environment value does not delete messages. The quota stores keyed email hashes, removes records older than 24 hours, and has RLS and service-role-only RPC access. Its Supabase migration and permissions still need live validation.

Test delivery privately before setting `COMMISSION_DELIVERY_VERIFIED=true`. Test order delivery before setting its delivery gate. No message was sent to an external recipient during local contract tests.

## Oracle, Vercel and Supabase launch work

The current runbook is root `deploy.md`. `deploy/oracle/compose.yaml` runs Medusa server/worker, persistent Redis and Caddy HTTPS on a VM; `deploy/supabase-medusa.sql` creates the private database schema and dedicated login role. All database clients share verified TLS and session-compatible connection settings. Application images receive no real build-time secrets. Admin routes are restricted to configured owner IPs.

Use a fresh Supabase project without existing Medusa public tables/global enum types: upstream initial migrations contain legacy existence checks. `npm run verify:schema` is the optional local disposable-database integration check. Connection startup options and ORM settings both select the private schema; the bootstrap also sets the dedicated role's search path.

Run migrations and production preflight before starting server/worker. Decide whether to import local Admin changes or use the original catalog seed. Configure Supabase Storage and Vercel with the new backend's publishable key/India region. Root `deployment-needed.md` lists domains, cloud access, keys, store rules and recovery decisions. The earlier Render Blueprint is historical and must be adapted before any future use.

Still required: service credentials and sender verification; shipping/tax/stock approval; actual gateway and mail acceptance tests; hosted deployment and exact CORS/HTTPS checks; database and storage backups plus a restore drill. No Render, Vercel, Supabase, Razorpay, DNS or backup deployment was performed here. Owner inputs are listed in [[Keys-and-Access-Needed]].
