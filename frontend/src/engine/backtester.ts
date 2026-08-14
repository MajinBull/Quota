import { parseISO, differenceInDays, addMonths, addYears, isAfter, isBefore, getYear } from 'date-fns';
import type {
  Portfolio,
  AssetData,
  BacktestResult,
  EquityPoint,
  PerformanceMetrics,
  PortfolioAllocation,
  AssetPerformance,
  YearlyBreakdown
} from '../types';
import { loadAssetData } from '../utils/dataLoader';

interface AssetPosition {
  symbol: string;
  shares: number;
  targetPercentage: number;
}

// Future use: detailed portfolio snapshot tracking
// interface PortfolioSnapshot {
//   date: string;
//   positions: AssetPosition[];
//   cash: number;
//   totalValue: number;
// }

/**
 * Run a backtest locally in the browser for a given portfolio.
 */
export async function runBacktest(portfolio: Portfolio): Promise<BacktestResult | null> {
  try {
    // 1. Load all asset data
    const assetDataMap = new Map<string, AssetData>();
    for (const allocation of portfolio.allocations) {
      const data = await loadAssetData(allocation.symbol);
      if (!data) {
        throw new Error(`Failed to load data for ${allocation.symbol}`);
      }
      assetDataMap.set(allocation.symbol, data);
    }

    return runBacktestWithData(portfolio, assetDataMap);
  } catch (error) {
    console.error('Backtest error:', error);
    return null;
  }
}

/**
 * Deterministic core used by the browser worker and automated tests.
 */
export function runBacktestWithData(
  portfolio: Portfolio,
  assetDataMap: Map<string, AssetData>
): BacktestResult | null {
  try {
    const commonRange = findCommonDateRange(Array.from(assetDataMap.values()));
    if (!commonRange) {
      throw new Error('No common date range found');
    }

    // A portfolio is simulated only while every selected asset is available.
    // This avoids silently reallocating capital before a newer asset launches.
    const requestedStart = portfolio.startYear ? `${portfolio.startYear}-01-01` : commonRange.start;
    const startDate = requestedStart > commonRange.start ? requestedStart : commonRange.start;
    const endDate = commonRange.end;
    if (startDate > endDate) {
      throw new Error('Selected start year is outside the common data range');
    }

    // 3. Build price map (symbol -> date -> close price)
    const priceMap = buildPriceMap(assetDataMap);

    // 4. Run simulation
    const simResult = simulatePortfolio(
      portfolio,
      priceMap,
      assetDataMap,
      startDate,
      endDate
    );

    // 5. Build asset performances array
    const assetPerformances: AssetPerformance[] = [];
    for (const [symbol, values] of simResult.assetPerformances.entries()) {
      // Find last non-null value
      let finalIndex = 100;
      for (let i = values.length - 1; i >= 0; i--) {
        const value = values[i];
        if (value !== null) {
          finalIndex = value;
          break;
        }
      }
      const finalReturn = finalIndex - 100;
      assetPerformances.push({
        symbol,
        values,
        finalReturn
      });
    }

    // 6. Build yearly breakdown
    const yearlyBreakdown: YearlyBreakdown[] = [];
    const years = Array.from(simResult.yearlyData.keys()).sort();
    let cumulativeFactor = 1;

    years.forEach((year) => {
      const data = simResult.yearlyData.get(year)!;
      const yearPoints = simResult.equityCurve.filter(
        point => getYear(parseISO(point.date)) === year
      );
      const yearlyFactor = yearPoints.reduce(
        (factor, point) => factor * (1 + point.returns / 100),
        1
      );
      const yearlyReturn = (yearlyFactor - 1) * 100;
      cumulativeFactor *= yearlyFactor;
      const cumulativeReturn = (cumulativeFactor - 1) * 100;

      yearlyBreakdown.push({
        year,
        portfolioValue: data.value,
        investedCapital: data.invested,
        yearlyReturn,
        cumulativeReturn
      });
    });

    // 7. Calculate metrics
    const metrics = calculateMetrics(
      simResult.equityCurve,
      portfolio.initialCapital,
      simResult.totalInvested,
      assetPerformances,
      simResult.totalInterestPaid,
      simResult.finalDebt,
      simResult.maxEffectiveLeverage,
      simResult.liquidated,
      simResult.liquidationDate
    );

    return {
      portfolio,
      equityCurve: simResult.equityCurve,
      assetPerformances,
      yearlyBreakdown,
      metrics,
      startDate: simResult.equityCurve[0]?.date ?? startDate,
      endDate: simResult.equityCurve.at(-1)?.date ?? endDate
    };
  } catch (error) {
    console.error('Backtest error:', error);
    return null;
  }
}

/**
 * Find overlapping date range across all assets
 */
function findCommonDateRange(assets: AssetData[]): { start: string; end: string } | null {
  if (assets.length === 0) return null;

  let latestStart = assets[0].start_date;
  let earliestEnd = assets[0].end_date;

  for (const asset of assets) {
    if (isAfter(parseISO(asset.start_date), parseISO(latestStart))) {
      latestStart = asset.start_date;
    }
    if (isBefore(parseISO(asset.end_date), parseISO(earliestEnd))) {
      earliestEnd = asset.end_date;
    }
  }

  // Ensure we have a valid range
  if (isAfter(parseISO(latestStart), parseISO(earliestEnd))) {
    return null;
  }

  return { start: latestStart, end: earliestEnd };
}

/**
 * Build a map of symbol -> date -> price
 */
function buildPriceMap(assetDataMap: Map<string, AssetData>): Map<string, Map<string, number>> {
  const priceMap = new Map<string, Map<string, number>>();

  for (const [symbol, assetData] of assetDataMap.entries()) {
    const datePriceMap = new Map<string, number>();

    for (const candle of assetData.candles) {
      datePriceMap.set(candle.date, candle.close);
    }

    priceMap.set(symbol, datePriceMap);
  }

  return priceMap;
}

/**
 * Get price for an asset on a specific date, using last known price if not available
 */
function getPrice(
  symbol: string,
  date: string,
  priceMap: Map<string, Map<string, number>>,
  lastKnownPrices: Map<string, number>
): number {
  const price = priceMap.get(symbol)?.get(date);
  if (price && price > 0) {
    return price;
  }
  // Use last known price if current price not available
  return lastKnownPrices.get(symbol) || 0;
}

/**
 * Calculate which assets are available on a given date and their proportional allocations
 */
function getActiveAllocations(
  portfolio: Portfolio,
  date: string,
  assetDataMap: Map<string, AssetData>
): PortfolioAllocation[] {
  // Find which assets have data available for this date
  const availableAssets = portfolio.allocations.filter(alloc => {
    const assetData = assetDataMap.get(alloc.symbol);
    if (!assetData) return false;
    return date >= assetData.start_date && date <= assetData.end_date;
  });

  if (availableAssets.length === 0) {
    return [];
  }

  // Calculate total percentage of available assets
  const totalAvailablePercentage = availableAssets.reduce(
    (sum, alloc) => sum + alloc.percentage,
    0
  );

  // Redistribute percentages proportionally
  return availableAssets.map(alloc => ({
    symbol: alloc.symbol,
    percentage: (alloc.percentage / totalAvailablePercentage) * 100
  }));
}

/**
 * Simulate portfolio day by day
 */
function simulatePortfolio(
  portfolio: Portfolio,
  priceMap: Map<string, Map<string, number>>,
  assetDataMap: Map<string, AssetData>,
  startDate: string,
  endDate: string
): {
  equityCurve: EquityPoint[];
  assetPerformances: Map<string, Array<number | null>>;
  totalInvested: number;
  yearlyData: Map<number, { value: number; invested: number }>;
  totalInterestPaid: number;
  finalDebt: number;
  maxEffectiveLeverage: number;
  liquidated: boolean;
  liquidationDate?: string;
} {
  const equityCurve: EquityPoint[] = [];
  const positions: AssetPosition[] = [];

  // Track performance per asset (indexed to 100 at start)
  const assetPerformances = new Map<string, Array<number | null>>();
  const assetInitialPrices = new Map<string, number>();

  // Track yearly snapshots
  const yearlyData = new Map<number, { value: number; invested: number }>();

  // Track last known prices for each asset (for missing data handling)
  const lastKnownPrices = new Map<string, number>();

  // Valuations use the union of market calendars, while orders are allowed
  // only on dates when every selected market has a fresh valid close.
  const commonTradingDates = getCommonTradingDates(priceMap, startDate, endDate);
  if (commonTradingDates.length === 0) {
    throw new Error('No common trading dates found for the selected assets');
  }
  const firstTradingDate = commonTradingDates[0];
  const lastTradingDate = commonTradingDates[commonTradingDates.length - 1];
  const commonTradingDateSet = new Set(commonTradingDates);
  const allDates = getValuationDates(priceMap, firstTradingDate, lastTradingDate);

  let cash = portfolio.initialCapital;
  let totalInvested = portfolio.initialCapital;
  let lastRebalanceDate = allDates[0];
  let lastPACDate = allDates[0];
  let previousValue = portfolio.initialCapital;
  let performanceIndex = 100;
  let debt = 0;
  let totalInterestPaid = 0;
  let maxEffectiveLeverage = portfolio.leverage ?? 1;
  let liquidated = false;
  let liquidationDate: string | undefined;
  const leverage = Math.max(1, Math.min(3, portfolio.leverage ?? 1));
  const annualFinancingRate = Math.max(0, portfolio.annualFinancingRate ?? 0) / 100;

  // Initialize asset performances
  portfolio.allocations.forEach(alloc => {
    assetPerformances.set(alloc.symbol, []);
  });

  for (let i = 0; i < allDates.length; i++) {
    const date = allDates[i];
    const year = getYear(parseISO(date));
    const canTradeAllAssets = commonTradingDateSet.has(date);

    // Financing accrues on actual elapsed calendar days, including weekends.
    if (i > 0 && debt > 0 && annualFinancingRate > 0) {
      const elapsedDays = Math.max(0, differenceInDays(parseISO(date), parseISO(allDates[i - 1])));
      const interest = debt * annualFinancingRate * (elapsedDays / 365);
      debt += interest;
      totalInterestPaid += interest;
    }

    // Update last known prices for all assets
    for (const allocation of portfolio.allocations) {
      const price = priceMap.get(allocation.symbol)?.get(date);
      if (price && price > 0) {
        lastKnownPrices.set(allocation.symbol, price);
      }
    }

    // Get active allocations for this date (only assets with available data)
    const activeAllocations = getActiveAllocations(portfolio, date, assetDataMap);

    // Check if we need to add PAC capital. External flows are excluded from
    // performance returns so deposits cannot appear as investment gains.
    let pacAdded = false;
    let externalFlow = 0;
    if (portfolio.investmentStrategy === 'pac' && portfolio.pacAmount && portfolio.pacFrequency) {
      const shouldAddPAC = canTradeAllAssets
        && shouldAddPACOnDate(date, lastPACDate, portfolio.pacFrequency);

      if (shouldAddPAC && date !== startDate) {
        cash += portfolio.pacAmount;
        totalInvested += portfolio.pacAmount;
        externalFlow = portfolio.pacAmount;
        lastPACDate = date;
        pacAdded = true;
      }
    }

    // Check if we need to rebalance
    const scheduledRebalance = canTradeAllAssets
      && shouldRebalanceOnDate(date, lastRebalanceDate, portfolio.rebalanceFrequency);
    const shouldRebalance = positions.length === 0 ||
      pacAdded ||
      scheduledRebalance;

    if (shouldRebalance && activeAllocations.length > 0) {
      // Sell all positions (if any)
      if (positions.length > 0) {
        const liquidatedValue = liquidatePositions(positions, priceMap, date, lastKnownPrices);
        cash += liquidatedValue;
        positions.length = 0;
      }

      const netEquity = cash - debt;
      if (netEquity <= 0) {
        cash = 0;
        debt = 0;
        liquidated = true;
        liquidationDate = date;
      }

      // Adjust borrowing to the target gross exposure. Old saved portfolios
      // default to 1x and therefore retain the original behavior.
      const targetGrossExposure = liquidated ? 0 : netEquity * leverage;
      const targetDebt = liquidated ? 0 : Math.max(0, targetGrossExposure - netEquity);
      cash += targetDebt - debt;
      debt = targetDebt;

      // Buy new positions according to ACTIVE allocations (only available assets)
      const totalValue = targetGrossExposure;
      for (const allocation of activeAllocations) {
        const targetValue = totalValue * (allocation.percentage / 100);
        const price = getPrice(allocation.symbol, date, priceMap, lastKnownPrices);

        if (price > 0) {
          const shares = targetValue / price;
          positions.push({
            symbol: allocation.symbol,
            shares,
            targetPercentage: allocation.percentage
          });
          cash -= targetValue;
        }
      }

      // Only update rebalance date if it's a scheduled rebalance
      // (NOT for PAC-triggered rebalances, to keep scheduled timing correct)
      if (scheduledRebalance) {
        lastRebalanceDate = date;
      }
    }

    // Track asset performances (indexed) - with null for unavailable dates
    portfolio.allocations.forEach(alloc => {
      const assetData = assetDataMap.get(alloc.symbol);
      if (!assetData) {
        assetPerformances.get(alloc.symbol)?.push(null);
        return;
      }

      // Check if asset is available on this date
      const isAvailable = date >= assetData.start_date && date <= assetData.end_date;

      if (isAvailable) {
        const price = getPrice(alloc.symbol, date, priceMap, lastKnownPrices);
        if (price > 0) {
          if (!assetInitialPrices.has(alloc.symbol)) {
            // First day this asset is available: set initial price and index to 100
            assetInitialPrices.set(alloc.symbol, price);
            assetPerformances.get(alloc.symbol)?.push(100);
          } else {
            const initialPrice = assetInitialPrices.get(alloc.symbol)!;
            const indexedValue = (price / initialPrice) * 100;
            assetPerformances.get(alloc.symbol)?.push(indexedValue);
          }
        } else {
          assetPerformances.get(alloc.symbol)?.push(null);
        }
      } else {
        // Asset not yet available - push null (line will not show on graph for these dates)
        assetPerformances.get(alloc.symbol)?.push(null);
      }
    });

    // Calculate current portfolio value
    const positionsValue = positions.reduce((sum, pos) => {
      const price = getPrice(pos.symbol, date, priceMap, lastKnownPrices);
      return sum + (pos.shares * price);
    }, 0);

    let totalValue = positionsValue + cash - debt;
    const grossExposure = positionsValue + Math.max(0, cash);

    if (totalValue <= 0 && !liquidated) {
      positions.length = 0;
      cash = 0;
      debt = 0;
      totalValue = 0;
      liquidated = true;
      liquidationDate = date;
    }

    if (totalValue > 0) {
      maxEffectiveLeverage = Math.max(maxEffectiveLeverage, grossExposure / totalValue);
    }
    const dailyReturn = i > 0 && previousValue > 0
      ? (((totalValue - externalFlow) / previousValue) - 1) * 100
      : 0;
    performanceIndex *= Math.max(0, 1 + dailyReturn / 100);

    equityCurve.push({
      date,
      value: totalValue,
      returns: dailyReturn,
      investedCapital: totalInvested,
      debt,
      grossExposure,
      performanceIndex
    });

    // Store year-end snapshot
    if (liquidated || i === allDates.length - 1 || getYear(parseISO(allDates[i + 1])) !== year) {
      yearlyData.set(year, { value: totalValue, invested: totalInvested });
    }

    previousValue = totalValue;

    if (liquidated) break;
  }

  return {
    equityCurve,
    assetPerformances,
    totalInvested,
    yearlyData,
    totalInterestPaid,
    finalDebt: debt,
    maxEffectiveLeverage,
    liquidated,
    liquidationDate
  };
}

/**
 * Dates on which every selected asset has a fresh, valid close. Portfolio
 * orders are restricted to these dates so stale prices are never traded.
 */
function getCommonTradingDates(
  priceMap: Map<string, Map<string, number>>,
  startDate: string,
  endDate: string
): string[] {
  const maps = Array.from(priceMap.values());
  if (maps.length === 0) return [];

  return Array.from(maps[0].entries())
    .filter(([date, price]) =>
      date >= startDate &&
      date <= endDate &&
      price > 0 &&
      maps.every(map => (map.get(date) ?? 0) > 0)
    )
    .map(([date]) => date)
    .sort();
}

/**
 * Valuation dates are the union of all selected market calendars. This keeps
 * real crypto weekend moves (and different international holidays) while the
 * execution path above still prevents orders against a stale close.
 */
function getValuationDates(
  priceMap: Map<string, Map<string, number>>,
  startDate: string,
  endDate: string
): string[] {
  const dates = new Set<string>();

  for (const map of priceMap.values()) {
    for (const [date, price] of map.entries()) {
      if (date >= startDate && date <= endDate && price > 0) {
        dates.add(date);
      }
    }
  }

  return Array.from(dates).sort();
}

/**
 * Liquidate all positions and return total cash
 */
function liquidatePositions(
  positions: AssetPosition[],
  priceMap: Map<string, Map<string, number>>,
  date: string,
  lastKnownPrices: Map<string, number>
): number {
  return positions.reduce((total, pos) => {
    const price = getPrice(pos.symbol, date, priceMap, lastKnownPrices);
    return total + (pos.shares * price);
  }, 0);
}

/**
 * Determine if rebalancing should occur on this date
 */
function shouldRebalanceOnDate(
  currentDate: string,
  lastRebalanceDate: string,
  frequency: Portfolio['rebalanceFrequency']
): boolean {
  if (frequency === 'none') return false;

  const current = parseISO(currentDate);
  const last = parseISO(lastRebalanceDate);

  switch (frequency) {
    case 'monthly':
      return differenceInDays(current, addMonths(last, 1)) >= 0;
    case 'quarterly':
      return differenceInDays(current, addMonths(last, 3)) >= 0;
    case 'yearly':
      return differenceInDays(current, addYears(last, 1)) >= 0;
    default:
      return false;
  }
}

/**
 * Determine if PAC contribution should be added on this date
 */
function shouldAddPACOnDate(
  currentDate: string,
  lastPACDate: string,
  frequency: 'monthly' | 'quarterly' | 'yearly'
): boolean {
  const current = parseISO(currentDate);
  const last = parseISO(lastPACDate);

  switch (frequency) {
    case 'monthly':
      return differenceInDays(current, addMonths(last, 1)) >= 0;
    case 'quarterly':
      return differenceInDays(current, addMonths(last, 3)) >= 0;
    case 'yearly':
      return differenceInDays(current, addYears(last, 1)) >= 0;
    default:
      return false;
  }
}

/**
 * Calculate performance metrics from equity curve
 */
function calculateMetrics(
  equityCurve: EquityPoint[],
  initialCapital: number,
  totalInvested: number,
  assetPerformances: AssetPerformance[],
  totalInterestPaid = 0,
  finalDebt = 0,
  maxEffectiveLeverage = 1,
  liquidated = false,
  liquidationDate?: string
): PerformanceMetrics {
  if (equityCurve.length === 0) {
    return createEmptyMetrics(initialCapital, totalInvested);
  }

  const finalValue = equityCurve[equityCurve.length - 1].value;
  const totalFactor = equityCurve.reduce(
    (factor, point) => factor * Math.max(0, 1 + point.returns / 100),
    1
  );
  const totalReturn = (totalFactor - 1) * 100;

  // Time-weighted CAGR: deposits and withdrawals do not inflate performance.
  const elapsedYears = Math.max(
    0,
    differenceInDays(
      parseISO(equityCurve[equityCurve.length - 1].date),
      parseISO(equityCurve[0].date)
    ) / 365.25
  );
  const averageAnnualReturn = elapsedYears > 0
    ? (Math.pow(totalFactor, 1 / elapsedYears) - 1) * 100
    : totalReturn;

  // Calculate daily returns array
  const dailyReturns = equityCurve.slice(1).map(point => point.returns);
  const meanReturn = dailyReturns.length > 0
    ? dailyReturns.reduce((sum, value) => sum + value, 0) / dailyReturns.length
    : 0;
  const returnVariance = dailyReturns.length > 1
    ? dailyReturns.reduce((sum, value) => sum + Math.pow(value - meanReturn, 2), 0) / (dailyReturns.length - 1)
    : 0;
  const observationsPerYear = elapsedYears > 0 ? dailyReturns.length / elapsedYears : 0;
  const annualizedVolatility = Math.sqrt(returnVariance) * Math.sqrt(observationsPerYear);

  // Max Drawdown
  const { maxDrawdown, maxDrawdownDate } = calculateMaxDrawdown(equityCurve);

  // Best and worst days
  const bestDay = dailyReturns.length > 0 ? Math.max(...dailyReturns) : 0;
  const worstDay = dailyReturns.length > 0 ? Math.min(...dailyReturns) : 0;

  // Best and worst assets
  let bestAsset: string | undefined;
  let bestAssetReturn: number | undefined;
  let worstAsset: string | undefined;
  let worstAssetReturn: number | undefined;

  if (assetPerformances.length > 0) {
    const sorted = [...assetPerformances].sort((a, b) => b.finalReturn - a.finalReturn);
    bestAsset = sorted[0].symbol;
    bestAssetReturn = sorted[0].finalReturn;
    worstAsset = sorted[sorted.length - 1].symbol;
    worstAssetReturn = sorted[sorted.length - 1].finalReturn;
  }

  return {
    totalReturn,
    averageAnnualReturn,
    annualizedVolatility,
    maxDrawdown,
    maxDrawdownDate,
    bestDay,
    worstDay,
    finalValue,
    initialValue: initialCapital,
    totalInvested,
    totalInterestPaid,
    finalDebt,
    maxEffectiveLeverage,
    liquidated,
    liquidationDate,
    bestAsset,
    bestAssetReturn,
    worstAsset,
    worstAssetReturn
  };
}

/**
 * Calculate maximum drawdown
 */
function calculateMaxDrawdown(equityCurve: EquityPoint[]): { maxDrawdown: number; maxDrawdownDate: string } {
  let maxDrawdown = 0;
  let maxDrawdownDate = equityCurve[0]?.date || '';
  let peak = 0;

  for (const point of equityCurve) {
    const indexedValue = point.performanceIndex ?? point.value;
    if (indexedValue > peak) {
      peak = indexedValue;
    }

    // Drawdown deve essere negativo: (valore_corrente - picco) / picco
    const drawdown = peak > 0 ? ((indexedValue - peak) / peak) * 100 : 0;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownDate = point.date;
    }
  }

  return { maxDrawdown, maxDrawdownDate };
}

/**
 * Create empty metrics object
 */
function createEmptyMetrics(initialCapital: number, totalInvested: number): PerformanceMetrics {
  return {
    totalReturn: 0,
    averageAnnualReturn: 0,
    annualizedVolatility: 0,
    maxDrawdown: 0,
    maxDrawdownDate: '',
    bestDay: 0,
    worstDay: 0,
    finalValue: initialCapital,
    initialValue: initialCapital,
    totalInvested,
    bestAsset: undefined,
    bestAssetReturn: undefined,
    worstAsset: undefined,
    worstAssetReturn: undefined
  };
}
