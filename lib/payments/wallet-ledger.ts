type LedgerEntry = {
  amount: number | string; type: string; status: string;
  description?: string | null; metadata?: Record<string, unknown> | null;
};

/** External refund records describe a bank movement, not another wallet credit. */
export function walletBalanceEffect(entry: LedgerEntry) {
  const amount = Number(entry.amount);
  if (entry.status !== "completed" || !Number.isFinite(amount) || amount <= 0) return 0;
  if (entry.type === "refund" && entry.metadata?.refund_kind === "wallet_deposit") return 0;
  // The legacy gateway RPC deducted directly; it had no separate reservation entry.
  if (entry.type === "refund" && entry.description === "Payment refunded to original method") return -amount;
  if (entry.type === "debit") return -amount;
  return ["credit", "refund"].includes(entry.type) ? amount : 0;
}

export function walletAmountPrefix(entry: LedgerEntry) {
  if (entry.status !== "completed") return "";
  const effect = walletBalanceEffect(entry);
  return effect < 0 ? "−" : effect > 0 ? "+" : entry.type === "refund" ? "Returned " : "";
}
