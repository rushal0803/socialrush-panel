# Vercel CPU usage: first-pass cron audit (review only)

## Incident context
The Vercel Hobby allowance was exceeded and the production deployment was paused. The owner subsequently upgraded the team to Pro and confirmed the website opened normally. This document does not claim measured per-route CPU attribution; the observability schema endpoint was unavailable during inspection.

## Confirmed scheduled routes
| UTC schedule | Route | Observed workload | Risk to investigate |
| --- | --- | --- | --- |
| 02:17 daily | /api/cron/monitoring | Three Supabase count queries, conditional incident writes | Database latency and repeat incident writes |
| 02:35 daily | /api/cron/prospect-discovery | runProspectDiscovery, Brave Search and website enrichment | External fetch duration, retries, and per-run fan-out |
| 03:00 daily | /api/cron/email | processCustomerEmailEvents(5) | Email delivery and retry behavior; preserve customer communications |
| 03:20 daily | /api/cron/order-notifications | deliverOrderNotificationBatch | Batch size, retry handling, downstream provider latency |

Each route checks CRON_SECRET before invoking its worker. Do not log or disclose the secret.

## Next safe investigation
1. Inspect Vercel function duration/invocation/CPU metrics by route and period, using team/project scope. Separate high CPU time from elapsed wall-clock latency.
2. Inspect runProspectDiscovery bounds and enrichOfficialBusinessWebsite fetch timeouts and concurrency, plus upstream API limits.
3. Inspect customer email and order-notification batch bounds, timeout handling, and idempotent retries.
4. Check Vercel function logs for repeated errors, 5xx retries and bot traffic; compare against CPU spike dates.
5. Propose narrow, tested limits or timeouts in a separate draft-only change. Preserve scheduled customer messaging and do not enable autonomous outbound CRM.

## Release constraints
No cron disablement, billing change, production deployment, PR merge, live order, customer email, or database mutation is authorized by this audit.
