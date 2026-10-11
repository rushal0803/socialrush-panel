/**
 * Only expose a protected live-catalog order builder when every customer-facing
 * pricing boundary is confirmed. Checkout independently verifies these facts.
 *
 * Static active catalog entries retain their existing presentation behavior.
 */
export type LiveServiceAvailability = {
  available?: boolean | null;
  rate?: number | null;
  min?: number | null;
  max?: number | null;
} | null | undefined;

export function canStartServiceOrder(requiresLiveFacts: boolean, live: LiveServiceAvailability): boolean {
  if (!requiresLiveFacts) return true;
  return live?.available === true &&
    typeof live.rate === "number" && Number.isFinite(live.rate) && live.rate > 0 &&
    typeof live.min === "number" && Number.isInteger(live.min) && live.min > 0 &&
    typeof live.max === "number" && Number.isInteger(live.max) && live.max >= live.min;
}
