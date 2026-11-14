import { isPaymentMethodEnabled, type PaymentMethodId } from "./methods";

// Uses the existing approved flags; this module never enables a method.
export function cashfreeNewPaymentsEnabled() {
  return (["upi", "card", "netbanking", "international_card"] as PaymentMethodId[])
    .some(method => isPaymentMethodEnabled(method));
}
