import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { getServicePageCroConfig } from "../../lib/cro/service-page-cro.ts";
import { getInstagramCommentsOrderReadiness, isOrderableInstagramCommentsService } from "../../lib/cro/instagram-comments-order.ts";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 32 routes safe static services into the inline builder", () => {
  const config = getServicePageCroConfig({
    platform: "facebook",
    code: "facebook-shares",
    pricePer1000: 499,
    minQuantity: 100,
    maxQuantity: 100000,
  });
  assert.equal(config.mode, "inline-builder");
  assert.equal(config.primaryHref, "#order-builder");
  assert.equal(config.primaryLabel, "Build Your Order");
  assert.equal(config.canShowStaticPrice, true);
});

test("Phase 32 keeps protected live-fact services out of static pricing", () => {
  const config = getServicePageCroConfig({
    platform: "x",
    code: "twitter-likes",
    pricePer1000: 499,
    minQuantity: 100,
    maxQuantity: 100000,
    requiresLiveCatalogFacts: true,
  });
  assert.equal(config.mode, "live-dashboard");
  assert.match(config.primaryHref, /^\/dashboard\/new-order\?/);
  assert.match(config.primaryHref, /platform=x/);
  assert.match(config.primaryHref, /service=twitter-likes/);
  assert.equal(config.canShowStaticPrice, false);
});

test("Phase 32 treats invalid or zero static catalog ranges as live-order only", () => {
  for (const service of [
    { pricePer1000: 0, minQuantity: 100, maxQuantity: 1000 },
    { pricePer1000: 499, minQuantity: 0, maxQuantity: 0 },
    { pricePer1000: 499, minQuantity: 1000, maxQuantity: 100 },
  ]) {
    const config = getServicePageCroConfig({ platform: "x", code: "service", ...service });
    assert.equal(config.mode, "live-dashboard");
    assert.equal(config.canShowStaticPrice, false);
  }
});

test("Phase 32 generic service pages use exact-service CRO instead of broad package-only handoff", () => {
  const page = read("app/services/[slug]/page.tsx");
  assert.match(page, /getServicePageCroConfig/);
  assert.match(page, /data-service-primary-cta/);
  assert.match(page, /data-service-cro-mode="inline-builder"/);
  assert.match(page, /data-service-cro-mode="live-dashboard"/);
  assert.match(page, /<ServiceLandingOrderBuilder service=\{catalogService\} compact/);
  assert.match(page, /<ServiceOrderStickyCta/);
  assert.match(page, /Live pricing in secure order/);
  assert.match(page, /protected live catalog facts/);
});

test("Phase 32 shared order card keeps neutral merchandising and service-specific instructions", () => {
  const card = read("components/marketing/services/ServiceOrderCard.tsx");
  assert.match(card, /buildQuantityMerchandising/);
  assert.match(card, /option\.label/);
  assert.match(card, /data-cro-service-instruction/);
  assert.doesNotMatch(card, /most popular|best seller|limited time|only \d+ left|save \d+%|discount/i);
});

test("Phase 3 service landing pages retain accessible order builders and their mobile action docks", () => {
  const likes = read("app/(india-seo-services)/buy-instagram-likes-india/page.tsx");
  const linkedIn = read("components/marketing/LinkedInFollowersLanding.tsx");
  const views = read("components/marketing/YouTubeViewsLanding.tsx");

  assert.match(likes, /<InstagramLikesOrderPanel compact/);
  assert.match(likes, /Choose Likes &amp; See Total/);
  assert.match(likes, /ServiceOrderStickyCta href="#packages"/);
  assert.match(likes, /startingPrice=\{service\?\.pricePer1000\}/);

  assert.match(linkedIn, /function OrderBuilder\(/);
  assert.match(linkedIn, /id="order"/);
  assert.match(linkedIn, /Choose Followers &amp; See Total/);
  assert.match(linkedIn, /ServiceOrderStickyCta href="#order"/);

  assert.match(views, /function OrderBuilder\(/);
  assert.match(views, /id="packages"/);
  assert.match(views, /Choose Views &amp; See Total/);
  assert.match(views, /ServiceOrderStickyCta href="#packages"/);
  assert.doesNotMatch(views, /orderHref="#order"/);
});

test("Phase 3 flagship previews do not autoplay and Instagram followers preserve search entry heading", () => {
  const linkedIn = read("components/marketing/LinkedInFollowersLanding.tsx");
  const views = read("components/marketing/YouTubeViewsLanding.tsx");
  const instagram = read("app/buy-instagram-followers-india/page.tsx");

  assert.match(linkedIn, /\[playing, setPlaying\] = useState\(false\)/);
  assert.match(views, /\[playing, setPlaying\] = useState\(false\)/);
  assert.match(instagram, /Buy Instagram Followers <span[^>]+>India<\/span>/);
});

test("Shared catalog detail landings keep inline order and mobile CTA on the same guarded route", () => {
  const page = read("components/marketing/services/PremiumCatalogServiceLanding.tsx");
  assert.match(page, /const usesInlineOrderBuilder = canStartOrder && !\/custom-comments\|endorsements\|poll-votes\//);
  assert.match(page, /const primaryOrderHref = usesInlineOrderBuilder \? "#order-builder" : orderHref/);
  assert.match(page, /<section id="order-builder" className="min-w-0 scroll-mt-28">/);
  assert.match(page, /<ServiceOrderCard service=\{service\}/);
  assert.match(page, /<ServiceOrderStickyCta href=\{primaryOrderHref\}/);
  assert.match(page, /available=\{canStartOrder\}/);
  assert.match(page, /This service is currently unavailable/);
  assert.match(page, /<Link href="\/services"/);
  assert.doesNotMatch(page, /\{usesInlineOrderBuilder \? <section className="mt-6"><aside/);
});

test("Service readiness counts remain compatible with existing public order smoke tests", () => {
  const card = read("components/marketing/services/ServiceOrderCard.tsx");
  assert.match(card, /\/3 ready/);
  assert.match(card, /data-cro-readiness/);
  assert.match(card, /Review current INR price before payment/);
});

test("All fallback catalog detail links have a dedicated route rather than an unknown slug", () => {
  const catalog = read("lib/smm-service-catalog.ts");
  const directory = read("components/marketing/services/ServicesPageContent.tsx");
  const codes = [...catalog.matchAll(/code:\s*"([a-z0-9-]+)"/g)].map(match => match[1]);
  const pathMap = directory.match(/const servicePaths: Record<string, string> = \{([\s\S]*?)\};/);
  assert.ok(pathMap, "The canonical detail route ownership map must exist");
  const explicitCodes = new Set([...pathMap![1].matchAll(/"([a-z0-9-]+)":\s*"\/[^"]+"/g)].map(match => match[1]));
  const fallbackCodes = codes.filter(code => !explicitCodes.has(code));

  assert.equal(codes.length, 43, "Treat catalog additions as route coverage changes");
  assert.equal(explicitCodes.size, 21);
  assert.equal(fallbackCodes.length, 22);
  for (const code of fallbackCodes) {
    assert.ok(existsSync(new URL(`../../app/services/${code}/page.tsx`, import.meta.url)), `${code}: missing /services/${code} detail route`);
  }
});

test("Instagram Comments cannot show checkout as ready with missing or invalid public live facts", () => {
  const good={available:true,rate:799,min:100,max:100000};
  for (const bad of [null,{...good,available:false},{...good,rate:0},{...good,rate:-1},{...good,rate:NaN},{...good,min:0},{...good,max:99},{...good,max:100.5}]) {
    assert.equal(isOrderableInstagramCommentsService(bad),false);
    assert.deepEqual(getInstagramCommentsOrderReadiness(bad,1000,true),{serviceReady:false,quantityReady:false,total:null,canContinue:false});
  }
  assert.deepEqual(getInstagramCommentsOrderReadiness(good,1000,true),{serviceReady:true,quantityReady:true,total:799,canContinue:true});
  assert.equal(getInstagramCommentsOrderReadiness(good,100,true).total,79.9);
  for(const q of [0,99,100001,100.5,Infinity]){
    assert.equal(getInstagramCommentsOrderReadiness(good,q,true).canContinue,false);
    assert.equal(getInstagramCommentsOrderReadiness(good,q,true).total,null);
  }
  assert.equal(getInstagramCommentsOrderReadiness(good,1000,false).canContinue,false);
});

test("Instagram Comments displays unavailable pricing, prevents submit and preserves accurate per-1K schema",()=>{
  const landing=read("components/marketing/InstagramCommentsLanding.tsx");
  const page=read("app/buy-instagram-comments-india/page.tsx");
  assert.match(landing,/getInstagramCommentsOrderReadiness\(live,q,/);
  assert.match(landing,/disabled=\{!serviceReady\}/);
  assert.match(landing,/readiness\.total===null\?"—"/);
  assert.match(landing,/serviceReady\?"Available":"Live details unavailable"/);
  assert.match(page,/isOrderableInstagramCommentsService\(live\)/);
  assert.match(page,/referenceQuantity/);
});

test("Instagram Comments campaign preview does not falsely claim readiness when live facts are missing", () => {
  const landing = read("components/marketing/InstagramCommentsLanding.tsx");
  assert.match(landing, /\["Status",serviceReady\?"Ready to configure":"Live service details unavailable"\]/);
  assert.match(landing, /\["Quantity",serviceReady\?n\(qty\):"—"\]/);
  assert.match(landing, /Service setup is paused until live pricing and availability can be verified/);
  assert.match(landing, /serviceReady\?"border-emerald-400\/25/);
  assert.doesNotMatch(landing, /\["Status","Ready to configure"\]/);
});
