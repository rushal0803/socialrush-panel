# Phase 1 — security, authentication and checkout reliability

Date: **15 November 2026, Asia/Calcutta**. **Release HOLD.** No merge, deployment, environment/payment/auth setting change, production mutation, email, live checkout or indexing request is authorized or performed. All fixtures are invented; no customer records are used.

## Exact dependencies and baseline CI

| Existing PR | Exact head / base | Latest independently read result |
|---|---|---|
| #760 | `04affabe4287cfa79eab6696ec53825c94714227` / main `35fcaf731447a948b69a9ae917b5af596d22711e` | Draft/unmerged; both required Actions contexts SUCCESS; optional performance jobs SKIPPED |
| #761 | `b07b484a3d24dd84f4047708d563e176efc9aaf2` / #760 branch | Draft/unmerged; Vercel comment check SUCCESS, smoke/SQL checks NOT RUN at this head. Existing workflow only targets main. READY is not auth evidence. |
| #762 | `eecbe2b6fe3a35b62728ecdbfb6a9ee4700b323d` / main | Draft/unmerged; both required Actions contexts SUCCESS; optional performance jobs SKIPPED |

This separate branch is based on exact #762, retaining its financial correction and audit/model. It ports only app/auth/actions.ts, app/auth/callback/route.ts, app/auth/recovery/page.tsx and app/reset-password/page.tsx from reviewed #761, then applies the fixes below. #761 includes #760's token-hash callback. Neither whole #760 nor #761 is merged into this branch; SEO content and unrelated fixes remain separate. Do not merge all overlapping auth paths independently: choose a final reviewed integration and resolve shared files deliberately. Source-port provenance is not commit ancestry.

The new PR targets #762's branch. CI adds that exact base branch to the existing pre-merge trigger and runs the new stubbed suite. This repairs the inherited non-main CI coverage gap for this stack without changing protections or required check definitions. vercel.json disables deployment for this new Phase1 branch before it is published. A branch deployment opt-out is not backend isolation.

Source dependencies remain the existing locked Next15.5.26, React19.2.8, @supabase/ssr and supabase-js versions. No dependencies, lockfile, schema, RLS, credentials, method-enable flags, prices or manual payment instructions are changed.

## Implementation

### Cashfree gateway and reconciliation

The legacy wallet route `/api/payments/cashfree/order` lacked a disabled-method check and could reach `cashfreeRequest('/orders')` despite disabled top-up UI. It now denies all-disabled gateway creation with409/PAYMENT_METHOD_DISABLED **before auth, profile, body parsing or provider calls**. If another gateway method is ever approved separately, the requested normalized method must still be enabled. Same-origin/JSON checks and best-effort per-user rate limiting are applied on that path.

`cashfreeNewPaymentsEnabled` derives only from existing external method flags, excluding wallet. A second adapter check blocks create-order POSTs before credential lookup or fetch. It does not change flags or provider settings. Unknown/malformed requests cannot enable a method. No environment switch was added that could silently enable payments.

**Route distinction:** `/api/checkout/cashfree/order` currently implements a manual direct-UPI handoff despite its legacy name. It does not call Cashfree or create a gateway payment. Its existing auth, same-origin/JSON, rate, intent ownership, expiry, currency, service availability, quantity and authoritative price checks are preserved. It must not be disabled by the gateway top-up flags, which would alter the approved manual flow. It was reviewed at source scope; hosted execution is BLOCKED and no manual payment was attempted.

`/api/payments/cashfree/verify`, `/api/checkout/cashfree/verify`, `/api/checkout/cashfree/return`, cashfree-direct-verification and the webhook preserve historical reconciliation. Turning off new payments must not strand already accepted payments. No blanket route-family disable was applied. Razorpay paths were inventoried but not changed; their runtime behavior and provider credentials are not certified by this PR.

Webhook verification now checks returned order ID and payment order ID/currency in both wallet/direct branches before settlement. Stubbed mismatches must return409 and execute zero settlement RPCs. Existing signature verification and database settlement/idempotency remain in place. Cryptographic HMAC is locally tested; webhook receipt/SQL concurrency/replay integration is not established by a VM fixture. Timestamp freshness, broader historical settlement review and operational reconciliation remain separate work.

### Authentication

Preserve #761's verified-user guard on reset form and mutation plus implicit-fragment handoff. Fix Next15's promised searchParams by awaiting the reset-page query object. Callback now requires a validated user after successful code/OTP exchange; a provider error, missing user or thrown exchange/user error leads to a generic same-origin failure redirect. Callback redirects use no-store/no-referrer; recovery route metadata is noindex/no-referrer.

Extract browser credential processing into recovery-session.ts. Parse and scrub URL credentials before creating the SDK client; reject missing, incomplete, error, non-recovery fragment/token-hash and mixed credential transports. Exchange then require getUser. Preserve the promise ref from #761 so StrictMode effect replay exchanges once. Never log tokens or raw provider errors.

These changes require an authenticated user for password changes, not a cryptographically separate recovery-only authorization claim. A normal authenticated account may change its own password. Server auth decisions continue to use getUser, not user_metadata. Provider configuration, email templates, redirect allowlists, real cookie propagation and SDK initialization interaction with global providers remain hosted-QA requirements. No provider configuration or email is changed/sent.

Current Supabase changelog and documentation were consulted for token-hash verification/recovery behavior. Reference: https://supabase.com/docs/reference/javascript/auth-verifyotp and https://supabase.com/docs/guides/auth/auth-email-templates. No SDK upgrade or database change was needed.

### Refund reporting

#762 preserves negative daily/period net revenue. Its old visual bar assumed only positive values: losses could become a tiny positive-colored bar or disappear when the maximum was0. Phase1 uses bounded absolute magnitude for length, red bars plus explicit “(loss)” text for negative amounts, and zero width for zero. The legend explains magnitude/sign. Signed INR totals are preserved; refund-only synthetic days render -₹100 with a100% red magnitude bar. This is not a profit statement or new ledger calculation.

## Isolation recheck and plan

Read-only Vercel metadata re-identifies exact #760 preview `dpl_8gEqJvo2wYkSsATH4ser5bGrUZiZ`, source `04affabe...`, READY. The exact host still redirects302 to Vercel SSO on unauthenticated HEAD. Nineteen branch-specific Preview overrides are present with `decrypt=false`, including Supabase bindings, DATABASE_URL, CASHFREE_ENV and provider/email controls. No values were decrypted. No bypass/share URL was created.

This cannot establish effective immutable-deployment client/server/direct-DB identity, isolated fixtures, safe payment mode, disabled fulfillment, email/cron isolation or absence of live side effects. A QA project or protected URL does not prove any of them. Another branch does not inherit #760's overrides.

Before any future hosted interaction: (1) bind exact deployment/source; (2) independently verify built browser, server Supabase and direct DB tenant references; (3) verify synthetic account/wallet/catalog ownership without production records; (4) demonstrate server-side provider/fulfillment/email/cron safeguards, not just browser interception; (5) capture authorized login and no-payment checkout at390/1440 with request/server evidence. If configuration/build changes are needed, they require separate approval; none is performed here. Keep every hosted acceptance row BLOCKED until evidence exists.

## Local verification and limits

See acceptance.csv and local test logs. Source-executing tests use an explicit import allowlist, synthetic auth/database/provider stubs, empty environment except PATH and no live client initialization. The helper transpiles actual route/component code; it is not a reimplementation. vm is a dependency-isolation mechanism, not a security sandbox for untrusted code. New tests have no real payment, email or DB destination.

Local suite: **15/15** Phase1 security/auth/render cases, plus **30/30** existing payment/revenue/model regressions pass. TypeScript passes. The local optimized build passes with existing lint and Supabase Edge compatibility warnings; see local-build-summary.txt. New PR CI results are recorded in the PR body. Local build uses synthetic-only backend variables and process-level fetch/HTTP/socket denial with the existing in-memory backend preloader. It is a local optimized build, not a deployment. No completed full application regression, real provider login or hosted browser PASS is inferred from these tests.

The candidate's exact published head/tree and final CI links are in the draft PR description, avoiding a self-referential commit hash inside its own content. CI status changes after publication must be read at that exact head. Do not present skipped performance jobs as PASS.

## Phase2 specification, risks, rollback and remaining work

[Phase2 design specification](phase2-design-spec.md) preserves current branding, consolidates existing components, sets homepage/service hierarchy and defines responsive/accessibility/pricing/claim acceptance tests. It is a specification, not a live redesign.

Risks: legacy callers now receive409 for disabled gateway creation as intended; old accepted-payment reconciliation remains available and must get dedicated integration QA. New auth failure behavior could reveal configuration problems that were previously masked by success redirects. Browser SDK auto-initialization/cookie behavior requires real isolated testing. Loss bars are magnitude-based rather than a zero-axis time-series; labels/legend explicitly distinguish sign, and actual390/1440 admin visual review remains BLOCKED.

Rollback before release: leave this draft unmerged or close it; existing branches/production remain untouched. If an eventual approved release needs rollback, revert only Phase1 changes through a reviewed PR, preserve #762 and all transaction records, and document that reverting guards/user validation/matching checks restores known weaknesses. Keep deployment disabled while publishing this branch; no rollback action changes a live provider or record.

Remaining blockers: authenticated hosted QA, independent backend/payment/worker isolation, actual Google/email recovery and logout, SDK integration/real browser layout, complete live RLS/authorization/rate-limit review, historical reconciliation concurrency/replay evidence and production approval. **Release remains HOLD regardless of local/CI passes.**
