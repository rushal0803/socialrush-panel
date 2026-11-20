# Capture audit and consent/exclusion design

## Source inventory

| Capture surface | Candidate enforcement |
|---|---|
| PageAnalytics, tracked links, checkout trackers, experiment exposure, WebVitals and all `track()` callers | Central browser consent gate before attribution/session storage or beacon/fetch; GPC/DNT and canonical deployment/dataset activation |
| LoginForm / RegisterForm auth analytics POST | Same browser gate; authentication itself remains independent |
| `/api/analytics` | Environment and absent-adapter denial before parsing/auth/DB/session allocation; explicit receipt, trusted public classification and atomic replay claim before minimized server-only insert |
| `/api/analytics/auth-completed` | Privacy/environment/receipt/classification denial before auth lookup; writer also authorizes consent |
| `recordTrustedEvent` callers after operational commits | Preview guard plus consent authority before privileged client; workers without a consent context cannot fall back to marketing capture |
| Consent preference endpoint/helper | Same-origin explicit choice, necessary revocation handling, Secure/HttpOnly opaque receipt, no automatic grant; failed durable withdrawal is not acknowledged as complete |

Repository searches for executable GA/GTM, Facebook pixel, Clarity, Hotjar, Segment, PostHog, Mixpanel, Plausible and Vercel Analytics capture found no installed/executed capture path beyond the first-party collector. `app/layout.tsx` contains an AdSense ownership meta identifier; that alone is not an ad script or collection request. No new third-party analytics tool is introduced. This is a source/import audit, not independent verification of scripts injected by a live CDN, hosting integration or browser extension. Hosted third-party behavior remains untested.

Necessary authentication, transaction/financial records, rate limiting, operational status and security/error logs remain separate. Consent suppresses optional analytics only; it never blocks an order, login, refund or security check. The new consent repository itself is a necessary preference/revocation record, not permission to send marketing data. Existing historical analytics rows are not deleted or rewritten by this task; retention/deletion needs separate review.

## Consent lifecycle and trust boundary

The source defaults to no collection: server/public activation flags are absent and no durable repository is installed. A future adapter must atomically store grants, revoke/replace receipts, recheck consent/version/expiry while claiming a unique event ID, and independently classify public versus staff/internal/QA/synthetic activity. In-memory state is test-only and is not adequate across workers. Unknown classification is denial. Request-body `internal=false`, `synthetic=false` or `consent=true` is never authority.

Opaque unpredictable consent IDs are HttpOnly, Secure and SameSite=Strict; grant expires in 24h. A readable choice cookie permits the browser gate but cannot authorize the server. Receipt possession alone is insufficient without the shared-store grant and public classification. A revoked, replaced, expired or old-policy receipt is denied, including replay after a new grant. Concurrent duplicate claims are rejected by the repository contract. Optional writes are at-most-once after claiming; a failed analytics insert can lose an optional event and must not retry through an unsafe path. The operational ledger remains authoritative.

Withdrawal stops browser capture and clears only optional session attribution keys immediately. The necessary order draft is retained. The endpoint acknowledges withdrawal only after durable revocation; when the store is unavailable, the UI helper returns unconfirmed and must offer retry. Revocation remains possible while the activation flag is disabled. GPC/DNT signals are honored by browser and server checks; future adapters must preserve them across their request context.

No preferences UI is mounted and no production consent behavior/configuration is changed in this task. Activating a future preference interface or backend needs explicit approval. This is a tested candidate enforcement boundary, not live compliance certification.

## Data minimization

Client IDs come from a new per-event random UUID; correlation is issued by the server's consent receipt rather than trusting submitted session IDs. Trusted event identity is SHA-256 derived from the stable operational identity, retaining retry idempotency without sending raw order/customer references. Customer IDs are not inserted into optional analytics. Paths are coarse buckets; queries/fragments and dynamic IDs never survive. Only finite categorical values, approved catalog/platform codes and bounded numeric metrics are accepted. Unknown properties, free-text campaign/search terms, public destinations, payment references/credentials and auth tokens are discarded on both client and server.

Only coarse source/medium are retained. Paid-click **presence** can classify a paid source, but click identifiers are neither stored nor transmitted. Coarse established attribution survives ordinary navigation; explicit new paid markers can override stale organic attribution. Raw referrer domains and landing paths are not retained. This intentionally changes report dimensions; historical and consented/coarse cohorts cannot be treated as directly comparable.

The old client-triggered authenticated signup/login telemetry is not independent proof of a fresh signup/login transaction. Verified funnel outcomes and any future paid-order adapter must reconcile committed authoritative facts, not trust the event name, a wallet funding event, UTR submission or an authenticated client assertion. Activation remains blocked until provenance/consent handling is reviewed.

## Legacy database ingress — explicit activation blocker

The repository's latest `record_analytics_event` SQL definition grants EXECUTE to anon/authenticated, runs SECURITY DEFINER and derives `auth.uid()`. Direct database callers could therefore bypass the app consent boundary; source grants are not proof of current deployed privileges. The candidate API no longer invokes that RPC or forwards user authentication to its analytics data transport. It inserts minimized rows through a server-only client **after** authorization and explicitly sets customer_id null. Necessary request authentication/classification is separate from analytics payloads/rows; no request cookies or authorization headers are logged or copied into events.

[Permission restriction proposal](analytics-ingestion-permissions.proposed.sql) revokes all legacy RPC overloads from PUBLIC/anon/authenticated and direct analytics table mutation for those roles, retaining server-only table access. It is **not installed as a migration and not applied to any hosted database**. A disposable GitHub PostgreSQL fixture tests the actual SQL privilege effect. Production rollout and independent privilege verification remain BLOCKED pending explicit approval. Default-off app capture alone does not certify this legacy database ingress as closed.

The local Supabase CLI could not initialize its settings directory on the read-only home filesystem. No home permissions or credentials were changed. The SQL is deliberately a review proposal outside the migration directory; supported-tool migration creation and its rollout require a separate authorized step. No invented migration filename or live SQL execution is used as a workaround.

See consent fixture logs and the acceptance matrix for actual cases. No production identifiers or credentials are used in the fixtures.
