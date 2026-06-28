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

export function isPaymentMethod(value: unknown): value is PaymentMethodId {
  return typeof value === "string" && ALLOWED_PAYMENT_METHODS.includes(value as PaymentMethodId);
}

export function paymentMethodLabel(value: string | null | undefined) {
  return PAYMENT_METHODS.find((method) => method.id === value)?.label ?? value?.replaceAll("_", " ") ?? "Unknown";
}
