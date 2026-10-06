# Phase 36 — Retention Engine

Phase 36 unifies existing SocialRUSH retention building blocks instead of creating a second lifecycle system.

## Decision priority

The dashboard retention engine is care-first:

1. Payment verification or unresolved payment state.
2. Open customer support.
3. Active refill request.
4. Active/pending order.
5. Existing checkout or saved-draft recovery (the dedicated recovery UI keeps ownership).
6. Recent completed-order review.
7. Safe repeat of a completed campaign.
8. General repeat workspace.

If the required customer-state queries fail, the retention engine fails closed and shows no promotional repeat action.

## Repeat safety

- Nothing is reordered automatically.
- Current price, quantity limits and service availability are rechecked before payment.
- Frequent-repeat detection only reuses completed order history and existing catalog mappings.
- No discount, urgency, result or availability claim is invented.

## Existing lifecycle automation

The existing consent-aware lifecycle email system remains the source of truth for promotional email. Phase 36 does not create another email sequence. Existing unsubscribe, suppression, active-support and active-refill safeguards remain intact.

## Measurement

The dashboard records first-party `retention_next_action_view` and `retention_next_action_click` interactions. These are interaction signals only; they do not claim retention lift or revenue impact.
