import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";

const source = readFileSync(new URL("../../app/api/analytics/route.ts", import.meta.url), "utf8");

test("analytics endpoint checks Supabase RPC returned error", () => {
  assert.match(source, /const\s*\{\s*error:\s*analyticsError\s*\}\s*=\s*await db\.rpc\("record_analytics_event"/);
  assert.match(source, /if\s*\(analyticsError\)/);
});

test("analytics error diagnostics omit raw customer event and attribution data", () => {
  assert.match(source, /console\.warn\("Analytics event write failed",\s*\{\s*code:\s*analyticsError\.code\s*\|\|\s*"unknown"\s*\}\)/);
  assert.doesNotMatch(source, /console\.(?:log|warn|error)\([^\n]*(?:body|metadata|attribution|sessionId)/);
});

test("analytics failures do not block navigation", () => {
  assert.match(source, /new NextResponse\(null,\s*\{\s*status:\s*204\s*\}\)/);
});

test("analytics endpoint rejects cross-origin browser posts before the RPC", () => {
  assert.match(source, /request\.headers\.get\("origin"\)/);
  assert.match(source, /new URL\(origin\)\.origin === request\.nextUrl\.origin/);
  assert.match(source, /Invalid request origin\./);
  assert.ok(source.indexOf('request.headers.get("origin")') < source.indexOf('db.rpc("record_analytics_event"'));
});
