# Phase 5J — Delivery + Refill Search Intent Engine

Date: 27 September 2026

## Objective

Capture high-intent India search demand around delivery time, refill/support coverage and what happens after ordering without creating new competing commercial URLs.

## Why this intent matters

Current SERPs for social-growth services frequently surface delivery timing, no-password ordering and refill coverage as purchase-decision information. SocialRUSH already has these facts in the live service catalog; Phase 5J makes them explicit on canonical money pages rather than creating thin variants.

## Implementation

- Added `lib/seo/delivery-refill-intent.ts` for reusable delivery/refill query language and truthful copy.
- Added `components/seo/DeliveryRefillIntentSection.tsx`.
- Added delivery/refill intent keywords to both canonical service metadata systems.
- Added the visible section to:
  - Instagram Followers
  - YouTube Subscribers
  - LinkedIn Followers
  - Facebook Followers
  - Twitter / X Followers
  - Telegram Members
  - shared canonical service template
  - shared India service template
- Added regression tests for query language, visible coverage and non-guaranteed delivery wording.

## Guardrails

- No new transactional URLs.
- No changes to checkout, prices, wallet, payment verification or order creation.
- Delivery values come from existing service facts.
- Refill/support text comes from existing service facts.
- Estimates are explicitly not guaranteed completion times.
- No promise of retention, reach, ranking, monetization, sales or engagement outcomes.
