# Second service-page batch — 8 November 2026

Draft work only. No production, checkout/order calculations or payloads, catalog rates, database records, authentication/protection settings or crawler-policy changes. Profiling instrumentation exists only in a detached local lab; it is not deployed application code.

## Dependencies and protected QA

Rechecked #744–#749: all OPEN, draft, unchanged and mergeable. Each exact source head still has successful full build/browser/customer/database CI and a matching successful Vercel status. Optional visual/performance jobs are skipped. #749 is caca5200b19a6bfc56e919f4df1a34ce570219a0 on #747; workflow 42486968421 passed 272 browser checks with 67 skipped, 14 customer fixtures and isolated PostgreSQL checks. Preview dpl_4i15VTACkkyt437kAw3cCEMNFQ7Y is READY at that SHA. This does not prove protected rendering.

| PR | Exact verified head | Delivery relationship |
|---|---|---|
| 744 | 2736c825f92970f1bfbbf410f6f781ad8bf2d9be | Pricing source, already included in #747 |
| 745 | f09f7e6199e2dea0ad4c8921f5cc002c1393d409 | Attribution source, already included in #747 |
| 746 | d72bb3d8ba65b5ca46c42c011a3f835c389493f2 | Discovery source, already included in #747 |
| 747 | cc12b5a746e330dc8689b6e05dbba12edc29090b | Squashed combination of #744–#746 |
| 748 | 94a0c1a5754faef41aeb1408fc9604c1727caab7 | Independent monitoring repair |
| 749 | caca5200b19a6bfc56e919f4df1a34ce570219a0 | First ten-page batch, stacked on #747 |

Proposed owner-approved order remains #748, #747, #749, then this batch. Do not also merge #744–#746. Recheck/rebase/retarget exact remaining heads after any approved merge; local conflict checks are not a combined hosted release pass. No PR was merged, closed or marked ready.

The user explicitly prohibited publicly shareable preview bypass links. None were created or reused in this run. Project metadata shows existing SSO protection; no automation-bypass credential was exposed by the project read. The environment has no configured test secret and offers no desktop js/computer-use tool, despite remote_desktop enabled/state unknown. The Vercel web-fetch tool creates/reuses share links, so it was not used. Protected mobile QA is BLOCKED until existing authenticated browser access or an approved scoped testing facility is available. No new bypass, password change, SSO change, production-security change or credential extraction was attempted. Local/CI fixture screenshots are not protected hosted QA.

## Selection, metadata, intent and eligibility

Selected the next ten eligible existing canonical services after batch one. The first three have the most remaining filtered first-party service landing events. Companion services complete distinct Instagram/YouTube/Facebook buyer intents. This is an editorial batch, not a search-demand ranking. Counts below are last-28-day organic_landing_view events / distinct stored session IDs, restricted to organic medium and Google/Bing root search referrers. Historical attribution contamination and sparse samples remain; these are not GSC clicks, impressions, queries, unique people or verified organic sessions.

All ten current public URLs returned 200, one H1, matching canonical, index/follow meta robots and no response noindex. All occur in the existing sitemap. Titles and descriptions are present and distinct. No metadata rewrite was justified by current query evidence; accurate titles/canonicals remain. All ten expose Service data, including services nested in @graph: a missing top-level @type is not missing schema. Actual Google/Bing indexing is UNKNOWN for all ten.

| Canonical page | Landing events / session IDs | Content/intent assessment | Change or retained decision |
|---|---:|---|---|
| /youtube-likes | 16 / 14 | Public-video likes, distinct from subscribers/views; existing no-ranking/monetization guarantees and related links are useful | Explicit per-1000 likes reference in existing offer |
| /facebook-views | 12 / 10 | Public-video view intent; existing content covers ordering but omits watch-time/geographic/authenticity limits | Original buyer checks + matching FAQ + four crawlable research/terms links; offer units |
| /linkedin-likes | 11 / 10 | Public-post likes, not follower packages or professional endorsement | Original limits on credibility, industry/geographic assumptions and qualified demand; matching FAQ and links; offer units |
| /buy-youtube-watch-hours-india | 4 / 4 | Public long-form video eligibility, YPP caveats and full-watch illustration already present | Retain existing content and withheld offer. Billed unit requires confirmation; no invented per-hour price |
| /buy-instagram-shares-india | 4 / 4 | Exact public post/Reel; no-refill/live facts and no reach guarantee already explicit | Reference units, preserve dedicated canonical owner |
| /buy-youtube-comments-india | 2 / 2 | Public videos/Shorts; moderation, deletion and synthetic-engagement risks already explicit | Reference units and dedicated ownership; preserve current workspace and buyer guide |
| /buy-facebook-group-members-india | 1 / 1 | Group URL, access/admin approval, privacy, retention and non-authenticity limits already explicit | Reference units and dedicated ownership; no membership-approval guarantee |
| /buy-instagram-saves-india | 1 / 1 | Public post/Reel bookmarks, not likes; max 1000, no refill, non-authenticity caveats already present | Reference units inside existing @graph Service; dedicated ownership |
| /buy-instagram-comments-india | 1 / 1 | Exact public post/Reel, moderation/retention/geography risks; existing unit-aware schema is already correct | Protect its dedicated canonical owner; retain existing copy and pricing schema |
| /buy-facebook-shares-india | 0 observed / 0 | Public-post permalink, not Page/profile; existing reach/geography FAQs | Remove duplicate outer Service/BreadcrumbList, clarify intro without implied distribution, reference units and dedicated ownership |

Zero observed landing events do not prove zero demand. Older open drafts #714 (21bab5fb...), #721 (8fc3fbdf...) and #722 (7c7581f9...) touch Watch Hours/Group Members and neighboring components. Reviewed their changed-file scopes; none was merged or copied into this batch. Current main-derived buyer guidance is preserved. Those drafts require separate overlap/rebase review before any release.

## Schema, content and links

Facebook Shares production HTML contained two Service and two BreadcrumbList definitions for the same canonical, from the outer helper and the inner landing. The redundant outer helper is removed in both route entry paths; the landing continues to supply its visible trail, FAQ and live terms. Other audited dedicated canonicals no longer compete with catch-all static generation. Order workspace implementations, validators, quantity arithmetic and checkout payloads are unchanged.

Eight existing offers gain UnitPriceSpecification with unchanged INR price and referenceQuantity=1000, with service-specific likes/views/saves/shares/comments/members units. Instagram Comments already supplied an accurate reference quantity and is retained. Watch Hours still emits no offer. No unavailable service receives a new availability claim.

Facebook Views and LinkedIn Likes guides have distinct questions/answers. They separate view counts from watch time and post likes from followers/endorsements; they do not equate purchased activity with genuine demand. Their visible text and FAQPage share one data source. Each guide links to the relevant existing hub, adjacent services/research and refund conditions. Runtime tests check all eight new links return 200. FAQ schema does not promise eligibility for Google FAQ rich results or AI citations.

Public metadata/schema baseline is preserved in [the snapshot](service-batch2-baseline-20261108.json). No doorway/location pages, new canonicals, fabricated ratings/reviews or search claims are added.

## Price and delivery facts

Read-only catalog queries matched current public price, quantity, delivery and refill facts for all ten services. Facebook Group Members was resolved by service name because its row lacks the expected code; no availability inference was made from code absence. Example constraints retained: Saves max 1000, Shares max 100000, Comments max 10000, all no-refill where listed.

Watch Hours' catalog says Watch Hours, while its existing workspace prices view quantities and computes full-video watch-time illustrations. Neither the row name nor a calculator proves the billed delivery unit. Requested vendor/owner confirmation; pending confirmation, no per-hour offer, revised rate, quantity behavior or monetization claim is introduced. The existing YPP/Shorts/valid-public-watch-time guidance remains. This is an unresolved content fact, not a newly implemented pricing feature.

## Mobile and performance evidence

Local production-build tests at 390x844 cover all twenty pages across both batches: response, one H1, canonical, horizontal overflow, schema (including @graph), reference quantity, withheld Watch Hours offer, single Service/BreadcrumbList, matching visible FAQ and new link health. All twenty passed before final hosted verification. Screenshots were manually reviewed; they are local fixture evidence only.

Stored mobile navigate events at release 35fcaf731447 are too sparse in this batch for CWV verdicts: Facebook Views LCP p75 1780ms (3 events), INP 102ms (2); LinkedIn Likes LCP 2920ms (1); Watch Hours INP 280ms (1). Other page/metric cells are UNKNOWN. Do not treat one event as a representative p75 or optimize unrelated components from these figures. No field improvement is claimed.

Instagram Followers was investigated using an actual React production profiling build, React commit callbacks, Chrome CPU profiles and Event Timing. Twelve matched fixture trials show early input overlaps initial hydration; post-mount controls are faster. [Full React trace report and preserved evidence](inp-react-traces-20261108.md). This identifies a reproducible lab pattern, not the cause of production p75=208ms or a component-level fix. No speculative application/runtime/checkout changes are included.

## Search and AI evidence gaps

GSC get_account_info still returns payment_required/subscription_required. No purchase or workaround. Required free exports are specified in [batch one's export checklist](service-batch1-20261108.md#exact-free-search-console-exports-required): exact-date Web performance, India/all-country Pages/Queries/Dates/Countries/Devices, page-filtered Queries/Dates for these ten exact URLs, indexing reasons and indexed URL Inspection with Google-selected canonical. Record export filters, row counts, privacy omissions and caps; absence from an export is not zero demand. Live Tests do not prove indexing. Bing requires its official performance/URL Inspection evidence as well.

Robot rules still allow relevant search crawlers, without any training-bot change. User-agent-only requests for these ten pages are recorded separately from actual crawler-IP access. Schema and public HTML accessibility improve accurate retrieval eligibility; no actual AI citation, recommendation, ranking, impressions or organic-revenue uplift is claimed. Use the dated, reproducible citation-vs-retrieval observation method in batch one's report when actual search evidence becomes available.

## Validation and release boundary

Three new behavioral unit tests and ten new mobile runtime tests are wired into existing full CI. Existing tests remain, with one former out-of-batch YouTube Likes assertion updated because that route now intentionally gains unit schema. The pre-merge workflow also targets this draft's #749 base so checks actually execute on a stacked PR. New screenshot/trace paths are retained in CI artifacts.

Local unit suite: 247 passed; TypeScript and lint pass (existing warnings); production build passed; first twenty mobile tests passed. Final exact-head CI and Vercel metadata are recorded in the draft PR description. READY alone is not rendered-preview verification. Keep every PR draft/unmerged. Remaining work: authenticated protected QA, official indexing/query evidence, Watch Hours unit confirmation, field INP attribution/component-level diagnosis, and the other 49 inventory pages outside these two batches.
