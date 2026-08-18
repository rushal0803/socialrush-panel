# SocialRUSH India competitor-gap audit

Audit date: 19 August 2026. This is a repository and catalog audit, not a claim that competitor pages, rankings, or prices were copied. Competitors were used only as intent references: `ytviews.in`, `socialking.in`, and `followersindia.com`.

## Inventory

### Canonical commercial pages

| Platform | Canonical pages | Service intents owned |
| --- | --- | --- |
| Instagram | `/buy-instagram-followers-india`, `/instagram-likes`, `/instagram-views` | followers, likes, views/Reels views |
| YouTube | `/youtube-subscribers`, `/youtube-likes`, `/youtube-views` | subscribers, likes, views |
| Facebook | `/buy-facebook-followers-india`, `/facebook-likes`, `/facebook-views` | followers/page audience, likes, video/post views |
| LinkedIn | `/linkedin-followers`, `/linkedin-likes` | profile or company-page followers, post likes |
| X / Twitter | `/twitter-followers` | followers |
| Telegram | `/telegram-members` | channel/group members |
| TikTok | `/tiktok-followers` | followers |

The active service catalog also includes Facebook Shares, TikTok Likes, and TikTok Views. They remain catalog/service-directory intents, not new indexable commercial pages in this release. The catalog has no confirmed offerings for Instagram comments, Story views, saves/shares; YouTube Shorts views or watch time; Facebook reactions; LinkedIn reposts; X likes/views; or Telegram post views/reactions.

### Informational and tool inventory

- Blog: the published `blogArticles` inventory powers `/blog/[slug]`; it covers Instagram pricing and follower-versus-engagement, YouTube pricing and channel growth, LinkedIn growth, Facebook page growth, public-link safety, service selection, and campaign planning.
- Creator tools: Instagram engagement calculator, image resizer, YouTube thumbnail/title preview, Instagram caption counter, UTM builder, YouTube engagement calculator, YouTube revenue estimator, social-media budget calculator, and creator-growth checklist.
- Sitemap: public marketing pages, canonical service pages, published blog articles, approved case studies, and the creator tools above.
- Redirects/canonicals: `middleware.ts` owns legacy service aliases; `next.config.mjs` owns host and selected older aliases. `createPageMetadata` produces absolute canonical URLs without query strings.

## Gap map and prioritization

| Intent gap | Catalog support | Cannibalization / India relevance | Decision |
| --- | --- | --- | --- |
| Instagram comments, Story views, saves/shares | No | No service support | Do not create a page. |
| YouTube Shorts views or watch-time | No | Watch time is an educational topic, not a purchasable service | Do not create a page; strengthen future educational guidance only when a distinct article is warranted. |
| Facebook post reactions | No | Close to existing post-like intent | Do not create a page. |
| Facebook shares | Yes | Distinct service but insufficient evidence of a separate indexed demand page | Keep in catalog; revisit with Search Console/query data. |
| LinkedIn company-page followers | Yes, within follower destination | Already expressly owned by `/linkedin-followers` | No variant page. |
| LinkedIn reposts | No | No service support | Do not create a page. |
| X likes and views/impressions | No | No service support | Do not create a page. |
| Telegram post views/reactions | No | No service support | Do not create a page. |
| TikTok likes/views | Yes | TikTok's India relevance needs validated search and business data; separate pages would be speculative | Keep in catalog; do not create index pages now. |
| Service comparison, public-link safety, campaign budgeting | Yes / informational | Strong existing material and useful linkable intent | Existing guides and tools cover this; improve based on query data rather than duplicate. |

## Implementation in this sprint

No new commercial pages were created. The only change is technical consolidation:

- `/buy-facebook-views-india` now permanently redirects to `/facebook-views`, the existing canonical page.
- Removed noncanonical `/services/facebook-views`, `/services/facebook-shares`, `/services/tiktok-likes`, and `/services/tiktok-views` from the sitemap. The catalog-only Facebook Shares, TikTok Likes, and TikTok Views details are now `noindex,follow`; these generic URLs should not be submitted as indexable landing pages while canonical ownership is unresolved.

This preserves existing authority, eliminates a sitemap/noindex contradiction, and avoids thin service variants.

## Internal-link and metadata notes

- Blog cluster links already connect Instagram, YouTube, Facebook, LinkedIn, and X content to their canonical commercial pages using varied descriptive anchors.
- Facebook Views has relevant links to Facebook followers, Facebook likes, and filtered package discovery. The canonical page retains a focused India title and description with public-link ordering, transparent pricing, tracking, and no-password information.
- No metadata was keyword-expanded in this sprint; the existing titles already use natural India phrasing on canonical commercial pages.

## Technical checks to retain

- Sitemap must contain only canonical, indexable URLs. Do not add `noindex` service URLs back to it.
- Private, authentication, checkout, dashboard, admin, and API routes remain blocked from crawling through `robots.txt` and/or `X-Robots-Tag` middleware controls.
- Do not alter checkout, payments, wallet, order, catalog, dashboard, auth, admin, database, or API logic as part of SEO work.
- Before creating a new indexed service page, validate current catalog availability, intent separation, Search Console demand, canonical ownership, unique helpful content, and relevant internal links.

## Next measurement loop

Use Search Console data to validate impressions, clicks, average position, and query overlap for the parent platform clusters. Prioritize an additional page only when it earns a clear commercial or informational intent case without competing with a canonical page. Review technical coverage after deployment for the Facebook Views redirect, sitemap exclusion, canonical output, and broken internal links.
