# SocialRUSH package architecture

Package availability follows the active service catalog.

Catalog-priced services can generate supported Starter, Growth, Pro and Scale quantities from current min/max rules. Services requiring live catalog facts do not expose fallback or zero pricing as purchasable packages. Savings are calculated mathematically and displayed only when a legitimate final price is below the regular computed price.

Public and dashboard package surfaces share the same package model. The existing legacy package definitions remain temporarily available during migration so working order flows are not removed before verification.

Custom quantity must reuse existing minimum, maximum and quantity-step validation. Cross-service bundles remain gated until backend fulfillment is verified.

The canonical public package route remains crawlable without creating thin indexed filter pages. Before merge, verify active services, authentication, wallet states, responsive layouts, protected pricing, console output, and repository build checks.
