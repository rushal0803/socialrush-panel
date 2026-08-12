// This is the single policy for every new customer payment. Historical
// Razorpay verification, webhook, reconciliation, and refund operations are
// deliberately separate from this policy.
export const NEW_CUSTOMER_PAYMENT_GATEWAY = "cashfree" as const;
export const RAZORPAY_NEW_PAYMENT_DISABLED_MESSAGE =
  "Razorpay is disabled for new payments. Use Cashfree.";
