---
title: Keys and access needed
type: handoff
tags: [backend, deployment, secrets]
updated: 2026-10-14
---

# Keys and access needed

> Current hosting is **Vercel + Oracle Cloud VM + Supabase PostgreSQL/Storage/Edge Functions**. Use root `deployment-needed.md` for the current owner checklist and `deploy.md` for deployment commands. The Render-specific account table below is historical and superseded; no Render resources are needed for the current target.

Medusa is installed, running locally and connected to Docker PostgreSQL/Redis. The backend lockfile, full catalog seed, backend/Admin build and storefront integration are now verified locally. Razorpay, checkout and commission/order email code are implemented. No live service credentials have been added, and the user chose to add keys later.

**Please do not put API keys in this file or commit them.** Configure them in Vercel, Render and Supabase secret settings, or in ignored local `.env` files. Do not send live secret values in a public issue or repository. Share access to the projects or tell me when the settings are present; I can then verify names and run the integration steps without displaying their values.

## Local setup is ready

| Needed | Why |
|---|---|
| Medusa dependencies and lockfile | Installed by the owner; backend/Admin build and typecheck now pass. |
| Docker PostgreSQL 17 and Redis | Running and reachable locally. `backend/compose.yaml` manages them. |

No gateway or mail key is needed merely to run the local catalog/cart. To start again:

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

The Admin will be at `http://localhost:9000/app`. The local secrets file is ignored by Git. Do not reuse its database password or application secrets in production. Install the supported Node 22 or 24 LTS runtime; this machine already has Node 24.

## Accounts and settings for the live store

| Service | Access or settings needed | Where they go |
|---|---|---|
| Render | Project access and billing approval for PostgreSQL, Key Value, Medusa web and worker services. | Create the Blueprint from `render.yaml`; its database/Redis URLs and JWT/cookie secrets are generated or linked there. |
| Vercel | Storefront project access and its HTTPS URL. | Vercel project environment. Set `PUBLIC_STORE_URL`; later set `MEDUSA_BACKEND_URL`, `MEDUSA_PUBLISHABLE_KEY`, and `MEDUSA_REGION_ID`. The last two are created by Medusa after the seed. |
| Supabase | Project access and project URL; service role key for the commission quota; Storage bucket and S3-compatible endpoint, region, access key and secret key for product uploads. | `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on Vercel. `S3_FILE_URL`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_BUCKET`, `S3_ENDPOINT` on Render. Apply the SQL migration and deploy both Edge Functions in the Supabase project. |
| Resend | Account, API key, verified sending domain/address, and your recipient email addresses for commission and order alerts. | Supabase function secrets: `RESEND_API_KEY`, `EMAIL_FROM`, `COMMISSION_RECIPIENT`, `ORDER_RECIPIENT`. |
| Razorpay | Test Key ID, Test Key Secret and webhook secret; automatic capture enabled. Live keys are needed after the full test order/refund path passes. | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` in ignored `backend/.env` for local tests, and Render secrets for hosted tests. Never use `NEXT_PUBLIC_` for a secret. |
| Source repository | A Git repository connected to Render and Vercel, or another supported deployment source. This folder is not a Git repository yet. | Project source settings. |

The generated Render and Vercel URLs can be used first; a custom domain is optional. The exact HTTPS origins are needed for `STORE_CORS`, `ADMIN_CORS` and `AUTH_CORS`. A strong shared `EMAIL_FUNCTION_TOKEN` and separate `RATE_LIMIT_SALT` can be generated during deployment; the email token must match between Supabase and the calling servers.

## Store decisions needed before accepting payments

- Confirm the India shipping charge and service area. The seed currently has a zero-price shipping **placeholder**.
- Confirm whether the approved tee prices include GST, the applicable tax setup, and the made-to-order stock rule.
- Provide the public privacy contact email, commission retention period and order-record retention policy, and arrange deletion of messages from the mailbox/provider to match the published period. Set `PRIVACY_CONTACT_EMAIL` on Vercel and both Render services, and `PRIVACY_RETENTION_DAYS` on Vercel.
- Confirm the seller/admin email and refund or return procedure.

The commission/order delivery gates and `CHECKOUT_ENABLED`, `STORE_RULES_VERIFIED`, `RAZORPAY_LIVE_VERIFIED` start false. Follow [[Backend-Implementation]] to configure the provider, webhook and test deployment; flags are operator assertions and do not replace real delivery/payment checks.
