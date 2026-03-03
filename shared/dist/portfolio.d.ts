export interface PortfolioAllocation {
    symbol: string;
    percentage: number;
}
export type InvestmentStrategy = 'lump_sum' | 'pac';
export type PACFrequency = 'monthly' | 'quarterly' | 'yearly';
export interface Portfolio {
    name: string;
    allocations: PortfolioAllocation[];
    investmentStrategy: InvestmentStrategy;
    initialCapital: number;
    pacAmount?: number;
    pacFrequency?: PACFrequency;
    rebalanceFrequency: 'none' | 'monthly' | 'quarterly' | 'yearly';
    startYear?: number;
}
