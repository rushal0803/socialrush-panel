export const MONTHLY_REVENUE_TARGET = 500_000;
export const TARGET_AOV = 1_500;
export const TRAFFIC_TARGET_FOR_REVENUE_MATH = 100_000;
export const TARGET_REVENUE_PER_VISITOR_AT_100K =
  MONTHLY_REVENUE_TARGET / TRAFFIC_TARGET_FOR_REVENUE_MATH;

export type RevenueGoalPlatform = {
  platform: string;
  revenue: number;
  orders: number;
  sharePct: number;
};

export type RevenueGoalInput = {
  now: Date;
  grossRevenue: number;
  refunds: number;
  netRevenue: number;
  paidOrders: number;
  aov: number;
  repeatRevenueShare: number;
  multiOrderCustomerRate: number;
  topPlatform: RevenueGoalPlatform | null;
};

export type RevenueGoalSignal = {
  status: "scale" | "build" | "fix" | "watch";
  title: string;
  reason: string;
  action: string;
  href: string;
  score: number;
};

function indiaDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: pick("year"), month: pick("month"), day: pick("day") };
}

export function indiaMonthKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const { year, month } = indiaDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function buildMonthlyRevenueGoal(input: RevenueGoalInput) {
  const { year, month, day } = indiaDateParts(input.now);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const elapsedDays = Math.max(1, day);
  const remainingDays = Math.max(0, daysInMonth - elapsedDays);
  const targetGap = Math.max(0, MONTHLY_REVENUE_TARGET - input.netRevenue);
  const progressPct = Math.min(100, (input.netRevenue / MONTHLY_REVENUE_TARGET) * 100);
  const expectedMtdRevenue = (MONTHLY_REVENUE_TARGET / daysInMonth) * elapsedDays;
  const expectedMtdProgressPct = (elapsedDays / daysInMonth) * 100;
  const paceDelta = input.netRevenue - expectedMtdRevenue;
  const targetDailyRevenue = MONTHLY_REVENUE_TARGET / daysInMonth;
  const observedDailyRevenue = input.netRevenue / elapsedDays;
  const requiredDailyRevenue =
    targetGap === 0 ? 0 : targetGap / Math.max(1, remainingDays || 1);
  const ordersAtCurrentAov = input.aov > 0 ? Math.ceil(MONTHLY_REVENUE_TARGET / input.aov) : null;
  const remainingOrdersAtCurrentAov = input.aov > 0 ? Math.ceil(targetGap / input.aov) : null;
  const ordersAtTargetAov = Math.ceil(MONTHLY_REVENUE_TARGET / TARGET_AOV);
  const signals: RevenueGoalSignal[] = [];

  if (input.netRevenue >= expectedMtdRevenue) {
    signals.push({
      status: "scale",
      title: "Verified revenue is on or ahead of month-to-date target pace",
      reason: `₹${Math.round(input.netRevenue).toLocaleString("en-IN")} net vs ₹${Math.round(expectedMtdRevenue).toLocaleString("en-IN")} target pace through day ${elapsedDays}.`,
      action: "Protect the acquisition and retention paths already producing verified paid-order revenue.",
      href: "/admin/analytics",
      score: 95,
    });
  } else {
    signals.push({
      status: "fix",
      title: "Month-to-date revenue is behind the ₹5L target pace",
      reason: `₹${Math.round(Math.abs(paceDelta)).toLocaleString("en-IN")} below target pace through day ${elapsedDays}.`,
      action: "Increase verified revenue per order and repeat purchase contribution before assuming more traffic alone will close the gap.",
      href: "/admin/analytics",
      score: 125,
    });
  }

  if (input.aov > 0 && input.aov < TARGET_AOV) {
    signals.push({
      status: "build",
      title: "Average order value is below the existing ₹1,500 operating target",
      reason: `Current verified AOV is ₹${Math.round(input.aov).toLocaleString("en-IN")}.`,
      action: "Use larger quantities, relevant packages and campaign stacks while preserving live catalog pricing and checkout controls.",
      href: "/packages",
      score: 115,
    });
  } else if (input.aov >= TARGET_AOV) {
    signals.push({
      status: "scale",
      title: "Average order value supports the revenue target",
      reason: `Verified AOV is ₹${Math.round(input.aov).toLocaleString("en-IN")}, meeting the ₹${TARGET_AOV.toLocaleString("en-IN")} operating target.`,
      action: "Protect current AOV while scaling qualified acquisition sources and repeat demand.",
      href: "/admin/analytics",
      score: 85,
    });
  } else {
    signals.push({
      status: "watch",
      title: "AOV needs more verified paid-order data",
      reason: "No positive verified average order value is available for the current month.",
      action: "Use verified paid orders before making package or acquisition decisions.",
      href: "/admin/analytics",
      score: 100,
    });
  }

  if (input.repeatRevenueShare < 25) {
    signals.push({
      status: "build",
      title: "Repeat-order revenue has room to contribute more",
      reason: `${input.repeatRevenueShare.toFixed(1)}% of current-month gross revenue comes from second-and-later orders in the measured customer set.`,
      action: "Use the retention and reactivation journeys to increase customer value without auto-ordering or inventing discounts.",
      href: "/admin/crm/reactivation",
      score: 105,
    });
  } else {
    signals.push({
      status: "scale",
      title: "Repeat-order contribution is healthy",
      reason: `${input.repeatRevenueShare.toFixed(1)}% of current-month gross revenue comes from second-and-later orders in the measured customer set.`,
      action: "Keep repeat and reactivation journeys active while monitoring support, refill and refund quality.",
      href: "/admin/crm/reactivation",
      score: 78,
    });
  }

  if (input.topPlatform && input.topPlatform.orders >= 2) {
    signals.push({
      status: input.topPlatform.sharePct >= 70 ? "watch" : "scale",
      title: input.topPlatform.sharePct >= 70
        ? `Revenue is concentrated in ${input.topPlatform.platform}`
        : `Protect the leading ${input.topPlatform.platform} revenue path`,
      reason: `${input.topPlatform.platform} contributes ${input.topPlatform.sharePct.toFixed(1)}% of verified current-month gross revenue from ${input.topPlatform.orders} paid orders.`,
      action: input.topPlatform.sharePct >= 70
        ? "Keep the winner healthy while building a second proven revenue path to reduce concentration risk."
        : "Support this platform with qualified SEO, distribution and reactivation while preserving service quality.",
      href: "/admin/analytics",
      score: 82,
    });
  }

  signals.push({
    status: "build",
    title: "Connect the ₹5L goal to the 100K traffic engine",
    reason: `₹5L at 100,000 monthly visitors equals ₹${TARGET_REVENUE_PER_VISITOR_AT_100K.toFixed(2)} net revenue per visitor as target arithmetic.`,
    action: "Use the traffic workspace to improve qualified acquisition and attribution; do not treat the 100K traffic target as a revenue forecast.",
    href: "/admin/growth/traffic",
    score: 72,
  });

  signals.push({
    status: "build",
    title: "Use agency and reseller workflows for recurring higher-value demand",
    reason: "The existing reseller engine can organize client work, saved monthly plans and renewals without bypassing normal checkout controls.",
    action: "Review client plans and renewal opportunities when verified direct-order growth alone is not enough.",
    href: "/dashboard/reseller",
    score: 68,
  });

  return {
    target: MONTHLY_REVENUE_TARGET,
    grossRevenue: input.grossRevenue,
    refunds: input.refunds,
    netRevenue: input.netRevenue,
    paidOrders: input.paidOrders,
    aov: input.aov,
    progressPct,
    targetGap,
    daysInMonth,
    elapsedDays,
    remainingDays,
    expectedMtdRevenue,
    expectedMtdProgressPct,
    paceDelta,
    targetDailyRevenue,
    observedDailyRevenue,
    requiredDailyRevenue,
    ordersAtCurrentAov,
    remainingOrdersAtCurrentAov,
    ordersAtTargetAov,
    repeatRevenueShare: input.repeatRevenueShare,
    multiOrderCustomerRate: input.multiOrderCustomerRate,
    topPlatform: input.topPlatform,
    signals: signals.sort((a, b) => b.score - a.score),
    note:
      "₹5,00,000 is a roadmap target, not a forecast. All current revenue, AOV and repeat-order figures must come from verified paid-order records and completed refunds; the order-count and daily-pace figures are target arithmetic only.",
  };
}
