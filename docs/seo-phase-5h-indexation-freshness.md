# Phase 5H — Indexation & Search Freshness Engine

Audit date: 27 September 2026.

## Goal

Help search engines revisit the URLs that received significant Phase 5 changes without inventing freshness, duplicating URLs, or using deprecated Google sitemap-ping endpoints.

## Changes

- Added accurate sitemap `lastmod` values for URLs that received significant content, metadata, structured-data, internal-link, or search-intent changes during Phase 5.
- Added an IndexNow ownership key at the site root.
- Added a one-time Phase 5 IndexNow release workflow that waits for the production key file before submitting the changed URL set.
- The workflow also supports manual dispatch for a deliberate resubmission.
- Google discovery continues through the canonical sitemap and crawlable internal links.

## Integrity rules

- `lastmod` is a fixed significant-update date, not generated from request time.
- IndexNow URLs are canonical public URLs only.
- No dashboard, checkout, auth, admin, API, query-string, or redirect-alias URLs are submitted.
- IndexNow notification means a participating search engine has received the URL update; it does not guarantee crawl or indexation.
- The Google sitemap ping endpoint is not used.

## Measurement

When Search Console access is restored, compare crawl/indexation and query impressions after the Phase 5 release. Bing Webmaster Tools can be used to confirm IndexNow receipt.
