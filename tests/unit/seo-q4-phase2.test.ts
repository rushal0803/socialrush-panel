import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { searchDemandPriceGuideArticles } from "../../components/marketing/blog/searchDemandPriceGuides.ts";
import { gscRankingLinks, applyGscRankingLinks } from "../../components/marketing/blog/gscRankingLinks.ts";
import { getServiceById } from "../../lib/smm-service-catalog.ts";
import { buildQuantityPlanning } from "../../lib/seo/search-demand.ts";
import { linkedInFollowersFaqs } from "../../lib/seo/linkedin-followers.ts";

test("subscriber guide does not turn a static catalog rate into a current price", () => {
  const guide = searchDemandPriceGuideArticles.find(a => a.slug === "youtube-subscribers-price-in-india")!;
  assert.ok(guide);
  assert.doesNotMatch(JSON.stringify(guide), /₹[\d,]+|current catalog reference is/);
  assert.match(guide.sections[0].body, /5 × R.*10 × R/);
  assert.match(guide.intro, /live order.*INR total/);
  assert.ok(guide.sections[0].contextualLink?.href === "/youtube-subscribers");
  for (const faq of guide.faqs!.slice(0, 3)) assert.match(faq.answer, /live.*order.*INR total/);
});

test("unchanged follower pricing guides still derive rates from the maintained catalog", () => {
  for (const code of ["linkedin-followers", "facebook-followers", "x-followers", "telegram-members"]) {
    const slug = `${code === "x-followers" ? "twitter-followers" : code}-price-in-india`;
    const guide = searchDemandPriceGuideArticles.find(a => a.slug === slug)!;
    const rate = getServiceById(code)!.pricePer1000;
    assert.ok(guide.intro.includes(new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rate)));
  }
});

test("likes planning scales the maintained rate rather than duplicating price literals", () => {
  const rate = getServiceById("instagram-likes")!.pricePer1000;
  assert.deepEqual(buildQuantityPlanning(rate).map(row => row.total), [rate, rate * 5, rate * 10]);
  const source = readFileSync(new URL("../../app/(india-seo-services)/buy-instagram-likes-india/page.tsx", import.meta.url), "utf8");
  assert.match(source, /pricePer1000=\{service\?\.pricePer1000/);
  for (const component of ["SearchDemandPriceSection", "IndiaPaymentIntentSection", "DeliveryRefillIntentSection", "OrderRequirementsIntentSection"]) assert.match(source, new RegExp(`<${component}`));
});

test("contextual links target only selected published guides and established commercial URLs", () => {
  const blog = readFileSync(new URL("../../components/marketing/blog/blogData.ts", import.meta.url), "utf8");
  const priceGuides = readFileSync(new URL("../../components/marketing/blog/searchDemandPriceGuides.ts", import.meta.url), "utf8");
  const targets = new Set(["/instagram-likes", "/buy-instagram-followers-india", "/buy-facebook-followers-india", "/linkedin-followers", "/twitter-followers", "/youtube-subscribers"]);
  for (const [slug, link] of Object.entries(gscRankingLinks)) {
    assert.ok((blog + priceGuides).includes(`slug: "${slug}"`), `${slug} is published`);
    assert.ok(targets.has(link.href));
  }
});

test("contextual linking preserves existing paragraphs and does not add links to unrelated guides", () => {
  const article = searchDemandPriceGuideArticles.find(a => a.slug === "twitter-followers-price-in-india")!;
  const firstLink = article.sections[0].contextualLink;
  const updated = applyGscRankingLinks(article);
  assert.equal(updated.sections[0].contextualLink, firstLink);
  assert.deepEqual(updated.sections.map(s => s.body), article.sections.map(s => s.body));
  assert.equal(updated.sections.filter(s => s.contextualLink).length, article.sections.filter(s => s.contextualLink).length + 1);
  assert.equal(applyGscRankingLinks({ ...article, slug: "unrelated-guide" }).sections, article.sections);
});

test("company-page FAQ does not promise support from the profile service", () => {
  const faq = linkedInFollowersFaqs.find(f => /company page\?/.test(f.question))!;
  assert.match(faq.answer, /LinkedIn Profile Followers/);
  assert.match(faq.answer, /Do not assume.*confirm company-page support/);
});
