import { create } from 'zustand';
import type { Portfolio, BacktestResult } from '../types';
import { useToastStore } from './toastStore';

export interface SavedBacktest {
  id: string;
  name: string;
  savedAt: string;
  isFavorite: boolean;
  portfolio: Portfolio;
  result: BacktestResult;
}

type SortBy = 'favorites' | 'date' | 'name' | 'return';

interface ComparisonStore {
  savedBacktests: SavedBacktest[];
  selectedForComparison: string[];
  sortBy: SortBy;

  // Actions
  loadSavedBacktests: () => void;
  saveBacktest: (name: string, portfolio: Portfolio, result: BacktestResult, isFavorite?: boolean) => boolean;
  deleteBacktest: (id: string) => void;
  renameBacktest: (id: string, newName: string) => void;
  toggleFavorite: (id: string) => void;
  setSortBy: (sortBy: SortBy) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  getSortedBacktests: () => SavedBacktest[];
}

const STORAGE_KEY = 'saved_backtests';
const MAX_BACKTESTS = 100;

/**
 * Reduce equity curve size by sampling every N points
 * Keeps first and last points to preserve accuracy
 */
function sampleEquityCurve(equityCurve: any[], interval: number = 10): any[] {
  if (equityCurve.length <= interval * 2) {
    return equityCurve; // Too few points, keep all
  }

  const sampled = [equityCurve[0]]; // Always keep first point

  // Sample every N points
  for (let i = interval; i < equityCurve.length - 1; i += interval) {
    sampled.push(equityCurve[i]);
  }

  // Always keep last point
  sampled.push(equityCurve[equityCurve.length - 1]);

  return sampled;
}

/**
 * Reduce asset performance arrays by sampling
 */
function sampleAssetPerformances(assetPerformances: any[], interval: number = 10): any[] {
  return assetPerformances.map(asset => ({
    ...asset,
    values: asset.values.filter((_: any, index: number) =>
      index === 0 ||
      index === asset.values.length - 1 ||
      index % interval === 0
    )
  }));
}

/**
 * Compress BacktestResult for localStorage by sampling data
 * Reduces size by ~90% while preserving visual accuracy
 */
function compressBacktestResult(result: BacktestResult): BacktestResult {
  return {
    ...result,
    equityCurve: sampleEquityCurve(result.equityCurve, 10),
    assetPerformances: sampleAssetPerformances(result.assetPerformances, 10)
    // yearlyBreakdown is already small, keep as-is
  };
}

export const useComparisonStore = create<ComparisonStore>((set, get) => ({
  savedBacktests: [],
  selectedForComparison: [],
  sortBy: 'favorites',

  loadSavedBacktests: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const backtests = JSON.parse(saved);
        set({ savedBacktests: backtests });
      }
    } catch (error) {
      console.error('Error loading saved backtests:', error);
    }
  },

  saveBacktest: (name, portfolio, result, isFavorite = false) => {
    const current = get().savedBacktests;

    if (current.length >= MAX_BACKTESTS) {
      useToastStore.getState().addToast(
        `Limite di ${MAX_BACKTESTS} backtest raggiunto. Elimina vecchi backtest per salvare nuovi.`,
        'error'
      );
      return false;
    }

    // Compress result data to reduce localStorage size (~90% reduction)
    const compressedResult = compressBacktestResult(result);

    const newBacktest: SavedBacktest = {
      id: crypto.randomUUID(),
      name: name.trim(),
      savedAt: new Date().toISOString(),
      isFavorite,
      portfolio,
      result: compressedResult
    };

    const updated = [...current, newBacktest];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ savedBacktests: updated });
      return true;
    } catch (error) {
      console.error('Error saving backtest:', error);
      useToastStore.getState().addToast(
        'Errore nel salvataggio. Spazio localStorage esaurito.',
        'error'
      );
      return false;
    }
  },

  deleteBacktest: (id) => {
    const updated = get().savedBacktests.filter(bt => bt.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Rimuovi anche dalla selezione se presente
    const newSelection = get().selectedForComparison.filter(selectedId => selectedId !== id);

    set({
      savedBacktests: updated,
      selectedForComparison: newSelection
    });
  },

  renameBacktest: (id, newName) => {
    const updated = get().savedBacktests.map(bt =>
      bt.id === id ? { ...bt, name: newName.trim() } : bt
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ savedBacktests: updated });
  },

  toggleFavorite: (id) => {
    const updated = get().savedBacktests.map(bt =>
      bt.id === id ? { ...bt, isFavorite: !bt.isFavorite } : bt
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ savedBacktests: updated });
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
  },

  toggleSelection: (id) => {
    const current = get().selectedForComparison;

    if (current.includes(id)) {
      // Deseleziona
      set({ selectedForComparison: current.filter(selectedId => selectedId !== id) });
    } else {
      // Seleziona (max 3)
      if (current.length >= 3) {
        return; // Non selezionare più di 3
      }
      set({ selectedForComparison: [...current, id] });
    }
  },

  clearSelection: () => {
    set({ selectedForComparison: [] });
  },

  getSortedBacktests: () => {
    const { savedBacktests, sortBy } = get();
    const backtests = [...savedBacktests];

    switch (sortBy) {
      case 'favorites':
        // Preferiti prima, poi per data
        return backtests.sort((a, b) => {
          if (a.isFavorite === b.isFavorite) {
            return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
          }
          return a.isFavorite ? -1 : 1;
        });

      case 'date':
        // Più recenti prima
        return backtests.sort((a, b) =>
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );

      case 'name':
        // Alfabetico A-Z
        return backtests.sort((a, b) =>
          a.name.localeCompare(b.name, 'it')
        );

      case 'return':
        // Rendimento più alto prima
        return backtests.sort((a, b) =>
          b.result.metrics.totalReturn - a.result.metrics.totalReturn
        );

      default:
        return backtests;
    }
  }
}));
