import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useComparisonStore } from '../stores/comparisonStore';
import { useToastStore } from '../stores/toastStore';
import { formatDate, formatPercentage, formatCurrency, getValueColor } from '../utils/formatters';
import { ProjectionModal } from './ProjectionModal';

interface Props {
  onViewBacktest: (backtest: any) => void;
  onRebalance: (backtest: any) => void;
}

export function SavedBacktestsList({ onViewBacktest, onRebalance }: Props) {
  const { t } = useTranslation('app');
  const {
    sortBy,
    setSortBy,
    getSortedBacktests,
    toggleFavorite,
    toggleSelection,
    selectedForComparison,
    deleteBacktest,
    renameBacktest
  } = useComparisonStore();

  const { addToast } = useToastStore();

  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [projectionBacktest, setProjectionBacktest] = useState<any | null>(null);

  const sortedBacktests = getSortedBacktests();

  const handleRenameStart = (id: string, currentName: string) => {
    setRenameId(id);
    setRenameName(currentName);
  };

  const handleRenameSave = async () => {
    if (renameId && renameName.trim().length >= 3) {
      await renameBacktest(renameId, renameName);
      setRenameId(null);
      setRenameName('');
      addToast(t('savedBacktests.renameSuccess'), 'success');
    } else {
      addToast(t('savedBacktests.minLengthWarning'), 'warning');
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    await deleteBacktest(deleteTarget.id);
    setDeleteTarget(null);
    addToast(t('savedBacktests.deleteSuccess', { name: deleteTarget.name }), 'success');
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm">
          {t('savedBacktests.title', { count: sortedBacktests.length })}
        </h2>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-300">{t('savedBacktests.sortBy')}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="favorites">{t('savedBacktests.sortOptions.favorites')}</option>
            <option value="date">{t('savedBacktests.sortOptions.date')}</option>
            <option value="name">{t('savedBacktests.sortOptions.name')}</option>
            <option value="return">{t('savedBacktests.sortOptions.return')}</option>
          </select>
        </div>
      </div>

      {/* Lista Backtest - Layout Tabulare Finale */}
      {sortedBacktests.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-700 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-300 text-sm">{t('savedBacktests.emptyState.title')}</p>
          <p className="text-slate-400 dark:text-slate-400 text-xs mt-2">
            {t('savedBacktests.emptyState.subtitle')}
          </p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {sortedBacktests.map((backtest) => (
            <div
              key={backtest.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg dark:hover:shadow-slate-900 transition-shadow"
            >
              {/* Layout Desktop (nascosto su mobile/tablet) */}
              <div className="hidden xl:grid grid-cols-[auto_minmax(180px,1fr)_minmax(200px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)_auto_auto] gap-0.5 xl:gap-2 2xl:gap-4 items-center p-4">
                {/* Colonna 1: Stella */}
                <div className="flex items-center">
                  <button
                    onClick={() => toggleFavorite(backtest.id)}
                    className={`text-2xl hover:scale-110 transition-all flex-shrink-0 ${
                      backtest.isFavorite ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                    title={backtest.isFavorite ? t('savedBacktests.actions.removeFromFavorites') : t('savedBacktests.actions.addToFavorites')}
                  >
                    ★
                  </button>
                </div>

                {/* Colonna 2: Nome + Data */}
                <div className="min-w-0">
                  {/* Nome o Input Rinomina */}
                  {renameId === backtest.id ? (
                    <div className="relative z-10 flex items-center gap-2">
                      <input
                        type="text"
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        autoFocus
                      />
                      <button
                        onClick={handleRenameSave}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setRenameId(null)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg truncate">
                        {backtest.name}
                      </h4>
                      <button
                        onClick={() => handleRenameStart(backtest.id, backtest.name)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors flex-shrink-0"
                        title={t('savedBacktests.actions.rename')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Periodo backtest */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>📅 {formatDate(backtest.result.startDate)} - {formatDate(backtest.result.endDate)}</span>
                  </div>
                </div>

                {/* Colonna 3: ALLOCAZIONI (chips con contorno) - 3 colonne su schermi grandi */}
                <div className="grid grid-cols-3 gap-1.5 -ml-2">
                  {backtest.portfolio.allocations.map((alloc) => (
                    <div
                      key={alloc.symbol}
                      className="px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between gap-1"
                    >
                      <span>{alloc.symbol}</span>
                      <span>{alloc.percentage}%</span>
                    </div>
                  ))}
                </div>

                {/* Colonna 4: INVESTITO */}
                <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-3">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                    {t('app:savedBacktests.columns.invested')}
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(backtest.result.metrics.totalInvested)}
                  </div>
                </div>

                {/* Colonna 5: VALORE FINALE */}
                <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-3">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                    {t('app:savedBacktests.columns.finalValue')}
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(backtest.result.metrics.finalValue)}
                  </div>
                </div>

                {/* Colonna 6: RENDIMENTO */}
                <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-3">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                    {t('app:savedBacktests.columns.return')}
                  </div>
                  <div className={`text-xl font-bold ${getValueColor(backtest.result.metrics.totalReturn)}`}>
                    {formatPercentage(backtest.result.metrics.totalReturn)}
                  </div>
                </div>

                {/* Colonna 7: DRAWDOWN */}
                <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-3">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                    {t('app:savedBacktests.columns.drawdown')}
                  </div>
                  <div className={`text-xl font-bold ${getValueColor(backtest.result.metrics.maxDrawdown)}`}>
                    {formatPercentage(backtest.result.metrics.maxDrawdown)}
                  </div>
                </div>

                {/* Colonna 8: CHECKBOX CONFRONTA (allineato con metriche) */}
                <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-3">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                    {t('savedBacktests.actions.compare')}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedForComparison.includes(backtest.id)}
                    onChange={() => toggleSelection(backtest.id)}
                    disabled={!selectedForComparison.includes(backtest.id) && selectedForComparison.length >= 3}
                    className="checkbox-round w-6 h-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer mx-auto"
                    style={{ borderRadius: '50%' }}
                    title={selectedForComparison.length >= 3 && !selectedForComparison.includes(backtest.id) ? "Massimo 3 backtest selezionabili" : "Seleziona per confronto"}
                  />
                </div>

                {/* Colonna 9: AZIONI (griglia 2x2) */}
                <div className="grid grid-cols-2 gap-2 ml-4">
                  <button
                    onClick={() => onViewBacktest(backtest)}
                    className="px-3 py-1.5 bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    {t('savedBacktests.actions.view')}
                  </button>
                  <button
                    onClick={() => onRebalance(backtest)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    {t('savedBacktests.actions.rebalance')}
                  </button>
                  <button
                    onClick={() => setProjectionBacktest(backtest)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    📈 {t('app:projection.button')}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(backtest.id, backtest.name)}
                    className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    {t('savedBacktests.actions.delete')}
                  </button>
                </div>
              </div>

              {/* Layout Mobile/Tablet (visibile su schermi < 1280px) */}
              <div className="xl:hidden p-3 space-y-2">
                {/* Riga 1: Stella + Nome a sinistra, Asset chips a destra */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      onClick={() => toggleFavorite(backtest.id)}
                      className={`text-lg hover:scale-110 transition-all flex-shrink-0 ${
                        backtest.isFavorite ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'
                      }`}
                      title={backtest.isFavorite ? t('savedBacktests.actions.removeFromFavorites') : t('savedBacktests.actions.addToFavorites')}
                    >
                      ★
                    </button>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {backtest.name}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {backtest.portfolio.allocations.slice(0, 3).map((alloc) => (
                      <div
                        key={alloc.symbol}
                        className="px-2 py-0.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {alloc.symbol} {alloc.percentage}%
                      </div>
                    ))}
                    {backtest.portfolio.allocations.length > 3 && (
                      <span className="text-slate-400 dark:text-slate-500 text-xs">...</span>
                    )}
                  </div>
                </div>

                {/* Riga 2: Data */}
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  📅 {formatDate(backtest.result.startDate)} - {formatDate(backtest.result.endDate)}
                </div>

                {/* Riga 3: Metriche in fila orizzontale */}
                <div className="flex gap-2 overflow-x-auto -mx-2 px-2 hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-center min-w-[80px]">
                    <div className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                      {t('app:savedBacktests.columns.return')}
                    </div>
                    <div className={`text-sm font-bold ${getValueColor(backtest.result.metrics.totalReturn)}`}>
                      {formatPercentage(backtest.result.metrics.totalReturn)}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-center min-w-[80px]">
                    <div className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                      {t('app:savedBacktests.columns.finalValue')}
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(backtest.result.metrics.finalValue)}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-center min-w-[80px]">
                    <div className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                      {t('app:savedBacktests.columns.invested')}
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(backtest.result.metrics.totalInvested)}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-center min-w-[80px]">
                    <div className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                      {t('app:savedBacktests.columns.drawdown')}
                    </div>
                    <div className={`text-sm font-bold ${getValueColor(backtest.result.metrics.maxDrawdown)}`}>
                      {formatPercentage(backtest.result.metrics.maxDrawdown)}
                    </div>
                  </div>
                </div>

                {/* Riga 4: Bottoni azioni + checkbox */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewBacktest(backtest)}
                    className="flex-1 px-3 py-2 bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    {t('savedBacktests.actions.view')}
                  </button>
                  <button
                    onClick={() => onRebalance(backtest)}
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {t('savedBacktests.actions.rebalance')}
                  </button>
                  <button
                    onClick={() => setProjectionBacktest(backtest)}
                    className="px-2 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    📈
                  </button>
                  <button
                    onClick={() => handleDeleteClick(backtest.id, backtest.name)}
                    className="px-2 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold transition-colors"
                  >
                    🗑️
                  </button>
                  <input
                    type="checkbox"
                    checked={selectedForComparison.includes(backtest.id)}
                    onChange={() => toggleSelection(backtest.id)}
                    disabled={!selectedForComparison.includes(backtest.id) && selectedForComparison.length >= 3}
                    className="w-5 h-5 text-indigo-600 rounded focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('savedBacktests.deleteConfirm.title')}</h2>
              <button
                onClick={handleDeleteCancel}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Message */}
              <div className="text-center mb-6">
                <p className="text-slate-900 dark:text-white font-semibold text-lg mb-2">
                  {t('savedBacktests.deleteConfirm.message', { name: deleteTarget.name })}
                </p>
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 mb-3">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">"{deleteTarget.name}"</p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {t('savedBacktests.deleteConfirm.warning')}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                onClick={handleDeleteCancel}
                className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                {t('savedBacktests.deleteConfirm.cancel')}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 rounded-lg font-semibold transition-colors bg-red-600 text-white hover:bg-red-700"
              >
                {t('savedBacktests.deleteConfirm.confirm')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Projection Modal */}
      {projectionBacktest && (
        <ProjectionModal
          backtestResult={projectionBacktest.result}
          backtestName={projectionBacktest.name}
          onClose={() => setProjectionBacktest(null)}
        />
      )}
    </div>
  );
}
