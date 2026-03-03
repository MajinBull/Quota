import type { Portfolio } from './portfolio';

// Single data point in backtest equity curve
export interface EquityPoint {
  date: string;
  value: number;
  returns: number; // Daily return percentage
  investedCapital?: number; // Total capital invested up to this point (for PAC)
}

// Performance data for a single asset
export interface AssetPerformance {
  symbol: string;
  values: number[]; // Indexed values (base 100)
  finalReturn: number; // Percentage return
}

// Yearly breakdown data
export interface YearlyBreakdown {
  year: number;
  portfolioValue: number;
  investedCapital: number;
  yearlyReturn: number; // Percentage
  cumulativeReturn: number; // Percentage
}

// Performance metrics
export interface PerformanceMetrics {
  totalReturn: number; // Percentage
  averageAnnualReturn: number; // Average annual return percentage
  maxDrawdown: number; // Percentage
  maxDrawdownDate: string;
  bestDay: number;
  worstDay: number;
  finalValue: number;
  initialValue: number;
  totalInvested: number; // Total capital invested (important for PAC)
  bestAsset?: string; // Symbol of best performing asset
  bestAssetReturn?: number; // Return of best asset
  worstAsset?: string; // Symbol of worst performing asset
  worstAssetReturn?: number; // Return of worst asset
}

// Complete backtest result
export interface BacktestResult {
  portfolio: Portfolio;
  equityCurve: EquityPoint[];
  assetPerformances: AssetPerformance[]; // Performance per asset
  yearlyBreakdown: YearlyBreakdown[]; // Year by year data
  metrics: PerformanceMetrics;
  startDate: string;
  endDate: string;
}
