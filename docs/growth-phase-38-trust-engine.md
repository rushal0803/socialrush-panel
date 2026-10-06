# Phase 38 — Trust Engine

## Goal

Make trust evidence consistent across SocialRUSH without inventing testimonials, ratings, logos, uptime percentages, campaign outcomes, follower quality claims, or guarantees.

## Evidence model

Public trust surfaces may use evidence tied to:

- public-link ordering and no-password guidance;
- live pricing / quantity totals shown before confirmation;
- account-based order records and order IDs;
- refill terms only when an active service or package states eligibility;
- official support routes;
- published refund / privacy / terms guidance;
- permissioned customer reviews only when the review is approved, not removed, and tied to a completed order.

## Phase 38 changes

- add a reusable Trust Engine model;
- add a reusable Trust Evidence panel to homepage, Trust Center, and shared India money pages;
- strengthen the public review query with an independent completed-order join/filter;
- suppress the review evidence card when no qualifying public review exists;
- replace the old GrowthProof component that contained unsupported logos and performance metrics;
- add a trust-claim audit and Phase 38 regression tests;
- run the trust audit in pre-merge CI.

## Explicitly unsupported without evidence

Do not publish:

- fabricated case studies or client logos;
- arbitrary uptime or delivery-performance percentages;
- average reach / ROI multipliers without traceable data;
- guaranteed sales, ranking, virality, retention, follower quality, or platform outcomes;
- “real” / “genuine” follower claims without a source-of-truth service guarantee.

## Protected scope

- no pricing changes;
- no wallet/payment calculation changes;
- no order settlement changes;
- no Supabase migrations;
- no auth/middleware changes;
- no fabricated review data;
- no changes to moderation decisions.

## Validation

- TypeScript
- Phase 38 trust-engine tests
- trust claim audit
- existing SEO / CRM / payment-confidence tests
- production build
- Chromium smoke tests
- Vercel preview READY before merge
