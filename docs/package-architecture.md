# SocialRUSH package architecture

Package availability follows the active service catalog.

Catalog-priced services can generate supported Starter, Growth, Pro and Scale quantities from current min/max rules. Services requiring live catalog facts do not expose fallback or zero pricing as purchasable packages. Savings are calculated mathematically and displayed only when a legitimate final price is below the regular computed price.

Public and dashboard package surfaces share the same package model. The existing legacy package definitions remain temporarily available during migration so working order flows are not removed before verification.

Custom quantity must reuse existing minimum, maximum and quantity-step validation. Cross-service bundles remain gated until backend fulfillment is verified.

On mobile, platform/service navigation must remain usable without page overflow, cards collapse cleanly, and a sticky purchase action appears only after a valid explicit selection. Active services without browser-safe pricing render a clear order-flow state instead of an empty grid.

Signed-out visitors can browse packages. Selected platform, service, tier and quantity can be restored after authentication, while final availability and pricing remain backend-authoritative. Dashboard wallet UI derives sufficient-balance and shortfall states from the same selected final price.

The canonical public package route remains crawlable without creating thin indexed filter pages. Before merge, verify active services, authentication, wallet states, responsive layouts, protected pricing, console output, and repository build checks.
