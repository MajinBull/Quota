import * as fs from 'fs';
import * as path from 'path';
import type { AssetData, AssetCategory } from '@quota/shared/types';

const DATA_DIR = path.join(__dirname, 'historical');

/**
 * Load all assets from a specific category JSON file
 */
export function loadCategoryData(category: AssetCategory): Record<string, AssetData> {
  const filePath = path.join(DATA_DIR, `${category}_historical.json`);

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error loading ${category} data:`, error);
    throw new Error(`Failed to load ${category} historical data`);
  }
}

/**
 * Load all historical data from all categories
 * Returns a Map for fast symbol lookup
 */
export function loadAllData(): Map<string, AssetData> {
  const categories: AssetCategory[] = ['etf', 'crypto', 'commodities', 'bonds', 'real_estate'];
  const allData = new Map<string, AssetData>();

  console.log('Loading historical data from all categories...');

  for (const category of categories) {
    try {
      const categoryData = loadCategoryData(category);
      let count = 0;

      Object.values(categoryData).forEach((asset) => {
        allData.set(asset.symbol, asset);
        count++;
      });

      console.log(`Loaded ${count} assets from ${category}`);
    } catch (error) {
      console.error(`Failed to load ${category}:`, error);
      // Continue loading other categories even if one fails
    }
  }

  console.log(`Total assets loaded: ${allData.size}`);
  return allData;
}
