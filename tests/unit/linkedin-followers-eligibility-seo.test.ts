import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCanonicalIndiaServicePath } from "../../lib/seo/canonical-india-services.ts";
import { getIndiaServicePage } from "../../lib/seo/india-service-pages.ts";
import { linkedInFollowersFaqs } from "../../lib/seo/linkedin-followers.ts";

test("LinkedIn Followers uses the established canonical profile service", () => {
  assert.equal(getCanonicalIndiaServicePath("buy-linkedin-followers-india"), "/linkedin-followers");
  const route = readFileSync("app/(india-seo-services)/buy-linkedin-followers-india/page.tsx", "utf8");
  assert.match(route, /getIndiaServiceMetadata\("buy-linkedin-followers-india"\)/);
  assert.match(route, /LinkedInFollowersLanding/);
});

test("Rendered FAQs clarify company-page eligibility and follower outcomes", () => {
  const landing = readFileSync("components/marketing/LinkedInFollowersLanding.tsx", "utf8");
  assert.match(landing, /linkedInFollowersFaqs\.map/);
  assert.ok(linkedInFollowersFaqs.some(f => f.answer.includes("Do not assume this covers a company page")));
  assert.ok(linkedInFollowersFaqs.some(f => f.answer.includes("do not guarantee engagement, leads")));
  const shared = getIndiaServicePage("buy-linkedin-followers-india");
  assert.match(shared.intro, /Company pages require a separately confirmed compatible service/);
  assert.match(shared.value, /do not establish authentic professional interest/);
});
