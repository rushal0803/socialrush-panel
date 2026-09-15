# Phase 7 — Dashboard Command Center

## Goal
Turn the existing authenticated dashboard overview into a cleaner command center without changing account, Supabase, order, wallet, payment, support, reward, profile, or favourite-service contracts.

## Existing data reused
- wallet balance
- active, completed, and total order counts
- recent orders and delivery progress
- recent transactions
- latest support ticket and open-ticket count
- latest credited reward
- saved social profiles
- saved order draft
- active campaigns
- favourite services

## UX changes
- route-scoped command-center visual layer
- stronger hero and quick-action hierarchy
- denser at-a-glance metric cards
- improved panel depth and scanability
- clearer hover/focus states for interactive dashboard surfaces
- better recent-order scanning and panel separation
- refined mobile spacing above dashboard navigation
- reduced-motion handling

## Protected scope
- no new dashboard data queries
- no Supabase schema or migration changes
- no order or payment logic changes
- no wallet mutation changes
- no support workflow changes
- no pricing changes
- no authentication or middleware changes
- no SEO/schema changes
- no dependency changes

## Validation
Before merge, require TypeScript, production build, Playwright smoke tests, exact-head Vercel preview readiness, mergeability, and clean comparison against latest main.
