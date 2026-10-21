# What I need to finish deployment

**Current verified state (21 October 2026):**

- Storefront: `https://baetee.com` and `https://www.baetee.com` are attached to Vercel project `baetee-clone`.
- Source: `https://github.com/anni027/baetee.git`, branch `master`, commit `c6c9c7f12551c5c6164f87da73d5d63b0b00dee6` is present remotely.
- DNS: `baetee.com` uses `aster.dns-parking.com` and `helios.dns-parking.com` (Hostinger DNS).
- Planned backend hostname: `api.baetee.com`.
- Supabase project reference: `fmugesosbfajrmhlbavb`; its production database/storage credentials still need to be configured privately.
- Production catalog choice: start from the approved fresh seed.
- A dedicated Oracle SSH key exists locally at `C:\Users\User\.ssh\baetee_oracle_ed25519`; paste only the `.pub` file into Oracle. Never upload or share the private key.
- Vercel production currently has no application environment variables, so live Medusa catalog/cart/checkout cannot work until the backend is deployed and those values are added.

Fill in the non-secret answers here or send them in chat. **Do not paste passwords, private keys or API secrets into this file or chat.** Put secrets directly in the private destination listed below and tell me when they are set. None of the following accounts/resources has been provisioned by this implementation.

## 1. Hosting, domains and access

| Needed | Your answer | Why |
|---|---|---|
| Final store URL | `https://baetee.com` | Vercel domain, exact Origin checks, catalog image base |
| API/Admin hostname | `api.baetee.com` | Oracle HTTPS, Admin bundle and gateway webhook |
| DNS provider/project access | Hostinger DNS; user must add the API A record after the VM has an IP | Store/API records and email sender verification |
| Private Git repository URL and branch | `https://github.com/anni027/baetee.git`, `master` | Vercel import and repeatable Oracle releases |
| Vercel team/project access and eligible commercial plan | CLI access confirmed for project `baetee-clone`; commercial plan still needs confirmation | Deploy storefront and set private server environment |
| Oracle tenancy/home region and VM availability | Pending | Select the allowed free resources and a nearby Supabase region |
| Oracle VM public IP, Ubuntu version and architecture | Pending | SSH, DNS and native ARM64/AMD64 image build |
| Oracle VM shape, OCPUs/RAM/disk and confirmed Console estimate | Pending | Stay inside the actual free allowance; current documented A1 allowance is 2 OCPUs/12 GB total |
| Trusted deployment SSH account/access method | Pending | Install Docker, configure runtime files and run migrations; keep the SSH private key in your local SSH agent |
| Trusted Admin and SSH public IPs/VPN CIDRs | Pending | Oracle firewall and Caddy Admin allowlist; include IPv6 if your browser uses it |
| Certificate/contact email | Pending | Caddy certificate account notices |

Use project invitations or a trusted SSH session. A cloud API key is not required for the manual VM deployment path. Creating billable resources or publishing the actual store comes after the prepared configuration is reviewed.

## 2. Supabase project and database

| Needed | Where to configure it |
|---|---|
| Project reference, URL and region | Non-secret project details; URL also goes to Oracle/Vercel |
| Permission to run the supplied private-schema bootstrap and quota migrations | Supabase SQL editor / trusted administrator connection |
| Unique password for `baetee_medusa` | Set privately on the DB role, then in Oracle `backend.env` as the URL-encoded password inside `DATABASE_URL` |
| Actual session-mode hostname/port, or tested direct IPv6 endpoint | Oracle `DATABASE_URL`; use session port 5432, never transaction port 6543 |
| Downloaded database CA certificate | VM `deploy/oracle/certs/supabase-ca.crt` |
| Service-role key for the commission quota | Vercel `SUPABASE_SERVICE_ROLE_KEY`; never browser code |
| Public product bucket name and file URL | Oracle `S3_BUCKET`, `S3_FILE_URL` |
| S3 endpoint, region, access key and secret | Oracle `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` |
| Confirmation `medusa` is excluded from Data API exposed schemas | Supabase dashboard; required before launch |
| Backup plan, storage quota and project connection limit | Hosting/operations decision |

The supplied SQL creates the private commerce schema and restricts API-role grants. It does not create/set a real login password or copy local data automatically. Medusa manages its own Admin users; Supabase Auth email/password is unrelated to Admin login.

## 3. Razorpay

User already selected Razorpay; keys can still be supplied later.

| Needed | Destination |
|---|---|
| TEST Key ID and TEST Key Secret | Oracle `backend.env`: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| TEST webhook secret | Oracle `RAZORPAY_WEBHOOK_SECRET` and the same Razorpay webhook configuration |
| Automatic capture enabled | Razorpay dashboard |
| Final public backend hostname | Webhook `https://API_HOST/hooks/payment/razorpay_razorpay`, subscribed to `payment.captured` |
| Live credentials and live webhook | After actual test purchase/refund checks pass |

No gateway secret belongs on Vercel or in `NEXT_PUBLIC_*`. The frontend receives only the public Key ID and server-created checkout details when payment is enabled.

## 4. Email via Supabase Edge Functions + Resend

| Needed | Destination |
|---|---|
| Resend account/API key | Supabase function secret `RESEND_API_KEY` |
| Verified sender domain/address | DNS plus Supabase `EMAIL_FROM` |
| Commission alert inbox | Supabase `COMMISSION_RECIPIENT` |
| Order alert inbox | Supabase `ORDER_RECIPIENT` |
| Supabase permission to deploy both Edge Functions | Project access / authenticated CLI session |

A separate shared `EMAIL_FUNCTION_TOKEN` will be generated and set identically on Supabase, Oracle and Vercel. The mail service sends real messages only after private delivery tests and activation. Receiving inboxes should be accessible to the responsible store operator.

## 5. Store decisions

| Decision needed | Your answer |
|---|---|
| India shipping fee and supported locations/postcodes | Pending; seeded zero-cost shipping is a placeholder |
| Whether approved tee prices include GST and the applicable tax setup | Pending |
| Made-to-order availability/stock rule | Pending |
| Seller/business details and public support email | Pending |
| Public privacy contact | Pending; sets `PRIVACY_CONTACT_EMAIL` on Oracle and Vercel |
| Commission retention period in days | Pending; positive integer for `PRIVACY_RETENTION_DAYS` on Vercel |
| Order-record/mailbox retention and actual deletion procedure | Pending |
| Refund/return/cancellation process | Pending |
| Admin owner email and any additional staff roles | Owner email supplied previously; create through a one-time invite and use a fresh password plus MFA |
| Production data choice | Approved original fresh seed |

No new prices, shipping/tax amounts, delivery promises or inventory claims will be invented. The original approved tee prices stay intact unless you approve a change.

## 6. Secrets I can generate during setup

You do not need to invent these. They must be generated independently and stored privately:

- Oracle `JWT_SECRET`, `COOKIE_SECRET`.
- Redis password, matching in `redis.conf` and `REDIS_URL`.
- Shared `EMAIL_FUNCTION_TOKEN`.
- Vercel `RATE_LIMIT_SALT`.

Production Medusa region ID and publishable storefront key are created by the new backend seed/Admin and then copied to Vercel. Local IDs and application secrets must not be reused.

## 7. Recovery and launch access

- Encrypted backup destination outside the Oracle VM/Supabase project, owner and retention period.
- Accepted maximum data loss and downtime, and a successful staging restore drill.
- Health/error/job monitoring destination and the operator responsible for failed payment/mail jobs.
- A private staging deployment/project for real Razorpay test-mode and mail checks.
- Approval of the actual hosting plans/costs and final domain cutover when staging checks pass.

## Current activation state

Keep `CHECKOUT_ENABLED`, `STORE_RULES_VERIFIED`, `ORDER_DELIVERY_VERIFIED`, `RAZORPAY_LIVE_VERIFIED` and `COMMISSION_DELIVERY_VERIFIED` false until their checks in [deploy.md](deploy.md) pass. Catalog browsing and the database cart can be deployed before payments/email are activated.

## Immediate next handoff

Create the Oracle instance and provide only these non-secret details:

1. Oracle home region and availability domain.
2. VM public IPv4 address.
3. Confirmation that the image is Ubuntu 24.04 ARM64, shape `VM.Standard.A1.Flex`, with 2 OCPUs, 12 GB RAM and at least a 50 GB boot volume.
4. Confirmation that the public key from `C:\Users\User\.ssh\baetee_oracle_ed25519.pub` was added and SSH uses the `ubuntu` account.

Do not send the private SSH key, database password, Supabase service-role key, Razorpay secret or webhook secret in chat. Those are entered directly into the private VM/Supabase/Vercel destinations during deployment.
