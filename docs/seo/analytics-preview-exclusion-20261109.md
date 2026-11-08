# Exclude engineering traffic from acquisition collection

Independent draft based on #747 (cc12b5a746e330dc8689b6e05dbba12edc29090b). The endpoint previously processed preview/local events without an environment exclusion, and the browser sender only checked Do Not Track. That could contaminate acquisition/revenue reporting when preview code used a real analytics backend. This is a source finding, not evidence that any particular historical record is contaminated.

## Implemented behavior

- Browser primeAttribution and track return before storage, event deduplication and beacon creation on localhost, loopback and vercel.app hosts. Production getsocialrush.com hosts retain their existing behavior.
- POST /api/analytics returns an empty 204 before JSON parsing, session allocation and database client creation when VERCEL_ENV is preview/development, or the request hostname is an engineering host. VERCEL_ENV also covers custom-domain Vercel previews. The flag is read only on the server; no key or secret is exposed to clients.
- No historical events are deleted/rewritten. Source classification, session IDs, first-touch precedence, paid-click suppression, order verification, amounts, checkout and database schema/policies remain unchanged. Default production Vercel deployment hostnames are also excluded intentionally; the public primary/custom-domain production site remains measurable.

The client hostname guard prevents beacons on default preview hosts. Custom-domain previews may still create ephemeral client attribution and send a request, but the endpoint drops it; no claim is made that those browsers perform no client work. Non-Vercel custom staging hosts need explicit environment configuration or a future reviewed host entry.

## Verification

Behavioral tests cover default previews, loopback/local hosts, trailing-dot/case normalization, production/custom hosts, lookalike domains and custom-domain preview environment values. A browser-like sender regression verifies default previews write no attribution storage and send no beacons. Existing Google-app/paid-source/privacy/deduplication and revenue regressions are rerun. The browser endpoint smoke test submits a deliberately invalid body to the isolated localhost server and verifies empty 204 without a session cookie: the exclusion occurs before body validation or database processing. No production endpoint is posted to.

Supabase skill used for endpoint review. The change adds no Supabase API calls, SDK upgrade, RLS, grants, authentication behavior or migrations. Changelog was reviewed; existing libraries and request-to-database path remain intact. No production test query is needed for an exclusion that must prevent database access; the isolated endpoint request verifies the no-op boundary.

## Reporting contract and outstanding evidence

This closes collection exclusion for known local/Vercel previews; it does not complete organic revenue reconciliation. Official search exports and independently verified paid orders tied to valid attribution/session evidence are still required. Report organic sessions, landing-page conversion rates, verified organic paid orders/revenue, and abandonment as UNKNOWN until the datasets and their time windows are verified. Client conversion events alone do not prove payment. Do not sum duplicate payment callbacks or treat all orders as organic because an earlier page had an organic referrer.

Retain paid order IDs and currency/amount verification in authorized backend reporting; aggregate service-level order counts and revenue only after deduplication and explicit attribution rules. A checkout start without a later verified payment is an incomplete funnel event within a declared observation window, not automatically permanent abandonment. Keep historical attribution defects visible as measurement limitations; no retroactive correction is authorized by this draft.

Keep draft/unmerged. Protected hosted QA remains unavailable without creating a share/bypass link, which the owner prohibited. No manual deployment, production mutation, payment or indexing submission was performed. Merge only after exact-head checks and explicit owner approval.

Local validation: 242 unit tests passed with the new sender/environment cases included; existing source/revenue regressions passed, TypeScript passed, lint passed with existing warnings, production build passed. The isolated endpoint browser test passed (empty 204, no cookie). The dedicated environment unit file is explicitly added to CI without changing package.json, reducing overlap with service-batch PRs. Remote exact-head checks remain a separate release gate.

The initial draft did not trigger GitHub Actions because #747's inherited workflow admitted only main as a PR base. Its branch filter now includes the existing foundation/batch stack bases, matching the service batch workflow. A successful Vercel preview-comment check is not a substitute for the missing main workflow; exact-head Actions results are required separately.

Full CI identified an existing homepage tracking test that expected beacons on localhost. The collection exclusion is retained. The production-emission test now runs on a reserved analytics.example.test origin, with every response proxied from the owned local fixture server and collection calls intercepted; no production request or database write is made. A separate browser test requires zero collection beacons during localhost conversion navigation. The endpoint no-op test, local navigation exclusion, and all three conversion-path event checks passed together (three browser tests). The failed initial CI result is not treated as a pass; exact-head CI is rerun after this test-environment correction.
