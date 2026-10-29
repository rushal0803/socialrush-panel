import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const data = readFileSync("lib/seo/india-service-pages.ts", "utf8");
const route = readFileSync("app/(india-seo-services)/buy-linkedin-likes-india/page.tsx", "utf8");
const landing = readFileSync("components/marketing/services/IndiaServiceLandingPage.tsx", "utf8");

test("LinkedIn Likes retains the shared canonical metadata and rendered landing", () => {
  assert.match(route, /getIndiaServiceMetadata\("buy-linkedin-likes-india"\)/);
  assert.match(route, /IndiaServiceLandingPage slug="buy-linkedin-likes-india"/);
  assert.match(landing, /getIndiaServicePage/);
});

test("LinkedIn Likes buyer copy makes no authentic engagement or geo guarantees", () => {
  const i = data.indexOf('"buy-linkedin-likes-india": {');
  const j = data.indexOf('"buy-twitter-followers-india": {', i);
  const section = data.slice(i, j);
  assert.ok(section.length > 250);
  assert.match(section, /Displayed likes alone do not establish authentic professional interest/);
  assert.match(section, /publicly accessible LinkedIn post URL/);
  assert.match(section, /live INR total/);
  assert.match(section, /does not guarantee likes from Indian accounts/);
});
