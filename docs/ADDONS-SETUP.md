# Pre-launch add-ons: setup

Covers influencers and coupons, gift vouchers, broken-link monitoring, the admin
dashboard, the package archive and drafts for package content.

## 1. Database
Run `supabase/migrations/20261122000000_orders_coupons_vouchers.sql` on the
Supabase project. It adds orders, rooms, coupons, influencers, vouchers,
link checks and analytics tables, and it locks `petite_profiles` so customers
can no longer write their own purchases.

## 2. design-back environment (Vercel)
| Variable | Purpose |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for orders, coupons and admin data (required) |
| `PAYMENT_PROVIDER` | `demo` until a real gateway is connected (approves every charge) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Voucher emails, order confirmations, weekly link report |
| `ADMIN_EMAIL` | Recipients of the weekly broken-link report (comma separated) |
| `CRON_SECRET` | Authorizes the daily `/api/cron/link-check` Vercel Cron |

## 3. Still open before launch
- Connect a real payment gateway in `design-back/src/lib/payments.js` (plus invoices).
- Verify the sender domain in Resend.

## Tests
- Backend logic: `cd design-back && npm test`
- Add-on flows with a mocked API and Supabase: `cd design-front && npm run test:e2e:mocked`
