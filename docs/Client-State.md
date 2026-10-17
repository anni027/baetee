---
title: Client state
type: reference
tags: [state, cart, localstorage]
updated: 2026-10-10
---

# Client state

> [!note] Backend transition
> Checkout is gated. Without Medusa settings the bag is device-local. With Medusa configured, it uses a server-side Medusa cart ID in an HTTP-only cookie and prices from Medusa. The checkout and receipt flow are implemented; see [[Backend-Implementation]] for activation.

The local fallback and content rotation use browser storage. A configured Medusa cart persists line items in PostgreSQL. When checkout is enabled, the server also stores the supplied delivery/contact details and completed orders; email content goes to the configured provider and inboxes ([[Security]]).

## Keys

| Key | Written by | Shape |
|---|---|---|
| `baetee-cart` | `CartProvider` | `Array<{ id: number, size: string, quantity: number }>` |
| `baetee-home-copy` | `Storefront` | index into `homeCopy` (0–4) |
| `baetee-home-image` | `Storefront` | index into `heroImages` (0–4) |

## Local fallback cart flow

1. `CartProvider` mounts → reads `baetee-cart` → `cleanCart()` → `setItems` → `ready = true`.
2. Every change re-serialises to `baetee-cart` (guarded by `ready`, so an empty first paint never wipes storage).
3. `add(id, size)` merges into an existing line, quantity capped at 10. `update(id, size, quantity)` sets or removes (≤0 deletes).
4. `total` is recomputed from the supplied preview products and quantities — the stored item never carries a price.

## `cleanCart(raw)` sanitisation (`lib/cart.js`)

Tolerates both current items and a legacy `key` string form (`key.split('-')[2]` → id, `[3]` → size):

- drops non-objects, unknown tee ids
- size must be in `XS S M L XL XXL`, otherwise falls back to `M`
- quantity coerced to integer, clamped 1–10
- duplicate id+size lines merge (cap 10)
- returns `[]` for any non-array input

Every mutation is also clamped to 10 in `CartProvider`, so tampering with storage cannot raise quantities above 10.

## Medusa cart and checkout

`CartProvider` loads `/api/cart`, then applies server responses after add/update/remove. The HTTP-only `baetee-medusa-cart` cookie identifies the anonymous cart; quantities and prices are checked by Medusa. Each response supplies actual unit/line amounts, line ID and availability; a hidden tee remains removable even after leaving the public catalog. An empty database catalog still uses the server cart. Workflow hooks enforce the quantity cap under a shared lock. Once a Razorpay session starts, item additions/updates are locked. Completion verifies the server-stored gateway order and captured amount, and successful receipts refresh the bag. The same cookie can retrieve a safe receipt summary; a later new cart replaces it.

## Rotation state

`Storefront` advances copy and hero image once per page visit (plus on `pageshow` with `e.persisted`, i.e. back/forward cache restore). `nextCopyIndex(previous, length)` returns `previous + 1` when valid, else `0` — no immediate repeat, no timers while shopping. If storage is unavailable, everything still renders (all access is `try/catch`).

## In-memory only

- `selected` / `size` / `added` in the quick-add dialog
- `size` / `added` in the PDP
- `sort` in the catalogue section
- cart `items` in React state between provider re-renders

## Invariants

- Browser state is untrusted: never read a price from it, never treat it as an order ([[Security]]).
- Storage failures must degrade silently — the site has to render without `localStorage`.
