/** Small, privacy-safe dimensions for release-level Core Web Vitals.
 * Never include raw order IDs, customer IDs, URLs or query strings.
 */
export function webVitalPageTemplate(pathname: string): string {
  const parts = (pathname || "/").split(/[?#]/, 1)[0].split("/").filter(Boolean);
  const [section, page] = parts;
  if (!section) return "home";
  if (section === "services") return parts.length === 1 ? "services" : "service-detail";
  if (section === "packages") return "packages";
  if (section === "dashboard") {
    if (page === "orders") return parts.length > 2 ? "dashboard-order-detail" : "dashboard-orders";
    if (page === "new-order") return "dashboard-new-order";
    if (page === "wallet" || page === "add-funds") return "dashboard-wallet";
    return "dashboard-other";
  }
  if (section === "admin") return page === "orders" ? "admin-orders" : "admin-other";
  if (section === "blog") return page ? "blog-article" : "blog-index";
  if (["us", "uk", "ca", "au", "ae", "sg"].includes(section)) return page ? "country-landing" : "country-hub";
  if (["login", "register", "forgot-password", "reset-password"].includes(section)) return "authentication";
  if (section === "pricing") return "pricing";
  if (section.startsWith("buy-") || ["instagram-", "youtube-", "linkedin-", "facebook-", "twitter-", "x-", "tiktok-", "telegram-"].some(prefix => section.startsWith(prefix))) return "service-detail";
  return "other-public";
}

export function webVitalReleaseId(raw: string | undefined): string {
  return raw && /^[a-f0-9]{40}$/i.test(raw) ? raw.slice(0, 12).toLowerCase() : "unknown";
}

export function webVitalNavigationType(raw: unknown): string {
  const allowed = ["navigate", "reload", "back-forward", "back-forward-cache", "prerender", "restore"];
  return typeof raw === "string" && allowed.includes(raw) ? raw : "unknown";
}
