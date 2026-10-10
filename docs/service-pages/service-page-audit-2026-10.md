# SocialRUSH service pages — Phase 1 conversion audit

Date: 2026-10-11
Repository: `rushal0803/socialrush-panel`
Audited base branch: `main` at `ab939038a559d5c2a942f867eec1527f92f32a49`
Work branch: `feat/service-pages-cro-phase1-2026-10`
Status: **source-code and route inventory completed; browser/device QA and current GSC/revenue attribution NOT completed.** No production deployment is authorized by this audit.

## Business objective

Help organic-search visitors complete a correct paid order with minimal uncertainty. The ordering action should be discoverable immediately, with exact validated service facts, a trusted and attractive SocialRUSH branded experience, mobile-first ergonomics, and no loss of organic-search traffic.

Scope: public `/services` directory, canonical commercial service landings, catalog detail pages, country variants that share components, and the **handoff** to existing checkout. **Do not modify** Supabase migrations, service pricing configuration, real payments, wallet/order calculations, account authentication, purchase idempotency or financial data.

## Coverage inventory

- The static catalog declares **43 service codes across 7 platforms**, verified against `lib/smm-service-catalog.ts`.
- Distribution: **Instagram 6**, **YouTube 5**, **Facebook 5**, **LinkedIn 9**, **Telegram 4**, **TikTok 6**, **X/Twitter 8**.
- All **43 codes have a defined link-validation rule** in `lib/order-service-experience.ts`; this does not itself prove all runtime order paths work.
- `components/marketing/services/ServicesPageContent.tsx` explicitly maps **21** catalog codes to canonical/detail URLs; **22** currently fall back to `/services/<code>`. These fallback routes often have dedicated handlers, but all **43** links must be exercised in browser testing before release.
- Page structures overlap among `app/(seo-services)/[service]/page.tsx`, `app/(india-seo-services)/*/page.tsx`, `app/services/[slug]/page.tsx`, `app/services/*/page.tsx`, and dedicated commercial routes such as `app/buy-instagram-followers-india/page.tsx` and `app/youtube-watch-hours/page.tsx`.
- Shared UX modules include `ServiceOrderCard.tsx`, `ServiceOrderStickyCta.tsx`, `ServiceLandingOrderBuilder.tsx`, `ServiceDetailSmartPricing.tsx`, `PremiumCatalogServiceLanding.tsx`, `SeoServiceLandingPage.tsx`, `IndiaServiceLandingPage.tsx` and `ServicesCatalog.tsx`.
- Protected live-fact services need their own guarded availability states, and specialty orders (custom comments, endorsements, polls) must retain bespoke inputs and validation.

### Service coverage matrix

| Platform | Catalog service codes | Required journey |
| --- | --- | --- |
| Instagram | instagram-followers, instagram-likes, instagram-views, instagram-comments, instagram-saves, instagram-shares | Profile versus post/Reel link, active quantity/price, clear private-account instructions |
| YouTube | youtube-subscribers, youtube-likes, youtube-views, youtube-comments, youtube-watch-hours | Channel versus individual video link, correct policy/estimate, active service |
| Facebook | facebook-followers, facebook-likes, facebook-views, facebook-shares, facebook-group-members | Page/post/video/group URL discrimination, group accessibility |
| LinkedIn | linkedin-followers, linkedin-likes, linkedin-usa-connections, linkedin-usa-post-likes, linkedin-usa-endorsements, linkedin-usa-followers, linkedin-usa-group-members, linkedin-usa-custom-comments, linkedin-usa-reposts | Profile versus company/post/group URL, USA variant terms, skill and user-provided comments fields |
| Telegram | telegram-members, telegram-post-views, telegram-post-reactions, telegram-poll-votes | Channel/group/message/poll URL, live availability, poll-specific options |
| TikTok | tiktok-followers, tiktok-likes, tiktok-views, tiktok-custom-comments, tiktok-story-views, tiktok-saves | Profile/video/story URL, live availability, comment-specific fields |
| X/Twitter | x-followers, twitter-likes, twitter-views, twitter-retweets, twitter-crypto-followers, twitter-crypto-likes, twitter-crypto-retweets, twitter-crypto-custom-comments | Profile versus post URL, crypto option distinctions, comments input, live availability |

## Prioritized findings

### P0 — Protected live facts may fall back to unverified displayed rates and CTAs

**Confirmed code issue, not a claim about every live page.** `PremiumCatalogServiceLanding.tsx` formerly assigned `catalog` when `getLiveServiceFacts(...)` did not return an available service. Its fallback service-snapshot panel could show this catalog rate/minimum/refill data, and separate Start Order / Continue to Order links still invited an order. This is not the right customer experience for unknown, unavailable, or invalid live service facts.

**Phase 1 corrective change on this branch:** the shared template now requires verified positive live rate and valid quantity bounds before showing an active order builder/price snapshot/primary order CTA; otherwise it presents an explicit unavailable message and a link to the services directory. Checkout retains independent final validation and pricing. This change must receive production-build and browser checks before merging. Other templates have **not** been assumed safe without further per-route tests.

### P1 — Mixed landing page experiences dilute the brand and conversion path

The repository has multiple public layouts: dark premium catalog views, light “3D” landing pages, dedicated money pages and generic /services detail pages. These are not automatically bugs, but visitors may see inconsistent hero/order positions, service explanations, CTA labels and secondary actions.

**Plan:** introduce one shared **service landing shell** and common design tokens that support dark/orange SocialRUSH branding, lightweight platform accents, a concise desktop two-column hero, and a compact mobile hero with immediately discoverable purchase controls. Preserve unique page text, SEO intent, JSON-LD, correct service controls and canonical URLs.

### P1 — Too many competing pathways in the most important moment

Current pages can display links for Packages, direct Dashboard Order, WhatsApp, related service pages and more in addition to an inline builder. Additional options may be helpful after a customer commits, but they compete with the primary action at the top.

**Plan:** the service-specific, validated order-builder CTA is primary; packages and help are subordinate. If a page cannot safely show live pricing, show an accurate handoff to the existing guarded builder rather than a guessed amount.

### P1 — Mobile CTA must be tested against the global support affordance

`ServiceOrderStickyCta.tsx` currently positions a mobile bar bottom-left with right clearance and hides when the target is visible. This is a sensible mechanism but requires proof that it never covers the last input, price, confirmation CTA, device safe area, accessibility zoom or floating WhatsApp action.

**Plan:** inspect at 320, 360, 375, 390, 412, 430, 768, 1024 and 1440 px, both keyboard-open where possible and scrolling. Sticky action should focus or scroll to the **same valid order builder**, never create a parallel payment flow.

### P1 — Order interactions must share a single price/quantity contract

`ServiceOrderCard` already supports preset/custom quantities, live calculated totals, input errors and an existing dashboard checkout handoff. `buildQuantityMerchandising` selects valid preset amounts rather than hard-coded one-size-fits-all packages. Do not replace these with static pricing or cosmetic cards that skip correct limits.

**Plan:** preserve current validation, carry selected service/quantity/link to New Order, show actual INR checkout amounts, display currency conversion as an estimate, and support a disabled state when live service facts cannot be verified. Never assert fabricated discounts, fake urgency, follower authenticity, country targeting, “non-drop” or guarantee claims.

### P2 — SEO copy density and duplicate information

Some templates carry long use-case, feature, FAQ and authority sections, and the premium catalog template repeats a snapshot below the hero after rendering an order card. Longer content is not inherently a ranking issue, but it can distract buyers and increase page complexity.

**Plan:** keep important crawlable unique text, structured data, FAQ clarity and internal links while moving detailed descriptions below the order experience. Eliminate duplicated visible sections only after verifying there is no structured-data/semantic loss. No bulk canonical/slug or indexability changes.

### P2 — Funnel attribution needs validation

The existing `lib/analytics/events.ts` supports service/quantity/order/checkout events and trusted server-side outcomes. The common `ServiceOrderCard` emits `package_viewed`, `package_selected`, and `new_order_clicked`.

**Plan:** validate a privacy-safe report across landing path, platform, service code, source, device, order start, checkout start and verified `order_created`; do not log the submitted profile/video URL as analytics PII. Establish baselines before deciding that a redesign improved conversion.

## Rollout by revenue/organic-search importance

1. **Flagship:** `/youtube-subscribers` and `/buy-instagram-followers-india` — preserve their existing SEO footprints, prioritize discoverable forms and trustworthy terms.
2. **Next:** `/instagram-likes` and `/linkedin-followers`.
3. **Shared directory:** `/services` — simplify service finding and align directory cards with canonical paths.
4. **Remainder:** YouTube Views/Watch Hours/Comments, Facebook, TikTok, Telegram, X and all LinkedIn variants via **reusable templates**. Specialty live-only services must be tested separately.
5. **Country variants:** validate shared components without accidentally rewriting country canonical ownership.

These priorities use previously supplied historical GSC context; **fresh GSC metrics could not be fetched** because the connected reporting provider required a subscription. No current traffic/conversion lift is claimed.

## Phase 2 design specification

**Desktop above fold:** platform/product eyebrow; strong specific H1; one- or two-sentence service proposition; concise accuracy/trust line; right-side order builder with verified rate, valid preset/custom quantity, required link, live total, delivery/refill info and primary “Continue to Secure Order”.

**Mobile above fold:** small header; one specific headline; actual confirmed price/availability; one visible order-entry CTA; order builder directly below hero. Sticky order bar should avoid overlap and disappear when the form is in view. On guarded live-only services, show an availability handoff or disabled state rather than a fabricated checkout estimate.

**Below fold:** genuine operational information, requirements, help, concise unique FAQ, related services, deeper SEO content. No large animations, heavy media or new libraries without demonstrated value.

Keep keyboard/focus states, screen-reader errors, color contrast and tap targets. Retain user currency selection and exact INR final checkout. Preserve existing order history/guest sign-in/resume handling.

## Required acceptance tests (before PR merge)

- Each of the **43** catalog service detail links resolves to intended page/redirect with correct title, canonical/robots, no loop, correct preselected service and accessible CTA.
- For services with live facts: **available valid**, **unavailable**, **missing**, **invalid-zero-price**, **invalid quantity bounds**. Never advertise an unverified price as live; never show active inline ordering on unavailable protected service.
- For custom comments/endorsements/polls: full required-input fidelity; do not force into unsuitable generic builder.
- Single-item and bulk quantity inputs; min/max/step and invalid URLs, field focus and screen-reader feedback; no stale or fake price.
- Guest and signed-in service selection: quantity + link persists to the **existing** dashboard review; no unexpected wallet/order/payment writes.
- Responsiveness: 320/360/375/390/412/430/768/1024/1440 px, no horizontal scroll or CTA/WhatsApp collision, usable controls at 200% zoom.
- TypeScript, lint on changed code, production build, unit tests, canonical + structured data checks, browser smoke flows, and existing payment/wallet regression tests against fixtures.
- Performance: evaluate Web Vitals, particularly LCP and INP, across sample pages against same baseline with no new third-party JS, major image downloads or above-fold animation cost. Targets are **LCP p75 <2.5s, INP p75 <200ms, CLS p75 <0.1** where real-user field data permits; do not falsely claim these are already met.
- No real transaction, wallet funding, production test order or unrequested deployment.

## Handoff / known limitations

This is a **source-code architectural and conversion review** with a bounded first bug fix, not an exhaustive real-browser, paid-transaction or GSC audit. Visual quality requires actual screenshots and interaction validation before rollout; current historical search snapshots are stale. No production deployment, PR merge or business KPI uplift is claimed. Continue on this branch for the shared landing UX changes rather than creating one branch/preview per service.
