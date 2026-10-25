# Phase 2 — presentation implementation handoff

Planning only, separate from PR #702 implementation. See [business/financial specification](implementation-specification.md). Target: ₹10 lakh/month refund-adjusted recognized service revenue; no forecast or invented baseline. Wallet deposits are excluded. Razorpay/Cashfree remain retired.

## UI design contracts

Reuse current dark/orange brand tokens, typography, button and card primitives. Do not introduce a second design system. Use a 1200px content maximum, 24px desktop gutters, 16px mobile gutters, 8px spacing grid and 44px minimum control targets. Main text must meet WCAG AA contrast. Test keyboard focus, 200% zoom and reduced motion.

| View | Desktop composition | Mobile composition / states |
|---|---|---|
| Premium service detail | Breadcrumb; 7/5 column hero/details and existing quote component; deliverables, evidence-backed terms, FAQ and related services | Single column: title → availability → deliverables → existing quote component → terms → FAQ. Sticky CTA scrolls/focuses existing quote, does not submit or calculate prices. Reserve sticky space; no covered controls. |
| Package discovery | Filterable comparison cards showing verified components, audience and one-time/recurring terms from existing catalog | Stacked cards with explicit comparison links, no preselected upsell. Unavailable/unknown price uses existing unavailable state; no synthetic discount badge. |
| Agency overview | Value proposition, existing client/campaign capability map, transparent eligibility and support CTA | Same reading order, expandable capability descriptions, clear navigation to existing agency routes. No new permissions or financial controls. |
| Order education / retention | Read-only explanation of existing pending, processing, completed and refunded states; explicit existing reorder navigation | Compact timeline and accessible status text; preserve backend state labels. Reorder opens current selection for review, never resubmits payment. |

Service wireframe, DOM order: `breadcrumb / H1 + factual summary / availability / deliverables / existing quote component / fulfilment + cancellation terms / evidenced trust / FAQ / related services`. Desktop may place the existing quote beside the hero with CSS grid; mobile follows DOM order. Heading hierarchy remains H1 → H2 sections → H3 cards. Empty, loading, unavailable and error variants must be designed alongside populated states. Do not fabricate delivery guarantees, reviews, counters or prices.

## Implementation-ready tickets (future separate growth changes)

23 October staging constraint: presentation-only service-page and SEO/CRO work does not require local Docker or paid Supabase. Prepare each future review against existing routes and approved catalog/copy; retain the current quote/payment components unchanged. Start with UI-01, SEO-01 and CRO-01 as separate growth review units. No growth implementation is included in financial PR #702. Read-only prototypes may use clearly synthetic examples; never publish invented prices, delivery claims, rankings or uplift forecasts. Baseline data and copy evidence remain owner inputs, independent of the financial CI stack.

| ID | Scope and acceptance criteria | Measurement / dependencies |
|---|---|---|
| UI-01 | Build reusable service presentation shell around unchanged quote component; preserve route, API inputs, request IDs and totals. Responsive screenshots at 320/390/1440px; keyboard/zoom; no horizontal overflow or sticky obstruction. | Approved copy evidence and brand components; service-to-quote funnel using existing consent-approved events. |
| SEO-01 | Map existing canonical money pages to one intent each; improve unique title/H1/description and visible FAQ. Preserve canonical/sitemap/redirect contracts; structured data only for visible verified facts. | Source inventory first; compare search impressions/CTR and qualified organic quotes over an agreed window. No new thin location pages. |
| CRO-01 | Show deliverables and cancellation/refill terms before quote CTA; CTA scroll/focus only. Use existing prices and availability. Review loading/unavailable states and preserve entered values. | Baseline and sample size required before experiments; no claimed uplift. Guardrail: zero price/state misrepresentation. |
| UI-02 | Presentation-only package comparison consuming existing package data. Explicit components/terms and unavailable states. Route selection into existing flow; no new bundle/discount/atomic checkout logic. | Approved package facts. New allocation/pricing behavior stays deferred to separate financial design. |
| AGENCY-01 | Capability/benefit page linking existing client/campaign functions; accessibility and mobile QA. No role grants, recurrence or automatic purchasing. | Verify existing capabilities; measure qualified agency inquiries with approved analytics only. |
| RET-01 | In-app order education and links to existing history/refill/reorder screens. State text derives from existing backend status. No scheduled messaging or automatic charge. | Approved lifecycle language; mature repeat-customer cohort separately from clicks. |

## Scope boundary and review artifacts

Prepare screenshots/prototypes and component/route mapping in future growth review before coding. Presentation work may start independently once copy and component contracts are approved, but financial rollout and money-flow changes remain gated by Phase 1.5. Do not implement any of these tickets in PR #702. No new analytics collection, reminders, pricing, bundles, payment mutations or schema changes are authorized by this handoff.

Each future ticket must provide before/after screenshots, mobile/keyboard evidence, unchanged API/financial contract evidence, SEO checks and applicable type/lint/build checks. AOV packages, discounts, new agency billing and transaction-affecting checkout experiments require separate financial review; they are not safe presentation-only tasks.
