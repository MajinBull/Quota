import { useState, useEffect } from 'react';
import { SavedBacktestsList } from './SavedBacktestsList';
import { ComparisonView } from './ComparisonView';
import { useComparisonStore } from '../stores/comparisonStore';
import type { BacktestResult } from '../types';

interface Props {
  onLoadBacktest?: (result: BacktestResult) => void;
}

export function SavedBacktestsView({ onLoadBacktest }: Props) {
  const [showComparison, setShowComparison] = useState(false);

  const {
    loadSavedBacktests,
    selectedForComparison,
    clearSelection,
    getSortedBacktests
  } = useComparisonStore();

  // Carica backtest salvati all'avvio
  useEffect(() => {
    loadSavedBacktests();
  }, [loadSavedBacktests]);

  const handleViewBacktest = (backtest: any) => {
    if (onLoadBacktest) {
      onLoadBacktest(backtest.result);
    }
  };

  const handleCompareClick = () => {
    setShowComparison(true);
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
    clearSelection();
  };

  const selectedBacktests = getSortedBacktests().filter(bt =>
    selectedForComparison.includes(bt.id)
  );

  return (
    <div className="space-y-8 min-h-[calc(100vh-200px)]">
      <SavedBacktestsList
        onViewBacktest={handleViewBacktest}
      />

      {/* BOTTONE CONFRONTA STICKY (sempre visibile) */}
      <div className="fixed bottom-4 right-5 z-10">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-96">
          <button
            onClick={handleCompareClick}
            disabled={selectedForComparison.length < 2}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
              selectedForComparison.length >= 2
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            📊 Confronta Selezionati ({selectedForComparison.length})
          </button>

          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-600 text-center">
              {selectedForComparison.length < 2
                ? 'Seleziona almeno 2 backtest per confrontarli'
                : 'Confronta fino a 3 backtest contemporaneamente'}
            </p>
          </div>
        </div>
      </div>

      {/* COMPARISON VIEW */}
      {showComparison && selectedBacktests.length >= 2 && (
        <ComparisonView
          backtests={selectedBacktests}
          onClose={handleCloseComparison}
        />
      )}
    </div>
  );
}
