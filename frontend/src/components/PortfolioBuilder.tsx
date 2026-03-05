import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePortfolioStore } from '../stores/portfolioStore';
import { ASSET_METADATA, getAllCategories } from '../utils/dataLoader';
import type { AssetCategory, PortfolioAllocation } from '../types';
import { AssetDetailsModal } from './AssetDetailsModal';

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

  const calculatePercentage = (clientX: number) => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.min(100, Math.max(0, (x / rect.width) * 100));
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing) return;
    const percentage = calculatePercentage(e.clientX);
    updateValue(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing) return;
    setIsDragging(true);
    handleSliderClick(e);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isEditing) return;
    setIsDragging(true);
    const touch = e.touches[0];
    const percentage = calculatePercentage(touch.clientX);
    updateValue(percentage);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;
      const percentage = calculatePercentage(e.clientX);
      updateValue(percentage);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !sliderRef.current) return;
      e.preventDefault(); // Prevent scrolling while dragging
      const touch = e.touches[0];
      const percentage = calculatePercentage(touch.clientX);
      updateValue(percentage);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
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
        onTouchStart={handleTouchStart}
        className="relative h-10 bg-slate-200 dark:bg-slate-600 rounded-lg overflow-hidden cursor-pointer select-none touch-none"
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
              className="w-16 text-center bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-indigo-500 rounded px-2 py-1 font-bold text-sm focus:outline-none"
              min="0"
              max="100"
              step="1"
            />
          ) : (
            <span
              onClick={handleNumberClick}
              className="font-bold text-sm text-slate-900 dark:text-white cursor-text px-2 py-1 rounded hover:bg-white/20 transition-colors"
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
  const { t } = useTranslation('app');
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

  // Category label helper
  const getCategoryLabel = (category: AssetCategory): string => {
    const categoryMap: Record<AssetCategory, string> = {
      etf: t('portfolio.categories.etf'),
      crypto: t('portfolio.categories.crypto'),
      commodities: t('portfolio.categories.commodities'),
      bonds: t('portfolio.categories.bonds'),
      real_estate: t('portfolio.categories.realEstate'),
      stocks: t('portfolio.categories.stocks')
    };
    return categoryMap[category] || category;
  };

  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('etf');
  const [lockedAssets, setLockedAssets] = useState<Set<string>>(new Set());
  const [detailsModalAsset, setDetailsModalAsset] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'favorites' | 'popularity' | 'name-az' | 'name-za'>('name-az');
  const [favorites, setFavorites] = useState<Record<AssetCategory, string[]>>(() => {
    // Load favorites from localStorage
    const stored = localStorage.getItem('assetFavorites');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { etf: [], crypto: [], commodities: [], bonds: [], real_estate: [], stocks: [] };
      }
    }
    return { etf: [], crypto: [], commodities: [], bonds: [], real_estate: [], stocks: [] };
  });

  const totalAllocation = getTotalAllocation();
  const isValid = totalAllocation === 100;

  // Toggle favorite
  const toggleFavorite = (symbol: string, category: AssetCategory) => {
    setFavorites(prev => {
      const categoryFavorites = prev[category] || [];
      const isFavorite = categoryFavorites.includes(symbol);

      const updated = {
        ...prev,
        [category]: isFavorite
          ? categoryFavorites.filter(s => s !== symbol)
          : [...categoryFavorites, symbol]
      };

      // Save to localStorage
      localStorage.setItem('assetFavorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Filter and sort assets
  const availableAssets = Object.values(ASSET_METADATA)
    .filter((asset) => asset.category === selectedCategory)
    .filter((asset) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          asset.symbol.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query) ||
          asset.description?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((asset) => {
      // Favorites filter
      if (sortBy === 'favorites') {
        const categoryFavorites = favorites[selectedCategory] || [];
        return categoryFavorites.includes(asset.symbol);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'favorites':
        case 'name-az':
          return a.name.localeCompare(b.name);
        case 'name-za':
          return b.name.localeCompare(a.name);
        case 'popularity':
          // Sort by popularity_rank (lower number = more popular)
          // Assets without rank go to the end
          const rankA = a.popularity_rank ?? 9999;
          const rankB = b.popularity_rank ?? 9999;
          return rankA - rankB;
        default:
          return 0;
      }
    });

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
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-8">
        <h2 className="text-xl font-bold mb-4 md:mb-6 text-slate-900 dark:text-white uppercase tracking-wide text-sm">
          {t('strategy.title')}
        </h2>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left side: Strategy explanation */}
          <div className="lg:w-80 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
            {portfolio.investmentStrategy === 'lump_sum' ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t('strategy.lumpSum.name')}</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('strategy.lumpSum.description')}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t('strategy.pac.name')}</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('strategy.pac.description')}
                </p>
              </>
            )}
          </div>

          {/* Right side: Strategy selector and parameters */}
          <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Strategy Radio Buttons */}
            <div className="flex flex-row md:flex-col gap-2 md:gap-3">
              <label className={`cursor-pointer px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                portfolio.investmentStrategy === 'lump_sum'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}>
                <input
                  type="radio"
                  value="lump_sum"
                  checked={portfolio.investmentStrategy === 'lump_sum'}
                  onChange={(e) => setInvestmentStrategy(e.target.value as any)}
                  className="sr-only"
                />
                {t('strategy.lumpSum.name')}
              </label>
              <label className={`cursor-pointer px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                portfolio.investmentStrategy === 'pac'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}>
                <input
                  type="radio"
                  value="pac"
                  checked={portfolio.investmentStrategy === 'pac'}
                  onChange={(e) => setInvestmentStrategy(e.target.value as any)}
                  className="sr-only"
                />
                {t('strategy.pac.name')}
              </label>
            </div>

            {/* Parameters Column */}
            <div className="flex-1 space-y-3">
              {/* Capitale */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 sm:w-32 sm:flex-shrink-0">
                  {portfolio.investmentStrategy === 'pac' ? t('strategy.fields.firstPayment') : t('strategy.fields.capital')}
                </label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm">€</span>
                  <input
                    type="number"
                    value={portfolio.initialCapital}
                    onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    min="1"
                    step="100"
                  />
                </div>
              </div>

              {/* PAC Parameters (conditional) */}
              {portfolio.investmentStrategy === 'pac' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 sm:w-32 sm:flex-shrink-0">{t('strategy.fields.pacAmount')}</label>
                    <div className="flex flex-1 gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm">€</span>
                        <input
                          type="number"
                          value={portfolio.pacAmount || 500}
                          onChange={(e) => setPACAmount(parseFloat(e.target.value) || 0)}
                          className="w-full pl-7 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          min="1"
                          step="100"
                        />
                      </div>
                      <select
                        value={portfolio.pacFrequency || 'monthly'}
                        onChange={(e) => setPACFrequency(e.target.value as any)}
                        className="w-32 sm:w-36 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="monthly">{t('strategy.frequency.monthly')}</option>
                        <option value="quarterly">{t('strategy.frequency.quarterly')}</option>
                        <option value="yearly">{t('strategy.frequency.yearly')}</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Rebilanciamento */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 sm:w-32 sm:flex-shrink-0">{t('strategy.fields.rebalance')}</label>
                <select
                  value={portfolio.rebalanceFrequency}
                  onChange={(e) => setRebalanceFrequency(e.target.value as any)}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="none">{t('strategy.frequency.none')}</option>
                  <option value="monthly">{t('strategy.frequency.monthly')}</option>
                  <option value="quarterly">{t('strategy.frequency.quarterly')}</option>
                  <option value="yearly">{t('strategy.frequency.yearly')}</option>
                </select>
              </div>

              {/* Anno Inizio */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 sm:w-32 sm:flex-shrink-0">{t('strategy.fields.startYear')}</label>
                <select
                  value={portfolio.startYear || 'auto'}
                  onChange={(e) => setStartYear(e.target.value === 'auto' ? undefined : parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="auto">{t('strategy.startYear.auto')}</option>
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
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-8">
        {/* Header with Title and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 md:mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm">
            {t('portfolio.addAssets.title')}
          </h2>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={t('portfolio.addAssets.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Selector + Sort on same row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
          {/* Category Selector - left */}
          <div className="flex gap-2 flex-wrap">
            {getAllCategories().map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>

          {/* Sort Dropdown - right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('portfolio.addAssets.sortBy')}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="name-az">{t('portfolio.addAssets.sortOptions.nameAZ')}</option>
              <option value="name-za">{t('portfolio.addAssets.sortOptions.nameZA')}</option>
              <option value="favorites">{t('portfolio.addAssets.sortOptions.favorites')}</option>
              <option value="popularity">{t('portfolio.addAssets.sortOptions.popularity')}</option>
            </select>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {availableAssets.map((asset) => {
            const isAdded = portfolio.allocations.some((a) => a.symbol === asset.symbol);
            const categoryFavorites = favorites[selectedCategory] || [];
            const isFavorite = categoryFavorites.includes(asset.symbol);

            return (
              <div
                key={asset.symbol}
                className={`rounded-xl p-4 transition-all relative cursor-pointer group ${
                  isAdded
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-500 dark:border-green-700 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
                onClick={() => isAdded ? handleRemoveAsset(asset.symbol) : handleAddAsset(asset.symbol)}
              >
                {/* Info button - bottom right - always visible on mobile, hover on desktop */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailsModalAsset(asset.symbol);
                  }}
                  className="absolute bottom-2 right-2 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg z-10"
                  title={t('portfolio.allocation.viewDetails')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                <div>
                  {/* Symbol with favorite star inline */}
                  <div className={`font-semibold text-sm mb-1 flex items-center gap-1.5 ${isAdded ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    <span>{asset.symbol}</span>
                    {/* Favorite Star - inline after symbol */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(asset.symbol, selectedCategory);
                      }}
                      className="flex items-center justify-center transition-transform hover:scale-110"
                      title={isFavorite ? t('portfolio.allocation.removeFromFavorites') : t('portfolio.allocation.addToFavorites')}
                    >
                      <svg
                        className={`w-4 h-4 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 fill-none hover:text-yellow-400'}`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                  <div className={`text-xs line-clamp-2 ${isAdded ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {asset.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ALLOCAZIONE PORTFOLIO */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm">
            {t('portfolio.allocation.title')}
          </h2>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
              isValid
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {t('portfolio.allocation.total')} {totalAllocation.toFixed(1)}%
            </span>
            <button
              onClick={onOpenTemplates}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('portfolio.allocation.useTemplate')}
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
                  className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors relative"
                >
                  {/* Lock/Unlock button in top-right corner */}
                  <button
                    onClick={() => toggleLock(allocation.symbol)}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
                      isLocked
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    title={isLocked ? t('portfolio.allocation.locked') : t('portfolio.allocation.unlocked')}
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
                      <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {allocation.symbol}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {assetInfo?.name || allocation.symbol}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAsset(allocation.symbol)}
                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                      title={t('portfolio.allocation.remove')}
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
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-700 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
            <p className="text-slate-600 dark:text-slate-300 mb-2">{t('portfolio.allocation.emptyState.title')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('portfolio.allocation.emptyState.subtitle')}</p>
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
