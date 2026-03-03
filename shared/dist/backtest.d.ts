import type { Portfolio } from './portfolio';
export interface EquityPoint {
    date: string;
    value: number;
    returns: number;
    investedCapital?: number;
}
export interface AssetPerformance {
    symbol: string;
    values: number[];
    finalReturn: number;
}
export interface YearlyBreakdown {
    year: number;
    portfolioValue: number;
    investedCapital: number;
    yearlyReturn: number;
    cumulativeReturn: number;
}
export interface PerformanceMetrics {
    totalReturn: number;
    averageAnnualReturn: number;
    maxDrawdown: number;
    maxDrawdownDate: string;
    bestDay: number;
    worstDay: number;
    finalValue: number;
    initialValue: number;
    totalInvested: number;
    bestAsset?: string;
    bestAssetReturn?: number;
    worstAsset?: string;
    worstAssetReturn?: number;
}
export interface BacktestResult {
    portfolio: Portfolio;
    equityCurve: EquityPoint[];
    assetPerformances: AssetPerformance[];
    yearlyBreakdown: YearlyBreakdown[];
    metrics: PerformanceMetrics;
    startDate: string;
    endDate: string;
}
