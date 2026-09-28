# Phase 5X — cheap and affordable SMM panel India intent

## Search opportunity

Live India SERPs for SMM-panel queries repeatedly use "cheap", "affordable", low headline rates, UPI, minimum deposits, API access and refill terms as decision language. The search intent is price-led, but a truthful page should help users compare actual campaign cost rather than repeat unverifiable "cheapest in India" claims.

## Canonical decision

The existing `/pricing` page remains the single canonical owner for:
- cheap SMM panel India;
- affordable SMM panel India;
- low cost SMM panel India;
- budget SMM panel India.

Aliases redirect to `/pricing`:
- `/cheap-smm-panel-india`
- `/affordable-smm-panel-india`
- `/low-cost-smm-panel-india`
- `/budget-smm-panel-india`

No new indexable doorway page is created.

## Affordability model

The visible authority section tells users to compare:
1. current INR unit cost;
2. valid minimum order;
3. delivery and refill/support terms;
4. final checkout total.

The section explicitly avoids a universal cheapest claim because service rates, availability, quantity limits and support terms can differ.

## Search release controls

- query ownership maps every alias to `/pricing`;
- middleware inherits canonical redirects through the existing query-ownership registry;
- production SEO health monitoring checks the new aliases;
- `/pricing` is already part of the Phase 5 IndexNow release set;
- the existing truthful pricing freshness date remains 2026-09-28;
- regression tests verify ownership, copy integrity and release safeguards.
