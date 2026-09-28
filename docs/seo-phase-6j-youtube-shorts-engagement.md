# Phase 6J — YouTube Videos + Shorts Engagement Calculator

Date: 28 September 2026

## Why this phase

The existing YouTube engagement calculator already owns the broad engagement-rate intent, so a second Shorts-only URL would risk cannibalization. Current search results show that strong calculators increasingly separate regular video and Shorts measurement while keeping the formulas explicit.

## Implementation

- Keep the canonical route: `/tools/youtube-engagement-rate-calculator`.
- Add a Video / YouTube Shorts selector.
- Add shares to the interaction total.
- Calculate:
  - engagement rate by views
  - like rate
  - comment rate
  - share rate
  - optional views-to-subscriber ratio
  - optional Shorts engaged-view rate
- Keep every calculation browser-side and based only on user-entered values.
- Do not present a universal benchmark or official YouTube score.
- Keep YouTube Analytics as the source of truth.
- Expand tool metadata/keywords to cover YouTube Shorts engagement intent.
- Refresh sitemap last-modified metadata through the existing Phase 6 freshness map.

## Cannibalization decision

No new Shorts calculator URL was created. The existing YouTube engagement calculator is the single canonical target for both regular-video and Shorts engagement-rate queries.

## Validation

Unit tests cover video engagement, Shorts engaged-view rate, format separation and zero-view handling.
