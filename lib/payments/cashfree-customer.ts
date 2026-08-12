const CASHFREE_ANONYMOUS_CUSTOMER_PHONE = "9999999999";

function normalizedIndianPhone(phone: string | null | undefined) {
  const digits = String(phone || "").replace(/\D/g, "");
  return /^\d{10}$/.test(digits) ? digits : null;
}

// Cashfree requires customer_phone for order creation but permits dummy customer
// details when they are not needed. This fixed API-compatible value is not user
// data and remains server-side; a saved valid phone is still preferred.
export function cashfreeCustomerPhone(phone: string | null | undefined) {
  return normalizedIndianPhone(phone) || CASHFREE_ANONYMOUS_CUSTOMER_PHONE;
}
