import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 43 carries referral codes through signup and email confirmation", () => {
  const register = read("components/auth/RegisterForm.tsx");
  const callback = read("app/auth/callback/route.ts");

  assert.match(register, /normalizeReferralCode\(searchParams\.get\("ref"\)\)/);
  assert.match(register, /callbackUrl\.searchParams\.set\("ref", referralCode\)/);
  assert.match(register, /fetch\("\/api\/referrals\/claim"/);
  assert.match(callback, /claimReferralForUser/);
  assert.match(callback, /normalizeReferralCode\(searchParams\.get\("ref"\)\)/);
});

test("Phase 43 referral claims are server-side and guarded against abuse", () => {
  const helper = read("lib/referrals/claim-referral.ts");
  const api = read("app/api/referrals/claim/route.ts");

  assert.match(helper, /import "server-only"/);
  assert.match(helper, /REFERRAL_CLAIM_WINDOW_DAYS = 7/);
  assert.match(helper, /orderCount/);
  assert.match(helper, /self_referral/);
  assert.match(helper, /referred_user_id/);
  assert.match(api, /supabase\.auth\.getUser\(\)/);
  assert.match(api, /claimReferralForUser/);
});

test("Phase 43 qualifies referral attribution from eligible completed orders", () => {
  const migration = read("supabase/migrations/20261008132000_phase43_referral_growth_loop.sql");

  assert.match(migration, /private\.qualify_referral_on_order_completion/);
  assert.match(migration, /new\.status <> 'completed'/);
  assert.match(migration, /new\.charge, 0\) < v_rules\.minimum_order_amount/);
  assert.match(migration, /status = 'qualified'/);
  assert.match(migration, /coalesce\(v_rules\.referrer_reward, 0\) <= 0/);
  assert.match(migration, /'referral_growth_loop'/);
  assert.match(migration, /status = 'rewarded'/);
  assert.match(migration, /revoke all on function private\.qualify_referral_on_order_completion\(\) from authenticated/);
});

test("Phase 43 uses live programme rules instead of inventing referral incentives", () => {
  const page = read("app/dashboard/referrals/page.tsx");

  assert.match(page, /reward_programme_rules/);
  assert.match(page, /referrer_reward/);
  assert.match(page, /minimum_order_amount/);
  assert.match(page, /referral_expiry_days/);
  assert.match(page, /No referrer reward is currently offered/);
  assert.doesNotMatch(page, /guaranteed cash|guaranteed commission/i);
});

test("Phase 43 referral links use the real code and measurable campaign attribution", () => {
  const page = read("app/dashboard/referrals/page.tsx");
  const actions = read("app/dashboard/referrals/ReferralShareActions.tsx");
  const events = read("lib/analytics/events.ts");

  assert.match(page, /register\?ref=\$\{encodeURIComponent\(referralCode\)\}/);
  assert.match(page, /utm_campaign=referral_loop/);
  assert.match(actions, /referral_share_clicked/);
  assert.match(actions, /referral_center_view/);
  assert.match(events, /"referral_landing_view"/);
  assert.match(events, /"referral_signup_attributed"/);
});
