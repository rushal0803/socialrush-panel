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
  const delivery = ["Order received", "Payment confirmed", "Processing", "Delivery in progress", "Completed"];
  if (status === "refill_requested") {
    return [
      ...delivery.map((label) => ({ label, state: "done" as const })),
      { label: "Refill requested", state: "current" as const },
      { label: "Refill processing", state: "upcoming" as const },
    ];
  }
  if (status === "refilling") {
    return [
      ...delivery.map((label) => ({ label, state: "done" as const })),
      { label: "Refill requested", state: "done" as const },
      { label: "Refill processing", state: "current" as const },
    ];
  }
  const position = status === "completed" ? 4 : ["in_progress", "partial"].includes(status) ? 3 : status === "processing" ? 2 : 1;
  if (["cancelled", "refunded", "failed"].includes(status)) return delivery.map((label, index) => ({ label, state: index === 0 ? "done" as const : "upcoming" as const }));
  return delivery.map((label, index) => ({ label, state: index < position ? "done" as const : index === position ? "current" as const : "upcoming" as const }));
}
