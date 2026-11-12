import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { fetchSeo, seoRequest } from "../../scripts/lib/seo-request.mjs";

const base = new URL("https://www.getsocialrush.com");
test("ordinary hosted SEO reads receive no simulated routing headers", () => {
  const request = seoRequest("/instagram-followers?source=qa", base);
  assert.equal(String(request.url), "https://www.getsocialrush.com/instagram-followers?source=qa");
  assert.deepEqual(request.headers, {});
});
test("loopback transport retains canonical production routing and query", () => {
  const request = seoRequest("/instagram-followers?source=qa", base, "http://127.0.0.1:3004");
  assert.equal(String(request.url), "http://127.0.0.1:3004/instagram-followers?source=qa");
  assert.deepEqual(request.headers, { host: "www.getsocialrush.com", "x-forwarded-proto": "https" });
});
test("simulated headers cannot target a protected preview, remote origin or alternate canonical host", () => {
  for (const transport of ["https://localhost", "http://localhost.example.com", "http://127.0.0.2", "https://preview.vercel.app", "http://localhost/path", "http://user:secret@localhost", "http://localhost?x=1", "http://localhost/#x"]) {
    assert.throws(() => seoRequest("/instagram-followers", base, transport), /loopback/);
  }
  assert.throws(() => seoRequest("/", new URL("https://preview.vercel.app"), "http://localhost:3004"), /loopback/);
  assert.throws(() => seoRequest("https://another.example/", base, "http://localhost:3004"), /loopback/);
});

test("real loopback HTTP preserves Host, protocol and query, and follows only canonical redirects", async () => {
  const seen = [];
  const server = createServer((req, res) => {
    seen.push({ host: req.headers.host, proto: req.headers["x-forwarded-proto"], url: req.url });
    if (req.url.startsWith("/alias")) { res.writeHead(301, { location: "https://www.getsocialrush.com/owner?keep=1" }); res.end(); }
    else { res.end("canonical owner"); }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const transport = `http://127.0.0.1:${server.address().port}`;
  try {
    const manual = await fetchSeo("/alias?keep=1", base, transport, { redirect: "manual" });
    assert.equal(manual.status, 301);
    assert.equal(manual.headers.get("location"), "https://www.getsocialrush.com/owner?keep=1");
    assert.equal(await (await fetchSeo("/alias?keep=1", base, transport)).text(), "canonical owner");
    assert.deepEqual(seen.map(row => row.url), ["/alias?keep=1", "/alias?keep=1", "/owner?keep=1"]);
    assert.ok(seen.every(row => row.host === "www.getsocialrush.com" && row.proto === "https"));
  } finally { await new Promise(resolve => server.close(resolve)); }
});
