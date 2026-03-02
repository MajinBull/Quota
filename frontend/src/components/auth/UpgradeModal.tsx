import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  onClose: () => void;
}

export function UpgradeModal({ onClose }: Props) {
  const { t } = useTranslation('auth');
  const { user } = useAuth();

  const features = t('upgrade.features', { returnObjects: true }) as Array<{ title: string; description: string }>;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm md:max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-5 md:px-6 md:py-6 text-center">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
            {t('upgrade.title')}
          </h2>
          <p className="text-sm md:text-base text-indigo-100">
            {t('upgrade.subtitle', { count: user?.backtestExecutionCount || 20 })}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Features List - 2 colonne su desktop, 1 su mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-x-4 md:gap-y-3 mb-4 md:mb-5">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
                  <p className="text-xs text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Info Box */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-3 md:p-4 mb-4 md:mb-5">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-medium text-slate-700">{t('upgrade.pricing.title')}</span>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-indigo-600">{t('upgrade.pricing.price')}</p>
                <p className="text-xs text-slate-600">{t('upgrade.pricing.period')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-indigo-200">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-slate-700">{t('upgrade.pricing.noCommitment')}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              disabled
              className="w-full py-3 md:py-3.5 px-6 rounded-xl font-semibold text-sm md:text-base bg-gradient-to-r from-slate-400 to-slate-500 text-white cursor-not-allowed shadow-lg"
            >
              {t('upgrade.actions.upgrade')}
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 md:py-3 px-6 rounded-xl font-semibold text-sm md:text-base bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {t('upgrade.actions.close')}
            </button>
          </div>

          {/* Info Note */}
          <p className="text-xs text-center text-slate-500 mt-3">
            {t('upgrade.comingSoon')}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
