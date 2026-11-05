# Legacy checkout production idempotency preflight — 2026-11-05 (read only)

## Live catalog evidence
Read-only pg_proc lookup found:
- public.place_order(p_service_id bigint, p_link text, p_quantity integer): SECURITY DEFINER, owner postgres; authenticated EXECUTE yes, anon EXECUTE no.
- public.place_campaign(p_service_id bigint, p_link text, p_package text): SECURITY DEFINER, owner postgres; authenticated EXECUTE yes, anon EXECUTE no.
- information_schema.columns scan in public for table names containing "idemp" or columns containing "idemp", "request_key" or "client_order" returned no matches. This is a narrow naming scan, not proof that no other deduplication mechanism exists.

## Risks and required decisions
The existing three-argument place_order RPC has no request key in its signature. Simply adding a new idempotent endpoint would not protect existing direct callers. Do not revoke authenticated EXECUTE until all real checkout paths, historical clients and administrative dependencies are mapped. SECURITY DEFINER and public API exposure require explicit authorization and search_path review.

## Next review-only inspection
1. Inventory direct .rpc('place_order') / .rpc('place_campaign') references in current repo and generated or dynamic call paths.
2. Inspect pg_get_functiondef, proconfig/search_path, function ACLs and actual checkout API routes.
3. Inspect orders/wallet transaction indexes, constraints, trigger functions and any external payment reference uniqueness; verify alternative idempotency implementations beyond name matching.
4. Decide whether to deprecate legacy RPC, proxy it through an authenticated server endpoint, or migrate all callers to a new keyed API.
5. Build and verify isolated migration with same-key retry, mismatched-key rejection, concurrent replay, rollback, authorization and notification deduplication before any production proposal.

No production DDL, GRANT/REVOKE, real checkout, or merge is approved.
