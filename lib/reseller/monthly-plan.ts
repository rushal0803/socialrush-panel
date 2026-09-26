export type AgencyQuote = {
  fulfillmentCost: number;
  clientQuote: number;
  grossMargin: number;
  grossMarginPercent: number;
  markupPercent: number;
};

export function normalizeMarkupPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(200, Math.max(0, Math.round(value)));
}

export function calculateAgencyQuote(fulfillmentCost: number, markupPercent: number): AgencyQuote {
  const safeCost = Number.isFinite(fulfillmentCost) && fulfillmentCost > 0 ? fulfillmentCost : 0;
  const markup = normalizeMarkupPercent(markupPercent);
  const clientQuote = Math.round((safeCost * (1 + markup / 100)) * 100) / 100;
  const grossMargin = Math.round((clientQuote - safeCost) * 100) / 100;
  const grossMarginPercent = clientQuote > 0 ? Math.round((grossMargin / clientQuote) * 1000) / 10 : 0;
  return { fulfillmentCost: safeCost, clientQuote, grossMargin, grossMarginPercent, markupPercent: markup };
}

export function buildClientProposalText(input: {
  clientName?: string;
  planName: string;
  platformLabel: string;
  items: Array<{ name: string; quantity: number }>;
  clientQuote: number;
}) {
  const client = input.clientName?.trim() || "Client";
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(input.clientQuote);
  const lines = input.items.map((item) => `• ${item.name}: ${item.quantity.toLocaleString("en-IN")}`).join("\n");

  return [
    `Monthly Growth Plan — ${client}`,
    `Platform: ${input.platformLabel}`,
    `Plan: ${input.planName}`,
    "",
    "Monthly scope:",
    lines,
    "",
    `Monthly service fee: ${money}`,
    "",
    "Notes:",
    "• Final target eligibility, delivery window and refill eligibility are confirmed before each order.",
    "• Each monthly cycle is reviewed before payment.",
    "• This plan does not create an automatic renewal or recurring charge.",
  ].join("\n");
}
