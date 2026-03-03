# Portfolio Intelligence Platform
## Analisi di Mercato & Business Case

> Backtest · Analisi Multi-Asset · Proiezioni AI · Dashboard Interattiva  
> Febbraio 2025 | Documento Riservato

---

## Executive Summary

Il mercato globale degli strumenti di analisi e backtesting di portafogli di investimento rappresenta un'opportunità concreta e in forte crescita. La convergenza tra crescente alfabetizzazione finanziaria dei retail investor, democratizzazione degli asset alternativi (ETF tematici, crypto, REITs globali) e la mancanza di piattaforme realmente user-friendly per il pubblico europeo crea uno spazio di mercato significativo.

| Mercato Backtesting Software 2025 | Fintech SaaS Global Market | CAGR Mercato di Riferimento | Retail Investor EU crescita annua |
|---|---|---|---|
| $444M → $687M entro il 2030 | $320B → $725B entro il 2030 | +9.2% / anno backtest tools | +18% YoY post-COVID |

---

## 1. Analisi del Mercato

### 1.1 Il Problema: Gap di Mercato Reale

La stragrande maggioranza degli strumenti di analisi portafoglio esistenti soffre di uno o più dei seguenti problemi critici:

| Strumento esistente | Limite principale | Cosa manca |
|---|---|---|
| Portfolio Visualizer | Solo USA, no crypto, UI anni '90 | Asset globali, design moderno |
| Curvo (Backtest EU) | Solo ETF europei, no metalli/crypto/REITs | Multi-asset class reale |
| TradingView | Pensato per trader attivi, non investitori DCA | Visione long-term, DCA, proiezioni 30yr |
| QuantConnect | Richiede coding, target sviluppatori | No-code, user-friendly per retail |
| Robo-advisor (Moneyfarm ecc.) | Black box, nessuna personalizzazione | Controllo completo, educativo, trasparente |

### 1.2 Il Target: Chi Compra

Esistono tre segmenti di utenza distinti, ciascuno con bisogni e disponibilità di spesa diverse:

| Segmento | Profilo | Dimensione EU | Willingness to Pay |
|---|---|---|---|
| **Retail Investor** | 25-45 anni, investitore DIY, segue ETF e crypto, usa app come Trade Republic / Scalable. Vuole capire dove mette i soldi senza affidarsi a un consulente. | ~12 milioni (e in crescita) | €5–15/mese (freemium) |
| **Semi-Pro / Appassionati** | Blogger finanziari, YouTuber, community r/Boglehead, gestori di portafogli familiari. Necessitano di dati accurati e strumenti avanzati (Monte Carlo, Sharpe ratio, correlazioni). | ~2 milioni EU | €20–50/mese o annuale |
| **B2B: Consulenti & Fintech** | Consulenti finanziari indipendenti, family office, fintech che vogliono embedded analytics. Necessità di white-labeling, API, report PDF branded. | ~150.000 IFA in Europa | €200–1.000/mese per seat |

---

## 2. Il Prodotto: Cosa Costruire

### 2.1 Funzionalità Core (MVP)

| Feature | Descrizione | Priorità |
|---|---|---|
| **Backtest Multi-Asset** | ETF globali, oro, argento, alluminio, BTC, ETH, REITs, healthcare, sanità. DCA settimanale/mensile, ribilanciamento automatico. | `MVP` |
| **Proiezione Monte Carlo** | Simulazione scenari conservativo/base/ottimista su 10-40 anni. 1000+ simulazioni. Percentili 10/50/90. | `MVP` |
| **Dashboard Interattiva** | Grafici in tempo reale, drag-and-drop allocazione, toggle asset, metriche avanzate: CAGR, Sharpe, Max Drawdown, Sortino. | `MVP` |
| **Breakdown Geografico** | Analisi della concentrazione geografica reale del portafoglio (es. warning se >50% USA). Heatmap regionale. | `MVP` |
| **Analisi Driver Storici** | Contestualizzazione eventi macroeconomici: perché oro +25% nel 2020, cosa ha causato il crash crypto del 2022, impatto Fed sui REITs. | `V1.1` |
| **AI Portfolio Advisor** | Suggerimento automatico di allocazione basato su profilo rischio, orizzonte temporale, obiettivo finanziario. Powered by LLM. | `V2.0` |
| **Report PDF Brandato** | Export professionale con analisi completa, adatto per consulenti che lo condividono con i propri clienti. | `V1.1` |
| **API & White Label** | Integrazione per fintech e consulenti. Widget embeddabile. Personalizzazione branding completa. | `V2.0` |

### 2.2 Vantaggio Competitivo Chiave

- **UX** — Design moderno e intuitivo pensato per il retail europeo, non per sviluppatori o trader professionisti. Onboarding in 2 minuti, risultati visibili immediatamente.
- **EU** — Focus sul mercato europeo: ETF UCITS, valuta EUR, normativa MiFID II, asset classi rilevanti per l'investitore italiano/europeo (STOXX, EPRA, MSCI ex-USA).
- **AI** — AI advisor integrato che contestualizza i dati storici e suggerisce ottimizzazioni — non un robo-advisor black-box, ma uno strumento educativo trasparente.
- **OPN** — Dati e metodologia trasparenti. Nessun algoritmo opaco. L'utente capisce perché il portafoglio si è comportato in un certo modo.

---

## 3. Modello di Business

### 3.1 Struttura Prezzi (Freemium + SaaS)

| Feature | FREE | STARTER €9/mese | PRO €29/mese | BUSINESS €199/mese |
|---|---|---|---|---|
| Backtest storico | ✓ (5 anni) | ✓ (20 anni) | ✓ (illimitato) | ✓ + custom data |
| Asset classes | ETF + Oro | Tutti (12+) | Tutti + custom | Tutti + API |
| Monte Carlo | 3 scenari | 10 scenari | Illimitato | Illimitato |
| Portafogli salvati | 1 | 5 | Illimitati | Illimitati |
| Export PDF/CSV | — | ✓ | ✓ branded | ✓ white-label |
| AI Advisor | — | Base | Avanzato | Custom |
| API Access | — | — | — | ✓ full REST |
| Supporto | Community | Email | Priority | Dedicato |

### 3.2 Proiezione Ricavi (Caso Base)

Assunzioni conservative: mercato target iniziale Italia + Europa occidentale. Conversione free→paid 3–5%. Churn mensile <4%. Crescita organica + content marketing SEO.

| | Anno 1 | Anno 2 | Anno 3 | Anno 5 |
|---|---|---|---|---|
| Utenti gratuiti | 2.000 | 12.000 | 40.000 | 150.000 |
| Utenti paganti | 80 | 600 | 2.400 | 10.000 |
| Starter (€9) | 50 | 350 | 1.400 | 5.500 |
| Pro (€29) | 25 | 220 | 850 | 3.800 |
| Business (€199) | 5 | 30 | 150 | 700 |
| **MRR (€)** | **~€1.800** | **~€16.000** | **~€67.000** | **~€280.000** |
| **ARR (€)** | **~€21.600** | **~€192.000** | **~€800.000** | **~€3.36M** |

> 💡 A 10.000 utenti paganti con ARPU medio €30/mese = €3.6M ARR. Con multipli SaaS fintech 2025 di 6–7x revenue, la valutazione potenziale è €20–25M. Breakeven stimato tra Anno 2 e Anno 3.

---

## 4. Analisi Competitiva

### 4.1 Mappa Competitor

| Competitor | Multi-Asset | UI/UX | Europa focus | Long-term DCA | Gap vs nostra piattaforma |
|---|---|---|---|---|---|
| Portfolio Visualizer | Parziale | ⭐⭐ | No (USA) | Sì | No crypto, no EU ETF, UI datata |
| Curvo.eu | No | ⭐⭐⭐ | Sì (IT/EU) | Sì | Solo ETF UCITS, niente metalli/crypto/REITs |
| TradingView | Sì | ⭐⭐⭐⭐⭐ | Parziale | No | Trader-focused, no DCA, no proiezioni 30yr |
| Morningstar | Sì | ⭐⭐⭐ | Sì | No | Costo elevato, target istituzionale |
| Moneyfarm/Robo | Sì | ⭐⭐⭐⭐ | Sì | Sì | Black box, nessun controllo, no backtest |
| **NOSTRA PIATTAFORMA** | **Sì ✓** | **⭐⭐⭐⭐⭐** | **Sì ✓** | **Sì ✓** | **L'unica che combina tutto per il retail EU** |

---

## 5. Go-To-Market Strategy

### 5.1 Fase 1: Lancio e Trazione (Mesi 1–6)

- Rilascio MVP gratuito con backtest ETF + oro + BTC su orizzonte 10 anni
- Content marketing: articoli SEO su "come fare backtest portafoglio", "ETF vs oro storico"
- Partnership con community finanziarie italiane (Mr. RIP, Finanza Cafona, Telegram groups)
- YouTube: video tutorial che usano la piattaforma su casi reali (es. portafoglio pigro Boglehead)
- Product Hunt launch, Reddit r/eupersonalfinance, r/ItaliaPersonalFinance

### 5.2 Fase 2: Monetizzazione (Mesi 7–18)

- Introduzione piani paganti con feature gate strategico (dati storici lunghi, Monte Carlo avanzato)
- Campagna email drip per conversione free→paid
- Integrazione con broker popolari EU (Trade Republic, Scalable Capital, Degiro) via API importazione
- Lancio funzionalità AI advisor per piano Pro
- Espansione linguistica: IT → DE → FR → ES → NL

### 5.3 Fase 3: Scale & B2B (Mesi 19–36)

- White-label per IFA (Independent Financial Advisors) e family office
- Integrazione API con piattaforme fintech europee
- Possibile fundraising Seed/Serie A per accelerare crescita Europa
- Lancio report automatici e newsletter personalizzata per utenti Pro

---

## 6. Rischi e Mitigazioni

| Rischio | Impatto | Probabilità | Mitigazione |
|---|---|---|---|
| Regolamentazione MiFID II / ESMA sui tool di simulazione | Alto | Media | Disclaimer chiari, no consulenza finanziaria, solo strumento educativo |
| Competitor big tech (es. BlackRock, Vanguard) lancia tool simile | Alto | Bassa-Media a breve termine | Velocità di esecuzione, focus EU retail, community moat |
| Costi dati finanziari (Bloomberg, Refinitiv) | Medio | Alta | Partire con dati open (Yahoo Finance, FRED, ECB) + dati pro solo per piani B2B |
| Retention bassa: utenti usano 1 volta e abbandonano | Alto | Media | Notifiche mensili, portfolio update alerts, engagement via newsletter personalizzata |
| Accuratezza backtest contestata da utenti esperti | Medio | Media | Trasparenza totale sulle fonti dati, nota metodologica, crowdsourcing validazione |

---

## 7. Stack Tecnologico Consigliato

| Layer | Tecnologia consigliata | Motivazione |
|---|---|---|
| **Frontend** | React + TypeScript, Recharts / D3.js, Tailwind CSS | Performance, ecosistema ricco, visualizzazioni finanziarie |
| **Backend / API** | Python (FastAPI o Django REST), PostgreSQL | Python = lingua nativa della finanza quantitativa; librerie: pandas, numpy, scipy |
| **Calcoli Finanziari** | Python: pandas-datareader, quantstats, pyfolio | Librerie open-source mature per backtest, drawdown, Sharpe, Monte Carlo |
| **Dati Storici** | Yahoo Finance API, FRED (Fed), ECB API, Alpha Vantage (free tier) | Gratuito per MVP, scalabile a dati premium |
| **Auth & Subscription** | Auth0 + Stripe | Standard industria, gestione subscription facile |
| **Infrastruttura** | Vercel (frontend) + Railway/Render (backend) → poi AWS | Costo basso in early stage, scalabile |
| **AI Features** | Anthropic Claude API (analisi contestuale) | Spiegazioni in linguaggio naturale dei dati finanziari |

---

## 8. Conclusioni e Prossimi Passi

✅ **Il mercato esiste ed è validato:** Portfolio Visualizer (USA) ha centinaia di migliaia di utenti mensili. Curvo.eu ha trovato trazione in Europa con solo ETF. Nessuno ha ancora fatto la versione multi-asset, EU-first, user-friendly.

La finestra di opportunità è ora: la crescita del retail investor europeo post-COVID è strutturale, la penetrazione degli ETF in Italia è ancora bassa rispetto al Nord Europa (ampio upside), e la narrativa crypto + asset alternativi porta nuovi utenti al mondo degli investimenti ogni giorno.

### Prossimi passi concreti

| Azione | Descrizione |
|---|---|
| **Validazione del problema** | Intervista 20–30 potenziali utenti (Reddit, Telegram gruppi finanza) per confermare i pain point |
| **MVP in 60–90 giorni** | Frontend React + backend Python con dati Yahoo Finance + 5 asset class principali |
| **Landing page con waitlist** | Misurare interesse reale prima di costruire. Target: 500 iscritti in 30 giorni |
| **Analisi legale** | Consulenza rapida su disclaimer MiFID II per tool educativi in Italia |
| **Modello dati** | Valutare costo dati storici per asset alternativi (crypto, commodity) — possibile partnership con fornitori |

---

*Documento preparato con Claude AI (Anthropic) · Febbraio 2025 · Solo a scopo informativo e strategico. Non costituisce consulenza finanziaria o legale.*
