# 🔄 Incremental Data Update Strategy

**Obiettivo**: Aggiornare i dati ogni 2 settimane scaricando SOLO le nuove candele (non tutto lo storico).

**Ultimo aggiornamento**: 28 Febbraio 2026

---

## 📊 Strategia Update Incrementale

### Concetto Base

```
┌─────────────────────────────────────────────────────┐
│ PRIMO DOWNLOAD (Full Historical)                   │
│ python download_data_v2.py --full                   │
│                                                     │
│ Scarica: 2005-01-01 → 2026-02-28 (20 anni)         │
│ Output: etf_historical.json (5000+ candles/asset)  │
└─────────────────────────────────────────────────────┘

          ⏱️ 2 settimane dopo...

┌─────────────────────────────────────────────────────┐
│ UPDATE INCREMENTALE                                 │
│ python download_data_v2.py --update                 │
│                                                     │
│ 1. Legge ultimo data point nei file esistenti      │
│    → "2026-02-28"                                   │
│                                                     │
│ 2. Scarica SOLO nuovi dati                         │
│    → 2026-03-01 → 2026-03-14 (10 candles)          │
│                                                     │
│ 3. Mergia con dati esistenti                       │
│    → existing_data + new_data                      │
│                                                     │
│ 4. Salva file aggiornato                           │
│    → etf_historical.json (5010 candles/asset)      │
└─────────────────────────────────────────────────────┘
```

**Risultato**: Scarichi solo 10 candles invece di 5000+ ✅

---

## 🛠️ Implementazione Tecnica

### 1. Struttura Dati JSON (Attuale)

```json
{
  "SPY": {
    "symbol": "SPY",
    "category": "etf",
    "start_date": "2005-01-01",
    "end_date": "2026-02-28",
    "data_points": 5289,
    "candles": [
      {
        "date": "2005-01-03",
        "open": 118.57,
        "high": 119.08,
        "low": 118.12,
        "close": 118.73,
        "volume": 123456789
      },
      // ... 5288 altre candele
      {
        "date": "2026-02-28",
        "open": 520.45,
        "high": 525.30,
        "low": 518.90,
        "close": 523.15,
        "volume": 98765432
      }
    ]
  }
}
```

### 2. Algoritmo Update Incrementale

```python
def update_incremental(symbol, category):
    """
    Aggiorna i dati di un asset scaricando solo le nuove candele
    """

    # STEP 1: Leggi dati esistenti
    existing_data = load_existing_data(category, symbol)

    if not existing_data:
        # Nessun dato esistente → full download
        return download_full_historical(symbol, category)

    # STEP 2: Trova ultima data disponibile
    last_date = existing_data['end_date']  # es: "2026-02-28"
    today = datetime.now().strftime("%Y-%m-%d")  # es: "2026-03-14"

    # STEP 3: Calcola data di inizio download (giorno dopo l'ultimo)
    start_date = (datetime.strptime(last_date, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    # start_date = "2026-03-01"

    # STEP 4: Se siamo già aggiornati, skip
    if start_date >= today:
        print(f"  ✓ {symbol} già aggiornato ({last_date})")
        return existing_data

    print(f"  → {symbol}: downloading {start_date} to {today}")

    # STEP 5: Scarica SOLO nuove candele
    new_candles = download_range(symbol, start_date, today)

    if not new_candles:
        print(f"  ⚠ No new data for {symbol}")
        return existing_data

    # STEP 6: Mergia dati
    updated_data = {
        "symbol": symbol,
        "category": category,
        "start_date": existing_data['start_date'],  # Mantiene start originale
        "end_date": today,  # Aggiorna end date
        "data_points": len(existing_data['candles']) + len(new_candles),
        "candles": existing_data['candles'] + new_candles  # Append
    }

    print(f"  ✓ {symbol}: +{len(new_candles)} candles ({last_date} → {today})")

    return updated_data
```

---

## 📡 API Calls per Update

### Polygon.io - Incremental Download

```python
import requests

def download_polygon_incremental(symbol, start_date, end_date):
    """
    Scarica dati incrementali da Polygon

    Args:
        symbol: es. "SPY"
        start_date: es. "2026-03-01"
        end_date: es. "2026-03-14"
    """

    url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/1/day/{start_date}/{end_date}"
    params = {
        'apiKey': POLYGON_API_KEY,
        'adjusted': 'true',  # Split/dividend adjusted
        'sort': 'asc'
    }

    response = requests.get(url, params=params)
    data = response.json()

    if data['status'] != 'OK' or not data.get('results'):
        return []

    # Converti formato Polygon → nostro formato
    candles = []
    for bar in data['results']:
        candle = {
            'date': datetime.fromtimestamp(bar['t'] / 1000).strftime('%Y-%m-%d'),
            'open': round(bar['o'], 2),
            'high': round(bar['h'], 2),
            'low': round(bar['l'], 2),
            'close': round(bar['c'], 2),
            'volume': int(bar['v'])
        }
        candles.append(candle)

    return candles
```

**API Call Example**:
```
GET https://api.polygon.io/v2/aggs/ticker/SPY/range/1/day/2026-03-01/2026-03-14
  ?adjusted=true
  &apiKey=YOUR_KEY

Response:
{
  "status": "OK",
  "results": [
    {
      "t": 1709251200000,  // timestamp (milliseconds)
      "o": 520.45,         // open
      "h": 525.30,         // high
      "l": 518.90,         // low
      "c": 523.15,         // close
      "v": 98765432        // volume
    },
    // ... 9 altre candele (10 trading days in 2 weeks)
  ]
}
```

---

### CoinGecko - Incremental Download

```python
from pycoingecko import CoinGeckoAPI

def download_coingecko_incremental(coin_id, start_date, end_date):
    """
    Scarica dati crypto incrementali da CoinGecko

    Args:
        coin_id: es. "bitcoin" (non "BTC-USD")
        start_date: es. "2026-03-01"
        end_date: es. "2026-03-14"
    """

    cg = CoinGeckoAPI()

    # Converti date a Unix timestamp
    start_timestamp = int(datetime.strptime(start_date, '%Y-%m-%d').timestamp())
    end_timestamp = int(datetime.strptime(end_date, '%Y-%m-%d').timestamp())

    # API call
    data = cg.get_coin_market_chart_range(
        id=coin_id,
        vs_currency='usd',
        from_timestamp=start_timestamp,
        to_timestamp=end_timestamp
    )

    # CoinGecko ritorna array: [[timestamp, price], ...]
    # Converti in daily candles
    candles = []
    prices_by_date = {}

    # Raggruppa per giorno (CoinGecko dà dati ogni ~5 minuti)
    for timestamp_ms, price in data['prices']:
        date = datetime.fromtimestamp(timestamp_ms / 1000).strftime('%Y-%m-%d')
        if date not in prices_by_date:
            prices_by_date[date] = []
        prices_by_date[date].append(price)

    # Crea OHLC da prezzi intraday
    for date in sorted(prices_by_date.keys()):
        prices = prices_by_date[date]
        candle = {
            'date': date,
            'open': round(prices[0], 2),
            'high': round(max(prices), 2),
            'low': round(min(prices), 2),
            'close': round(prices[-1], 2),
            'volume': 0  # CoinGecko free tier non ha volume dettagliato
        }
        candles.append(candle)

    return candles
```

**Mapping Symbol → CoinGecko ID**:
```python
COINGECKO_ID_MAP = {
    'BTC-USD': 'bitcoin',
    'ETH-USD': 'ethereum',
    'BNB-USD': 'binancecoin',
    'SOL-USD': 'solana',
    'ADA-USD': 'cardano',
    'XRP-USD': 'ripple',
    'DOGE-USD': 'dogecoin',
    'AVAX-USD': 'avalanche-2',
    'MATIC-USD': 'matic-network',
    'LINK-USD': 'chainlink',
    'DOT-USD': 'polkadot',
    'ATOM-USD': 'cosmos',
    'USDT-USD': 'tether',
    'USDC-USD': 'usd-coin',
    'TRX-USD': 'tron'
}
```

---

## 🔄 Workflow Completo

### Primo Download (Full Historical)

```bash
# 1. Setup API keys
export POLYGON_API_KEY="your_key_here"

# 2. Download storico completo (20 anni)
python download_data_v2.py --full

# Output:
# Downloading ETF data...
#   SPY: 2005-01-01 → 2026-02-28 (5289 candles) ✓
#   QQQ: 2005-01-01 → 2026-02-28 (5289 candles) ✓
#   ...
#
# Downloading Crypto data...
#   BTC-USD: 2014-09-17 → 2026-02-28 (4182 candles) ✓
#   ...
#
# Saved: data/etf_historical.json (15.2 MB)
# Saved: data/crypto_historical.json (8.4 MB)
# ...
#
# Total time: 18 minutes
# API calls: 72 (1 per asset)
```

---

### Update Incrementale (2 settimane dopo)

```bash
# Esegui dopo 2 settimane
python download_data_v2.py --update

# Output:
# Checking for updates...
#
# ETF:
#   SPY: last date 2026-02-28, downloading 2026-03-01 → 2026-03-14 (+10 candles) ✓
#   QQQ: last date 2026-02-28, downloading 2026-03-01 → 2026-03-14 (+10 candles) ✓
#   VOO: last date 2026-02-28, downloading 2026-03-01 → 2026-03-14 (+10 candles) ✓
#   ...
#
# Crypto:
#   BTC-USD: last date 2026-02-28, downloading 2026-03-01 → 2026-03-14 (+14 candles) ✓
#   (crypto ha 7 giorni/settimana, non 5 come stocks)
#   ...
#
# Updated: data/etf_historical.json (+200 candles total)
# Updated: data/crypto_historical.json (+210 candles total)
# ...
#
# Total time: 2 minutes (vs 18 minuti full download)
# API calls: 72 (1 per asset, solo date range piccolo)
```

---

## ⏱️ Tempo di Download Comparison

| Scenario | Asset | Candles/Asset | API Calls | Tempo Totale |
|----------|-------|---------------|-----------|--------------|
| **Full Download (20 anni)** | 72 | ~5000 | 72 | ~18 min |
| **Update 2 settimane** | 72 | ~10 | 72 | ~2 min |
| **Update 1 mese** | 72 | ~20 | 72 | ~2 min |
| **Update 3 mesi** | 72 | ~60 | 72 | ~3 min |

**Rate Limit Polygon**: 5 calls/min = 72 asset in ~15 minuti
- In realtà più veloce perché puoi fare batch requests

---

## 📝 Script Commands

### download_data_v2.py

```python
"""
Enhanced data downloader with incremental update support

Usage:
  python download_data_v2.py --full          # Full historical download (20 years)
  python download_data_v2.py --update        # Incremental update (only new data)
  python download_data_v2.py --test SPY      # Test single asset
  python download_data_v2.py --validate      # Validate existing data quality
"""

import argparse

def main():
    parser = argparse.ArgumentParser(description='Download historical asset data')
    parser.add_argument('--full', action='store_true', help='Full historical download')
    parser.add_argument('--update', action='store_true', help='Incremental update')
    parser.add_argument('--test', type=str, help='Test single asset (symbol)')
    parser.add_argument('--validate', action='store_true', help='Validate data quality')

    args = parser.parse_args()

    if args.full:
        download_full_historical()
    elif args.update:
        update_incremental_all()
    elif args.test:
        test_single_asset(args.test)
    elif args.validate:
        validate_data_quality()
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
```

---

## 🔧 Funzioni Helper

### Load Existing Data

```python
def load_existing_data(category, symbol):
    """
    Carica dati esistenti da file JSON

    Returns:
        dict | None: Dati esistenti o None se non presenti
    """
    filepath = f"data/{category}_historical.json"

    if not os.path.exists(filepath):
        return None

    try:
        with open(filepath, 'r') as f:
            data = json.load(f)

        return data.get(symbol)

    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None
```

### Save Updated Data

```python
def save_updated_data(category, symbol, updated_data):
    """
    Salva dati aggiornati mantenendo gli altri asset nella stessa categoria
    """
    filepath = f"data/{category}_historical.json"

    # Carica file esistente
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            all_data = json.load(f)
    else:
        all_data = {}

    # Aggiorna solo questo asset
    all_data[symbol] = updated_data

    # Salva
    with open(filepath, 'w') as f:
        json.dump(all_data, f, indent=2)

    print(f"  ✓ Saved {filepath}")
```

### Data Validation

```python
def validate_data_continuity(candles):
    """
    Controlla che non ci siano gap nei dati (esclusi weekend)

    Returns:
        list: Lista di gap trovati (date mancanti)
    """
    gaps = []

    for i in range(len(candles) - 1):
        current_date = datetime.strptime(candles[i]['date'], '%Y-%m-%d')
        next_date = datetime.strptime(candles[i+1]['date'], '%Y-%m-%d')

        # Calcola giorni lavorativi tra le due date
        expected_next = current_date
        while True:
            expected_next += timedelta(days=1)
            # Skip weekends
            if expected_next.weekday() < 5:  # 0-4 = Mon-Fri
                break

        # Se la prossima data è diversa da quella attesa, c'è un gap
        if next_date > expected_next:
            gaps.append({
                'after': candles[i]['date'],
                'before': candles[i+1]['date'],
                'days_missing': (next_date - expected_next).days
            })

    return gaps
```

---

## 🚀 Automation con GitHub Actions

### Workflow Automatico Ogni 2 Settimane

```yaml
# .github/workflows/update-data.yml
name: Update Historical Data

on:
  schedule:
    # Every 2 weeks on Monday at 3am UTC
    - cron: '0 3 * * 1/2'

  workflow_dispatch:  # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Update data
        env:
          POLYGON_API_KEY: ${{ secrets.POLYGON_API_KEY }}
        run: |
          python download_data_v2.py --update

      - name: Copy to frontend
        run: |
          cp data/*.json frontend/public/data/

      - name: Check for changes
        id: git-check
        run: |
          git diff --exit-code frontend/public/data/ || echo "changed=true" >> $GITHUB_OUTPUT

      - name: Commit and push
        if: steps.git-check.outputs.changed == 'true'
        run: |
          git config user.name "GitHub Actions Bot"
          git config user.email "actions@github.com"
          git add frontend/public/data/
          git commit -m "chore: update historical data ($(date +%Y-%m-%d))"
          git push
```

**Configurazione**:
1. GitHub → Settings → Secrets → New secret
2. Nome: `POLYGON_API_KEY`
3. Valore: la tua Polygon API key

**Risultato**:
- Ogni 2 settimane, alle 3am del lunedì, GitHub Actions:
  1. Scarica solo i nuovi dati (ultimi 14 giorni)
  2. Aggiorna i file JSON
  3. Committa e pusha automaticamente
  4. Vercel fa auto-deploy
- **Tempo**: ~2-3 minuti totali
- **API Calls**: 72 (gratis con Polygon free tier)

---

## 📊 Data Quality Checks

Durante l'update incrementale, validare:

```python
def validate_incremental_update(existing_data, new_candles):
    """
    Valida che i nuovi dati siano coerenti con quelli esistenti
    """

    checks = {
        'continuity': True,
        'no_duplicates': True,
        'price_sanity': True,
        'warnings': []
    }

    last_existing = existing_data['candles'][-1]
    first_new = new_candles[0]

    # Check 1: No gap tra ultimo esistente e primo nuovo
    last_date = datetime.strptime(last_existing['date'], '%Y-%m-%d')
    first_date = datetime.strptime(first_new['date'], '%Y-%m-%d')

    business_days_between = np.busday_count(last_date, first_date)

    if business_days_between > 1:
        checks['continuity'] = False
        checks['warnings'].append(f"Gap: {business_days_between - 1} business days missing")

    # Check 2: No duplicati di date
    existing_dates = {c['date'] for c in existing_data['candles']}
    new_dates = {c['date'] for c in new_candles}

    duplicates = existing_dates & new_dates
    if duplicates:
        checks['no_duplicates'] = False
        checks['warnings'].append(f"Duplicate dates: {duplicates}")

    # Check 3: Price sanity (no spike > 50% in 1 day)
    last_close = last_existing['close']
    first_open = first_new['open']

    change_pct = abs((first_open - last_close) / last_close) * 100

    if change_pct > 50:
        checks['price_sanity'] = False
        checks['warnings'].append(f"Suspicious price jump: {change_pct:.1f}%")

    return checks
```

---

## ✅ Checklist Update Incrementale

Quando esegui update ogni 2 settimane:

- [ ] Esegui `python download_data_v2.py --update`
- [ ] Controlla log per errori
- [ ] Verifica `data/update_report.json`:
  - [ ] Numero asset aggiornati
  - [ ] Candles aggiunte per asset
  - [ ] Eventuali warnings
- [ ] Copia dati aggiornati: `cp data/*.json frontend/public/data/`
- [ ] Test locale: `cd frontend && npm run dev`
- [ ] Commit e push: auto-deploy su Vercel

---

## 🎯 Vantaggi Update Incrementale

| Aspetto | Full Download | Incremental Update |
|---------|---------------|-------------------|
| **Tempo** | 18 minuti | 2 minuti |
| **API Calls** | 72 × 5000 candles | 72 × 10 candles |
| **Bandwidth** | ~50 MB raw data | ~0.5 MB raw data |
| **Risk** | Sovrascrive tutto | Solo append |
| **Rollback** | Perdi tutto se fallisce | Mantieni storico |

---

## 🔐 Backup Strategy

Prima di ogni update:

```bash
# Automatic backup before update
python download_data_v2.py --update --backup

# Crea backup automatico:
# data/backups/2026-03-14_pre-update/
#   ├── etf_historical.json
#   ├── crypto_historical.json
#   └── ...
```

Se l'update va male:

```bash
# Rollback to backup
python download_data_v2.py --rollback 2026-03-14_pre-update
```

---

## 📝 Summary

### Come Funziona Update Incrementale

1. **Leggi ultima data** nei file esistenti
2. **Scarica solo nuove candele** da quella data ad oggi
3. **Mergia** nuovi dati con storico (append)
4. **Salva** file aggiornati
5. **Valida** qualità dati

### Quando Eseguire Update

- **Manuale**: Ogni 2 settimane con `python download_data_v2.py --update`
- **Automatico**: GitHub Actions ogni lunedì (ogni 2 settimane)

### Tempo & Costi

- **Tempo**: 2-3 minuti (vs 18 minuti full)
- **API Calls**: 72 (gratis con Polygon)
- **Rischio**: Minimo (solo append, backup automatico)

---

**Prossimo Step**: Implementare `download_data_v2.py` con supporto `--update`

