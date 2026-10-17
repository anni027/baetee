---
title: Routes and API
type: reference
tags: [code, routes, api]
updated: 2026-10-14
---

# Routes and API

| Storefront route | Behaviour |
|---|---|
| `/` | Database-backed tee content and prices, commission feature, quick-add size selection |
| `/product/tee/:id` | Tee details, size guide, add to the current cart |
| `/product/painting/:id`, `/product/baetee/:id` | Correct commission item and gated request form |
| `/checkout` | Bag and gated address/delivery/Razorpay flow; receipt only after server-confirmed order |
| `/commissions` | Painting and collectible collection |
| `/privacy`, `/cookies` | Current data/storage disclosures |

| Next.js API | Methods | Behaviour |
|---|---|---|
| `/api/cart` | GET, POST, PATCH | Cookie-bound Medusa cart; item/size/quantity validation, server totals |
| `/api/checkout` | GET, POST | Checkout gate, current-cart status, and address/prepare/complete proxy; cart ID comes from the HTTP-only cookie |
| `/api/requests`, `/api/bids` | POST | Commission validation, Supabase quota and authenticated mail call; 503 until configured and verified |

| Medusa custom endpoint | Methods | Behaviour |
|---|---|---|
| `/store/baetee/commissions` | GET | Explicitly visible, commission-only draft/published products in the key's sales channels; whitelisted display fields only |
| `/store/baetee/checkout` | GET | Public enabled/disabled status, requires publishable key |
| `/store/baetee/checkout/:id` | GET, POST | Sales-channel-checked cart, shipping, Razorpay preparation/completion and safe order summary |
| `/hooks/payment/razorpay_razorpay` | POST | Raw-body signature check before queuing; provider re-verifies signature, order/session association and captured amount |

All Store API calls require the correct publishable key. The standard public payment-session creation route is blocked in favour of the controlled checkout. The Medusa workflow completion hook enforces the activation gates even when callers bypass the Next.js UI.

Supabase `send-commission` and `send-order` accept server requests with the shared mail token. Their gateway JWT verification is disabled deliberately; token authentication in each function is required. See [[Security]] and [[Backend-Implementation]].
