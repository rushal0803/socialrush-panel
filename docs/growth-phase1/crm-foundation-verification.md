# CRM clean-install reconstruction verification

25 October 2026. Existing branch and draft PR #702. No production execution, permission changes, merge or deployment.

## Decision and provenance

The owner-provided private catalog file was accessible and its SHA256 matched the owner's supplied value. Its raw bytes, private location/hash, full catalog, dependency inventory and production ACL findings are deliberately excluded from Git and CI. Only reviewed, schema-only derived SQL enters the disposable stack. No additional remote evidence collection occurred.

`supabase/clean-install/v1/crm-foundation.sql` is a **current-state reconstruction minus known later changes**, not recovered original creation SQL or a proven historical before-image. It creates only leads and contacts, immediately before `202609020002_crm_reply_automation.sql`. All 121 historical files retain their manifest hashes. It is outside automatic migrations, transaction-wrapped, requires explicit `socialrush.clean_install=v1`, and rejects either existing relation. Do not run it on an existing/production project. It contains no seed/customer rows, triggers, provider integrations or financial updates.

## Chronology mapping

| Derived object group | Source and treatment |
|---|---|
| Lead/contact identity, ordinary columns, nullability, types and defaults | Matched against the privately reviewed current catalog; retained in original ordinal order, except priority. Repository chronology has no other direct column-introducing ALTER for these two tables. This does not prove an absence of out-of-band changes. |
| `crm_leads.priority` and its check | Excluded from foundation. Original migration `202609020002` owns both. Regression executes the whole original migration and verifies the resulting default and invalid-value rejection. |
| Primary keys, created-by/profile FK, lead/contact cascading FK, CHECK constraints | Derived from catalog definitions with original names and actions; priority check excluded. They establish compatibility prerequisites, not a claim of original creation dates. |
| Six non-primary indexes | Derived expression/order/predicate/uniqueness retained. Primary indexes are supplied by their PK constraints, not created twice. No evidence-supported later priority index needs backdating. |
| RLS and administrator policies | Derived expressions retained; both relations use `public.is_admin()`. Real Auth integration remains a distinct gate. Local test uses an explicitly synthetic predicate fixture solely to check policy mechanics. |
| ACLs | Intentional **clean-install security deviation**: revoke inherited object defaults for PUBLIC/anon/authenticated/service_role on the new tables; grant only SELECT/INSERT/UPDATE/DELETE to authenticated/service_role. Anonymous gets no table privilege. Do not copy broad table-maintenance permissions into the baseline. This changes disposable reconstruction semantics, never live access. |
| Other CRM objects | Not supplied by this artifact. No guessed outreach settings/messages/sequences/activity/helper functions or placeholder implementations. Stop replay at the next unresolved prerequisite. |

The exact per-object private comparison retains provenance outside Git. Current-state definitions can support a bounded clean-install reconstruction; they cannot establish every constraint's historical introduction date or prove production-upgrade compatibility. Review that limitation before accepting this baseline.

## Permission review

Actual catalog grant findings remain private. The security concern is actionable for design: PostgreSQL RLS does not cover TRUNCATE or REFERENCES ([PostgreSQL 17](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)). Avoid TRUNCATE/REFERENCES/TRIGGER/MAINTAIN for client roles in the reconstructed baseline. This is not proof of a remotely exploitable PostgREST endpoint; role inheritance, credentials, reachable RPCs and missing function definitions still require review. No production TRUNCATE, including rollback-based testing, was attempted.

## Verification

| Gate | Result |
|---|---|
| Private file integrity and metadata comparison | PASS locally; private evidence excluded from publication |
| Focused baseline/catalog/privilege regressions | PASS: 7 tests; original reply migration executed without edits |
| Context/existing-table rejection and failure after CREATE | PASS; transaction rolls back on missing policy helper and existing synthetic rows remain unchanged |
| Synthetic constraints/indexes/RLS/anon/authenticated/TRUNCATE | PASS locally in PGlite; not production effective-access certification |
| Full 121-file replay | FAIL: [run 40136977758](https://github.com/rushal0803/socialrush-panel/actions/runs/40136977758), tested implementation head `5a9cd0d38eb918c47e37faaefe09285159ba0d97`; 49 passed, file 50 missing `public.crm_outreach_settings`, 71 later files unattempted |
| Real Next.js full-stack financial journeys | BLOCKED until complete replay succeeds |
| Production upgrade compatibility / effective permission certification | BLOCKED; no live execution or additional evidence scope |

CI preserves network-none/loopback-only operation, disabled cron before replay, no production credentials, no external services, and synthetic-only records. It records the derived foundation hash and checks priority absence and client TRUNCATE denial before the original migration. Existing mandatory failure reporting remains enabled. Supplementary curated Auth checks cannot turn an incomplete full-history replay into PASS.

On that tested head, native PostgreSQL concurrency and wallet approval/replay jobs passed (121000454894 / 121000455062). Isolated job 121000454817 verified priority absence and effective client TRUNCATE denial before executing original migration 49 successfully. Network checks and the 65-second no-execution cron sentinel passed. All 62 supplementary real Auth/PostgREST assertions passed on the explicitly labelled curated fixture. [Sanitized run artifact](https://github.com/rushal0803/socialrush-panel/actions/runs/40136977758/artifacts/12577835917) contains no private catalog input. No actual Next.js full-stack journey ran. Standard CI for this implementation head passed TypeScript and production build and was running browser smoke when this evidence was recorded; consult PR #702 for final exact-head results. Local TypeScript and lint passed (existing lint warnings, no errors). The private equivalence comparison also passed after the entire unchanged reply migration, including its restored priority column/check.

## Exact next missing prerequisite

Migration `202609020003_resend_crm_integration.sql` inserts into and updates `public.crm_outreach_settings` but never creates it. The two-table private evidence does not define this relation. Current repository SQL search and reachable-history `git log --all -i -G 'create[[:space:]]+(table|function).*crm_outreach_settings' -- '*.sql' '*.md' '*.txt'` found no creation definition; this bounded search does not inspect archive internals or inaccessible sources. The immediate requirement is an authoritative definition of this table, including columns/defaults/checks/keys/indexes/RLS/grants/triggers and referenced dependencies. Do not infer it from the INSERT column list. Migration 51 also consumes outreach messages; later migrations require additional CRM objects/helper definitions. Recover the dependency closure rather than promising that one more table will complete history.

Preferred next input: existing authoritative SQL/schema artifact through the reviewed private channel. Otherwise separately approve a catalog-only inspection for this exact additional object and identified prerequisite definitions, keeping output private and excluding all rows/secrets/function bodies until specifically reviewed. Existing authorization covers reading the supplied local file, not fresh remote collection. No database connection, collection or new production permission change is authorized or executed here.

## Rollback and next gate

Discard the disposable stack on any failure; there is no production rollback SQL because no production application is authorized. Do not drop these tables in an existing project. If the next missing prerequisite is reached, obtain its authoritative source-controlled DDL or a separately approved private catalog artifact; no new remote collection is implied. Retired gateways remain Not Applicable. Phase 2 growth specifications remain unchanged and separate.
