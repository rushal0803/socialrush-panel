# SocialRUSH package architecture

Package availability follows the active service catalog.

Catalog-priced services can generate supported Starter, Growth, Pro and Scale quantities from current min/max rules. Services requiring live catalog facts do not expose fallback or zero pricing as purchasable packages. Savings are calculated mathematically and displayed only when a legitimate final price is below the regular computed price.

Public and dashboard package surfaces share the same package model. The existing legacy package definitions remain temporarily available during migration so working order flows are not removed before verification.

Custom quantity must reuse existing minimum, maximum and quantity-step validation. Cross-service bundles remain gated until backend fulfillment is verified.

On mobile, platform/service navigation must remain usable without page overflow, cards collapse cleanly, and a sticky purchase action appears only after a valid explicit selection. Active services without browser-safe pricing render a clear order-flow state instead of an empty grid.

Signed-out visitors can browse packages. Selected platform, service, tier and quantity can be restored after authentication, while final availability and pricing remain backend-authoritative. Dashboard wallet UI derives sufficient-balance and shortfall states from the same selected final price.

Package funnel analytics use stable events for view, platform selection, service selection, package selection, custom quantity, checkout start, add-funds click and purchase completion. Event properties are limited to non-sensitive package context.

Generated package identity uses service code, tier and quantity rather than marketing copy. Legacy package IDs are mapped only when their service and quantity still resolve to a valid active-service selection; stale IDs fall back to the service view.

Public and dashboard surfaces never calculate totals independently. Both consume the shared package price in paise, while final order creation continues to use backend validation. A display/backend mismatch blocks release.

Only one tier receives the dominant recommendation treatment. Cards prioritize quantity, final price, verified savings when present, effective rate, concise service facts and one primary action. Platform and service controls expose selected state and visible keyboard focus.

Implementation uses existing React, Tailwind, Lucide and current motion dependencies rather than adding another heavy UI library. Platform/service switching stays local and noncritical content remains below the purchase decision.

Trust content is limited to facts already supported by the selected service configuration and existing product flow. Delivery/refill claims are never generalized across services.

Rollout: integrate the shared engine alongside the legacy path, render all active service states, migrate selection identity, wire validated custom quantity, add wallet/auth continuity, verify any future promotion source, then test backend bundle semantics. Remove duplicated package definitions only after all flows pass verification.

Verification covers all seven active platform IDs and every active service record, not merely each platform tab. For each service verify generated-tier or protected-pricing state, URL restoration, target-link rules, checkout start and relevant wallet/auth handoffs.

Current feature-branch status: shared catalog-driven package engine implemented; legacy order path intentionally retained; public/dashboard component migration and full verification still pending. Production main has not been changed by this package branch.

Next implementation target: replace the package selector's `bigPackages`-driven service/package discovery with shared engine groups while preserving existing target-link validation, auth detection, wallet loading, pending-order storage and order API behavior.

No fake discount migration: legacy `discountBadge` strings are presentation metadata only and are not carried into the shared engine. Until a legitimate promotion source is connected, generated tier price equals regular price and savings render as zero/hidden.

Services that require protected live catalog facts remain visible in navigation but do not receive generated package cards from fallback data. Their package area routes customers into the authoritative order flow for current availability, limits and pricing.

Service search, if added, filters only the selected platform's already-active catalog. Search text does not alter pricing/availability and does not create indexable URL variants; platform and service selection remain the durable shareable state.

Empty/error states never render undefined values, NaN or zero-price purchase cards. Recoverable catalog/loading errors retain the selected platform/service context and offer retry or a safe route to the existing order experience.

Dashboard Add Funds handoff preserves selected package context where supported. After funding, restoration must revalidate the service and price rather than trusting stale client state.

Package cards do not invent guarantees. Delivery, refill and quality text comes from the selected service configuration; when protected live facts are required, those details are deferred to the authoritative order flow.

Testing target widths: approximately 320, 375, 390, 430, 768, 1024 and 1440+ pixels, with no horizontal page overflow, clipped badges, unreadable prices or hidden primary actions.

The shared engine deliberately generates no monetary discount by itself. A promotion adapter must provide both legitimate regular and final prices before savings UI can appear.

Recommended-tier emphasis is independent from discounting: Growth may be visually recommended when multiple tiers exist because it is a middle decision point, but it cannot display `Best Value`, percentage savings or a crossed-out price without verified economics.

Package unit economics are displayed from integer paise calculations. Effective per-1K price is derived from the selected tier total and quantity, preventing a separate manually maintained rate from drifting out of sync.

The first UI integration should be additive: import the engine, derive platform/service groups from it, and retain the current purchase handlers until equivalent generated selections can pass through them. This minimizes regression risk while expanding service coverage.

Release is blocked until production build checks pass and final UI is inspected. The branch is intentionally not merged or deployed while component migration remains incomplete.

Public and dashboard package pages must ultimately consume the same generated service/tier model so adding an active catalog service does not require separately creating a second dashboard package definition.

Phase 1 foundation is now coded on the feature branch. Phase 2 UI migration starts with service coverage and tier rendering; purchase handlers remain unchanged until generated selections are proven equivalent.

UI migration must preserve the existing shareable `platform`, `service` and package-selection query behavior. Invalid or stale package selection falls back safely to the active service instead of auto-buying another tier.

For services with fewer than four meaningful supported quantities, render only unique valid tiers; never duplicate quantities merely to fill a four-card layout.

Custom quantity appears after standard tiers only when browser-safe min/max/step rules are available. Its computed total uses the same service pricing calculation and backend validation remains authoritative at order submission.

The next code change should touch the shared package component only after mapping its current `BigPackage` dependencies to generated tier equivalents; this prevents a partial type migration from breaking checkout.

No production merge is part of the current step. Branch changes are isolated for review and verification.

Implementation checkpoint: `lib/package-engine.ts` is the first functional code addition; documentation records the release invariants. The existing package UI still runs unchanged until the integration step is complete.

Once component migration is functional, use the existing deployment/preview workflow to inspect real rendering before any merge. Do not treat static code review as final UI verification.

The package engine is intentionally pure and has no Supabase/browser dependency, keeping tier generation testable and reusable by both server-rendered public content and client purchase UI.

Phase 2 must not remove current wallet purchase logic merely to simplify the UI rewrite; the new presentation adapts to the proven order flow first, then backend refactors can be considered separately.

The canonical public package route remains crawlable without creating thin indexed filter pages.
