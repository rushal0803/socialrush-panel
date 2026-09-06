export type DashboardNavigationItem = {
  label: string;
  href: string;
  icon: string;
  group: "Main" | "Workspace" | "Money" | "Account" | "Help";
};

// Keep the authenticated IA in one place. Every item deliberately maps to a
// live customer route; this prevents attractive but dead dashboard links.
export const dashboardLinks: readonly DashboardNavigationItem[] = [
  { label: "Overview", href: "/dashboard", icon: "grid", group: "Main" },
  { label: "New Order", href: "/dashboard/new-order", icon: "plus", group: "Main" },
  { label: "Orders", href: "/dashboard/orders", icon: "orders", group: "Main" },
  { label: "Packages", href: "/dashboard/packages", icon: "packages", group: "Main" },
  { label: "Campaigns", href: "/dashboard/campaigns", icon: "campaign", group: "Workspace" },
  { label: "Clients", href: "/dashboard/clients", icon: "clients", group: "Workspace" },
  { label: "Saved Profiles", href: "/dashboard/saved-profiles", icon: "bookmark", group: "Workspace" },
  { label: "Favourite Services", href: "/dashboard/new-order?tab=favourites", icon: "heart", group: "Workspace" },
  { label: "Wallet", href: "/dashboard/wallet", icon: "wallet", group: "Money" },
  { label: "Billing", href: "/dashboard/billing", icon: "receipt", group: "Money" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "bell", group: "Account" },
  { label: "Account", href: "/dashboard/account", icon: "settings", group: "Account" },
  { label: "Support", href: "/dashboard/support", icon: "support", group: "Help" },
];

export function groupDashboardLinks(items = dashboardLinks) {
  return items.reduce<Record<DashboardNavigationItem["group"], DashboardNavigationItem[]>>(
    (groups, item) => {
      groups[item.group].push(item);
      return groups;
    },
    { Main: [], Workspace: [], Money: [], Account: [], Help: [] },
  );
}
