import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("app/(india-seo-services)/buy-instagram-views-india/page.tsx", "utf8");
const shared = readFileSync("lib/seo/india-service-pages.ts", "utf8");
test("Instagram Views rendered route has canonical and truthful buyer guidance", () => {
  assert.match(route, /alternates:\{canonical:url\}/);
  assert.match(route, /Are viewers guaranteed to be from India\?/);
  assert.match(route, /Geographical targeting is not guaranteed/);
  assert.match(route, /will Instagram views increase followers, watch time or sales\?/i);
  assert.match(route, /Ready to review Instagram Reel view packages\?/);
  assert.doesNotMatch(route, /Ready to give your next Reel more visibility\?/);
});
test("shared Instagram Views metadata avoids guaranteed organic results", () => {
  const begin=shared.indexOf('"buy-instagram-views-india": {');
  const end=shared.indexOf('"buy-instagram-comments-india": {',begin);
  const section=shared.slice(begin,end);
  assert.ok(section.length>200);
  assert.match(section, /do not guarantee unique reach, watch time or organic discovery/);
  assert.match(section, /not proof of genuine viewer interest/);
});
