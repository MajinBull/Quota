import yfinance as yf
import pandas as pd
from datetime import datetime
import json
import os

# Asset list organized by category
ASSETS = {
    "etf": ["SPY", "QQQ", "VTI", "VEA", "VWO"],
    "crypto": ["BTC-USD", "ETH-USD", "BNB-USD", "SOL-USD", "ADA-USD"],
    "metals": ["GLD", "SLV", "PPLT", "PALL", "COPX"],
    "bonds": ["AGG", "TLT", "LQD", "HYG", "TIP"],
    "real_estate": ["VNQ", "VNQI", "IYR", "RWO", "REET"]
}

# Period: last 20 years of daily data
START_DATE = "2005-01-01"
END_DATE = datetime.now().strftime("%Y-%m-%d")

def download_asset_data(symbol, category):
    """Download daily OHLCV data for a single asset"""
    print(f"Downloading {symbol} ({category})...")

    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(start=START_DATE, end=END_DATE, interval="1d")

        if df.empty:
            print(f"  [WARNING] No data for {symbol}")
            return None

        # Format data for JSON
        data = {
            "symbol": symbol,
            "category": category,
            "start_date": df.index[0].strftime("%Y-%m-%d"),
            "end_date": df.index[-1].strftime("%Y-%m-%d"),
            "data_points": len(df),
            "candles": []
        }

        for date, row in df.iterrows():
            candle = {
                "date": date.strftime("%Y-%m-%d"),
                "open": round(row['Open'], 2),
                "high": round(row['High'], 2),
                "low": round(row['Low'], 2),
                "close": round(row['Close'], 2),
                "volume": int(row['Volume'])
            }
            data["candles"].append(candle)

        print(f"  [OK] Downloaded {len(data['candles'])} candles ({data['start_date']} to {data['end_date']})")
        return data

    except Exception as e:
        print(f"  [ERROR] Error downloading {symbol}: {e}")
        return None

def main():
    # Create data directory
    os.makedirs("data", exist_ok=True)

    all_data = {}
    summary = {
        "download_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "period": f"{START_DATE} to {END_DATE}",
        "categories": {},
        "total_assets": 0,
        "successful_downloads": 0
    }

    # Download each category
    for category, symbols in ASSETS.items():
        print(f"\n{'='*50}")
        print(f"Category: {category.upper()}")
        print(f"{'='*50}")

        category_data = {}
        success_count = 0

        for symbol in symbols:
            data = download_asset_data(symbol, category)
            if data:
                category_data[symbol] = data
                success_count += 1

        all_data[category] = category_data
        summary["categories"][category] = {
            "total": len(symbols),
            "successful": success_count,
            "symbols": list(category_data.keys())
        }
        summary["total_assets"] += len(symbols)
        summary["successful_downloads"] += success_count

    # Save individual category files
    for category, data in all_data.items():
        filename = f"data/{category}_historical.json"
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"\n[OK] Saved {filename}")

    # Save combined file
    with open("data/all_assets.json", 'w') as f:
        json.dump(all_data, f, indent=2)
    print(f"[OK] Saved data/all_assets.json")

    # Save summary
    with open("data/download_summary.json", 'w') as f:
        json.dump(summary, f, indent=2)

    # Print summary
    print(f"\n{'='*50}")
    print("DOWNLOAD SUMMARY")
    print(f"{'='*50}")
    print(f"Total assets: {summary['total_assets']}")
    print(f"Successful downloads: {summary['successful_downloads']}")
    print(f"Failed: {summary['total_assets'] - summary['successful_downloads']}")
    print(f"\nBy category:")
    for cat, info in summary["categories"].items():
        print(f"  {cat}: {info['successful']}/{info['total']}")
    print(f"\n[OK] All data saved in 'data/' folder")

if __name__ == "__main__":
    print("="*50)
    print("Historical Asset Data Downloader")
    print("="*50)
    print(f"Period: {START_DATE} to {END_DATE}")
    print(f"Total assets: {sum(len(v) for v in ASSETS.values())}")
    print("="*50)

    main()
