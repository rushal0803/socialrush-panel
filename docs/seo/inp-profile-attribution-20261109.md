# Instagram Followers: preserved-profile attribution follow-up

Analysis date: 9 November 2026 (Asia/Calcutta). This reanalyses the existing isolated profiling build; it is not a new browser trial, production measurement or performance fix. Source, controls and twelve-trial results remain in [the original report](inp-react-traces-20261108.md).

## More precise interaction finding

The preserved first 6x early trial has a 408ms interaction. Its pointerdown processing is 308.7ms and input delay 26.7ms. The subsequent click has 355.4ms input delay but only 20.4ms processing. In the first mounted control, the 96ms interaction has pointerdown processing 5.8ms, click input delay 28.1ms and click processing 20.9ms. The ordinary click-handler processing is therefore similar in this pair; most additional time occurs before the click handler, during the early pointerdown/hydration interval. It would be unsupported to attribute the extra delay to quantity arithmetic merely because the quantity button was clicked.

The early application mount starts at 1352.9ms and commits at 1529.1ms, within pointerdown processing (approximately 1339.8–1648.5ms). Its nested card mount has actualDuration 82.2ms versus application-subtree actualDuration 168.8ms. These nested values overlap. The mounted control application mount has actualDuration 180.3ms and finishes at 1390.3ms, before input at 1685ms. This strengthens the scheduling/overlap explanation without proving that the application does less work in the control.

## Weighted CPU samples

CPU profile `timeDeltas` are microseconds. For each sample, assign its delta to its sampled node's callFrame URL; group identical URLs. These are approximate sampled self times across each entire capture, not durations confined to the interaction. `program` is an unresolved profiler bucket, not a named JavaScript function or proof of layout time.

| Capture group, sampled self time (ms) | Early 6x | Mounted 6x |
|---|---:|---:|
| Total sampled capture | 2150.587 | 2189.885 |
| `(program)` | 945.497 | 1056.421 |
| `(idle)` | 170.595 | 259.365 |
| `deddd6ab-e803f6b312ad5e53.js` | 293.252 | 227.099 |
| `webpack-80543bdb98a9ac67.js` | 236.406 | 203.004 |
| `8180-35705dc6882b2ffb.js` | 146.296 | 130.366 |
| `7862-999bbe15dec356d1.js` | 69.706 | 55.908 |
| `(garbage collector)` | 27.366 | 23.296 |

A repeated sampled stack in both captures is:

`deddd6ab…:az@0:53199 → 5438…:j@0:5329 → 5438…:U@0:5873 → 7862…:m@0:7444 → 7862…:d@0:7298`

Locations above are the profile's zero-based line/column fields. The early stack includes an additional anonymous `5438…` frame between `j` and `U`. Across all call-tree occurrences, `d@0:7298` accounts for 65.800ms sampled self time early versus 50.928ms mounted. This identifies an exact chunk/function location worth symbolication; its minified name does not establish a specific component or dependency.

No matching profiling-build JavaScript files or source maps are preserved beside these profiles. A newly generated bundle, a production preview or a similarly numbered chunk cannot safely symbolicate these byte offsets. The CPU profile's monotonic startTime also cannot be directly compared with the page-relative Event Timing `at` values: the saved files do not record a shared navigation time-origin/clock anchor. Consequently this analysis does not assign any whole-capture chunk total to the 408ms interaction, name a third-party script as its cause, or claim a component-level fix is ready.

## Reproduce the aggregation

Run from repository root using Python 3; this only reads the preserved files:

```python
import collections, gzip, json
from pathlib import Path
for file in sorted(Path('docs/seo/evidence/inp-react-20261108').glob('*.cpuprofile.gz')):
    with gzip.open(file, 'rt') as stream:
        profile = json.load(stream)
    nodes = {node['id']: node for node in profile['nodes']}
    totals = collections.Counter()
    for sample, delta in zip(profile['samples'], profile['timeDeltas']):
        frame = nodes[sample]['callFrame']
        totals[frame['url'] or frame['functionName']] += delta
    print(file.name, sum(profile['timeDeltas']) / 1000)
    for key, micros in totals.most_common(8):
        print(key, round(micros / 1000, 3))
```

## Next controlled capture

Preserve exact generated profiling chunks and their source maps together with a build/source identity; capture a Chrome performance trace containing navigation, interaction events, tasks and CPU samples on one clock. Add narrow profiler boundaries around the observed card and relevant provider subtrees in that isolated lab. Compare early and mounted trials with the same backend/device settings, then symbolicate work overlapping the delayed pointerdown. Only a reproducible named bottleneck should lead to a candidate application change. Retest quantity, live total, destination validation, cart and checkout after such a change.

Production p75 INP, device/browser differences and third-party contributions remain unverified in this run. No field INP improvement, new production telemetry, checkout edit or delivery claim follows from this reanalysis.
