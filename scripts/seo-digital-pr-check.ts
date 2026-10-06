import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  buildDigitalPrSnapshot,
  digitalPrAssets,
  digitalPrGuardrails,
} from "../lib/seo/digital-pr.ts";

const failures: string[] = [];
const snapshot = buildDigitalPrSnapshot();

if (snapshot.duplicatePaths.length) {
  failures.push(`Duplicate Digital PR asset paths: ${snapshot.duplicatePaths.join(", ")}`);
}
if (snapshot.missingLaneAssets.length) {
  failures.push(
    `Outreach lanes reference missing assets: ${snapshot.missingLaneAssets
      .map((item) => `${item.lane}:${item.assetId}`)
      .join(", ")}`,
  );
}

const sitemapSource = readFileSync(join(process.cwd(), "app", "sitemap.xml", "route.ts"), "utf8");
const blogDir = join(process.cwd(), "components", "marketing", "blog");
const blogSources = readdirSync(blogDir)
  .filter((name) => name.endsWith(".ts"))
  .map((name) => readFileSync(join(blogDir, name), "utf8"))
  .join("\n");

for (const asset of digitalPrAssets) {
  if (!asset.path.startsWith("/") || asset.path.includes("?") || asset.path.includes("#")) {
    failures.push(`${asset.id}: asset path must be a clean root-relative URL (${asset.path})`);
  }

  if (asset.path.startsWith("/blog/")) {
    const slug = asset.path.replace("/blog/", "");
    if (!new RegExp(`\\bslug:\\s*["']${slug.replace(/[.*+?^$\{\}()|[\\]\\]/g, "\\$&")}["']`).test(blogSources)) {
      failures.push(`${asset.id}: blog asset is not backed by a published article slug (${asset.path})`);
    }
  } else if (!sitemapSource.includes(`"${asset.path}"`)) {
    failures.push(`${asset.id}: linkable asset is not explicitly discoverable in sitemap source (${asset.path})`);
  }

  if (asset.suggestedAnchors.length < 3) {
    failures.push(`${asset.id}: provide at least three natural anchor variants`);
  }

  for (const anchor of asset.suggestedAnchors) {
    if (/\bbuy\b/i.test(anchor)) {
      failures.push(`${asset.id}: commercial exact-match anchor is not allowed (${anchor})`);
    }
  }
}

const registryText = [
  ...digitalPrAssets.flatMap((asset) => [asset.pitchAngle, asset.evidenceNote, ...asset.suggestedAnchors]),
  ...digitalPrGuardrails,
].join("\n");

for (const prohibited of [
  /guaranteed rankings?/i,
  /guaranteed traffic/i,
  /guaranteed leads?/i,
  /guaranteed revenue/i,
  /paid dofollow placement/i,
  /private blog network|\bPBNs?\b/i,
]) {
  if (prohibited.test(registryText) && !digitalPrGuardrails.some((rule) => prohibited.test(rule) && /\bno\b/i.test(rule))) {
    failures.push(`Digital PR registry contains a prohibited outreach promise or tactic: ${prohibited}`);
  }
}

const pressSource = readFileSync(join(process.cwd(), "app", "press", "page.tsx"), "utf8");
if (!/Earned coverage only\./.test(pressSource)) {
  failures.push("Public press page must state the earned-coverage standard.");
}
if (!/fabricated customer stories|unsupported ranking claims/.test(pressSource)) {
  failures.push("Public press page must preserve factual-evidence guardrails.");
}

if (failures.length) {
  console.error("Phase 41 Digital PR check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `PASS  ${snapshot.summary.assets} linkable assets and ${snapshot.summary.lanes} outreach lanes pass Phase 41 earned-link guardrails.`,
  );
}
