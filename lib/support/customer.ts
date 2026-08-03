export const SUPPORT_STATUSES = ["open", "waiting_for_support", "waiting_for_customer", "resolved", "closed"] as const;

const statusDetails: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-orange-500/10 text-orange-200 ring-orange-400/25" },
  waiting_for_support: { label: "Waiting for Support", className: "bg-amber-500/10 text-amber-200 ring-amber-400/25" },
  waiting_for_customer: { label: "Waiting for You", className: "bg-blue-500/10 text-blue-200 ring-blue-400/25" },
  resolved: { label: "Resolved", className: "bg-emerald-500/10 text-emerald-200 ring-emerald-400/25" },
  closed: { label: "Closed", className: "bg-white/5 text-[#D1D5DB] ring-white/10" },
};

export function supportStatus(status: string) {
  return statusDetails[status] ?? { label: "Open", className: statusDetails.open.className };
}

export function safeSupportText(value: unknown, min: number, max: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (text.length < min || text.length > max || /<[^>]*>/.test(text)) return null;
  return text;
}

export function safePaymentReference(value: unknown) {
  const reference = safeSupportText(value, 3, 120);
  return reference && /^[A-Za-z0-9._:/-]+$/.test(reference) ? reference : null;
}

export function supportError(error?: string) {
  if (!error) return "We could not complete that request. Please try again.";
  if (/already have|duplicate/i.test(error)) return "You already have an active ticket for this issue.";
  if (/related order|required/i.test(error)) return "Choose one of your orders for this issue.";
  if (/closed|unavailable/i.test(error)) return "This ticket can no longer be updated.";
  return "We could not complete that request. Please check your details and try again.";
}
