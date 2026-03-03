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
