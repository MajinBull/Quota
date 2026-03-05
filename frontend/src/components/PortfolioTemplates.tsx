import { useTranslation } from 'react-i18next';
import { usePortfolioStore } from '../stores/portfolioStore';
import type { PortfolioAllocation } from '../types';

interface Template {
  name: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  allocations: PortfolioAllocation[];
  color: string;
}

interface Props {
  onTemplateSelect?: () => void;
}

const TEMPLATE_DATA: Template[] = [
  {
    name: '', // Will be replaced by translation
    description: '', // Will be replaced by translation
    risk: 'low',
    color: 'bg-blue-500',
    allocations: [
      { symbol: 'AGG', percentage: 40 },
      { symbol: 'GLD', percentage: 30 },
      { symbol: 'VNQ', percentage: 20 },
      { symbol: 'SPY', percentage: 10 }
    ]
  },
  {
    name: '', // Will be replaced by translation
    description: '', // Will be replaced by translation
    risk: 'medium',
    color: 'bg-yellow-500',
    allocations: [
      { symbol: 'SPY', percentage: 40 },
      { symbol: 'VEA', percentage: 20 },
      { symbol: 'GLD', percentage: 20 },
      { symbol: 'AGG', percentage: 10 },
      { symbol: 'VNQ', percentage: 10 }
    ]
  },
  {
    name: '', // Will be replaced by translation
    description: '', // Will be replaced by translation
    risk: 'high',
    color: 'bg-red-500',
    allocations: [
      { symbol: 'QQQ', percentage: 40 },
      { symbol: 'BTC-USD', percentage: 25 },
      { symbol: 'ETH-USD', percentage: 15 },
      { symbol: 'SPY', percentage: 10 },
      { symbol: 'GLD', percentage: 10 }
    ]
  }
];

const RISK_ICONS = {
  low: '🛡️',
  medium: '⚖️',
  high: '🚀'
};

export function PortfolioTemplates({ onTemplateSelect }: Props) {
  const { t } = useTranslation('app');
  const { portfolio, updateMultipleAllocations } = usePortfolioStore();

  const templates = t('templates.list', { returnObjects: true }) as Array<{ name: string; description: string }>;
  const riskLabels = {
    low: t('templates.risk.low'),
    medium: t('templates.risk.medium'),
    high: t('templates.risk.high')
  };

  const loadTemplate = (template: Template) => {
    // Sostituisce SOLO le allocazioni, mantenendo tutti gli altri parametri
    // (capitale, ribilanciamento, anno inizio, importo PAC, periodo PAC, strategia)
    updateMultipleAllocations(template.allocations);

    // Call callback if provided
    if (onTemplateSelect) {
      onTemplateSelect();
    }
  };

  return (
    <div>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        {t('templates.description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TEMPLATE_DATA.map((template, index) => {
          const translatedTemplate = templates[index];
          const riskLabel = riskLabels[template.risk];
          const riskIcon = RISK_ICONS[template.risk];

          return (
            <div
              key={index}
              className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                    {translatedTemplate.name}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                    {riskIcon}
                    <span>{riskLabel}</span>
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                {translatedTemplate.description}
              </p>

              <div className="mb-5">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  {t('templates.composition', 'Composizione')}
                </div>
                <div className="space-y-2">
                  {template.allocations.map((alloc) => (
                    <div
                      key={alloc.symbol}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium text-slate-700 dark:text-slate-300">{alloc.symbol}</span>
                      <span className="text-slate-900 dark:text-white font-semibold">{alloc.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => loadTemplate(template)}
                className="w-full bg-slate-900 dark:bg-slate-700 text-white py-2.5 px-4 rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all duration-200 font-medium text-sm group-hover:shadow-md"
              >
                {t('templates.loadButton')}
              </button>
            </div>
          );
        })}
      </div>

      {portfolio.allocations.length > 0 && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/35 border border-amber-200 dark:border-amber-700 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div className="flex-1">
              <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                {t('templates.warning.title', 'Portfolio già configurato')}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {t('templates.warning.message', 'Caricando un template sostituirai solo gli asset del portfolio. Le altre impostazioni (capitale, ribilanciamento, ecc.) verranno mantenute.')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
