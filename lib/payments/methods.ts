export const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI",
    description: "Pay directly by UPI when placing an order",
  },
  {
    id: "card",
    label: "Debit Card / Credit Card",
    description: "Temporarily unavailable",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    description: "Temporarily unavailable",
  },
  {
    id: "international_card",
    label: "International Card",
    description: "Temporarily unavailable",
  },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];
export type SupportedPaymentMethodId = PaymentMethodId | "wallet";

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

// Cashfree transactions are currently disabled for the merchant account.
// Keep wallet balance usable, but prevent customer-facing wallet top-ups from
// attempting the unavailable gateway. Direct orders use the temporary UPI
// checkout flow until a verified payment gateway is restored.
const PAYMENT_METHOD_ENABLED: Record<PaymentMethodId, boolean> = {
  upi: false,
  card: false,
  netbanking: false,
  international_card: false,
};

export function isPaymentMethodEnabled(method: SupportedPaymentMethodId) {
  if (method === "wallet") return true;
  return PAYMENT_METHOD_ENABLED[method];
}

export function paymentMethodUnavailableMessage(
  method: SupportedPaymentMethodId,
) {
  if (method === "international_card") {
    return "International card payments are temporarily unavailable. Please contact WhatsApp support for assistance.";
  }
  if (method === "upi") {
    return "Wallet top-ups are temporarily unavailable. Please place your order directly and pay by UPI at checkout.";
  }
  return "This payment method is temporarily unavailable. Please place your order directly and use UPI at checkout.";
}

export function paymentMethodLabel(value: string | null | undefined) {
  return PAYMENT_METHODS.find((method) => method.id === value)?.label ?? value?.replaceAll("_", " ") ?? "Unknown";
}
