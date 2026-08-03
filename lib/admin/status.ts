export function adminStatusLabel(value: string | null | undefined) {
  return (value || "unknown").replaceAll("_", " ");
}

export function adminStatusTone(value: string | null | undefined) {
  const status = value || "unknown";
  if (["completed", "paid", "approved", "resolved", "stable", "active", "operational"].includes(status)) return "border-emerald-400/25 bg-emerald-500/10 text-emerald-300";
  if (["failed", "rejected", "refunded", "degraded", "paused", "maintenance", "cancelled"].includes(status)) return "border-red-400/25 bg-red-500/10 text-red-300";
  if (["pending", "processing", "reviewing", "requested", "waiting_for_support", "partial", "high_demand", "slower_delivery", "limited"].includes(status)) return "border-amber-400/25 bg-amber-500/10 text-amber-300";
  return "border-white/10 bg-white/5 text-[#D1D5DB]";
}
