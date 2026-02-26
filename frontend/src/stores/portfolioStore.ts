import { create } from 'zustand';
import type { Portfolio, PortfolioAllocation, InvestmentStrategy, PACFrequency } from '../types';

interface PortfolioStore {
  portfolio: Portfolio;
  updateAllocation: (symbol: string, percentage: number) => void;
  updateMultipleAllocations: (allocations: PortfolioAllocation[]) => void;
  addAsset: (symbol: string) => void;
  removeAsset: (symbol: string) => void;
  setInitialCapital: (amount: number) => void;
  setInvestmentStrategy: (strategy: InvestmentStrategy) => void;
  setPACAmount: (amount: number) => void;
  setPACFrequency: (frequency: PACFrequency) => void;
  setRebalanceFrequency: (frequency: Portfolio['rebalanceFrequency']) => void;
  setStartYear: (year: number | undefined) => void;
  resetPortfolio: () => void;
  getTotalAllocation: () => number;
}

const DEFAULT_PORTFOLIO: Portfolio = {
  name: 'My Portfolio',
  allocations: [],
  investmentStrategy: 'lump_sum',
  initialCapital: 10000,
  pacAmount: 500,
  pacFrequency: 'monthly',
  rebalanceFrequency: 'yearly'
};

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  portfolio: DEFAULT_PORTFOLIO,

  updateAllocation: (symbol: string, percentage: number) => {
    set((state) => {
      const allocations = state.portfolio.allocations.map((alloc) =>
        alloc.symbol === symbol
          ? { ...alloc, percentage: Math.max(0, Math.min(100, percentage)) }
          : alloc
      );

      return {
        portfolio: { ...state.portfolio, allocations }
      };
    });
  },

  updateMultipleAllocations: (allocations: PortfolioAllocation[]) => {
    set((state) => ({
      portfolio: { ...state.portfolio, allocations }
    }));
  },

  addAsset: (symbol: string) => {
    set((state) => {
      // Check if asset already exists
      if (state.portfolio.allocations.some((alloc) => alloc.symbol === symbol)) {
        return state;
      }

      const allocations: PortfolioAllocation[] = [
        ...state.portfolio.allocations,
        { symbol, percentage: 0 }
      ];

      return {
        portfolio: { ...state.portfolio, allocations }
      };
    });
  },

  removeAsset: (symbol: string) => {
    set((state) => {
      const allocations = state.portfolio.allocations.filter(
        (alloc) => alloc.symbol !== symbol
      );

      return {
        portfolio: { ...state.portfolio, allocations }
      };
    });
  },

  setInitialCapital: (amount: number) => {
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        initialCapital: Math.max(1, amount)
      }
    }));
  },

  setInvestmentStrategy: (strategy: InvestmentStrategy) => {
    set((state) => ({
      portfolio: { ...state.portfolio, investmentStrategy: strategy }
    }));
  },

  setPACAmount: (amount: number) => {
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        pacAmount: Math.max(1, amount)
      }
    }));
  },

  setPACFrequency: (frequency: PACFrequency) => {
    set((state) => ({
      portfolio: { ...state.portfolio, pacFrequency: frequency }
    }));
  },

  setRebalanceFrequency: (frequency: Portfolio['rebalanceFrequency']) => {
    set((state) => ({
      portfolio: { ...state.portfolio, rebalanceFrequency: frequency }
    }));
  },

  setStartYear: (year: number | undefined) => {
    set((state) => ({
      portfolio: { ...state.portfolio, startYear: year }
    }));
  },

  resetPortfolio: () => {
    set({ portfolio: DEFAULT_PORTFOLIO });
  },

  getTotalAllocation: () => {
    return get().portfolio.allocations.reduce(
      (sum, alloc) => sum + alloc.percentage,
      0
    );
  }
}));
