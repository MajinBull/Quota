# QUOTA - Portfolio Backtest Platform

🌐 **Live**: [quota.finance](https://quota.finance)

Piattaforma web bilingue (IT/EN) per simulare strategie di investimento con dati storici reali fino a 30+ anni. Analizza come sarebbe andato il tuo portafoglio investendo nel passato.

## 🔗 Quick Links

- 🌐 **App Live**: [quota.finance](https://quota.finance)
- 📊 **GitHub**: [MajinBull/Quota](https://github.com/MajinBull/Quota)
- 📱 **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- 🔥 **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)

## ✨ Funzionalità Principali

- **70+ Asset Disponibili**: ETF (22), crypto (13), commodities (12), bonds (15), real estate (8)
- **Backtest Storici**: Dati reali fino a 30+ anni (SPY dal 1993)
- **Strategie Multiple**: Lump Sum vs PAC (Piano di Accumulo Capitale)
- **Ribilanciamento**: Simulazione ribilanciamento periodico (mensile/trimestrale/annuale)
- **Salvataggio & Confronto**: Salva backtest su cloud e confronta fino a 4 strategie
- **Metriche Avanzate**: Rendimento totale, CAGR, Sharpe Ratio, volatilità, max drawdown
- **Grafici Interattivi**: Equity curve, allocazioni, crescita normalizzata
- **Calcolatore Ribilanciamento**: Calcola vendite/acquisti necessari per ribilanciare
- **i18n**: Interfaccia completamente bilingue italiano/inglese
- **SEO Ottimizzato**: Meta tags dinamici, sitemap, robots.txt

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

## 🛠️ Stack Tecnologico

**Frontend**
- React 19 + TypeScript
- Vite 7.3 (build tool ultra-veloce)
- Tailwind CSS (styling utility-first)
- Recharts (grafici interattivi)
- Zustand (state management)
- react-i18next (internazionalizzazione)
- react-helmet-async (SEO dinamico)
- react-router-dom (routing)

**Backend & Auth**
- Firebase Authentication (Email/Password + Google OAuth)
- Firestore Database (NoSQL cloud, real-time sync)
- Vercel Analytics (web analytics)

**Data & Tools**
- Python 3 + Tiingo/yfinance (data download)
- JSON static files (70+ asset con storico 30+ anni)
- date-fns (date utilities)

**Deployment**
- Vercel (hosting + CI/CD automatico)
- GitHub (version control)
- Domain: quota.finance

## Metriche Calcolate

- **Rendimento Totale**: Percentuale guadagno/perdita complessiva
- **CAGR**: Compound Annual Growth Rate (rendimento annualizzato)
- **Volatilità**: Deviazione standard annualizzata dei rendimenti
- **Sharpe Ratio**: Rapporto rendimento/rischio
- **Max Drawdown**: Massima perdita da picco a valle
- **Best/Worst Day**: Miglior e peggior giorno singolo

## 📁 Struttura Progetto

```
Quota/
├── frontend/                       # Applicazione React
│   ├── src/
│   │   ├── components/             # Componenti UI
│   │   │   ├── auth/               # AuthModal, UserProfileButton, UpgradeModal
│   │   │   ├── SEO.tsx             # Meta tags dinamici
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── PortfolioBuilder.tsx
│   │   │   ├── BacktestResults.tsx
│   │   │   ├── SavedBacktestsView.tsx
│   │   │   ├── ComparisonView.tsx
│   │   │   └── RebalanceModal.tsx
│   │   ├── locales/                # Traduzioni i18n
│   │   │   ├── it/                 # Italiano
│   │   │   │   ├── common.json
│   │   │   │   ├── landing.json
│   │   │   │   ├── app.json
│   │   │   │   ├── auth.json
│   │   │   │   ├── seo.json
│   │   │   │   └── assets.json     # 70 asset descriptions
│   │   │   └── en/                 # English
│   │   │       └── (same structure)
│   │   ├── pages/                  # Route pages
│   │   │   └── LandingPage.tsx
│   │   ├── config/                 # Firebase config
│   │   ├── contexts/               # AuthContext
│   │   ├── engine/                 # Backtest engine logic
│   │   ├── services/               # Firebase services
│   │   ├── stores/                 # Zustand stores
│   │   ├── types/                  # TypeScript interfaces
│   │   ├── utils/                  # Utilities & formatters
│   │   ├── i18n.ts                 # i18next config
│   │   ├── main.tsx                # Entry point
│   │   └── App.tsx                 # Main app component
│   ├── public/
│   │   ├── data/                   # Historical data JSON
│   │   │   ├── etf_historical.json        (23 MB)
│   │   │   ├── crypto_historical.json     (5.7 MB)
│   │   │   ├── commodities_historical.json (9.1 MB)
│   │   │   ├── bonds_historical.json      (12 MB)
│   │   │   ├── real_estate_historical.json (5.8 MB)
│   │   │   └── all_assets.json            (21 MB)
│   │   ├── logo-quota.png          # Favicon
│   │   ├── robots.txt              # SEO
│   │   └── sitemap.xml             # SEO
│   ├── index.html                  # HTML template
│   ├── package.json                # Dependencies
│   └── .npmrc                      # npm config (legacy-peer-deps)
├── data/                           # Local data backup
├── docs/                           # Documentation
├── download_data_v2.py             # Data download script
├── assets_config.py                # 70 asset configuration
├── firestore.rules                 # Firestore security
├── firestore.indexes.json          # Firestore indexes
└── requirements.txt                # Python dependencies
```

## Build per Produzione

```bash
cd frontend
npm run build
```

Il build ottimizzato sarà in `frontend/dist/` - deployabile su Vercel, Netlify, GitHub Pages, ecc.

## 📱 Mobile App (Android)

QUOTA è disponibile anche come **app Android nativa** tramite Capacitor.

### Quick Start Mobile

```bash
cd frontend

# Build APK per test
build-mobile.bat

# APK generato in: android/app/build/outputs/apk/debug/app-debug.apk
```

### Workflow Completo

- **[Development Workflow](DEVELOPMENT-WORKFLOW.md)** - Guida completa sviluppo web + mobile
- **[Play Store Release Checklist](PLAY-STORE-RELEASE-CHECKLIST.md)** - Checklist rilascio ogni 2-3 settimane
- **[Mobile Development Guide](frontend/MOBILE-DEVELOPMENT.md)** - Setup e configurazione mobile

### Differenze Mobile vs Web

| Feature | Web | Android |
|---------|-----|---------|
| Landing page | Mostra marketing | Bypass → app diretta |
| Google Sign-In | Popup browser | SDK nativo Android |
| Deploy | Auto (Vercel) | Manuale (Play Store) |

---

## 🎯 Stato Attuale (Marzo 2026)

✅ **Completato**:
- Deploy production su Vercel
- Firebase Auth + Firestore integrati
- Salvataggio e confronto backtest (fino a 4)
- Ribilanciamento portfolio con calcolatore
- Internazionalizzazione completa IT/EN
- SEO ottimizzato (robots.txt, sitemap.xml, meta tags)
- 70+ asset con dati storici aggiornati
- Grafici interattivi e metriche avanzate
- **🆕 App Android nativa** con Google Sign-In e landing page bypass
- **🆕 Sistema dark/light theme** persistente
- **🆕 Categoria Stocks** con 20 aziende principali

## 🚀 Roadmap Futura

**High Priority**
- [ ] Sistema di pagamenti (Stripe) per piano premium
- [ ] Limiti backtest per piano free vs premium
- [ ] Custom domain definitivo
- [ ] Export risultati PDF/CSV
- [ ] Comparazione con benchmark (S&P500, All Weather)

**Medium Priority**
- [ ] Portfolio optimizer (frontiera efficiente)
- [ ] Scenari "what-if" su crash storici (2008, 2020)
- [ ] Simulazione costi di transazione
- [ ] Notifiche email per ribilanciamento
- [ ] Dashboard analytics avanzate

**Low Priority**
- [ ] Social features (condivisione portfolio pubblici)
- [ ] API pubblica per backtest
- [ ] iOS app (Capacitor)
- [ ] Più asset (forex, futures, azioni singole)

## ⚠️ Disclaimer & Note Importanti

**Disclaimer Finanziario**:
- I risultati storici **non garantiscono** performance future
- Il backtest assume liquidità infinita (nessuno slippage)
- **Non include** costi di transazione, commissioni o tasse
- Questo strumento è per **scopi educativi e di ricerca**
- Non costituisce consulenza finanziaria

**Note Tecniche**:
- Dati da Tiingo/Yahoo Finance (possibili errori o gap)
- Ribilanciamento simulato senza considerare spread bid-ask
- Dividendi reinvestiti automaticamente
- Firebase richiede registrazione per salvare backtest
- Ultimo aggiornamento dati: 27 febbraio 2026

## Licenza

MIT License - Uso libero per scopi personali ed educativi
