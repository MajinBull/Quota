import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [assetData, setAssetData] = useState<AssetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assetInfo = ASSET_METADATA[symbol];

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
          setError('Impossibile caricare i dati dell\'asset');
        }
      } catch (err) {
        setError('Errore durante il caricamento dei dati');
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-full lg:max-w-4xl max-h-[90vh] overflow-y-auto focus:outline-none relative">
        {/* Close button - positioned absolute top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white hover:bg-slate-100 rounded-lg transition-colors focus:outline-none shadow-md"
          aria-label="Chiudi"
        >
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="animate-spin h-8 w-8 text-indigo-600"
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
                <p className="text-sm text-slate-600">Caricamento dati...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-red-900 font-semibold text-sm">Errore</h3>
                  <p className="text-red-700 mt-1 text-xs">{error}</p>
                </div>
              </div>
            </div>
          )}

          {assetData && !isLoading && (
            <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
              {/* Info Cards - Top Row on mobile, Left Column on desktop */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-col gap-4 w-full lg:w-64 lg:flex-shrink-0">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Simbolo
                  </div>
                  <div className="text-xl font-bold text-slate-900">{assetData.symbol}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Nome Completo
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {assetInfo?.name || '-'}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Periodo Disponibile
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatDate(assetData.start_date)}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatDate(assetData.end_date)}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 lg:flex-1">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Dati Disponibili
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {formatDataPoints(assetData.data_points)}
                  </div>
                </div>
              </div>

              {/* Price Chart - Right Side on desktop, Below on mobile */}
              <div className="w-full lg:flex-1 bg-white border border-slate-200 rounded-2xl p-6 [&_*]:focus:outline-none [&_*]:outline-none flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide text-sm mb-2">
                    Andamento Prezzo
                  </h3>
                  <div className="text-xs text-slate-500">
                    Grafico ultimi 5 anni (campionamento settimanale - usa la barra sottostante per navigare)
                  </div>
                </div>
                <div className="h-[450px] lg:flex-1 lg:min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} style={{ outline: 'none' }}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                      labelFormatter={(label) => `Data: ${label}`}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fill="url(#priceGradient)"
                      name="Prezzo di Chiusura"
                    />
                    <Brush
                      dataKey="formattedDate"
                      height={40}
                      stroke="#4f46e5"
                      fill="#f8fafc"
                      startIndex={startIndex}
                      endIndex={chartData.length - 1}
                      travellerWidth={10}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
