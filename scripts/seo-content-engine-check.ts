import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { contentClusters } from "../lib/seo/content-clusters.ts";
import { instagramContentGapCandidates } from "../lib/seo/instagram-content-gap.ts";
import { linkedInContentGapCandidates } from "../lib/seo/linkedin-content-gap.ts";

const failures: string[] = [];
const blogDir = join(process.cwd(), "components", "marketing", "blog");
const sourceFiles = readdirSync(blogDir)
  .filter((name) => name.endsWith(".ts"))
  .map((name) => join(blogDir, name));

const publishedSlugs = new Set<string>();
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/\bslug:\s*"([^"]+)"/g)) {
    publishedSlugs.add(match[1]);
  }
}

function blogSlug(path: string) {
  return path.match(/^\/blog\/([^/?#]+)$/)?.[1] ?? null;
}

for (const cluster of Object.values(contentClusters)) {
  const guidePaths = cluster.guideLinks
    .map((guide) => guide.href)
    .filter((href) => href.startsWith("/blog/"));

  if (new Set(guidePaths).size !== guidePaths.length) {
    failures.push(`${cluster.platform}: duplicate guide URL in content cluster`);
  }

  for (const path of guidePaths) {
    const slug = blogSlug(path);
    if (!slug || !publishedSlugs.has(slug)) {
      failures.push(`${cluster.platform}: cluster guide is not backed by a published article: ${path}`);
    }
  }
}

const gapCandidates = [
  ...instagramContentGapCandidates.map((candidate) => ({ source: "instagram", candidate })),
  ...linkedInContentGapCandidates.map((candidate) => ({ source: "linkedin", candidate })),
];

for (const { source, candidate } of gapCandidates) {
  if (candidate.decision === "defer" || !candidate.primaryTarget.startsWith("/blog/")) continue;
  const slug = blogSlug(candidate.primaryTarget);
  if (!slug || !publishedSlugs.has(slug)) {
    failures.push(`${source} gap ${candidate.id}: ${candidate.decision} target is missing: ${candidate.primaryTarget}`);
  }
}

const blogData = readFileSync(join(blogDir, "blogData.ts"), "utf8");
if (!/type BlogPlatform =[^;]*"tiktok"/.test(blogData)) {
  failures.push("blogData: TikTok is missing from BlogPlatform classification");
}
if (!/text\.includes\("tiktok"\)\) return "tiktok"/.test(blogData)) {
  failures.push("blogData: TikTok detection is missing from getBlogPlatform");
}

const tiktokCluster = contentClusters.tiktok;
if (tiktokCluster.guideLinks.some((guide) => /telegram/i.test(guide.label + " " + guide.href))) {
  failures.push("tiktok: unrelated Telegram guide leaked into the TikTok content cluster");
}

if (failures.length) {
  console.error("Phase 27 SEO content-engine check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  const guideCount = Object.values(contentClusters).reduce(
    (sum, cluster) => sum + cluster.guideLinks.filter((guide) => guide.href.startsWith("/blog/")).length,
    0,
  );
  console.log(`PASS  ${publishedSlugs.size} published article slugs found; ${guideCount} cluster guide links resolve to published content.`);
}
