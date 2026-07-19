export const DEFAULT_CUSTOMER_DESTINATION = "/dashboard/new-order";
export const ADMIN_DESTINATION = "/admin/dashboard";

export function getSafeCustomerDestination(value: string | null | undefined) {
  const raw = String(value || "").trim();
  if (!raw) return DEFAULT_CUSTOMER_DESTINATION;

  let destination: URL;

  try {
    destination = new URL(raw, "https://www.getsocialrush.com");
  } catch {
    return DEFAULT_CUSTOMER_DESTINATION;
  }

  if (destination.origin !== "https://www.getsocialrush.com") {
    return DEFAULT_CUSTOMER_DESTINATION;
  }

  const allowedCustomerPaths = [
    "/dashboard/new-order",
    "/dashboard/order-summary",
    "/packages/checkout",
  ];

  if (!allowedCustomerPaths.includes(destination.pathname)) {
    return DEFAULT_CUSTOMER_DESTINATION;
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}
