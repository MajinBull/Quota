# Portfolio Backtest Platform

Piattaforma web per analizzare e creare wallet diversificati con backtest storico su 20 anni di dati.

## Funzionalità

- **Portfolio Builder**: Costruisci portfolio personalizzati selezionando asset da 5 categorie
- **Backtest Engine**: Simula performance storiche con ribilanciamento automatico
- **Metriche Avanzate**: CAGR, Sharpe Ratio, volatilità, max drawdown
- **Visualizzazione**: Grafici interattivi equity curve e allocazione
- **70 Asset**: ETF (22), crypto (13), commodities (12), bond (15), real estate (8)

## Setup Rapido

### 1. Scaricare i Dati Storici

```bash
# Installare dipendenze Python
pip install -r requirements.txt

# Scaricare i dati (ultimi 20 anni) - 70 asset da Tiingo/yfinance
python download_data_v2.py --full

# Oppure update incrementale (se già scaricati)
python download_data_v2.py --update
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

## Documentazione

La documentazione è organizzata in `docs/` per argomento.

### 📊 Stato Progetto

**⭐ INIZIA DA QUI**: [Project Status](docs/PROJECT_STATUS.md) - Stato attuale completo (deployato, funzionalità, roadmap)

### 🚀 Setup & Deployment
- **[Quick Start](docs/setup/QUICK_START.md)** - Inizia in 5 minuti (Firebase + Dev Server)
- **[Firebase Setup Guide](docs/setup/FIREBASE_SETUP_GUIDE.md)** - Configurazione Firebase Auth & Firestore
- **[Deploy to Production](docs/setup/DEPLOY_TO_PRODUCTION.md)** - Deploy su Vercel step-by-step

### 🛠️ Development
- **[Workflow Sviluppo](docs/development/PIANO_WORKFLOW_SVILUPPO.md)** - Git workflow, deploy continuo, best practices
- **[Testing Checklist](docs/development/TESTING_CHECKLIST.md)** - Test completi (11 fasi) per Firebase integration
- **[Troubleshooting Adblocker](docs/development/TROUBLESHOOTING_ADBLOCKER.md)** - Fix problemi con adblocker

### 🏗️ Architecture
- **[Backend Architecture Guide](docs/architecture/ARCHITECTURE_BACKEND_GUIDE.md)** - Architettura serverless, Firebase vs Backend custom
- **[Implementation Summary](docs/architecture/IMPLEMENTATION_SUMMARY.md)** - Riepilogo implementazione Firebase Auth + Firestore

### 📋 Planning
- **[Piano Deployment](docs/planning/PIANO_DEPLOYMENT.md)** - Strategia deployment Vercel + GitHub
- **[Piano Feature Future](docs/planning/PIANO_FEATURE_FUTURE.md)** - Roadmap auth, pagamenti, monetizzazione (Stripe)
- **[Platform Analysis](docs/planning/portfolio_platform_analysis.md)** - Analisi iniziale piattaforma

## Asset Tracciati (70)

### ETF (22)

#### Large Cap US (8)
- **SPY** - SPDR S&P 500 ETF
- **QQQ** - Invesco QQQ (Nasdaq 100)
- **VTI** - Vanguard Total Stock Market
- **VOO** - Vanguard S&P 500
- **IVV** - iShares Core S&P 500
- **SPLG** - SPDR Portfolio S&P 500
- **DIA** - SPDR Dow Jones Industrial
- **VTV** - Vanguard Value ETF

#### Small/Mid Cap US (3)
- **IWM** - iShares Russell 2000 (small cap)
- **VB** - Vanguard Small-Cap
- **IJH** - iShares Core S&P Mid-Cap

#### International (4)
- **VEA** - Vanguard Developed Markets
- **VWO** - Vanguard Emerging Markets
- **EFA** - iShares MSCI EAFE
- **IEFA** - iShares Core MSCI EAFE

#### Sector ETF (7)
- **XLK** - Technology Select Sector
- **XLE** - Energy Select Sector
- **XLF** - Financial Select Sector
- **XLV** - Health Care Select Sector
- **XLI** - Industrial Select Sector
- **XLP** - Consumer Staples Select Sector
- **XLY** - Consumer Discretionary Select Sector

### Crypto (13)
- **BTC-USD** - Bitcoin
- **ETH-USD** - Ethereum
- **BNB-USD** - Binance Coin
- **SOL-USD** - Solana
- **ADA-USD** - Cardano
- **XRP-USD** - Ripple
- **DOGE-USD** - Dogecoin
- **TRX-USD** - Tron
- **AVAX-USD** - Avalanche
- **MATIC-USD** - Polygon
- **LINK-USD** - Chainlink
- **DOT-USD** - Polkadot
- **ATOM-USD** - Cosmos

### Commodities (12)

#### Precious Metals (5)
- **GLD** - SPDR Gold Shares
- **SLV** - iShares Silver Trust
- **PPLT** - Aberdeen Platinum Shares
- **PALL** - Aberdeen Palladium Shares
- **IAU** - iShares Gold Trust

#### Industrial Metals (2)
- **COPX** - Global X Copper Miners
- **CPER** - United States Copper Index

#### Energy (2)
- **USO** - United States Oil Fund
- **UNG** - United States Natural Gas Fund

#### Agriculture (2)
- **DBA** - Invesco DB Agriculture Fund
- **CORN** - Teucrium Corn Fund

#### Diversified (1)
- **DBC** - Invesco DB Commodity Index

### Bond (15)

#### Total Market (5)
- **AGG** - iShares Core US Aggregate Bond
- **BND** - Vanguard Total Bond Market
- **VTEB** - Vanguard Tax-Exempt Bond
- **TLT** - iShares 20+ Year Treasury
- **TIP** - iShares TIPS Bond

#### Duration-Specific Treasuries (4)
- **SHY** - iShares 1-3 Year Treasury
- **IEF** - iShares 7-10 Year Treasury
- **VGIT** - Vanguard Intermediate-Term Treasury
- **VGLT** - Vanguard Long-Term Treasury

#### Corporate Bonds (4)
- **LQD** - iShares Investment Grade Corporate
- **HYG** - iShares High Yield Corporate
- **VCSH** - Vanguard Short-Term Corporate
- **VCIT** - Vanguard Intermediate-Term Corporate

#### International/EM (2)
- **BNDX** - Vanguard Total International Bond
- **EMB** - iShares JP Morgan EM USD Bond

### Real Estate (8)

#### US REIT (6)
- **VNQ** - Vanguard Real Estate ETF
- **IYR** - iShares US Real Estate
- **XLRE** - Real Estate Select Sector SPDR
- **SCHH** - Schwab US REIT ETF
- **USRT** - iShares Core US REIT
- **RWO** - SPDR Dow Jones Global Real Estate

#### International REIT (2)
- **VNQI** - Vanguard Global ex-US Real Estate
- **IFGL** - iShares International Developed Real Estate

## Stack Tecnologico

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (grafici)
- Zustand (state management)
- date-fns (date utilities)

**Backend/Data**
- Firebase Auth (Email + Google OAuth)
- Firestore Database (NoSQL cloud)
- Python 3 + Tiingo/yfinance (data download)
- JSON static files (historical data)

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
├── docs/                      # Documentazione tecnica
│   ├── setup/                 # Guide setup & deployment
│   ├── development/           # Workflow sviluppo & testing
│   ├── architecture/          # Documentazione architettura
│   └── planning/              # Roadmap & piani futuri
├── frontend/                  # Applicazione web
│   ├── src/
│   │   ├── components/        # Componenti React UI
│   │   ├── config/            # Firebase config
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── engine/            # Backtest logic
│   │   ├── services/          # Firebase services
│   │   ├── stores/            # State management
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   └── App.tsx            # Main app
│   └── public/data/           # Dati accessibili dal browser
├── download_data_v2.py        # Script download dati (Tiingo + yfinance fallback)
├── assets_config.py           # Configurazione 70 asset con metadata
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Firestore indexes config
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
