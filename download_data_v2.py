"""
Enhanced Historical Data Downloader v2
Supports Tiingo API (stocks/ETF/bonds/commodities/crypto) with incremental updates

Usage:
    python download_data_v2.py --full          # Full historical download (20 years)
    python download_data_v2.py --update        # Incremental update (only new data)
    python download_data_v2.py --test SPY      # Test single asset
    python download_data_v2.py --validate      # Validate existing data quality
"""

import os
import json
import argparse
from datetime import datetime, timedelta
from pathlib import Path
import time

# Third-party imports
import requests
import pandas as pd
from tqdm import tqdm
from dotenv import load_dotenv
import yfinance as yf

# Local config
from assets_config import ASSETS, ASSET_METADATA, COINGECKO_ID_MAP

# Load environment variables
load_dotenv()

# Configuration
TIINGO_API_TOKEN = os.getenv('TIINGO_API_TOKEN')
DATA_DIR = Path("data")
BACKUP_DIR = Path("data/backups")
START_DATE = "2005-01-01"  # 20+ years of data

# API rate limits
TIINGO_RATE_LIMIT = 500  # calls per hour (free tier) = 5 calls/min to be safe


class DataDownloader:
    """Main class for downloading historical asset data"""

    def __init__(self):
        self.tiingo_api_token = TIINGO_API_TOKEN
        self.data_dir = DATA_DIR
        self.backup_dir = BACKUP_DIR

        # Create directories
        self.data_dir.mkdir(exist_ok=True)
        self.backup_dir.mkdir(exist_ok=True)

        # Stats tracking
        self.stats = {
            'total_assets': 0,
            'successful': 0,
            'failed': 0,
            'skipped': 0,
            'errors': []
        }

    def download_tiingo(self, symbol, start_date, end_date):
        """
        Download data from Tiingo API

        Args:
            symbol: Stock/ETF symbol (e.g., "SPY")
            start_date: Start date string "YYYY-MM-DD"
            end_date: End date string "YYYY-MM-DD"

        Returns:
            list: List of candle dicts or empty list on error
        """
        url = f"https://api.tiingo.com/tiingo/daily/{symbol}/prices"
        params = {
            'token': self.tiingo_api_token,
            'startDate': start_date,
            'endDate': end_date
        }
        headers = {
            'Content-Type': 'application/json'
        }

        try:
            response = requests.get(url, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()

            # Check if there are results
            if not data or len(data) == 0:
                print(f"  WARNING:  No results returned")
                return []

            # Convert Tiingo format to our format
            # Use adjusted prices (adjOpen, adjHigh, adjLow, adjClose, adjVolume)
            candles = []
            for bar in data:
                candle = {
                    'date': bar['date'][:10],  # Extract YYYY-MM-DD from ISO string
                    'open': round(bar['adjOpen'], 2),
                    'high': round(bar['adjHigh'], 2),
                    'low': round(bar['adjLow'], 2),
                    'close': round(bar['adjClose'], 2),
                    'volume': int(bar['adjVolume'])
                }
                candles.append(candle)

            return candles

        except requests.exceptions.RequestException as e:
            print(f"  ERROR: Network error: {e}")
            return []
        except Exception as e:
            print(f"  ERROR: Error: {e}")
            return []

    def download_tiingo_crypto(self, symbol, start_date, end_date):
        """
        Download crypto data from Tiingo Crypto API

        Args:
            symbol: Crypto symbol with -USD suffix (e.g., "BTC-USD")
            start_date: Start date string "YYYY-MM-DD"
            end_date: End date string "YYYY-MM-DD"

        Returns:
            list: List of candle dicts or empty list on error
        """
        # Convert symbol from BTC-USD to btcusd format
        tiingo_symbol = symbol.replace('-USD', '').lower() + 'usd'

        url = f"https://api.tiingo.com/tiingo/crypto/prices"
        params = {
            'token': self.tiingo_api_token,
            'tickers': tiingo_symbol,
            'startDate': start_date,
            'endDate': end_date,
            'resampleFreq': 'daily'
        }
        headers = {
            'Content-Type': 'application/json'
        }

        try:
            response = requests.get(url, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()

            # Check if there are results
            if not data or len(data) == 0:
                print(f"  WARNING:  No results returned")
                return []

            # Tiingo crypto returns array with ticker data
            ticker_data = data[0] if isinstance(data, list) else data
            price_data = ticker_data.get('priceData', [])

            if not price_data:
                print(f"  WARNING:  No price data in response")
                return []

            # Convert Tiingo crypto format to our format
            candles = []
            for bar in price_data:
                candle = {
                    'date': bar['date'][:10],  # Extract YYYY-MM-DD from ISO string
                    'open': round(bar['open'], 2),
                    'high': round(bar['high'], 2),
                    'low': round(bar['low'], 2),
                    'close': round(bar['close'], 2),
                    'volume': int(bar['volumeNotional'])  # USD volume
                }
                candles.append(candle)

            return candles

        except requests.exceptions.RequestException as e:
            print(f"  ERROR: Network error: {e}")
            return []
        except Exception as e:
            print(f"  ERROR: Tiingo crypto error: {e}")
            return []

    def download_coingecko(self, symbol, start_date, end_date):
        """
        Download crypto data from CoinGecko using REST API

        Args:
            symbol: Crypto symbol with -USD suffix (e.g., "BTC-USD")
            start_date: Start date string "YYYY-MM-DD"
            end_date: End date string "YYYY-MM-DD"

        Returns:
            list: List of candle dicts or empty list on error
        """
        # Map symbol to CoinGecko ID
        coin_id = COINGECKO_ID_MAP.get(symbol)
        if not coin_id:
            print(f"  WARNING:  Unknown crypto symbol: {symbol}")
            return []

        # Convert dates to Unix timestamps
        start_timestamp = int(datetime.strptime(start_date, '%Y-%m-%d').timestamp())
        end_timestamp = int(datetime.strptime(end_date, '%Y-%m-%d').timestamp())

        try:
            # Use CoinGecko REST API directly
            url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart/range"
            params = {
                'vs_currency': 'usd',
                'from': start_timestamp,
                'to': end_timestamp
            }
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }

            response = requests.get(url, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()

            if not data.get('prices'):
                print(f"  WARNING:  No price data returned")
                return []

            # CoinGecko returns prices every ~5 minutes, group by day
            prices_by_date = {}
            volumes_by_date = {}

            # Process prices
            for timestamp_ms, price in data['prices']:
                date = datetime.fromtimestamp(timestamp_ms / 1000).strftime('%Y-%m-%d')
                if date not in prices_by_date:
                    prices_by_date[date] = []
                prices_by_date[date].append(price)

            # Process volumes (if available)
            for timestamp_ms, volume in data.get('total_volumes', []):
                date = datetime.fromtimestamp(timestamp_ms / 1000).strftime('%Y-%m-%d')
                volumes_by_date[date] = volume

            # Create daily OHLC candles
            candles = []
            for date in sorted(prices_by_date.keys()):
                prices = prices_by_date[date]
                candle = {
                    'date': date,
                    'open': round(prices[0], 2),
                    'high': round(max(prices), 2),
                    'low': round(min(prices), 2),
                    'close': round(prices[-1], 2),
                    'volume': int(volumes_by_date.get(date, 0))
                }
                candles.append(candle)

            return candles

        except requests.exceptions.RequestException as e:
            print(f"  ERROR: Network error: {e}")
            return []
        except Exception as e:
            print(f"  ERROR: CoinGecko error: {e}")
            return []

    def download_yfinance(self, symbol, start_date, end_date):
        """
        Download data using Yahoo Finance (fallback option)

        Args:
            symbol: Asset symbol (e.g., "BTC-USD", "SPY")
            start_date: Start date string "YYYY-MM-DD"
            end_date: End date string "YYYY-MM-DD"

        Returns:
            list: List of candle dicts or empty list on error
        """
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(start=start_date, end=end_date, interval="1d")

            if df.empty:
                print(f"  WARNING:  No data from yfinance")
                return []

            # Convert DataFrame to our candle format
            candles = []
            for date, row in df.iterrows():
                candle = {
                    'date': date.strftime("%Y-%m-%d"),
                    'open': round(float(row['Open']), 2),
                    'high': round(float(row['High']), 2),
                    'low': round(float(row['Low']), 2),
                    'close': round(float(row['Close']), 2),
                    'volume': int(row['Volume'])
                }
                candles.append(candle)

            return candles

        except Exception as e:
            print(f"  ERROR: yfinance error: {e}")
            return []

    def download_asset(self, symbol, category, start_date, end_date):
        """
        Download data for a single asset using appropriate API with fallback

        Args:
            symbol: Asset symbol
            category: Asset category (etf, crypto, etc.)
            start_date: Start date "YYYY-MM-DD"
            end_date: End date "YYYY-MM-DD"

        Returns:
            dict: Asset data or None on failure
        """
        print(f"  {symbol}: {start_date} -> {end_date}", end=" ")

        candles = []
        source = None

        # Use Tiingo for all assets (stocks, ETF, crypto)
        if category == 'crypto':
            # Try Tiingo Crypto first
            candles = self.download_tiingo_crypto(symbol, start_date, end_date)
            source = 'tiingo-crypto'

            # Fallback to CoinGecko if Tiingo fails
            if not candles:
                print(" Tiingo failed, trying CoinGecko...", end=" ")
                candles = self.download_coingecko(symbol, start_date, end_date)
                source = 'coingecko'

            # Fallback to yfinance if both fail
            if not candles:
                print(" CoinGecko failed, trying yfinance...", end=" ")
                candles = self.download_yfinance(symbol, start_date, end_date)
                source = 'yfinance'
        else:
            candles = self.download_tiingo(symbol, start_date, end_date)
            source = 'tiingo'

        if not candles:
            print("ERROR: No data")
            return None

        # Create asset data structure
        asset_data = {
            'symbol': symbol,
            'category': category,
            'start_date': candles[0]['date'],
            'end_date': candles[-1]['date'],
            'data_points': len(candles),
            'source': source,
            'candles': candles
        }

        print(f"OK: {len(candles)} candles ({source})")
        return asset_data

    def load_existing_data(self, category, symbol):
        """
        Load existing data for an asset from JSON file

        Returns:
            dict or None: Existing asset data or None if not found
        """
        filepath = self.data_dir / f"{category}_historical.json"

        if not filepath.exists():
            return None

        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            return data.get(symbol)
        except Exception as e:
            print(f"  WARNING:  Error loading {filepath}: {e}")
            return None

    def save_data(self, category, symbol, asset_data):
        """
        Save asset data to category JSON file

        Args:
            category: Asset category
            symbol: Asset symbol
            asset_data: Asset data dict to save
        """
        filepath = self.data_dir / f"{category}_historical.json"

        # Load existing file or create new dict
        if filepath.exists():
            with open(filepath, 'r') as f:
                all_data = json.load(f)
        else:
            all_data = {}

        # Update this asset
        all_data[symbol] = asset_data

        # Save
        with open(filepath, 'w') as f:
            json.dump(all_data, f, indent=2)

    def download_full(self):
        """Download full historical data for all assets"""
        print("\n" + "="*60)
        print("FULL HISTORICAL DOWNLOAD")
        print("="*60)
        print(f"Period: {START_DATE} -> {datetime.now().strftime('%Y-%m-%d')}")
        print(f"Total assets: {sum(len(symbols) for symbols in ASSETS.values())}")
        print("="*60 + "\n")

        end_date = datetime.now().strftime('%Y-%m-%d')

        for category, symbols in ASSETS.items():
            print(f"\n-- {category.upper()}")
            print("-" * 40)

            for symbol in tqdm(symbols, desc=f"{category:12}", ncols=80):
                self.stats['total_assets'] += 1

                # Get metadata for inception date
                metadata = ASSET_METADATA.get(symbol, {})
                asset_start = metadata.get('inception', START_DATE)

                # Download
                asset_data = self.download_asset(symbol, category, asset_start, end_date)

                if asset_data:
                    self.save_data(category, symbol, asset_data)
                    self.stats['successful'] += 1
                else:
                    self.stats['failed'] += 1
                    self.stats['errors'].append(f"{symbol} ({category})")

                # Rate limiting (Tiingo: 500 calls/hour, ~5/min to be safe)
                time.sleep(12)  # 5 per minute = 12 seconds between calls

        self.print_summary()

    def update_incremental(self):
        """Update existing data with only new candles"""
        print("\n" + "="*60)
        print("INCREMENTAL DATA UPDATE")
        print("="*60)
        print(f"Checking for updates since last download...")
        print("="*60 + "\n")

        today = datetime.now().strftime('%Y-%m-%d')
        updated_count = 0

        for category, symbols in ASSETS.items():
            print(f"\n-- {category.upper()}")
            print("-" * 40)

            for symbol in symbols:
                self.stats['total_assets'] += 1

                # Load existing data
                existing = self.load_existing_data(category, symbol)

                if not existing:
                    print(f"  WARNING:  {symbol}: No existing data, use --full first")
                    self.stats['skipped'] += 1
                    continue

                # Check if update needed
                last_date = existing['end_date']
                start_date = (datetime.strptime(last_date, '%Y-%m-%d') + timedelta(days=1)).strftime('%Y-%m-%d')

                if start_date >= today:
                    print(f"  OK: {symbol}: Already up-to-date ({last_date})")
                    self.stats['skipped'] += 1
                    continue

                # Download new candles
                new_candles = []
                if category == 'crypto':
                    new_candles = self.download_tiingo_crypto(symbol, start_date, today)
                else:
                    new_candles = self.download_tiingo(symbol, start_date, today)

                if not new_candles:
                    print(f"  WARNING:  {symbol}: No new data available")
                    self.stats['failed'] += 1
                    continue

                # Merge with existing data
                updated_data = {
                    **existing,
                    'end_date': new_candles[-1]['date'],
                    'data_points': existing['data_points'] + len(new_candles),
                    'candles': existing['candles'] + new_candles,
                    'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }

                # Save updated data
                self.save_data(category, symbol, updated_data)

                print(f"  OK: {symbol}: +{len(new_candles)} candles ({last_date} -> {today})")
                self.stats['successful'] += 1
                updated_count += 1

                # Rate limiting (Tiingo: 500 calls/hour, ~5/min to be safe)
                time.sleep(12)  # 5 per minute = 12 seconds between calls

        print(f"\n{'='*60}")
        print(f"Updated {updated_count} assets with new data")
        self.print_summary()

    def test_single_asset(self, symbol):
        """Test download for a single asset"""
        print(f"\n{'='*60}")
        print(f"TEST MODE: {symbol}")
        print("="*60 + "\n")

        # Find category
        category = None
        for cat, symbols in ASSETS.items():
            if symbol in symbols:
                category = cat
                break

        if not category:
            print(f"ERROR: Symbol {symbol} not found in asset config")
            return

        # Get metadata
        metadata = ASSET_METADATA.get(symbol, {})
        print(f"Name: {metadata.get('name', 'Unknown')}")
        print(f"Category: {category}")
        print(f"Inception: {metadata.get('inception', 'Unknown')}")
        print()

        # Download
        start_date = metadata.get('inception', START_DATE)
        end_date = datetime.now().strftime('%Y-%m-%d')

        asset_data = self.download_asset(symbol, category, start_date, end_date)

        if asset_data:
            print(f"\nOK: Successfully downloaded {symbol}")
            print(f"  Data points: {asset_data['data_points']}")
            print(f"  Date range: {asset_data['start_date']} -> {asset_data['end_date']}")
            print(f"  Source: {asset_data['source']}")

            # Show first and last candles
            print(f"\n  First candle: {asset_data['candles'][0]}")
            print(f"  Last candle:  {asset_data['candles'][-1]}")

            # Auto-save in test mode
            print(f"\n  Saving to data/{category}_historical.json...")
            self.save_data(category, symbol, asset_data)
            print(f"  OK: Saved successfully")
        else:
            print(f"\nERROR: Failed to download {symbol}")

    def validate_data(self):
        """Validate quality of existing data"""
        print("\n" + "="*60)
        print("DATA VALIDATION")
        print("="*60 + "\n")

        for category, symbols in ASSETS.items():
            print(f"\n-- {category.upper()}")
            print("-" * 40)

            for symbol in symbols:
                existing = self.load_existing_data(category, symbol)

                if not existing:
                    print(f"  WARNING:  {symbol}: No data file")
                    continue

                # Check for gaps (basic)
                candles = existing['candles']
                gaps = []

                for i in range(len(candles) - 1):
                    current = datetime.strptime(candles[i]['date'], '%Y-%m-%d')
                    next_date = datetime.strptime(candles[i+1]['date'], '%Y-%m-%d')
                    days_diff = (next_date - current).days

                    # More than 5 days gap (excluding weekends)
                    if days_diff > 5:
                        gaps.append(f"{candles[i]['date']} -> {candles[i+1]['date']} ({days_diff} days)")

                if gaps:
                    print(f"  WARNING:  {symbol}: {len(gaps)} gaps found")
                else:
                    print(f"  OK: {symbol}: {existing['data_points']} candles, no major gaps")

    def print_summary(self):
        """Print download statistics summary"""
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)
        print(f"Total assets:     {self.stats['total_assets']}")
        print(f"Successful:       {self.stats['successful']}")
        print(f"Failed:           {self.stats['failed']}")
        print(f"Skipped:          {self.stats['skipped']}")

        if self.stats['errors']:
            print(f"\nErrors:")
            for error in self.stats['errors']:
                print(f"  - {error}")

        print("="*60 + "\n")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Download historical asset data from Tiingo API'
    )
    parser.add_argument('--full', action='store_true', help='Full historical download (20 years)')
    parser.add_argument('--update', action='store_true', help='Incremental update (only new data)')
    parser.add_argument('--test', type=str, metavar='SYMBOL', help='Test single asset download')
    parser.add_argument('--validate', action='store_true', help='Validate existing data quality')

    args = parser.parse_args()

    # Check API key
    if not TIINGO_API_TOKEN:
        print("ERROR: ERROR: TIINGO_API_TOKEN not found in .env file")
        print("Please create .env file with: TIINGO_API_TOKEN=your_token_here")
        return

    downloader = DataDownloader()

    if args.full:
        downloader.download_full()
    elif args.update:
        downloader.update_incremental()
    elif args.test:
        downloader.test_single_asset(args.test)
    elif args.validate:
        downloader.validate_data()
    else:
        parser.print_help()
        print("\nNo action specified. Use --full, --update, --test, or --validate")


if __name__ == "__main__":
    main()
