import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useComparisonStore } from '../stores/comparisonStore';
import { useToastStore } from '../stores/toastStore';
import { useAuth } from '../contexts/AuthContext';
import type { Portfolio, BacktestResult } from '../types';

interface Props {
  portfolio: Portfolio;
  result: BacktestResult;
}

export function SaveBacktestButton({ portfolio, result }: Props) {
  const { t } = useTranslation('app');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { saveBacktest, savedBacktests } = useComparisonStore();
  const { addToast } = useToastStore();
  const { user } = useAuth();

  // Genera nome automatico quando si apre il modal
  const handleOpenModal = () => {
    const nextNumber = savedBacktests.length + 1;
    setName(t('backtest.save.defaultName', { number: nextNumber }));
    setIsFavorite(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (name.trim().length < 3) {
      addToast(t('savedBacktests.minLengthWarning'), 'warning');
      return;
    }

    if (!user) {
      addToast(t('errors.authRequired'), 'error');
      return;
    }

    setIsSaving(true);
    try {
      const success = await saveBacktest(user.uid, name, portfolio, result, isFavorite);

      if (success) {
        setShowModal(false);
        setName('');
        setIsFavorite(false);
        addToast(t('auth:toasts.backtestSaved', { name }), 'success');
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Sticky Bottom Button */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 z-10 w-[calc(100%-2rem)] max-w-sm md:w-96">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4">
          <button
            onClick={handleOpenModal}
            className="w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
          >
            {t('backtest.save.button')}
          </button>

          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-600 text-center">
              {t('backtest.save.hint')}
            </p>
          </div>
        </div>
      </div>

      {/* Modal - Versione Semplificata */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-900">{t('backtest.save.modalTitle')}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Nome Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('backtest.save.strategyName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                  autoFocus
                />
              </div>

              {/* Checkbox Preferiti */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  id="add-to-favorites"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <label htmlFor="add-to-favorites" className="text-sm font-medium text-slate-700 cursor-pointer">
                  {t('backtest.save.addToFavorites')}
                </label>
              </div>

              {/* Counter */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600 pt-2">
                <span>{t('backtest.save.counter')}</span>
                <span className="font-bold text-slate-900">{savedBacktests.length}/100</span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                {t('common:actions.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={name.trim().length < 3 || isSaving}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
                  name.trim().length >= 3 && !isSaving
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('backtest.save.saving')}
                  </span>
                ) : (
                  t('backtest.save.saveConfirm')
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
