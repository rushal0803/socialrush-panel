# SocialRUSH package architecture

The package buying experience must use the active service catalog as its service-availability source of truth.

## Pricing safety

- Catalog-priced services can generate Starter, Growth, Pro and Scale quantities from their current min/max rules.
- Services marked `requiresLiveCatalogFacts` must not expose fallback or zero pricing as a purchasable package.
- A crossed-out regular price is shown only when a real final price is lower than the computed regular price.
- Savings percentage is derived mathematically; marketing badge text is never treated as pricing authority.

## Shared experience

Public `/packages` and dashboard `/dashboard/packages` should consume the same package model. Dashboard-only wallet/auth state belongs in the purchase layer rather than duplicating package definitions.

## Coverage behavior

Every active service remains discoverable. Services whose protected live facts are required receive a professional availability state instead of a fake package, zero price, NaN, or unsupported checkout path.

## Package ladder

Generated catalog packages use four semantic tiers where the service range permits them: Starter, Growth, Pro and Scale. The engine selects supported quantities and never exceeds the service min/max or quantity step. Growth is the default visual recommendation when more than one tier exists; this is a UX emphasis, not a fabricated discount.

## Discount contract

The initial catalog-generated tier price equals its mathematically computed regular price, so savings are zero. A future package promotion may pass a lower legitimate final price through the shared savings calculator; only then may the UI render an original price, amount saved, or percentage-off treatment.

## Migration rule

`lib/big-packages.ts` remains temporarily available so the existing production purchase flow is not broken mid-migration. New package UI work should consume `lib/package-engine.ts`; the legacy definitions can be removed only after public packages, dashboard packages, pending-selection restoration and order creation have all migrated and passed build/flow verification.

## Analytics contract

The shared package funnel should emit the existing analytics pipeline with stable event names: `packages_viewed`, `platform_selected`, `service_selected`, `package_selected`, `custom_quantity_used`, `package_checkout_started`, `add_funds_clicked`, and `package_purchase_completed`. Event properties must remain non-sensitive and limited to platform, service, package/tier, quantity, price and verified discount values.
