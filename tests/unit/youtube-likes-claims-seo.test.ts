import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const data = readFileSync("lib/seo/india-service-pages.ts", "utf8");
const route = readFileSync("app/(india-seo-services)/buy-youtube-likes-india/page.tsx", "utf8");
const landing = readFileSync("components/marketing/YouTubeLikesLanding.tsx", "utf8");

test("YouTube Likes route retains metadata, existing landing, and truthful FAQ", () => {
  assert.match(route, /getIndiaServiceMetadata\("buy-youtube-likes-india"\)/);
  assert.match(route, /<YouTubeLikesLanding/);
  assert.match(route, /Likes do not guarantee ranking, reach/);
  assert.match(landing, /Likes alone do not guarantee organic reach/);
});

test("YouTube Likes service copy does not promise authentic engagement", () => {
  const i = data.indexOf('"buy-youtube-likes-india": {');
  const j = data.indexOf('"buy-youtube-views-india": {', i);
  const page = data.slice(i,j);
  assert.ok(page.length > 200);
  assert.match(page, /Displayed like counts alone do not prove authentic engagement/);
  assert.match(page, /Review YouTube Analytics/);
});
