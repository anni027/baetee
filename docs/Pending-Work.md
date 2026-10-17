---
title: Pending work
type: status
tags: [roadmap, blocked, pending]
updated: 2026-10-14
---

# Pending work

Medusa is installed, running locally, seeded and connected to the storefront. Product content, commission visibility, prices and cart amounts now read from its database-backed APIs; local integration checks verify product edits and hiding/removal. See [[Database-and-Storefront]]. Razorpay, controlled checkout, durable refund recovery and commission/order email code are implemented. Checkout and commission delivery remain disabled. See [[Backend-Implementation]] for checks already passed and [[Keys-and-Access-Needed]] for owner inputs.

## Needed to activate the backend

1. Add Razorpay test credentials; configure automatic capture and the public signed webhook; attach the provider to India. Exercise a test purchase, duplicate callbacks/webhooks and partial/full refunds in the actual gateway.
2. Configure Supabase, apply both quota migrations, deploy the Edge Functions, verify the Resend sender and test owner/customer delivery. Confirm actual Supabase role permissions and request rate limits.
3. Approve and configure India shipping charges, GST/tax handling and made-to-order stock policy. The seeded zero-cost shipping option is a placeholder.
4. Publish privacy contact and retention details and arrange email/mailbox deletion. Rotate any Admin password exposed in chat.
5. Deploy Vercel + Oracle + Supabase using root `deploy.md` and supply the inputs in `deployment-needed.md`. Verify the native Docker build, HTTPS/Admin restrictions, private database schema/TLS, Redis persistence, uploads, cart, checkout and emails on actual services. Complete the dependency audit (advisory endpoint was unavailable here), monitor failed payment/mail jobs, configure database/storage/Redis backups and complete a restore drill before public launch.

## Remaining site and operations work

- Confirm supplier measurements for the numeric XS–XXL size chart.
- Confirm any additional fulfilment statuses or shipping notifications required beyond the current order receipt.
- Connect the weekly design-set automation.
- Initialize/connect source control and remove legacy static-mirror/dependency leftovers in a separate cleanup.

No real payment, refund, order email or commission email has been processed by the local controlled tests. Service activation cannot be completed until the owner supplies the credentials and store rules.
