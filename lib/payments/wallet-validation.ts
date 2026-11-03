export type CapturedWalletPayment = { id?: string; order_id?: string; amount?: number; currency?: string; status?: string };

export function validateWalletCapture(payment: CapturedWalletPayment,
  expected: { providerOrderId: string; amount: number | string; paymentMethod: string | null; type: string; status: string }) {
  const paise = Math.round(Number(expected.amount) * 100);
  return Boolean(payment.id && payment.order_id === expected.providerOrderId &&
    Number.isSafeInteger(paise) && paise > 0 && payment.amount === paise &&
    payment.currency === "INR" && payment.status === "captured" && expected.type === "credit" &&
    ["upi", "card", "netbanking", "wallet", "international_card", "razorpay"].includes(expected.paymentMethod ?? "") &&
    ["pending", "completed"].includes(expected.status));
}
