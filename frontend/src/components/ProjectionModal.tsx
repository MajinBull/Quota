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
import { useTheme } from '../contexts/ThemeContext';
import type { BacktestResult } from '../types';
import { calculateProjection } from '../utils/projection';
import { formatCurrency } from '../utils/formatters';

interface Props {
  backtestResult: BacktestResult;
  backtestName: string;
  onClose: () => void;
}

export function ProjectionModal({ backtestResult, backtestName, onClose }: Props) {
  const { t } = useTranslation(['app', 'common']);
  const { isDark } = useTheme();
  const [yearsAhead, setYearsAhead] = useState(10);
  const [initialCapital, setInitialCapital] = useState(10000);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Calculate projection based on selected years and capital
  const projection = calculateProjection(backtestResult, yearsAhead, initialCapital);

  // Chart colors based on theme
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const axisColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto overscroll-contain my-4">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between z-10 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {t('app:projection.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
              {backtestName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4">
          {/* Initial Capital Input & Horizon - Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Initial Capital Input */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Capitale Iniziale
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-semibold text-sm">€</span>
                <input
                  type="number"
                  min="100"
                  max="10000000"
                  step="1000"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Math.max(100, parseInt(e.target.value) || 0))}
                  className="w-full pl-7 pr-3 py-2 text-base font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-4 gap-1 mt-2">
                <button
                  onClick={() => setInitialCapital(5000)}
                  className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  5K
                </button>
                <button
                  onClick={() => setInitialCapital(10000)}
                  className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  10K
                </button>
                <button
                  onClick={() => setInitialCapital(25000)}
                  className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  25K
                </button>
                <button
                  onClick={() => setInitialCapital(50000)}
                  className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  50K
                </button>
              </div>
            </div>

            {/* Horizon Slider */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('app:projection.horizon')}
                </label>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {yearsAhead} {yearsAhead === 1 ? t('app:projection.year') : t('app:projection.years')}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={yearsAhead}
                onChange={(e) => setYearsAhead(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span>1 anno</span>
                <span>30 anni</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              {t('app:projection.chartTitle')}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={projection.timeline} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="year"
                  stroke={axisColor}
                  style={{ fontSize: '10px' }}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis
                  stroke={axisColor}
                  style={{ fontSize: '10px' }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;

                    // Force custom order: optimistic, base, pessimistic
                    const orderedData = [
                      payload.find(p => p.dataKey === 'optimistic'),
                      payload.find(p => p.dataKey === 'base'),
                      payload.find(p => p.dataKey === 'pessimistic'),
                    ].filter(Boolean);

                    return (
                      <div style={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '11px',
                        color: isDark ? '#f1f5f9' : '#0f172a'
                      }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>{label}</p>
                        {orderedData.map((entry: any, index: number) => (
                          <p key={index} style={{ color: entry.stroke, margin: '2px 0' }}>
                            {entry.name}: {formatCurrency(entry.value)}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="pessimistic"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  fill="url(#colorPessimistic)"
                  name={t('app:projection.scenarios.pessimistic')}
                />
                <Area
                  type="monotone"
                  dataKey="base"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorBase)"
                  name={t('app:projection.scenarios.base')}
                />
                <Area
                  type="monotone"
                  dataKey="optimistic"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fill="url(#colorOptimistic)"
                  name={t('app:projection.scenarios.optimistic')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Table */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('app:projection.summaryTitle')}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {t('app:projection.table.scenario')}
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Valore {projection.timeline[projection.timeline.length - 1].year}
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                      CAGR
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Rendimento
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {/* Optimistic */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="font-medium text-slate-900 dark:text-white text-sm">
                          {t('app:projection.scenarios.optimistic')}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right font-semibold text-green-600 dark:text-green-400 text-sm">
                      {formatCurrency(projection.optimistic.value)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-slate-700 dark:text-slate-300 text-sm">
                      {projection.optimistic.cagr.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-green-600 dark:text-green-400 font-medium text-sm">
                      +{((projection.optimistic.value / projection.initialCapital - 1) * 100).toFixed(1)}%
                    </td>
                  </tr>

                  {/* Base */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="font-medium text-slate-900 dark:text-white text-sm">
                          {t('app:projection.scenarios.base')}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
                      {formatCurrency(projection.base.value)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-slate-700 dark:text-slate-300 text-sm">
                      {projection.base.cagr.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                      +{((projection.base.value / projection.initialCapital - 1) * 100).toFixed(1)}%
                    </td>
                  </tr>

                  {/* Pessimistic */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="font-medium text-slate-900 dark:text-white text-sm">
                          {t('app:projection.scenarios.pessimistic')}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right font-semibold text-red-600 dark:text-red-400 text-sm">
                      {formatCurrency(projection.pessimistic.value)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-slate-700 dark:text-slate-300 text-sm">
                      {projection.pessimistic.cagr.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-red-600 dark:text-red-400 font-medium text-sm">
                      +{((projection.pessimistic.value / projection.initialCapital - 1) * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-slate-700 dark:text-slate-300 text-xs mb-1">
                  {t('app:projection.disclaimer.text')}
                </p>
                <button
                  onClick={() => setShowDisclaimer(true)}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium underline"
                >
                  {t('app:projection.disclaimer.readMore')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full Disclaimer Modal (nested) */}
        {showDisclaimer && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between rounded-t-xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('app:projection.disclaimer.fullTitle')}
                </h3>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-3 text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {t('app:projection.disclaimer.warning')}
                </p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {t('app:projection.disclaimer.assumptionsTitle')}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>{t('app:projection.disclaimer.assumption1')}</li>
                    <li>{t('app:projection.disclaimer.assumption2')}</li>
                    <li>{t('app:projection.disclaimer.assumption3')}</li>
                    <li>{t('app:projection.disclaimer.assumption4')}</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {t('app:projection.disclaimer.risksTitle')}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>{t('app:projection.disclaimer.risk1')}</li>
                    <li>{t('app:projection.disclaimer.risk2')}</li>
                    <li>{t('app:projection.disclaimer.risk3')}</li>
                    <li>{t('app:projection.disclaimer.risk4')}</li>
                  </ul>
                </div>

                <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  {t('app:projection.disclaimer.advice')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
