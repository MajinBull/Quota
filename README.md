# QUOTA — Portfolio Backtest Platform

App live: [quota-ochre.vercel.app](https://quota-ochre.vercel.app)

> **Mappatura Vercel:** questo repository è il sito Portfolio e deve essere
> distribuito esclusivamente nel progetto Vercel `quota`. Il progetto
> `supremo-toro` e i domini `quota.finance` / `www.quota.finance` appartengono
> al sito crypto e non devono essere usati come destinazione di questo codice.

QUOTA simula portafogli multi-asset con dati storici giornalieri, PAC,
ribilanciamento e leva da 1× a 5×. Il calcolo avviene interamente nel browser:
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
  liquidazione quando il patrimonio netto dell'intero conto raggiunge zero.
  La size di ogni asset viene moltiplicata per la leva scelta e tutte le
  posizioni condividono lo stesso margine; una perdita su un singolo asset non
  causa quindi una liquidazione separata. Anche ogni nuovo versamento PAC
  riceve lo stesso moltiplicatore.
- La cartella `functions/` è codice storico e non è inclusa nel deploy Firebase.

### SuperStrategy

SuperStrategy è un percorso di simulazione separato e opzionale. Per ogni
asset divide il capitale assegnato in dieci tranche nominali uguali: apre la
prima sul primo close disponibile, aggiunge al massimo una tranche per close
dopo una discesa del 10% dall'ultimo ingresso e chiude l'intero basket al 10%
sopra il prezzo medio ponderato. Non usa stop loss; dopo il take profit riparte
subito con una nuova prima tranche. La leva moltiplica ogni tranche e tutte le
posizioni condividono il margine dell'intero conto. Le size restano basate
sull'allocazione iniziale e i profitti non le aumentano automaticamente.

La strategia usa esclusivamente chiusure giornaliere: non ricostruisce un
percorso intraday e non apre più livelli nella stessa candela in caso di gap.

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
mercato misti, costo della leva, size per asset, margine condiviso e
liquidazione dell'intero conto.

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

Prima di un deploy manuale verificare il collegamento locale:

```bash
vercel link --project quota
vercel project inspect quota
vercel --prod
```

L'output del deploy deve indicare `Deploying quota` e l'alias
`https://quota-ochre.vercel.app`. Non aggiungere redirect verso
`quota.finance`.

Firebase distribuisce soltanto regole e indici Firestore:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Stack: React 19, TypeScript, Vite, Tailwind CSS, Firebase Auth/Firestore,
Vercel.
