export const PAYMENT_GATEWAYS = ["razorpay", "cashfree"] as const;

export type PaymentGateway = (typeof PAYMENT_GATEWAYS)[number];

// Razorpay remains the production default.  Cashfree is enabled per deployment
// by setting NEXT_PUBLIC_PAYMENT_GATEWAY=cashfree at build time.
export const paymentGateway: PaymentGateway =
  process.env.NEXT_PUBLIC_PAYMENT_GATEWAY === "cashfree"
    ? "cashfree"
    : "razorpay";
