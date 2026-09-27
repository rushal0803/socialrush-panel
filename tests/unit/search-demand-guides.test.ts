import assert from "node:assert/strict";
import test from "node:test";
import { searchDemandPriceGuideArticles } from "../../components/marketing/blog/searchDemandPriceGuides.ts";
import { indiaCheckoutMethods, paymentIntentFaq, paymentIntentKeywords } from "../../lib/seo/payment-intent.ts";

const expected = new Map([
  ["youtube-subscribers-price-in-india", "/youtube-subscribers"],
  ["linkedin-followers-price-in-india", "/linkedin-followers"],
  ["facebook-followers-price-in-india", "/buy-facebook-followers-india"],
  ["twitter-followers-price-in-india", "/twitter-followers"],
  ["telegram-members-price-in-india", "/telegram-members"],
]);

test("phase 5B publishes one distinct price guide per target intent", () => {
  assert.equal(searchDemandPriceGuideArticles.length, expected.size);
  const slugs = searchDemandPriceGuideArticles.map((article) => article.slug);
  assert.equal(new Set(slugs).size, slugs.length);

  for (const [slug, moneyPage] of expected) {
    const article = searchDemandPriceGuideArticles.find((candidate) => candidate.slug === slug);
    assert.ok(article, `missing ${slug}`);
    assert.ok(article.sections.length >= 6, `${slug} should have substantial guide content`);
    assert.ok(article.faqs && article.faqs.length >= 5, `${slug} should answer price-intent FAQs`);
    assert.ok(article.relatedLinks?.some((link) => link.href === moneyPage), `${slug} must link to canonical money page`);
    assert.equal(article.redirectTo, undefined);
  }
});

test("phase 5B price guides keep checkout authoritative", () => {
  for (const article of searchDemandPriceGuideArticles) {
    const text = [
      article.intro,
      article.keyTakeaway || "",
      ...article.sections.map((section) => section.body),
    ].join(" ").toLowerCase();

    assert.match(text, /live order|checkout|before payment/);
    assert.match(text, /password|otp|recovery/);
    assert.doesNotMatch(text, /guaranteed? (ranking|sales|revenue|engagement|monetization)/);
  }
});


test("phase 5I keeps India payment intent on canonical service pages", () => {
  assert.deepEqual(indiaCheckoutMethods.map((method) => method.id), ["upi", "bank_transfer", "usdt_trc20"]);
  const keywords = paymentIntentKeywords("YouTube Subscribers");
  assert.ok(keywords.includes("buy YouTube Subscribers with UPI India"));
  assert.ok(keywords.includes("buy YouTube Subscribers without password"));

  const faq = paymentIntentFaq("YouTube Subscribers");
  assert.match(faq.question, /UPI in India/);
  assert.match(faq.answer, /exact INR amount/i);
  assert.match(faq.answer, /transaction reference/i);
  assert.match(faq.answer, /checkout.*authoritative/i);
});
