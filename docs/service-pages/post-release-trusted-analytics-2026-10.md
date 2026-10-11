# SocialRUSH post-release attribution: trusted event repair (11 October 2026)

## Release and scope

The public service-page conversion upgrade shipped with [PR #633](https://github.com/rushal0803/socialrush-panel/pull/633), squash `487e0560a1e1f613f83f1bea7479a0cb12592cd8`, deployed **11 October 2026, 14:52 IST**. Track the release in [Issue #634](https://github.com/rushal0803/socialrush-panel/issues/634). This patch changes only the **best-effort trusted analytics insert** and its regression test. It does not alter any payments, refunds, account rights, wallet balances, financial settlement, SEO ownership or historical data.

## Verified production fault

1. Read-only production database inspection found **49,778** `analytics_events` rows and **zero non-null `event_id` rows**, with no `order_created`, `payment_completed` or `login_completed` events.
2. `analytics_events_event_id_unique` is a unique **partial** index on `(event_id) WHERE event_id IS NOT NULL`, with no unconditional unique constraint on `event_id`.
3. A read-only `EXPLAIN INSERT ... ON CONFLICT (event_id) DO NOTHING` was rejected by Postgres with **42P10** (no matching unique/exclusion constraint). Nothing was inserted.
4. The `recordTrustedEvent` helper used PostgREST `.upsert({ ... }, {onConflict: "event_id", ignoreDuplicates: true})` but did not inspect the returned `error`. All trusted-event writes through that helper could fail silently.
5. The helper now uses `.insert`, keeping the existing partial unique index as the **atomic duplicate-event guard**. A duplicate retry returns `23505` and is ignored; any other write error logs only the database error code. Business transactions still succeed independently.

This is **not** proof that every order source already emits a trusted event. Wallet and Razorpay verify routes explicitly call `recordTrustedEvent`; manual UPI creates an `order_created` event while its payment is still `verification_pending`. Report successful payment only from verified order and ledger state, not an unverified order-created event. Cashfree webhook-based settlement paths require separate coverage and must not be modified without settlement-specific safety testing.

## Pre-release measurements and caveats

Complete IST days October 4–10: **73** orders marked paid, **66** status-completed orders; **116** `new_order_clicked` client events and **115** `checkout_started` client events. These are **not a matched conversion funnel**. No historical trusted events should be invented/backfilled.

`page_viewed` only started being recorded on **8 October**; `organic_landing_view` started **26 September**. Their seven-day raw counts are **not** directly comparable. Paid order attribution must be checked after this fix actually deploys and produces event IDs.

## Read-only, PII-free repeatable verification queries

**After release, new trusted events:**

```sql
SELECT event_name, COUNT(*)::int AS events,
       COUNT(*) FILTER (WHERE event_id IS NOT NULL)::int AS idempotent_events
FROM public.analytics_events
WHERE created_at >= '2026-10-11T00:00:00Z'
  AND event_name IN ('order_created','payment_completed','wallet_order_completed','login_completed')
GROUP BY 1 ORDER BY 1;
```

**Seven-day post-vs-pre (once data is complete):**

```sql
WITH weeks AS (
  SELECT 'pre' AS period, TIMESTAMPTZ '2026-10-03 18:30:00+00' AS start_at, TIMESTAMPTZ '2026-10-10 18:30:00+00' AS end_at
  UNION ALL
  SELECT 'post', TIMESTAMPTZ '2026-10-11 18:30:00+00', TIMESTAMPTZ '2026-10-18 18:30:00+00'
)
SELECT w.period, COUNT(o.id)::int AS orders_created,
       COUNT(o.id) FILTER (WHERE o.payment_status IN ('paid','completed'))::int AS paid_orders,
       COUNT(o.id) FILTER (WHERE o.status = 'completed')::int AS fulfilled_orders
FROM weeks w
LEFT JOIN public.orders o ON o.created_at >= w.start_at AND o.created_at < w.end_at
GROUP BY w.period ORDER BY w.period;
```

**Service-page events by their own recorded path:**

```sql
SELECT page_path, event_name, COUNT(*)::int AS recorded_events,
       COUNT(DISTINCT COALESCE(customer_id::text, anonymous_session_id::text))::int AS identified_users
FROM public.analytics_events
WHERE created_at >= '2026-10-11T18:30:00Z'
  AND created_at < '2026-10-18T18:30:00Z'
  AND page_path IN (
    '/youtube-subscribers','/buy-instagram-followers-india',
    '/instagram-likes','/youtube-views','/linkedin-followers'
  )
  AND event_name IN ('page_viewed','new_order_clicked','package_viewed','package_selected')
GROUP BY page_path, event_name ORDER BY page_path, event_name;
```

Google clicks, impressions, CTR and average rank must still come from Google Search Console, **not** inferred from first-party events. As of 11 October, the GSC Wizard trial is expired; use the free native Search Console UI/export, not a new paid subscription.

## Safe release gate

- Review the one-scope writer and test diff.
- All configured TypeScript, unit, build, payment-confidence and Chromium pre-merge checks green.
- Preview build green; merge only after gate.
- Confirm first **genuine** eligible trusted server event appears with non-null `event_id` after production deploy, with no synthetic payment/order or DB migration used as a test.
- If eligible events remain absent, inspect sanitized trusted-event error code and the actual caller path before any changes to money flows.
