export const DEFAULT_CUSTOMER_DESTINATION = "/dashboard/new-order";
export const ADMIN_DESTINATION = "/admin/dashboard";

export function getSafeCustomerDestination(value: string | null | undefined) {
  const raw = String(value || "").trim();
  if (!raw) return DEFAULT_CUSTOMER_DESTINATION;

  // A return path must be a site-relative path. This rejects scheme-relative
  // URLs (//example.com), external URLs, and malformed values before they can
  // become a post-login redirect.
  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return DEFAULT_CUSTOMER_DESTINATION;
  }

  let destination: URL;

  try {
    destination = new URL(raw, "https://www.getsocialrush.com");
  } catch {
    return DEFAULT_CUSTOMER_DESTINATION;
  }

  if (destination.origin !== "https://www.getsocialrush.com" || !destination.pathname.startsWith("/")) {
    return DEFAULT_CUSTOMER_DESTINATION;
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}
