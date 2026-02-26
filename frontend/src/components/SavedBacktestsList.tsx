import { useState } from 'react';
import { useComparisonStore } from '../stores/comparisonStore';
import { useToastStore } from '../stores/toastStore';
import { formatDate, formatPercentage, formatCurrency, getValueColor } from '../utils/formatters';

interface Props {
  onViewBacktest: (backtest: any) => void;
}

export function SavedBacktestsList({ onViewBacktest }: Props) {
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

  const sortedBacktests = getSortedBacktests();

  const handleRenameStart = (id: string, currentName: string) => {
    setRenameId(id);
    setRenameName(currentName);
  };

  const handleRenameSave = () => {
    if (renameId && renameName.trim().length >= 3) {
      renameBacktest(renameId, renameName);
      setRenameId(null);
      setRenameName('');
      addToast('Backtest rinominato con successo', 'success');
    } else {
      addToast('Il nome deve contenere almeno 3 caratteri', 'warning');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Eliminare "${name}"? Questa azione è irreversibile.`)) {
      deleteBacktest(id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide text-sm">
          Backtest Salvati ({sortedBacktests.length}/100)
        </h2>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Ordina per:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="favorites">⭐ Preferiti prima</option>
            <option value="date">📅 Più recenti</option>
            <option value="name">🔤 Nome (A-Z)</option>
            <option value="return">📈 Rendimento</option>
          </select>
        </div>
      </div>

      {/* Lista Backtest - Layout Tabulare Finale */}
      {sortedBacktests.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <p className="text-slate-500 text-sm">Nessun backtest salvato</p>
          <p className="text-slate-400 text-xs mt-2">
            Esegui un backtest e salvalo per confrontarlo con altri
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedBacktests.map((backtest) => (
            <div
              key={backtest.id}
              className="bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-shadow"
            >
              {/* Layout Desktop (nascosto su mobile/tablet) */}
              <div className="hidden xl:grid grid-cols-[auto_minmax(200px,1fr)_minmax(180px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_auto_auto] gap-4 items-center p-4">
                {/* Colonna 1: Stella */}
                <div className="flex items-center">
                  <button
                    onClick={() => toggleFavorite(backtest.id)}
                    className={`text-2xl hover:scale-110 transition-all flex-shrink-0 ${
                      backtest.isFavorite ? 'text-yellow-400' : 'text-slate-300'
                    }`}
                    title={backtest.isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                  >
                    ★
                  </button>
                </div>

                {/* Colonna 2: Nome + Data */}
                <div className="min-w-0">
                  {/* Nome o Input Rinomina */}
                  {renameId === backtest.id ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-lg truncate">
                        {backtest.name}
                      </h4>
                      <button
                        onClick={() => handleRenameStart(backtest.id, backtest.name)}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition-colors flex-shrink-0"
                        title="Rinomina"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Data e tipo */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>📅 {formatDate(backtest.savedAt)}</span>
                    <span>•</span>
                    <span className="uppercase font-medium">
                      {backtest.portfolio.investmentStrategy === 'lump_sum' ? 'LS' : 'PAC'}
                    </span>
                    <span>•</span>
                    <span className="capitalize">🔄 {backtest.portfolio.rebalanceFrequency}</span>
                  </div>
                </div>

                {/* Colonna 3: ALLOCAZIONI (chips con contorno) */}
                <div className="flex flex-wrap gap-1.5">
                  {backtest.portfolio.allocations.map((alloc) => (
                    <div
                      key={alloc.symbol}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                    >
                      {alloc.symbol} {alloc.percentage}%
                    </div>
                  ))}
                </div>

                {/* Colonna 4: INVESTITO */}
                <div className="text-center border-l border-slate-200 pl-3">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Investito
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {formatCurrency(backtest.result.metrics.totalInvested)}
                  </div>
                </div>

                {/* Colonna 5: VALORE FINALE */}
                <div className="text-center border-l border-slate-200 pl-3">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Val. Finale
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {formatCurrency(backtest.result.metrics.finalValue)}
                  </div>
                </div>

                {/* Colonna 6: RENDIMENTO */}
                <div className="text-center border-l border-slate-200 pl-3">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Rendimento
                  </div>
                  <div className={`text-xl font-bold ${getValueColor(backtest.result.metrics.totalReturn)}`}>
                    {formatPercentage(backtest.result.metrics.totalReturn)}
                  </div>
                </div>

                {/* Colonna 7: DRAWDOWN */}
                <div className="text-center border-l border-slate-200 pl-3">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Drawdown
                  </div>
                  <div className={`text-xl font-bold ${getValueColor(backtest.result.metrics.maxDrawdown)}`}>
                    {formatPercentage(backtest.result.metrics.maxDrawdown)}
                  </div>
                </div>

                {/* Colonna 8: CHECKBOX CONFRONTA (allineato con metriche) */}
                <div className="text-center border-l border-slate-200 pl-3">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Confronta
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedForComparison.includes(backtest.id)}
                    onChange={() => toggleSelection(backtest.id)}
                    disabled={!selectedForComparison.includes(backtest.id) && selectedForComparison.length >= 3}
                    className="w-6 h-6 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer mx-auto"
                    title={selectedForComparison.length >= 3 && !selectedForComparison.includes(backtest.id) ? "Massimo 3 backtest selezionabili" : "Seleziona per confronto"}
                  />
                </div>

                {/* Colonna 9: AZIONI (Visualizza ed Elimina affiancati) */}
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <button
                    onClick={() => onViewBacktest(backtest)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Visualizza
                  </button>
                  <button
                    onClick={() => handleDelete(backtest.id, backtest.name)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Elimina
                  </button>
                </div>
              </div>

              {/* Layout Mobile/Tablet (visibile su schermi < 1280px) */}
              <div className="xl:hidden p-4 space-y-4">
                {/* Header: Stella + Nome + Edit + Checkbox Confronta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Stella */}
                    <button
                      onClick={() => toggleFavorite(backtest.id)}
                      className={`text-2xl hover:scale-110 transition-all flex-shrink-0 ${
                        backtest.isFavorite ? 'text-yellow-400' : 'text-slate-300'
                      }`}
                      title={backtest.isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                    >
                      ★
                    </button>

                    {/* Nome + Data */}
                    <div className="flex-1 min-w-0">
                      {renameId === backtest.id ? (
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={renameName}
                            onChange={(e) => setRenameName(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm truncate">
                            {backtest.name}
                          </h4>
                          <button
                            onClick={() => handleRenameStart(backtest.id, backtest.name)}
                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition-colors flex-shrink-0"
                            title="Rinomina"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>📅 {formatDate(backtest.savedAt)}</span>
                        <span>•</span>
                        <span className="uppercase font-medium">
                          {backtest.portfolio.investmentStrategy === 'lump_sum' ? 'LS' : 'PAC'}
                        </span>
                        <span>•</span>
                        <span className="capitalize">🔄 {backtest.portfolio.rebalanceFrequency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox Confronta */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Confronta
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedForComparison.includes(backtest.id)}
                      onChange={() => toggleSelection(backtest.id)}
                      disabled={!selectedForComparison.includes(backtest.id) && selectedForComparison.length >= 3}
                      className="w-6 h-6 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      title={selectedForComparison.length >= 3 && !selectedForComparison.includes(backtest.id) ? "Massimo 3 backtest selezionabili" : "Seleziona per confronto"}
                    />
                  </div>
                </div>

                {/* Allocazioni */}
                <div className="flex flex-wrap gap-1.5">
                  {backtest.portfolio.allocations.map((alloc) => (
                    <div
                      key={alloc.symbol}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                    >
                      {alloc.symbol} {alloc.percentage}%
                    </div>
                  ))}
                </div>

                {/* Metriche Grid 2x2 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Investito
                    </div>
                    <div className="text-base font-bold text-slate-900">
                      {formatCurrency(backtest.result.metrics.totalInvested)}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Val. Finale
                    </div>
                    <div className="text-base font-bold text-slate-900">
                      {formatCurrency(backtest.result.metrics.finalValue)}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Rendimento
                    </div>
                    <div className={`text-base font-bold ${getValueColor(backtest.result.metrics.totalReturn)}`}>
                      {formatPercentage(backtest.result.metrics.totalReturn)}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Drawdown
                    </div>
                    <div className={`text-base font-bold ${getValueColor(backtest.result.metrics.maxDrawdown)}`}>
                      {formatPercentage(backtest.result.metrics.maxDrawdown)}
                    </div>
                  </div>
                </div>

                {/* Azioni */}
                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => onViewBacktest(backtest)}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Visualizza
                  </button>
                  <button
                    onClick={() => handleDelete(backtest.id, backtest.name)}
                    className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
