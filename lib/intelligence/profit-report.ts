/** Offline, INR-paise reconciliation prototype. Never reads or writes business data. */
export const costKinds = ["fulfillment", "processing", "chargeback", "support", "marketing", "operating", "depreciation", "interest", "income_tax"] as const;
type CostKind = typeof costKinds[number];
export type LedgerEntry = {
  id: string;
  kind: "earned_order" | "refund" | CostKind;
  amountPaise: number;
  occurredAt: string;
  currency: "INR";
  dataset: "production" | "synthetic";
  verified: boolean;
  internal: boolean;
  orderId?: string;
};
export type OrderIdentity = { id: string; customerKey: string | null; serviceCode: string; firstPaidAt: string | null };
export type ProfitInput = {
  dataset: "production" | "synthetic";
  start: string;
  endExclusive: string;
  orders: OrderIdentity[];
  entries: LedgerEntry[];
  // Evidence of reconciliation, not a claim that an empty ledger means zero cost.
  coverage: Partial<Record<CostKind | "earned_revenue" | "refunds" | "customer_history", boolean>>;
};
const money = (n: number) => { if (!Number.isSafeInteger(n) || n < 0) throw new Error("Expected nonnegative safe integer paise"); return n; };
const add = (a: number, b: number) => { const n = a + b; if (!Number.isSafeInteger(n)) throw new Error("Paise overflow"); return n; };
const signed = (n: number) => { if (!Number.isSafeInteger(n)) throw new Error("Paise overflow"); return n; };
const timestamp = (s: string) => { const n = Date.parse(s); if (!Number.isFinite(n) || !/(Z|[+-]\d\d:\d\d)$/.test(s)) throw new Error("Timestamp requires explicit offset"); return n; };

export function buildProfitReport(input: ProfitInput) {
  const start = timestamp(input.start), end = timestamp(input.endExclusive);
  if (start >= end || !["production", "synthetic"].includes(input.dataset)) throw new Error("Invalid report scope");
  const orders = new Map<string, OrderIdentity>();
  for (const order of input.orders) {
    if (!order.id || !order.serviceCode || orders.has(order.id)) throw new Error("Invalid or duplicate order identity");
    if (order.firstPaidAt !== null) timestamp(order.firstPaidAt);
    orders.set(order.id, order);
  }
  const unique = new Map<string, LedgerEntry>();
  const unresolvedCosts = new Set<string>();
  let excluded = 0;
  for (const entry of input.entries) {
    if (entry.dataset !== input.dataset || entry.internal !== false || entry.verified !== true) {
      // A pending cost cannot be treated as zero merely because the upstream
      // completeness flag claims success. Pending/unpaid sales remain excluded.
      if (entry.dataset === input.dataset && entry.internal === false && entry.verified !== true &&
        (costKinds as readonly string[]).includes(entry.kind) && timestamp(entry.occurredAt) >= start && timestamp(entry.occurredAt) < end) unresolvedCosts.add(entry.kind);
      excluded++; continue;
    }
    if (!entry.id || entry.currency !== "INR" || !["earned_order", "refund", ...costKinds].includes(entry.kind)) throw new Error("Unsupported ledger entry");
    money(entry.amountPaise); timestamp(entry.occurredAt);
    const prior = unique.get(entry.id);
    if (prior && JSON.stringify(prior) !== JSON.stringify(entry)) throw new Error("Conflicting ledger ID");
    unique.set(entry.id, entry);
  }
  const totals: Record<string, number> = Object.fromEntries(["earned_order", "refund", ...costKinds].map(k => [k, 0]));
  const earned = new Set<string>();
  const customers = new Map<string, string | null>();
  const service = new Map<string, { serviceCode: string; grossPaise: number; refundsPaise: number; fulfillmentPaise: number; processingPaise: number; orders: number }>();
  const missing = new Set<string>();
  for (const key of ["earned_revenue", "refunds", ...costKinds]) if (input.coverage[key] !== true) missing.add(key);
  for (const kind of unresolvedCosts) missing.add(kind);
  let unknownCustomers = 0, unallocatedDirectCostPaise = 0;
  const earnedAnywhere = new Set<string>();
  for (const entry of unique.values()) {
    const order = entry.orderId ? orders.get(entry.orderId) : undefined;
    if (["earned_order", "refund"].includes(entry.kind) && !order) throw new Error("Revenue/refund requires reconciled order identity");
    if (entry.kind === "earned_order") {
      if (earnedAnywhere.has(entry.orderId!)) throw new Error("Multiple earned entries for one order; reconcile installments first");
      earnedAnywhere.add(entry.orderId!);
    }
    if (timestamp(entry.occurredAt) < start || timestamp(entry.occurredAt) >= end) continue;
    totals[entry.kind] = add(totals[entry.kind], entry.amountPaise);
    if (entry.orderId && !order) throw new Error("Unknown cost order");
    if (["fulfillment", "processing"].includes(entry.kind) && !order) unallocatedDirectCostPaise = add(unallocatedDirectCostPaise, entry.amountPaise);
    if (order && ["earned_order", "refund", "fulfillment", "processing"].includes(entry.kind)) {
      const row = service.get(order.serviceCode) ?? { serviceCode: order.serviceCode, grossPaise: 0, refundsPaise: 0, fulfillmentPaise: 0, processingPaise: 0, orders: 0 };
      const key = { earned_order: "grossPaise", refund: "refundsPaise", fulfillment: "fulfillmentPaise", processing: "processingPaise" }[entry.kind];
      row[key] = add(row[key], entry.amountPaise);
      if (entry.kind === "earned_order") {
        row.orders++; earned.add(order.id);
        if (!order.customerKey || !order.firstPaidAt) unknownCustomers++;
        else {
          if (timestamp(order.firstPaidAt) > timestamp(entry.occurredAt)) throw new Error("Customer first payment follows order");
          if (customers.has(order.customerKey) && customers.get(order.customerKey) !== order.firstPaidAt) throw new Error("Inconsistent customer history");
          customers.set(order.customerKey, order.firstPaidAt);
        }
      }
      service.set(order.serviceCode, row);
    }
  }
  const revenueComplete = !missing.has("earned_revenue") && !missing.has("refunds");
  const netRevenuePaise = totals.earned_order - totals.refund;
  const knownCostPaise = costKinds.reduce((sum, kind) => add(sum, totals[kind]), 0);
  const knownRemainderPaise = netRevenuePaise - knownCostPaise;
  if (!Number.isSafeInteger(knownRemainderPaise)) throw new Error("Paise overflow");
  const newCustomers = [...customers.values()].filter(t => timestamp(t!) >= start && timestamp(t!) < end).length;
  const returningCustomers = [...customers.values()].filter(t => timestamp(t!) < start).length;
  const customerCoverage = input.coverage.customer_history === true && unknownCustomers === 0 && revenueComplete;
  const directComplete = revenueComplete && !missing.has("fulfillment") && !missing.has("processing") && unallocatedDirectCostPaise === 0;
  return {
    dataset: input.dataset, start: input.start, endExclusive: input.endExclusive, basis: "earned_ex_indirect_tax" as const,
    status: missing.size ? "INCOMPLETE" : "COMPLETE_INPUTS_NOT_AUDITED",
    totalsPaise: totals, netRevenuePaise, knownCostPaise,
    // A known-cost remainder is never labeled net profit when costs are missing.
    knownRemainderPaise, netProfitPaise: missing.size ? null : knownRemainderPaise,
    missingInputs: [...missing], excludedEntries: excluded, deduplicatedEntries: unique.size,
    paidOrders: earned.size, grossAovPaise: input.coverage.earned_revenue === true && earned.size ? totals.earned_order / earned.size : null,
    customerMetrics: {
      status: customerCoverage ? "COMPLETE_HISTORY_NOT_AUDITED" : "INCOMPLETE",
      newCustomers: customerCoverage ? newCustomers : null, returningCustomers: customerCoverage ? returningCustomers : null,
      returningCustomerShare: customerCoverage && customers.size ? returningCustomers / customers.size : null,
      blendedCacPaise: customerCoverage && !missing.has("marketing") && newCustomers ? totals.marketing / newCustomers : null,
      unknownCustomerOrders: unknownCustomers,
    },
    unallocatedDirectCostPaise,
    services: [...service.values()].sort((a,b) => a.serviceCode.localeCompare(b.serviceCode)).map(row => ({ ...row,
      netRevenuePaise: signed(row.grossPaise - row.refundsPaise),
      directContributionPaise: directComplete ? signed(row.grossPaise - row.refundsPaise - row.fulfillmentPaise - row.processingPaise) : null,
      // No invented allocation of shared marketing, overhead, support or tax.
      basis: "before_shared_costs_not_net_profit",
    })),
    target: { monthlyNetProfitPaise: 50_000_000, comparison: "Planning target only; no attainment or forecast inferred from this report window" },
  };
}
