# PR #623: focused mobile follow-up

Prior PR application baseline: `4338b585a54d357abb7f37bb826ab3bd1a8c5333`. Optimized application: `734ce7322a517741c594bb62bd031528c9e6def7`.

Five samples per condition on the same Windows runner, Node, Chromium, fixture backend, viewport and throttling. Mobile: 390×844, DPR1, 1.6 Mbps down / 750 Kbps up, 150 ms latency, 4× CPU. The follow-up uses a fresh paired baseline, not the older report as a control. No private or live financial latency is measured.

## Mobile document loads

Milliseconds, except JavaScript transfer in bytes. Arrows show prior PR → follow-up. Cold browser cache / warm server; warm is repeat HTTP-cache document load.

| Page | Cold TTFB median | Cold LCP median | Cold LCP p75 | Warm LCP median | Warm LCP p75 | Cold JS median bytes | Cold CLS p75 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | 325 → 320 | 3360 → 2304 | 3568 → 2344 | 736 → 560 | 1072 → 580 | 283124 → 286196 | 0.0000 → 0.0000 |
| /services | 381 → 358 | 3384 → 2132 | 3384 → 2140 | 608 → 476 | 824 → 504 | 291024 → 288163 | 0.0018 → 0.0018 |
| /packages | 364 → 343 | 2348 → 1864 | 2476 → 1884 | 580 → 412 | 580 → 424 | 288429 → 289401 | 0.0000 → 0.0000 |

## Mobile client navigation

Real touchscreen taps on the mobile drawer or the directory card. Browser touchstart capture → first animation frame with a distinct, fully visible destination heading. This excludes automation-driver round trips but includes touch gesture time, network waiting and rendering. It differs from the old report’s Node-side click timer. Cold destination is unvisited in a fresh context; warm follows a real visit and browser back in the same context, retaining HTTP and Router caches. Source settling is identical on both sides, with no waiting added to the product.

| Journey | Destination cache | Median | p75 | Final p75 ≤ 1 s? |
| --- | --- | ---: | ---: | --- |
| / → /services | cold-destination | 2642 → 1762 | 3082 → 1782 | No |
| / → /services | warm-destination | 2022 → 1148 | 2655 → 1165 | No |
| / → /packages | cold-destination | 1525 → 1253 | 1545 → 1311 | No |
| / → /packages | warm-destination | 1339 → 1102 | 1352 → 1155 | No |
| /services → /buy-instagram-followers-india | cold-destination | 1144 → 1353 | 1188 → 1354 | No |
| /services → /buy-instagram-followers-india | warm-destination | 343 → 347 | 367 → 389 | Yes |

All taps retained the App Router document sentinel. Warm results describe these five trials, not guaranteed cached server data or global real-user performance.

## Repeated main-thread samples

Largest observed long task per cold load, summarized across five samples. This is not isolated hydration cost. Trace events provide diagnosis separately and have instrumentation overhead.

| Page | Largest task median | Largest task p75 |
| --- | ---: | ---: |
| / | 567 → 408 | 577 → 473 |
| /services | 500 → 377 | 582 → 387 |
| /packages | 563 → 414 | 662 → 418 |

## Scope and diagnosis

This follow-up is limited to home, services, packages and the three requested mobile journeys. It does not repeat the full-site audit. The prior report and its original measurements remain intact.

The original 844 ms renderer task contains about 617 ms of Layout and 173 ms of UpdateLayoutTree across 1,414 elements. These are nested wall-clock durations, not independent costs to add to the enclosing task or isolated hydration measurements. The fresh pre-change trace reproduces an 830 ms longest task. Shared JavaScript evaluation also remains expensive. The shared stylesheet still transfers; no CSS-byte reduction is claimed.

Changes keep the live catalogue, hero and checkout controls eager. Mobile home sections after the first two, directory sections below the catalogue, directory supporting SEO content and public footers can skip offscreen layout using `content-visibility: auto`. The complete content remains server-rendered. Intrinsic sizes provide initial estimates and retain actual sizes after rendering. The service comparison dialog loads after activation and stays mounted after the first activation to preserve filters and selections; native dialog focus restoration is verified.

Public link hover, focus or touch intent warms only immutable client modules for services and packages. Module import does not mount components or run their effects. These links disable route prefetch: they do not prefetch live prices, authenticated data or server route payloads. The detail link retains normal navigation with viewport prefetch disabled. No artificial delay, application data cache, authentication change or checkout calculation change was added.

The directory's informational sections, platform links, support CTA and native FAQ now render on the server and pass through a React node slot. Their existing text, link destinations and markup are retained. Counts use the same fresh service collection; interactive filters and platform-dependent links stay on the client. This reduces component code and reconciliation without adding a catalog query.

## Validation and limitations

The production build, typecheck and lint of changed files passed. The final focused browser suite passed **66 tests**, including 11 directory widths, public/dashboard package responsiveness, guest and signed-in order links, login handoff, price-change review, wallet and checkout-intent validation, hydration, article SSR and six new follow-up checks. Five catalogue equivalence tests passed; the 31-to-1 fresh-query path is unchanged. Screenshots, footer/return-to-top checks, directory server HTML, section scrolling and native FAQ keyboard interaction verify deferred content remains reachable.

The first trial (`ab938bae`) lowered the longest traced task to 483 ms but increased desktop services JavaScript to 292,044 bytes and regressed cold detail navigation. Its raw measurements are retained as intermediate evidence. The final revision removes detail-panel import warming and moves static sections to the server. The intermediate trial is not substituted for the final measurements.

The user's prior final GitHub CI run passed **222 tests with zero failures**: [run 38000543632](https://github.com/rushal0803/socialrush-panel/actions/runs/38000543632). The follow-up's final GitHub CI result and exact preview are recorded in [PR #623](https://github.com/rushal0803/socialrush-panel/pull/623), after the evidence commit is pushed. This avoids describing the prior run as validation of later changes.

Five samples per condition describe this runner, not statistical proof of a global speedup. The earlier document LCP samples and this fresh baseline vary despite identical application code, so the earlier report is not used as this follow-up's timing control. Field LCP, INP and real payment/API performance are not remeasured. The original field targets remain unverified after these unpublished changes. There was no production deployment, merge, real order or wallet transfer.

## Achieved and remaining targets

| Target | Observed result | Assessment |
| --- | --- | --- |
| Mobile cold LCP p75 at most 2.5 s | Home 2344 ms; services 2140 ms; packages 1884 ms | Achieved in these lab samples; real-user target unverified |
| Warm home to services at most 1 s | p75 2655 to 1165 ms | Improved; unmet |
| Warm home to packages at most 1 s | p75 1352 to 1155 ms | Improved; unmet |
| Warm services to detail at most 1 s | p75 367 to 389 ms | Achieved before and after; no speedup |
| Retain desktop services JS reduction | 291024 to 288163 bytes; original main 524667 bytes | Retained: now 45.1% below original main |
| Retain fresh catalogue query improvement | 31 to 1; five equivalence tests pass | Retained without an application price cache |
| Layout stability | Cold lab CLS p75 at most 0.0018; scroll checks below 0.006 | Verified in focused checks; field result unverified |

Cold services-to-detail navigation **regressed**: median 1144 to 1353 ms and p75 1188 to 1354 ms. Warm detail timings also rose slightly. This requested flow has not improved. An after-only diagnostic found a 257 ms route response, three additional small JavaScript chunks and a 594 ms main-thread task. It is diagnostic evidence, not a paired latency attribution. The service stylesheet explicitly preserves real heights for deep Instagram sections because the prior estimated-height optimization caused a documented 0.24 shift. That safeguard remains intact; no speculative containment or price cache was added to meet a timing threshold.

Desktop services cold LCP median increased 608 to 624 ms (p75 after 656 ms), while warm median stayed 228 ms. Homepage JavaScript grew 3072 bytes (1.1%) and packages grew 972 bytes (0.3%); the relative transfer budget passed. The earlier desktop-homepage regression was not remeasured, and no desktop-homepage speedup is claimed.

The instrumented services trace's longest task fell from **830 to 383 ms**; its nested Layout event fell from 597 to 290 ms and style calculation from 157 to 64 ms. The original 844 ms task belongs to the earlier trace. These single traced loads have instrumentation overhead. The repeated untraced samples also show lower largest tasks, but tasks over 50 ms remain. Shared JavaScript and CSS/layout still prevent a universal fast-mobile claim.

Ten additional browser checks passed: the six follow-up checks after the request-listener correction and four scrolling checks at 4x CPU. Accumulated non-input layout shifts over the entire scrolling checks were home 0.00038, services 0.00568, packages 0 and detail 0. This conservative sum is not the CLS session-window calculation or a real-user metric.

Raw paired data, comparator outputs, trace summaries, the rejected intermediate trial and the after-only detail diagnostic are in [mobile-followup/](mobile-followup/). Full trace files remain in local ignored artifacts. The measured application revision is `734ce732`; the evidence commit also removes an unused import without changing behavior.

