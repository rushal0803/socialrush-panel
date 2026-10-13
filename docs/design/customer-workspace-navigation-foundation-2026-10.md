# Premium customer workspace – shared navigation foundation

Date: 2026-10-14

## Scope

First coherent **UI-only** foundation for SocialRUSH's authenticated customer dashboard. The account's live money pages must remain fully operational while broader visual improvements proceed as one coordinated design journey.

## Confirmed baseline

- The shared `app/dashboard/layout.tsx` mounts `components/Sidebar.tsx`, `components/dashboard/DashboardHeaderBar.tsx`, `components/dashboard/MobileBottomNav.tsx`, checkout bridges and the auth context.
- The original desktop sidebar styles placed dark `#111827` link labels on the dark `#101219` sidebar. This change makes inactive navigation readable and gives the selected route a contrasted active indicator.
- On mobile, the drawer placed a large Workspace list before Wallet/Billing. Important money actions were far below the fold. The new menu orders Main, Money, Workspace, Account and Help and groups the latter three into expandable, keyboard-native sections; all route links remain in the DOM and reachable. Active group's accordion starts open.
- The previous drawer repeated Start Order and Profile under the main navigation. They are replaced by fixed, immediate Add Funds / Support / Log out actions. Existing mobile focus trap, scroll lock and Escape behaviour remain managed by `MobileMenuLayer`.
- The bottom navigation now uses the shared route matcher and highlights Wallet for `/dashboard/add-funds`, Orders for `/dashboard/order-history`, and New Order on checkout continuation routes.
- The Shared Workspace CSS adds a mobile safe-area content footer clearance, reduced motion support and restrained scrollbar styling. It does not rewrite page-specific checkout and wallet designs.

## Safety

No price, payout, invoice, payment method, wallet balance, order creation, service data, Supabase schema, authentication, API, SEO canonical or financial calculation changes. No new dependency. An accessible navigation change must not be misrepresented as full redesign of every customer screen.

## Proposed remainder (separate bounded reviews)

1. **New Order** (`app/dashboard/new-order/page.tsx`) – field hierarchy, quantity/min/max guidance, mobile summary, full authenticated mocked journey.
2. **Wallet / Add Funds / Direct UPI** – trustworthy funds display and payment state presentation without financial logic changes.
3. **Orders / Billing / Packages** – tracking states, filtering, information hierarchy and real package pricing.
4. **Workspace / Account / Support** – shared components and fine-grained responsive checks.

Protect Vercel production usage: one branch and one combined PR commit, run CI once, merge only after full validation and review. Audit representative authenticated 320/390/768/1024/1440 layouts; do not claim screenshot verification where no protected test fixture was available.
