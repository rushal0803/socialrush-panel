# SocialRUSH performance measurements

Work starts at `0a30ae3778d932bbbb36f93e182a57b2bd31b251` (merged PR #622),
on `perf/socialrush-ultra-fast-pages`. Existing route and QA inventories are
reused: [route inventory](../premium-responsive-route-inventory.json),
[responsive QA](../premium-responsive-ui-optimization.md) and
[PR #622 follow-up](../pr622-smoke-followup.md).

## Repeatable lab procedure

```powershell
npm run build
$env:PERF_OUTPUT='artifacts/performance/before.json'
npm run perf:benchmark
# Apply changes, stop the baseline server, then build again.
npm run build
$env:PERF_OUTPUT='artifacts/performance/after.json'
npm run perf:benchmark
npm run perf:compare -- artifacts/performance/before.json artifacts/performance/after.json artifacts/performance/comparison.json
```

Keep Node, Chromium, hardware, operating system, environment variables, backend
fixtures, observation window, viewport, CPU throttling, and network throttling
identical. Run serially on an otherwise idle machine. Default: five samples per
route/profile/cache condition. Reports include medians, nearest-rank p75, raw
samples, top resources, public API timings, and observed main-thread long tasks.
The comparator rejects mismatched environments or coverage and flags significant
relative JS-transfer growth; timing changes remain diagnostics rather than
absolute CI assertions. Existing smoke CI collects the new rendering tests.

Supplemental diagnostics run separately after the benchmark:

```powershell
node scripts/performance-warm-navigation.cjs
node scripts/performance-trace.cjs
npm install --prefix artifacts/performance/lighthouse-runner --no-save --package-lock=false lighthouse@13.0.1
node scripts/performance-lighthouse.cjs
node scripts/performance-report.cjs artifacts/performance/before.json artifacts/performance/after.json
```

The destination-warm script measures services, packages and login Link clicks
plus browser back navigation. The Chrome trace is an after-only services load,
saved in ignored artifacts for import into DevTools. The pinned Lighthouse
tool also saves its trace and DevTools log; its default mobile simulation is
different from the CDP benchmark. Do not mix Lighthouse scores/timings into the
paired comparison. Its local proxy strips only `upgrade-insecure-requests`,
matching the existing smoke transport, and does not change production headers.
Flags follow the [official Lighthouse CLI source](https://github.com/GoogleChrome/lighthouse/blob/v13.0.1/cli/cli-flags.js).

Desktop: 1440x900, unthrottled. Mobile: 390x844, 1.6 Mbps download,
750 Kbps upload, 150 ms latency, 4x CPU slowdown. Cold means empty browser
HTTP cache; it does **not** mean a cold Vercel function/database. Warm public
samples reload with the same browser cache. Private backend interception disables
Chromium HTTP caching: those repeat visits must not be described as fully warm
browser-cache measurements. Both sides use the same limitation.

The measured homepage-to-services transition starts from a warm homepage, but
the services destination has not been visited. It includes a real Link click,
URL update, and a rendered heading whose ancestors have full opacity; a skeleton
does not satisfy it. Record destination-warm journeys separately.

The local server uses the existing isolated test transport and synthetic
accounts. It never invokes real payment/order RPCs. Private data is never cached
across customers. Public price reads remain fresh per request. Service workers
are blocked, analytics uses the existing DNT preference, and only the local lab
bypasses CSP. Production CSP and service-worker behavior are unchanged.

LCP/CLS are lab observations taken three seconds after document load, without
scrolling. They are not field p75 or INP. Main-thread long tasks include activity
other than hydration; do not label their duration as hydration cost. Resource
Timing's image-initiator filter does not capture every preloaded image, so its
zero values are not proof of zero image transfer or image savings. No image/font
assets or visual-quality settings changed. The application uses system fonts.

## Production observations

Read-only Vercel inspection confirms production runs at the baseline commit in
`syd1`. The active Supabase project is in `ap-southeast-2`; the Mumbai preview
database is inactive. Retain Sydney colocation rather than moving functions
away from the active database. No migrations, indexes, RLS, or financial RPCs
are changed.

A read-only `EXPLAIN (ANALYZE, BUFFERS)` on the proposed services query returned
30 eligible rows in **0.229 ms execution time**, with no disk reads. A sequential
scan of this small table is not evidence of a missing index. The previous
directory made 31 parallel HTTP queries; the new directory makes one. Tests
compare individual and batched results, including duplicates, wrong platforms,
missing/paused/closed rows, defaults, query failure and fresh price updates.

Existing first-party analytics, aggregated without account/session data over
the rolling 24 hours inspected on 2026-10-10:

| Device | Metric | Samples | p75 |
| --- | --- | ---: | ---: |
| Mobile | LCP | 172 | 3181 ms |
| Mobile | INP | 101 | 184 ms |
| Mobile | CLS | 144 | 0.010625 |
| Mobile | TTFB | 197 | 1897 ms |
| Mobile | FCP | 192 | 3125 ms |
| Desktop | LCP | 84 | 2953 ms |
| Desktop | INP | 83 | 260 ms |
| Desktop | CLS | 74 | 0.007675 |
| Desktop | TTFB | 123 | 1309.5 ms |
| Desktop | FCP | 111 | 2383 ms |

These are consent/DNT-dependent first-party samples across routes and versions,
not a CrUX dataset or a controlled comparison for this release. Deployment IDs
are not recorded in these events. No after-release field measurements can be
claimed before approved production deployment. Separate India/international
probe locations are not available in this runner. Requesting a region hint is
not an equivalent geographical measurement.

Recent Vercel error aggregation is restricted by Hobby's one-hour retention;
the successful 30-minute query returned two `/api/cron/crm-outreach` error logs.
These are existing background jobs outside this change.

## Implementation

Root-layout inspection found PWA and WhatsApp UI already use dynamic imports.
Analytics/Web Vitals remain enabled with the existing consent/DNT behavior;
they were not removed to improve lab scores. System fonts have no remote font
download. Supabase admin fetch uses `no-store`, and live-catalog responses also
use `no-store`; the batch keeps these freshness rules.

The dashboard already runs independent reads with `Promise.allSettled`, limits
visible recent orders to five and transactions to four, and scopes reads to the
authenticated user. It still runs numerous counts/supporting queries. Wallet
loads its two independent lists in parallel with 100-row limits. These are
remaining investigation targets with real authenticated request traces; the
synthetic lab does not establish live latency savings. Reducing those lists or
combining financial queries would need evidence that display semantics remain
correct. This change preserves them. The full sidebar motion API is retained
because it uses layout animation.

- Load the full editorial revenue-bridge/catalog bundle only on blog articles;
  preserve its SSR links. Remove a pathname key forcing the shell to remount.
- Share `LazyMotion`/`domAnimation` and use `m` for public animations. Keep the
  full Motion API in the dashboard sidebar, which uses layout animation.
- Verify the active packages hero is readable before hydration. The active
  packages component already renders its heading at full opacity; leave it intact.
- Batch directory-only live catalog reads with equivalent public facts and
  fallback rules. Keep individual service lookup behavior and existing live
  checkout validation.
- Disable viewport prefetch on secondary directory detail links. Preserve
  primary navigation prefetch. This saves transfer before a service selection;
  the selected detail destination may require a fresh request on its first click.

The first final-build benchmark was interrupted by Chromium's
`net::ERR_NETWORK_CHANGED` during the wallet route. It produced no complete
comparison dataset. The full run was restarted; checkpoint files are marked
incomplete and cannot be used by the comparison command.

## Verification and delivery

Application files changed:

| Purpose | Files |
| --- | --- |
| Fresh directory batch and equivalent facts | `app/services/page.tsx`, `lib/seo/live-service.ts`, `lib/seo/live-service-row.ts` |
| Shared animation features | `components/providers/ClientProviders.tsx`, `components/ui/Motion.tsx`, `components/marketing/InteractiveHomepageShell.tsx` |
| Public animation consumers | `components/marketing/MarketingHeader.tsx`, `components/marketing/LegalPageLayout.tsx`, `components/marketing/contact/ContactPageContent.tsx` |
| Conditional editorial chunk and stable shell | `components/marketing/blog/BlogShell.tsx` |
| Bounded secondary prefetch | `components/marketing/services/ServicesCatalog.tsx` |

The active packages component, root layout, dashboard data logic, financial APIs,
SEO metadata and deployment region configuration have no application changes.

Results and remaining limits are in [report.md](report.md). Build/lint keep
pre-existing warnings. The original `test:unit` command fails on three unchanged
main-branch sources: lifecycle activation-boundary regex, an extensionless
`gscRankingLinks` import in the pricing test, and Node's missing `@/lib` resolver
in the SEO architecture test. These failures are documented separately from
new catalog-equivalence tests. No unrelated test/application rewrite is bundled
into the performance work.

Do not merge or promote production automatically. Preview and PR review are
the delivery target.
