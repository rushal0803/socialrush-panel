import test from "node:test";
import assert from "node:assert/strict";
import { contentClusters, getContentCluster, isContentClusterPath } from "../../lib/seo/content-clusters.ts";

test("every priority platform has one broad, crawlable content hub", () => {
  assert.deepEqual(Object.keys(contentClusters).sort(), ["facebook", "instagram", "linkedin", "tiktok", "twitter", "youtube"]);
  for (const cluster of Object.values(contentClusters)) {
    assert.match(cluster.hubPath, /^\/[a-z-]+$/);
    assert.ok(cluster.serviceLinks.length > 0);
    assert.equal(new Set(cluster.serviceLinks.map((link) => link.href)).size, cluster.serviceLinks.length);
    assert.equal(isContentClusterPath(cluster.hubPath), true);
  }
});

test("cluster lookups do not create a fallback commercial destination", () => {
  assert.equal(getContentCluster(null), null);
  assert.equal(getContentCluster("instagram")?.hubPath, "/instagram-growth-india");
  assert.equal(getContentCluster("twitter")?.hubPath, "/x-growth-india");
});
