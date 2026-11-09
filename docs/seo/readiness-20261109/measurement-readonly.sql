-- Diagnostic aggregates only. This does not repair records or certify organic revenue.
-- Fixed UTC event window; it differs from Search Console report dates/timezone.
BEGIN READ ONLY;
WITH conversions AS (
  SELECT safe_metadata->>'order_id' AS order_id, anonymous_session_id,
         event_name, source, medium
  FROM public.analytics_events
  WHERE event_name IN ('wallet_order_completed', 'payment_completed', 'order_created')
    AND created_at >= '2026-10-12T00:00:00Z'
    AND created_at < '2026-11-09T00:00:00Z'
), matched AS (
  SELECT c.*, o.payment_status
  FROM conversions c LEFT JOIN public.orders o ON o.id::text = c.order_id
)
SELECT count(*) AS conversion_events,
       count(*) FILTER (WHERE order_id IS NOT NULL) AS events_with_order_id,
       count(DISTINCT order_id) AS distinct_referenced_orders,
       count(DISTINCT order_id) FILTER (WHERE payment_status = 'paid') AS referenced_paid_orders,
       count(*) FILTER (WHERE order_id IS NOT NULL AND payment_status IS NULL) AS unmatched_order_events,
       count(*) FILTER (WHERE anonymous_session_id IS NULL) AS events_without_session,
       count(DISTINCT order_id) FILTER (
         WHERE payment_status = 'paid' AND medium = 'organic' AND source IN ('google', 'bing')
       ) AS paid_orders_with_unverified_organic_labels
FROM matched;
ROLLBACK;
