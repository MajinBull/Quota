# QUOTA — Portfolio Backtest Platform

App live: [quota.finance](https://quota.finance)

QUOTA simula portafogli multi-asset con dati storici giornalieri, PAC,
ribilanciamento e leva da 1× a 3×. Il calcolo avviene interamente nel browser:
non serve un server Hetzner, una Cloud Function o un worker remoto.

## Architettura

```text
Vercel static hosting
  ├─ React UI
  ├─ Web Worker locale
  │    ├─ carica /data/*.json
  │    └─ esegue simulazione e metriche
  └─ Firebase
       ├─ Authentication
       └─ Firestore (profilo e backtest salvati)
```

- Il Web Worker mantiene parsing e simulazione fuori dal thread della UI.
- Le date di valutazione sono l'unione dei calendari selezionati; acquisti,
  PAC e ribilanciamenti avvengono solo quando tutti gli asset hanno un prezzo
  fresco, evitando ordini su prezzi trascinati.
- PAC e altri versamenti sono flussi esterni: non vengono conteggiati come
  rendimento. Rendimento totale, CAGR, volatilità e drawdown sono
  time-weighted.
- La leva include debito, costo di finanziamento sui giorni di calendario e
  liquidazione quando il patrimonio netto raggiunge zero.
- La cartella `functions/` è codice storico e non è inclusa nel deploy Firebase.

## Sicurezza

Firebase Auth verifica l'identità. Le regole Firestore isolano i dati per UID,
rendono immutabili i risultati salvati e impediscono al client di assegnarsi
`isPremium: true`. Il calcolo locale non può essere usato come confine di
sicurezza: eventuali funzioni Premium con valore economico devono essere
autorizzate tramite custom claims o un endpoint verificato (per esempio un
webhook di pagamento con Admin SDK).

## Sviluppo

```bash
cd frontend
npm install
npm run dev
```

Verifiche:

```bash
cd frontend
npm test
npm run build
npm run lint
```

I test deterministici coprono intervallo comune tra asset, PAC, calendari di
mercato misti, costo della leva e liquidazione.

## Dati e limiti del modello

- I dataset pubblici sono in `frontend/public/data/` e vengono serviti da
  Vercel con cache a scadenza, non immutabile.
- Le quotazioni sono prevalentemente in USD. L'interfaccia visualizza euro come
  unità di conto ma non applica il cambio storico EUR/USD.
- Non sono inclusi spread, slippage, commissioni, fiscalità, dividendi non già
  riflessi nei prezzi aggiustati o richieste di margine intraday.
- L'ultimo aggiornamento del dataset attuale è febbraio/marzo 2026; prima di
  usare il prodotto in produzione va automatizzato l'aggiornamento e il
  controllo di qualità dei dati.
- I risultati hanno finalità educative e non costituiscono consulenza
  finanziaria; le performance passate non garantiscono risultati futuri.

## Deploy

Il frontend è pubblicato su Vercel. Firebase distribuisce soltanto regole e
indici Firestore:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Stack: React 19, TypeScript, Vite, Tailwind CSS, Firebase Auth/Firestore,
Vercel.
