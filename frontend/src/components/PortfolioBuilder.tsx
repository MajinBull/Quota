import { useState, useRef, useEffect } from 'react';
import { usePortfolioStore } from '../stores/portfolioStore';
import { ASSET_METADATA, getAllCategories } from '../utils/dataLoader';
import type { AssetCategory, PortfolioAllocation } from '../types';
import { AssetDetailsModal } from './AssetDetailsModal';

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  etf: 'ETF',
  crypto: 'Crypto',
  metals: 'Metalli',
  bonds: 'Obbligazioni',
  real_estate: 'Immobiliare'
};

interface AllocationSliderProps {
  value: number;
  onChange: (value: number) => void;
}

function AllocationSlider({ value, onChange }: AllocationSliderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingValueRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(Math.round(value).toString());
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const updateValue = (percentage: number) => {
    const rounded = Math.round(percentage);
    pendingValueRef.current = rounded;

    // Cancel previous animation frame if exists
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule update with requestAnimationFrame (throttle to 60fps)
    rafRef.current = requestAnimationFrame(() => {
      if (pendingValueRef.current !== null) {
        onChange(pendingValueRef.current);
        pendingValueRef.current = null;
      }
      rafRef.current = null;
    });
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
    updateValue(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing) return;
    setIsDragging(true);
    handleSliderClick(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
      updateValue(percentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Clean up any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDragging]);

  const handleNumberClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue)) {
      onChange(Math.round(Math.min(100, Math.max(0, numValue))));
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setEditValue(Math.round(value).toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full">
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        className="relative h-10 bg-slate-200 rounded-lg overflow-hidden cursor-pointer select-none"
      >
        {/* Barra di riempimento */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-100"
          style={{ width: `${Math.round(value)}%` }}
        />

        {/* Numero percentuale */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              value={editValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="w-16 text-center bg-white border-2 border-indigo-500 rounded px-2 py-1 font-bold text-sm focus:outline-none"
              min="0"
              max="100"
              step="1"
            />
          ) : (
            <span
              onClick={handleNumberClick}
              className="font-bold text-sm text-slate-900 cursor-text px-2 py-1 rounded hover:bg-white/20 transition-colors"
            >
              {Math.round(value)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  onOpenTemplates: () => void;
}

export function PortfolioBuilder({ onOpenTemplates }: Props) {
  const {
    portfolio,
    addAsset,
    removeAsset,
    updateMultipleAllocations,
    setInitialCapital,
    setInvestmentStrategy,
    setPACAmount,
    setPACFrequency,
    setRebalanceFrequency,
    setStartYear,
    getTotalAllocation
  } = usePortfolioStore();

  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('etf');
  const [lockedAssets, setLockedAssets] = useState<Set<string>>(new Set());
  const [detailsModalAsset, setDetailsModalAsset] = useState<string | null>(null);

  const totalAllocation = getTotalAllocation();
  const isValid = totalAllocation === 100;

  const availableAssets = Object.values(ASSET_METADATA).filter(
    (asset) => asset.category === selectedCategory
  );

  const handleAddAsset = (symbol: string) => {
    addAsset(symbol);
  };

  const handleRemoveAsset = (symbol: string) => {
    removeAsset(symbol);
    // Remove from locked set if it was locked
    setLockedAssets(prev => {
      const newSet = new Set(prev);
      newSet.delete(symbol);
      return newSet;
    });
  };

  const toggleLock = (symbol: string) => {
    setLockedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
      } else {
        newSet.add(symbol);
      }
      return newSet;
    });
  };

  const handleAllocationChange = (symbol: string, value: number) => {
    // Input validation
    if (!isFinite(value) || isNaN(value)) {
      console.warn('Invalid allocation value:', value);
      return;
    }

    // Round to integer and clamp to valid range
    const newPercentage = Math.round(Math.min(100, Math.max(0, value)));

    // Get current allocations
    const currentAllocations = [...portfolio.allocations];

    // Find the asset being modified
    const modifiedAssetIndex = currentAllocations.findIndex(a => a.symbol === symbol);
    if (modifiedAssetIndex === -1) {
      console.warn('Asset not found in allocations:', symbol);
      return;
    }

    // Separate assets into locked and unlocked (excluding the one being modified)
    const otherAssets = currentAllocations.filter(a => a.symbol !== symbol);
    const lockedOthers = otherAssets.filter(a => lockedAssets.has(a.symbol));
    const unlockedOthers = otherAssets.filter(a => !lockedAssets.has(a.symbol));

    // Calculate total of locked assets (they won't change)
    const lockedTotal = lockedOthers.reduce((sum, a) => sum + a.percentage, 0);
    const unlockedTotal = unlockedOthers.reduce((sum, a) => sum + a.percentage, 0);

    // Calculate remaining percentage for unlocked assets
    const remaining = 100 - newPercentage - lockedTotal;

    if (remaining < 0) {
      // Not enough space - cap the modified asset and zero out all unlocked assets
      const maxAllowed = 100 - lockedTotal;
      const cappedPercentage = Math.max(0, maxAllowed);

      const newAllocations: PortfolioAllocation[] = currentAllocations.map(alloc => {
        if (alloc.symbol === symbol) {
          // Asset being modified: use capped value
          return { symbol: alloc.symbol, percentage: cappedPercentage };
        } else if (lockedAssets.has(alloc.symbol)) {
          // Locked assets: keep current value
          return { symbol: alloc.symbol, percentage: alloc.percentage };
        } else {
          // Unlocked assets: must be zeroed (no space left)
          return { symbol: alloc.symbol, percentage: 0 };
        }
      });

      updateMultipleAllocations(newAllocations);
      return;
    }

    if (unlockedOthers.length === 0) {
      // All other assets are locked, just update the modified one
      const newAllocations: PortfolioAllocation[] = currentAllocations.map(alloc => ({
        symbol: alloc.symbol,
        percentage: alloc.symbol === symbol ? newPercentage : alloc.percentage
      }));
      updateMultipleAllocations(newAllocations);
      return;
    }

    // Rebalance ONLY unlocked assets proportionally using Largest Remainder Method

    // Step 1: Calculate exact proportional values for unlocked assets
    const exactValues: Array<{ symbol: string; exact: number; floor: number; fraction: number }> = [];

    for (const alloc of unlockedOthers) {
      if (unlockedTotal > 0) {
        const proportion = alloc.percentage / unlockedTotal;
        const exact = proportion * remaining;
        const floor = Math.floor(exact);
        const fraction = exact - floor;
        exactValues.push({ symbol: alloc.symbol, exact, floor, fraction });
      } else {
        // Distribute equally among unlocked assets
        const exact = remaining / unlockedOthers.length;
        const floor = Math.floor(exact);
        const fraction = exact - floor;
        exactValues.push({ symbol: alloc.symbol, exact, floor, fraction });
      }
    }

    // Step 2: Calculate how many percentage points we need to distribute
    const sumFloor = exactValues.reduce((sum, item) => sum + item.floor, 0);
    const pointsToDistribute = remaining - sumFloor;

    // Step 3: Sort by fraction (descending) and distribute remaining points
    exactValues.sort((a, b) => b.fraction - a.fraction);

    const finalPercentages = new Map<string, number>();
    for (let i = 0; i < exactValues.length; i++) {
      const item = exactValues[i];
      const bonus = i < pointsToDistribute ? 1 : 0;
      finalPercentages.set(item.symbol, item.floor + bonus);
    }

    // Step 4: Build new allocations array (atomic update)
    // - Modified asset: new percentage
    // - Locked assets: keep current percentage
    // - Unlocked assets: use calculated percentage
    const newAllocations: PortfolioAllocation[] = currentAllocations.map(alloc => {
      if (alloc.symbol === symbol) {
        return { symbol: alloc.symbol, percentage: newPercentage };
      } else if (lockedAssets.has(alloc.symbol)) {
        return { symbol: alloc.symbol, percentage: alloc.percentage };
      } else {
        return { symbol: alloc.symbol, percentage: finalPercentages.get(alloc.symbol) || 0 };
      }
    });

    // Safety check: verify total is exactly 100%
    const total = newAllocations.reduce((sum, a) => sum + a.percentage, 0);
    if (Math.abs(total - 100) > 0.01) {
      console.warn('Allocation total mismatch:', {
        total,
        expected: 100,
        allocations: newAllocations,
        symbol,
        newPercentage
      });

      // Emergency fix: adjust the modified asset to force 100%
      const diff = 100 - total;
      const adjustedAllocations = newAllocations.map(alloc => {
        if (alloc.symbol === symbol) {
          return { symbol: alloc.symbol, percentage: Math.max(0, Math.min(100, alloc.percentage + diff)) };
        }
        return alloc;
      });

      updateMultipleAllocations(adjustedAllocations);
      return;
    }

    // Single atomic update
    updateMultipleAllocations(newAllocations);
  };

  return (
    <div className="space-y-8">
      {/* STRATEGIA E PARAMETRI */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6 text-slate-900 uppercase tracking-wide text-sm">
          Strategia e Parametri
        </h2>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side: Strategy explanation */}
          <div className="lg:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4">
            {portfolio.investmentStrategy === 'lump_sum' ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <h3 className="font-semibold text-slate-900 text-sm">Lump Sum</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Investi tutto il capitale in un'unica soluzione all'inizio del periodo.
                  Strategia adatta se hai disponibilità immediata e vuoi massimizzare
                  l'esposizione al mercato da subito.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <h3 className="font-semibold text-slate-900 text-sm">PAC (Piano di Accumulo)</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Investi importi fissi a intervalli regolari nel tempo. Riduce l'impatto
                  della volatilità attraverso il dollar-cost averaging e permette di
                  costruire il portafoglio gradualmente.
                </p>
              </>
            )}
          </div>

          {/* Right side: Strategy selector and parameters */}
          <div className="flex-1 flex gap-6">
            {/* Strategy Radio Buttons */}
            <div className="flex flex-col gap-3">
              <label className={`cursor-pointer px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                portfolio.investmentStrategy === 'lump_sum'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}>
                <input
                  type="radio"
                  value="lump_sum"
                  checked={portfolio.investmentStrategy === 'lump_sum'}
                  onChange={(e) => setInvestmentStrategy(e.target.value as any)}
                  className="sr-only"
                />
                Lump Sum
              </label>
              <label className={`cursor-pointer px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                portfolio.investmentStrategy === 'pac'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}>
                <input
                  type="radio"
                  value="pac"
                  checked={portfolio.investmentStrategy === 'pac'}
                  onChange={(e) => setInvestmentStrategy(e.target.value as any)}
                  className="sr-only"
                />
                PAC
              </label>
            </div>

            {/* Parameters Column */}
            <div className="flex-1 space-y-3">
              {/* Capitale */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="text-sm font-medium text-slate-600 sm:w-32 sm:flex-shrink-0">
                  {portfolio.investmentStrategy === 'pac' ? 'Primo versamento:' : 'Capitale:'}
                </label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">€</span>
                  <input
                    type="number"
                    value={portfolio.initialCapital}
                    onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    min="1"
                    step="100"
                  />
                </div>
              </div>

              {/* PAC Parameters (conditional) */}
              {portfolio.investmentStrategy === 'pac' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-600">Importo PAC:</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">€</span>
                        <input
                          type="number"
                          value={portfolio.pacAmount || 500}
                          onChange={(e) => setPACAmount(parseFloat(e.target.value) || 0)}
                          className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          min="1"
                          step="100"
                        />
                      </div>
                      <select
                        value={portfolio.pacFrequency || 'monthly'}
                        onChange={(e) => setPACFrequency(e.target.value as any)}
                        className="w-32 sm:w-36 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white"
                      >
                        <option value="monthly">Mensile</option>
                        <option value="quarterly">Trimestrale</option>
                        <option value="yearly">Annuale</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Rebilanciamento */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="text-sm font-medium text-slate-600 sm:w-32 sm:flex-shrink-0">Rebilanciamento:</label>
                <select
                  value={portfolio.rebalanceFrequency}
                  onChange={(e) => setRebalanceFrequency(e.target.value as any)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white"
                >
                  <option value="none">Nessuno</option>
                  <option value="monthly">Mensile</option>
                  <option value="quarterly">Trimestrale</option>
                  <option value="yearly">Annuale</option>
                </select>
              </div>

              {/* Anno Inizio */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="text-sm font-medium text-slate-600 sm:w-32 sm:flex-shrink-0">Anno Inizio:</label>
                <select
                  value={portfolio.startYear || 'auto'}
                  onChange={(e) => setStartYear(e.target.value === 'auto' ? undefined : parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white"
                >
                  <option value="auto">Automatico</option>
                  <option value="2005">2005</option>
                  <option value="2010">2010</option>
                  <option value="2015">2015</option>
                  <option value="2020">2020</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AGGIUNGI ASSET */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6 text-slate-900 uppercase tracking-wide text-sm">
          Aggiungi Asset
        </h2>

        {/* Category Selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {getAllCategories().map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {availableAssets.map((asset) => {
            const isAdded = portfolio.allocations.some((a) => a.symbol === asset.symbol);

            return (
              <div
                key={asset.symbol}
                className={`rounded-xl p-4 transition-all relative cursor-pointer group ${
                  isAdded
                    ? 'bg-slate-200 border-2 border-slate-300 hover:border-red-300 hover:bg-red-50'
                    : 'bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
                onClick={() => isAdded ? handleRemoveAsset(asset.symbol) : handleAddAsset(asset.symbol)}
              >
                {/* Bollino con spunta quando selezionato */}
                {isAdded && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Info button - appears on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailsModalAsset(asset.symbol);
                  }}
                  className="absolute bottom-2 right-2 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                  title="Visualizza dettagli asset"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                <div>
                  <div className={`font-semibold text-sm mb-1 ${isAdded ? 'text-slate-600' : 'text-slate-900'}`}>
                    {asset.symbol}
                  </div>
                  <div className={`text-xs line-clamp-2 ${isAdded ? 'text-slate-500' : 'text-slate-600'}`}>
                    {asset.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ALLOCAZIONE PORTFOLIO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide text-sm">
            Allocazione Portfolio
          </h2>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
              isValid
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              Total: {totalAllocation.toFixed(1)}%
            </span>
            <button
              onClick={onOpenTemplates}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Usa Template
            </button>
          </div>
        </div>

        {portfolio.allocations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {portfolio.allocations.map((allocation) => {
              const assetInfo = ASSET_METADATA[allocation.symbol];
              const isLocked = lockedAssets.has(allocation.symbol);

              return (
                <div
                  key={allocation.symbol}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors relative"
                >
                  {/* Lock/Unlock button in top-right corner */}
                  <button
                    onClick={() => toggleLock(allocation.symbol)}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
                      isLocked
                        ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                    }`}
                    title={isLocked ? 'Percentuale bloccata - Click per sbloccare' : 'Click per bloccare percentuale'}
                  >
                    {isLocked ? (
                      // Lucchetto chiuso
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      // Lucchetto aperto
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>

                  <div className="flex items-start justify-between mb-3 pr-8">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm truncate">
                        {allocation.symbol}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {assetInfo?.name || allocation.symbol}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAsset(allocation.symbol)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Rimuovi"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <AllocationSlider
                    value={allocation.percentage}
                    onChange={(newValue) => handleAllocationChange(allocation.symbol, newValue)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
            <p className="text-slate-600 mb-2">Nessun asset selezionato</p>
            <p className="text-xs text-slate-500">Aggiungi asset dalla sezione qui sopra</p>
          </div>
        )}
      </div>

      {/* Asset Details Modal */}
      {detailsModalAsset && (
        <AssetDetailsModal
          symbol={detailsModalAsset}
          onClose={() => setDetailsModalAsset(null)}
        />
      )}
    </div>
  );
}
