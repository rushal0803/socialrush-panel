import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("phase 15 keeps launch-critical branding on social media growth language", () => {
  const services = source("../../components/marketing/services/ServicesPageContent.tsx");
  const bulkAgency = source("../../components/marketing/audiences/BulkSmmIndiaAuthority.tsx");

  assert.match(services, /Social media growth services in India/);
  assert.doesNotMatch(services, /SMM Panel India/i);

  assert.match(bulkAgency, /Bulk social media growth orders India/);
  assert.doesNotMatch(bulkAgency, /Bulk SMM orders India/i);
});

test("phase 15 footer payment copy matches the current public payment presentation", () => {
  const footer = source("../../components/marketing/MarketingFooter.tsx");

  assert.match(footer, /UPI at checkout/);
  assert.match(footer, /Wallet Balance/);
  assert.doesNotMatch(footer, /Razorpay/i);
  assert.doesNotMatch(footer, /Cards via/i);
});

test("phase 15 public shell preserves keyboard navigation and one main landmark", () => {
  const shell = source("../../components/marketing/PublicShell.tsx");

  assert.match(shell, /Skip to main content/);
  assert.match(shell, /href="#main-content"/);
  assert.match(shell, /<main id="main-content"/);
});

test("phase 15 launch-critical public route files remain present", () => {
  const routes = [
    "../../app/page.tsx",
    "../../app/services/page.tsx",
    "../../app/pricing/page.tsx",
    "../../app/packages/page.tsx",
    "../../app/about/page.tsx",
    "../../app/contact/page.tsx",
    "../../app/faq/page.tsx",
    "../../app/trust/page.tsx",
    "../../app/case-studies/page.tsx",
    "../../app/blog/page.tsx",
    "../../app/tools/page.tsx",
    "../../app/login/page.tsx",
    "../../app/register/page.tsx",
    "../../app/us/page.tsx",
    "../../app/uk/page.tsx",
    "../../app/ca/page.tsx",
    "../../app/au/page.tsx",
    "../../app/ae/page.tsx",
    "../../app/sg/page.tsx",
  ];

  for (const route of routes) {
    assert.equal(existsSync(new URL(route, import.meta.url)), true, `${route} should exist`);
  }
});

test("phase 15 keeps legacy Razorpay endpoints disabled in the launch smoke suite", () => {
  const smoke = source("../smoke/production-safety.spec.ts");
  assert.match(smoke, /former Razorpay order endpoints reject new customer payments/);
  assert.match(smoke, /must be permanently unavailable for new payments/);
  assert.match(smoke, /Use Cashfree/);
});
