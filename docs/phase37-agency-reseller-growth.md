# Phase 37 — Agency / Reseller Growth Engine

Phase 37 builds on the existing SocialRUSH agency workspace rather than creating a second reseller system.

## Existing foundations preserved

- Client workspaces and saved profiles.
- Campaign attribution.
- Bulk planning with one verified checkout per job.
- Monthly plan and quote workflow.
- Portfolio and renewal review.
- Retainer candidate workspace.
- Public agency/bulk lead qualification.
- Current catalog pricing as the fulfillment source of truth.

## Five-stage growth model

The reseller hub now chooses one next-best action from real account activity:

1. **Setup** — create the first client workspace.
2. **Organize** — link unassigned order history to clients.
3. **Recurring** — save the first monthly client plan.
4. **Renew** — review due renewals or identify retainer candidates.
5. **Scale** — organize work into campaigns, then use the bulk planner when the workflow is mature.

The decision engine fails closed when its underlying client, campaign, order or plan queries are unreliable.

## Safety and commercial truth

- No automatic reseller discount is invented.
- No revenue, profit, delivery or outcome guarantee is added.
- Saved client quote value is described as planned/quoted value, not realized revenue.
- No order or renewal is submitted automatically.
- Current service price, availability, quantity limits, delivery and refill terms remain authoritative before payment.

## Measurement

The reseller next-action card records first-party interaction events:

- `agency_growth_next_action_view`
- `agency_growth_next_action_click`

These measure product interaction only; they do not claim agency growth or revenue lift.
