# Phase 8 — correct organic landing event overcount (2026-10-12)

## Evidence (read-only production query)
Production `public.analytics_events`, filtered to `event_name='organic_landing_view'`, `source='google'`, `medium='organic'`, grouped by complete IST dates:

| Date IST | Events | Events at stored first-touch landing | Events on later paths | Account-area paths |
| --- | ---: | ---: | ---: | ---: |
| 2026-10-09 | 287 | 161 | 126 | 91 |
| 2026-10-10 | 275 | 167 | 108 | 85 |
| 2026-10-11 | 477 | 237 | 240 | 208 |

**Root cause:** The root-layout `PageAnalytics` effect fires on `usePathname()` route changes, and `document.referrer` stays the same external search URL for subsequent in-app routes. It therefore emitted `organic_landing_view` again on unrelated pages, including `/dashboard`. Since the event dedup key includes path, these were counted as additional organic landings. This did **not** imply matching Google Search clicks.

## One low-risk fix
- Keep existing `page_viewed` on route navigation.
- Emit `organic_landing_view` only on the first PageAnalytics effect for a **document** that has a recognized external search referrer.
- Reuse the existing search-source classification and only send `referrer_type: search`, not the URL/query.
- Preserve session first-touch attribution, consent / Do Not Track, rate limiting, event schema, DB, orders, wallet, payments, checkout, pricing and SEO canonicals.
- Add focused unit regressions to the existing Phase 45 test file.

## Validation and measurement
- Allow CI + one preview to complete, but **hold production merge** to conserve limited Vercel usage.
- No backfill or deletion: historical organic landing counts remain inflated. Mark a measurement break at production rollout.
- After deployment, compare *same-instrumentation* event behavior only; expect `organic_landing_view` at a documented initial page, not on subsequent dashboard navigation. Google Search Console remains authoritative for organic clicks/impressions/positions.
- The separately verified trusted-payment analytics repair is producing event IDs, but coverage across settlement paths is still unconfirmed.

Production Supabase was queried read-only; no customer identities or orders were modified.
