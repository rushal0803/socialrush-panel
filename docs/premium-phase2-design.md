# SocialRUSH Phase 2 — Accessible public information and admin presentation

Branch: `feat/socialrush-premium-phase2-support-tools-legal-admin`  
Base: `main` at `10cfdbaf88c661797d7bd2df58bb88d5647118c2`  
Phase 1 PR #630 is **separate and not merged**.

## Brand and scope

The original site tokens remain authoritative: `#07080D` background, `#0C0E14` sections, `#101219` cards, `#FF7600` action, `#FF9A2E` highlight, `#F8FAFC` text. No new palette.

Changes are intentionally presentation-focused:

- Shared legal reading template: replaces the old white/pastel and continuously animated cards with server-renderable semantic article, sticky contents, accessible links and readable dark/orange sections. Preserves each caller's title, description, section body, bullets and TOC IDs. `PolicyPage` supplies SEO content; canonical privacy and Terms routes retain their independent templates.
- Admin: groups all existing sidebar destinations without changing destinations, active state or admin authorization. Removes unnecessary Framer Motion animated active marker. Removes unsupported `System online` assertion from the header.
- Tools: harmonizes only the creator tools **hub** preview palette, card surfaces and editorial sections. Existing calculator implementations and equations are unchanged.
- Support: converts six repetitive cards to faster-scanning paired service links. Keeps routes and `SupportJourney`.
- Customer reviews: adds a genuine no-published-review state and improves permitted-review readability; continues using `getPublicReviews` and no fabricated testimonials.

## Invariants

Do not change: payments, checkout, wallet, order processing, Supabase policies or migrations, service prices, authentication, SEO metadata, canonical routes, schema, article/legal copy or internal-link destinations.

The target is a standalone Phase 2 **draft PR against main**, not a stacked dependency that forces the unfinished Phase 1 live. Phase 1 and Phase 2 need a visual integration check before any merge because both touch marketing presentation.

## Validation / outstanding

- `tests/unit/premium-phase2-layout.test.ts` verifies static policy text, original support destinations, moderation-based reviews, creator tool routing and admin nav links.
- `tests/smoke/premium-phase2.spec.ts` covers /support, /reviews, /tools and /terms-and-conditions at 320, 390 and 1440 px, SEO headings, overflow, navigation and tool search.
- CI required: TypeScript, production build, unit + SEO + payment regressions, browser smoke.
- New desktop/mobile screenshots and before/after speed evidence must be captured and reviewed before approval. Authenticated admin visuals require safe test fixtures; do **not** use customer sessions or live transactions.
- No release or production deployment is authorized.

## Follow-up: live legal routes and browser regression correction

- In addition to the shared policy layout, the live `/terms-and-conditions`, `/privacy-policy` and `/refund-policy` templates now receive **palette-only** changes to align with the original dark/orange brand. All legal clauses, section IDs, metadata, navigation destinations and refund business rules are untouched.
- A Phase 2 browser test initially selected the hidden desktop-navigation `/services` link rather than a visible Support topic card. It now checks the visible link, maintaining the functional assertion.
- Existing layout test `phase22-responsive-shell` was updated to validate the intentionally larger admin email font without losing truncation.
- Final screenshot and full smoke evidence must be produced for the last commit; earlier failing CI runs do not establish a release pass. Keep the PR draft pending visual review and comparable performance checks.
