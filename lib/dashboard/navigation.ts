export type DashboardNavigationItem={label:string;href:string;icon:string;group:"Main"|"Workspace"|"Money"|"Account"|"Help"};
export const dashboardLinks:readonly DashboardNavigationItem[]=[
{label:"Overview",href:"/dashboard",icon:"grid",group:"Main"},{label:"New Order",href:"/dashboard/new-order",icon:"plus",group:"Main"},{label:"Orders",href:"/dashboard/orders",icon:"orders",group:"Main"},{label:"Packages",href:"/dashboard/packages",icon:"packages",group:"Main"},
{label:"Campaign Stacks",href:"/dashboard/campaign-stacks",icon:"campaign",group:"Workspace"},{label:"Recurring Revenue",href:"/dashboard/retainers",icon:"campaign",group:"Workspace"},{label:"Reseller Hub",href:"/dashboard/reseller",icon:"clients",group:"Workspace"},{label:"Campaigns",href:"/dashboard/campaigns",icon:"campaign",group:"Workspace"},{label:"Clients",href:"/dashboard/clients",icon:"clients",group:"Workspace"},{label:"Referral Center",href:"/dashboard/referrals",icon:"gift",group:"Workspace"},{label:"Saved Profiles",href:"/dashboard/saved-profiles",icon:"bookmark",group:"Workspace"},{label:"Favourite Services",href:"/dashboard/new-order?tab=favourites",icon:"heart",group:"Workspace"},
{label:"Wallet",href:"/dashboard/wallet",icon:"wallet",group:"Main"},{label:"Billing",href:"/dashboard/billing",icon:"receipt",group:"Money"},{label:"Notifications",href:"/dashboard/notifications",icon:"bell",group:"Account"},{label:"Account",href:"/dashboard/account",icon:"settings",group:"Account"},{label:"Settings",href:"/dashboard/settings",icon:"settings",group:"Account"},{label:"Rewards",href:"/dashboard/rewards",icon:"gift",group:"Money"},{label:"Repeat Campaigns",href:"/dashboard/repeat-campaigns",icon:"campaign",group:"Workspace"},{label:"Your Reviews",href:"/dashboard/reviews",icon:"heart",group:"Account"},{label:"API Documentation",href:"/dashboard/api-docs",icon:"orders",group:"Help"},{label:"Support",href:"/dashboard/support",icon:"support",group:"Help"}];
export function groupDashboardLinks(items=dashboardLinks){return items.reduce<Record<DashboardNavigationItem["group"],DashboardNavigationItem[]>>((groups,item)=>{groups[item.group].push(item);return groups},{Main:[],Workspace:[],Money:[],Account:[],Help:[]})}

export function isDashboardLinkActive(href: string, pathname: string, query = "") {
  const [route, requiredQuery] = href.split("?");
  const current = new URLSearchParams(query);
  if (requiredQuery) return pathname === route && [...new URLSearchParams(requiredQuery)].every(([key, value]) => current.get(key) === value);
  if (route === "/dashboard/new-order" && current.get("tab") === "favourites") return false;
  if (route === "/dashboard/wallet" && ["/dashboard/add-funds", "/dashboard/direct-upi"].includes(pathname)) return true;
  if (route === "/dashboard/orders" && pathname === "/dashboard/order-history") return true;
  return pathname === route || (route !== "/dashboard" && pathname.startsWith(`${route}/`));
}
