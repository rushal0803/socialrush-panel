# Phase 15 — Full Website QA & Launch Audit

Audit date: 1 October 2026.

## Goal

Turn the Phase 14 premium sitewide experience into a release-ready product by verifying the complete public journey and preventing regressions across mobile/desktop UI, public routes, service discovery, pricing/packages, authentication entry points, international hubs, SEO canonicals and payment messaging.

## Baseline

Phase 15 starts from current `main` after Phase 14 and all later merged work. It does not roll the site back to the old Phase 14 branch.

The live Vercel main-domain deployment was verified against the same current `main` commit before this audit.

## Production runtime review

The current production deployment had no error/fatal runtime logs in the 24-hour window checked during this audit.

An older aggregated FX-provider error cluster was investigated separately. Current currency code already catches provider failures and falls back to INR, and the current production deployment showed no matching runtime errors, so no speculative currency rewrite was made.

## Phase 15 changes

### Brand consistency

Visible launch-critical copy is aligned to SocialRUSH's preferred product language:
- social media growth services;
- social media growth platform;
- agency growth workflows.

The Services hero no longer presents SocialRUSH as an SMM panel. The bulk-agency section now says “Bulk social media growth orders India.”

Historical SEO redirect aliases and internal query-ownership records are not removed just for wording cleanup.

### Deterministic launch checks

A focused unit suite verifies:
- launch-critical route files remain present;
- public shell keyboard skip navigation remains intact;
- footer payment messaging stays aligned with the current public flow;
- disabled Razorpay endpoints remain covered by the existing safety smoke suite;
- launch-critical public branding does not regress to panel-style visible copy.

### Browser launch checks

A dedicated Playwright smoke suite verifies:
- Home, Services, Pricing, Packages, About, Contact, FAQ, Trust, Case Studies, Blog, Tools, Login and Register render without application errors;
- US, UK, Canada, Australia, UAE and Singapore hubs render successfully;
- priority public pages retain self-referencing canonicals;
- the footer does not advertise Razorpay;
- priority service routes still render after sitewide visual work.

## Guardrails

Phase 15 does not change:
- service pricing;
- order calculations;
- wallet balances;
- checkout/payment rules;
- authentication behavior;
- database schema;
- canonical route ownership;
- historical redirect aliases.

Any functional change requires a separately verified defect.
