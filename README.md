# BAETEE storefront and backend

The active storefront is the Next.js app in `app/`, `components/`, and `lib/`. Run `npm install && npm run dev` for the current site. The Medusa commerce backend is in `backend/`. Deployment targets **Vercel + Oracle Cloud VM + Supabase PostgreSQL/Storage/Edge Functions**. Read [deploy.md](deploy.md) for the deployment sequence and [deployment-needed.md](deployment-needed.md) for the required access, secrets and store decisions. The earlier `render.yaml` is a historical alternative.

Payment checkout remains disabled until Razorpay, order email, shipping and tax rules, and live service tests pass. Commission delivery stays disabled until the Supabase Edge Function and email service are verified. Local environment templates are `.env.example` and `backend/.env.example`.

The storefront now reads product content and cart amounts from Medusa's PostgreSQL-backed APIs. Edit products in Medusa Admin, then refresh the website. See [database and storefront guide](docs/Database-and-Storefront.md) for product fields, visibility and local verification.

## Legacy static mirror

Project context lives in the Obsidian vault at [`docs/`](docs/README.md).

A static mirror of https://baetee.com/ (front-end only, single-page experience).

## Structure

- `index.html` — the page (React SSR output with embedded RSC payload)
- `_next/` — JS chunks + CSS
- `art/` — 10 high-res artwork PNGs (also used as CSS backgrounds)
- `collectible/` — 10 collectible figure PNGs
- `experience/` — 3 lifestyle/detail PNGs
- `brand/` — logo lockup + favicon mark
- `serve.js` — local server that also emulates the `/_next/image` optimizer endpoint

## Run locally

```bash
cd baetee
node serve.js
# open http://localhost:8911
```

`serve.js` maps `/_next/image?url=%2Fart%2F01-….png&w=…&q=…` to the real file,
so every image (hero, gallery, CSS backgrounds, favicon) resolves locally.

Opening `index.html` directly via `file://` will show the page but **not** the
`/_next/image`-served pictures — use the included server.

## Notes

- Purely client-side after load: intro animation, gallery, bag drawer all work.
- There is no checkout backend in a static clone; the bag UI is visual only.
