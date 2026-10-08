export type VerifiedRevenueOrder = Readonly<{
  id: string;
  user_id: string | null;
  platform: string | null;
  service_name: string | null;
  charge: number | string | null;
  created_at: string;
}>;

export type VerifiedRefund = Readonly<{
  amount: number | string | null;
  created_at: string;
}>;

export type RevenueTrendPoint = { date: string; gross: number; refunds: number; net: number; orders: number };
export type PlatformRevenueRow = { platform: string; revenue: number; orders: number; aov: number; sharePct: number };

export type VerifiedRevenueDashboard = {
  daily: RevenueTrendPoint[];
  platforms: PlatformRevenueRow[];
  customerContribution: {
    identifiedCustomers: number;
    multiOrderCustomers: number;
    multiOrderCustomerRate: number;
    subsequentOrderRevenue: number;
    subsequentOrderRevenueShare: number;
    anonymousOrUnknownOrders: number;
  };
  quality: { invalidChargeOrders: number; missingPlatformOrders: number; missingCustomerOrders: number };
  bestDay: RevenueTrendPoint | null;
  maxDailyNet: number;
};

const TIME_ZONE = "Asia/Kolkata";

function asAmount(value: number | string | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function dateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return [pick("year"), pick("month"), pick("day")].join("-");
}

export function buildVerifiedRevenueDashboard({ paidOrders, refunds }: { paidOrders: readonly VerifiedRevenueOrder[]; refunds: readonly VerifiedRefund[] }): VerifiedRevenueDashboard {
  const daily = new Map<string, RevenueTrendPoint>();
  const platformMap = new Map<string, { revenue: number; orders: number }>();
  const ordersByCustomer = new Map<string, VerifiedRevenueOrder[]>();
  let gross = 0;
  let invalidChargeOrders = 0;
  let missingPlatformOrders = 0;
  let missingCustomerOrders = 0;

  for (const order of paidOrders) {
    const amount = asAmount(order.charge);
    if (!amount) invalidChargeOrders += 1;
    gross += amount;
    const day = dateKey(order.created_at);
    const dailyRow = daily.get(day) ?? { date: day, gross: 0, refunds: 0, net: 0, orders: 0 };
    dailyRow.gross += amount;
    dailyRow.orders += 1;
    daily.set(day, dailyRow);

    const platform = order.platform?.trim() || "Unspecified";
    if (platform === "Unspecified") missingPlatformOrders += 1;
    const platformRow = platformMap.get(platform) ?? { revenue: 0, orders: 0 };
    platformRow.revenue += amount;
    platformRow.orders += 1;
    platformMap.set(platform, platformRow);

    if (order.user_id) {
      const customerOrders = ordersByCustomer.get(order.user_id) ?? [];
      customerOrders.push(order);
      ordersByCustomer.set(order.user_id, customerOrders);
    } else {
      missingCustomerOrders += 1;
    }
  }

  for (const refund of refunds) {
    const amount = asAmount(refund.amount);
    const day = dateKey(refund.created_at);
    const dailyRow = daily.get(day) ?? { date: day, gross: 0, refunds: 0, net: 0, orders: 0 };
    dailyRow.refunds += amount;
    daily.set(day, dailyRow);
  }

  const dailyRows = [...daily.values()].map((row) => ({ ...row, net: Math.max(0, row.gross - row.refunds) })).sort((a, b) => a.date.localeCompare(b.date));
  const platforms = [...platformMap.entries()].map(([platform, row]) => ({
    platform, revenue: row.revenue, orders: row.orders,
    aov: row.orders ? row.revenue / row.orders : 0,
    sharePct: gross ? (row.revenue / gross) * 100 : 0,
  })).sort((a, b) => b.revenue - a.revenue);

  let multiOrderCustomers = 0;
  let subsequentOrderRevenue = 0;
  for (const customerOrders of ordersByCustomer.values()) {
    const sorted = [...customerOrders].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    if (sorted.length > 1) {
      multiOrderCustomers += 1;
      subsequentOrderRevenue += sorted.slice(1).reduce((sum, order) => sum + asAmount(order.charge), 0);
    }
  }

  const identifiedCustomers = ordersByCustomer.size;
  const bestDay = dailyRows.length ? dailyRows.reduce((best, row) => row.net > best.net ? row : best, dailyRows[0]) : null;

  return {
    daily: dailyRows,
    platforms,
    customerContribution: {
      identifiedCustomers,
      multiOrderCustomers,
      multiOrderCustomerRate: identifiedCustomers ? (multiOrderCustomers / identifiedCustomers) * 100 : 0,
      subsequentOrderRevenue,
      subsequentOrderRevenueShare: gross ? (subsequentOrderRevenue / gross) * 100 : 0,
      anonymousOrUnknownOrders: missingCustomerOrders,
    },
    quality: { invalidChargeOrders, missingPlatformOrders, missingCustomerOrders },
    bestDay,
    maxDailyNet: Math.max(0, ...dailyRows.map((row) => row.net)),
  };
}