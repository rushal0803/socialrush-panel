# Phase 5W — SMM Panel API India intent

## Search opportunity

Live India SERPs for SMM API queries show a distinct agency/developer intent around API authentication, order creation, order-status retrieval and reseller automation. SocialRUSH already has real authenticated API documentation, so this phase strengthens the existing agency canonical instead of creating a separate thin API doorway page.

## Canonical decision

- `/for-agencies` remains the single canonical owner for:
  - SMM panel API India
  - SMM reseller API India
  - SMM API India
  - SMM panel for agencies India
- `/smm-panel-api-india` redirects to `/for-agencies`.
- `/smm-reseller-api-india` redirects to `/for-agencies`.
- `/smm-api-india` redirects to `/for-agencies`.
- No new indexable API doorway page is created.

## Verified API facts used

The public authority section only describes capabilities already documented inside SocialRUSH:
- account-scoped API key generation;
- Bearer-token authentication;
- authenticated order creation using service, public destination link and quantity;
- order-status retrieval by order ID;
- documented limit of up to 120 requests per minute.

The signed-in developer documentation remains authoritative for endpoint examples, credentials and current operational rules.

## Commercial and security integrity

This phase does not claim:
- a white-label child panel;
- guaranteed reseller profit;
- guaranteed service availability;
- guaranteed delivery outcomes;
- permanent API limits or service facts beyond the current documentation.

API keys remain behind authentication and should not be exposed in public browser code or repositories.

## Search release controls

- API query aliases are assigned to the existing `/for-agencies` canonical in the query-ownership registry.
- middleware automatically inherits those canonical redirects.
- production SEO health monitoring checks all three new aliases.
- `/for-agencies` is already in the Phase 5 IndexNow release set and has a truthful significant-update date of 2026-09-28.
- regression tests verify query ownership, visible API authority and the documented API capability facts.
