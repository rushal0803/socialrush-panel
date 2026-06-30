export const DEFAULT_CUSTOMER_DESTINATION = "/dashboard/new-order";
export const ADMIN_DESTINATION = "/admin/dashboard";

export function getSafeCustomerDestination(value: string | null | undefined) {
  if (!value) return DEFAULT_CUSTOMER_DESTINATION;

  try {
    if (!value.startsWith("/") || value.startsWith("//")) {
      return DEFAULT_CUSTOMER_DESTINATION;
    }

    const destination = new URL(value, "https://socialrush.internal");
    if (
      destination.origin !== "https://socialrush.internal" ||
      (destination.pathname !== "/dashboard" &&
        !destination.pathname.startsWith("/dashboard/"))
    ) {
      return DEFAULT_CUSTOMER_DESTINATION;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return DEFAULT_CUSTOMER_DESTINATION;
  }
}
