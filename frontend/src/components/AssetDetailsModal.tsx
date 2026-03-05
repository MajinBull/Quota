import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { loadAssetData, ASSET_METADATA } from '../utils/dataLoader';
import type { AssetData } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Props {
  symbol: string;
  onClose: () => void;
}

function formatDataPoints(days: number): string {
  if (days < 365) {
    return `${days.toLocaleString('it-IT')} giorni`;
  }

  const years = Math.floor(days / 365);
  const remainingDays = days % 365;

  if (remainingDays === 0) {
    return years === 1 ? '1 anno' : `${years} anni`;
  }

  const yearText = years === 1 ? '1 anno' : `${years} anni`;
  return `${yearText} e ${remainingDays} giorni`;
}

export function AssetDetailsModal({ symbol, onClose }: Props) {
  const { t } = useTranslation(['app', 'assets']);
  const { isDark } = useTheme();
  const [assetData, setAssetData] = useState<AssetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assetInfo = ASSET_METADATA[symbol];

  // Chart colors based on theme
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const brushFill = isDark ? '#1e293b' : '#f8fafc';

  // Get translated description if available, fallback to original
  const getTranslatedDescription = () => {
    const translationKey = `assets:${symbol}.longDescription`;
    const translated = t(translationKey, { defaultValue: '' });
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Fallback to original description
    return assetInfo?.longDescription || '';
  };

  const translatedLongDescription = getTranslatedDescription();

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await loadAssetData(symbol);
        if (data) {
          setAssetData(data);
        } else {
          setError(t('assetDetails.error'));
        }
      } catch (err) {
        setError(t('assetDetails.errorGeneric'));
        console.error('Error loading asset data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [symbol]);

  // Prepare chart data with downsampling (every 7 days for performance)
  const allData = assetData?.candles.map((candle) => ({
    date: candle.date,
    price: candle.close,
    formattedDate: formatDate(candle.date)
  })) || [];

  // Downsample: take every 7th data point
  const chartData = allData.filter((_, index) => index % 7 === 0 || index === allData.length - 1);

  // Calculate start index for last 5 years in the downsampled data
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  const defaultStartIndex = chartData.findIndex(
    (point) => new Date(point.date) >= fiveYearsAgo
  );
  const startIndex = defaultStartIndex >= 0 ? defaultStartIndex : 0;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      {/* Outer container: rounded corners + overflow hidden (clips scrollbar) */}
      <div className="rounded-2xl overflow-hidden w-full max-w-full lg:max-w-4xl max-h-[90vh]">
        {/* Inner container: white bg + scrollable */}
        <div className="bg-white dark:bg-slate-800 overflow-y-auto max-h-[90vh] focus:outline-none relative">
          {/* Sticky button container - height 0 to not occupy space */}
          <div className="sticky top-0 h-0 z-50">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors focus:outline-none shadow-md flex items-center justify-center flex-shrink-0"
              aria-label={t('common:actions.close')}
            >
              <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('assetDetails.loading')}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/35 border border-red-200 dark:border-red-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-red-900 dark:text-red-100 font-semibold text-sm">{t('common:status.error')}</h3>
                  <p className="text-red-700 dark:text-red-300 mt-1 text-xs">{error}</p>
                </div>
              </div>
            </div>
          )}

          {assetData && !isLoading && (
            <div className="space-y-6">
              {/* Header with basic info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                    {t('assetDetails.fields.symbol')}
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{assetData.symbol}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                    {t('assetDetails.fields.fullName')}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {assetInfo?.name || '-'}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                    {t('assetDetails.fields.availablePeriod')}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(assetData.start_date)}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(assetData.end_date)}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                    {t('assetDetails.fields.dataPoints')}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {formatDataPoints(assetData.data_points)}
                  </div>
                </div>
              </div>

              {/* Price Chart */}
              <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 [&_*]:focus:outline-none [&_*]:outline-none">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm mb-2">
                    {t('assetDetails.chart.title')}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t('assetDetails.chart.subtitle')}
                  </div>
                </div>
                <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} style={{ outline: 'none' }}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fontSize: 12, fill: axisColor }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: axisColor }}
                      tickFormatter={(value) => formatCurrency(value)}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                      labelFormatter={(label) => `${t('assetDetails.chart.tooltip')} ${label}`}
                      contentStyle={{
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: isDark ? '#f1f5f9' : '#0f172a'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fill="url(#priceGradient)"
                      name={t('assetDetails.chart.closingPrice')}
                    />
                    <Brush
                      dataKey="formattedDate"
                      height={40}
                      stroke="#4f46e5"
                      fill={brushFill}
                      startIndex={startIndex}
                      endIndex={chartData.length - 1}
                      travellerWidth={10}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                </div>
              </div>

              {/* Extended Info Section - Only show if data available */}
              {(translatedLongDescription || assetInfo?.provider || assetInfo?.inceptionDate || assetInfo?.expenseRatio || assetInfo?.aum || assetInfo?.website) && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4">
                    {t('assetDetails.info.title')}
                  </h3>

                  {/* Description */}
                  {translatedLongDescription && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                      {translatedLongDescription}
                    </p>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {assetInfo.inceptionDate && (
                      <div>
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                          {t('assetDetails.info.inceptionDate')}
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {t(`assets:${symbol}.inceptionDate`, { defaultValue: assetInfo.inceptionDate })}
                        </div>
                      </div>
                    )}
                    {assetInfo.provider && (
                      <div>
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                          {t('assetDetails.info.provider')}
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {assetInfo.provider}
                        </div>
                      </div>
                    )}
                    {assetInfo.expenseRatio && (
                      <div>
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                          {t('assetDetails.info.expenseRatio')}
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {assetInfo.expenseRatio}
                        </div>
                      </div>
                    )}
                    {assetInfo.aum && (
                      <div>
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                          {t('assetDetails.info.aum')}
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {t(`assets:${symbol}.aum`, { defaultValue: assetInfo.aum })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Website Button */}
                  {assetInfo.website && (
                    <a
                      href={assetInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium text-sm rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {t('assetDetails.info.website')}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
