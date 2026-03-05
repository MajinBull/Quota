import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import type { SavedBacktest } from '../stores/comparisonStore';
import type { PortfolioAllocation } from '../types';
import { formatPercentage, formatCurrency, formatDate } from '../utils/formatters';
import { ASSET_METADATA } from '../utils/dataLoader';

interface Props {
  backtests: SavedBacktest[];
  onClose: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const PIE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

// Normalizza equity curve a base 100
function normalizeEquityCurve(equityCurve: any[]) {
  const firstValue = equityCurve[0].value;
  return equityCurve.map(point => ({
    date: point.date,
    normalizedValue: (point.value / firstValue) * 100
  }));
}

// Interpola valore per una data specifica da un dataset
function interpolateValue(data: any[], targetDate: string): number | undefined {
  // Trova il punto esatto
  const exactPoint = data.find(p => p.date === targetDate);
  if (exactPoint) return exactPoint.normalizedValue;

  // Se non trovato, interpola tra punti vicini
  let beforePoint = null;
  let afterPoint = null;

  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].date < targetDate && data[i + 1].date > targetDate) {
      beforePoint = data[i];
      afterPoint = data[i + 1];
      break;
    }
  }

  if (beforePoint && afterPoint) {
    // Interpolazione lineare
    const beforeTime = new Date(beforePoint.date).getTime();
    const afterTime = new Date(afterPoint.date).getTime();
    const targetTime = new Date(targetDate).getTime();

    const ratio = (targetTime - beforeTime) / (afterTime - beforeTime);
    return beforePoint.normalizedValue + (afterPoint.normalizedValue - beforePoint.normalizedValue) * ratio;
  }

  return undefined;
}

// Merge con sampling regolare e interpolazione
function mergeEquityCurvesWithDates(backtests: SavedBacktest[]) {
  // Step 1: Pre-normalizza ogni backtest
  const normalizedBacktests = backtests.map((bt, idx) => ({
    data: normalizeEquityCurve(bt.result.equityCurve),
    index: idx,
    startDate: bt.result.equityCurve[0].date,
    endDate: bt.result.equityCurve[bt.result.equityCurve.length - 1].date
  }));

  // Step 2: Trova il range totale che copre TUTTI i backtest
  const allStartDates = normalizedBacktests.map(bt => bt.startDate);
  const allEndDates = normalizedBacktests.map(bt => bt.endDate);
  const overallStartDate = allStartDates.sort()[0]; // PRIMO start (più vecchio)
  const overallEndDate = allEndDates.sort()[allEndDates.length - 1]; // ULTIMO end (più recente)

  // Step 3: Raccogli tutte le date nel range totale
  const datesInRange = new Set<string>();
  normalizedBacktests.forEach(({ data }) => {
    data.forEach(point => {
      if (point.date >= overallStartDate && point.date <= overallEndDate) {
        datesInRange.add(point.date);
      }
    });
  });

  const sortedDates = Array.from(datesInRange).sort();

  // Step 4: Sampling regolare (ogni 15 punti per avere ~2 settimane di intervallo)
  const samplingInterval = 15;
  const sampledDates: string[] = [];

  // Sempre include primo e ultimo
  sampledDates.push(sortedDates[0]);

  for (let i = samplingInterval; i < sortedDates.length - 1; i += samplingInterval) {
    sampledDates.push(sortedDates[i]);
  }

  // Sempre include ultimo
  if (sortedDates.length > 1) {
    sampledDates.push(sortedDates[sortedDates.length - 1]);
  }

  // Step 5: Per ogni data campionata, trova o interpola il valore per TUTTI i backtest
  const mergedData = sampledDates.map(date => {
    const dataPoint: any = {
      date,
      formattedDate: formatDate(date)
    };

    normalizedBacktests.forEach(({ data, index, startDate, endDate }) => {
      // Se il backtest è attivo in questa data
      if (date >= startDate && date <= endDate) {
        const value = interpolateValue(data, date);
        if (value !== undefined) {
          dataPoint[`portfolio_${index}`] = value;
        }
      }
      // Se non è attivo, lascialo undefined
    });

    return dataPoint;
  });

  return mergedData;
}

// Determina winner per una metrica
function getWinnerIndex(metric: string, backtests: SavedBacktest[]): number {
  const values = backtests.map(bt => {
    switch (metric) {
      case 'totalReturn':
        return bt.result.metrics.totalReturn;
      case 'averageAnnualReturn':
        return bt.result.metrics.averageAnnualReturn;
      case 'maxDrawdown':
        return bt.result.metrics.maxDrawdown;
      case 'finalValue':
        return bt.result.metrics.finalValue;
      default:
        return 0;
    }
  });

  if (metric === 'maxDrawdown') {
    // Per drawdown, il meno negativo (più alto) vince
    return values.indexOf(Math.max(...values));
  }

  // Per tutte le altre metriche, il più alto vince
  return values.indexOf(Math.max(...values));
}

export function ComparisonView({ backtests, onClose }: Props) {
  const { t } = useTranslation(['app', 'common']);
  const { isDark } = useTheme();
  const mergedData = mergeEquityCurvesWithDates(backtests);

  // Chart colors based on theme
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const axisColor = isDark ? '#94a3b8' : '#64748b';

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('app:comparison.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          {/* METRICHE A CONFRONTO */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm mb-3">
              {t('app:comparison.metricsTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 md:hidden">{t('app:comparison.scrollHint')}</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                      {t('app:comparison.metricColumn')}
                    </th>
                    {backtests.map(bt => (
                      <th key={bt.id} className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        {bt.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {/* Rendimento Totale */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {t('app:comparison.metrics.totalReturn')}
                    </td>
                    {backtests.map((bt, index) => {
                      const isWinner = index === getWinnerIndex('totalReturn', backtests);
                      return (
                        <td
                          key={bt.id}
                          className={`px-6 py-4 text-sm font-semibold ${
                            isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {formatPercentage(bt.result.metrics.totalReturn)}
                          {isWinner && ' 🏆'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Media Annua */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {t('app:comparison.metrics.averageAnnualReturn')}
                    </td>
                    {backtests.map((bt, index) => {
                      const isWinner = index === getWinnerIndex('averageAnnualReturn', backtests);
                      return (
                        <td
                          key={bt.id}
                          className={`px-6 py-4 text-sm font-semibold ${
                            isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {formatPercentage(bt.result.metrics.averageAnnualReturn)}
                          {isWinner && ' 🏆'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Max Drawdown */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {t('app:comparison.metrics.maxDrawdown')}
                    </td>
                    {backtests.map((bt, index) => {
                      const isWinner = index === getWinnerIndex('maxDrawdown', backtests);
                      return (
                        <td
                          key={bt.id}
                          className={`px-6 py-4 text-sm font-semibold ${
                            isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {formatPercentage(bt.result.metrics.maxDrawdown)}
                          {isWinner && ' 🏆'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Valore Finale */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {t('app:comparison.metrics.finalValue')}
                    </td>
                    {backtests.map((bt, index) => {
                      const isWinner = index === getWinnerIndex('finalValue', backtests);
                      return (
                        <td
                          key={bt.id}
                          className={`px-6 py-4 text-sm font-semibold ${
                            isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {formatCurrency(bt.result.metrics.finalValue)}
                          {isWinner && ' 🏆'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Best Asset */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {t('app:comparison.metrics.bestAsset')}
                    </td>
                    {backtests.map(bt => (
                      <td key={bt.id} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {bt.result.metrics.bestAsset}
                        {' '}
                        ({formatPercentage(bt.result.metrics.bestAssetReturn || 0)})
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CRESCITA NORMALIZZATA */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm mb-4">
              {t('app:comparison.growthTitle')}
            </h3>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mergedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 12, fill: axisColor }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    label={{ value: t('app:comparison.growthAxisLabel'), angle: -90, position: 'insideLeft', fill: axisColor }}
                    tick={{ fontSize: 12, fill: axisColor }}
                  />
                  <Tooltip
                    labelFormatter={(label) => `${t('app:comparison.growthTooltipDate')} ${label}`}
                    formatter={(value) => value !== undefined ? (value as number).toFixed(2) : '-'}
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      color: isDark ? '#f1f5f9' : '#0f172a'
                    }}
                  />
                  <Legend wrapperStyle={{ color: isDark ? '#cbd5e1' : '#64748b' }} />

                  {backtests.map((backtest, index) => (
                    <Line
                      key={backtest.id}
                      type="monotone"
                      dataKey={`portfolio_${index}`}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={3}
                      dot={false}
                      name={backtest.name}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ALLOCAZIONI */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm mb-4">
              {t('app:comparison.allocationsTitle')}
            </h3>
            <div className={`grid grid-cols-1 ${backtests.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
              {backtests.map((backtest) => {
                const pieData = backtest.portfolio.allocations.map((alloc: PortfolioAllocation, index: number) => ({
                  name: ASSET_METADATA[alloc.symbol]?.name || alloc.symbol,
                  value: alloc.percentage,
                  color: PIE_COLORS[index % PIE_COLORS.length]
                }));

                return (
                  <div key={backtest.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-center">{backtest.name}</h4>

                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ value }) => `${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="mt-4 space-y-2">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">
                            {item.name}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONFIGURAZIONI */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm mb-4">
              {t('app:comparison.configurationsTitle')}
            </h3>
            <div className={`grid grid-cols-1 ${backtests.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
              {backtests.map(backtest => (
                <div key={backtest.id} className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">{backtest.name}</h4>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{t('app:comparison.config.strategy')}</span>
                      <p className="text-slate-900 dark:text-white">
                        {backtest.portfolio.investmentStrategy === 'lump_sum' ? t('app:strategy.lumpSum.name') : t('app:strategy.pac.name')}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{t('app:comparison.config.capital')}</span>
                      <p className="text-slate-900 dark:text-white">
                        {formatCurrency(backtest.portfolio.initialCapital)}
                        {backtest.portfolio.investmentStrategy === 'pac' && backtest.portfolio.pacAmount && (
                          <span className="block text-xs mt-1">
                            +{formatCurrency(backtest.portfolio.pacAmount)}{t('app:comparison.config.perMonth')}
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{t('app:comparison.config.rebalance')}</span>
                      <p className="text-slate-900 dark:text-white capitalize">{backtest.portfolio.rebalanceFrequency}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{t('app:comparison.config.period')}</span>
                      <p className="text-slate-900 dark:text-white text-xs">
                        {formatDate(backtest.result.startDate)}
                        <br />
                        {formatDate(backtest.result.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
