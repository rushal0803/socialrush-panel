# Services v2 redesign QA

Date: 2026-10-08 (Asia/Calcutta)

Branch: `feat/services-v2-premium-clean-redesign`

Base: latest `origin/main` at `9037a430` when work began.

## Result

The service directory uses a compact hero, one set of global trust cues, a scrollable platform selector with catalogue counts, non-sticky search/category controls, and a responsive service grid. Cards prioritize names, rates, real minimum totals, delivery and refill terms, with one primary order action and expandable requirements. Unsupported categories no longer produce duplicate “All” filters.

Comparison opens from the filter row in a native modal dialog with keyboard focus containment, Escape dismissal, focus restoration and a maximum of three selected services. The persistent floating comparison control and catalogue motion wrapper have been removed. Existing SEO sections now render before the footer. Shared legacy theme overrides are neutralized only inside this directory.

The server catalogue resolver, service codes, canonical service links, order query parameters, currency presentation, metadata and structured data remain in use. Payment, wallet, authentication, order submission, Supabase and migration code are unchanged.

## Responsive and interaction verification

| Coverage | Checks |
| --- | --- |
| 320, 360, 375, 390, 412, 430, 600, 768, 1024, 1280, 1440px | Hero, first card, card grid, scrolled state, comparison selection, footer screenshots; no page/dialog overflow; compact card height; readable primary CTA contrast including hover |
| All seven supported platforms | Exact platform/service/minimum quantity retained by order CTA; logged-out login return URL and isolated signed-in dashboard handoff |
| Search and filters | Unique All button, real service matches, empty state, reset, explicit `type=all` URL |
| Saved activity | Catalogue-filtered recently viewed shelf and quantity-preserving continue-order link |
| Health | Missing health data produces no invented Available/Stable label |
| Accessibility | Named search field, pressed states, visible focus, 44px controls, native comparison dialog and requirements disclosure |
| Existing service regressions | Reference pricing, quantity/link validation, login handoff, crawlable SEO and configured service-page responsive matrix |

The 600px grid remains one column to prevent narrow cards. Two columns start at 768px; three start at 1024px. Search and comparison remain in one compact row on small screens.

## Validation

- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with existing warnings outside this change.
- ESLint on all changed TypeScript files: passed.
- `npm run build`: passed; `/services` route bundle 11.8 kB, first-load JS 355 kB including shared public-site code.
- `git diff --check`: passed.
- 34 targeted unit tests for service CRO, order previews, related services, personalization and Services SEO: passed.
- 106 browser checks passed across runs and targeted reruns: 80 existing service regressions and 26 new directory checks. All 11 directory widths and all 14 platform/authentication combinations passed. The final saved-activity/search regression passed against the final production build.

The initial broad browser run passed 101 of 106 tests. Three existing matrix cases hit browser setup/transport failures during concurrent execution and passed on a single-worker rerun. QA also found and corrected narrow 600px cards and a search field whose accessible name changed when its clear button appeared.

Standalone whole-repository `npx eslint . --quiet` reports 10 pre-existing errors in generated `next-env.d.ts`, `tests/unit/related-services.test.ts`, and `tests/unit/sales-pipeline.test.ts`. These files were not changed to address unrelated lint debt.

## Screenshots

Representative screenshots are committed under `docs/services-v2/`:

- [390px hero](services-v2/390-hero.png)
- [390px cards](services-v2/390-cards.png)
- [390px comparison](services-v2/390-compare.png)
- [1440px cards](services-v2/1440-cards.png)

The full width/state matrix and build/unit logs are generated locally under `artifacts/services-v2/` by `tests/smoke/services-v2.spec.ts`.

## Files

- `app/services/page.tsx`: retain server catalogue and SEO; place supporting sections inside the page shell.
- `components/marketing/services/ServicesPageContent.tsx`: wire directory components, real categories, filters and comparison.
- `components/marketing/services/ServicesCatalog.tsx`: hero, selector, search, category controls and service cards.
- `components/marketing/services/ServicesCatalog.module.css`: scoped mobile-first directory design.
- `components/marketing/services/ServiceCompareStudio.tsx`: inline trigger and accessible comparison dialog.
- `components/marketing/services/ServiceCompare.module.css`: responsive comparison layout.
- `components/marketing/cro/PersonalizationShelf.tsx`: compact opt-in shelf and storage failure handling.
- `tests/smoke/services-v2.spec.ts`: directory responsive, ordering, comparison and personalization regressions.
- `tests/unit/seo-q4-phase5.test.ts`: update hero assertion for the extracted component while retaining SMM metadata checks.
- This report and four representative screenshots.

## Limits

Browser QA uses the repository's isolated smoke-test catalogue/backend and test authentication. Fixture rows can omit delivery/instruction fields, in which case the existing server resolver's fallback text appears in screenshots. Production data resolution was preserved; this is not an audit of every production database row. No real paid order or live customer-account payment was submitted. Shared header/footer styling remains owned by the existing public-site components.

The Browser runtime reported no available browser; responsive QA used the repository's standalone Playwright runner.
