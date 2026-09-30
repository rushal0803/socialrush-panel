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

The canonical public package route remains crawlable without creating thin indexed filter pages. Before merge, verify active services, authentication, wallet states, responsive layouts, protected pricing, console output, and repository build checks.
