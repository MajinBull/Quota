import { useState } from 'react';
import { PortfolioBuilder } from './components/PortfolioBuilder';
import { PortfolioTemplates } from './components/PortfolioTemplates';
import { BacktestResults } from './components/BacktestResults';
import { SavedBacktestsView } from './components/SavedBacktestsView';
import { ToastContainer } from './components/ToastContainer';
import { usePortfolioStore } from './stores/portfolioStore';
import { runBacktest } from './engine/backtester';
import type { BacktestResult } from './types';
import logoQuota from './assets/logo-quota.png';

type ActiveView = 'configuration' | 'risultati' | 'backtest_salvati';

function App() {
  const { portfolio, getTotalAllocation } = usePortfolioStore();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('configuration');
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  const totalAllocation = getTotalAllocation();
  const isValidPortfolio = totalAllocation === 100 && portfolio.allocations.length > 0;

  const handleRunBacktest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const backtestResult = await runBacktest(portfolio);

      if (backtestResult) {
        setResult(backtestResult);
        // Switch to results view after successful backtest
        setActiveView('risultati');
      } else {
        setError('Errore durante il backtest. Verifica che tutti gli asset abbiano dati validi.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="px-4 py-3 md:px-8 md:py-4">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-3 md:gap-0">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img src={logoQuota} alt="QUOTA" className="h-10 md:h-12" />
            </div>

            {/* Tab Switcher - responsive layout */}
            <div className="flex gap-2 w-full md:w-auto md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:gap-3">
              <button
                onClick={() => setActiveView('configuration')}
                className={`flex-1 md:flex-none px-3 py-2 md:px-8 md:py-3 rounded-xl font-semibold text-xs md:text-base transition-all ${
                  activeView === 'configuration'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Config
                <span className="hidden md:inline">uration</span>
              </button>
              <button
                onClick={() => setActiveView('risultati')}
                disabled={!result}
                className={`flex-1 md:flex-none px-3 py-2 md:px-8 md:py-3 rounded-xl font-semibold text-xs md:text-base transition-all ${
                  activeView === 'risultati' && result
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : result
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Risultati
                <span className="hidden md:inline"> Backtest</span>
              </button>
              <button
                onClick={() => setActiveView('backtest_salvati')}
                className={`flex-1 md:flex-none px-3 py-2 md:px-8 md:py-3 rounded-xl font-semibold text-xs md:text-base transition-all ${
                  activeView === 'backtest_salvati'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Salvati
                <span className="hidden md:inline"> Backtest</span>
              </button>
            </div>

            {/* Spazio a destra (vuoto per bilanciare) - solo desktop */}
            <div className="hidden md:block flex-shrink-0 w-12"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto p-4 md:p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-red-900 font-semibold text-sm">Errore</h3>
                <p className="text-red-700 mt-1 text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration View */}
        {activeView === 'configuration' && (
          <div className="space-y-8">
            <PortfolioBuilder onOpenTemplates={() => setIsTemplatesModalOpen(true)} />

            {/* Run Backtest Button - Sticky Bottom */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 z-10 w-[calc(100%-2rem)] max-w-sm md:w-96">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4">
                <button
                  onClick={handleRunBacktest}
                  disabled={!isValidPortfolio || isLoading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
                    isValidPortfolio && !isLoading
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Analisi in corso...
                    </span>
                  ) : (
                    'Esegui Backtest →'
                  )}
                </button>

                {!isValidPortfolio && portfolio.allocations.length > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-900 font-medium text-center">
                      ⚠️ Allocazione: {totalAllocation.toFixed(1)}% (deve essere 100%)
                    </p>
                  </div>
                )}

                {portfolio.allocations.length === 0 && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-600 text-center">
                      Aggiungi asset o usa un template per iniziare
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {activeView === 'risultati' && result && (
          <BacktestResults
            result={result}
            onLoadBacktest={(loadedResult) => {
              setResult(loadedResult);
              setActiveView('risultati');
            }}
          />
        )}

        {/* Saved Backtests View */}
        {activeView === 'backtest_salvati' && (
          <SavedBacktestsView
            onLoadBacktest={(loadedResult) => {
              setResult(loadedResult);
              setActiveView('risultati');
            }}
          />
        )}

      </main>

      {/* Templates Modal */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Portfolio Templates</h2>
              <button
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <PortfolioTemplates onTemplateSelect={() => setIsTemplatesModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="px-6 py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-slate-600 text-sm">
              <span className="font-semibold text-slate-900">Portfolio Intelligence</span>
              {' · '}Backtest platform multi-asset
            </div>
            <div className="text-slate-500 text-xs">
              I rendimenti passati non garantiscono risultati futuri
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
