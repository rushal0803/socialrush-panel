const publicOrderIdPattern = /^SR-[A-Z0-9]{6,}$/;

/** Returns a stored, customer-safe order reference without creating one. */
export function formatPublicOrderId(value: string | null | undefined): string {
  const reference = String(value ?? "").trim().toUpperCase();
  return publicOrderIdPattern.test(reference) ? reference : "Order reference unavailable";
}

/** Normalizes customer/admin search input; it is not an authorization mechanism. */
export function normalizePublicOrderSearch(value: string): string {
  const compact = value.trim().replace(/^#\s*/, "").replace(/\s+/g, "").toUpperCase();
  return compact.startsWith("SR-") ? compact : `SR-${compact}`;
}

export function orderWhatsAppHref(publicOrderId: string): string {
  return `https://wa.me/918860330771?text=${encodeURIComponent(`Hi SocialRUSH, I need help with order ${formatPublicOrderId(publicOrderId)}.`)}`;
}
