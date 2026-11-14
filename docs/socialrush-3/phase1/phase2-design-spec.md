# Phase 2 — brand-preserving homepage and service-page specification

Status: **Specification prepared; implementation NOT RUN.** Requires Phase 1 safety gates and separate design implementation review. No catalog, payment method, public claim, live page or automation is changed by this document.

## Preserve and consolidate

Keep SocialRUSH wordmark, near-black/charcoal surfaces, orange primary actions and existing typography. Reuse PremiumHomeHero, PremiumHomepage, PremiumSystem.module.css, marketing service order builder, dashboard UI and shared Tailwind semantic tokens. Do not build a second design system. Inventory variants before consolidating; retain existing functional routes and canonical ownership.

Token rules: existing background/section/elevated tokens; primary/secondary/muted text tokens; 4/8px spacing rhythm; existing card/control radius; consistent 160–220ms transitions with reduced-motion support. Target WCAG AA contrast, 16px readable form/body copy, visible focus, persistent field labels, 44px preferred touch targets. Retain current orange/black palette; validate actual token pairs rather than assume orange text is readable on every surface.

## Homepage hierarchy

1. **Hero:** one honest value proposition, one primary “Browse services” CTA and a quiet pricing/help alternative. Preserve sample-workspace labeling. No fabricated customer totals, provider badges, delivery guarantees or official platform endorsement.
2. **Discovery:** accessible platform tabs/select plus searchable service grid. Search must preserve query and show clear no-results/loading/error states. Keyboard and screen-reader users must reach the same results.
3. **Featured services:** show quantity unit, current price/currency, destination type and verified refill status. Ranking needs demand plus contribution/refund evidence. Until known, label as catalog examples rather than best-selling or most profitable.
4. **Ordering process:** choose service/quantity → provide correct public destination → review authoritative total and payment instructions → track actual fulfillment. Never suggest “submitted” equals “paid” or “paid” equals “delivered.”
5. **Trust and help:** real policy links, actual support channels and scope, honest service limitations. Published verified reviews only; retain useful empty state until reviews exist.
6. **FAQs and final action:** answer price units, destination requirements, status/refill/refund eligibility and service risks. Keep useful internal links while reducing repeated CTA/benefit sections.

At 390px: hero CTA and useful discovery entry appear early; no horizontal scroll; sticky actions must not hide content or keyboard focus. At1440px: consistent content width and a readable hero/discovery layout; avoid oversized empty sections. Existing public mobile homepage is long; shorter hierarchy is a hypothesis requiring task-based validation, not proof of conversion uplift.

## Service-page architecture

**First screen:** exact service name and public destination type, concise useful description/limitations, quantity builder, current rate and currency. Retain canonical route and original helpful content. Platform “India” copy must distinguish INR availability from geographic targeting.

**Builder behavior:** preserve typed quantity/link during delayed catalog loading and auth navigation. Quantity remains an integer; distinguish empty/invalid input from chosen defaults. Show current min/max and rate per unit or1K explicitly. Update accessible summary without moving focus. Use integer-paise arithmetic and server authority; stale/forged prices require a renewed review. Never silently replace1000 with a minimum quantity after hydration.

**Summary:** selected service, integer quantity, public destination, unit price, total/currency and current eligibility/availability. Display known delivery estimates as estimates with their source/terms; no unverified “instant” guarantee. Show specific refill conditions and refund policy before confirmation. Do not infer refill duration from the generic “eligible” label.

**Form states:** inline described validation; preserved inputs after errors; bounded loading; retry with no duplicate order; rejected/stale price; unavailable service; login required; pending verification; verified paid; failed payment. Separate manual payment reference submission from verification. Never expose database migration instructions, provider payloads or credentials to customers.

**Below builder:** unique destination/eligibility guide; evidence-backed delivery/refill/refund answers; concise FAQs; genuine related services selected by intent; legitimate organic strategy/analytics alternatives. Schema must match visible content and canonical owner; no fabricated ratings or doorway variants.

## Reviewable acceptance tests

All are **NOT RUN for the redesign**, because no redesign is implemented in Phase 1.

| ID | Test | Evidence required |
|---|---|---|
| P2-01 | Brand consistency on homepage and representative service pages | Screenshots and token/component inventory at390/1440 |
| P2-02 | Service discovery with keyboard and no results | Task completion, focus order and accessible names |
| P2-03 | Quantity1000 through slow hydration and login-return | Trace showing unchanged quantity/link and authoritative total |
| P2-04 | Invalid/min/max/stale quantities and prices | Stubbed server outcomes; no provider/payment calls |
| P2-05 | Sticky CTA, virtual keyboard,200% zoom and320px stress | No blocked fields, messages, links or focus |
| P2-06 | Claims, review provenance and policy visibility | Catalog/operations evidence and editorial checklist |
| P2-07 | Form semantics, contrast, screen reader and reduced motion | Manual audit plus bounded automated checks |
| P2-08 | Performance and conversion | Separate lab/RUM evidence; cohort-defined baseline and pre-registered experiment |

Instrumentation: privacy-safe service/quantity/review/auth/verified-order events; no destination URLs, tokens, email or payment references. Engineering environments must be excluded. Primary commercial metric is contribution per eligible visitor with refund/support/error guardrails; do not optimize AOV alone or promise uplift. Release only after separate approval, authenticated QA and independent backend/payment isolation.
