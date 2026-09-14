export type RepeatOrderCandidate = { status: string; createdAt: string };

export function isRepeatableCompletedOrder(order: RepeatOrderCandidate) {
  return order.status === "completed" && Boolean(order.createdAt);
}

export function repeatOrderDisclosure() {
  return "Current live pricing applies before checkout.";
}
