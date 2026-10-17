---
title: Changes
type: log
tags: [changelog, decisions]
updated: 2026-10-10
---

# Changes
## Approved on 5 October 2026
- Make T-shirts the main shopping experience.
- Assign each T-shirt one fixed randomly selected price from ₹3,499, ₹3,999, ₹4,499, ₹4,999, ₹5,499.
- Move paintings and collectibles into a separate Commissions section.
- Use Submit your commission, without a listed price, for both categories.
- Retain the BAETEE artwork and branding.

## Implemented
- T-shirt storefront, dedicated product pages and size selection.
- Device-local bag with quantity controls and current catalogue pricing.
- Existing bag items migrate to current tee prices, without trusting old stored prices.
- Commission pages and enquiry forms with optional budget.
- Privacy and storage policies updated for current functionality.

## Pending
Payment provider and email destination/service credentials are missing. Checkout and commission submission are explicitly disabled. No order, payment or commission delivery is simulated. The user approved proceeding with the storefront while these connections remain pending.

## Navigation and alignment fixes — 5 October 2026
- The user reported the Commissions navigation did not respond. All Commissions entry points now use direct page links, avoiding dependence on client routing.
- Removed the homepage range and garment-only commission caption. Individual T-shirt prices are unchanged.
- Product photos now fill identical frames, removing uneven letterboxing from different source aspect ratios. Full uncropped photographs remain available on product detail pages.
- Product names reserve two lines, so supporting text, prices and size links stay aligned within each row.

## Commission-card alignment — 5 October 2026
Applied the matching thumbnail frames to paintings and collectibles as well as T-shirts. Narrow source artwork no longer produces side padding. The previews use cover within a shared 4:5 frame, while detail pages still show the complete artwork. Card titles and descriptions reserve consistent space, and commission links align at the bottom of each row. Keyboard focus stays visible inside the thumbnail frame.

## Artist story and brand mnemonic — 5 October 2026
Added an About the artist section on the storefront and Commissions page. The supplied facts: Zeki Gilani is a four-year-old boy, president of Green Park Gardening Club, and creates art connecting gardening with life. The section uses existing collection artwork; no invented portrait or child photograph is used.

Replaced display numbers on the hero, T-shirt cards, commission cards and product images with the existing BAETEE ribbon mnemonic. Product IDs remain internal for links and shopping bag operations. Prices and quantities remain visible. The footer links to About Zeki.

## Shopping-focused homepage — 5 October 2026
Made the hero compact on desktop and side-by-side on mobile, so the catalogue appears sooner. Added catalogue sorting and a size-selection dialog on each card, using the same shopping bag as product details. Fixed catalogue prices remain unchanged.

Headline and short description rotate through five prewritten variations on each new homepage visit. A device-local index prevents immediate repetition. Back/forward cache restores also advance the copy. No automatic timer or generated text changes while visitors shop. If browser storage is unavailable, the homepage still renders safely.

## T-shirt artwork stories — 5 October 2026

Added a distinct short interpretive note to all 15 T-shirt product pages, describing the visible painting and connecting it to BAETEE’s tribute to the daughters of India. Each includes the shared dedication to their influence in India and around the world. Copy is in [[Artwork-Stories]] and `lib/artwork-stories.js`; no named historical subjects or biographical claims are introduced. Prices, size selection and bag actions remain in place.

## Recommended T-shirt alignment — 5 October 2026

The PDP recommendations were still using `object-fit: contain` on mixed square, portrait and tall source photos, creating unequal bands. They now share the main collection’s 4:5 image wrapper, centre crop, brand mnemonic and title/price spacing. Images are positioned inside a definite frame so intrinsic source proportions cannot change its geometry. Full product photographs remain available on each PDP.

## Homepage image rotation and weekly design sets — 5 October 2026

The homepage photo now advances through five existing editorial images on each opening or restored browser visit. Product link, title and fixed price advance together. Weekly content request: five coordinated AI-created design sets (five T-shirt, five painting and five collectible images), added rather than overwriting existing designs, without AI-generated labels, following the latest user instruction. [[Weekly-Updates]] records the repeatable update process.

## Caption spacing, collectible stories and model framing — 5 October 2026

Removed fixed title and caption minimum heights that reserved empty space around the ivory metadata. Cards size their copy to content, with aligned actions and compact spacing. Commission collection cards now show the matching painting story; collectibles identify their source painting. Painting and collectible PDPs include the artwork story and dedication. All five rotating editorial photos use top-centred framing with no hover zoom to preserve the model’s head. Weekly imagery must have no AI-generated labels, following Malik’s later instruction.

## BAETEE product brand panel — 5 October 2026

Added the original BAETEE logo, painting-specific note, culture statement and dedication to the right-hand T-shirt PDP panel and the quick-shopping window shown in the user screenshot. The desktop quick-shopping window has a wider image/story arrangement; mobile stacks the story beneath the image and price and scrolls within the viewport. Reassurance uses established hand-painted, made-to-order details without invented reviews, certifications or fulfilment guarantees. Shared component: `ProductBrandStory.jsx`.

## Homepage benefits ticker — 5 October 2026

Converted the three benefits beneath the homepage hero into a seamless scrolling ticker, preserving their original text. Two equal repeated groups provide the loop. A keyboard-accessible pause/resume button controls movement; reduced-motion visitors see a static list. Repeated decorative text is hidden from assistive technology, which receives the original benefits once.

## Loose-fit size guide — 5 October 2026

User confirmed the T-shirts are loose fit and selected “Measurement guide first.” Added a shared Size guide button beside the size selector on full PDPs and quick-shopping windows. The dialog explains laid-flat chest, length and shoulder measurements, using a preferred loose-fit tee as reference. Both selectors identify the relaxed fit. Numeric XS–XXL values remain absent pending confirmed supplier measurements; no guessed numbers or unsupported sizing recommendations are used.

## Store naming — 5 October 2026

Changed visible navigation and category labels from “Commissions” to “Collectibles” and “T-shirts” to the user-requested “Tee’s”. Singular product references use “Tee”. Existing commission routes and enquiry actions retain their functionality.

## Rotating BAETEE dedication — 5 October 2026

Added 12 curated variations of the dedication, preserving India’s daughters, courage, care, imagination and their influence at home and around the world. A shared client component advances the wording whenever a product view or quick-shopping window opens, including restored browser visits, and retains the existing italic typography. The most recently shown variation is remembered locally to avoid consecutive repeats. Text stays still while customers read.

## Product card action — 5 October 2026

Renamed the outside card action to “Add to bag”. It opens the product panel where the customer chooses a size, then confirms the cart addition. No default size is assumed and nothing is added before confirmation.

## Memory vault — 10 October 2026

Expanded the Obsidian vault in docs/ from five links into a full project memory layer built from a source scan: overview, codebase map, routes/API, catalog data, client state, design system, brand rules, pending work and an agent playbook. Added [[Known-Drift]] to record the mismatch between the older docs and the code (ProductView, CommissionCollection and Bag are orphaned; the product route ignores kind and renders tee content for painting/collectible URLs; checkout, commissions and the bag page are placeholders). Root README now points at the vault.

## Backend plan drafted — 10 October 2026

Drafted [[Backend-Plan]]: replace the disabled checkout/commission paths with a full custom backend using open-source self-hosted software — Medusa (commerce engine), PostgreSQL, Redis, Coolify on a VPS, Razorpay/Stripe as the only paid integration. Decisions taken: Medusa, VPS + Coolify, full-store scope. Seven phases with acceptance checks; awaiting user approval and answers to its open questions before any code is written.

## Backend implementation started — 10 October 2026

The user requested implementation and selected Razorpay, Vercel + Render, and Supabase Edge Function plus an email provider. Added a Medusa backend scaffold, Render Blueprint, approved catalog export and seed, a conditional Medusa read path for tee prices, commission validation/quota/email function, and updated product, bag, collection and policy routes. See [[Backend-Implementation]] for deployment steps, unverified runtime checks and checkout gates.

The tee detail page now selects a size and adds to the bag. The Medusa `order.placed` subscriber and a second authenticated Supabase Edge Function scaffold owner and customer order emails through Resend. Live order delivery, payment and Medusa runtime remain unverified.

## Local backend setup prepared — 12 October 2026

Added a local PostgreSQL/Redis Compose file, a script that generates ignored development secrets, and [[Keys-and-Access-Needed]] for owner handoff. Updated the Medusa Node engine range to include Node 24 LTS. `npm install` was attempted but the npm registry returned `EACCES`; no Medusa package or lockfile was installed. Docker, PostgreSQL and Redis were absent, so the backend could not run. The current runtime gap is recorded in [[Known-Drift]].

## Dependency installation retry — 12 October 2026

The root storefront `npm install` completed. Backend npm and pnpm retries still could not fetch Medusa metadata from `registry.npmjs.org`. A Docker Desktop install through Chocolatey also failed because the shell was not elevated and the Chocolatey registry was blocked. No backend dependency or system service was installed.

## Docker Desktop detected — 13 October 2026

Docker CLI 29.8.2 and Compose v5.6.0 are now installed. The Docker engine is not accessible from this sandbox user: Docker Desktop's backend cannot read `C:\Users\User\.docker` and exits before creating `docker_engine`. PostgreSQL and Redis containers therefore remain stopped.

## Local backend integrated — 14 October 2026

The owner installed Medusa and started the Docker services. Fixed seed type errors, commission draft options and a shared publishable-key sales-channel bug; seeded 15 tees/90 variants and 30 unpriced drafts, then connected the local storefront. Added Razorpay verification, controlled checkout, cart workflow quantity/commission guards and a durable PostgreSQL refund ledger that handles concurrent retries and lost responses. Added signed webhook validation before queuing, order email retries, bounded request parsing, email timeouts and quota cleanup/RLS hardening. Backend/Admin and storefront builds/typechecks pass; payment/refund fixtures and email contracts pass. Actual gateway/mail tests and hosted deployment remain gated because credentials will be supplied later. See [[Backend-Implementation]] and [[Pending-Work]].

## Storefront content connected to the database — 14 October 2026

Replaced the local-content merge with current Medusa product titles, thumbnails, subtitles, descriptions, prices and size variants. Commission listings/pages and request validation use an explicit public projection of opted-in, channel-linked commission products; private metadata and prices are excluded. Updated quick-add stories, collection tools, dynamic product IDs/counts and empty collections. The bag displays actual Medusa unit/line amounts and permits removal after a tee is unpublished. The seed adds missing commission display/visibility metadata and initial channel links while preserving Admin edits and subsequent hiding.

Both builds and typechecks pass. Backend tests pass (14), including commission visibility and field-boundary checks; lint has zero errors and the existing 12 image warnings. The localhost `verify:catalog` check created/deleted its own fixtures and verified product edits, images, stories, dynamic IDs, hidden item 404s, private metadata exclusion and unavailable cart removal. Standard catalog/concurrency and storefront cookie/cart/gate checks also pass. These checks did not process any real payment, refund, order or email. See [[Database-and-Storefront]] for the Admin editing guide; checkout and email activation still require the deferred owner inputs.

## Oracle and Supabase deployment prepared — 14 October 2026

The owner changed hosting to Vercel + Oracle Cloud VM + Supabase PostgreSQL/Storage/Edge Functions. Added root `deploy.md` and `deployment-needed.md`, native ARM64/AMD64 backend Docker packaging, an Oracle Compose stack with separate server/worker, authenticated persistent Redis, Caddy HTTPS and Admin IP restrictions, and private environment templates. Added Supabase private-schema/dedicated-role bootstrap, shared CA/hostname-verified database TLS configuration, transaction-pool rejection and a production preflight. Runtime scripts are copied into the compiled artifact. Vercel settings and longer API function budgets are prepared; Vercel production now requires its Medusa connection.

The schema check exposed upstream migration assumptions about existing public tables/global enum names. The deployment guide requires a fresh Supabase project, and database startup options now select the schema for unqualified migration SQL as well as ORM queries. Local schema verification uses a disposable empty database. No cloud resource, real secret, production data import or public deployment was performed. Docker Engine access is still denied, so the native image/Caddy/hosted services remain acceptance gates. The earlier Render Blueprint is historical.

Final local checks passed: both builds/typechecks, 16 backend tests, Medusa and refund migrations in an empty database's private schema with zero public tables, Compose validation and storefront HTTP/cart/service-gate checks. The test database was removed. Lint has zero errors and 12 existing image warnings. Current catalog/order data remained intact; hosted acceptance and the dependency advisory audit are still pending.
