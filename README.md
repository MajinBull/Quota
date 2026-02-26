# Portfolio Backtest Platform

Piattaforma web per analizzare e creare wallet diversificati con backtest storico su 20 anni di dati.

## Funzionalità

- **Portfolio Builder**: Costruisci portfolio personalizzati selezionando asset da 5 categorie
- **Backtest Engine**: Simula performance storiche con ribilanciamento automatico
- **Metriche Avanzate**: CAGR, Sharpe Ratio, volatilità, max drawdown
- **Visualizzazione**: Grafici interattivi equity curve e allocazione
- **25 Asset**: ETF, crypto, metalli, bond, real estate

## Setup Rapido

### 1. Scaricare i Dati Storici

```bash
# Installare dipendenze Python
pip install -r requirements.txt

# Scaricare i dati (ultimi 20 anni)
python download_data.py
```

### 2. Avviare l'Applicazione Web

```bash
# Entrare nella cartella frontend
cd frontend

# Installare dipendenze (solo la prima volta)
npm install

# Avviare il dev server
npm run dev
```

Apri il browser su **http://localhost:5173**

## Come Usare

1. **Seleziona Asset**: Scegli tra ETF, crypto, metalli, bond, real estate
2. **Imposta Allocazione**: Assegna percentuali (totale deve essere 100%)
3. **Configura Parametri**: Capitale iniziale e frequenza ribilanciamento
4. **Esegui Backtest**: Clicca sul bottone per vedere i risultati storici
5. **Analizza Risultati**: Visualizza metriche e grafici performance

## Asset Tracciati (25)

### ETF (5)
- **SPY** - S&P 500 (dal 2005)
- **QQQ** - Nasdaq 100 (dal 2005)
- **VTI** - Total US Stock Market (dal 2005)
- **VEA** - Developed Markets ex-US (dal 2007)
- **VWO** - Emerging Markets (dal 2005)

### Crypto (5)
- **BTC-USD** - Bitcoin (dal 2014)
- **ETH-USD** - Ethereum (dal 2017)
- **BNB-USD** - Binance Coin (dal 2017)
- **SOL-USD** - Solana (dal 2020)
- **ADA-USD** - Cardano (dal 2017)

### Metalli (5)
- **GLD** - Gold ETF (dal 2005)
- **SLV** - Silver ETF (dal 2006)
- **PPLT** - Platinum ETF (dal 2010)
- **PALL** - Palladium ETF (dal 2010)
- **COPX** - Copper Miners ETF (dal 2010)

### Bond (5)
- **AGG** - US Aggregate Bonds (dal 2005)
- **TLT** - 20+ Year Treasury (dal 2005)
- **LQD** - Investment Grade Corporate (dal 2005)
- **HYG** - High Yield Corporate (dal 2007)
- **TIP** - Treasury Inflation-Protected (dal 2005)

### Real Estate (5)
- **VNQ** - US Real Estate REIT (dal 2005)
- **VNQI** - International Real Estate (dal 2010)
- **IYR** - US Real Estate (dal 2005)
- **RWO** - Global Real Estate (dal 2008)
- **REET** - Global Real Estate (dal 2014)

## Stack Tecnologico

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (grafici)
- Zustand (state management)
- date-fns (date utilities)

**Backend/Data**
- Python 3 + yfinance
- JSON static files
- No database required

## Metriche Calcolate

- **Rendimento Totale**: Percentuale guadagno/perdita complessiva
- **CAGR**: Compound Annual Growth Rate (rendimento annualizzato)
- **Volatilità**: Deviazione standard annualizzata dei rendimenti
- **Sharpe Ratio**: Rapporto rendimento/rischio
- **Max Drawdown**: Massima perdita da picco a valle
- **Best/Worst Day**: Miglior e peggior giorno singolo

## Struttura Progetto

```
ETF ECC/
├── data/                      # Dati storici JSON
│   ├── etf_historical.json
│   ├── crypto_historical.json
│   ├── metals_historical.json
│   ├── bonds_historical.json
│   ├── real_estate_historical.json
│   └── all_assets.json
├── frontend/                  # Applicazione web
│   ├── src/
│   │   ├── components/        # Componenti React UI
│   │   ├── engine/            # Backtest logic
│   │   ├── stores/            # State management
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   └── App.tsx            # Main app
│   └── public/data/           # Dati accessibili dal browser
├── download_data.py           # Script download dati
└── requirements.txt           # Dipendenze Python
```

## Build per Produzione

```bash
cd frontend
npm run build
```

Il build ottimizzato sarà in `frontend/dist/` - deployabile su Vercel, Netlify, GitHub Pages, ecc.

## Prossimi Sviluppi (Roadmap)

- [ ] Comparazione con benchmark (S&P500, 60/40)
- [ ] Export risultati PDF/CSV
- [ ] Salvataggio portfolio (localStorage)
- [ ] Portfolio optimizer (frontiera efficiente)
- [ ] Scenari "what-if" (crash storici)
- [ ] Costi di transazione simulati
- [ ] Più asset (commodities, forex)
- [ ] Backend per autenticazione utenti
- [ ] Social features (condivisione portfolio)

## Note Importanti

- I risultati storici non garantiscono performance future
- Il backtest assume liquidità infinita (nessuno slippage)
- Non include costi di transazione o tasse
- Dati da Yahoo Finance (potrebbero contenere errori)
- Adatto per scopi educativi e di ricerca

## Licenza

MIT License - Uso libero per scopi personali ed educativi
