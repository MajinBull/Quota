"""
Asset Configuration for Historical Data Download
Contains all 72 assets organized by category with metadata
"""

# Asset symbols organized by category
ASSETS = {
    "etf": [
        # Large Cap US (8)
        "SPY", "QQQ", "VTI", "VOO", "IVV", "SPLG", "DIA", "VTV",

        # Small/Mid Cap US (3)
        "IWM", "VB", "IJH",

        # International (4)
        "VEA", "VWO", "EFA", "IEFA",

        # Sector ETF (7)
        "XLK", "XLE", "XLF", "XLV", "XLI", "XLP", "XLY"
    ],

    "crypto": [
        # Top Market Cap (10)
        "BTC-USD", "ETH-USD", "BNB-USD", "SOL-USD", "ADA-USD",
        "XRP-USD", "DOGE-USD", "TRX-USD",

        # DeFi & Alt L1 (5)
        "AVAX-USD", "MATIC-USD", "LINK-USD", "DOT-USD", "ATOM-USD"
    ],

    "commodities": [
        # Precious Metals (5)
        "GLD", "SLV", "PPLT", "PALL", "IAU",

        # Industrial Metals & Mining (2)
        "COPX", "CPER",

        # Energy (2)
        "USO", "UNG",

        # Agriculture (2)
        "DBA", "CORN",

        # Diversified (1)
        "DBC"
    ],

    "bonds": [
        # Total Market (5)
        "AGG", "BND", "VTEB", "TLT", "TIP",

        # Duration-Specific Treasuries (4)
        "SHY", "IEF", "VGIT", "VGLT",

        # Corporate Bonds (4)
        "LQD", "HYG", "VCSH", "VCIT",

        # International/EM (2)
        "BNDX", "EMB"
    ],

    "real_estate": [
        # US REIT (6)
        "VNQ", "IYR", "XLRE", "SCHH", "USRT", "RWO",

        # International REIT (2)
        "VNQI", "IFGL"
    ]
}

# CoinGecko ID mapping for crypto symbols
COINGECKO_ID_MAP = {
    'BTC-USD': 'bitcoin',
    'ETH-USD': 'ethereum',
    'BNB-USD': 'binancecoin',
    'SOL-USD': 'solana',
    'ADA-USD': 'cardano',
    'XRP-USD': 'ripple',
    'DOGE-USD': 'dogecoin',
    'TRX-USD': 'tron',
    'AVAX-USD': 'avalanche-2',
    'MATIC-USD': 'matic-network',
    'LINK-USD': 'chainlink',
    'DOT-USD': 'polkadot',
    'ATOM-USD': 'cosmos'
}

# Detailed metadata for each asset
ASSET_METADATA = {
    # ETF - Large Cap US
    "SPY": {
        "name": "SPDR S&P 500 ETF",
        "description": "Tracks the S&P 500 index",
        "inception": "1993-01-22",
        "expense_ratio": 0.0945
    },
    "QQQ": {
        "name": "Invesco QQQ Trust",
        "description": "Tracks the Nasdaq 100 index",
        "inception": "1999-03-10",
        "expense_ratio": 0.20
    },
    "VTI": {
        "name": "Vanguard Total Stock Market ETF",
        "description": "Total US stock market",
        "inception": "2001-05-24",
        "expense_ratio": 0.03
    },
    "VOO": {
        "name": "Vanguard S&P 500 ETF",
        "description": "S&P 500 low-cost alternative",
        "inception": "2010-09-07",
        "expense_ratio": 0.03
    },
    "IVV": {
        "name": "iShares Core S&P 500 ETF",
        "description": "S&P 500 liquid alternative",
        "inception": "2000-05-15",
        "expense_ratio": 0.03
    },
    "SPLG": {
        "name": "SPDR Portfolio S&P 500 ETF",
        "description": "S&P 500 ultra low-cost",
        "inception": "2005-11-08",
        "expense_ratio": 0.02
    },
    "DIA": {
        "name": "SPDR Dow Jones Industrial Average ETF",
        "description": "Dow Jones 30 industrials",
        "inception": "1998-01-14",
        "expense_ratio": 0.16
    },
    "VTV": {
        "name": "Vanguard Value ETF",
        "description": "Large-cap value stocks",
        "inception": "2004-01-26",
        "expense_ratio": 0.04
    },

    # ETF - Small/Mid Cap
    "IWM": {
        "name": "iShares Russell 2000 ETF",
        "description": "Small-cap US stocks",
        "inception": "2000-05-22",
        "expense_ratio": 0.19
    },
    "VB": {
        "name": "Vanguard Small-Cap ETF",
        "description": "Small-cap index",
        "inception": "2004-01-26",
        "expense_ratio": 0.05
    },
    "IJH": {
        "name": "iShares Core S&P Mid-Cap ETF",
        "description": "Mid-cap US stocks",
        "inception": "2000-05-22",
        "expense_ratio": 0.05
    },

    # ETF - International
    "VEA": {
        "name": "Vanguard Developed Markets ETF",
        "description": "Developed markets ex-US",
        "inception": "2007-07-20",
        "expense_ratio": 0.05
    },
    "VWO": {
        "name": "Vanguard Emerging Markets ETF",
        "description": "Emerging markets stocks",
        "inception": "2005-03-04",
        "expense_ratio": 0.08
    },
    "EFA": {
        "name": "iShares MSCI EAFE ETF",
        "description": "Developed markets ex-North America",
        "inception": "2001-08-14",
        "expense_ratio": 0.32
    },
    "IEFA": {
        "name": "iShares Core MSCI EAFE ETF",
        "description": "Developed markets low-cost",
        "inception": "2012-10-18",
        "expense_ratio": 0.07
    },

    # ETF - Sectors
    "XLK": {
        "name": "Technology Select Sector SPDR",
        "description": "S&P 500 technology sector",
        "inception": "1998-12-16",
        "expense_ratio": 0.10
    },
    "XLE": {
        "name": "Energy Select Sector SPDR",
        "description": "S&P 500 energy sector",
        "inception": "1998-12-16",
        "expense_ratio": 0.10
    },
    "XLF": {
        "name": "Financial Select Sector SPDR",
        "description": "S&P 500 financials sector",
        "inception": "1998-12-16",
        "expense_ratio": 0.10
    },
    "XLV": {
        "name": "Health Care Select Sector SPDR",
        "description": "S&P 500 healthcare sector",
        "inception": "1998-12-16",
        "expense_ratio": 0.10
    },
    "XLI": {
        "name": "Industrial Select Sector SPDR",
        "description": "S&P 500 industrials sector",
        "inception": "1998-12-16",
        "expense_ratio": 0.10
    },
    "XLP": {
        "name": "Consumer Staples Select Sector SPDR",
        "description": "S&P 500 consumer staples",
        "inception": "1998-12-16",
        "expense_ratio": 0.10
    },
    "XLY": {
        "name": "Consumer Discretionary Select Sector SPDR",
        "description": "S&P 500 consumer discretionary",
        "inception": "1998-12-16",
        "expense_ratio": 0.10
    },

    # Crypto
    "BTC-USD": {
        "name": "Bitcoin",
        "description": "Leading cryptocurrency",
        "inception": "2014-09-17",
        "expense_ratio": 0
    },
    "ETH-USD": {
        "name": "Ethereum",
        "description": "Smart contract platform",
        "inception": "2017-11-09",
        "expense_ratio": 0
    },
    "BNB-USD": {
        "name": "Binance Coin",
        "description": "Binance exchange token",
        "inception": "2017-11-06",
        "expense_ratio": 0
    },
    "SOL-USD": {
        "name": "Solana",
        "description": "High-performance blockchain",
        "inception": "2020-04-10",
        "expense_ratio": 0
    },
    "ADA-USD": {
        "name": "Cardano",
        "description": "Proof-of-stake blockchain",
        "inception": "2017-10-01",
        "expense_ratio": 0
    },
    "XRP-USD": {
        "name": "Ripple",
        "description": "Payment settlement network",
        "inception": "2018-05-04",
        "expense_ratio": 0
    },
    "DOGE-USD": {
        "name": "Dogecoin",
        "description": "Meme cryptocurrency",
        "inception": "2021-02-04",
        "expense_ratio": 0
    },
    "TRX-USD": {
        "name": "Tron",
        "description": "Decentralized entertainment platform",
        "inception": "2018-04-25",
        "expense_ratio": 0
    },
    "AVAX-USD": {
        "name": "Avalanche",
        "description": "Layer 1 blockchain platform",
        "inception": "2020-09-21",
        "expense_ratio": 0
    },
    "MATIC-USD": {
        "name": "Polygon",
        "description": "Ethereum layer 2 scaling",
        "inception": "2019-04-26",
        "expense_ratio": 0
    },
    "LINK-USD": {
        "name": "Chainlink",
        "description": "Decentralized oracle network",
        "inception": "2019-05-30",
        "expense_ratio": 0
    },
    "DOT-USD": {
        "name": "Polkadot",
        "description": "Multi-chain blockchain protocol",
        "inception": "2020-08-19",
        "expense_ratio": 0
    },
    "ATOM-USD": {
        "name": "Cosmos",
        "description": "Blockchain interoperability",
        "inception": "2019-04-22",
        "expense_ratio": 0
    },

    # Commodities - Metals
    "GLD": {
        "name": "SPDR Gold Shares",
        "description": "Physical gold holdings",
        "inception": "2004-11-18",
        "expense_ratio": 0.40
    },
    "SLV": {
        "name": "iShares Silver Trust",
        "description": "Physical silver holdings",
        "inception": "2006-04-28",
        "expense_ratio": 0.50
    },
    "PPLT": {
        "name": "Aberdeen Standard Physical Platinum Shares ETF",
        "description": "Physical platinum holdings",
        "inception": "2010-01-08",
        "expense_ratio": 0.60
    },
    "PALL": {
        "name": "Aberdeen Standard Physical Palladium Shares ETF",
        "description": "Physical palladium holdings",
        "inception": "2010-01-08",
        "expense_ratio": 0.60
    },
    "IAU": {
        "name": "iShares Gold Trust",
        "description": "Gold low-cost alternative",
        "inception": "2005-01-21",
        "expense_ratio": 0.25
    },
    "COPX": {
        "name": "Global X Copper Miners ETF",
        "description": "Copper mining companies",
        "inception": "2010-11-18",
        "expense_ratio": 0.65
    },
    "CPER": {
        "name": "United States Copper Index Fund",
        "description": "Copper futures tracking",
        "inception": "2011-11-15",
        "expense_ratio": 1.07
    },

    # Commodities - Energy
    "USO": {
        "name": "United States Oil Fund",
        "description": "WTI crude oil futures",
        "inception": "2006-04-10",
        "expense_ratio": 0.79
    },
    "UNG": {
        "name": "United States Natural Gas Fund",
        "description": "Natural gas futures",
        "inception": "2007-04-18",
        "expense_ratio": 1.06
    },

    # Commodities - Agriculture
    "DBA": {
        "name": "Invesco DB Agriculture Fund",
        "description": "Agricultural commodities basket",
        "inception": "2007-01-05",
        "expense_ratio": 0.93
    },
    "CORN": {
        "name": "Teucrium Corn Fund",
        "description": "Corn futures tracking",
        "inception": "2010-06-09",
        "expense_ratio": 1.12
    },

    # Commodities - Diversified
    "DBC": {
        "name": "Invesco DB Commodity Index Tracking Fund",
        "description": "Diversified commodities basket",
        "inception": "2006-02-03",
        "expense_ratio": 0.87
    },

    # Bonds - Total Market
    "AGG": {
        "name": "iShares Core US Aggregate Bond ETF",
        "description": "US investment-grade bonds",
        "inception": "2003-09-22",
        "expense_ratio": 0.03
    },
    "BND": {
        "name": "Vanguard Total Bond Market ETF",
        "description": "Total US bond market",
        "inception": "2007-04-03",
        "expense_ratio": 0.03
    },
    "VTEB": {
        "name": "Vanguard Tax-Exempt Bond ETF",
        "description": "Municipal bonds",
        "inception": "2015-08-21",
        "expense_ratio": 0.05
    },
    "TLT": {
        "name": "iShares 20+ Year Treasury Bond ETF",
        "description": "Long-term US treasuries",
        "inception": "2002-07-22",
        "expense_ratio": 0.15
    },
    "TIP": {
        "name": "iShares TIPS Bond ETF",
        "description": "Treasury inflation-protected securities",
        "inception": "2003-12-04",
        "expense_ratio": 0.19
    },

    # Bonds - Duration-Specific
    "SHY": {
        "name": "iShares 1-3 Year Treasury Bond ETF",
        "description": "Short-term treasuries",
        "inception": "2002-07-22",
        "expense_ratio": 0.15
    },
    "IEF": {
        "name": "iShares 7-10 Year Treasury Bond ETF",
        "description": "Intermediate treasuries",
        "inception": "2002-07-22",
        "expense_ratio": 0.15
    },
    "VGIT": {
        "name": "Vanguard Intermediate-Term Treasury ETF",
        "description": "3-10 year treasuries",
        "inception": "2009-11-19",
        "expense_ratio": 0.04
    },
    "VGLT": {
        "name": "Vanguard Long-Term Treasury ETF",
        "description": "10+ year treasuries",
        "inception": "2009-11-19",
        "expense_ratio": 0.04
    },

    # Bonds - Corporate
    "LQD": {
        "name": "iShares iBoxx $ Investment Grade Corporate Bond ETF",
        "description": "Investment-grade corporate bonds",
        "inception": "2002-07-22",
        "expense_ratio": 0.14
    },
    "HYG": {
        "name": "iShares iBoxx $ High Yield Corporate Bond ETF",
        "description": "High-yield corporate bonds",
        "inception": "2007-04-04",
        "expense_ratio": 0.49
    },
    "VCSH": {
        "name": "Vanguard Short-Term Corporate Bond ETF",
        "description": "1-5 year corporate bonds",
        "inception": "2009-11-19",
        "expense_ratio": 0.04
    },
    "VCIT": {
        "name": "Vanguard Intermediate-Term Corporate Bond ETF",
        "description": "5-10 year corporate bonds",
        "inception": "2009-11-19",
        "expense_ratio": 0.04
    },

    # Bonds - International
    "BNDX": {
        "name": "Vanguard Total International Bond ETF",
        "description": "Non-US investment-grade bonds",
        "inception": "2013-05-31",
        "expense_ratio": 0.07
    },
    "EMB": {
        "name": "iShares J.P. Morgan USD Emerging Markets Bond ETF",
        "description": "Emerging markets USD bonds",
        "inception": "2007-12-17",
        "expense_ratio": 0.39
    },

    # Real Estate - US
    "VNQ": {
        "name": "Vanguard Real Estate ETF",
        "description": "US REITs",
        "inception": "2004-09-23",
        "expense_ratio": 0.12
    },
    "IYR": {
        "name": "iShares US Real Estate ETF",
        "description": "US real estate sector",
        "inception": "2000-06-12",
        "expense_ratio": 0.40
    },
    "XLRE": {
        "name": "Real Estate Select Sector SPDR Fund",
        "description": "S&P 500 real estate sector",
        "inception": "2015-10-07",
        "expense_ratio": 0.10
    },
    "SCHH": {
        "name": "Schwab US REIT ETF",
        "description": "US REIT index",
        "inception": "2011-01-13",
        "expense_ratio": 0.07
    },
    "USRT": {
        "name": "iShares Core US REIT ETF",
        "description": "Core US REIT holdings",
        "inception": "2007-05-01",
        "expense_ratio": 0.08
    },
    "RWO": {
        "name": "SPDR Dow Jones Global Real Estate ETF",
        "description": "Global real estate",
        "inception": "2008-05-22",
        "expense_ratio": 0.50
    },

    # Real Estate - International
    "VNQI": {
        "name": "Vanguard Global ex-US Real Estate ETF",
        "description": "International REITs",
        "inception": "2010-11-01",
        "expense_ratio": 0.12
    },
    "IFGL": {
        "name": "iShares International Developed Real Estate ETF",
        "description": "Developed markets ex-US real estate",
        "inception": "2016-10-18",
        "expense_ratio": 0.48
    }
}

# Count assets per category
def get_asset_counts():
    """Get count of assets per category"""
    return {category: len(symbols) for category, symbols in ASSETS.items()}

# Get total asset count
def get_total_asset_count():
    """Get total number of assets across all categories"""
    return sum(len(symbols) for symbols in ASSETS.values())

# Validate that all assets have metadata
def validate_metadata():
    """Check that all assets have corresponding metadata"""
    all_symbols = [symbol for symbols in ASSETS.values() for symbol in symbols]
    missing = [s for s in all_symbols if s not in ASSET_METADATA]

    if missing:
        print(f"WARNING: Missing metadata for: {missing}")
        return False

    print(f"✓ All {len(all_symbols)} assets have metadata")
    return True

if __name__ == "__main__":
    print("="*60)
    print("Asset Configuration Summary")
    print("="*60)

    counts = get_asset_counts()
    for category, count in counts.items():
        print(f"{category.upper():15} {count:3} assets")

    print("-"*60)
    print(f"{'TOTAL':15} {get_total_asset_count():3} assets")
    print("="*60)

    # Validate metadata
    validate_metadata()
