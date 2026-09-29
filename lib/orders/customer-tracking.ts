export type OrderTrackingGuidance = {
  title: string;
  summary: string;
  action: string;
  supportWindow: string;
  tone: "neutral" | "amber" | "success" | "danger";
};

export function orderTrackingGuidance(status: string | null | undefined): OrderTrackingGuidance {
  switch (status) {
    case "processing":
      return {
        title: "Your order is being prepared",
        summary: "The service has been accepted and is moving into delivery. Keep the submitted public target available and avoid changing its handle or URL.",
        action: "No action is needed right now.",
        supportWindow: "Contact support if the order moves beyond the delivery estimate shown on this page.",
        tone: "amber",
      };
    case "in_progress":
      return {
        title: "Delivery is in progress",
        summary: "Delivery has started. Progress may update in steps rather than continuously, depending on the service.",
        action: "Keep the target public and avoid overlapping orders for the same target until this one finishes.",
        supportWindow: "Use support if delivery stops beyond the stated estimate or the target becomes unavailable.",
        tone: "amber",
      };
    case "partial":
      return {
        title: "Part of the order has been delivered",
        summary: "Some of the requested quantity is already visible and the remaining amount is still being processed.",
        action: "Leave the target unchanged while the remaining quantity is delivered.",
        supportWindow: "Contact support if the remaining quantity does not progress within the delivery estimate.",
        tone: "amber",
      };
    case "completed":
      return {
        title: "Delivery is complete",
        summary: "The order has reached its completed state. You can repeat the same campaign, start the same service on a new target, or review refill eligibility.",
        action: "Check the final delivered count and use Order Again only when you are ready for another campaign.",
        supportWindow: "If an eligible service later drops within its refill coverage, submit a refill request from this order.",
        tone: "success",
      };
    case "refill_requested":
      return {
        title: "Your refill request is queued",
        summary: "The refill request has been received and is waiting for review.",
        action: "No duplicate refill request is needed.",
        supportWindow: "Follow this order or your notifications for the next update.",
        tone: "amber",
      };
    case "refilling":
      return {
        title: "Refill delivery is in progress",
        summary: "The approved refill is currently being processed.",
        action: "Keep the target public and unchanged during refill delivery.",
        supportWindow: "Contact support only if the refill remains unchanged beyond the service guidance.",
        tone: "amber",
      };
    case "cancelled":
      return {
        title: "This order was cancelled",
        summary: "Delivery will not continue on this order.",
        action: "Review the order and payment notes before placing a replacement order.",
        supportWindow: "Contact support if you need clarification about the cancellation.",
        tone: "danger",
      };
    case "refunded":
      return {
        title: "This order was refunded",
        summary: "The order has been closed and the applicable refund or credit has been processed according to the recorded payment flow.",
        action: "You can place a new order after reviewing the correct service and target.",
        supportWindow: "Contact support if the expected refund or wallet credit is not visible.",
        tone: "success",
      };
    case "failed":
      return {
        title: "This order needs attention",
        summary: "The order could not continue in its current state.",
        action: "Review the failure reason shown on the order before trying again.",
        supportWindow: "Contact support if the reason is unclear or you need help placing a corrected order.",
        tone: "danger",
      };
    default:
      return {
        title: "Your order has been received",
        summary: "The order is recorded and waiting for the next processing step.",
        action: "Keep the submitted target public and unchanged.",
        supportWindow: "If the status does not move within the expected delivery window, contact support from this order.",
        tone: "neutral",
      };
  }
}

export function orderGuidanceClass(tone: OrderTrackingGuidance["tone"]) {
  return {
    neutral: "border-slate-400/20 bg-slate-400/[.06] text-slate-100",
    amber: "border-amber-400/20 bg-amber-500/[.07] text-amber-100",
    success: "border-emerald-400/20 bg-emerald-500/[.07] text-emerald-100",
    danger: "border-red-400/20 bg-red-500/[.07] text-red-100",
  }[tone];
}
