import { test, expect } from "./fixtures";
import { fetchSeo } from "../../scripts/lib/seo-request.mjs";
import { legacyRedirects } from "../../scripts/lib/seo-redirect-contract.mjs";
import { commercialCanonicalRedirects } from "../../lib/seo/query-ownership";
import nextConfig from "../../next.config.mjs";

test("all monitored aliases preserve production ownership, query and canonical destination on isolated loopback", async ({ request, baseURL }, info) => {
  test.setTimeout(180000);
  const transport = new URL(baseURL!).origin;
  const base = new URL("https://www.getsocialrush.com");
  const configured = await nextConfig.redirects();
  const rows = [];
  expect(legacyRedirects).toHaveLength(91);
  // Negative control: a normal local hostname intentionally does not enable
  // production-only middleware aliases. Never remove that host/security gate.
  expect((await request.get("/instagram-followers", { maxRedirects: 0 })).status()).toBe(404);
  for (const [source, destination] of legacyRedirects) {
    const declared = commercialCanonicalRedirects[source] ?? configured.find(row => row.source === source)?.destination;
    expect(declared, `declared owner of ${source}`).toBe(destination);
    const response = await fetchSeo(`${source}?release_qa=preserve`, base, transport, { redirect: "manual" });
    expect([301, 308], source).toContain(response.status);
    const location = new URL(response.headers.get("location")!, base);
    expect(location.origin, source).toBe(base.origin);
    expect(location.pathname, source).toBe(destination);
    expect(location.searchParams.get("release_qa"), source).toBe("preserve");
    const owner = await fetchSeo(destination, base, transport, { redirect: "manual" });
    expect(owner.status, destination).toBe(200);
    const html = await owner.text();
    const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
    expect(canonical, destination).toBe(new URL(destination, base).href);
    rows.push({ source, destination, status: response.status, location: location.href, canonical });
  }
  await info.attach("production-host-alias-contract", { body: JSON.stringify({ note: "Local HTTP simulation only; no hosted protection bypass or indexing request", rows }, null, 2), contentType: "application/json" });
});
