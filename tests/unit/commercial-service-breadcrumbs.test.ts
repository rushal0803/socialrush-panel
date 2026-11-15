import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { getCommercialServiceBreadcrumbs, hasRouteOwnedCommercialBreadcrumb } from "../../lib/seo/commercial-service-breadcrumbs.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("commercial breadcrumb hubs point to existing pages instead of invented routes", () => {
  for (const platform of ["Instagram", "YouTube", "Facebook", "LinkedIn", "Telegram", "TikTok", "Twitter", "Unknown"]) {
    const trail = getCommercialServiceBreadcrumbs(platform, "Example service", "/example-service");
    assert.equal(trail[0].path, "/");
    assert.equal(trail[2].path, "/example-service");
    assert.ok(existsSync(new URL(`../../app${trail[1].path}/page.tsx`, import.meta.url)), `${platform}: ${trail[1].path}`);
  }
  assert.deepEqual(getCommercialServiceBreadcrumbs("Telegram", "Telegram Members", "/telegram-members"), [
    { name: "Home", path: "/" }, { name: "Telegram Services", path: "/services/telegram" }, { name: "Telegram Members", path: "/telegram-members" },
  ]);
});

test("route-owned breadcrumb trails are not emitted again by the shared helper", () => {
  for (const path of ["/linkedin-followers", "/twitter-followers", "/tiktok-followers"]) assert.equal(hasRouteOwnedCommercialBreadcrumb(path), true);
  for (const path of ["/instagram-likes", "/telegram-members", "/youtube-subscribers"]) assert.equal(hasRouteOwnedCommercialBreadcrumb(path), false);
  assert.match(read("components/seo/IndiaCommercialServiceJsonLd.tsx"), /!hasRouteOwnedCommercialBreadcrumb\(path\)/);
});

test("Telegram visible and structured breadcrumbs consume the same canonical trail", () => {
  const helper = read("components/seo/IndiaCommercialServiceJsonLd.tsx");
  const landing = read("components/marketing/TelegramFollowersLanding.tsx");
  assert.match(helper, /items=\{getCommercialServiceBreadcrumbs\(platform, name, path\)\}/);
  assert.match(landing, /getCommercialServiceBreadcrumbs\("Telegram", "Telegram Members", "\/telegram-members"\)/);
  assert.match(landing, /aria-label="Breadcrumb"/);
  assert.match(landing, /breadcrumbs.map/);
  assert.match(landing, /href=\{item.path\}/);
  assert.match(landing, /aria-current="page"/);
});
