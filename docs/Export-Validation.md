---
title: Export validation
type: reference
tags: [validation]
updated: 2026-10-10
---

# Export validation

Verified on 5 October 2026 using Node 24.19.0; the Vercel configuration selects Node 22.x, supported by Next.js 16.3.4.

- Fresh dependency installation completed.
- npm ci lockfile validation passed.
- Standard Next.js production build and TypeScript checks passed.
- Production server returned 200 for home, Tee PDP, collectible PDP, collections and bag.
- Invalid product returned 404.
- Unconfigured order and commission POST endpoints returned 503.

This validates the local export; no Vercel deployment has been created or verified.
