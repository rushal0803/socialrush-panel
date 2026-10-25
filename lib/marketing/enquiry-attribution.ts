const TRACKING_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/** A bounded, allowlisted referral source. Never record arbitrary query strings or personal identifiers. */
export function safeContactAttribution(pathname: string, search: string): string {
  const path = pathname === "/contact" ? pathname : "/contact";
  const incoming = new URLSearchParams(search);
  const filtered = new URLSearchParams();
  for (const key of TRACKING_KEYS) {
    const raw = incoming.get(key);
    if (!raw) continue;
    const cleaned = raw.trim().replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 50);
    if (cleaned) filtered.set(key, cleaned);
  }
  const encoded = filtered.toString();
  return encoded ? (path + "?" + encoded).slice(0, 200) : path;
}

/** Only known partnership campaign links can preselect an enquiry category. */
export function defaultPartnerEnquiry(search: string): string {
  return new URLSearchParams(search).get("service") === "Partnership Enquiry"
    ? "Partnership Enquiry"
    : "";
}
