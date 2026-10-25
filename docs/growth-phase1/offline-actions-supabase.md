# Temporary GitHub Actions Supabase verification

Phase 1.7 update: [current baseline/full-history report](full-replay-application-1.7.md). Incomplete full replay now fails the CI gate even when supplementary curated integration passes; the older green-partial behavior described below is historical evidence only.

23 October 2026. Existing financial branch and draft PR #702 only. No local Docker, paid Supabase upgrade, linked hosted project, production credential, deployment or production SQL is used.

## Isolation contract — before migration replay

Images are pulled by the temporary runner before test data exists. PostgreSQL starts with Docker `--network none`; real GoTrue, PostgREST and the Python client join that container's loopback namespace. No published ports, host networking, Docker socket, production environment file or host credential directory is mounted. Only the integration scripts are mounted read-only in the client. No `NET_ADMIN` capability or privileged mode is granted. The namespace has no interface other than `lo`, no IPv4 route, and no external IPv6 interface. Reserved documentation-address connection attempts must fail locally with no route; no production/provider/customer endpoint is probed. Docker documents the [none driver](https://docs.docker.com/engine/network/drivers/none/).

Before the first application migration, the harness checks container configuration, kernel interfaces/routes and `cron.launch_active_jobs=off`. Migrations cannot obtain a network route through PostgreSQL HTTP extensions, DNS, suppliers, SMTP or background jobs. A cron sentinel is checked over at least 65 seconds after replay, alongside the unchanged disabled setting. Any failed isolation assertion stops replay/testing. The host runner retains Internet access for image/artifact transport, but no test service, SQL or financial data is executed in that host network namespace. This protects normal application egress; it is not a claim of protection against a Docker/kernel escape or compromised runner administrator.

Versions are explicit; image IDs are recorded. Runtime passwords and signing keys are newly generated per run and not published. Customer JWTs come from actual GoTrue login. Only an ephemeral bootstrap service token is signed locally. No raw Auth responses, JWTs, environment dumps or raw database backups are artifacts. Cleanup removes test containers and anonymous volumes on exit; the GitHub-hosted VM is disposable on cancellation. Workflow permissions are read-only and checkout does not retain credentials.

## Gates and truthful scope

- Manifest count and normalized hashes must match all 121 unchanged migration files.
- Full replay stops on its first SQL error and records filename/error. It never rewrites an original migration to turn a failed compatibility gate green.
- The required synthetic Vault secret is seeded before replay; cron launch is disabled before active schedules can be created. The legacy fixed job-ID behavior is not hidden by consuming job ID 1 with a sentinel.
- On failed replay, supplementary tests may rebuild only the isolated synthetic `public` schema from the existing financial fixture and selected exact migrations. Real GoTrue tables and Supabase Auth identity functions are retained. This is labelled **curated integration**, not full-history compatibility.
- Three synthetic Auth accounts: Admin, Customer A, Customer B. Admin role is set through trusted fixture setup; user-editable metadata is not authorization. Customer/A/B/anonymous PostgREST reads and RPCs test ownership and privilege boundaries.
- Wallet same-request replay/concurrency, distinct-request overspending, insufficient balance, admin-only atomic refund, manual UPI/bank/USDT receipt review, duplicate references and revenue RPC permissions are exercised through HTTP. Manual review's browser admin is denied the server-only RPC; server-action authorization still requires separate Next.js integration evidence.
- No transfers, provider keys/integrations, supplier calls or real customer data. Conditional USDT is a synthetic receipt ledger test, not blockchain or FX-provider certification.

Evidence: `offline-supabase-finance` artifact with exact head, image IDs, isolation checks, per-file replay results and integration outcomes. A green CI job can mean targeted integration passed while full replay remains explicitly **BLOCKED** in the report; release approval must read both gates. PR #702 records final exact-head results so evidence does not trigger a documentation-only retest loop.

## Remaining gaps and alternatives

First completed isolated run: [39863352132](https://github.com/rushal0803/socialrush-panel/actions/runs/39863352132) at `13ca4b12c3f790e85fc2c93165c87d1a56fe9421`. Network/cron checks passed, including the 65-second sentinel, and 41 real Auth/PostgREST financial assertions passed on the labelled curated schema. Full-history replay passed the first 47 files, then stopped at `202609020001_update_follower_service_pricing.sql`: `column "updated_at" of relation "services" does not exist`. The historical schema has no earlier definition for that column. Original SQL remains unchanged. Do not patch production or silently add a fixture column to declare full replay passed; a reviewed clean-install compatibility/baseline plan is needed. Subsequent regression additions cover injected post-deduction rollback, owner-authenticated manual split receipt submission for all three methods and deposit-excluded revenue. Exact final-head results are recorded in PR #702.

This minimal stack tests real GoTrue/PostgREST/PostgreSQL, not hosted Supabase project configuration, Storage, Realtime, Edge Functions, email delivery, OAuth or Next.js cookies/server actions/mobile browser financial journeys. Existing fixture browser tests remain supplementary. Full-history migration errors and actual application-to-stack journeys remain separate gates. No production readiness claim follows from targeted passes.

If the container namespace or cron checks fail, integration stays BLOCKED. Alternatives: repair this disposable runner's isolation, or an explicitly approved free-tier empty Supabase project with independently proven database/runtime egress and cron containment. A free project name alone is not proof. Do not substitute production, shared Preview, paid upgrades or local Docker. Historical real-data reconciliation remains blocked until an approved read-only source is authorized; no automatic balance repairs.

Owner setup for this CI approach: no laptop hypervisor, hosted project or Supabase secrets are needed. Existing Actions must permit the workflow and have free/included runner capacity. No purchased runner, quota increase or paid resource is created. If account policy/quota blocks it, owner approval/configuration is required before spending.

Phase 2 stays planning-only: [presentation handoff](../growth-phase2/presentation-ready-tasks.md) and [business specification](../growth-phase2/implementation-specification.md). The ₹10 lakh target is refund-adjusted recognized service revenue, not wallet funding volume.
