import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const followersAlias = readFileSync(new URL("../../app/services/linkedin-followers/page.tsx", import.meta.url), "utf8");
const likesAlias = readFileSync(new URL("../../app/services/linkedin-likes/page.tsx", import.meta.url), "utf8");
const linkedinHub = readFileSync(new URL("../../components/marketing/services/PlatformServicesLanding.tsx", import.meta.url), "utf8");
const linkedInDynamicServices = readFileSync(new URL("../../app/services/[slug]/page.tsx", import.meta.url), "utf8");

const usaServiceCodes = [
  "linkedin-usa-connections",
  "linkedin-usa-post-likes",
  "linkedin-usa-reposts",
  "linkedin-usa-endorsements",
  "linkedin-usa-followers",
  "linkedin-usa-group-members",
  "linkedin-usa-custom-comments",
];

test("LinkedIn core service aliases redirect to the established canonical URLs", () => {
  assert.match(followersAlias, /permanentRedirect\("\/linkedin-followers"\)/);
  assert.match(likesAlias, /permanentRedirect\("\/linkedin-likes"\)/);
});

test("LinkedIn hub keeps core services on their ranking URLs", () => {
  assert.match(linkedinHub, /"linkedin-followers": "\/linkedin-followers"/);
  assert.match(linkedinHub, /"linkedin-likes": "\/linkedin-likes"/);
});

test("all seven LinkedIn USA services retain dedicated service-page handling", () => {
  for (const code of usaServiceCodes) {
    assert.ok(linkedInDynamicServices.includes(code), `${code} should have dedicated route handling`);
    assert.ok(linkedInDynamicServices.includes(`/services/${code}`), `${code} should use its service canonical URL`);
  }
});
