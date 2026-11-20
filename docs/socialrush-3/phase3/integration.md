# Integration audit — no merge performed

Observed heads, bases, CI and all returned reviews/inline threads are retained in [baseline-evidence.json](baseline-evidence.json). All five PRs remain draft/unmerged. Submitted reviews and inline review threads are empty; this means **no independent approval**, not that review requirements are satisfied. #761 has only a Vercel feedback check; it has no smoke/PostgreSQL certification. Optional performance checks are skipped.

## Dependency graph

```text
main 35fcaf73 ── #760 04affabe ── #761 b07b484a
             └─ #762 eecbe2b6 ── #763 94a2b39f ── #764 c77f6bde ── this Phase 3
```

#763 source-selected recovery/auth fixes from #761 without adopting the full SEO branch. #764 ported the missing early-input adoption narrowly. Treating the stacks as independent would replay shared auth and form edits.

## Object-only simulation

`git merge-tree --write-tree <#764> <#761>` created diagnostic Git objects only. It did not create a merge commit, change a branch, modify either PR or deploy. Seven file paths overlap relative to main. Five have textual conflicts:

| Conflict | Resolution proposed in simulation | Rationale / gate |
|---|---|---|
| pre-merge-smoke-tests.yml | Retain #764 version | Keep security/finance tests and diagnostic artifacts; add target trigger explicitly for the eventual integration branch |
| app/auth/callback/route.ts | Retain #764 version | Preserve #763 recovery fail-closed behavior; re-run recovery integration before release |
| app/auth/recovery/page.tsx | Retain #764 version | Preserve latest isolated recovery-source fix |
| app/reset-password/page.tsx | Retain #764 version | Preserve latest invalid-session handling |
| ServiceOrderCard.tsx | Retain #764 version | Preserve early-input adoption, quantity validation and Phase 2 accessibility/design |

The two other overlapping paths, auth/actions and seo-architecture tests, three-way resolve without markers. Auth actions remain identical to #764. The SEO contract test adopts #760's extracted redirect-contract reader. The simulation tree is `1f0a7883dbc263b65ee4162638d9af264342d876`; no markers remain in app/components/lib/.github. It has 152 changed paths against #764. [Manifest and original conflict paths](integration-simulation.json).

The auto-resolved differences include #760's browser/server preview analytics exclusion and analytics route guard, not only SEO documents. These are material semantic changes requiring review. The new Phase 3 consent prototype does not silently overwrite either capture implementation.

The materialized simulation was tested with outbound transport denied: **15/15 security** and **109/109 SEO/homepage/service source contracts PASS**. These are focused tests, not full integrated build/browser/SDK certification. No simulation tree was pushed as an integration release.

## Proposed integration sequence

1. Freeze the five exact heads and recheck main. Obtain independent review of this resolution policy and the 152-path manifest. Do not squash/rebase the shared ancestry blindly.
2. In a future separately reviewed integration branch, reproduce the object-only result, explicitly resolve the five paths as above, retain current Phase 3 isolated modules/tests, and audit each remaining source diff. Preserve deployment-disabled configuration for every working branch.
3. Reconcile CI triggers/artifacts/security/finance tests as a union. Retain canonical ownership, alias redirects, payment settings, server recalculation and recovery guards. Run full TypeScript/build/unit/SEO/security/browser/SQL coverage at the resulting exact tree; #761's absent CI is not inherited PASS.
4. Review operational scripts/cron/indexing changes separately; never execute them as part of this audit. Check schema and workers for unintended integration activation.
5. Establish exact-preview isolation, then authorized authenticated QA and manual accessibility/performance gates. Only after those and separate release approval could integration proceed. Current outcome **HOLD**.

This is a reproducible conflict-resolution strategy with focused evidence. It does not establish that all 152 differences are safe or approve merging either stack.
