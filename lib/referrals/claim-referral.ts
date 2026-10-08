import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const REFERRAL_CLAIM_WINDOW_DAYS = 7;
const REFERRAL_CODE_PATTERN = /^SR[A-Z0-9]{10}$/;

export type ReferralClaimStatus =
  | "claimed"
  | "already_claimed"
  | "invalid_code"
  | "self_referral"
  | "ineligible"
  | "unavailable";

export function normalizeReferralCode(value: string | null | undefined) {
  const code = value?.trim().toUpperCase() ?? "";
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}

export async function claimReferralForUser(input: {
  userId: string;
  userCreatedAt: string | null | undefined;
  code: string | null | undefined;
}): Promise<{ status: ReferralClaimStatus }> {
  const code = normalizeReferralCode(input.code);
  if (!code) return { status: "invalid_code" };

  const createdAt = input.userCreatedAt ? Date.parse(input.userCreatedAt) : Number.NaN;
  if (
    !Number.isFinite(createdAt) ||
    Date.now() - createdAt > REFERRAL_CLAIM_WINDOW_DAYS * 86_400_000
  ) {
    return { status: "ineligible" };
  }

  const admin = createAdminClient();

  const { data: existing, error: existingError } = await admin
    .from("referral_attributions")
    .select("id")
    .eq("referred_user_id", input.userId)
    .maybeSingle();
  if (existingError) return { status: "unavailable" };
  if (existing) return { status: "already_claimed" };

  const { count: orderCount, error: orderError } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", input.userId);
  if (orderError) return { status: "unavailable" };
  if ((orderCount ?? 0) > 0) return { status: "ineligible" };

  const { data: referralCode, error: codeError } = await admin
    .from("referral_codes")
    .select("id,user_id")
    .eq("code", code)
    .maybeSingle();
  if (codeError) return { status: "unavailable" };
  if (!referralCode) return { status: "invalid_code" };
  if (referralCode.user_id === input.userId) return { status: "self_referral" };

  const { data: rules, error: rulesError } = await admin
    .from("reward_programme_rules")
    .select("referral_expiry_days")
    .eq("id", true)
    .maybeSingle();
  if (rulesError || !rules) return { status: "unavailable" };

  const expiryDays = Math.max(1, Math.min(365, Number(rules.referral_expiry_days) || 30));
  const expiresAt = new Date(Date.now() + expiryDays * 86_400_000).toISOString();

  const { error: insertError } = await admin.from("referral_attributions").insert({
    referrer_id: referralCode.user_id,
    referred_user_id: input.userId,
    referral_code_id: referralCode.id,
    status: "pending",
    expires_at: expiresAt,
  });

  if (!insertError) return { status: "claimed" };
  if (insertError.code === "23505") return { status: "already_claimed" };
  return { status: "unavailable" };
}
