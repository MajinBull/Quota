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
  const { metrics, equityCurve, assetPerformances, yearlyBreakdown, portfolio, startDate, endDate } = result;

  // Prepare equity curve data for chart (with invested capital line)
  const chartData = equityCurve.map((point) => ({
    date: point.date,
    value: point.value,
    invested: point.investedCapital || metrics.initialValue,
    formattedDate: formatDate(point.date)
  }));

  // Sample data for display (every 30 days to avoid overcrowding)
  const sampledData = chartData.filter((_, index) => index % 30 === 0 || index === chartData.length - 1);

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

  // Sample asset data (every 30 points)
  const sampledAssetData = assetChartData.filter((_, index) =>
    index % 30 === 0 || index === assetChartData.length - 1
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
      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide text-sm">
            Metriche Chiave
          </h2>
          <div className="text-slate-600 text-sm">
            <span className="font-medium">Periodo: </span>
            {formatDateRange(startDate, endDate)}
          </div>
        </div>

        {/* Key Metrics Grid - 6 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            label="Valore Finale"
            value={formatCurrency(metrics.finalValue)}
            positive={metrics.finalValue > metrics.totalInvested}
          />
          <MetricCard
            label="Investito"
            value={formatCurrency(metrics.totalInvested)}
            positive={false}
          />
          <MetricCard
            label="Rendimento Totale"
            value={formatPercentage(metrics.totalReturn)}
            positive={metrics.totalReturn > 0}
          />
          <MetricCard
            label="Media Annua"
            value={formatPercentage(metrics.averageAnnualReturn)}
            positive={metrics.averageAnnualReturn > 0}
          />
          <MetricCard
            label="Max Drawdown"
            value={formatPercentage(metrics.maxDrawdown)}
            positive={false}
            negative={true}
          />
          {metrics.bestAsset && (
            <MetricCard
              label="Best Asset"
              value={`${metrics.bestAsset} (${formatPercentage(metrics.bestAssetReturn || 0)})`}
              positive={true}
            />
          )}
        </div>
      </div>

      {/* CRESCITA PORTFOLIO + ALLOCAZIONE - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crescita Portfolio (65% width = 2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-slate-900 uppercase tracking-wide text-sm">
            Crescita Portfolio
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sampledData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                name="Valore Portfolio"
              />
              <Line
                type="monotone"
                dataKey="invested"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Capitale Investito"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Allocazione Portfolio (35% width = 1 column) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-slate-900 uppercase tracking-wide text-sm">
            Allocazione
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
              <Tooltip />
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
                <span className="text-sm text-slate-700 truncate">
                  {item.name}
                </span>
                <span className="text-sm font-semibold text-slate-900 ml-auto">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PERFORMANCE PER ASSET */}
      {assetPerformances.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-slate-900 uppercase tracking-wide text-sm">
            Performance per Asset (Indice Base 100)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sampledAssetData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: 'Indice (Base 100)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Legend />
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
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-slate-900 uppercase tracking-wide text-sm">
            Breakdown Anno per Anno
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Anno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Valore Portfolio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Investito
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Rend. Anno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Rend. Cumulativo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {yearlyBreakdown.map((row) => {
                  return (
                    <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {row.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatCurrency(row.portfolioValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
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
  let colorClass = 'text-slate-900';
  if (positive) colorClass = getValueColor(1);
  if (negative) colorClass = getValueColor(-1);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">{label}</div>
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}
