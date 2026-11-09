# Legacy checkout production idempotency preflight — 2026-11-05 (read only)

## Live catalog evidence
Read-only pg_proc lookup found:
- public.place_order(p_service_id bigint, p_link text, p_quantity integer): SECURITY DEFINER, owner postgres; authenticated EXECUTE yes, anon EXECUTE no.
- public.place_campaign(p_service_id bigint, p_link text, p_package text): SECURITY DEFINER, owner postgres; authenticated EXECUTE yes, anon EXECUTE no.
- Initial narrow information_schema naming scan returned no matches, but subsequent pg_catalog inspection revealed **public.orders.client_request_id uuid (nullable)** and a partial unique index **orders_user_request_unique ON (user_id, client_request_id) WHERE client_request_id IS NOT NULL**. The earlier negative scan was insufficient; existing idempotency infrastructure must be reused or evaluated before proposing new schema.

## Risks and required decisions
The existing three-argument place_order RPC has no request key in its signature. Simply adding a new idempotent endpoint would not protect existing direct callers. Do not revoke authenticated EXECUTE until all real checkout paths, historical clients and administrative dependencies are mapped. SECURITY DEFINER and public API exposure require explicit authorization and search_path review.

## Next review-only inspection
1. Inventory direct .rpc('place_order') / .rpc('place_campaign') references in current repo and generated or dynamic call paths.
2. Inspect pg_get_functiondef, proconfig/search_path, function ACLs and actual checkout API routes.
3. Inspect orders/wallet transaction indexes, constraints, trigger functions and any external payment reference uniqueness; verify alternative idempotency implementations beyond name matching.
4. Decide whether to deprecate legacy RPC, proxy it through an authenticated server endpoint, or migrate all callers to a new keyed API.
5. Build and verify isolated migration with same-key retry, mismatched-key rejection, concurrent replay, rollback, authorization and notification deduplication before any production proposal.

No production DDL, GRANT/REVOKE, real checkout, or merge is approved.

## Additional read-only pg_catalog findings (2026-11-05)
- public.orders.client_request_id is nullable uuid; orders_user_request_unique prevents two non-null identical request IDs for the same user.
- public.orders.charge is numeric(14,2) NOT NULL.
- Both legacy place_order and place_campaign set search_path=public, reference auth.uid(), and use FOR UPDATE on the wallet; neither function definition references client_request_id.
- Other observed unique indexes: orders_public_order_id_unique, transactions_provider_order_unique (partial), transactions_provider_payment_unique (partial).
- GitHub code search returned no results for place_order/place_campaign/idempotency; **this is not proof of no callers**. A full repository tree scan is still required.
- Unique request index does not imply a safe retry-return contract, payload fingerprint validation, or protection for requests whose client_request_id is NULL.

## Revised priority
Trace the existing client_request_id writers/readers and checkout API routes before designing a new table. Do not introduce a duplicate idempotency table without demonstrating why the existing index is inadequate.
