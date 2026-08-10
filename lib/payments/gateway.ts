// Wallet funding is intentionally Cashfree-only. Razorpay routes and records
// remain available for historical payments and an operational rollback, but
// must never be selected for a new wallet top-up.
export const paymentGateway = "cashfree" as const;
