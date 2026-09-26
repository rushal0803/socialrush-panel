import { calculateAgencyQuote } from "@/lib/reseller/monthly-plan";

export type SavedMonthlyPlanSnapshot = {
  baselineFulfillmentCost: number;
  baselineClientQuote: number;
  baselineGrossMargin: number;
  markupPercent: number;
};

export function compareSavedMonthlyPlan(snapshot: SavedMonthlyPlanSnapshot, currentFulfillmentCost: number) {
  const current = calculateAgencyQuote(currentFulfillmentCost, snapshot.markupPercent);
  const costDelta = Math.round((current.fulfillmentCost - snapshot.baselineFulfillmentCost) * 100) / 100;
  const quoteDelta = Math.round((current.clientQuote - snapshot.baselineClientQuote) * 100) / 100;
  const marginDelta = Math.round((current.grossMargin - snapshot.baselineGrossMargin) * 100) / 100;
  const costDeltaPercent = snapshot.baselineFulfillmentCost > 0
    ? Math.round((costDelta / snapshot.baselineFulfillmentCost) * 1000) / 10
    : 0;
  return { current, costDelta, quoteDelta, marginDelta, costDeltaPercent };
}

export function planSnapshotItems(items: Array<{ service: { code: string; name: string }; quantity: number; total: number }>) {
  return items.map((item) => ({
    service_code: item.service.code,
    name: item.service.name,
    quantity: item.quantity,
    total: Math.round(item.total * 100) / 100,
  }));
}
