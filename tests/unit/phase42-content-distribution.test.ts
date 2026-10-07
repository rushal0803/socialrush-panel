import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildDistributionShareUrl,
  buildTrackedDistributionUrl,
  distributionChannels,
} from "../../lib/marketing/content-distribution.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 42 builds channel-specific tracked URLs on the canonical origin", () => {
  const linkedIn = new URL(buildTrackedDistributionUrl({
    path: "/blog/example-guide",
    channel: "linkedin",
    content: "Example Guide",
  }));

  assert.equal(linkedIn.origin, "https://www.getsocialrush.com");
  assert.equal(linkedIn.pathname, "/blog/example-guide");
  assert.equal(linkedIn.searchParams.get("utm_source"), "linkedin");
  assert.equal(linkedIn.searchParams.get("utm_medium"), "social");
  assert.equal(linkedIn.searchParams.get("utm_campaign"), "content_distribution");
  assert.equal(linkedIn.searchParams.get("utm_content"), "example-guide");

  assert.equal(distributionChannels.whatsapp.medium, "messaging");
  assert.equal(distributionChannels.community.medium, "referral");
});

test("Phase 42 refuses to distribute an external destination", () => {
  assert.throws(
    () => buildTrackedDistributionUrl({
      path: "https://example.com/article",
      channel: "x",
      content: "external",
    }),
    /canonical origin/,
  );
});

test("Phase 42 creates channel composer URLs from tracked destinations", () => {
  const trackedUrl = buildTrackedDistributionUrl({
    path: "/blog/example-guide",
    channel: "x",
    content: "example-guide",
  });
  assert.match(
    buildDistributionShareUrl({ channel: "x", trackedUrl, title: "Example guide" }),
    /twitter\.com\/intent\/tweet/,
  );
  assert.match(
    buildDistributionShareUrl({ channel: "linkedin", trackedUrl, title: "Example guide" }),
    /linkedin\.com\/sharing\/share-offsite/,
  );
  assert.match(
    buildDistributionShareUrl({ channel: "whatsapp", trackedUrl, title: "Example guide" }),
    /wa\.me/,
  );
});

test("Phase 42 publishes and advertises an RSS feed", () => {
  const feed = read("app/feed.xml/route.ts");
  const layout = read("app/layout.tsx");
  assert.match(feed, /application\/rss\+xml; charset=utf-8/);
  assert.match(feed, /uniqueArticlesBySlug\(blogArticles\)/);
  assert.match(feed, /!article\.redirectTo/);
  assert.match(feed, /atom:link/);
  assert.match(layout, /"application\/rss\+xml": "\/feed\.xml"/);
});

test("Phase 42 keeps reader shares canonical while admin shares are tracked", () => {
  const reader = read("components/marketing/blog/BlogArticleEnhancements.tsx");
  const admin = read("app/admin/crm/distribution/page.tsx");
  assert.match(reader, /encodeURIComponent\(articleUrl\)/);
  assert.match(reader, />WhatsApp</);
  assert.match(reader, />LinkedIn</);
  assert.match(reader, />X</);
  assert.match(admin, /buildTrackedDistributionUrl/);
  assert.match(admin, /buildDistributionShareUrl/);
  assert.match(admin, /does not auto-post, fabricate reach/);
});
