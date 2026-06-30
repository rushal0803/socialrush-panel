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

export const ALLOWED_PAYMENT_METHODS: readonly PaymentMethodId[] = [
  "upi",
  "card",
  "netbanking",
  "international_card",
];

export function normalizePaymentMethod(
  value: unknown,
): PaymentMethodId | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  const aliases: Record<string, PaymentMethodId> = {
    upi: "upi",
    card: "card",
    "debit card / credit card": "card",
    "debit card": "card",
    "credit card": "card",
    netbanking: "netbanking",
    "net banking": "netbanking",
    international_card: "international_card",
    "international card": "international_card",
  };

  return aliases[normalized] ?? null;
}

export function isPaymentMethod(value: unknown): value is PaymentMethodId {
  return (
    typeof value === "string" &&
    ALLOWED_PAYMENT_METHODS.includes(value as PaymentMethodId)
  );
}

const PAYMENT_METHOD_ENABLED: Record<PaymentMethodId, boolean> = {
  upi: process.env.NEXT_PUBLIC_RAZORPAY_ENABLE_UPI !== "false",
  card: process.env.NEXT_PUBLIC_RAZORPAY_ENABLE_CARD !== "false",
  netbanking:
    process.env.NEXT_PUBLIC_RAZORPAY_ENABLE_NETBANKING !== "false",
  international_card:
    process.env.NEXT_PUBLIC_RAZORPAY_ENABLE_INTERNATIONAL_CARD === "true",
};

export function isPaymentMethodEnabled(method: PaymentMethodId) {
  return PAYMENT_METHOD_ENABLED[method];
}

export function paymentMethodUnavailableMessage(method: PaymentMethodId) {
  if (method === "international_card") {
    return "International payments are currently being activated. Please contact WhatsApp support.";
  }
  return "This payment method is currently under activation. Please use UPI for now.";
}

export function paymentMethodLabel(value: string | null | undefined) {
  return PAYMENT_METHODS.find((method) => method.id === value)?.label ?? value?.replaceAll("_", " ") ?? "Unknown";
}
