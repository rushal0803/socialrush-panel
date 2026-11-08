// These audited URLs have dedicated route files and tailored metadata.
// Do not prerender them a second time through /services/[slug].
export const dedicatedCatalogBatchSlugs = new Set([
  "twitter-likes", "twitter-views", "twitter-retweets", "twitter-crypto-followers",
]);
