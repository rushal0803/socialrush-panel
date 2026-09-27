import assert from "node:assert/strict";
import test from "node:test";
import { searchSafetyGuideArticles } from "../../components/marketing/blog/searchSafetyGuides.ts";
import { buildSafetyIntentCopy, safetyPolicyFor } from "../../lib/seo/safety-intent.ts";

const expected = new Map([
  ["is-it-safe-to-buy-youtube-subscribers", "/youtube-subscribers"],
  ["is-it-safe-to-buy-youtube-views", "/youtube-views"],
  ["is-it-safe-to-buy-linkedin-followers", "/linkedin-followers"],
  ["is-it-safe-to-buy-twitter-followers", "/twitter-followers"],
  ["is-it-safe-to-buy-telegram-members", "/telegram-members"],
]);

test("phase 5L publishes one distinct safety guide per target service", () => {
  assert.equal(searchSafetyGuideArticles.length, expected.size);
  const slugs = searchSafetyGuideArticles.map((article) => article.slug);
  assert.equal(new Set(slugs).size, slugs.length);

  for (const [slug, moneyPage] of expected) {
    const article = searchSafetyGuideArticles.find((candidate) => candidate.slug === slug);
    assert.ok(article, `missing ${slug}`);
    assert.ok(article.sections.length >= 7, `${slug} should have substantial safety content`);
    assert.ok(article.faqs && article.faqs.length >= 6, `${slug} should answer safety-intent FAQs`);
    assert.ok(article.relatedLinks?.some((link) => link.href === moneyPage), `${slug} must link to canonical money page`);
  }
});

test("phase 5L avoids absolute safety claims and separates risk types", () => {
  for (const article of searchSafetyGuideArticles) {
    const text = [
      article.intro,
      article.keyTakeaway || "",
      ...article.sections.map((section) => section.body),
      ...(article.faqs || []).map((faq) => faq.answer),
    ].join(" ").toLowerCase();

    assert.match(text, /password/);
    assert.match(text, /platform-policy|platform rules|policy risk|policy/);
    assert.match(text, /retention|drops|count can change|counts can change/);
    assert.match(text, /risk/);
    assert.doesNotMatch(text, /100% safe|completely safe to use|guaranteed safe|zero risk|risk-free service/);
    assert.doesNotMatch(text, /guaranteed (reach|engagement|sales|revenue|monetization|ranking)/);
  }
});

test("phase 5L keeps official policy references explicit", () => {
  const youtube = safetyPolicyFor("youtube");
  const linkedin = safetyPolicyFor("linkedin");
  const x = safetyPolicyFor("x");
  const telegram = safetyPolicyFor("telegram");

  assert.match(youtube.href, /^https:\/\/support\.google\.com\/youtube\//);
  assert.match(linkedin.href, /^https:\/\/www\.linkedin\.com\/legal\//);
  assert.match(x.href, /^https:\/\/help\.x\.com\//);
  assert.match(telegram.href, /^https:\/\/telegram\.org\//);

  const copy = buildSafetyIntentCopy({
    serviceName: "YouTube Subscribers",
    platform: "youtube",
    destination: "public YouTube channel URL",
  });
  assert.match(copy.heading, /safe/i);
  assert.match(copy.intro, /not asking for a social-media password/i);
  assert.match(copy.intro, /platform-policy risk/i);
  assert.equal(copy.checks.length, 4);
});
