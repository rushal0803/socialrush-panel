import { calculateAgencyQuote } from "@/lib/reseller/monthly-plan";
import type { SavedMonthlyPlanSnapshot } from "@/lib/reseller/saved-monthly-plan";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return time;
}

export type RenewalStatus = "overdue" | "today" | "due_soon" | "scheduled" | "unscheduled";

export function renewalStatus(nextReviewOn: string | null | undefined, today: string) {
  if (!nextReviewOn) return { status: "unscheduled" as const, daysUntil: null };
  const reviewTime = parseDateOnly(nextReviewOn);
  const todayTime = parseDateOnly(today);
  if (reviewTime === null || todayTime === null) return { status: "unscheduled" as const, daysUntil: null };
  const daysUntil = Math.round((reviewTime - todayTime) / DAY_MS);
  const status: RenewalStatus = daysUntil < 0 ? "overdue" : daysUntil === 0 ? "today" : daysUntil <= 7 ? "due_soon" : "scheduled";
  return { status, daysUntil };
}

export function nextMonthlyReviewDate(from = new Date()) {
  const year = from.getUTCFullYear();
  const month = from.getUTCMonth();
  const day = from.getUTCDate();
  const lastDayNextMonth = new Date(Date.UTC(year, month + 2, 0)).getUTCDate();
  const target = new Date(Date.UTC(year, month + 1, Math.min(day, lastDayNextMonth)));
  return target.toISOString().slice(0, 10);
}

export function renewalEconomicsAtSavedQuote(snapshot: SavedMonthlyPlanSnapshot, currentFulfillmentCost: number) {
  const currentCost = Number.isFinite(currentFulfillmentCost) && currentFulfillmentCost > 0 ? currentFulfillmentCost : 0;
  const marginAtSavedQuote = Math.round((snapshot.baselineClientQuote - currentCost) * 100) / 100;
  const marginAtSavedQuotePercent = snapshot.baselineClientQuote > 0
    ? Math.round((marginAtSavedQuote / snapshot.baselineClientQuote) * 1000) / 10
    : 0;
  const savedMarginDelta = Math.round((marginAtSavedQuote - snapshot.baselineGrossMargin) * 100) / 100;
  const repriced = calculateAgencyQuote(currentCost, snapshot.markupPercent);
  return {
    currentCost,
    marginAtSavedQuote,
    marginAtSavedQuotePercent,
    savedMarginDelta,
    recommendedQuote: repriced.clientQuote,
    recommendedMargin: repriced.grossMargin,
  };
}
