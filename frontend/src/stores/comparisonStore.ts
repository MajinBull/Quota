import { create } from 'zustand';
import type { Portfolio, BacktestResult } from '../types';
import { useToastStore } from './toastStore';
import * as firestoreService from '../services/firestoreService';

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
  isLoading: boolean;

  // Actions - NOW ASYNC
  loadSavedBacktests: (userId: string) => Promise<void>;
  saveBacktest: (
    userId: string,
    name: string,
    portfolio: Portfolio,
    result: BacktestResult,
    isFavorite?: boolean
  ) => Promise<boolean>;
  deleteBacktest: (backtestId: string) => Promise<void>;
  renameBacktest: (backtestId: string, newName: string) => Promise<void>;
  toggleFavorite: (backtestId: string) => Promise<void>;
  setSortBy: (sortBy: SortBy) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  getSortedBacktests: () => SavedBacktest[];
}

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
  return assetPerformances.map((asset) => ({
    ...asset,
    values: asset.values.filter(
      (_: any, index: number) =>
        index === 0 || index === asset.values.length - 1 || index % interval === 0
    ),
  }));
}

/**
 * Compress BacktestResult for Firestore by sampling data
 * Reduces size by ~90% while preserving visual accuracy
 */
function compressBacktestResult(result: BacktestResult): BacktestResult {
  return {
    ...result,
    equityCurve: sampleEquityCurve(result.equityCurve, 10),
    assetPerformances: sampleAssetPerformances(result.assetPerformances, 10),
    // yearlyBreakdown is already small, keep as-is
  };
}

export const useComparisonStore = create<ComparisonStore>((set, get) => ({
  savedBacktests: [],
  selectedForComparison: [],
  sortBy: 'favorites',
  isLoading: false,

  loadSavedBacktests: async (userId: string) => {
    set({ isLoading: true });
    try {
      const backtests = await firestoreService.getUserBacktests(userId);
      set({ savedBacktests: backtests, isLoading: false });
    } catch (error) {
      console.error('Error loading saved backtests:', error);
      useToastStore.getState().addToast('Errore nel caricamento dei backtest', 'error');
      set({ isLoading: false });
    }
  },

  saveBacktest: async (userId, name, portfolio, result, isFavorite = false) => {
    // Compress result data to reduce Firestore size (~90% reduction)
    const compressedResult = compressBacktestResult(result);

    try {
      const backtestId = await firestoreService.saveBacktest(
        userId,
        name,
        portfolio,
        compressedResult,
        isFavorite
      );

      // Add to local state immediately (optimistic update)
      const newBacktest: SavedBacktest = {
        id: backtestId,
        name: name.trim(),
        savedAt: new Date().toISOString(),
        isFavorite,
        portfolio,
        result: compressedResult,
      };

      const updated = [...get().savedBacktests, newBacktest];
      set({ savedBacktests: updated });

      return true;
    } catch (error) {
      console.error('Error saving backtest:', error);
      useToastStore.getState().addToast('Errore nel salvataggio del backtest', 'error');
      return false;
    }
  },

  deleteBacktest: async (id) => {
    try {
      await firestoreService.deleteBacktest(id);

      // Remove from local state
      const updated = get().savedBacktests.filter((bt) => bt.id !== id);

      // Remove from selection if present
      const newSelection = get().selectedForComparison.filter((selectedId) => selectedId !== id);

      set({
        savedBacktests: updated,
        selectedForComparison: newSelection,
      });
    } catch (error) {
      console.error('Error deleting backtest:', error);
      useToastStore.getState().addToast('Errore nell\'eliminazione del backtest', 'error');
    }
  },

  renameBacktest: async (id, newName) => {
    try {
      await firestoreService.renameBacktest(id, newName);

      // Update local state
      const updated = get().savedBacktests.map((bt) =>
        bt.id === id ? { ...bt, name: newName.trim() } : bt
      );
      set({ savedBacktests: updated });
    } catch (error) {
      console.error('Error renaming backtest:', error);
      useToastStore.getState().addToast('Errore nella modifica del nome', 'error');
    }
  },

  toggleFavorite: async (id) => {
    const backtest = get().savedBacktests.find((bt) => bt.id === id);
    if (!backtest) return;

    const newFavoriteStatus = !backtest.isFavorite;

    try {
      await firestoreService.toggleFavorite(id, newFavoriteStatus);

      // Update local state
      const updated = get().savedBacktests.map((bt) =>
        bt.id === id ? { ...bt, isFavorite: newFavoriteStatus } : bt
      );
      set({ savedBacktests: updated });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      useToastStore.getState().addToast('Errore nella modifica del preferito', 'error');
    }
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
  },

  toggleSelection: (id) => {
    const current = get().selectedForComparison;

    if (current.includes(id)) {
      // Deselect
      set({ selectedForComparison: current.filter((selectedId) => selectedId !== id) });
    } else {
      // Select (max 3)
      if (current.length >= 3) {
        return; // Don't select more than 3
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
        // Favorites first, then by date
        return backtests.sort((a, b) => {
          if (a.isFavorite === b.isFavorite) {
            return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
          }
          return a.isFavorite ? -1 : 1;
        });

      case 'date':
        // Most recent first
        return backtests.sort(
          (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );

      case 'name':
        // Alphabetical A-Z
        return backtests.sort((a, b) => a.name.localeCompare(b.name, 'it'));

      case 'return':
        // Highest return first
        return backtests.sort((a, b) => b.result.metrics.totalReturn - a.result.metrics.totalReturn);

      default:
        return backtests;
    }
  },
}));
