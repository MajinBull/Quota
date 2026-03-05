import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SavedBacktestsList } from './SavedBacktestsList';
import { ComparisonView } from './ComparisonView';
import { RebalanceModal } from './RebalanceModal';
import { useComparisonStore } from '../stores/comparisonStore';
import { useAuth } from '../contexts/AuthContext';
import type { BacktestResult } from '../types';

interface Props {
  onLoadBacktest?: (result: BacktestResult) => void;
}

export function SavedBacktestsView({ onLoadBacktest }: Props) {
  const { t } = useTranslation('app');
  const [showComparison, setShowComparison] = useState(false);
  const [rebalanceBacktest, setRebalanceBacktest] = useState<{ result: BacktestResult; name: string } | null>(null);
  const { user } = useAuth();

  const {
    loadSavedBacktests,
    selectedForComparison,
    clearSelection,
    getSortedBacktests,
    isLoading
  } = useComparisonStore();

  // Carica backtest salvati all'avvio
  useEffect(() => {
    if (user) {
      loadSavedBacktests(user.uid);
    }
  }, [user, loadSavedBacktests]);

  const handleViewBacktest = (backtest: any) => {
    if (onLoadBacktest) {
      onLoadBacktest(backtest.result);
    }
  };

  const handleRebalance = (backtest: any) => {
    setRebalanceBacktest({ result: backtest.result, name: backtest.name });
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-600 dark:text-slate-400 font-medium">{t('common:status.loading')}</p>
          </div>
        </div>
      ) : (
        <SavedBacktestsList
          onViewBacktest={handleViewBacktest}
          onRebalance={handleRebalance}
        />
      )}

      {/* BOTTONE CONFRONTA STICKY (sempre visibile) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 z-10 w-[calc(100%-2rem)] max-w-sm md:w-96">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl dark:shadow-slate-900 p-4">
          <button
            onClick={handleCompareClick}
            disabled={selectedForComparison.length < 2}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
              selectedForComparison.length >= 2
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            {t('compare.button', { count: selectedForComparison.length })}
          </button>

          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
              {selectedForComparison.length < 2
                ? t('compare.hint.min')
                : t('compare.hint.max')}
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

      {/* REBALANCE MODAL */}
      <RebalanceModal
        backtest={rebalanceBacktest?.result || null}
        backtestName={rebalanceBacktest?.name}
        onClose={() => setRebalanceBacktest(null)}
      />
    </div>
  );
}
