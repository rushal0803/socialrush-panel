export const DEFAULT_CUSTOMER_DESTINATION = "/dashboard/new-order";
export const ADMIN_DESTINATION = "/admin/dashboard";

export function getSafeCustomerDestination(value: string | null | undefined) {
  // Customer authentication always starts in the order builder. This also
  // prevents stale callbackUrl/next values saved by older wallet flows from
  // sending a newly authenticated customer to Add Funds.
  void value;
  return DEFAULT_CUSTOMER_DESTINATION;
}
