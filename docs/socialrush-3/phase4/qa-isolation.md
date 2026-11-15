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
