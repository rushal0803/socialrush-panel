# Instagram Followers — React performance trace findings

No performance fix, checkout change, telemetry write or production change is included. This report records an isolated diagnostic build of source caca5200b19a6bfc56e919f4df1a34ce570219a0, not a protected Vercel preview.

## Actual React profiling method

Created a detached local worktree, instrumented the existing ClientProviders subtree and Instagram marketing card with React Profiler onRender callbacks, and built with `next build --profile`. Instrumentation exists only in the local lab; it is not application code in the draft PR. Profiler records id, phase, actualDuration, baseDuration, startTime and commitTime. Chrome DevTools Protocol CPU profiles and PerformanceEventTiming entries were captured over the same navigation/interaction.

Environment: Next 15.5.26 / React 19.2.8, production profiling build, Chromium 151, 390x844, 4x and 6x CPU throttling, local fixture backend at localhost:3012, service workers blocked. DNT enabled; non-local requests and non-read requests blocked. No actual customer session, order, payment or production write. No extra network throttling was applied. Local fixture network timings do not model production TTFB.

Twelve cold-context trials: three per CPU/stage combination. In the early stage, click Increase quantity after DOMContentLoaded; in the mounted control, first wait for the card's React mount callback. Same build, backend, viewport, control and quantity transition (100 to 101) throughout. The mounted stage is a diagnostic control, not a proposed fix that delays user input. Profiling instrumentation and CPU throttling add overhead.

## Results

| CPU | Stage | Observed interaction durations, ms (3 trials) | React commits before action |
|---|---|---|---|
| 4x | Early | 200, 280, 208 | 0, 0, 0 |
| 4x | Mounted | 88, 72, 80 | 2, 2, 2 |
| 6x | Early | 408, 304, 408 | 0, 0, 0 |
| 6x | Mounted | 96, 96, 120 | 2, 2, 2 |

The initial root/card mount commits overlap every early interaction; in mounted trials they finish before interaction. For the first early 6x trial, event start=1313.1ms, duration=408ms; initial commit=1529.1ms, app subtree actualDuration=168.8ms, card actualDuration=82.2ms. Those nested durations overlap and must not be summed. The ensuing card update is 8.2ms. In the comparable mounted trial, mount commit=1390.3ms and interaction starts at 1685ms with duration=96ms; card update is 10.2ms.

This supports initial hydration/render work as a reproducible source of early-input delay in this lab. It does not establish which component/module/commit operation accounts for all blocked time. It does not establish that production field p75=208ms comes from this interaction. Field metadata lacks the interaction target and Event Timing breakdown; no causal field claim or CWV improvement is made.

Previous non-profiled public traces also showed intermittent React discrete-event dispatcher time, but the dispatcher is an entry point, not a root-cause attribution. Do not optimize it or the order arithmetic merely because it appears in a stack.

## Evidence files

- [React commit and Event Timing records for all twelve trials](evidence/inp-react-20261108/react-commit-events.json).
- [Early 6x CPU profile](evidence/inp-react-20261108/early-6x.cpuprofile.gz).
- [Mounted 6x CPU profile](evidence/inp-react-20261108/mounted-6x.cpuprofile.gz).

Decompress the .gz profiles and load the resulting .cpuprofile in Chrome DevTools' JavaScript Profiler/Performance tooling. URLs refer to the isolated local build. The JSON retains actual React callback values and timing entries so overlap can be checked without relying on narrative summaries.

## Next evidence gate

Obtain authorized, privacy-preserving field interaction attribution or reproduce the same blocking call path with component/module-level CPU attribution on a representative low-end device. A candidate fix must address that identified work, preserve initial SEO HTML and quantity/link/total behavior, and pass a matched before/after experiment and existing checkout regressions. No speculative Suspense, caching, event-delay or checkout modification has been implemented.
