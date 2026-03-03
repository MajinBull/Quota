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
} from '@quota/shared/types';

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
 * Run backtest simulation for a given portfolio
 * @param portfolio Portfolio configuration
 * @param assetDataMap Map of asset symbols to their historical data (pre-loaded)
 */
export function runBacktest(
  portfolio: Portfolio,
  assetDataMap: Map<string, AssetData>
): BacktestResult | null {
  try {
    // 1. Determine date range
    let startDate: string;
    let endDate: string;

    if (portfolio.startYear) {
      // Use user-specified start year
      startDate = `${portfolio.startYear}-01-01`;

      // Find earliest available date among all assets
      const earliestDates = Array.from(assetDataMap.values()).map(d => d.start_date);
      const overallEarliest = earliestDates.sort()[0];

      // If requested start is before earliest data, use earliest data
      if (startDate < overallEarliest) {
        startDate = overallEarliest;
      }

      // Use latest end date available
      const latestDates = Array.from(assetDataMap.values()).map(d => d.end_date);
      endDate = latestDates.sort().reverse()[0];
    } else {
      // Use common date range (all assets available)
      const dateRange = findCommonDateRange(Array.from(assetDataMap.values()));
      if (!dateRange) {
        throw new Error('No common date range found');
      }
      startDate = dateRange.start;
      endDate = dateRange.end;
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
        if (values[i] !== null) {
          finalIndex = values[i];
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
    let previousValue = portfolio.initialCapital;
    let previousInvested = portfolio.initialCapital;

    years.forEach((year) => {
      const data = simResult.yearlyData.get(year)!;

      // Calcolo corretto per PAC: considera il capitale aggiunto durante l'anno
      // yearlyReturn = (guadagno_anno - capitale_aggiunto) / valore_inizio_anno
      const capitalAddedThisYear = data.invested - previousInvested;
      const valueChange = data.value - previousValue;
      const yearlyReturn = previousValue > 0
        ? ((valueChange - capitalAddedThisYear) / previousValue) * 100
        : 0;

      const cumulativeReturn = ((data.value - data.invested) / data.invested) * 100;

      yearlyBreakdown.push({
        year,
        portfolioValue: data.value,
        investedCapital: data.invested,
        yearlyReturn,
        cumulativeReturn
      });

      previousValue = data.value;
      previousInvested = data.invested;
    });

    // 7. Calculate metrics
    const metrics = calculateMetrics(
      simResult.equityCurve,
      portfolio.initialCapital,
      simResult.totalInvested,
      assetPerformances,
      yearlyBreakdown
    );

    return {
      portfolio,
      equityCurve: simResult.equityCurve,
      assetPerformances,
      yearlyBreakdown,
      metrics,
      startDate,
      endDate
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
  assetPerformances: Map<string, number[]>;
  totalInvested: number;
  yearlyData: Map<number, { value: number; invested: number }>;
} {
  const equityCurve: EquityPoint[] = [];
  const positions: AssetPosition[] = [];

  // Track performance per asset (indexed to 100 at start)
  const assetPerformances = new Map<string, number[]>();
  const assetInitialPrices = new Map<string, number>();

  // Track yearly snapshots
  const yearlyData = new Map<number, { value: number; invested: number }>();

  // Track last known prices for each asset (for missing data handling)
  const lastKnownPrices = new Map<string, number>();

  // Get all unique dates sorted
  const allDates = getAllTradingDates(priceMap, startDate, endDate);

  let cash = portfolio.initialCapital;
  let totalInvested = portfolio.initialCapital;
  let lastRebalanceDate = startDate;
  let lastPACDate = startDate;
  let previousValue = portfolio.initialCapital;

  // Initialize asset performances
  portfolio.allocations.forEach(alloc => {
    assetPerformances.set(alloc.symbol, []);
  });

  for (let i = 0; i < allDates.length; i++) {
    const date = allDates[i];
    const year = getYear(parseISO(date));

    // Update last known prices for all assets
    for (const allocation of portfolio.allocations) {
      const price = priceMap.get(allocation.symbol)?.get(date);
      if (price && price > 0) {
        lastKnownPrices.set(allocation.symbol, price);
      }
    }

    // Get active allocations for this date (only assets with available data)
    const activeAllocations = getActiveAllocations(portfolio, date, assetDataMap);

    // Check if we need to add PAC capital
    let pacAdded = false;
    if (portfolio.investmentStrategy === 'pac' && portfolio.pacAmount && portfolio.pacFrequency) {
      const shouldAddPAC = shouldAddPACOnDate(date, lastPACDate, portfolio.pacFrequency);

      if (shouldAddPAC && date !== startDate) {
        cash += portfolio.pacAmount;
        totalInvested += portfolio.pacAmount;
        lastPACDate = date;
        pacAdded = true;
      }
    }

    // Check if we need to rebalance
    const scheduledRebalance = shouldRebalanceOnDate(date, lastRebalanceDate, portfolio.rebalanceFrequency);
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

      // Buy new positions according to ACTIVE allocations (only available assets)
      const totalValue = cash;
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
        assetPerformances.get(alloc.symbol)?.push(null as any);
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
          assetPerformances.get(alloc.symbol)?.push(null as any);
        }
      } else {
        // Asset not yet available - push null (line will not show on graph for these dates)
        assetPerformances.get(alloc.symbol)?.push(null as any);
      }
    });

    // Calculate current portfolio value
    const positionsValue = positions.reduce((sum, pos) => {
      const price = getPrice(pos.symbol, date, priceMap, lastKnownPrices);
      return sum + (pos.shares * price);
    }, 0);

    const totalValue = positionsValue + cash;
    const dailyReturn = previousValue > 0 ? ((totalValue - previousValue) / previousValue) * 100 : 0;

    equityCurve.push({
      date,
      value: totalValue,
      returns: dailyReturn,
      investedCapital: totalInvested
    });

    // Store year-end snapshot
    if (i === allDates.length - 1 || getYear(parseISO(allDates[i + 1])) !== year) {
      yearlyData.set(year, { value: totalValue, invested: totalInvested });
    }

    previousValue = totalValue;
  }

  return {
    equityCurve,
    assetPerformances,
    totalInvested,
    yearlyData
  };
}

/**
 * Get all unique trading dates in range
 */
function getAllTradingDates(
  priceMap: Map<string, Map<string, number>>,
  startDate: string,
  endDate: string
): string[] {
  const datesSet = new Set<string>();

  // Collect all dates from all assets
  for (const datePriceMap of priceMap.values()) {
    for (const date of datePriceMap.keys()) {
      if (date >= startDate && date <= endDate) {
        datesSet.add(date);
      }
    }
  }

  // Sort chronologically
  return Array.from(datesSet).sort();
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
  yearlyBreakdown: YearlyBreakdown[]
): PerformanceMetrics {
  if (equityCurve.length === 0) {
    return createEmptyMetrics(initialCapital, totalInvested);
  }

  const finalValue = equityCurve[equityCurve.length - 1].value;
  const totalReturn = ((finalValue - totalInvested) / totalInvested) * 100;

  // Calculate average annual return from yearly breakdown
  let averageAnnualReturn = 0;
  if (yearlyBreakdown.length > 0) {
    const sum = yearlyBreakdown.reduce((acc, year) => acc + year.yearlyReturn, 0);
    averageAnnualReturn = sum / yearlyBreakdown.length;
  }

  // Calculate daily returns array
  const dailyReturns = equityCurve.slice(1).map(point => point.returns);

  // Max Drawdown
  const { maxDrawdown, maxDrawdownDate } = calculateMaxDrawdown(equityCurve);

  // Best and worst days
  const bestDay = Math.max(...dailyReturns);
  const worstDay = Math.min(...dailyReturns);

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
    maxDrawdown,
    maxDrawdownDate,
    bestDay,
    worstDay,
    finalValue,
    initialValue: initialCapital,
    totalInvested,
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
    if (point.value > peak) {
      peak = point.value;
    }

    // Drawdown deve essere negativo: (valore_corrente - picco) / picco
    const drawdown = ((point.value - peak) / peak) * 100;
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
