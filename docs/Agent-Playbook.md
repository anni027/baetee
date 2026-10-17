---
title: Agent playbook
type: guide
tags: [ai, agents, workflow, constitution]
updated: 2026-10-12
---

# Agent playbook

How an AI agent should work in this repo. Derived from [[constitution]], the code, and the recorded decisions. When these conflict with a stale doc, this note and [[Known-Drift]] win.

## Before you touch anything

1. Read [[Known-Drift]] — several documented components are not wired to any route.
2. Read [[Brand-and-Copy]] and [[Security]] — the "do not invent" rules are hard requirements, not style.
3. Find the real owner of the behaviour: Medusa for product content/prices and commission visibility when configured, `lib/catalog.js` for the approved import snapshot and unconfigured preview, `app/globals.css` for looks, `CartProvider` and `/api/cart` for the bag, and `app/*` for routes. See [[Database-and-Storefront]].

## Working rules

- **State assumptions, ask when ambiguous** (constitution §1). Present options instead of silently choosing.
- **Plan first for complex designs**, get approval, then implement (constitution §5). Keep questions and explanations in plain language.
- **Prefer React + shadcn components + motion.dev** for UI; that is the stack already in use — extend it, don't replace it.
- **Price authority**: Medusa Store API when configured; otherwise the approved local list in `lib/catalog.js`. The browser never supplies a checkout price. Product display content comes from Medusa; brand/editorial copy remains in `lib/*-copy.js`. `artwork-stories.js` supplies seed and preview text.
- **Disabled means disabled**: don't enable checkout, commissions or email by wiring a fake success. The fail-closed 503s and placeholders stay until [[Pending-Work]] is genuinely solved.
- **Never fabricate**: claims, sizes, prices, stock, reviews, transactions, people, or "AI-created" labels.
- **No credentials** in committed files, notes, tool output, or logs. Local `.env` files are ignored and hold only development secrets; production secrets belong in the platform settings.
- **Accessibility and motion**: keep `aria-*` labels, focus visibility, and reduced-motion handling intact when editing components.
- **Square corners, burgundy/ivory** — see [[Design-System]].

## Suggested change loop

```bash
npm ci                # fresh install (lockfile-validated)
npm run dev           # develop on :3000
npm run typecheck     # tsc --noEmit
npm run lint          # eslint .
npm run build         # next build --webpack (the release build)
```

Manual smoke after UI changes: `/` (hero rotation, sort, quick-add → bag count), `/product/tee/7`, `/checkout`, `/commissions`, `/privacy`.

## After you change something

1. Update the affected vault note(s) in the same change.
2. If you fixed or introduced a mismatch, edit [[Known-Drift]] immediately.
3. Append a dated entry to [[Changes]] with what and why (the file is the project's changelog).
4. If pricing changed, update [[Pricing]] and the metadata description in `app/layout.tsx` together.

## Definition of done

A competent operator following the vault ends with a working, comprehensible store: every visible action produces a visible outcome (or a visible, explained "not yet connected" state) — never silence.
