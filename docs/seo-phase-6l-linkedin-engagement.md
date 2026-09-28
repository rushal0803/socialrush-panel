# Phase 6L — LinkedIn Engagement Rate Calculator

Date: 29 September 2026

## Search opportunity

Current search results contain multiple dedicated LinkedIn engagement-rate calculators, which validates a distinct utility intent separate from SocialRUSH's transactional LinkedIn service pages.

## Implementation

- Add canonical route: `/tools/linkedin-engagement-rate-calculator`.
- Calculate engagement rate from impressions plus reactions, comments, reposts and optional clicks.
- Show reaction, comment, repost and optional click rates.
- Keep calculations browser-side and based only on user-entered values.
- Do not invent universal performance benchmarks or a proprietary LinkedIn score.
- Link the tool to the canonical LinkedIn followers and likes pages.
- Add the tool to the directory, LinkedIn/Analytics categories, sitemap and Phase 6 freshness map.
- Add unit tests for the core math, optional clicks, zero-impression handling and negative-input safety.

## Formula

`(reactions + comments + reposts + optional clicks) / impressions × 100`

## Cannibalization decision

This is an informational calculator intent. It does not replace or duplicate `/linkedin-followers`, `/linkedin-likes`, or `/linkedin-growth-india`.
