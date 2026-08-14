import type { BacktestResult } from '../types';

// Projection types
export interface ProjectionPoint {
  year: number;
  optimistic: number;
  base: number;
  pessimistic: number;
}

export interface ProjectionResult {
  years: number;
  initialCapital: number;
  timeline: ProjectionPoint[];
  optimistic: {
    value: number;
    cagr: number;
  };
  base: {
    value: number;
    cagr: number;
  };
  pessimistic: {
    value: number;
    cagr: number;
  };
}

/**
 * Configuration for projection calculations
 */
const PROJECTION_CONFIG = {
  volatilityCap: 0.12, // 12% maximum volatility considered
  multiplier: 0.30, // ±30% of volatility for scenarios
  minCAGR: -0.05, // -5% floor for pessimistic scenario
};

/**
 * Calculate future projections based on backtest results
 * Uses Option A: Capped volatility with conservative multiplier
 *
 * @param backtestResult Historical backtest results
 * @param yearsAhead Number of years to project into the future
 * @param initialCapital Starting capital for projection (defaults to backtest final value)
 * @returns Projection with optimistic, base, and pessimistic scenarios
 */
export function calculateProjection(
  backtestResult: BacktestResult,
  yearsAhead: number,
  initialCapital?: number
): ProjectionResult {
  const { metrics, equityCurve } = backtestResult;
  const capital = initialCapital ?? metrics.finalValue;

  // The engine exposes a time-weighted CAGR, already neutralized for PAC flows.
  const cagr = metrics.averageAnnualReturn / 100;

  // Calculate volatility (annualized standard deviation) from daily returns
  const volatility = metrics.annualizedVolatility !== undefined
    ? metrics.annualizedVolatility / 100
    : calculateVolatility(equityCurve);

  // Apply volatility cap and calculate spread
  const volatilityCapped = Math.min(volatility, PROJECTION_CONFIG.volatilityCap);
  const spread = volatilityCapped * PROJECTION_CONFIG.multiplier;

  // Calculate scenario CAGRs
  const cagrBase = cagr;
  const cagrOptimistic = cagr + spread;
  const cagrPessimistic = Math.max(cagr - spread, PROJECTION_CONFIG.minCAGR);

  // Calculate final values
  const baseValue = capital * Math.pow(1 + cagrBase, yearsAhead);
  const optimisticValue = capital * Math.pow(1 + cagrOptimistic, yearsAhead);
  const pessimisticValue = capital * Math.pow(1 + cagrPessimistic, yearsAhead);

  // Generate year-by-year timeline
  const currentYear = new Date().getFullYear();
  const timeline: ProjectionPoint[] = [];

  for (let year = 0; year <= yearsAhead; year++) {
    timeline.push({
      year: currentYear + year,
      base: capital * Math.pow(1 + cagrBase, year),
      optimistic: capital * Math.pow(1 + cagrOptimistic, year),
      pessimistic: capital * Math.pow(1 + cagrPessimistic, year),
    });
  }

  return {
    years: yearsAhead,
    initialCapital: capital,
    base: {
      value: baseValue,
      cagr: cagrBase * 100, // Convert back to percentage
    },
    optimistic: {
      value: optimisticValue,
      cagr: cagrOptimistic * 100,
    },
    pessimistic: {
      value: pessimisticValue,
      cagr: cagrPessimistic * 100,
    },
    timeline,
  };
}

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 * Formula: CAGR = (Final Value / Initial Value)^(1/years) - 1
 * Currently unused but kept for future use
 */
/*
function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  if (initialValue <= 0 || finalValue <= 0 || years <= 0) {
    return 0;
  }
  return Math.pow(finalValue / initialValue, 1 / years) - 1;
}
*/

/**
 * Calculate annualized volatility from daily returns
 * Uses standard deviation of returns × sqrt(252 trading days)
 */
function calculateVolatility(equityCurve: BacktestResult['equityCurve']): number {
  if (equityCurve.length < 2) {
    return 0.15; // Default 15% if insufficient data
  }

  const dailyReturns = equityCurve.slice(1).map(point => point.returns / 100);

  if (dailyReturns.length === 0) {
    return 0.15; // Default 15%
  }

  // Calculate mean
  const mean = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;

  // Calculate sample standard deviation (Bessel's correction: n-1)
  // Using n-1 instead of n provides an unbiased estimator for sample data
  const variance =
    dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (dailyReturns.length - 1);
  const dailyStdDev = Math.sqrt(variance);

  const elapsedYears = Math.max(
    1 / 365.25,
    (new Date(equityCurve.at(-1)!.date).getTime() - new Date(equityCurve[0].date).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
  );
  const annualizedVolatility = dailyStdDev * Math.sqrt(dailyReturns.length / elapsedYears);

  return annualizedVolatility;
}
