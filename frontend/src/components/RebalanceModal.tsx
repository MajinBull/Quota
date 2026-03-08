import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { BacktestResult } from '../types';

interface Props {
  backtest: BacktestResult | null;
  backtestName?: string;
  onClose: () => void;
}

interface AssetValue {
  symbol: string;
  currentValue: string; // String per gestire input vuoto
}

interface RebalanceAction {
  symbol: string;
  currentValue: number;
  currentPercentage: number;
  targetPercentage: number;
  targetValue: number;
  difference: number;
  action: 'sell' | 'buy' | 'hold';
}

export function RebalanceModal({ backtest, backtestName, onClose }: Props) {
  const { t } = useTranslation('app');
  const [assetValues, setAssetValues] = useState<AssetValue[]>([]);
  const [results, setResults] = useState<RebalanceAction[] | null>(null);
  const [maxDifference, setMaxDifference] = useState(0);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (backtest) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [backtest]);

  // Initialize asset values when backtest is provided
  useEffect(() => {
    if (backtest) {
      const initialValues = backtest.portfolio.allocations.map(alloc => ({
        symbol: alloc.symbol,
        currentValue: ''
      }));
      setAssetValues(initialValues);
      setResults(null);
      setMaxDifference(0);
    }
  }, [backtest]);

  const handleValueChange = (symbol: string, value: string) => {
    setAssetValues(prev =>
      prev.map(av => av.symbol === symbol ? { ...av, currentValue: value } : av)
    );
  };

  const calculateRebalance = () => {
    if (!backtest) return;

    // Parse values and calculate total
    const parsedValues = assetValues.map(av => ({
      symbol: av.symbol,
      value: parseFloat(av.currentValue) || 0
    }));

    const totalValue = parsedValues.reduce((sum, av) => sum + av.value, 0);

    if (totalValue === 0) {
      alert(t('rebalance.alert'));
      return;
    }

    // Calculate rebalance actions
    const actions: RebalanceAction[] = backtest.portfolio.allocations.map(alloc => {
      const assetValue = parsedValues.find(pv => pv.symbol === alloc.symbol);
      const currentValue = assetValue?.value || 0;
      const currentPercentage = (currentValue / totalValue) * 100;
      const targetPercentage = alloc.percentage;
      const targetValue = (totalValue * targetPercentage) / 100;
      const difference = targetValue - currentValue;

      let action: 'sell' | 'buy' | 'hold' = 'hold';
      if (Math.abs(difference) > 0.01) { // Avoid floating point issues
        action = difference > 0 ? 'buy' : 'sell';
      }

      return {
        symbol: alloc.symbol,
        currentValue,
        currentPercentage,
        targetPercentage,
        targetValue,
        difference,
        action
      };
    });

    // Calculate max difference
    const maxDiff = Math.max(...actions.map(a => Math.abs(a.currentPercentage - a.targetPercentage)));
    setMaxDifference(maxDiff);

    setResults(actions);
  };

  const resetModal = () => {
    if (backtest) {
      const initialValues = backtest.portfolio.allocations.map(alloc => ({
        symbol: alloc.symbol,
        currentValue: ''
      }));
      setAssetValues(initialValues);
    }
    setResults(null);
    setMaxDifference(0);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!backtest) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
      {/* Outer container: rounded corners + overflow hidden */}
      <div className="rounded-2xl overflow-hidden w-full max-w-4xl max-h-[80vh] md:max-h-[90vh]">
        {/* Inner container: white bg + scrollable */}
        <div className="bg-white dark:bg-slate-800 overflow-y-auto overscroll-contain max-h-[80vh] md:max-h-[90vh] focus:outline-none relative">
          {/* Close button - sticky in top-right corner */}
          <button
            onClick={handleClose}
            className="sticky top-4 right-4 float-right p-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors focus:outline-none shadow-md z-50"
            aria-label={t('common:actions.close')}
          >
            <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('rebalance.title', { name: backtestName || backtest.portfolio.name })}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('rebalance.subtitle')}
            </p>
          </div>

          {/* Asset Values Input */}
          {!results && (
            <div className="mb-6">
              <div className="space-y-3">
                {assetValues.map((assetValue) => {
                  const allocation = backtest.portfolio.allocations.find(a => a.symbol === assetValue.symbol);
                  return (
                    <div key={assetValue.symbol} className="grid grid-cols-2 md:grid-cols-[1fr_30%] gap-3 bg-slate-50 dark:bg-slate-700 p-3 rounded-lg items-center">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">{assetValue.symbol}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{t('rebalance.inputLabel', { percentage: allocation?.percentage })}</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm">€</span>
                        <input
                          type="number"
                          value={assetValue.currentValue}
                          onChange={(e) => handleValueChange(assetValue.symbol, e.target.value)}
                          placeholder={t('rebalance.placeholder')}
                          className="w-full pl-7 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white dark:bg-slate-600 text-slate-900 dark:text-white"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={calculateRebalance}
                disabled={assetValues.some(av => !av.currentValue || av.currentValue === '')}
                className={`w-full mt-4 py-3 px-6 text-white font-semibold rounded-lg transition-colors ${
                  assetValues.every(av => av.currentValue && av.currentValue !== '')
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                }`}
              >
                {assetValues.every(av => av.currentValue && av.currentValue !== '')
                  ? t('rebalance.calculateButton')
                  : `Valori configurati ${assetValues.filter(av => av.currentValue && av.currentValue !== '').length}/${assetValues.length}`
                }
              </button>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Warning if below threshold */}
              {maxDifference < 1 && (
                <div className="bg-green-50 dark:bg-green-900/35 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-green-900 dark:text-green-100 font-semibold text-sm">{t('rebalance.notNecessary.title')}</h4>
                      <p className="text-green-700 dark:text-green-300 mt-1 text-xs">
                        {t('rebalance.notNecessary.description', { difference: maxDifference.toFixed(2) })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('rebalance.resultsTitle')}</h3>

              {/* Summary */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                    {t('rebalance.totalValue')}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    €{results.reduce((sum, r) => sum + r.currentValue, 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Actions Table */}
              <div className="space-y-4">
                {/* Sells First */}
                {results.some(r => r.action === 'sell') && (
                  <div>
                    <h4 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2">
                      {t('rebalance.sections.sells')}
                    </h4>
                    <div className="space-y-2">
                      {results.filter(r => r.action === 'sell').map(result => (
                        <div key={result.symbol} className="bg-red-50 dark:bg-red-900/35 border border-red-200 dark:border-red-700 rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-900 dark:text-white text-lg">{result.symbol}</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {result.currentPercentage.toFixed(1)}% → {result.targetPercentage}%
                              </span>
                            </div>
                            <div className="flex flex-col md:items-end">
                              <span className="text-sm text-red-900 dark:text-red-100 font-semibold">
                                {t('rebalance.actions.sell', { amount: Math.abs(result.difference).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
                              </span>
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {t('rebalance.actions.from', { from: result.currentValue.toLocaleString('it-IT', { minimumFractionDigits: 2 }), to: result.targetValue.toLocaleString('it-IT', { minimumFractionDigits: 2 }) })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buys Second */}
                {results.some(r => r.action === 'buy') && (
                  <div>
                    <h4 className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">
                      {t('rebalance.sections.buys')}
                    </h4>
                    <div className="space-y-2">
                      {results.filter(r => r.action === 'buy').map(result => (
                        <div key={result.symbol} className="bg-green-50 dark:bg-green-900/35 border border-green-200 dark:border-green-700 rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-900 dark:text-white text-lg">{result.symbol}</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {result.currentPercentage.toFixed(1)}% → {result.targetPercentage}%
                              </span>
                            </div>
                            <div className="flex flex-col md:items-end">
                              <span className="text-sm text-green-900 dark:text-green-100 font-semibold">
                                {t('rebalance.actions.buy', { amount: result.difference.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
                              </span>
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {t('rebalance.actions.from', { from: result.currentValue.toLocaleString('it-IT', { minimumFractionDigits: 2 }), to: result.targetValue.toLocaleString('it-IT', { minimumFractionDigits: 2 }) })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Holdings (no change) */}
                {results.some(r => r.action === 'hold') && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                      {t('rebalance.sections.holds')}
                    </h4>
                    <div className="space-y-2">
                      {results.filter(r => r.action === 'hold').map(result => (
                        <div key={result.symbol} className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-900 dark:text-white">{result.symbol}</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {result.targetPercentage}%
                              </span>
                            </div>
                            <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {t('rebalance.actions.alreadyBalanced')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reset Button */}
              <button
                onClick={resetModal}
                className="w-full py-3 px-6 bg-slate-600 dark:bg-slate-500 text-white font-semibold rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
              >
                {t('rebalance.newCalculation')}
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
