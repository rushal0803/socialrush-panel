import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 16 maps comparison guides to the services they actually discuss", () => {
  const graph = read("lib/seo/authority-graph.ts");

  assert.match(
    graph,
    /"\/blog\/instagram-followers-vs-likes-india": \["\/buy-instagram-followers-india", "\/instagram-likes"\]/,
  );
  assert.match(
    graph,
    /"\/blog\/instagram-followers-vs-engagement": \["\/buy-instagram-followers-india", "\/instagram-likes", "\/instagram-views"\]/,
  );
  assert.match(
    graph,
    /"\/blog\/youtube-subscribers-vs-views-india": \["\/youtube-subscribers", "\/youtube-views"\]/,
  );
  assert.match(
    graph,
    /"\/blog\/facebook-followers-vs-engagement-india": \["\/buy-facebook-followers-india", "\/facebook-likes", "\/facebook-views"\]/,
  );
  assert.match(
    graph,
    /"\/blog\/linkedin-followers-vs-engagement-india": \["\/linkedin-followers", "\/linkedin-likes"\]/,
  );
});

test("Phase 16 brings the Instagram engagement guide into the canonical authority cluster", () => {
  const clusters = read("lib/seo/content-clusters.ts");
  assert.match(
    clusters,
    /\{ label: "Instagram followers vs engagement", href: "\/blog\/instagram-followers-vs-engagement" \}/,
  );
});

test("Phase 16 makes article next steps guide-aware", () => {
  const page = read("app/blog/[slug]/page.tsx");
  const bridge = read("components/marketing/blog/ContentAuthorityBridge.tsx");

  assert.match(page, /getGuideAuthorityTargets\(articlePlatform, `\/blog\/\$\{article\.slug\}`\)/);
  assert.match(bridge, /getGuideAuthorityTargets\(toPlatform\(platform\), `\/blog\/\$\{articleSlug\}`\)/);
});

test("Phase 16 authority audit rejects wrong-platform mappings and missing guide edges", () => {
  const checker = read("scripts/seo-authority-graph-check.ts");
  assert.match(checker, /mapped guide is missing from contentClusters/);
  assert.match(checker, /mapped service is outside the/);
  assert.match(checker, /missing guide-to-service edge/);
});
