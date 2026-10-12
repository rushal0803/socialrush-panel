# Phase 9: Facebook / LinkedIn SEO landing CTA event parity

## Source evidence
Owner's production Supabase first-party analytics (read-only) for complete IST days **2026-10-08 through 2026-10-11** (2026-10-07 18:30 UTC to 2026-10-11 18:30 UTC):

| Landing page | Google / organic distinct anonymous sessions | Those sessions with a subsequent dashboard order-start | Those sessions with checkout-start |
| --- | ---: | ---: | ---: |
| /buy-facebook-followers-india | 55 | 7 | 4 |
| /linkedin-followers | 16 | 1 | 1 |

The landing pages each recorded zero `new_order_clicked` events on the page during that period, **even though some visitors reached the order flow**. These counts are session-correlated; they are not Google Search Console clicks, successful payments, or a fully attributed paid-order funnel. `package_selected` is not an accurate unique person count due repeated selections.

## Confirmed implementation gap
`components/marketing/FacebookFollowersLanding.tsx` and `LinkedInFollowersLanding.tsx` each have custom quantity/link builders where the valid 'Continue to Secure Order' `<Link>` navigated to `/dashboard/new-order` without tracking a `new_order_clicked` event. The shared `ServiceOrderCard` already records this event on valid clicks only.

## Code scope
- Add the existing privacy-safe `track` helper to these two marketing landing pages.
- When (and only when) `valid` is true, emit `new_order_clicked` with `service_code`, `platform`, `quantity`, and a static `surface` identifier. No link, username, account ID, customer information, monetary details, or other PII is logged.
- Keep invalid clicks blocked with existing validation and UI.
- No changes to order navigation, link/quantity validation, catalog pricing, INR checkout, wallet, payment, authentication, Supabase, robots, sitemap, or canonical metadata.
- Add source-based unit regressions to enforce valid-click-only event parity. These do not replace browser QA.

## Release plan
One focused draft PR, existing GitHub CI + a single Vercel preview. **Do not merge or trigger another production deployment until the user approves a batched release.** The full October 12–18 measurement is already scheduled for October 19; do not claim SEO ranking or conversion lift from this analytics-only change.

Follow-up after a genuine release: verify new `new_order_clicked` events by page and service, and confirm eventual order starts remain consistent. Respect consent and Do Not Track.
