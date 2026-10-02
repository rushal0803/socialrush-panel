import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

const globals = read("app/globals.css");
const viewsPreview = read("components/marketing/InstagramViewsInteractivePreview.tsx");
const pwa = read("components/pwa/PwaClient.tsx");

const serverPages = [
  "app/buy-instagram-followers-india/page.tsx",
  "app/(india-seo-services)/buy-instagram-likes-india/page.tsx",
  "app/(india-seo-services)/buy-instagram-views-india/page.tsx",
];

const cwvTemplates = [
  ...serverPages,
  "components/marketing/InstagramCommentsLanding.tsx",
  "components/marketing/services/InstagramSavesLanding.tsx",
  "components/marketing/services/InstagramSharesLanding.tsx",
];

test("phase 18 keeps the Instagram commercial templates on the CWV containment path", () => {
  for (const path of cwvTemplates) {
    assert.match(read(path), /instagram-cwv-page/, path + " must opt into the Instagram CWV containment rules");
  }
  assert.ok(globals.includes(".instagram-cwv-page > section:nth-of-type(n + 4)"));
  assert.ok(globals.includes("content-visibility: auto"));
  assert.ok(globals.includes("contain-intrinsic-size: auto 760px"));
});

test("phase 18 keeps the primary Instagram money-page shells server rendered", () => {
  for (const path of serverPages) {
    const source = read(path).trimStart();
    assert.ok(!source.startsWith('"use client"') && !source.startsWith("'use client'"), path + " must remain a server component");
  }
});

test("phase 18 removes timer-driven React rendering from the Instagram Views preview", () => {
  assert.doesNotMatch(viewsPreview, /setInterval|useEffect/);
  assert.match(viewsPreview, /instagram-reel-progress/);
  assert.match(viewsPreview, /instagram-reel-bar/);
  assert.match(globals, /@keyframes instagram-reel-progress/);
  assert.match(globals, /@keyframes instagram-reel-bar/);
});

test("phase 18 defers non-critical service-worker registration", () => {
  assert.match(pwa, /requestIdleCallback/);
  assert.ok(pwa.includes("setTimeout(registerServiceWorker, 1500)"));
  assert.match(pwa, /registerServiceWorker/);
});

test("phase 18 does not add raster hero images or remote font loaders to the primary Instagram money pages", () => {
  for (const path of serverPages) {
    const source = read(path);
    assert.doesNotMatch(source, /<img\b/);
    assert.doesNotMatch(source, /next\/font\/(google|local)/);
  }
  assert.doesNotMatch(globals, /@import\s+url\([^)]*fonts\./i);
});
