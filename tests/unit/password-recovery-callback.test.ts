import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Protect the server-side recovery exchange that enables session cookies in SSR.
// Supabase's QA recovery email template must send token_hash/type=recovery to /auth/callback.
test("recovery callback supports token-hash and code exchanges", () => {
  const source = readFileSync(new URL("../../app/auth/callback/route.ts", import.meta.url), "utf8");
  assert.ok(source.includes('searchParams.get("token_hash")'));
  assert.ok(source.includes('searchParams.get("type") === "recovery"'));
  assert.ok(source.includes('supabase.auth.verifyOtp({ token_hash: tokenHash!, type: "recovery" })'));
  assert.ok(source.includes('supabase.auth.exchangeCodeForSession(code!)'));
  assert.ok(source.includes('const isPasswordReset = recoveryToken ||'));
  assert.ok(source.includes('response.cookies.set(name, value, options)'));
  assert.ok(source.includes('return response;'));
});
