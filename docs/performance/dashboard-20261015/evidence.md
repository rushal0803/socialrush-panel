# Verified evidence

Checked 360 route/width combinations at all ten requested widths. No detected overflow or clipped controls. See responsive-results.json.

| Route | Before click p75 (ms) | After click p75 (ms) | Before JS transferred (bytes) | After JS transferred (bytes) |
| --- | ---: | ---: | ---: | ---: |
| /dashboard | 999 | 222 | 295817 | 296910 |
| /dashboard/new-order | 334 | 242 | 324051 | 325145 |
| /dashboard/orders | 217 | 197 | 304421 | 305682 |
| /dashboard/wallet | 997 | 255 | 314134 | 297418 |
| /dashboard/billing | 289 | 229 | 304722 | 295629 |
| /dashboard/packages | 1015 | 985 | 308192 | 309285 |

Five actual clicks per route, localhost production build, 1440×900, no throttling, synthetic backend. The endpoint is heading paint, not completion of all background data. Separate runs on a shared machine are noisy; routes that regress are reported as measured. Both sets remain below 1.5 seconds in this profile. No production speedup is certified.

Single document LCP/CLS observations are in comparison.json; no INP or field p75 measurement. Network timing entries and error arrays are preserved in before.json/after.json. Local Playwright traces: artifacts/dashboard-navigation/{before,after}/trace.zip. Traces are intentionally not committed.

Wallet hidden funding descendants: 169 → 0. Overview database request expressions: 21 → 18 (source-verified; production query costs unmeasured). Orders no longer waits for browser auth and an unbounded read before showing records.

## Screenshots

- dashboard: [before](before-dashboard-1440.png), [after](after-dashboard-1440.png)
- new-order: [before](before-new-order-1440.png), [after](after-new-order-1440.png)
- orders: [before](before-orders-1440.png), [after](after-orders-1440.png)
- wallet: [before](before-wallet-1440.png), [after](after-wallet-1440.png)
- billing: [before](before-billing-1440.png), [after](after-billing-1440.png)
- packages: [before](before-packages-1440.png), [after](after-packages-1440.png)

Mobile examples: [Wallet](after-dashboard-wallet-390.png), [Orders](after-dashboard-orders-390.png), [New Order](after-dashboard-new-order-390.png), [Overview](after-dashboard-390.png), [Billing](after-dashboard-billing-390.png), [Packages](after-dashboard-packages-390.png).
