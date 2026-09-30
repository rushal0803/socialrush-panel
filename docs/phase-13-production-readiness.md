# Phase 13 — Production readiness and regression guardrails

Phase 13 extends the Phase 12 quality pass into production operations. It does not redesign the product or change commercial behavior.

## Goals

- Detect a broken production app/database health endpoint.
- Detect critical public routes returning non-200 responses or visible server-error content.
- Confirm unauthenticated dashboard entry points still redirect to login.
- Preserve the core public conversion journey across Home, Services, Packages, Pricing and Trust.
- Keep compact-width login free from horizontal overflow.
- Make production verification repeatable through one command and one GitHub Action.

## Live production monitor

`npm run release:check` targets `https://www.getsocialrush.com` by default and checks:

1. `/api/health` returns healthy app + database state.
2. Home, Services, Packages, Pricing, Trust and Login return HTTP 200 with a title and no obvious server-error page.
3. Dashboard, New Order and Orders reject anonymous access by redirecting to Login.

Set `PRODUCTION_BASE_URL` to test another deployment.

## Automation

`.github/workflows/production-readiness.yml` runs daily at 03:35 UTC (09:05 IST) and can also be triggered manually.

## Pre-merge browser coverage

Phase 13 smoke coverage verifies:
- critical public journey rendering,
- presence of service/package/trust destinations from the homepage,
- compact 320px login width safety.

## Protected scope

Phase 13 does not change:
- service pricing,
- quantity limits,
- checkout calculations,
- wallet or payment behavior,
- order creation,
- Supabase schema/RPCs,
- service availability,
- experiment activation.

## Rollback confidence

Every production release remains tied to a Git commit and Vercel deployment. If a future release fails production readiness, use the last verified READY production deployment while the failing commit is fixed.
