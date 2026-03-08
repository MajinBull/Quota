import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PortfolioBuilder } from './components/PortfolioBuilder';
import { PortfolioTemplates } from './components/PortfolioTemplates';
import { BacktestResults } from './components/BacktestResults';
import { SavedBacktestsView } from './components/SavedBacktestsView';
import { ToastContainer } from './components/ToastContainer';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileButton } from './components/auth/UserProfileButton';
import { UpgradeModal } from './components/auth/UpgradeModal';
import { usePortfolioStore } from './stores/portfolioStore';
import { executeBacktestRemote } from './services/backtestService';
import type { BacktestResult } from './types';
import logoQuota from './assets/logo-quota.png';
import { Analytics } from '@vercel/analytics/react';

type ActiveView = 'configuration' | 'risultati' | 'backtest_salvati';

function AppContent() {
  const { t } = useTranslation(['app', 'common']);
  const { user, loading, canRunBacktest, updateLocalBacktestCount } = useAuth();
  const { portfolio, getTotalAllocation } = usePortfolioStore();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('configuration');
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const hasScrolledRef = useRef(false);

  // Hide header on first scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolledRef.current && window.scrollY > 10) {
        hasScrolledRef.current = true;
        setHeaderExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleHeader = () => {
    setHeaderExpanded(!headerExpanded);
  };

  const totalAllocation = getTotalAllocation();
  const isValidPortfolio = totalAllocation === 100 && portfolio.allocations.length > 0;

  // Loading state during auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t('common:status.loading')}</p>
        </div>
      </div>
    );
  }

  // Force login - show AuthModal if not authenticated
  if (!user) {
    return <AuthModal />;
  }

  const handleRunBacktest = async () => {
    // Check free tier limit BEFORE running backtest
    if (!canRunBacktest()) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Execute backtest via Cloud Function (includes server-side limit enforcement)
      const { result: backtestResult, remainingBacktests } = await executeBacktestRemote(portfolio);

      if (backtestResult) {
        setResult(backtestResult);

        // Update local counter based on server response
        // For premium users, remainingBacktests is -1
        // For free users, calculate current count from remaining
        if (user && !user.isPremium && remainingBacktests >= 0) {
          const currentCount = 20 - remainingBacktests;
          updateLocalBacktestCount(currentCount);
        }

        // Switch to results view after successful backtest
        setActiveView('risultati');
      } else {
        setError(t('app:errors.backtestError'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('app:errors.unknownError');

      // Check if it's the limit exceeded error
      if (errorMessage.includes('limite mensile') || errorMessage.includes('Premium')) {
        setShowUpgradeModal(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950">
      {/* Header */}
      <header className={`border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-40 relative overflow-visible ${
        headerExpanded ? 'translate-y-0' : 'md:translate-y-0 -translate-y-[58px] -mb-[58px]'
      }`}
        style={{
          transition: 'transform 400ms cubic-bezier(0.4, 0.0, 0.2, 1), margin 400ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          willChange: 'transform'
        }}
      >
        <div className="px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center md:justify-between md:py-4">
            {/* Logo + Profile (Mobile) */}
            <div className="flex items-center justify-between w-full md:w-auto py-2 md:py-0">
              <div className="flex-shrink-0">
                <img src={logoQuota} alt="QUOTA" className="h-10 md:h-12" />
              </div>
              {/* User Profile Button - Mobile */}
              <div className="md:hidden flex items-center gap-2">
                <UserProfileButton onUpgrade={() => setShowUpgradeModal(true)} />
              </div>
            </div>

            {/* Tab Switcher - responsive layout */}
            <div className="flex gap-2 w-full md:w-auto md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:gap-3 py-1.5 md:py-0">
              <button
                onClick={() => setActiveView('configuration')}
                className={`flex-1 md:flex-none px-3 py-2 md:px-8 md:py-3 rounded-xl font-semibold text-xs md:text-base transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  activeView === 'configuration'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span className="md:hidden">{t('app:navigation.tabs.configurationShort')}</span>
                <span className="hidden md:inline">{t('app:navigation.tabs.configuration')}</span>
              </button>
              <button
                onClick={() => setActiveView('risultati')}
                disabled={!result}
                className={`flex-1 md:flex-none px-3 py-2 md:px-8 md:py-3 rounded-xl font-semibold text-xs md:text-base transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  activeView === 'risultati' && result
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : result
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className="md:hidden">{t('app:navigation.tabs.resultsShort')}</span>
                <span className="hidden md:inline">{t('app:navigation.tabs.results')}</span>
              </button>
              <button
                onClick={() => setActiveView('backtest_salvati')}
                className={`flex-1 md:flex-none px-3 py-2 md:px-8 md:py-3 rounded-xl font-semibold text-xs md:text-base transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  activeView === 'backtest_salvati'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span className="md:hidden">{t('app:navigation.tabs.savedShort')}</span>
                <span className="hidden md:inline">{t('app:navigation.tabs.saved')}</span>
              </button>
            </div>

            {/* User Profile Button - Desktop */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <UserProfileButton onUpgrade={() => setShowUpgradeModal(true)} />
            </div>
          </div>
        </div>

        {/* Menu Toggle Button - part of header, positioned at bottom right */}
        <button
          onClick={toggleHeader}
          className="md:hidden absolute bottom-0 right-2 translate-y-full px-3 py-1.5 rounded-b-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 border border-t-0 border-slate-200 dark:border-slate-700"
          aria-label={headerExpanded ? "Nascondi header" : "Espandi header"}
        >
          <svg className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform ${headerExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto p-2 md:p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/35 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-red-900 dark:text-red-200 font-semibold text-sm">{t('common:status.error')}</h3>
                <p className="text-red-700 dark:text-red-300 mt-1 text-xs">{error}</p>
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
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl dark:shadow-slate-900 p-3 md:p-4">
                <button
                  onClick={handleRunBacktest}
                  disabled={!isValidPortfolio || isLoading}
                  className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-sm md:text-base transition-all duration-200 ${
                    isValidPortfolio && !isLoading
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
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
                      {t('app:backtest.run.running')}
                    </span>
                  ) : (
                    t('app:backtest.run.button')
                  )}
                </button>

                {!isValidPortfolio && portfolio.allocations.length > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/35 border border-amber-200 dark:border-amber-700 rounded-lg">
                    <p className="text-xs text-amber-900 dark:text-amber-200 font-medium text-center">
                      {t('app:backtest.run.warning', { percentage: totalAllocation.toFixed(1) })}
                    </p>
                  </div>
                )}

                {portfolio.allocations.length === 0 && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                      {t('app:backtest.run.emptyHint')}
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
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl dark:shadow-slate-900">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('app:templates.modalTitle')}</h2>
              <button
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-12">
        <div className="px-6 py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-slate-600 dark:text-slate-400 text-sm">
              <span className="font-semibold text-slate-900 dark:text-white">{t('common:footer.brand')}</span>
              {' · '}{t('common:footer.subtitle')}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">
              {t('common:footer.disclaimer')}
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Vercel Analytics */}
      <Analytics />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}

// Main App component wrapped with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
