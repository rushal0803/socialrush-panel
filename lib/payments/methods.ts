export const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI",
    description: "PhonePe, Google Pay, Paytm, BHIM",
  },
  {
    id: "card",
    label: "Debit Card / Credit Card",
    description: "Visa, Mastercard, RuPay",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    description: "Pay directly from your bank account",
  },
  {
    id: "international_card",
    label: "International Card",
    description: "Pay using international Visa, Mastercard, Amex, or supported cards",
  },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];
export type SupportedPaymentMethodId = PaymentMethodId | "wallet";

const useCashfree = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY === "cashfree";

export const ALLOWED_PAYMENT_METHODS: readonly SupportedPaymentMethodId[] = [
  "upi",
  "card",
  "netbanking",
  "wallet",
  "international_card",
];

export function normalizePaymentMethod(
  value: unknown,
): SupportedPaymentMethodId | null {
  const method = String(value || "").toLowerCase().trim();

  if (method === "upi") return "upi";

  if (
    method === "card" ||
    method === "debit_card" ||
    method === "credit_card" ||
    method.includes("debit") ||
    method.includes("credit")
  ) {
    return "card";
  }

  if (
    method === "netbanking" ||
    method === "net_banking" ||
    method === "net banking" ||
    method.includes("net")
  ) {
    return "netbanking";
  }

  if (
    method === "international_card" ||
    method.includes("international")
  ) {
    return "international_card";
  }

  if (method === "wallet" || method.includes("wallet")) return "wallet";

  return null;
}

export function isPaymentMethod(
  value: unknown,
): value is SupportedPaymentMethodId {
  return (
    typeof value === "string" &&
    ALLOWED_PAYMENT_METHODS.includes(value as SupportedPaymentMethodId)
  );
}

const PAYMENT_METHOD_ENABLED: Record<PaymentMethodId, boolean> = {
  upi: useCashfree
    ? process.env.NEXT_PUBLIC_CASHFREE_ENABLE_UPI !== "false"
    : process.env.NEXT_PUBLIC_RAZORPAY_ENABLE_UPI !== "false",
  card: useCashfree
    ? process.env.NEXT_PUBLIC_CASHFREE_ENABLE_CARD !== "false"
    : process.env.NEXT_PUBLIC_RAZORPAY_ENABLE_CARD !== "false",
  netbanking: useCashfree
    ? process.env.NEXT_PUBLIC_CASHFREE_ENABLE_NETBANKING !== "false"
    : process.env.NEXT_PUBLIC_RAZORPAY_ENABLE_NETBANKING !== "false",
  international_card:
    useCashfree
      ? process.env.NEXT_PUBLIC_CASHFREE_ENABLE_INTERNATIONAL_CARD === "true"
      : process.env.NEXT_PUBLIC_RAZORPAY_ENABLE_INTERNATIONAL_CARD === "true",
};

export function isPaymentMethodEnabled(method: SupportedPaymentMethodId) {
  if (method === "wallet") return true;
  return PAYMENT_METHOD_ENABLED[method];
}

export function paymentMethodUnavailableMessage(
  method: SupportedPaymentMethodId,
) {
  if (method === "international_card") {
    return "International payments are currently being activated. Please contact WhatsApp support.";
  }
  return "This payment method is currently under activation. Please use UPI for now.";
}

export function paymentMethodLabel(value: string | null | undefined) {
  return PAYMENT_METHODS.find((method) => method.id === value)?.label ?? value?.replaceAll("_", " ") ?? "Unknown";
}
