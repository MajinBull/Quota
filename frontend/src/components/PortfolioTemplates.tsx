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

const TEMPLATES: Template[] = [
  {
    name: 'Conservativo',
    description: 'Basso rischio, focus su stabilità e protezione del capitale',
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
    name: 'Bilanciato',
    description: 'Mix equilibrato tra crescita e sicurezza',
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
    name: 'Aggressivo',
    description: 'Alto rischio, alto potenziale rendimento',
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

const RISK_LABELS = {
  low: { label: 'Basso Rischio', icon: '🛡️' },
  medium: { label: 'Medio Rischio', icon: '⚖️' },
  high: { label: 'Alto Rischio', icon: '🚀' }
};

export function PortfolioTemplates({ onTemplateSelect }: Props) {
  const { portfolio, updateMultipleAllocations } = usePortfolioStore();

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
      <p className="text-slate-600 mb-6">
        Inizia rapidamente con un portfolio preconfigurato e personalizzalo secondo le tue esigenze
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => {
          const riskInfo = RISK_LABELS[template.risk];

          return (
            <div
              key={template.name}
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-1">
                    {template.name}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    {riskInfo.icon}
                    <span>{riskInfo.label}</span>
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {template.description}
              </p>

              <div className="mb-5">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Composizione
                </div>
                <div className="space-y-2">
                  {template.allocations.map((alloc) => (
                    <div
                      key={alloc.symbol}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium text-slate-700">{alloc.symbol}</span>
                      <span className="text-slate-900 font-semibold">{alloc.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => loadTemplate(template)}
                className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-xl hover:bg-indigo-600 transition-all duration-200 font-medium text-sm group-hover:shadow-md"
              >
                Usa Template
              </button>
            </div>
          );
        })}
      </div>

      {portfolio.allocations.length > 0 && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div className="flex-1">
              <p className="text-sm text-amber-900 font-medium">
                Portfolio già configurato
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Caricando un template sostituirai solo gli asset del portfolio. Le altre impostazioni (capitale, ribilanciamento, ecc.) verranno mantenute.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
