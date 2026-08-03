export type CustomerStatus = {
  label: string;
  tone: "neutral" | "amber" | "success" | "danger";
  needsAttention?: boolean;
};

const statuses: Record<string, CustomerStatus> = {
  pending: { label: "Order Received", tone: "neutral" },
  processing: { label: "Processing", tone: "amber" },
  in_progress: { label: "Delivery in Progress", tone: "amber" },
  partial: { label: "Partially Delivered", tone: "amber" },
  completed: { label: "Completed", tone: "success" },
  refill_requested: { label: "Refill Requested", tone: "amber" },
  refilling: { label: "Refill Processing", tone: "amber" },
  cancelled: { label: "Cancelled", tone: "danger" },
  refunded: { label: "Refunded", tone: "success" },
  failed: { label: "Needs Attention", tone: "danger", needsAttention: true },
};

export function customerOrderStatus(status: string | null | undefined): CustomerStatus {
  return statuses[status || ""] ?? { label: "Order Received", tone: "neutral" };
}

export function customerStatusClass(status: string | null | undefined) {
  return {
    neutral: "border-slate-400/30 bg-slate-400/10 text-slate-200",
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    danger: "border-red-400/30 bg-red-500/10 text-red-200",
  }[customerOrderStatus(status).tone];
}

export function customerOrderStages(status: string) {
  const base = ["Order received", "Payment confirmed", "Processing", "Delivery in progress", "Completed"];
  const position = status === "completed" ? 4 : ["in_progress", "partial"].includes(status) ? 3 : status === "processing" ? 2 : 1;
  if (["cancelled", "refunded", "failed"].includes(status)) return base.map((label, index) => ({ label, state: index === 0 ? "done" : "upcoming" as const }));
  return base.map((label, index) => ({ label, state: index < position ? "done" : index === position ? "current" : "upcoming" as const }));
}
