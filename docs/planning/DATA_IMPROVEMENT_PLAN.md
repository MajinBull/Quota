# 📊 Data Improvement Plan - Migliora Dati Storici & Aggiungi Asset

**Obiettivo**: Sostituire Yahoo Finance con fonti più affidabili e aumentare il numero di asset disponibili.

**Ultimo aggiornamento**: 28 Febbraio 2026

---

## ❌ Problemi con Yahoo Finance

### Problemi Riscontrati
1. **Gap nei dati**: Giorni mancanti senza spiegazione
2. **Split/Dividend adjustment**: Non sempre corretti
3. **Rate limiting**: Download lenti e blocchi casuali
4. **Qualità variabile**: Alcuni asset hanno dati inconsistenti
5. **Crypto data**: Limitato e spesso con gap

### Esempi Problematici
- **Crypto**: BTC/ETH hanno gap casuali su weekends
- **ETF recenti**: REET (dal 2014) ha pochi dati
- **Metalli**: PPLT/PALL hanno volumi zero in alcuni periodi

---

## ✅ Fonti Dati Alternative (Migliori di Yahoo)

### 1. **Polygon.io** ⭐ (Raccomandato per Stocks/ETF)

**Vantaggi**:
- ✅ Dati di alta qualità da exchanges ufficiali
- ✅ Stocks, ETF, Crypto, Forex
- ✅ Free tier: 5 API calls/min, delayed data (15 min)
- ✅ Historical data completo
- ✅ Split/dividend adjusted automaticamente

**Free Tier**:
- 5 requests/minute
- Delayed data (15 min delay)
- Unlimited storage (puoi scaricare tutto)
- No credit card required

**API Endpoint**:
```
GET /v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}
```

**Pricing**:
- **Free**: $0/mese (5 calls/min, delayed)
- **Starter**: $29/mese (unlimited calls, delayed)
- **Developer**: $99/mese (real-time data)

**Consiglio**: Free tier è perfetto per backtest (non serve real-time)

---

### 2. **Alpha Vantage** (Alternativa stocks/crypto)

**Vantaggi**:
- ✅ Free tier generoso
- ✅ Stocks, Crypto, Forex, Commodities
- ✅ 25 API calls/day (free tier)
- ✅ Adjusted close prices
- ✅ No credit card required

**Svantaggi**:
- ❌ Solo 25 calls/day (lento per 50+ asset)
- ❌ Rate limit stretto

**Free Tier**:
- 25 requests/day
- 5 requests/minute
- No credit card

**API Key**: Richiesta gratuita su https://www.alphavantage.co/support/#api-key

**Consiglio**: Usare come **fallback** se Polygon fallisce

---

### 3. **CoinGecko API** ⭐ (Raccomandato per Crypto)

**Vantaggi**:
- ✅ Miglior fonte per crypto
- ✅ 10,000+ coin supportate
- ✅ Historical data fino a 2013
- ✅ Free tier: 30 calls/min
- ✅ No API key required per free tier
- ✅ Dati più completi di Yahoo per crypto

**Free Tier**:
- 30 calls/minute
- Unlimited requests/month
- Historical data completo
- No credit card

**API Endpoint**:
```
GET /coins/{id}/market_chart/range?vs_currency=usd&from={timestamp}&to={timestamp}
```

**Consiglio**: Usare **solo per crypto**, superior a tutte le altre fonti

---

### 4. **Twelvedata** (Alternativa completa)

**Vantaggi**:
- ✅ Stocks, ETF, Crypto, Forex, Commodities
- ✅ 800 API calls/day (free tier)
- ✅ Historical data completo
- ✅ No credit card required

**Free Tier**:
- 800 requests/day
- 8 requests/minute
- Basic support

**Pricing**:
- **Free**: $0/mese
- **Basic**: $29/mese (unlimited calls)

**Consiglio**: Buono come **backup** per tutti i tipi di asset

---

### 5. **EOD Historical Data** (Premium option)

**Vantaggi**:
- ✅ Altissima qualità
- ✅ Tutti i mercati (150+ exchanges)
- ✅ Real-time + historical
- ✅ Corporate actions incluse

**Svantaggi**:
- ❌ No free tier (solo trial)
- ❌ Costo: $19.99/mese (All-World plan)

**Consiglio**: Solo se diventa un business serio

---

## 📋 Strategia Finale (Semplificata)

### ⭐ Solo 2 Fonti - Polygon + CoinGecko

```
┌─────────────────────────────────────────────┐
│  STOCKS, ETF, BONDS, COMMODITIES, REIT      │
│  → Polygon.io (free tier)                   │
│  - 5 calls/min (15 min per 72 asset) ✅     │
│  - Split/dividend adjusted automatico       │
│  - Qualità istituzionale                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  CRYPTO                                     │
│  → CoinGecko (free tier)                    │
│  - 30 calls/min (velocissimo) ✅            │
│  - Migliore fonte crypto in assoluto        │
│  - No API key per free tier                 │
└─────────────────────────────────────────────┘
```

**Perché solo queste 2?**
- ✅ **Polygon**: Copre tutti i mercati tradizionali (stocks, ETF, bonds, commodities)
- ✅ **CoinGecko**: Migliore per crypto, nessuna alternativa valida
- ✅ **Semplicità**: Meno dipendenze, meno complessità
- ✅ **Affidabilità**: 2 fonti = meno punti di fallimento
- ✅ **Rate limit ok**: 5 calls/min × 60 asset tradizionali = 12 minuti + 2 min crypto = **14 minuti totale**

### Costi Totali: **€0/mese** ✅

Tutto gratis con free tier!

---

## 🎯 Asset da Aggiungere

### 📊 ETF (Attualmente: 5 → Nuovo: 20)

#### **Large Cap US** (3 nuovi)
- **VOO** - Vanguard S&P 500 (alternativa a SPY, expense ratio più basso)
- **IVV** - iShares Core S&P 500 (alternativa liquida)
- **SPLG** - SPDR S&P 500 (low cost option)

#### **Small/Mid Cap US** (3 nuovi)
- **IWM** - iShares Russell 2000 (small cap)
- **VB** - Vanguard Small-Cap
- **IJH** - iShares Core S&P Mid-Cap 400

#### **International Developed** (2 nuovi)
- **EFA** - iShares MSCI EAFE (alternativa a VEA)
- **IEFA** - iShares Core MSCI EAFE (low cost)

#### **Sector ETF** (7 nuovi) ⭐
- **XLK** - Technology Select Sector
- **XLE** - Energy Select Sector
- **XLF** - Financial Select Sector
- **XLV** - Health Care Select Sector
- **XLI** - Industrial Select Sector
- **XLP** - Consumer Staples Select Sector
- **XLY** - Consumer Discretionary Select Sector

**Totale ETF**: 20 asset (15 nuovi)

---

### 💰 Crypto (Attualmente: 5 → Nuovo: 15)

#### **Top 10 Market Cap** (5 nuovi)
- **XRP-USD** - Ripple (rank #6)
- **USDT-USD** - Tether stablecoin (rank #3)
- **USDC-USD** - USD Coin stablecoin
- **DOGE-USD** - Dogecoin (rank #8)
- **TRX-USD** - Tron

#### **DeFi Leaders** (3 nuovi)
- **AVAX-USD** - Avalanche (layer 1)
- **MATIC-USD** - Polygon (layer 2)
- **LINK-USD** - Chainlink (oracles)

#### **Alternative Layer 1** (2 nuovi)
- **DOT-USD** - Polkadot
- **ATOM-USD** - Cosmos

**Totale Crypto**: 15 asset (10 nuovi)

---

### 🥇 Metalli & Commodities (Attualmente: 5 → Nuovo: 12)

#### **Energy** (2 nuovi)
- **USO** - United States Oil Fund
- **UNG** - United States Natural Gas Fund

#### **Agriculture** (2 nuovi)
- **DBA** - Invesco DB Agriculture Fund
- **CORN** - Teucrium Corn Fund

#### **Metals Alternatives** (2 nuovi)
- **IAU** - iShares Gold Trust (alternativa a GLD)
- **CPER** - United States Copper Index Fund

#### **Diversified Commodities** (1 nuovo)
- **DBC** - Invesco DB Commodity Index Tracking Fund

**Totale Commodities**: 12 asset (7 nuovi)

---

### 📈 Bond (Attualmente: 5 → Nuovo: 15)

#### **Total Market** (2 nuovi)
- **BND** - Vanguard Total Bond Market ETF
- **VTEB** - Vanguard Tax-Exempt Bond ETF

#### **Duration-Specific Treasuries** (4 nuovi)
- **SHY** - iShares 1-3 Year Treasury
- **IEF** - iShares 7-10 Year Treasury
- **VGIT** - Vanguard Intermediate-Term Treasury
- **VGLT** - Vanguard Long-Term Treasury

#### **Corporate Bonds** (2 nuovi)
- **VCSH** - Vanguard Short-Term Corporate Bond
- **VCIT** - Vanguard Intermediate-Term Corporate Bond

#### **International/EM** (2 nuovi)
- **BNDX** - Vanguard Total International Bond
- **EMB** - iShares J.P. Morgan USD Emerging Markets Bond

**Totale Bond**: 15 asset (10 nuovi)

---

### 🏠 Real Estate (Attualmente: 5 → Nuovo: 10)

#### **US REIT** (3 nuovi)
- **XLRE** - Real Estate Select Sector SPDR Fund
- **SCHH** - Schwab U.S. REIT ETF
- **USRT** - iShares Core U.S. REIT ETF

#### **Global REIT** (2 nuovi)
- **REET** - già presente
- **IFGL** - iShares International Developed Real Estate

**Totale Real Estate**: 10 asset (5 nuovi)

---

## 📊 Riepilogo Espansione Asset

| Categoria | Attuale | Nuovo | Aumento |
|-----------|---------|-------|---------|
| **ETF** | 5 | 20 | +300% |
| **Crypto** | 5 | 15 | +200% |
| **Commodities** | 5 | 12 | +140% |
| **Bond** | 5 | 15 | +200% |
| **Real Estate** | 5 | 10 | +100% |
| **TOTALE** | **25** | **72** | **+188%** |

Da 25 → 72 asset (quasi 3x!)

---

## 🛠️ Piano Implementazione

### **Fase 1: Setup API Keys** (30 minuti)

```bash
# 1. Polygon.io
# Registrati: https://polygon.io
# Free tier, no credit card
# API Key: salva in .env come POLYGON_API_KEY

# 2. CoinGecko
# No API key required per free tier!
# Se serve API key (rate limit più alto):
# https://www.coingecko.com/en/api/pricing

# 3. Alpha Vantage (fallback)
# https://www.alphavantage.co/support/#api-key
# API Key: salva in .env come ALPHA_VANTAGE_API_KEY

# 4. Twelvedata (fallback)
# https://twelvedata.com/pricing
# API Key: salva in .env come TWELVEDATA_API_KEY
```

**File `.env`** (nella root del progetto):
```env
# API Keys for data sources
POLYGON_API_KEY=your_polygon_key_here
ALPHA_VANTAGE_API_KEY=your_alphavantage_key_here
TWELVEDATA_API_KEY=your_twelvedata_key_here
# CoinGecko non serve API key per free tier
```

---

### **Fase 2: Creare Nuovo Download Script** (2-3 ore)

**File**: `download_data_v2.py`

**Caratteristiche**:
1. **Multi-source fallback**:
   - Prova Polygon → fallback Alpha Vantage → fallback Twelvedata
   - Crypto: CoinGecko → fallback Polygon

2. **Data validation**:
   - Controlla gap nei dati
   - Verifica volume > 0
   - Rimuove outliers (price spike > 50% in 1 giorno)

3. **Progress tracking**:
   - Progress bar (tqdm)
   - Salvataggio incrementale (non perdere tutto se crasha)
   - Log dettagliati

4. **Rate limiting intelligente**:
   - Rispetta limiti API (sleep tra calls)
   - Retry automatico con exponential backoff

5. **Data quality metrics**:
   - % completezza dati
   - Gap count
   - Source used (Polygon/Alpha/Twelvedata)
   - Data quality score (0-100)

---

### **Fase 3: Script Structure** (pseudocodice)

```python
# download_data_v2.py

import polygon
import coingecko
import alpha_vantage
import twelvedata
from tqdm import tqdm
import time

class DataDownloader:
    def __init__(self):
        self.polygon = PolygonClient(api_key=POLYGON_API_KEY)
        self.coingecko = CoinGeckoClient()
        self.alpha = AlphaVantageClient(api_key=ALPHA_API_KEY)
        self.twelve = TwelvedataClient(api_key=TWELVE_API_KEY)

    def download_stock_etf(self, symbol):
        """Download stocks/ETF with fallback"""
        # Try Polygon first
        try:
            data = self.polygon.get_aggs(symbol, start, end)
            return self.validate_data(data, source="polygon")
        except:
            pass

        # Fallback to Alpha Vantage
        try:
            data = self.alpha.get_daily(symbol)
            return self.validate_data(data, source="alphavantage")
        except:
            pass

        # Fallback to Twelvedata
        try:
            data = self.twelve.get_time_series(symbol)
            return self.validate_data(data, source="twelvedata")
        except:
            return None

    def download_crypto(self, symbol):
        """Download crypto with CoinGecko"""
        # Try CoinGecko first (best for crypto)
        try:
            coin_id = self.map_symbol_to_coingecko_id(symbol)
            data = self.coingecko.get_coin_market_chart_range(
                coin_id,
                vs_currency='usd',
                from_timestamp=start,
                to_timestamp=end
            )
            return self.validate_data(data, source="coingecko")
        except:
            # Fallback to Polygon crypto
            return self.download_stock_etf(symbol)

    def validate_data(self, data, source):
        """Validate data quality"""
        # Check for gaps
        gaps = self.find_gaps(data)

        # Check for outliers
        outliers = self.find_outliers(data)

        # Calculate quality score
        quality_score = self.calculate_quality_score(data, gaps, outliers)

        return {
            "data": data,
            "source": source,
            "quality_score": quality_score,
            "gaps": gaps,
            "outliers": outliers
        }

    def find_gaps(self, data):
        """Find missing dates (weekends excluded)"""
        # Business days logic
        ...

    def find_outliers(self, data):
        """Find price spikes > 50% in 1 day (possible errors)"""
        ...

    def calculate_quality_score(self, data, gaps, outliers):
        """Score 0-100 based on completeness and accuracy"""
        score = 100
        score -= len(gaps) * 2  # -2 per gap
        score -= len(outliers) * 5  # -5 per outlier
        return max(0, score)
```

---

### **Fase 4: Nuova Lista Asset** (5 minuti)

**File**: `assets_config.py`

```python
ASSETS_V2 = {
    "etf": [
        # Existing
        "SPY", "QQQ", "VTI", "VEA", "VWO",

        # Large Cap
        "VOO", "IVV", "SPLG",

        # Small/Mid Cap
        "IWM", "VB", "IJH",

        # International
        "EFA", "IEFA",

        # Sectors
        "XLK", "XLE", "XLF", "XLV", "XLI", "XLP", "XLY"
    ],

    "crypto": [
        # Existing
        "BTC-USD", "ETH-USD", "BNB-USD", "SOL-USD", "ADA-USD",

        # Top market cap
        "XRP-USD", "USDT-USD", "USDC-USD", "DOGE-USD", "TRX-USD",

        # DeFi
        "AVAX-USD", "MATIC-USD", "LINK-USD",

        # Alt L1
        "DOT-USD", "ATOM-USD"
    ],

    "commodities": [
        # Existing metals
        "GLD", "SLV", "PPLT", "PALL", "COPX",

        # Energy
        "USO", "UNG",

        # Agriculture
        "DBA", "CORN",

        # Metals alternatives
        "IAU", "CPER",

        # Diversified
        "DBC"
    ],

    "bonds": [
        # Existing
        "AGG", "TLT", "LQD", "HYG", "TIP",

        # Total market
        "BND", "VTEB",

        # Treasuries by duration
        "SHY", "IEF", "VGIT", "VGLT",

        # Corporate
        "VCSH", "VCIT",

        # International
        "BNDX", "EMB"
    ],

    "real_estate": [
        # Existing
        "VNQ", "VNQI", "IYR", "RWO", "REET",

        # US REIT
        "XLRE", "SCHH", "USRT",

        # Global
        "IFGL"
    ]
}

# Metadata for each asset
ASSET_METADATA = {
    "SPY": {
        "name": "SPDR S&P 500 ETF",
        "description": "Tracks the S&P 500 index",
        "inception": "1993-01-22",
        "expense_ratio": 0.0945
    },
    # ... etc per tutti gli asset
}
```

---

### **Fase 5: Testing & Validation** (1 giorno)

1. **Test singolo asset**:
   ```bash
   python download_data_v2.py --test --symbol SPY
   ```

2. **Test categoria**:
   ```bash
   python download_data_v2.py --test --category etf
   ```

3. **Confronto Yahoo vs Polygon**:
   - Download stesso asset da entrambe le fonti
   - Confronta prezzi, gap, qualità
   - Genera report comparativo

4. **Data quality report**:
   - Per ogni asset: quality score, gaps, outliers
   - Salvare in `data/quality_report.json`

---

### **Fase 6: Migrazione Dati** (2-3 ore download)

1. **Backup dati Yahoo**:
   ```bash
   mv data data_backup_yahoo
   mkdir data
   ```

2. **Download completo**:
   ```bash
   python download_data_v2.py --full
   ```

   Con 72 asset e rate limits:
   - Polygon: 5 calls/min → ~15 minuti per 72 asset (con pause)
   - CoinGecko: 30 calls/min → veloce
   - Tempo totale stimato: **30-60 minuti**

3. **Validation**:
   ```bash
   python validate_data.py
   ```

---

### **Fase 7: Frontend Update** (2-3 ore)

**1. Aggiornare categorie**:

File: `frontend/src/types/index.ts`
```typescript
export const ASSET_CATEGORIES = {
  etf: [
    // 20 ETF instead of 5
  ],
  crypto: [
    // 15 crypto instead of 5
  ],
  // etc...
}
```

**2. Asset metadata UI**:

```typescript
// Mostrare info aggiuntive per ogni asset
interface AssetMetadata {
  name: string;
  description: string;
  inceptionDate: string;
  expenseRatio?: number;
  dataQuality: number;  // 0-100 score
  dataSource: 'polygon' | 'coingecko' | 'alphavantage';
}
```

**3. Data quality indicator**:

```tsx
// Badge nella UI
{asset.dataQuality > 90 && <span className="badge-green">Alta qualità</span>}
{asset.dataQuality < 70 && <span className="badge-yellow">Qualità media</span>}
```

---

## ⏱️ Timeline Totale

| Fase | Tempo | Descrizione |
|------|-------|-------------|
| **1. Setup API** | 30 min | Registrazione e API keys |
| **2. Nuovo script** | 2-3 ore | Implementare download_data_v2.py |
| **3. Asset config** | 30 min | Definire lista 72 asset |
| **4. Testing** | 4-6 ore | Test singoli, categorie, confronti |
| **5. Download full** | 1 ora | Download tutti gli asset |
| **6. Frontend update** | 2-3 ore | UI per nuovi asset + metadata |
| **7. Testing integrato** | 2 ore | Test backtest con nuovi dati |
| **TOTALE** | **2-3 giorni** | Full implementation |

---

## 💰 Costi

| Servizio | Piano | Costo |
|----------|-------|-------|
| **Polygon.io** | Free tier | **€0/mese** |
| **CoinGecko** | Free tier | **€0/mese** |
| **Alpha Vantage** | Free tier | **€0/mese** |
| **Twelvedata** | Free tier | **€0/mese** |
| **TOTALE** | - | **€0/mese** ✅ |

### Se Vuoi Upgrade (opzionale)
- **Polygon Starter**: $29/mese (unlimited calls, delayed)
- **CoinGecko Pro**: $129/mese (50K calls/month)
- **Twelvedata Basic**: $29/mese (unlimited calls)

**Consiglio**: Free tier è sufficiente per questo progetto

---

## ✅ Benefici Attesi

### Data Quality
- ✅ **-90% gap** nei dati
- ✅ **Split/dividend** corretti automaticamente
- ✅ **Crypto data** molto più affidabile (CoinGecko)
- ✅ **Quality scoring** per ogni asset

### User Experience
- ✅ **3x più asset** (25 → 72)
- ✅ **Sector ETF** per strategie settoriali
- ✅ **Stablecoin** per analisi rischio/rendimento
- ✅ **Più diversificazione** geografica/settoriale

### Platform Value
- ✅ **Backtest più accurati** (dati migliori)
- ✅ **Più combinazioni** possibili
- ✅ **Pro feature**: "High quality data" badge
- ✅ **Competitive advantage** vs altri backtest tool

---

## 🚀 Quick Start

Vuoi iniziare subito? Ecco i comandi:

```bash
# 1. Setup API keys
# Registrati su polygon.io (free tier)
# Copia API key in .env

# 2. Installa dipendenze
pip install polygon-api-client pycoingecko alpha-vantage twelvedata tqdm

# 3. Test con un asset
python download_data_v2.py --test --symbol SPY

# 4. Se ok, download full
python download_data_v2.py --full

# 5. Copia dati in frontend
cp data/*.json frontend/public/data/

# 6. Test frontend
cd frontend && npm run dev
```

---

## 📊 Priorità Asset da Aggiungere

Se vuoi procedere incrementalmente:

### **Sprint 1** (High Priority - 15 asset)
- **Sector ETF**: XLK, XLE, XLF, XLV (4 asset)
- **Crypto Top**: XRP, DOGE, AVAX, MATIC (4 asset)
- **Bond Duration**: SHY, IEF, VGLT (3 asset)
- **Commodities**: USO, DBA (2 asset)
- **Large Cap**: VOO, IVV (2 asset)

**Totale**: 25 → 40 asset (+60%)

### **Sprint 2** (Medium Priority - 15 asset)
- Resto sector ETF
- Resto crypto top 15
- Resto bond
- Small cap ETF

**Totale**: 40 → 55 asset

### **Sprint 3** (Nice to Have - 17 asset)
- International ETF extra
- Commodities diversified
- Alt crypto

**Totale**: 55 → 72 asset

---

## 🎯 Prossimi Passi

Vuoi che proceda con:

1. **Setup API keys + Script base** (oggi, 2-3 ore)
2. **Testing con 5-10 asset** (domani, mezzo giorno)
3. **Full migration** (dopo testing ok, 1 giorno)

Oppure preferisci un approccio diverso?

---

**Documento creato**: 28 Febbraio 2026
**Prossima review**: Dopo implementazione Phase 1
