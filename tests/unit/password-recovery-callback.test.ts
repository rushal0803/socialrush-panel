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

test("implicit recovery fragments use browser handoff without weakening other callbacks", () => {
  const callback = readFileSync(new URL("../../app/auth/callback/route.ts", import.meta.url), "utf8");
  const recovery = readFileSync(new URL("../../app/auth/recovery/page.tsx", import.meta.url), "utf8");
  assert.ok(callback.includes('isPasswordReset && !code && !recoveryToken'));
  assert.ok(callback.includes('new URL("/auth/recovery", requestUrl.origin)'));
  assert.ok(recovery.includes('hash.get("access_token")'));
  assert.ok(recovery.includes('hash.get("refresh_token")'));
  assert.ok(recovery.includes('tokenType === "recovery"'));
  assert.ok(recovery.includes('supabase.auth.setSession('));
  assert.ok(recovery.includes('supabase.auth.exchangeCodeForSession(code)'));
  assert.ok(recovery.includes('window.history.replaceState('));
  assert.ok(recovery.includes('supabase.auth.getUser()'));
  assert.ok(recovery.includes('router.replace("/reset-password")'));
});

test("password reset form and mutation require authenticated user", () => {
  const page = readFileSync(new URL("../../app/reset-password/page.tsx", import.meta.url), "utf8");
  const actions = readFileSync(new URL("../../app/auth/actions.ts", import.meta.url), "utf8");
  assert.ok(page.includes('supabase.auth.getUser()'));
  assert.ok(page.includes('if (error || !user) redirect('));
  assert.ok(actions.includes('sessionError || !user'));
  assert.ok(actions.includes('supabase.auth.updateUser({ password })'));
});
