# Phase 6L — Instagram Posts + Reels Engagement Upgrade

Date: 29 September 2026

## Why this phase

The existing Instagram engagement calculator already owns the broad engagement-rate intent. Creating a separate Reels-only URL would split authority and risk cannibalization, so Phase 6L expands the established canonical page instead.

## Implementation

- Keep the canonical route: `/tools/instagram-engagement-rate-calculator`.
- Add a Post / Reel selector.
- Keep the primary transparent formula:
  - (likes + comments + saves + shares) / followers or reach × 100.
- Add component rates:
  - like rate
  - comment rate
  - save rate
  - share rate
- In Reel mode, allow optional plays and calculate an additional interactions-per-play rate.
- Keep every calculation browser-side and based only on user-entered Instagram Insights values.
- Do not define a universal good/bad engagement benchmark.
- Do not present the optional play ratio as an official Meta metric.
- Expand metadata and keywords for Instagram Reels engagement intent.
- Refresh sitemap last-modified metadata for the canonical calculator.

## Cannibalization decision

No new Reels calculator URL was created. The existing Instagram engagement calculator remains the single canonical search target for both Post and Reel engagement-rate queries.

## Validation

Unit tests cover Post calculations, Reel interactions-per-play, optional play handling and zero-denominator behavior.
