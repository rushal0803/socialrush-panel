import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 23 avoids fetching FX rates while INR already has a usable rate", () => {
  const source = read("lib/currency/use-currency.ts");
  assert.match(source, /if \(hasRate\(rates, currency\)\)/);
  assert.match(source, /fetch\("\/api\/fx-rates"/);
});

test("Phase 23 defers geo currency detection until the browser is idle", () => {
  const source = read("lib/currency/use-currency.ts");
  assert.match(source, /requestIdleCallback\(detectCurrency/);
  assert.match(source, /setTimeout\(detectCurrency, 1500\)/);
});

test("Phase 23 throttles public pointer effects to animation frames and skips coarse pointers", () => {
  const source = read("components/marketing/InteractiveHomepageShell.tsx");
  assert.match(source, /matchMedia\("\(hover: hover\) and \(pointer: fine\)"\)/);
  assert.match(source, /requestAnimationFrame/);
  assert.doesNotMatch(source, /window\.addEventListener\("pointermove"/);
});


test("Phase 23 keeps crawl-priority SEO links outside the large homepage client boundary", () => {
  const homepage = read("components/marketing/PremiumHomepage.tsx");
  const page = read("app/page.tsx");
  assert.doesNotMatch(homepage, /CrawlPriorityLinks/);
  assert.match(page, /<CrawlPriorityLinks \/>/);
});

test("Phase 23 defers service health until popular services approach the viewport", () => {
  const source = read("components/marketing/PremiumHomepage.tsx");
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /rootMargin: "700px 0px"/);
  assert.match(source, /requestIdleCallback\(loadHealth/);
  assert.match(source, /controller\.abort\(\)/);
});

test("Phase 23 avoids a second Framer scroll observer in the homepage experience frame", () => {
  const source = read("components/marketing/HomepageExperienceFrame.tsx");
  assert.doesNotMatch(source, /from "framer-motion"/);
  assert.doesNotMatch(source, /useScroll/);
  assert.match(source, /prefers-reduced-motion: reduce/);
});

test("Phase 23 defers local-storage personalization until the browser is idle", () => {
  const source = read("components/marketing/cro/DeferredPersonalizationShelf.tsx");
  const homepage = read("components/marketing/HomepageContent.tsx");
  assert.match(source, /dynamic\(\(\) => import\("\.\/PersonalizationShelf"\)/);
  assert.match(source, /ssr: false/);
  assert.match(source, /requestIdleCallback\(reveal/);
  assert.match(source, /setTimeout\(reveal, 1200\)/);
  assert.match(homepage, /DeferredPersonalizationShelf/);
});

test("Phase 23 caches public service-health database reads for short bursts", () => {
  const source = read("app/api/service-health/route.ts");
  assert.match(source, /unstable_cache/);
  assert.match(source, /\["public-service-health"\]/);
  assert.match(source, /revalidate: 30/);
  assert.match(source, /stale-while-revalidate=60/);
});

test("Phase 23 lazily decodes external UPI QR images", () => {
  const source = read("components/wallet/DesktopUpiQrCheckout.tsx");
  const lazyImages = source.match(/loading="lazy" decoding="async" referrerPolicy="no-referrer"/g) ?? [];
  assert.equal(lazyImages.length, 2);
});
