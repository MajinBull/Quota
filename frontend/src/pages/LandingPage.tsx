import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoQuota from '../assets/logo-quota.png';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';
import { SEO } from '../components/SEO';

export function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(['landing', 'common']);

  // Get feature and steps data with typing
  const features = t('landing:features.list', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const steps = t('landing:howItWorks.steps', { returnObjects: true }) as Array<{ title: string; description: string }>;

  return (
    <>
      <SEO page="landing" />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <img src={logoQuota} alt="QUOTA" className="h-8 md:h-10" />
            <div className="flex items-center gap-2 md:gap-3">
              <div className="scale-90">
                <ThemeToggle />
              </div>
              <div className="scale-90">
                <LanguageSwitcher />
              </div>
              <button
                onClick={() => navigate('/app')}
                className="px-3 md:px-6 py-2 md:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs md:text-sm transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
              >
                {t('landing:header.cta')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center">
        <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6">
          {t('landing:hero.badge')}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6 px-2">
          {t('landing:hero.title')}<br />
          <span className="text-indigo-600 dark:text-indigo-400">{t('landing:hero.titleHighlight')}</span>
        </h1>
        <p className="text-base md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-3 md:mb-4 leading-relaxed px-2">
          {t('landing:hero.subtitle')}
        </p>
        <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8 md:mb-10 px-2">
          {t('landing:hero.description')}
        </p>
        <button
          onClick={() => navigate('/app')}
          className="px-8 md:px-10 py-3.5 md:py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg md:text-xl transition-all shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40"
        >
          {t('landing:hero.cta')}
        </button>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-3">
          {t('landing:features.title')}
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
          {t('landing:features.subtitle')}
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-slate-900 transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{features[0].title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {features[0].description}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-slate-900 transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{features[1].title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {features[1].description}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-slate-900 transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{features[2].title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {features[2].description}
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-slate-900 transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{features[3].title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {features[3].description}
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-slate-900 transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{features[4].title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {features[4].description}
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-slate-900 transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{features[5].title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {features[5].description}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            {t('landing:howItWorks.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6 px-2">
          {t('landing:cta.title')}
        </h2>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 md:mb-8 px-2">
          {t('landing:cta.subtitle')}
        </p>
        <button
          onClick={() => navigate('/app')}
          className="px-6 md:px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-base md:text-lg transition-all shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40"
        >
          {t('landing:cta.button')}
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-slate-600 dark:text-slate-300 text-sm">
              <span className="font-semibold text-slate-900 dark:text-white">{t('common:footer.brand')}</span>
              {' · '}{t('common:footer.subtitle')}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">
              {t('common:footer.disclaimer')}
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
