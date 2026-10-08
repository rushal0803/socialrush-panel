# Phase 43 — Referral Growth Loop

Phase 43 turns the existing referral/rewards foundation into one measurable loop without inventing incentives.

## Loop

1. Existing customers share an account-linked referral URL.
2. The registration page preserves the validated `ref` code through email confirmation.
3. Referral claiming happens server-side with the service-role client.
4. Existing customers, self-referrals, duplicate claims and late claims are rejected.
5. The referred customer is attributed once.
6. A completed paid order that satisfies the live reward rules qualifies the referral.
7. If the live referrer reward is zero, qualification is recorded without creating fake wallet credit.
8. If a positive referrer reward is configured, the existing manual-approval rule controls whether the event waits for review or is credited automatically.

## Safety

- Referral codes are validated before use.
- Claims are allowed only during the first seven days of the new account and before any order exists.
- Service-role credentials remain server-only.
- The qualification trigger lives in the private schema and is not executable through the public Data API.
- Existing reward values are not changed by Phase 43.
- Self-referrals and duplicate attribution are blocked.
- Reward qualification is idempotent because only a pending referral can qualify.

## Measurement

First-party events:
- `referral_center_view`
- `referral_share_clicked`
- `referral_landing_view`
- `referral_signup_attributed`

The dashboard also shows first-party counts for attributed, pending, qualified and rewarded referrals. These are operational funnel states, not claimed conversion lift.
