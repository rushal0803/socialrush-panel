import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getIndiaServiceMetadata } from "../../lib/seo/india-service-pages.ts";

const source = readFileSync("lib/seo/india-service-pages.ts", "utf8");
const route = readFileSync("app/(india-seo-services)/buy-telegram-members-india/page.tsx", "utf8");

test("Telegram Members route uses shared service metadata and landing", () => {
  const metadata = getIndiaServiceMetadata("buy-telegram-members-india");
  assert.ok(metadata.title);
  assert.match(route, /getIndiaServiceMetadata\("buy-telegram-members-india"\)/);
  assert.match(route, /IndiaServiceLandingPage slug="buy-telegram-members-india"/);
});

test("Telegram Members buyer copy avoids unverified engagement and geo promises", () => {
  const start = source.indexOf('"buy-telegram-members-india": {');
  const end = source.indexOf('"buy-tiktok-followers-india": {', start);
  const section = source.slice(start, end);
  assert.ok(section.length > 200);
  assert.match(section, /public link is accessible/);
  assert.match(section, /live INR total/);
  assert.match(section, /does not guarantee India-based members/);
  assert.match(section, /login code or admin credentials/);
  assert.match(section, /does not prove an active community/);
});
