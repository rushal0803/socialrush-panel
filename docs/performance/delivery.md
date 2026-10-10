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
### PR #623 mobile continuation

The subsequent focused continuation is documented in [mobile-followup.md](mobile-followup.md), including fresh paired mobile measurements, desktop JavaScript retention, scrolling validation and the remaining detail-navigation regression. The earlier CI completed successfully: 222 tests, zero failures. The continuation's exact final CI and preview are recorded in [PR #623](https://github.com/rushal0803/socialrush-panel/pull/623). The historical tables and audit above are retained; no full-site audit was repeated.
