# CRM chronology and private review preparation

**Update:** The owner subsequently supplied a private local artifact. See [derived foundation and verification](crm-foundation-verification.md). The pending-artifact statements below describe the earlier preparation stage.

25 October 2026. Branch `feat/payment-revenue-safety-20261020`, existing draft PR #702. This document contains **repository-derived facts and a review method only**. No private production export, definitions, grant findings, counts or credentials are reproduced. Receipt of a private artifact is pending; no evidence-supported CRM foundation has been generated or published.

## What the repository establishes

All 121 historical migration files remain unchanged. The first direct CRM-table schema alteration is at ordinal 49, `202609020002_crm_reply_automation.sql:14`:

`crm_leads.priority`: `text NOT NULL DEFAULT 'normal'`, CHECK allowing `low`, `normal`, `high`, added with `IF NOT EXISTS`. The same migration creates reply-automation tables with foreign keys to the pre-existing lead/contact identities. Their referenced keys and compatible types are prerequisites; this is not a complete foundation definition.

The priority column/default/check belong to the recorded replay step when constructing a clean install. Do not copy the final current column and its dependent constraints/indexes into a pre-step baseline blindly. `IF NOT EXISTS` means the source alone does not prove whether production already had that column when the migration ran. The eventual private comparison must check the exact current type/default/check, identify conflicts and assign an explicit owner to each definition. Aggregate object counts cannot establish chronology.

| Recorded source | Dependency / chronology consequence |
|---|---|
| `202609020002_crm_reply_automation.sql` | Adds priority; requires both foundation relations and unique referenced identity keys. Creates reply settings/threads/messages/classifications/audit/follow-ups and their admin policies. These later objects are not pre-existing lead/contact foundation DDL. |
| `202609020003_resend_crm_integration.sql` | Requires another pre-existing relation, `crm_outreach_settings`; this two-table foundation may not close the full missing CRM dependency chain. Only review historical SQL; do not connect mail providers. |
| `202609030001_crm_professional_email_formatting.sql` | Reads contact `id`, `lead_id`, `email`, `created_at` and uses outreach messages. Required by this point; does not establish their original production creation date. |
| `202609040003_crm_autopilot_phase_1.sql` | Creates derived scores/briefs/health tables and functions referencing leads/contacts; keep derived schema at its historical step. |
| `202609040004_crm_autopilot_suppression_guard.sql`, `202609040005_crm_autopilot_operational_cleanup.sql` | Later function/data behavior; not foundational table-creation definitions. |
| `202609050001_crm_autopilot_phase_2.sql` | Creates candidate/intelligence structures referencing leads; functions depend on the missing foundation. |
| `202609050002_crm_autopilot_phase_2_completion.sql`, `202609050003_crm_autopilot_phase_2_refresh_fix.sql`, `202609060001_crm_phase3_discovery_quality_fix.sql` | Later function/refresh replacements; retain order rather than backdating definitions. |
| `202609060002_customer_lifecycle_retention.sql` | Further lead/contact consumers; no original table creation recovered here. |
| `20260925174007_harden_public_views_and_function_paths.sql` | Alters `crm_is_internal_operational_test_lead(text,text)`; its authoritative prerequisite definition must be available before this step. Do not invent a stub. |
| `20261002093000_crm_autonomous_outreach_phase4.sql`, `20261009153000_crm_lead_autopilot_v2.sql` | Later outreach/promotion functions and scheduling; do not backdate or enable scheduling. |
| `20261010154500_promote_verified_qualified_crm_candidates.sql`, `20261010154800_fix_crm_candidate_promotion_activity_type.sql` | Later candidate/contact writes; not evidence for original table/RLS/ACL creation. |

An exact-name review found no other direct ALTER TABLE statement adding a column/constraint on the two target tables. This is a bounded static-source finding, not proof of no dynamic/out-of-band changes. Function-only and security-hardening migrations still participate in the complete chronology. All files must ultimately replay; no CRM file may be skipped because the financial tests use fewer tables.

## Private comparison and publication boundary

Keep the reviewed export outside the Git workspace where possible. If the owner explicitly chooses a workspace path, `/.private-crm-evidence/` is ignored; verify with `git check-ignore` before receipt. Ignore rules are not encryption or a security boundary and `git add -f` defeats them. Never place evidence under CI-uploadable artifacts, tracked docs/tests, build contexts or container mounts. Do not search for an undelivered export or copy it from production.

Once the owner supplies its approved private location, record provenance and exact bytes/hash **privately**. Validate format/sections and completeness without logging raw JSON. The published artifact must not be the raw export or a dump of production evidence. A proposed derived clean-install SQL artifact requires a separate private content review for publication/CI scope before upload. Until that scope is clear, keep evidence-derived DDL and findings private.

Prepare a private per-object matrix: evidence identity; exact definition; first source use; recorded introducing/modifying migration; pre-49/later-owned/unknown classification; type/default/nullability; constraints and index ownership; RLS expression/command/roles; ACL origin; referenced type/function/sequence/role; unresolved proof. Do not infer historical definitions from names, current counts, absence of user triggers, or UI types.

For priority: let the recorded migration supply its column and inline CHECK in a fresh plan after confirming the evidence mapping. For every other current column/constraint, establish whether it is an original prerequisite, later modification or still unknown. Preserve FK actions/deferrability/validation, partial/expression indexes, collations/identity/sequence details and policy semantics. A current snapshot alone is not a complete historical before-image.

Resolve the dependency closure privately: both target tables, referenced keys/types/sequences, policy functions and prerequisite outreach/settings/helper objects. If the delivered artifact supplies identities but not definitions, request the approved source artifact or separately authorized schema-only evidence for those specific objects. No remote database connection or additional collection is authorized by this task's report of a completed inspection.

## Grant review — no live permission changes

Do not copy current ACLs into a clean-install foundation merely to reproduce them. Maintain separate evidence-parity and proposed least-privilege decisions. Direct grants, PUBLIC, inherited roles, ownership/BYPASSRLS, column grants, function EXECUTE/security/search_path and default privileges all need review. Neither a policy count nor RLS enabled flags establishes effective access.

PostgreSQL states that table-wide `TRUNCATE` and `REFERENCES` are [outside RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html). `TRUNCATE` requires its own privilege and does not fire DELETE triggers; foreign-key dependencies and CASCADE can change the reachable affected set ([TRUNCATE](https://www.postgresql.org/docs/17/sql-truncate.html)). Do not attempt it against production, including inside a rolled-back transaction. Assess effective privilege from approved metadata and demonstrate behavior only on disposable unrelated synthetic tables.

PostgREST's documented table routes expose ordinary CRUD verbs, not a TRUNCATE verb ([table API](https://docs.postgrest.org/en/stable/references/api/tables_views.html)). Thus a broad table grant is a privilege-scope concern, not by itself proof of an exploitable anonymous REST truncate path. Separately review SQL-role access, reachable RPCs, dynamic SQL, SECURITY DEFINER routines and role inheritance. Repository search found no direct CRM TRUNCATE statement; that does not audit missing/out-of-band functions.

Any confirmed broad anon/authenticated grant should receive a private threat assessment and a proposed explicit allowlist, with required customer/admin/server workflows listed. Do not revoke live grants, mutate production roles, tighten the future baseline silently, or claim an exploit without checking the path. A production permission change would require a separate reviewed rollout and authorization; none is prepared for execution here.

## Gates

Local verification: `node --test tests/database/clean-install-baseline.test.mjs tests/database/crm-schema-evidence.test.mjs` passed all **5** tests. The new generic, disposable PGlite privilege probe verifies RLS-denied DELETE, denied TRUNCATE without privilege, then successful TRUNCATE with its separate privilege. It contains no CRM definitions or private evidence and makes no remote connection. This is PostgreSQL semantics coverage, not an audit of actual effective production access. Historical manifest verification passed for all 121 normalized-LF hashes; diff whitespace check passed.

Repository chronology/preparation can proceed now. Authoritative private schema comparison, evidence-supported foundation SQL, full-history replay with that foundation, and actual Next.js-to-full-stack journeys remain **BLOCKED pending the reviewed artifact and its permitted derivative scope**. The earlier isolated replay failure remains valid; a report of current table existence does not install those tables in a fresh database. Existing timestamp baseline and all historical files are preserved. Wallet/manual UPI/bank/conditional USDT remain the only active payment scope; retired gateways remain Not Applicable. Phase 2 specifications remain separate and unchanged.
