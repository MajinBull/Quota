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

test('accrues financing cost on leveraged exposure using elapsed calendar days', () => {
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
