# Shop_It

Foundation for the Shop_It store (Next.js + Supabase + Mailgun + Google OAuth).

## Setup
1. Create a Supabase project and run `supabase/migrations/0001_init.sql` in the SQL editor.
2. Run `insert into admin_emails values ('your-email');` (do this before your first sign-in).
3. Supabase > Authentication > Providers: enable Google and paste your Google OAuth client ID and secret. Add the Supabase callback URL to the Google console's authorized redirect URIs.
4. Copy the values below into `.env.local` (never commit it).

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_FROM="Shop_It <orders@your-domain>"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Prices are stored in kobo (₦45,000 = 4500000).

## Run it
1. Also run `0002_place_order.sql` (atomic checkout) `0003_restock_on_cancel.sql` `0004_guest_checkout.sql` and `0005_storage_upload.sql`.
2. `npm install && npm run dev`, then open http://localhost:3000.
3. Deploy to Vercel and add the same environment variables there.

## What works
- Storefront: catalog from the database, category filter, search, dark/light themes
- Google sign-in, cart, sign-in-gated checkout with server-side pricing and stock locking
- Emails (Mailgun): order confirmation, payment received, status updates. Failed confirmations are retried by `/api/cron/emails` (set `CRON_SECRET`; `vercel.json` runs it daily, which is the Vercel Hobby limit).
- Admin at `/admin` (visible only to emails in `admin_emails`): orders with status updates, add and edit products, stock and visibility. Product images are pasted as URLs.
- Customers: "My orders" page

## Payments (Paystack) and guest checkout
- Set `PAYSTACK_SECRET_KEY` (use `sk_test_...` first). In the Paystack dashboard > Settings > API Keys & Webhooks, set the webhook URL to `https://YOUR-DOMAIN/api/paystack/webhook`. Customers pay by card, bank transfer or USSD on Paystack's page. The order is confirmed twice: when the customer returns to the order page, and by the webhook. Both re-check the payment with Paystack.
- Guests can check out, but only by paying online. Pay on delivery needs a signed-in account. Guests view their order through a private link in their email (`/order/SI-XXXX?t=...`).
- Fake-order controls: no pay, no order (unpaid online orders are cancelled after 45 minutes and the stock returns); prices and stock are checked on the server; at most 10 products and 5 of each per order; at most 2 unpaid orders per email and 4 per network address per hour; hidden honeypot field. If someone pays after their order expired, a `late_payment` row appears in `email_events` (status `needs_review`): refund it in the Paystack dashboard.
- Product images: in `/admin/products`, use the Upload image button (JPG, PNG or WebP, under 2 MB), then click Save.

## Not built yet
Automated tests.
