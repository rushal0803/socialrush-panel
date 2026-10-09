# Premium responsive UI optimization

## Scope and baseline

Started from fetched `origin/main` on `feat/premium-responsive-ui-optimization`.
The previous clean checkout used a branch with literal backticks in its name;
that branch was preserved. Main was eight commits newer. Installed versions are
Next.js 15.5.26 / React 19.2.8. Existing premium page designs were retained.

Open pull requests were inspected before implementation. Payment PRs #551/#552,
packages PR #539 and SEO PRs #559/#545 overlap with the brief. No functionality
from those branches was copied, reverted, or merged.

## Audit findings

| Component / routes | Viewport | Severity | Evidence / root cause | Correction |
| --- | --- | --- | --- | --- |
| MobileMenuLayer: public and dashboard navigation | 390px / short 320px | High | Query included the tabindex=-1 backdrop and omitted inputs. WebKit repeated-Tab testing also reproduced focus escaping from search because native Tab skipped links. | Filter visible, enabled tab stops; include form controls; explicitly traverse all dialog tab stops in both directions and both menu variants. |
| MobileMenuLayer: public and dashboard navigation | Resize across 1280px / 1024px | High | CSS hid the dialog while open state still owned body position:fixed and scroll locking. | Close on the matching desktop media-query transition and release the existing lock. |
| Public shell and global root styles | All widths | Medium | Sitewide clipping could conceal overflow. Representative baseline layouts passed when root clipping was disabled. | Remove blanket body/html/public-shell clipping; keep clipping local to decorative effects and scrollable components. |
| Homepage mobile hero and supporting actions | 320–480px | Medium | Heading used 2.35–3rem with .98 leading; supporting links had 34px touch targets and 10px copy. | Bounded 2–2.75rem heading with 1.08 leading; 44px supporting actions and 12px copy. |
| Shared Field / Button / Surface / Container | Compact devices, long labels | Medium | Missing intrinsic min-width constraints; small buttons could be 36px tall. | Min-width:0, bounded button width and wrapping, compact-device 44px buttons, mobile-safe input typography. |
| Shared dashboard SectionTitle and PageHeader | Compact devices, long labels | Medium | Title/action always shared one horizontal row; intrinsic text sizing could crowd actions. | Stack section actions on phones; wrap long headings and descriptions. |
| PageHero: country/SEO/public templates | Phone through desktop | Medium | Separate stepped typography and spacing rules instead of shared bounded fluid values. | Shared page gutter, section spacing, and page-heading tokens. |
| ServiceOrderCard shared stylesheet | Compact screens, large totals / long names | Medium | Fixed 32px totals and no explicit wrapping on card title. | Fluid 24–32px totals and intrinsic text wrapping; price values unchanged. |
| Wallet QR / UPI modal | Compact / short mobile viewport | Medium | Mobile QR allowed 280px; modal height used vh rather than dynamic viewport height. | QR bounded to min(220px,40dvh); modal uses 94dvh, wrapping amount heading and 44px close control. |
| YouTubeSubscribersLanding final CTA group | 430px | High | Unmasked document reached 451px: three CTAs switched into a non-wrapping row at 420px. | Wrap actions and keep the compact stack until the small-tablet breakpoint. |
| FloatingWhatsAppButton public surfaces | 320px screenshot / phone and tablet | Medium | Fixed widget covered homepage supporting text. | Place the public support action in normal document flow below 1024px. |
| Public/dashboard mobile form inputs | Below 768px | Medium | Existing type-only font rules lose to text-sm utilities, including payment reference fields. | Scoped rem-based 16px input floor with sufficient specificity; exclude checkbox/radio controls. |
| DashboardHeaderBar / Sidebar: all customer routes | 1024px / short desktop heights | High | 1024px document measured 1049px across dashboard and payments; profile text consumed room needed when sidebar became visible. Long sidebar had no internal scroll. | Compact profile to initials until xl, bound identity text, and allow sidebar vertical scrolling. |
| QR plates: wallet and direct checkout | All widths | High | Broad dashboard theme overrides changed white QR containers to dark surfaces and made dark captions unreadable. | Explicit QR plate marker excludes only these neutral surfaces/descendants from generic theme remapping. |
| Orders / Order History and New Order | 1024px with sidebar | High | Order recommendation headings inherited oversized base typography; command bar required 460px plus actions even in a 744px workspace. New Order's 290px summary left platform cards only 68px wide. | Bound recommendation headings, use container width for command bar columns, defer New Order's summary split until xl. |
| InteractiveHomepageShell: shared public pages | Reduced motion, Firefox | High | Browser-only reduced-motion preference removed a decoration present in server markup, producing React hydration error #418. Development diagnostics identified the exact node mismatch. | Preserve decoration markup and hide it with a reduced-motion CSS variant; render the page content immediately with stable initial styles. |

Baseline browser checks: 20 public routes at 320/390/768/1440; 12 authenticated
routes at the same sizes; UPI/bank/USDT instructions at 320/390. No document
overflow was detected in these baseline samples. The original keyboard test
incorrectly assumed the close button was the first tab stop; the logo link
precedes it. Final interaction tests check the actual tab order.

## Implementation

Shared tokens keep the existing orange/gold palette, borders, focus styles,
radius system, and container maximum. No new dependencies, images, animation
libraries, fabricated claims, testimonial copy, or pricing sources were added
to the application. A non-payment QR PNG is included only as a test fixture.

Modified presentation components: root layout classes and global styles; MobileMenuLayer;
MarketingHeader; PublicShell; HomepageMobilePolish; PageHero; ServiceExperience;
dashboard Ui, DashboardHeaderBar, Sidebar, DirectUpiPaymentClient and
ProfessionalUpiCheckout; DesktopUpiQrCheckout;
YouTubeSubscribersLanding; FloatingWhatsAppButton; UI Button,
Field, Layout and Surface. Routes using these shared components inherit fixes.
OrderTrackingExperience styles, Order History presentation and New Order's
layout breakpoint are also adjusted; order handlers and state are unchanged.
InteractiveHomepageShell retains hover/reveal interactions while rendering
stable markup for reduced-motion hydration and immediately visible page content.

The test-only Supabase transport has an opt-in payment instruction fixture.
It mocks the existing HTTP transport, not application calculations. RPCs and
paid operations remain blocked. Bank/USDT instructions and method selectors are
inspected without opening UPI links or submitting transfer references.

QR layout tests serve a local PNG encoding only `responsive-qa`; it is not a
payable UPI QR. The generated application image URL is separately decoded to
check its unchanged UPI scheme and INR amount. The existing QR provider returned
HTTP 200 outside the sandbox; sandboxed network requests could not load it.
QR screenshots validate plate contrast, sizing and instructions using this
non-payment fixture, not a live transfer or gateway verification.

## Verification and evidence

`tests/smoke/premium-responsive.spec.ts` checks 33 public routes and 13 dashboard
routes individually at 320, 360, 375, 390, 412, 430, 480, 600, 768, 820, 1024,
1280, 1366, 1440 and 1920 CSS pixels. It also checks payment instruction tabs,
wallet QR disclosure, navigation focus cycling, Escape/return focus,
breakpoint resize, 820x390 landscape, and 640x480 reflow equivalent to a
1280x960 window at 200% zoom. A separate Chromium extension test also applies
actual browser zoom through `chrome.tabs.setZoom(2)` on home, services, packages
and login. All four measured 631 CSS pixels from an initial 1262-pixel content
width, with devicePixelRatio 2, and no horizontal document overflow. See
[native zoom screenshot](qa/premium-responsive/native-zoom-home-200.png) and
[measurement record](qa/premium-responsive/native-zoom-results.json).

All runs use the isolated backend. Customer dashboard coverage uses synthetic
session cookies with empty fixture history; it does not prove behavior with
every production customer record. Existing packages/service smoke tests cover
selection, quantity, link validation, price-change feedback and blocked order
handoffs. No real paid orders, wallet credits, or transfers are made.

Run Chromium matrix:

The comprehensive matrix is opt-in (`RESPONSIVE_AUDIT=1` or the isolated
payment-fixture flag below), so normal smoke runs keep their existing scope.

Build with `npm run build`, then start the isolated production server in a
separate terminal. On Windows use `localhost` consistently for both the
listening hostname and base URL so redirect authority and API Origin agree:

```powershell
$env:RESPONSIVE_PAYMENT_FIXTURE='1'
$env:SUPABASE_SERVICE_ROLE_KEY='smoke-service-role-key'
node --require ./scripts/packages-test-backend.cjs ./node_modules/next/dist/bin/next start --hostname localhost --port 3003
```

In the test terminal:

```powershell
$env:RESPONSIVE_PAYMENT_FIXTURE='1'
$env:PLAYWRIGHT_BASE_URL='http://localhost:3003'
npx playwright test premium-responsive.spec.ts --workers=1
node scripts/responsive-native-zoom.cjs
```

Run Firefox/WebKit matrix (engines must be installed):

```powershell
$env:RESPONSIVE_PAYMENT_FIXTURE='1'
$env:PLAYWRIGHT_BASE_URL='http://localhost:3003'
$env:RESPONSIVE_CROSS_BROWSER='1'
$env:PLAYWRIGHT_BROWSERS_PATH="$PWD/artifacts/browser-engines"
npx playwright test --config playwright.cross-browser.config.ts --grep 'at (320|390|768|1440)px|mobile navigation|dashboard drawer|short landscape' --workers=1
```

Local screenshots and JSON dimension records:
`artifacts/premium-responsive/before/` and `artifacts/premium-responsive/after/`.
Cross-engine evidence lives in `after/firefox/` and `after/webkit/`.
Very tall pages use viewport and footer captures when a full-page image exceeds
Windows WebKit's screenshot dimension limit; adjacent capture JSON records this.
Representative review screenshots are included beside this report under
`docs/qa/premium-responsive/` after verification.

Local lab LCP/CLS/resource-transfer samples are saved as `lab-metrics.json`.
They are unthrottled browser samples with reduced motion and fixture data;
Playwright routing disables HTTP caching. The Chromium sample recorded home
LCP 588ms / CLS 0 / 382804 transferred bytes, services 348ms / 0 / 41823 bytes,
and packages 192ms / 0 / 22421 bytes. These are local diagnostic observations,
not real-user p75 values, an INP measurement, or a claim that Core Web Vitals
targets have been achieved. Unsupported metrics are recorded as zero.
Existing Next image/font/deferred-rendering facilities are retained.

## Protected behavior

No changes to pricing data or calculations, discounts, quantity limits,
wallet calculations, payableNow, settlement/verification, gateway integrations,
order creation/idempotency, authentication, Supabase RPCs, migrations, APIs,
metadata, canonicals, structured data, SEO copy, sitemap, robots, or URL routes.
Changes in payment components are JSX classes and QR presentation markers only. Test transport changes are
opt-in and are never imported by the normal application runtime.

## Known baseline checks

`npm run test:unit`: 111 passed / 3 failed in unchanged code:
email lifecycle source-pattern assertion; pricing-authority extensionless
TypeScript import; seo-architecture Node @/ alias resolution. These are recorded
without changing unrelated email/SEO functionality. TypeScript, production
build, and lint passed; lint has existing warnings. Payment-confidence (5),
currency (2), and Phase12 (2) focused unit tests passed.

Additional responsive-shell, order-preview and checkout unit checks: 24 passed.

Review images:

| Surface | Before | After |
| --- | --- | --- |
| Mobile homepage, 320px | [Before](qa/premium-responsive/home-320-before.png) | [After](qa/premium-responsive/home-320-after.png) |
| Desktop homepage, 1440px | [Before](qa/premium-responsive/home-1440-before.png) | [After](qa/premium-responsive/home-1440-after.png) |
| Wallet header, 390px | [Before](qa/premium-responsive/wallet-390-before.png) | [After](qa/premium-responsive/wallet-390-after.png) |

[QR layout with non-payment fixture](qa/premium-responsive/wallet-qr-390-after.png).

## Completed coverage and limitations

- Chromium: 49 comprehensive cases passed on the production build: all 15
  widths for public, authenticated and payment layouts, plus interactions,
  landscape/reflow and lab measurements.
- Firefox: all 15 representative cases covered at 320/390/768/1440px. One
  authenticated case required an isolated rerun after a cancelled chunk load.
- WebKit: all 15 representative cases covered at the same widths. The 1440px
  public case passed with a longer budget and fewer redundant full-page
  captures after the original run timed out. A subsequent stronger keyboard
  test exposed the focus escape described above. After the correction and a new
  production build, all nine navigation cases passed across Chromium, Firefox
  and WebKit, including the previously failing repeated-Tab check. Chromium's
  separate legal redirect check also passed.
- Existing conversion/regression suites: 70 of 75 cases passed in the combined
  run; all five timeout cases passed in an isolated rerun. Coverage includes
  packages, services, homepage hydration, production safeguards and mobile
  accessibility. No application mutation was sent to production services.
- Native Chromium 200% zoom: four public routes passed. Dashboard 200% coverage
  uses equivalent 640x480 CSS reflow; native dashboard zoom was not tested.
- The route inventory contains 161 non-admin source route patterns. Shared
  templates and representative country/service URLs were tested; every dynamic
  slug, production customer record and physical device was not individually
  tested. Admin pages, live payment settlement, real transfers and real-user
  INP/Core Web Vitals remain outside this frontend verification.
- The final harness uses document load, fonts and visible hydrated headings
  rather than an unbounded network-idle wait. Later fresh-document phone reruns
  exposed that harness timeout. After correcting the wait, the final 320px
  public rerun passed all 33 routes in 31 seconds, with no runtime errors or
  document overflow; the original complete layout matrix also passed.

Final production build, TypeScript and lint passed (existing lint warnings).
The final focused unit rerun passed 16 checks; the broader focused run passed
24. An additional source comparison verifies that all six modified payment,
order and root-layout files match the baseline after removing literal JSX
classes and QR presentation markers.

Branch: `feat/premium-responsive-ui-optimization`. The final response and PR
contain the commit SHA, PR URL and preview status. No main merge or production
deployment is authorized by this work.
