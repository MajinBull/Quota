export type AssetCategory = 'etf' | 'crypto' | 'commodities' | 'bonds' | 'real_estate';
export interface Candle {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export interface AssetData {
    symbol: string;
    category: AssetCategory;
    start_date: string;
    end_date: string;
    data_points: number;
    candles: Candle[];
}
