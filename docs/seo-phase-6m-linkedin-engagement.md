# Phase 6M — LinkedIn Engagement Rate Calculator

Date: 29 September 2026

## Search opportunity

LinkedIn engagement-rate calculators represent a distinct utility intent from SocialRUSH's transactional LinkedIn follower and like pages. The calculator should help users measure their own post data without creating a second transactional landing page.

## Implementation

- Add canonical route: `/tools/linkedin-engagement-rate-calculator`.
- Calculate engagement rate from impressions plus reactions, comments, reposts and optional clicks.
- Show reaction, comment, repost and optional click rates.
- Keep calculations browser-side and based only on user-entered values.
- Do not invent universal performance benchmarks or a proprietary LinkedIn score.
- Link the tool to the canonical LinkedIn followers and likes pages.
- Add the tool to the directory, sitemap and Phase 6 freshness map.
- Add unit tests for the core math, optional clicks, zero-impression handling and negative-input safety.

## Formula

`(reactions + comments + reposts + optional clicks) / impressions × 100`

## Cannibalization decision

This informational calculator does not replace or duplicate `/linkedin-followers`, `/linkedin-likes`, or `/linkedin-growth-india`.
