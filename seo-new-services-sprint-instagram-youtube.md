# SEO sprint: Instagram and YouTube services

## Page audit

| URL | Primary target keyword | Title before → after | H1 before → after | Meta before → after | Canonical / indexability / sitemap | Internal links added | Duplicate-route result | Significant content / FAQ changes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/buy-instagram-comments-india` | buy instagram comments india | `Buy Instagram Comments India | SocialRUSH` → unchanged | `Buy Instagram Comments in India` → unchanged | Page-specific public-post/Reel, pricing and tracking description → unchanged | Self-canonical; `index, follow`; once through India-service sitemap set | Existing Services card and related Instagram service links retained | No competing public route found | Existing visible, service-specific FAQs and matching FAQ schema retained. |
| `/buy-instagram-saves-india` | buy instagram saves india | `Buy Instagram Saves in India | SocialRUSH` → `Buy Instagram Saves India | SocialRUSH` | `Buy Instagram Saves in India` → unchanged | Page-specific public-post/Reel, pricing and tracking description → unchanged | Self-canonical; `index, follow`; once through India-service sitemap set | Existing Services card and related Instagram service links retained; added from Instagram engagement guide | No competing public route found | Existing visible saves FAQ and matching FAQ schema retained, including the no-guaranteed-reach answer. |
| `/buy-instagram-shares-india` | buy instagram shares india | `Buy Instagram Shares in India | SocialRUSH` → `Buy Instagram Shares India | SocialRUSH` | `Buy Instagram Shares in India` → unchanged | Page-specific public-post/Reel, pricing and tracking description → unchanged | Self-canonical; `index, follow`; once through India-service sitemap set | Existing Services card and related Instagram service links retained; added from Instagram engagement guide | No competing public route found | Existing visible shares FAQ and matching FAQ schema retained, including the no-guaranteed-reach answer. |
| `/buy-youtube-watch-hours-india` | buy youtube watch hours india | `Buy YouTube Watch Hours India | Live Watch-Time Service | SocialRUSH` → `Buy YouTube Watch Hours India | SocialRUSH` | `Buy YouTube Watch Hours in India` → unchanged | Public-video ordering, live pricing, estimate and tracking description → unchanged | Self-canonical; `index, follow`; explicit single sitemap entry | Existing Services card and related YouTube service links retained; added from YouTube channel-readiness guide | No competing public route found | Existing public-video requirements, estimate explanation, FAQ schema and visible monetization disclaimer retained. |
| `/buy-youtube-comments-india` | buy youtube comments india | `Buy YouTube Comments in India | Live Pricing | SocialRUSH` → `Buy YouTube Comments India | SocialRUSH` | `Buy YouTube Comments in India` → unchanged | Public-video ordering, live pricing, delivery and tracking description → unchanged | Self-canonical; `index, follow`; once through India-service sitemap set | Existing Services card and related YouTube service links retained; added from YouTube channel-readiness guide | No competing public route found | First paragraph now explicitly covers Indian buyers, INR pricing, public-video ordering and no-password ordering. Existing visible, service-specific FAQ schema remains aligned. |

## Technical and content findings

- All five routes are indexable and are allowed by `robots.txt`.
- The Services hub maps each of the five live service codes to its canonical landing page. The Instagram and YouTube platform views also surface the new services contextually.
- Sitemap generation deduplicates routes. The four India-service routes are included via `indiaServiceSlugs`; Watch Hours has one explicit public-route entry.
- Breadcrumb and Service schema are present on every target page. FAQ schema is emitted only for FAQ content rendered on the corresponding page.
- Added contextual links from `instagram-followers-vs-engagement` to Instagram Comments, Saves and Shares, and from `how-to-promote-new-youtube-channel-in-india` to YouTube Comments and Watch Hours.

## YouTube Watch Hours monetization wording audit

The page states that YouTube independently determines eligible public watch hours, policy compliance, channel eligibility and Partner Program approval. It does not promise monetization, YPP acceptance, permanent watch hours, policy bypassing, rankings or guaranteed eligibility. No operational ordering instructions were changed.

## Files changed

- `app/buy-instagram-saves-india/page.tsx`
- `app/buy-instagram-shares-india/page.tsx`
- `app/(india-seo-services)/buy-youtube-watch-hours-india/page.tsx`
- `components/marketing/YouTubeCommentsWorkspace.tsx`
- `components/marketing/blog/blogData.ts`
- `lib/seo/india-service-pages.ts`
- `seo-new-services-sprint-instagram-youtube.md`

## Validation

- `npx tsc --noEmit` — passed.
- `npm run lint` — passed with pre-existing `<img>` optimization warnings in unrelated marketing/tool components.
- `npm run build` — passed.
- `git diff --check` — passed.

## Intentionally unchanged

Pricing, service configuration, quantity limits, ordering, wallet/payment handling, support/refill behavior and dashboard flows were left untouched. Existing page design and already-accurate page-specific FAQs were preserved rather than duplicated or expanded with repetitive SEO copy.
