// This is the single policy for every new customer payment. Historical
// Historical verification/webhook compatibility is separate; new provider
// creation and refund operations are retired.
export const NEW_CUSTOMER_PAYMENT_GATEWAY = "manual" as const;
export const RAZORPAY_NEW_PAYMENT_DISABLED_MESSAGE =
  "Gateway payments are retired. Use wallet or manual checkout.";
