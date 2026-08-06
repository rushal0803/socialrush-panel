# SocialRUSH production monitoring

The admin **Incidents** page is the required, always-available alert channel. It contains only safe summaries and relational identifiers; it is not a payment, wallet, order, or customer source of truth.

## External setup

- Configure Vercel Cron with `CRON_SECRET`; it runs the aggregate queue and service-health checks hourly.
- Configure external uptime checks for `/`, `/api/health`, `/login`, `/services`, and `/packages`: GET every 5 minutes, 10-second timeout, alert after 2 failures, recover after 1 success. No provider is configured by this change.
- Supabase backup status is manual: record backup enabled, backup verified, last restore test, owner, and review date in the operations review. Never claim these are enabled without Supabase-console evidence.

## Monthly checklist

- Review unresolved incidents, failed payments, wallet discrepancies, failed email delivery, support/refill queues, and service health.
- Verify Supabase backups and restore-test status; review admin accounts, API-key rotation dates, dependency updates, security headers, smoke tests, broken links, Search Console, Core Web Vitals, AdSense, and international-payment status.

Incident metadata is deliberately limited and should be retained only for operational reconciliation; periodically remove resolved low-value incident metadata according to your approved retention policy.
