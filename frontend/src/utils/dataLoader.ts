import type { AssetData, AssetCategory, AssetInfo } from '../types';

// Asset metadata for UI display
export const ASSET_METADATA: Record<string, AssetInfo> = {
  // ETF
  'SPY': { symbol: 'SPY', category: 'etf', name: 'S&P 500 ETF', description: 'Tracks the S&P 500 index' },
  'QQQ': { symbol: 'QQQ', category: 'etf', name: 'Nasdaq 100 ETF', description: 'Tracks the Nasdaq 100 index' },
  'VTI': { symbol: 'VTI', category: 'etf', name: 'Total Stock Market ETF', description: 'Total US stock market' },
  'VEA': { symbol: 'VEA', category: 'etf', name: 'Developed Markets ETF', description: 'Developed markets ex-US' },
  'VWO': { symbol: 'VWO', category: 'etf', name: 'Emerging Markets ETF', description: 'Emerging markets stocks' },

  // Crypto
  'BTC-USD': { symbol: 'BTC-USD', category: 'crypto', name: 'Bitcoin', description: 'Leading cryptocurrency' },
  'ETH-USD': { symbol: 'ETH-USD', category: 'crypto', name: 'Ethereum', description: 'Smart contract platform' },
  'BNB-USD': { symbol: 'BNB-USD', category: 'crypto', name: 'Binance Coin', description: 'Binance exchange token' },
  'SOL-USD': { symbol: 'SOL-USD', category: 'crypto', name: 'Solana', description: 'High-performance blockchain' },
  'ADA-USD': { symbol: 'ADA-USD', category: 'crypto', name: 'Cardano', description: 'Proof-of-stake blockchain' },

  // Metals
  'GLD': { symbol: 'GLD', category: 'metals', name: 'Gold ETF', description: 'Physical gold holdings' },
  'SLV': { symbol: 'SLV', category: 'metals', name: 'Silver ETF', description: 'Physical silver holdings' },
  'PPLT': { symbol: 'PPLT', category: 'metals', name: 'Platinum ETF', description: 'Physical platinum holdings' },
  'PALL': { symbol: 'PALL', category: 'metals', name: 'Palladium ETF', description: 'Physical palladium holdings' },
  'COPX': { symbol: 'COPX', category: 'metals', name: 'Copper Miners ETF', description: 'Copper mining companies' },

  // Bonds
  'AGG': { symbol: 'AGG', category: 'bonds', name: 'Aggregate Bond ETF', description: 'US investment-grade bonds' },
  'TLT': { symbol: 'TLT', category: 'bonds', name: '20+ Year Treasury ETF', description: 'Long-term US treasuries' },
  'LQD': { symbol: 'LQD', category: 'bonds', name: 'Corporate Bond ETF', description: 'Investment-grade corporate bonds' },
  'HYG': { symbol: 'HYG', category: 'bonds', name: 'High Yield Bond ETF', description: 'High-yield corporate bonds' },
  'TIP': { symbol: 'TIP', category: 'bonds', name: 'TIPS ETF', description: 'Treasury inflation-protected securities' },

  // Real Estate
  'VNQ': { symbol: 'VNQ', category: 'real_estate', name: 'US Real Estate ETF', description: 'US REITs' },
  'VNQI': { symbol: 'VNQI', category: 'real_estate', name: 'International Real Estate ETF', description: 'International REITs' },
  'IYR': { symbol: 'IYR', category: 'real_estate', name: 'US Real Estate ETF', description: 'US real estate sector' },
  'RWO': { symbol: 'RWO', category: 'real_estate', name: 'Global Real Estate ETF', description: 'Global real estate' },
  'REET': { symbol: 'REET', category: 'real_estate', name: 'Global Real Estate ETF', description: 'Global REIT index' },
};

// Cache for loaded data
const dataCache: Map<string, AssetData> = new Map();
const categoryCache: Map<AssetCategory, Record<string, AssetData>> = new Map();

/**
 * Load historical data for a specific asset
 */
export async function loadAssetData(symbol: string): Promise<AssetData | null> {
  // Check cache first
  if (dataCache.has(symbol)) {
    return dataCache.get(symbol)!;
  }

  const assetInfo = ASSET_METADATA[symbol];
  if (!assetInfo) {
    console.error(`Asset ${symbol} not found in metadata`);
    return null;
  }

  try {
    // Load from category file
    const categoryData = await loadCategoryData(assetInfo.category);
    const assetData = categoryData[symbol];

    if (assetData) {
      dataCache.set(symbol, assetData);
      return assetData;
    }

    console.error(`Asset ${symbol} not found in ${assetInfo.category} data`);
    return null;
  } catch (error) {
    console.error(`Error loading data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Load all assets for a specific category
 */
export async function loadCategoryData(category: AssetCategory): Promise<Record<string, AssetData>> {
  // Check cache first
  if (categoryCache.has(category)) {
    return categoryCache.get(category)!;
  }

  try {
    const response = await fetch(`/data/${category}_historical.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    categoryCache.set(category, data);

    // Also cache individual assets
    Object.values(data).forEach((assetData: any) => {
      dataCache.set(assetData.symbol, assetData);
    });

    return data;
  } catch (error) {
    console.error(`Error loading ${category} data:`, error);
    return {};
  }
}

/**
 * Load all historical data
 */
export async function loadAllData(): Promise<Record<AssetCategory, Record<string, AssetData>>> {
  try {
    const response = await fetch('/data/all_assets.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache everything
    Object.entries(data).forEach(([category, categoryData]: [string, any]) => {
      categoryCache.set(category as AssetCategory, categoryData);

      Object.values(categoryData).forEach((assetData: any) => {
        dataCache.set(assetData.symbol, assetData);
      });
    });

    return data;
  } catch (error) {
    console.error('Error loading all data:', error);
    return {} as any;
  }
}

/**
 * Get all available asset symbols by category
 */
export function getAssetsByCategory(category: AssetCategory): AssetInfo[] {
  return Object.values(ASSET_METADATA).filter(asset => asset.category === category);
}

/**
 * Get all available categories
 */
export function getAllCategories(): AssetCategory[] {
  return ['etf', 'crypto', 'metals', 'bonds', 'real_estate'];
}

/**
 * Get asset metadata by symbol
 */
export function getAssetInfo(symbol: string): AssetInfo | undefined {
  return ASSET_METADATA[symbol];
}
