# Customer email automation

This system uses Resend only from server-side Next.js route handlers. Database
triggers add email events to `customer_email_events`; email delivery is a
separate cron side effect, so a Resend failure cannot roll back a wallet debit,
Cashfree settlement, or order creation.

## Required environment variables

Set these in Vercel (and `.env.local` for local testing), never in browser code:

```dotenv
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=SocialRUSH <noreply@getsocialrush.com>
REPLY_TO_EMAIL=rushalthakur240@gmail.com
NEXT_PUBLIC_SITE_URL=https://www.getsocialrush.com
CRON_SECRET=a-long-random-secret
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Resend domain setup

In Resend, open **Domains → Add Domain** and enter `getsocialrush.com`. Resend
will display the required DNS records (typically SPF and DKIM, and sometimes a
verification record). Copy the exact host and value from that screen into the
DNS provider that manages `getsocialrush.com`; do not substitute values from
this repository. The domain is ready only when Resend shows **Verified**.

`noreply@getsocialrush.com` does not need a mailbox to send through a verified
domain. It is the visible sender identity. Customer replies go to the separate
`Reply-To` address, `rushalthakur240@gmail.com`.

## Deploy and schedule

1. Apply the migration: `npx supabase db push` (or use the Supabase CLI flow
   already configured for this project).
2. Add the variables above in Vercel, then deploy the Next.js app. `vercel.json`
   invokes `/api/cron/email` every hour with Vercel's `Authorization: Bearer
   CRON_SECRET` header.
3. Set `customer_email_automation_config.launch_at` only if you deliberately
   want a later activation timestamp. It defaults to the migration time. This
   cutoff means historical accounts are never selected for signup follow-ups.

## Test one email before activation

After Resend verifies the domain and the environment variables are set, run:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/email/test" -Headers @{ Authorization = "Bearer $env:CRON_SECRET" }
```

The endpoint is intentionally protected and always sends the signup template
only to `rushalthakur240@gmail.com`. Check delivery, mobile layout, CTA URL,
and that Reply opens the configured Gmail address. In production, replace the
localhost URL with your deployed domain.

## Behaviour and retries

- An order insertion queues one `order_created` event; its unique database
  index protects wallet, Cashfree, and mixed-payment retry paths.
- Transitioning an order to the real completed status, `completed`, queues one
  `order_completed` event. Re-saving that status does not queue another one.
- Each hourly run queues signup follow-ups only for accounts created at least
  eight hours after the launch cutoff, with no orders and marketing enabled.
  It checks orders and the preference again immediately before delivery.
- A failed provider request remains in the outbox as `failed` and is retried
  safely by the next cron run. Events are claimed atomically and stale claims
  can be recovered after 15 minutes.

To inspect operations in Supabase use `customer_email_events`; normal users
have no RLS policy granting them access.
