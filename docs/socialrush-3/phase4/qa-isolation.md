# Read-only QA isolation gap report — HOLD

The existing Supabase project `imcysruvfjsexdppxcwc` identifies itself as **SocialRUSH QA Isolated**, region `ap-south-1`, ACTIVE_HEALTHY, Postgres 17.11. Metadata names its database host consistently with that project reference. Edge-function and development-branch lists are empty. No table/customer data, credentials, API keys, SQL, functions or worker invocations were read/executed. Project metadata was inspected, not altered.

Vercel project `prj_08aojXcj8e2i0L9WopWWo1TNORSo` is a Next.js project with protection metadata. SSO protection lists `all_except_custom_domains`; password protection is configured. These are configuration facts, not proof that any particular URL is protected or connected to QA.

The older `fix/seo-release-blockers-20261110` branch has 19 preview-only scoped environment records. Their names include Supabase public/service-role variables, DATABASE_URL, Cashfree/Razorpay, SMM provider, Resend, cron and notification switches. **No values were decrypted, printed or copied.** This does not establish whether a secret points to QA, whether real provider endpoints are disabled, or whether inherited variables are safe. The new Phase 4 branch has no branch-scoped overrides in the metadata response. Shared/inherited configuration and an exact runtime must not be assumed from that absence. [Scrubbed metadata](qa-metadata.json).

| Required independent evidence | Status / gap |
|---|---|
| Immutable candidate deployment and exact commit/build identity | BLOCKED; no deployment is created by this task |
| Browser bundle backend reference | BLOCKED; metadata key names do not reveal the compiled client destination |
| Server Supabase and direct DATABASE_URL identities | BLOCKED; independently corroborated runtime QA database identity is absent |
| Fixture/account ownership and empty nonproduction tenant boundaries | BLOCKED; no customer rows inspected or copied; project name is insufficient |
| Real gateway creation/reconciliation and fulfillment egress disabled | BLOCKED; source guards preserved but configured provider names remain; runtime/egress evidence required |
| QR/UPI recipient and wallet reconciliation isolation | BLOCKED hosted; local launcher forbids ambient dotenv and never submits payment |
| Vercel cron, external scheduler, database cron/queue and background worker destinations | BLOCKED; no Edge Functions does not prove cron/queues or external workers are disabled |
| Resend/email/notification denial or non-sending stub | BLOCKED; variable names and repository flags are not runtime evidence |
| Internal/synthetic classification, durable consent/replay store and retention | BLOCKED for activation; only injected local fixture implements the repository contract |
| Authenticated mobile/desktop checkout | BLOCKED until every preceding prerequisite and separate stateful-QA authorization |

Existing Vercel crons include monitoring, prospect discovery, email and order notifications. No cron or edge function was triggered and no email was sent. Publishing this branch retains a deployment opt-out, not a claim of independent worker isolation.

Before any future hosted testing: produce a concrete immutable QA environment plan, independent browser/server/database identifiers, synthetic fixture namespace, provider/worker/notification egress denial and receipt evidence. Do not copy production service-role credentials or customers. Obtain separate authorization before provisioning, deploying, modifying credentials or starting stateful QA. Never bypass protection to obtain a PASS.

The local launcher denies outbound transports, clears inherited environment, injects synthetic backend credentials and skips all dotenv loading. Regression checks use generated fake env sentinels only. Local fixture success is not evidence about hosted credentials or tenant boundaries.


## 17 November 2026 — renewed independent read-only preflight

Exact candidate before this report: `a4fa59f43013d143d427dda7a9f4718000443647`. The required GitHub pre-merge workflow passed on that source tree; it did not test a hosted QA preview. Current Vercel project metadata reports **zero deployments** matching the candidate branch and **zero branch-scoped environment records** for `feat/socialrush-phase4-integration-20261116`. Auto-deployment for this branch remains disabled in `vercel.json`. No custom environments were returned for the project. SSO protection is enabled for Vercel-hosted deployments (subject to its configured scope).

The Vercel project has shared Preview/Production variable *names* for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, payment gateway credentials, Resend and cron. Metadata was inspected with `decrypt=false` only. **Never use the inherited Preview settings for QA checkout.** The presence of branch overrides for another branch is not isolation for this candidate.

The dedicated QA Supabase project `imcysruvfjsexdppxcwc` is ACTIVE_HEALTHY, PostgreSQL 17.11, with 73 public tables, no listed Edge Functions, and no installed `pg_cron` or `pg_net` extension. These facts do not establish tenant fixture ownership or disable external Vercel cron/webhook/fulfillment providers. QA catalog/account, wallet, orders and data egress have not been statefully tested.

Read-only permission review: `public.analytics_events` has RLS enabled and only an admin SELECT policy was listed. Nevertheless, `public.record_analytics_event(...)` is SECURITY DEFINER and grant metadata shows EXECUTE for `authenticated`; app-side collection gates cannot close this database ingress on their own. The proposal `analytics-ingestion-permissions.proposed.sql` is **not applied**, and its precise impact must be independently security-reviewed before any migration.

### Exact setup needed before an immutable hosted QA preview can be created

1. In Vercel, create **branch-scoped Preview** overrides for both public/server Supabase and direct database references pointing exclusively to the dedicated QA project. Provide independently generated QA-only publishable and server role credentials securely through the provider UI; never paste or copy production secrets into source, chat or logs. Verify direct DB identity separately.
2. Independently isolate or disable every effect-capable path: real gateway creation/reconciliation (including legacy Cashfree/Razorpay), UPI/QR recipient, wallet settlement, SMM fulfillment API, all email/Resend, webhooks, crons, queues and external schedulers. Merely setting a browser feature flag is insufficient. Review the branch's code paths and prove the effective runtime configuration.
3. Prepare owned synthetic QA users/orders/wallets with no reused production customer data. Establish explicit test ownership, no outbound sends/charges, and provider-denial evidence before stateful checkout tests.
4. After the branch-scoped environment is complete and verified, separately review the Vercel preview deployment opt-out and produce an immutable **Preview-only** build pinned to the current PR head. Verify the deployed commit and actual client, server, and direct database identities **before** authenticated or financial testing.
5. Complete protected mobile/desktop authenticated QA and independent review; keep this PR draft and release HOLD until every blocker is independently evidenced. Do not change production settings, merge into main or activate analytics collection from this checklist.

**Outcome: HOLD — configuration and independent isolation evidence are incomplete.** No environment variables, security protections, database permissions, credentials or deployments were changed in this preflight. 
