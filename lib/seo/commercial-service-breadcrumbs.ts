type BreadcrumbItem = { name: string; path: string };

const platformHubs: Readonly<Record<string, BreadcrumbItem>> = {
  Instagram: { name: "Instagram Growth India", path: "/instagram-growth-india" },
  YouTube: { name: "YouTube Growth India", path: "/youtube-growth-india" },
  Facebook: { name: "Facebook Growth India", path: "/facebook-growth-india" },
  LinkedIn: { name: "LinkedIn Growth India", path: "/linkedin-growth-india" },
  Telegram: { name: "Telegram Services", path: "/services/telegram" },
  TikTok: { name: "TikTok Growth India", path: "/tiktok-growth-india" },
  Twitter: { name: "X / Twitter Services", path: "/x-growth-india" },
};

// These canonical routes already emit the trail shown by their visible UI.
const routeOwnedBreadcrumbs = new Set(["/linkedin-followers", "/twitter-followers", "/tiktok-followers"]);

export function hasRouteOwnedCommercialBreadcrumb(path: string) {
  return routeOwnedBreadcrumbs.has(path);
}

export function getCommercialServiceBreadcrumbs(platform: string, name: string, path: string): BreadcrumbItem[] {
  const hub = platformHubs[platform] ?? { name: "Services", path: "/services" };
  return [{ name: "Home", path: "/" }, { ...hub }, { name, path }];
}
