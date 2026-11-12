import { canonicalServiceRoutes } from "../../lib/seo/canonical-service-routes.ts";
import { canonicalIndiaServicePaths } from "../../lib/seo/canonical-india-services.ts";
import { existsSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { servicePriceSpecification } from "../../lib/seo/service-price-specification.ts";
import { telegramMembersFaqs, telegramMembersFaqSchema } from "../../lib/seo/telegram-members-faq.ts";

test("existing per-1K offers retain their rate and identify the actual reference quantity", () => {
  for (const [path, rate, unit] of [
    ["/instagram-likes", 249, "likes"], ["/youtube-subscribers", 6999, "subscribers"],
    ["/youtube-views", 249, "views"], ["/buy-facebook-followers-india", 499, "followers"],
    ["/linkedin-followers", 3999, "followers"], ["/facebook-likes", 149, "likes"],
    ["/telegram-members", 799, "members"],
  ] as const) {
    const { priceSpecification: spec } = servicePriceSpecification(path, rate);
    assert.equal(spec?.price, rate);
    assert.equal(spec?.priceCurrency, "INR");
    assert.equal(spec?.referenceQuantity.value, 1000);
    assert.equal(spec?.referenceQuantity.unitText, unit);
  }
  assert.equal(servicePriceSpecification("/instagram-likes", 0.89).priceSpecification?.price, 0.89);
});

test("invalid rates and routes outside this batch receive no price specification", () => {
  for (const value of [0, -1, NaN, Infinity]) assert.deepEqual(servicePriceSpecification("/instagram-likes", value), {});
  for (const path of ["/instagram-views", "/twitter-followers", "/buy-instagram-followers-india", "/not-a-service"]) {
    assert.deepEqual(servicePriceSpecification(path, 100), {});
  }
});

test("Telegram structured answers match the visible FAQ source and state outcome limits", () => {
  const schema = telegramMembersFaqSchema();
  assert.equal(schema.mainEntity.length, telegramMembersFaqs.length);
  for (const [index, [question, answer]] of telegramMembersFaqs.entries()) {
    assert.equal(schema.mainEntity[index].name, question);
    assert.equal(schema.mainEntity[index].acceptedAnswer.text, answer);
  }
  assert.match(JSON.stringify(schema), /do not guarantee Indian members/);
  assert.match(JSON.stringify(schema), /do not prove authentic interest/);
  assert.doesNotMatch(JSON.stringify(schema), /₹|guaranteed delivery|guaranteed rankings/i);
});


test("first-batch generated routes never shadow their dedicated canonical page files", () => {
  const batch = new Set(["/buy-instagram-followers-india", "/instagram-likes", "/youtube-subscribers", "/youtube-views", "/buy-facebook-followers-india", "/instagram-views", "/linkedin-followers", "/facebook-likes", "/twitter-followers", "/telegram-members"]);
  for (const [slug, path] of Object.entries(canonicalIndiaServicePaths)) {
    if (!batch.has(path)) continue;
    const dedicated = existsSync(new URL(`../../app${path}/page.tsx`, import.meta.url)) || existsSync(new URL(`../../app/(india-seo-services)${path}/page.tsx`, import.meta.url));
    assert.equal(Object.hasOwn(canonicalServiceRoutes, path.slice(1)), !dedicated, path);
    if (!dedicated) assert.equal(canonicalServiceRoutes[path.slice(1)], slug);
  }
});
