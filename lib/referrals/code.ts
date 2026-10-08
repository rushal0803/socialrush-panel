export const REFERRAL_CODE_PATTERN = /^SR[A-Z0-9]{10}$/;

export function normalizeReferralCode(value: string | null | undefined) {
  const code = value?.trim().toUpperCase() ?? "";
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}
