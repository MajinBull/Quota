import { useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import type { BacktestResult } from '../types';
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateRange,
  getValueColor
} from '../utils/formatters';
import { ASSET_METADATA } from '../utils/dataLoader';
import { SaveBacktestButton } from './SaveBacktestButton';

interface Props {
  result: BacktestResult;
  onLoadBacktest?: (result: BacktestResult) => void;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function BacktestResults({ result }: Props) {
  const { t } = useTranslation('app');
  const { isDark } = useTheme();
  const { metrics, equityCurve, assetPerformances, yearlyBreakdown, portfolio, startDate, endDate } = result;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Chart colors based on theme
  const gridColor = isDark ? '#334155' : '#e2e8f0'; // slate-700 : slate-200
  const axisColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 : slate-500

  // Prepare equity curve data for chart (with invested capital line)
  const chartData = equityCurve.map((point) => ({
    date: point.date,
    value: point.value,
    invested: point.investedCapital || metrics.initialValue,
    formattedDate: formatDate(point.date)
  }));

  // Dynamic sampling - target 60 points for optimal chart readability
  const TARGET_POINTS = 60;
  const samplingInterval = Math.max(1, Math.floor(chartData.length / TARGET_POINTS));
  const sampledData = chartData.filter((_, index) =>
    index % samplingInterval === 0 || index === chartData.length - 1
  );

  // Calculate X-axis tick interval for uniform vertical grid lines (target ~10 lines)
  const xAxisTickInterval = Math.floor(sampledData.length / 10);

  // Prepare multi-asset performance data with dates
  const assetChartData = equityCurve.map((point, index) => {
    const dataPoint: any = {
      date: point.date,
      formattedDate: formatDate(point.date)
    };
    assetPerformances.forEach(asset => {
      dataPoint[asset.symbol] = asset.values[index];
    });
    return dataPoint;
  });

  // Dynamic sampling - same interval as main chart for consistency
  const sampledAssetData = assetChartData.filter((_, index) =>
    index % samplingInterval === 0 || index === assetChartData.length - 1
  );

  // Prepare allocation pie chart data
  const pieData = portfolio.allocations.map((alloc, index) => ({
    name: ASSET_METADATA[alloc.symbol]?.name || alloc.symbol,
    value: alloc.percentage,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-8">
      {/* METRICHE CHIAVE */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm">
            {t('backtest.results.title')}
          </h2>
          <div className="text-slate-600 dark:text-slate-400 text-sm">
            <span className="font-medium">{t('backtest.results.period')} </span>
            {formatDateRange(startDate, endDate)}
          </div>
        </div>

        {/* Key Metrics Grid - responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            label={t('backtest.results.metrics.finalValue')}
            value={formatCurrency(metrics.finalValue)}
            positive={metrics.finalValue > metrics.totalInvested}
          />
          <MetricCard
            label={t('backtest.results.metrics.invested')}
            value={formatCurrency(metrics.totalInvested)}
            positive={false}
          />
          <MetricCard
            label={t('backtest.results.metrics.totalReturn')}
            value={formatPercentage(metrics.totalReturn)}
            positive={metrics.totalReturn > 0}
          />
          <MetricCard
            label={t('backtest.results.metrics.annualizedReturn')}
            value={formatPercentage(metrics.averageAnnualReturn)}
            positive={metrics.averageAnnualReturn > 0}
          />
          <MetricCard
            label={t('backtest.results.metrics.maxDrawdown')}
            value={formatPercentage(metrics.maxDrawdown)}
            positive={false}
            negative={true}
          />
          {metrics.bestAsset && (
            <MetricCard
              label={t('backtest.results.metrics.bestAsset')}
              value={`${metrics.bestAsset} (${formatPercentage(metrics.bestAssetReturn || 0)})`}
              positive={true}
            />
          )}
        </div>
      </div>

      {/* CRESCITA PORTFOLIO + ALLOCAZIONE - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crescita Portfolio (65% width = 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-wide text-sm">
            {t('backtest.results.charts.portfolioGrowth')}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sampledData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12, fill: axisColor }}
                interval={xAxisTickInterval}
              />
              <YAxis
                tick={{ fontSize: 12, fill: axisColor }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                labelFormatter={(label) => `${t('backtest.results.charts.tooltipDate')} ${label}`}
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  color: isDark ? '#f1f5f9' : '#0f172a'
                }}
              />
              <Legend wrapperStyle={{ color: isDark ? '#cbd5e1' : '#64748b' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                name={t('backtest.results.charts.portfolioValue')}
              />
              <Line
                type="monotone"
                dataKey="invested"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name={t('backtest.results.charts.investedCapital')}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Allocazione Portfolio (35% width = 1 column) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-wide text-sm">
            {t('backtest.results.charts.allocation')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
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
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  color: isDark ? '#f1f5f9' : '#0f172a'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-6 space-y-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                  {item.name}
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white ml-auto">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PERFORMANCE PER ASSET */}
      {assetPerformances.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-wide text-sm">
            {t('backtest.results.charts.assetPerformance')}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sampledAssetData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12, fill: axisColor }}
                interval={xAxisTickInterval}
              />
              <YAxis
                tick={{ fontSize: 12, fill: axisColor }}
                label={{ value: t('backtest.results.charts.indexLabel'), angle: -90, position: 'insideLeft', fill: axisColor }}
              />
              <Tooltip
                labelFormatter={(label) => `${t('backtest.results.charts.tooltipDate')} ${label}`}
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  color: isDark ? '#f1f5f9' : '#0f172a'
                }}
              />
              <Legend wrapperStyle={{ color: isDark ? '#cbd5e1' : '#64748b' }} />
              {assetPerformances.map((asset, index) => (
                <Line
                  key={asset.symbol}
                  type="monotone"
                  dataKey={asset.symbol}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  name={ASSET_METADATA[asset.symbol]?.name || asset.symbol}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* BREAKDOWN ANNO PER ANNO */}
      {yearlyBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white uppercase tracking-wide text-sm">
            {t('backtest.results.yearlyBreakdown.title')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 md:hidden">{t('backtest.results.yearlyBreakdown.scrollHint')}</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('backtest.results.yearlyBreakdown.columns.year')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('backtest.results.yearlyBreakdown.columns.portfolioValue')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('backtest.results.yearlyBreakdown.columns.invested')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('backtest.results.yearlyBreakdown.columns.yearlyReturn')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('backtest.results.yearlyBreakdown.columns.cumulativeReturn')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {yearlyBreakdown.map((row) => {
                  return (
                    <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-white">
                        {row.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {formatCurrency(row.portfolioValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {formatCurrency(row.investedCapital)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getValueColor(row.yearlyReturn)}`}>
                        {formatPercentage(row.yearlyReturn)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getValueColor(row.cumulativeReturn)}`}>
                        {formatPercentage(row.cumulativeReturn)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SAVE BACKTEST BUTTON (Sticky Bottom-Right) */}
      <SaveBacktestButton portfolio={portfolio} result={result} />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}

function MetricCard({ label, value, positive, negative }: MetricCardProps) {
  let colorClass = 'text-slate-900 dark:text-white';
  if (positive) colorClass = getValueColor(1);
  if (negative) colorClass = getValueColor(-1);

  return (
    <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-5">
      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">{label}</div>
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}
