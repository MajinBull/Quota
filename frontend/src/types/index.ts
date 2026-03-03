// Asset categories
export type AssetCategory = 'etf' | 'crypto' | 'commodities' | 'bonds' | 'real_estate';

// Single candlestick data point
export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Historical data for a single asset
export interface AssetData {
  symbol: string;
  category: AssetCategory;
  start_date: string;
  end_date: string;
  data_points: number;
  candles: Candle[];
}

// Asset metadata for UI display
export interface AssetInfo {
  symbol: string;
  category: AssetCategory;
  name: string;
  description?: string;
  popularity_rank?: number; // Lower = more popular (1 is most popular)
  // Extended info for modal
  inceptionDate?: string; // Data di lancio
  provider?: string; // Gestore/Emittente
  expenseRatio?: string; // Costo annuo (per ETF)
  aum?: string; // Assets Under Management
  website?: string; // Link al sito ufficiale
  longDescription?: string; // Descrizione estesa
}

// Portfolio allocation (user input)
export interface PortfolioAllocation {
  symbol: string;
  percentage: number; // 0-100
}

// Investment strategy type
export type InvestmentStrategy = 'lump_sum' | 'pac';

// PAC frequency
export type PACFrequency = 'monthly' | 'quarterly' | 'yearly';

// Portfolio configuration
export interface Portfolio {
  name: string;
  allocations: PortfolioAllocation[];
  investmentStrategy: InvestmentStrategy;
  initialCapital: number; // For lump sum: total amount. For PAC: first investment
  pacAmount?: number; // Amount to invest each period (only for PAC)
  pacFrequency?: PACFrequency; // How often to invest (only for PAC)
  rebalanceFrequency: 'none' | 'monthly' | 'quarterly' | 'yearly';
  startYear?: number; // Optional: year to start backtest (if not set, uses earliest common date)
}

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

// Benchmark comparison
export interface BenchmarkComparison {
  name: string;
  symbol: string;
  metrics: PerformanceMetrics;
  equityCurve: EquityPoint[];
}

// Store state for portfolio builder
export interface PortfolioStore {
  portfolio: Portfolio;
  updateAllocation: (symbol: string, percentage: number) => void;
  addAsset: (symbol: string) => void;
  removeAsset: (symbol: string) => void;
  setInitialCapital: (amount: number) => void;
  setRebalanceFrequency: (frequency: Portfolio['rebalanceFrequency']) => void;
  resetPortfolio: () => void;
}

// Future projection scenario
export interface ProjectionScenario {
  value: number;
  cagr: number;
}

// Single data point in projection timeline
export interface ProjectionPoint {
  year: number;
  base: number;
  optimistic: number;
  pessimistic: number;
}

// Complete projection result
export interface ProjectionResult {
  years: number;
  initialCapital: number;
  base: ProjectionScenario;
  optimistic: ProjectionScenario;
  pessimistic: ProjectionScenario;
  timeline: ProjectionPoint[];
}
