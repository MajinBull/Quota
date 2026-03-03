import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { BacktestResult } from '../types';
import { calculateProjection } from '../utils/projection';
import { formatCurrency } from '../utils/formatters';

interface Props {
  backtestResult: BacktestResult;
}

export function ProjectionView({ backtestResult }: Props) {
  const { t } = useTranslation(['app', 'common']);
  const [yearsAhead, setYearsAhead] = useState(10);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Calculate projection based on selected years
  const projection = calculateProjection(backtestResult, yearsAhead);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h2 className="text-2xl font-bold text-slate-900">
            {t('app:projection.title', 'Proiezione Futura')}
          </h2>
        </div>
        <p className="text-slate-600 text-sm">
          {t('app:projection.subtitle', 'Stima statistica del valore futuro del portfolio basata sui dati storici')}
        </p>
      </div>

      {/* Horizon Slider */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-slate-700">
            {t('app:projection.horizon', 'Orizzonte Temporale')}
          </label>
          <span className="text-2xl font-bold text-indigo-600">
            {yearsAhead} {yearsAhead === 1 ? t('app:projection.year') : t('app:projection.years')}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="30"
          value={yearsAhead}
          onChange={(e) => setYearsAhead(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>1 {t('app:projection.year')}</span>
          <span>30 {t('app:projection.years')}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {t('app:projection.chartTitle', 'Evoluzione Proiettata')}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={projection.timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPessimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => value.toString()}
            />
            <YAxis
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
              }}
              formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
              labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="optimistic"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorOptimistic)"
              name={t('app:projection.scenarios.optimistic', 'Scenario Ottimistico')}
            />
            <Area
              type="monotone"
              dataKey="base"
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#colorBase)"
              name={t('app:projection.scenarios.base', 'Scenario Base')}
            />
            <Area
              type="monotone"
              dataKey="pessimistic"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorPessimistic)"
              name={t('app:projection.scenarios.pessimistic', 'Scenario Pessimistico')}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('app:projection.summaryTitle', 'Riepilogo Scenari')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t('app:projection.table.scenario', 'Scenario')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t('app:projection.table.finalValue', 'Valore')} {projection.timeline[projection.timeline.length - 1].year}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t('app:projection.table.cagr', 'CAGR Proiettato')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t('app:projection.table.totalReturn', 'Rendimento Totale')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Optimistic */}
              <tr className="hover:bg-green-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium text-slate-900">
                      {t('app:projection.scenarios.optimistic', 'Ottimistico')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-green-600">
                  {formatCurrency(projection.optimistic.value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-slate-700">
                  {projection.optimistic.cagr.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 font-medium">
                  +{((projection.optimistic.value / projection.initialCapital - 1) * 100).toFixed(1)}%
                </td>
              </tr>

              {/* Base */}
              <tr className="hover:bg-indigo-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="font-medium text-slate-900">
                      {t('app:projection.scenarios.base', 'Base')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-indigo-600">
                  {formatCurrency(projection.base.value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-slate-700">
                  {projection.base.cagr.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-indigo-600 font-medium">
                  {((projection.base.value / projection.initialCapital - 1) * 100).toFixed(1)}%
                </td>
              </tr>

              {/* Pessimistic */}
              <tr className="hover:bg-red-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-medium text-slate-900">
                      {t('app:projection.scenarios.pessimistic', 'Pessimistico')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-red-600">
                  {formatCurrency(projection.pessimistic.value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-slate-700">
                  {projection.pessimistic.cagr.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-red-600 font-medium">
                  {((projection.pessimistic.value / projection.initialCapital - 1) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-2">
              {t('app:projection.disclaimer.title', 'Avviso Importante')}
            </h4>
            <p className="text-amber-800 text-sm mb-3">
              {t('app:projection.disclaimer.text',
                'Le performance passate non garantiscono rendimenti futuri. Questa è una proiezione statistica basata su dati storici, NON una previsione o raccomandazione di investimento.'
              )}
            </p>
            <button
              onClick={() => setShowDisclaimer(true)}
              className="text-sm text-amber-700 hover:text-amber-900 font-medium underline"
            >
              {t('app:projection.disclaimer.readMore', 'Leggi disclaimer completo')}
            </button>
          </div>
        </div>
      </div>

      {/* Full Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {t('app:projection.disclaimer.fullTitle', 'Disclaimer Completo - Proiezioni Future')}
              </h3>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 text-slate-700">
              <p className="font-semibold text-slate-900">
                {t('app:projection.disclaimer.warning',
                  'ATTENZIONE: Le proiezioni mostrate sono esclusivamente a scopo illustrativo e NON costituiscono consulenza finanziaria.'
                )}
              </p>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">
                  {t('app:projection.disclaimer.assumptionsTitle', 'Assunzioni del Modello:')}
                </h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>{t('app:projection.disclaimer.assumption1', 'Le performance future saranno simili a quelle storiche')}</li>
                  <li>{t('app:projection.disclaimer.assumption2', 'La volatilità rimarrà costante nel tempo')}</li>
                  <li>{t('app:projection.disclaimer.assumption3', 'Non considera eventi estremi o crisi economiche')}</li>
                  <li>{t('app:projection.disclaimer.assumption4', 'Non include costi di transazione, tasse o commissioni future')}</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">
                  {t('app:projection.disclaimer.risksTitle', 'Rischi e Limitazioni:')}
                </h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>{t('app:projection.disclaimer.risk1', 'I mercati possono comportarsi in modo completamente diverso dal passato')}</li>
                  <li>{t('app:projection.disclaimer.risk2', 'Le proiezioni diventano meno affidabili su orizzonti temporali lunghi')}</li>
                  <li>{t('app:projection.disclaimer.risk3', 'Eventi imprevisti possono causare risultati molto diversi')}</li>
                  <li>{t('app:projection.disclaimer.risk4', 'Il capitale investito è sempre a rischio di perdita')}</li>
                </ul>
              </div>

              <p className="text-sm font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-4">
                {t('app:projection.disclaimer.advice',
                  'Consulta sempre un consulente finanziario professionale prima di prendere decisioni di investimento. Questo tool è solo educativo.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
