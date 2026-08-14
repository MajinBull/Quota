const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const { runBacktestWithData } = require('../src/engine/backtester.ts');

function asset(symbol, prices, category = 'etf') {
  const candles = prices.map(([date, close]) => ({
    date,
    open: close,
    high: close,
    low: close,
    close,
    volume: 1,
  }));

  return {
    symbol,
    category,
    start_date: candles[0].date,
    end_date: candles.at(-1).date,
    data_points: candles.length,
    candles,
  };
}

function portfolio(overrides = {}) {
  return {
    name: 'Test',
    allocations: [{ symbol: 'AAA', percentage: 100 }],
    investmentStrategy: 'lump_sum',
    initialCapital: 100,
    rebalanceFrequency: 'none',
    leverage: 1,
    annualFinancingRate: 0,
    ...overrides,
  };
}

function closeTo(actual, expected, tolerance = 1e-8) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

test('starts at the common asset interval instead of reallocating before launch', () => {
  const data = new Map([
    ['AAA', asset('AAA', [['2020-01-02', 100], ['2021-01-04', 110], ['2021-01-05', 121]])],
    ['BBB', asset('BBB', [['2021-01-04', 100], ['2021-01-05', 50]], 'crypto')],
  ]);
  const result = runBacktestWithData(portfolio({
    allocations: [
      { symbol: 'AAA', percentage: 50 },
      { symbol: 'BBB', percentage: 50 },
    ],
    startYear: 2020,
  }), data);

  assert.ok(result);
  assert.equal(result.startDate, '2021-01-04');
  assert.equal(result.equityCurve.length, 2);
  closeTo(result.metrics.finalValue, 80);
});

test('PAC deposits are external flows and do not create artificial returns', () => {
  const prices = [['2024-01-02', 10], ['2024-02-02', 10], ['2024-03-04', 10]];
  const result = runBacktestWithData(portfolio({
    investmentStrategy: 'pac',
    pacAmount: 50,
    pacFrequency: 'monthly',
  }), new Map([['AAA', asset('AAA', prices)]]));

  assert.ok(result);
  closeTo(result.metrics.finalValue, 200);
  closeTo(result.metrics.totalInvested, 200);
  closeTo(result.metrics.totalReturn, 0);
  closeTo(result.metrics.averageAnnualReturn, 0);
  closeTo(result.metrics.maxDrawdown, 0);
  assert.deepEqual(result.equityCurve.map((point) => point.returns), [0, 0, 0]);
});

test('values on the union calendar while keeping the first date jointly tradable', () => {
  const data = new Map([
    ['AAA', asset('AAA', [['2024-01-05', 100], ['2024-01-06', 101], ['2024-01-08', 102]], 'crypto')],
    ['BBB', asset('BBB', [['2024-01-05', 100], ['2024-01-08', 100]])],
  ]);
  const result = runBacktestWithData(portfolio({
    allocations: [
      { symbol: 'AAA', percentage: 50 },
      { symbol: 'BBB', percentage: 50 },
    ],
  }), data);

  assert.ok(result);
  assert.deepEqual(
    result.equityCurve.map((point) => point.date),
    ['2024-01-05', '2024-01-06', '2024-01-08'],
  );
  closeTo(result.equityCurve[1].value, 100.5);
});

test('legacy portfolios without a leverage model keep fixed-debt behavior', () => {
  const result = runBacktestWithData(portfolio({
    leverage: 2,
    annualFinancingRate: 10,
  }), new Map([['AAA', asset('AAA', [['2024-01-02', 100], ['2025-01-01', 100]])]]));

  assert.ok(result);
  closeTo(result.metrics.finalValue, 90);
  closeTo(result.metrics.totalInterestPaid, 10);
  closeTo(result.metrics.finalDebt, 110);
  closeTo(result.metrics.totalReturn, -10);
});

test('resets a fixed leverage ratio independently from asset rebalancing', () => {
  const result = runBacktestWithData(portfolio({
    leverage: 2,
    leverageType: 'fixed_ratio',
    leverageResetFrequency: 'monthly',
    rebalanceFrequency: 'none',
  }), new Map([['AAA', asset('AAA', [
    ['2024-01-02', 100],
    ['2024-01-03', 80],
    ['2024-02-02', 90],
  ])]]));

  assert.ok(result);
  closeTo(result.equityCurve[1].debt, 100);
  closeTo(result.equityCurve[2].debt, 80);
  closeTo(result.equityCurve[2].grossExposure, 160);
  closeTo(result.metrics.finalValue, 80);
});

test('daily fixed ratio resets exposure and captures volatility drag', () => {
  const result = runBacktestWithData(portfolio({
    leverage: 2,
    leverageType: 'fixed_ratio',
    leverageResetFrequency: 'daily',
  }), new Map([['AAA', asset('AAA', [
    ['2024-01-02', 100],
    ['2024-01-03', 80],
    ['2024-01-04', 100],
  ])]]));

  assert.ok(result);
  closeTo(result.metrics.finalValue, 90);
  closeTo(result.metrics.totalReturn, -10);
  assert.equal(result.metrics.liquidated, false);
});

test('fixed debt keeps the original loan instead of resetting leverage', () => {
  const result = runBacktestWithData(portfolio({
    leverage: 2,
    leverageType: 'fixed_debt',
  }), new Map([['AAA', asset('AAA', [
    ['2024-01-02', 100],
    ['2024-01-03', 80],
    ['2024-01-04', 100],
  ])]]));

  assert.ok(result);
  closeTo(result.metrics.finalValue, 100);
  closeTo(result.metrics.finalDebt, 100);
  closeTo(result.metrics.totalReturn, 0);
});

test('applies leverage to every asset size and shares margin across the account', () => {
  const result = runBacktestWithData(portfolio({
    leverage: 5,
    leverageType: 'fixed_debt',
    allocations: [
      { symbol: 'AAA', percentage: 10 },
      { symbol: 'BBB', percentage: 90 },
    ],
  }), new Map([
    ['AAA', asset('AAA', [['2024-01-02', 100], ['2024-01-03', 1]])],
    ['BBB', asset('BBB', [['2024-01-02', 100], ['2024-01-03', 100]])],
  ]));

  assert.ok(result);
  // AAA starts with size 100 * 10% * 5 = 50 and loses 49.5. Its loss
  // exceeds the unleveraged 10 allocation, but the shared account survives.
  closeTo(result.metrics.finalValue, 50.5);
  closeTo(result.metrics.finalDebt, 400);
  closeTo(result.metrics.totalReturn, -49.5);
  assert.equal(result.metrics.liquidated, false);
});

test('applies the same simple leverage multiplier to each PAC contribution', () => {
  const result = runBacktestWithData(portfolio({
    investmentStrategy: 'pac',
    pacAmount: 50,
    pacFrequency: 'monthly',
    leverage: 3,
    leverageType: 'fixed_debt',
  }), new Map([['AAA', asset('AAA', [
    ['2024-01-02', 100],
    ['2024-02-02', 100],
  ])]]));

  assert.ok(result);
  closeTo(result.metrics.totalInvested, 150);
  closeTo(result.metrics.finalValue, 150);
  closeTo(result.metrics.finalDebt, 300);
  closeTo(result.equityCurve.at(-1).grossExposure, 450);
  closeTo(result.metrics.totalReturn, 0);
});

test('SuperStrategy closes the basket at 10 percent over average and restarts', () => {
  const result = runBacktestWithData(portfolio({
    investmentStrategy: 'super_strategy',
    leverage: 1,
  }), new Map([['AAA', asset('AAA', [
    ['2024-01-02', 100],
    ['2024-01-03', 90],
    ['2024-01-04', 104],
    ['2024-01-05', 105],
  ])]]));

  assert.ok(result);
  // Two equal $10 tranches at 100 and 90 have a weighted average of
  // 94.7368. A close at 104 is below TP, while 105 closes the basket.
  closeTo(result.equityCurve[2].debt, 0);
  closeTo(result.metrics.finalValue, 102.16666666666667);
  closeTo(result.metrics.totalReturn, 2.1666666666666705);
  assert.deepEqual(result.metrics.superStrategy, {
    completedCycles: 1,
    totalEntries: 3,
    openTranches: 1,
    maxOpenTranches: 2,
  });
});

test('SuperStrategy keeps at most ten fixed tranches open without a stop loss', () => {
  const prices = [['2024-01-01', 100]];
  for (let index = 1; index <= 11; index++) {
    prices.push([
      `2024-01-${String(index + 1).padStart(2, '0')}`,
      100 * Math.pow(0.9, index),
    ]);
  }

  const result = runBacktestWithData(portfolio({
    investmentStrategy: 'super_strategy',
    leverage: 1,
  }), new Map([['AAA', asset('AAA', prices)]]));

  assert.ok(result);
  assert.equal(result.metrics.liquidated, false);
  assert.deepEqual(result.metrics.superStrategy, {
    completedCycles: 0,
    totalEntries: 10,
    openTranches: 10,
    maxOpenTranches: 10,
  });
});

test('SuperStrategy applies leverage to tranches with shared account margin', () => {
  const result = runBacktestWithData(portfolio({
    investmentStrategy: 'super_strategy',
    leverage: 5,
    allocations: [
      { symbol: 'AAA', percentage: 10 },
      { symbol: 'BBB', percentage: 90 },
    ],
  }), new Map([
    ['AAA', asset('AAA', [['2024-01-02', 100], ['2024-01-03', 1]])],
    ['BBB', asset('BBB', [['2024-01-02', 100], ['2024-01-03', 100]])],
  ]));

  assert.ok(result);
  // First tranches deploy 10% of each asset budget: $50 gross in total,
  // financed by $40 debt. AAA can lose almost all its tranche while the
  // shared account remains alive because BBB and unused cash cover it.
  closeTo(result.equityCurve[0].grossExposure, 50);
  closeTo(result.equityCurve[0].debt, 40);
  closeTo(result.metrics.finalValue, 95.05);
  assert.equal(result.metrics.liquidated, false);
});

test('supports 5x fixed ratio and liquidates after a loss greater than 20 percent', () => {
  const result = runBacktestWithData(portfolio({
    leverage: 5,
    leverageType: 'fixed_ratio',
    leverageResetFrequency: 'daily',
  }), new Map([['AAA', asset('AAA', [
    ['2024-01-02', 100],
    ['2024-01-03', 79],
  ])]]));

  assert.ok(result);
  assert.equal(result.metrics.liquidated, true);
  assert.equal(result.metrics.liquidationDate, '2024-01-03');
  closeTo(result.metrics.finalValue, 0);
});

test('liquidates when losses exhaust equity', () => {
  const result = runBacktestWithData(portfolio({ leverage: 2 }), new Map([
    ['AAA', asset('AAA', [['2024-01-02', 100], ['2024-01-03', 40]])],
  ]));

  assert.ok(result);
  assert.equal(result.metrics.liquidated, true);
  assert.equal(result.metrics.liquidationDate, '2024-01-03');
  assert.equal(result.endDate, '2024-01-03');
  closeTo(result.metrics.finalValue, 0);
  closeTo(result.metrics.totalReturn, -100);
});
