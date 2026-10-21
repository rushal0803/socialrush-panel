import type { VerifiedRevenueOrder, VerifiedRefund } from "./revenue-dashboard.ts";

export type FinancialReport = {
  orders: VerifiedRevenueOrder[]; refunds: (VerifiedRefund & { id: string })[];
  gross: number; refundAmount: number; net: number;
  supplierCost: number | null; grossMargin: number | null; costCoverage: number | null;
  unclassifiedRefunds: number; missingRecognitionOrders: number; unreconciledRefundedOrders: number; recognitionPolicy: string;
};

export function indiaReportingStart(days: number, now = new Date()) {
  // IST has no daylight-saving transition; subtract full calendar days from IST midnight.
  const shifted = new Date(now.getTime() + 330 * 60_000);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) -
    330 * 60_000 - (days - 1) * 86_400_000).toISOString();
}

export function indiaMonthStart(now = new Date()) {
  const shifted = new Date(now.getTime() + 330 * 60_000);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), 1) - 330 * 60_000).toISOString();
}
