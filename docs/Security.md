---
title: Security
type: reference
tags: [security]
updated: 2026-10-14
---

# Security boundaries

Medusa runs locally with PostgreSQL and Redis. Production configuration rejects wildcard/non-HTTPS origins and short/example application secrets. The localhost storefront uses a dedicated publishable key and an HTTP-only cart cookie (Secure in production, SameSite Lax). API credentials, gateway secrets and mail tokens remain server-side. The browser never sets a purchase price or decides that a payment succeeded.

The Oracle/Supabase deployment adds a private `medusa` schema, dedicated database role, CA/hostname-verified TLS for all database clients and rejection of transaction-pool endpoints. Runtime files carry secrets; Docker build arguments contain only the public API URL. Caddy restricts Admin/auth routes to configured owner IPs; only HTTPS ports are public, and Redis uses authentication, AOF and `noeviction`. These files require actual VM/container/network validation before public launch; see root `deploy.md`.

Product content is read on the Next.js server from Medusa. The custom commission projection requires explicit `commission_only` and `storefront_visible` boolean flags, draft/published status and a sales-channel match for the publishable key. It returns a fixed display-field list; generic drafts, variant prices and internal metadata are excluded. Tee metadata exposed by the standard Store API is public: never put secrets or private notes in tee metadata or product display fields. See [[Database-and-Storefront]].

The Next.js mutation endpoints require the configured store Origin and JSON content. A streaming reader enforces byte limits before parsing; null/array payloads are rejected. Origin checks protect browser requests but are not bot authentication. Commission quotas are durable in Supabase, with keyed email hashes, a global cap and per-email cap, restricted RPC grants and RLS. Stronger perimeter spam/traffic controls may still be needed under abuse.

Medusa's workflow hooks enforce tee-only purchasing and integer quantity limits inside its cart lock. They also reject checkout until the operator enables the flags, restrict orders to INR/India delivery and Razorpay, and check the cart amount against its payment session. Public manual payment session initialization is blocked. These rules are enforced by the backend even if someone bypasses the storefront buttons.

The Razorpay provider checks raw-body webhook HMACs with constant-time comparison and independently fetches gateway state. Browser callback signatures are bound to the server-stored order ID, then Medusa authorizes only a confirmed captured payment with matching amount, currency and session. Duplicate completion uses Medusa's order workflow. Capture checks never initiate a second charge.

Refunds have durable PostgreSQL operation records and gateway idempotency keys. A per-payment database lock serializes them; pending records survive API failures. Lost results recover the existing refund. External refunds, mismatched amounts or unresolved operations require reconciliation. Never clear ledger rows just to make a retry pass. Back up this ledger with the Medusa database.

Email functions require the shared secret, bound payload size, validate fields and send plain text. Provider delivery keys protect normal retries; Redis has bounded retry/backoff settings. Successful background jobs are retained up to one day and failed jobs up to seven days (cleanup occurs as the queue processes jobs); raw payment webhooks may include customer email/phone. Mailbox/provider retention is operational and is not enforced by `PRIVACY_RETENTION_DAYS`. The quota database holds keyed hashes and counters, and removes stale rows on subsequent submissions.

Local checks cover catalog prices, concurrency, checkout gates, payment verification/refund recovery and email function contracts. They do not establish production security or actual provider delivery. Before launch, validate real test-mode payments and refunds, signed webhooks, mail delivery, HTTPS/CORS, Admin account security, dependency audit, backups and restore. The user will supply credentials later; checkout and commission delivery remain closed until configured and verified.
