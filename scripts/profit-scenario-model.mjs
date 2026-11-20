/** Offline planning only. No credentials, network calls, ledger writes, or app imports. */
import { pathToFileURL } from 'node:url';

function nonnegative(name, value) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be a finite nonnegative number`);
  return value;
}
function positive(name, value) {
  nonnegative(name, value);
  if (value === 0) throw new RangeError(`${name} must be greater than zero`);
  return value;
}

/** Margins already include ALL costs and applicable income tax; never subtract them twice. */
export function profitScenarios({
  targetNetProfit = 500_000, netMargins = [0.2, 0.3, 0.4, 0.5],
  netRevenuePerOrder = 500, ordersPerPayingCustomer = 1.5,
  visitorToPayingCustomerRate = 0.02,
} = {}) {
  positive('targetNetProfit', targetNetProfit);
  positive('netRevenuePerOrder', netRevenuePerOrder);
  positive('ordersPerPayingCustomer', ordersPerPayingCustomer);
  if (ordersPerPayingCustomer < 1) throw new RangeError('ordersPerPayingCustomer must be at least one');
  positive('visitorToPayingCustomerRate', visitorToPayingCustomerRate);
  if (visitorToPayingCustomerRate > 1) throw new RangeError('visitorToPayingCustomerRate must be at most one');
  if (!Array.isArray(netMargins) || !netMargins.length) throw new RangeError('netMargins must be nonempty');
  return netMargins.map(netMargin => {
    positive('netMargin', netMargin);
    if (netMargin > 1) throw new RangeError('netMargin must be at most one');
    const requiredNetRevenue = targetNetProfit / netMargin;
    const orders = Math.ceil(requiredNetRevenue / netRevenuePerOrder);
    const payingCustomers = Math.ceil(orders / ordersPerPayingCustomer);
    return {
      netMargin, targetNetProfit, requiredNetRevenue, orders, payingCustomers,
      repeatOrders: orders - payingCustomers,
      qualifiedVisitors: Math.ceil(payingCustomers / visitorToPayingCustomerRate),
    };
  });
}

/**
 * Aggregates supplied by an accountant-approved earned-revenue reconciliation.
 * Exclude GST/indirect tax, unpaid orders, wallet deposits, and unearned balances.
 * Missing costs remain unknown; negative revenue/profit is preserved.
 */
export function profitWaterfall(input) {
  const { earnedRevenueExTax, refundsExTax, fulfillmentCost, processingFees,
    chargebackLoss, variableSupportCost, marketingSpend, fixedOperatingCost,
    depreciation, interest, incomeTaxExpense } = input;
  nonnegative('earnedRevenueExTax', earnedRevenueExTax);
  nonnegative('refundsExTax', refundsExTax);
  const costs = { fulfillmentCost, processingFees, chargebackLoss, variableSupportCost,
    marketingSpend, fixedOperatingCost, depreciation, interest, incomeTaxExpense };
  const missingInputs = [];
  for (const [key, value] of Object.entries(costs)) {
    if (value === null || value === undefined) missingInputs.push(key);
    else nonnegative(key, value);
  }
  const subtract = (base, ...values) => base === null || values.some(v => v == null)
    ? null : values.reduce((total, value) => total - value, base);
  const netRevenue = earnedRevenueExTax - refundsExTax;
  const grossProfit = subtract(netRevenue, fulfillmentCost);
  const contributionProfit = subtract(grossProfit, processingFees, chargebackLoss, variableSupportCost, marketingSpend);
  const operatingProfit = subtract(contributionProfit, fixedOperatingCost, depreciation);
  const profitBeforeTax = subtract(operatingProfit, interest);
  const netProfit = subtract(profitBeforeTax, incomeTaxExpense);
  return { netRevenue, grossProfit, contributionProfit, operatingProfit, profitBeforeTax,
    netProfit, netMargin: netProfit !== null && netRevenue > 0 ? netProfit / netRevenue : null,
    status: missingInputs.length ? 'INCOMPLETE' : 'COMPLETE_INPUTS_NOT_AUDITED', missingInputs };
}

export const scenarioAssumptions = Object.freeze({
  status: 'ASSUMPTIONS_ONLY_NOT_A_FORECAST', currency: 'INR', period: 'month',
  targetNetProfit: 500_000, netRevenuePerOrder: 500, ordersPerPayingCustomer: 1.5,
  visitorToPayingCustomerRate: 0.02,
  note: 'Net revenue excludes indirect tax and refunds; final net margin includes all costs and income tax. Visitors convert to unique paying customers, not orders. Repeat orders are not a customer retention rate.',
});

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rows = profitScenarios(scenarioAssumptions);
  if (process.argv.includes('--csv')) {
    console.log(Object.keys(rows[0]).join(','));
    for (const row of rows) console.log(Object.values(row).join(','));
  } else console.log(JSON.stringify({ assumptions: scenarioAssumptions, scenarios: rows }, null, 2));
}
