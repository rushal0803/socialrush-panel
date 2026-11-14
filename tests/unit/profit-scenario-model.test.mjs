import test from 'node:test';
import assert from 'node:assert/strict';
import { profitScenarios, profitWaterfall } from '../../scripts/profit-scenario-model.mjs';

test('net profit target requires revenue above the target at 20–50% margins', () => {
  const rows = profitScenarios();
  assert.deepEqual(rows.map(r => r.requiredNetRevenue), [2500000, 500000 / 0.3, 1250000, 1000000]);
  for (const r of rows) {
    assert.ok(r.requiredNetRevenue * r.netMargin >= 499999.99);
    assert.ok(r.orders * 500 >= r.requiredNetRevenue);
    assert.equal(r.payingCustomers + r.repeatOrders, r.orders);
    assert.ok(r.qualifiedVisitors * 0.02 >= r.payingCustomers);
  }
});
test('orders and customer conversion use distinct denominators', () => {
  const [r] = profitScenarios({ targetNetProfit: 1000, netMargins: [0.5], netRevenuePerOrder: 100, ordersPerPayingCustomer: 2, visitorToPayingCustomerRate: 0.1 });
  assert.deepEqual([r.orders, r.payingCustomers, r.repeatOrders, r.qualifiedVisitors], [20, 10, 10, 100]);
});
const inputs = { earnedRevenueExTax: 1000, refundsExTax: 100, fulfillmentCost: 300,
  processingFees: 20, chargebackLoss: 10, variableSupportCost: 20, marketingSpend: 100,
  fixedOperatingCost: 100, depreciation: 10, interest: 10, incomeTaxExpense: 30 };
test('waterfall reconciles costs once and ignores wallet deposits/unpaid values', () => {
  const r = profitWaterfall({ ...inputs, walletDeposits: 999999, unpaidOrders: 888888 });
  assert.deepEqual([r.netRevenue, r.grossProfit, r.contributionProfit, r.operatingProfit, r.profitBeforeTax, r.netProfit], [900, 600, 450, 340, 330, 300]);
  assert.equal(r.status, 'COMPLETE_INPUTS_NOT_AUDITED');
});
test('refund-only periods and losses stay negative', () => {
  const r = profitWaterfall({ ...inputs, earnedRevenueExTax: 0 });
  assert.equal(r.netRevenue, -100);
  assert.equal(r.netProfit, -700);
  assert.equal(r.netMargin, null);
});
test('missing costs cannot silently become zero profit expenses', () => {
  const r = profitWaterfall({ ...inputs, fulfillmentCost: null, incomeTaxExpense: undefined });
  assert.equal(r.netRevenue, 900);
  assert.equal(r.grossProfit, null);
  assert.equal(r.netProfit, null);
  assert.equal(r.status, 'INCOMPLETE');
  assert.deepEqual(r.missingInputs, ['fulfillmentCost', 'incomeTaxExpense']);
});
test('invalid assumptions and nonfinite or negative expenses fail closed', () => {
  for (const config of [{ netMargins: [0] }, { netMargins: [1.1] }, { netMargins: [] }, { netRevenuePerOrder: 0 }, { ordersPerPayingCustomer: 0.5 }, { visitorToPayingCustomerRate: 1.1 }, { targetNetProfit: Infinity }]) assert.throws(() => profitScenarios(config), RangeError);
  for (const value of [-1, NaN, Infinity, '100']) assert.throws(() => profitWaterfall({ ...inputs, processingFees: value }), RangeError);
});
