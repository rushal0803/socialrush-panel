# SocialRUSH performance results

Baseline: main at `0a30ae3778d932bbbb36f93e182a57b2bd31b251` (PR #622).
The following comparisons use five samples per route/profile/cache condition on the same Windows runner, Node and Chromium versions. Full conditions and limitations are in [README.md](README.md). Timings are milliseconds; JS sizes are decimal KB. Arrows show baseline → optimized build.

## desktop: cold browser cache

| Page | TTFB median | FCP median | LCP median | LCP p75 | CLS p75 | JS KB median | Requests median |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage | 328 → 328 | 628 → 640 | 628 → 640 | 668 → 880 | 0.0000 → 0.0000 | 340 → 328 | 39 → 41 |
| Services | 364 → 364 | 624 → 592 | 624 → 592 | 664 → 608 | 0.0023 → 0.0023 | 525 → 291 | 56 → 40 |
| Packages | 352 → 365 | 524 → 520 | 524 → 520 | 532 → 544 | 0.0000 → 0.0000 | 300 → 288 | 35 → 37 |
| Dashboard | 348 → 352 | 588 → 588 | 588 → 604 | 628 → 612 | 0.0000 → 0.0000 | 320 → 324 | 50 → 54 |
| Wallet | 347 → 347 | 528 → 536 | 900 → 912 | 904 → 912 | 0.0103 → 0.0103 | 321 → 322 | 46 → 49 |
| Checkout (order review) | 336 → 350 | 524 → 544 | 768 → 764 | 788 → 780 | 0.0000 → 0.0000 | 327 → 330 | 49 → 53 |

## desktop: repeat document visits

Public routes use warm browser HTTP cache. Private routes retain the same test-transport limitation on both sides and retransfer JavaScript; do not treat them as fully warm-cache samples.

| Page | TTFB median | LCP median | LCP p75 |
| --- | ---: | ---: | ---: |
| Homepage | 8 → 8 | 192 → 212 | 200 → 216 |
| Services | 61 → 56 | 240 → 224 | 252 → 264 |
| Packages | 45 → 37 | 160 → 168 | 164 → 184 |
| Dashboard | 43 → 38 | 348 → 380 | 384 → 384 |
| Wallet | 33 → 34 | 592 → 576 | 600 → 624 |
| Checkout (order review) | 33 → 29 | 256 → 460 | 484 → 496 |

## mobile-4g: cold browser cache

| Page | TTFB median | FCP median | LCP median | LCP p75 | CLS p75 | JS KB median | Requests median |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage | 317 → 319 | 2800 → 2680 | 2800 → 2680 | 2808 → 2744 | 0.0000 → 0.0000 | 295 → 283 | 31 → 33 |
| Services | 362 → 346 | 2520 → 2384 | 2520 → 2384 | 2612 → 2444 | 0.0018 → 0.0018 | 407 → 291 | 38 → 36 |
| Packages | 336 → 343 | 1888 → 2004 | 1888 → 2004 | 2096 → 2116 | 0.0000 → 0.0000 | 300 → 288 | 33 → 35 |
| Dashboard | 345 → 340 | 1624 → 1544 | 2456 → 2316 | 2576 → 2328 | 0.0000 → 0.0000 | 320 → 324 | 42 → 46 |
| Wallet | 334 → 339 | 1524 → 1504 | 2464 → 2400 | 2500 → 2404 | 0.0000 → 0.0000 | 321 → 322 | 38 → 41 |
| Checkout (order review) | 337 → 324 | 2216 → 1704 | 2888 → 2240 | 2936 → 2268 | 0.0000 → 0.0000 | 327 → 330 | 41 → 45 |

## mobile-4g: repeat document visits

Public routes use warm browser HTTP cache. Private routes retain the same test-transport limitation on both sides and retransfer JavaScript; do not treat them as fully warm-cache samples.

| Page | TTFB median | LCP median | LCP p75 |
| --- | ---: | ---: | ---: |
| Homepage | 7 → 5 | 592 → 616 | 824 → 616 |
| Services | 65 → 30 | 540 → 536 | 616 → 552 |
| Packages | 31 → 29 | 496 → 504 | 508 → 536 |
| Dashboard | 36 → 32 | 2388 → 2332 | 2412 → 2364 |
| Wallet | 29 → 39 | 2352 → 2300 | 2456 → 2460 |
| Checkout (order review) | 24 → 20 | 2332 → 2156 | 2376 → 2164 |

## Internal navigation

A real App Router homepage → services click, starting from a warm homepage and an unvisited services destination. Waits for the rendered heading, not a loading skeleton.

| Profile | Median | p75 |
| --- | ---: | ---: |
| desktop | 725 → 693 | 734 → 857 |
| mobile-4g | 4246 → 3761 | 4412 → 3839 |

Destination-warm after-only journeys are recorded separately in `warm-navigation.json`; they do not establish a before/after improvement.

## Observed main-thread work

Total duration of long tasks in the fixed observation window, including work other than hydration. This is not an isolated hydration-cost measurement.

| Profile | Page | Median long-task ms before → after |
| --- | --- | ---: |
| desktop | Homepage | 173 → 143 |
| desktop | Services | 150 → 144 |
| desktop | Packages | 85 → 82 |
| desktop | Dashboard | 148 → 156 |
| desktop | Wallet | 126 → 123 |
| desktop | Checkout | 129 → 135 |
| mobile-4g | Homepage | 1174 → 1048 |
| mobile-4g | Services | 789 → 839 |
| mobile-4g | Packages | 887 → 868 |
| mobile-4g | Dashboard | 929 → 852 |
| mobile-4g | Wallet | 913 → 1012 |
| mobile-4g | Checkout | 898 → 801 |

## Network and database evidence

Five read-only production HTTP probes before delivery (same client, separate TLS connections; not a geographic or preview comparison):

| Endpoint | TTFB median | TTFB p75 |
| --- | ---: | ---: |
| Homepage | 487 ms | 590 ms |
| Services | 776 ms | 780 ms |
| Public service health | 164 ms | 333 ms |

An initial separate probe saw homepage TTFB 5610 ms and services TTFB 2900 ms; these are retained as variability evidence, not mixed into the five-sample set.

The directory makes one fresh live-catalog query instead of 31. Read-only production EXPLAIN measured the combined query at 0.229 ms. This demonstrates a small query execution cost, not an end-to-end database latency improvement. Local API timings are synthetic and must not be represented as live financial/API timings.

The previous service-directory editorial chunk was 96,705 transferred bytes and took about 2.71 seconds in the first throttled mobile sample. It rendered nothing on that route. Directory detail-link prefetch also transferred service landing payloads and JavaScript before a selection; the final change disables that secondary viewport prefetch.

Images, font assets and image quality are unchanged. No image-size improvement is claimed. Current image-initiator totals omit preloaded images. System fonts avoid an external font dependency.

## Validation and remaining work

See the delivery/validation record below for final checks and preview/PR links. Public pages still include a large shared stylesheet (~63 KB transferred in the baseline). A full public-layout/CSS split would need a separate scoped visual regression effort. Private pages retain live data fetching and the full sidebar layout-animation API. No field after-release p75, isolated hydration benchmark, multi-region browser probe, or real payment submission is claimed.

## Interpretation and delivery

The final build is application commit `c0fc3969b0c18bf9ffd4b3d535908bc02188af7f`.
Raw [baseline](before.json), [final](after.json), [comparison](comparison.json)
and [intermediate](intermediate.json) samples are retained. The intermediate
experiment had several paint/navigation regressions; it is not substituted for
the final comparison or omitted to hide those regressions.

The strongest verified result is less transferred directory JavaScript:
desktop **524,667 → 291,024 bytes (−44.5%)**, mobile
**406,729 → 291,024 bytes (−28.4%)**. Desktop directory requests fell
**56 → 40**. Mobile directory cold LCP p75 was **2612 → 2444 ms**.
Homepage and packages transfer fell by about 11.4 KB each. Private dashboard
and checkout transfer increased by 3.9 KB (~1.2%) and wallet by 1.3 KB (~0.4%)
from sharing animation features; those pages retain the full sidebar API.
Request counts on those private pages also increased by three or four.

Timing improvements are not uniform. Mobile packages cold median LCP increased
**1888 → 2004 ms** (+6.1%). Desktop homepage LCP p75 increased
**668 → 880 ms**, and homepage-to-services navigation p75 increased
**734 → 857 ms**, despite a lower median. Repeat desktop checkout LCP median
increased **256 → 460 ms**; the baseline samples varied substantially. Five
samples describe this runner, not statistical proof of a global speedup.

The warm-homepage/unvisited-services mobile transition improved
**4246 → 3761 ms median** but misses the one-second goal. The shared stylesheet,
fresh server response and remaining JavaScript still occupy
the critical path on throttled first visits. Public repeat-load LCP is much
lower, but that is separate from a client transition. Destination-warm results
are after-only and must not be represented as before/after improvement.

The observed final mobile cold LCP p75 misses 2.5 seconds on the homepage
(2744 ms). Packages/directory and the synthetic private routes fall below that
lab threshold in this run. This does not establish real-user target compliance.
The existing field sample remains mobile LCP 3181 ms and TTFB 1897 ms at p75;
desktop INP 260 ms also misses the 200 ms target. Mobile field INP 184 ms and
CLS 0.010625 meet their targets in the inspected aggregate. No after-release
field comparison is available. Region relocation is not justified by this
single runner; application and database remain colocated in Sydney.

No image/font size improvement or real API/financial latency improvement is
claimed. The catalog improvement is **31 fresh queries → one**, with a 0.229 ms
read-only database execution observation. End-to-end network savings require
an authenticated/live before-after trace after a reviewed release.

[Draft PR #623](https://github.com/rushal0803/socialrush-panel/pull/623).
[Protected branch preview](https://socialrush-panel-git-perf-c95a96-rushalthakur240-6255s-projects.vercel.app).
Production was not deployed or merged. The application preview at the above
commit reached READY in `syd1`. Authenticated read-only HTTP checks returned
public headings for home, services, packages, login and registration; article
revenue links were present in SSR HTML; unauthenticated dashboard access
rendered login after following the redirect.

Final validation and supplemental diagnostic results are added below.

### Destination-warm navigation and Chrome trace

Five real Link clicks per route/profile after prior HTTP-cache visits, with
desktop links and the mobile drawer. Drawer opening, pre-click scrolling and
a 500 ms settling period are outside the route timer. All 30 clicks preserved
the App Router document sentinel; browser back returned to the homepage.
These are after-only results, not paired improvements or guaranteed router-data
cache hits. The first attempt selected a link in a collapsed footer accordion;
that measurement script selector was corrected before this complete run.

| Destination | Desktop median / p75 | Mobile 4G median / p75 |
| --- | ---: | ---: |
| Services | 203 / 250 ms | 2057 / 2285 ms |
| Packages | 120 / 134 ms | 1467 / 1500 ms |
| Login | 643 / 654 ms | 1373 / 1535 ms |

The one-second target is met for these desktop journeys and missed for all
three throttled mobile journeys. [Raw samples](warm-navigation.json).

An after-only mobile cold-services DevTools trace contains nine renderer main
thread tasks over 50 ms, totaling 1835 ms, with an 844 ms longest task. Its
largest layout event is 617 ms; a webpack bootstrap evaluation is 338 ms.
Tracing adds overhead, and these categories overlap inside tasks: do not add
them together or call them isolated hydration cost. This points to rendering
and remaining shared JavaScript as investigation targets beyond transfer size.
[Trace summary](trace-summary.json); import the local ignored
`artifacts/performance/services-mobile-trace.json` into Chrome Performance.

### Regression validation

- Production build, standalone TypeScript check and lint passed. Existing lint
  warnings remain; no claim of a warning-free repository is made.
- Five new live-facts mapping/batch equivalence tests, two currency tests and
  five payment-confidence tests passed.
- Original unit suite: **112 passed, three failed** in unchanged main-branch
  lifecycle expectations and Node import/path resolution. Details are in README.
- Broad smoke run on the intermediate build: **284 passed, 51 opt-in skipped,
  two failed**. The new packages test used the legacy heading and was corrected
  to the active component's heading. The service matrix 37–48 at 768 px timed
  out during browser page setup; its final-build isolated recheck passed.
- Final-build focused public/catalog/packages/checkout/auth/hydration/rendering
  suite: **65 passed, two guest CTA navigation timeouts** (TikTok and Telegram).
  Both passed the isolated serial recheck, retaining service and quantity through
  the login redirect. The timeouts remain recorded as intermittent failures;
  a uniformly green original suite is not claimed.
- All three new rendering checks passed: packages hero visible without JS,
  article revenue links in SSR HTML, and no article-only bridge in discovery
  or packages downloads.
- Requested responsive audit: **10 passed**, covering 33 public and 13 synthetic
  authenticated routes at all five widths (230 route/width visits): 320, 390,
  768, 1024 and 1440 px. Runtime-error and horizontal-overflow assertions passed.
  Services 390/1440, packages 320 and wallet 390 screenshots were also inspected.
- Performance comparison passed its environment/coverage/HTTP-route validation,
  significant relative JS-growth budget, and real-navigation sentinel checks.

Selected visual evidence: [services mobile](screenshots/services-390.png),
[services desktop](screenshots/services-1440.png),
[packages 320 px](screenshots/packages-320.png),
[wallet mobile](screenshots/wallet-390.png). Accounts and balances are synthetic.

No real paid orders, wallet transfers, schema mutations, or production release
were performed. Private performance remains a test-fixture observation.

### Supplemental Lighthouse diagnosis

Lighthouse 13.0.1 completed one final-build mobile-simulated services run:
performance score **69**, FCP **1517 ms**, LCP **3888 ms**, total blocking time
**716 ms**, CLS **0.00102**, and speed index **3652 ms**. It reported **3128 ms**
of main-thread work and **1589 ms** of JavaScript execution. There were no run
warnings or runtime error. [Summary](lighthouse-summary.json).

These default Lighthouse simulation settings differ from the paired CDP lab
profiles; its LCP is not interchangeable with the directory's 2444 ms lab p75.
No Lighthouse baseline score or score improvement is claimed. Its results
confirm substantial remaining work before describing mobile performance as
exceptionally fast. The full JSON report, trace and DevTools log are in local
ignored `artifacts/performance/lighthouse-services*` files. The initial attempt
failed to access the local debugging connection under sandbox restrictions;
the permitted retry completed successfully.
