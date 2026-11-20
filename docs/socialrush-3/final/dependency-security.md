# Dependency security patch — isolated candidate only

Public npm advisory reads on 2026-11-16 found **1 critical and4 high vulnerable-package groups in the candidate's production lockfile**. This is version-based advisory evidence, not proof of production exploitability. No exploit or production endpoint was tested. Earlier successful CI did not establish absence of newly published dependency advisories.

## Compatible remediation

- Next.js and eslint-config-next15.5.26 →15.5.29; matching @next/env/SWC/ESLint plugin packages follow the framework patch.
- PostCSS8.5.23 is pinned and overridden consistently. Next15.5.29 still declares PostCSS8.4.31, which retains source-map/file-disclosure advisories; merely updating Next would leave this risk. Both observed PostCSS copies are major8, so the override introduces no PostCSS major transition. CSS/build/visual compatibility must still be tested.
- Sharp0.35.4 →0.35.5 and matching image/libvips packages; nanoid3.3.13 →3.3.20; source-map-js1.2.1 →1.2.2.
- Compatible developer-tooling fixes include brace-expansion1.1.22/5.0.13, js-yaml4.3.2, browserslist4.29.5 and TypeScript ESLint8.72.2. See the exact [65-node delta](dependency-changes.csv), including platform-specific binaries and deduplication. No `npm audit fix --force`, root framework major upgrade, new paid service or production configuration change was used.

[Initial production audit](dependency-audit-before-production.json), [patched production audit](dependency-audit-after-production.json) and [patched full-graph audit](dependency-audit-after-all.json) preserve registry findings. Production audit reports0 advisories. Full graph reports0 critical/high and6 moderate affected developer packages.

## Residual moderate advisory — not cleared

[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) affects minimatch7 through versions before11.0.1. Current compatible TypeScript ESLint8.72.2 still requires minimatch^10.2.2. One underlying moderate glob-amplification advisory propagates through six developer packages; these are not six independently verified exploits. It is not present in the production audit. Exposure through untrusted lint/project patterns has not been exploited or independently ruled out.

A compatible upstream parser update or separately reviewed transitive major override remains outstanding. This task does not force an unsupported minimatch11 override just to make an audit count disappear. The new CI gate rejects high/critical findings across the entire graph; passing that gate does not clear these moderate findings or certify complete security. Release remains HOLD for this review and the existing mandatory isolation/accessibility/consent gates.

## Isolation and verification

Lockfile-only resolution ran before changing any installed packages. The shared baseline's installed Next version remained15.5.26. Only the candidate's node_modules symlink is removed; the baseline target is retained, and the candidate receives its own clean install. Generated candidate .next output is rebuildable and removed to make space; source, logs, screenshots and diagnostic traces are preserved. No credentials/customer data are copied and no live backend/provider is contacted by application tests.

Re-run the clean install, advisory checks, real @next/env no-dotenv sentinel, optimized isolated build, TypeScript, repository lint, existing units, stubbed security/payment/recovery, finance/consent fixtures, SEO/CRM contracts, responsive/axe/slow-hydration browser cases and native200% zoom. Exact final-head results and artifact links are recorded in the PR body/checks after completion. Pre-patch diagnostic runs remain failures and are never relabeled as final-head passes. No automatic release follows successful tests.
