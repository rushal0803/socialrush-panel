import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(new URL("../../scripts/seo-instagram-technical-check.mjs", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../../.github/workflows/seo-health-monitor.yml", import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

const importantInstagramPaths = [
  "/instagram-growth-india",
  "/buy-instagram-followers-india",
  "/instagram-likes",
  "/instagram-views",
  "/buy-instagram-comments-india",
  "/buy-instagram-saves-india",
  "/buy-instagram-shares-india",
  "/blog/how-to-grow-instagram-followers-organically-india",
  "/blog/instagram-followers-price-in-india",
  "/blog/is-it-safe-to-buy-instagram-followers",
  "/blog/instagram-followers-vs-engagement",
  "/blog/why-instagram-followers-drop",
  "/blog/instagram-followers-vs-likes-india",
  "/tools/instagram-engagement-rate-calculator",
  "/tools/instagram-follower-growth-rate-calculator",
  "/tools/instagram-reach-rate-calculator",
  "/tools/instagram-story-engagement-rate-calculator",
  "/tools/instagram-caption-counter",
];

test("phase 16 monitors every important Instagram canonical", () => {
  for (const path of importantInstagramPaths) {
    assert.ok(script.includes(`path: "${path}"`), `${path} must be monitored`);
  }
});

test("phase 16 checks the technical signals required by the roadmap", () => {
  for (const signal of [
    "expected HTTP 200",
    "page is marked noindex",
    "server-rendered title or H1 is missing",
    "soft-404 wording detected",
    "structured data missing @type",
    "tracking-query variant does not consolidate to clean canonical",
    "trailing-slash variant is not permanently normalized",
    "Instagram aliases",
    "canonical host redirects non-www Instagram URL to www",
    "internal links resolve across",
  ]) {
    assert.ok(script.includes(signal), `missing technical check: ${signal}`);
  }
});

test("phase 16 validates canonical Instagram redirect aliases", () => {
  const redirects = [
    ["/buy-instagram-followers", "/buy-instagram-followers-india"],
    ["/instagram-followers", "/buy-instagram-followers-india"],
    ["/services/instagram-followers", "/buy-instagram-followers-india"],
    ["/buy-instagram-likes-india", "/instagram-likes"],
    ["/services/instagram-likes", "/instagram-likes"],
    ["/buy-instagram-views-india", "/instagram-views"],
    ["/services/instagram-views", "/instagram-views"],
  ] as const;

  for (const [source, target] of redirects) {
    assert.ok(script.includes(`["${source}", "${target}"]`));
  }
});

test("phase 16 production audit is wired into the weekly monitor and npm scripts", () => {
  assert.match(workflow, /node scripts\/seo-instagram-technical-check\.mjs/);
  assert.equal(packageJson.scripts["seo:instagram-tech"], "node scripts/seo-instagram-technical-check.mjs");
  assert.match(packageJson.scripts["test:unit"], /phase16-technical-seo\.test\.ts/);
});
