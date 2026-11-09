# Release-blocker remediation — 10 November 2026 IST

**Release: HOLD.** Focused child of draft #758 (`2148678d9fc454afc9c742a002fe696a254695fd`). No merge, manual deployment, production mutation, payment-gateway change, protection bypass or indexing submission. See the child draft PR for current exact-head CI/preview and final check results; this committed document records implementation and pre-commit evidence.

## Quantity loss

Server HTML exposed editable quantity and destination inputs while client JavaScript loaded. Their React states still initialized to the minimum and empty link. Hydration initially preserved the edited DOM, but a subsequent controlled render restored the stale defaults. This was a state/DOM synchronization defect, not quantity arithmetic. A deterministic blocked-chunk test against unmodified #758 entered1000, then increased after hydration: expected1001, received101.

ServiceOrderCard now adopts both actual input values in its first layout effect, before later renders restore defaults. The same existing numeric-input normalization and validators apply; early invalid, blank or out-of-range quantities remain invalid instead of silently becoming the minimum. No pricing formula, catalog rate, quantity limit, server API handler or payment gateway changes.

Seven deterministic browser checks cover mobile390 and desktop1440, early quantity with either early or later destination entry, 6× mobile CPU throttling, further increment/decrement events, INR estimate, login return, dashboard quantity/review, and synthetic intent/order payloads. The real local intent handler retains1000 and calculates3000paise despite forged client price fields; browser order creation is intercepted with503 before an order exists. Blank,99 and1000001 remain invalid with error/focus and no usable handoff. These are isolated fixtures, not a real payment-provider transaction or an INP measurement.

## Currency regression

The skipped wallet-balance regression targeted a removed `Currency: INR` button. The product exposes the native `Display currency` combobox. The test now asserts its accessible explanation, selects INR, verifies selection, and retains both header/sidebar balance-update assertions and zero browser order reads. It is included in the normal authenticated fixture CI gate. The separate keyboard-currency test remains intact. No product behavior is changed for this fix.

## All79 redirect-monitor mismatches

[Complete91-row audit](redirect-audit.json): **79 expected redirects;0 obsolete route expectations;0 confirmed route defects among those79.** Twelve other monitored redirects also pass, giving91/91. Every destination returns200 with the expected production canonical; query parameters survive. Each expected destination agrees with commercial query ownership or an explicit Next redirect.

The earlier localhost run never exercised the production-only commercial middleware: it keys on `Host: www.getsocialrush.com`. Some aliases therefore rendered local fallback200/404, which was incorrectly described as a legacy route/monitor mismatch in #758 verification. Production-host simulation against the unchanged #758 build passes all91; no route ownership, middleware, canonical or redirect configuration should be changed to fix this test setup.

An additional transport finding: Node fetch discarded a custom Host header, so setting that header on the earlier fetch adapter was insufficient. The monitor now offers `SEO_TRANSPORT_ORIGIN` for a **plain HTTP loopback origin only**, while retaining its production canonical base. Node HTTP preserves the simulated Host/protocol. Normal hosted monitoring keeps its ordinary fetch behavior with no simulated headers. Remote origins, Vercel previews, credentials, non-root paths, query/hash transport configuration and alternate canonical hosts are rejected. This is local host-routing simulation, never deployment-protection access.

Run against an owned local production build:

```sh
SEO_TRANSPORT_ORIGIN=http://127.0.0.1:3004 npm run seo:check
```

The reviewed91-entry contract is shared by the health monitor and a browser/API regression. The regression independently checks canonical ownership, all redirect statuses/targets/query preservation and rendered destination canonicals, plus a negative localhost-host control. Four unit checks verify normal hosted requests, safe transport configuration and real loopback Host/protocol/query delivery. The pre-commit monitor passed128/128 against the #758 build under production-host simulation.

## Validation and release gates

Pre-commit focused suite:8/8 (seven quantity checks plus the full91-route integration check). Unit transport:4/4. Negative quantity regression fails as expected on unmodified #758. Initial test-authoring corrections used the full accessible quantity name and the separate review-details card rather than the payment-summary card; assertions remain exact. Full suites, isolated PostgreSQL and exact-head CI are recorded in the draft PR after completion; these focused results do not substitute for them.

Keep HOLD pending exact-head validation, owner-authenticated hosted mobile/desktop acceptance and administrator branch-protection attestation. Existing #758 observations were main `protected:false`, visible rulesets `[]`, protection-detail403: not certification of intended enforcement. Required contexts remain `Typecheck, CRM pipeline tests, international SEO, build, and smoke test` and `Isolated PostgreSQL wallet approval and replay checks` with the owner's intended review/bypass policy.

Owner must use normal authorized Vercel sign-in on the exact new immutable preview recorded in the PR. Test390×844,1440×900 and narrow320px: early1000 edit during slow loading, both destination timings, live estimate, invalid bounds, login return, review quantity, metadata/canonicals/schema/internal links and approved isolated checkout fixtures. Verify fixture/backend isolation first; no real charge or production account mutation. Record URL,SHA,viewport,PASS/FAIL/BLOCKED/NOT RUN,expected/actual,screenshot/trace,time,browser and fixture identifier. Local host simulations cannot certify protected-host auth or checkout-provider behavior.

Historical INP208ms and the408ms early lab interaction remain unresolved; this functional fix claims no field INP improvement. Fresh same-clock traces/profiling assets and field evidence remain needed. Free GSC indexed Inspections for six revised guides, canonical/query evidence, country availability evidence and the prior export/CWV requests remain outstanding. No indexing, AI citation or revenue-growth outcome is claimed.
