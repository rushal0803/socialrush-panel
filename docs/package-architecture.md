# SocialRUSH package architecture

The package buying experience must use the active service catalog as its service-availability source of truth.

## Pricing safety

- Catalog-priced services can generate Starter, Growth, Pro and Scale quantities from their current min/max rules.
- Services marked `requiresLiveCatalogFacts` must not expose fallback or zero pricing as a purchasable package.
- A crossed-out regular price is shown only when a real final price is lower than the computed regular price.
- Savings percentage is derived mathematically; marketing badge text is never treated as pricing authority.

## Shared experience

Public `/packages` and dashboard `/dashboard/packages` should consume the same package model. Dashboard-only wallet/auth state belongs in the purchase layer rather than duplicating package definitions.

## Next integration

Migrate the package UI away from manually duplicated package price definitions and onto `lib/package-engine.ts`, while preserving existing link validation, authentication, wallet checks, pending selection restoration and order APIs.
