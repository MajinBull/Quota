# Piano Migrazione: Backtest Engine → Firebase Cloud Functions

## 🎯 Obiettivo
Migrare l'esecuzione backtest da client-side a server-side per garantire **sicurezza totale** dei limiti Free vs Premium.

---

## 📊 Stato Attuale vs Target

### Attuale (VULNERABILE)
```
Browser → Carica 75MB JSON → Esegue backtest → Mostra risultati
❌ Utente può bypassare limiti con F12
```

### Target (SICURO)
```
Browser → Invia portfolio (2KB) → Cloud Function
                                    ↓
                              Verifica limiti ✓
                              Carica dati (cached)
                              Esegue backtest
                              Incrementa counter (atomico)
                                    ↓
Browser ← Riceve risultati (50KB)
✅ Impossibile bypassare limiti
```

---

## 🏗️ Architettura Scelta

### Strategia Dati: **Hybrid In-Memory Caching**

**Decisione**: Caricare i 75MB di JSON nella Cloud Function e tenerli in memoria tra invocazioni.

**Perché**:
- ✅ Container Firebase resta "warm" 10-15 minuti → dati persistono in memoria
- ✅ Cold start: ~3 secondi (solo prima chiamata)
- ✅ Warm calls: ~1 secondo (dati già in RAM)
- ✅ Nessun costo Firebase Storage bandwidth
- ✅ Massima velocità dopo prima chiamata

**Implementazione**:
```typescript
// Global scope - persiste tra invocazioni
let globalDataCache: Map<string, AssetData> | null = null;

export const executeBacktest = functions.https.onCall(async (data, context) => {
  if (!globalDataCache) {
    globalDataCache = loadAllHistoricalData(); // ~2s solo al cold start
  }
  // ... usa globalDataCache
});
```

---

## 📁 Struttura Directory

```
C:\Users\edoni\Desktop\ETF ECC\
├── shared/                              # ✨ NUOVO: Types condivisi
│   ├── types/
│   │   ├── index.ts                     # Export tutti i types
│   │   ├── portfolio.ts
│   │   ├── backtest.ts
│   │   └── asset.ts
│   ├── package.json
│   └── tsconfig.json
│
├── functions/                           # ✨ NUOVO: Cloud Functions
│   ├── src/
│   │   ├── index.ts                     # Export executeBacktest, monthlyReset
│   │   ├── executeBacktest.ts           # Main backtest function
│   │   ├── monthlyReset.ts              # Scheduled reset (1° del mese)
│   │   ├── engine/
│   │   │   ├── backtester.ts            # MIGRATO da frontend
│   │   │   └── validator.ts             # Input validation
│   │   ├── data/
│   │   │   ├── dataLoader.ts            # Node.js loader (fs, non fetch)
│   │   │   ├── cache.ts                 # Global caching logic
│   │   │   └── historical/              # JSON files copiati qui
│   │   │       ├── etf_historical.json
│   │   │       ├── crypto_historical.json
│   │   │       ├── bonds_historical.json
│   │   │       ├── commodities_historical.json
│   │   │       └── real_estate_historical.json
│   │   └── utils/
│   │       ├── validation.ts
│   │       └── errors.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── backtestService.ts       # ✨ NUOVO: Chiama Cloud Function
│   │   ├── engine/                      # 🗑️ RIMUOVERE (backup prima)
│   │   └── utils/
│   │       └── dataLoader.ts            # 🗑️ RIMUOVERE (non serve più)
│
├── firebase.json                        # ✨ AGGIORNARE: Add functions config
├── .firebaserc                          # ✨ NUOVO: Firebase project ID
└── firestore.rules                      # ✨ AGGIORNARE: Block direct writes
```

---

## 🔐 Cloud Functions da Creare

### 1. `executeBacktest` (Callable HTTPS)

**Input**: `{ portfolio: Portfolio }`
**Output**: `{ success: boolean, result: BacktestResult, remainingBacktests: number }`

**Logica**:
```typescript
export const executeBacktest = functions.https.onCall(async (data, context) => {
  // 1. Auth check
  if (!context.auth) throw new HttpsError('unauthenticated', 'Login required');

  // 2. Load user
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const userData = userDoc.data();

  // 3. Check limit
  if (!userData.isPremium && userData.backtestExecutionCount >= 20) {
    throw new HttpsError('resource-exhausted', 'Limite 20 backtest raggiunto. Passa a Premium!');
  }

  // 4. Validate portfolio
  const error = validatePortfolio(data.portfolio);
  if (error) throw new HttpsError('invalid-argument', error);

  // 5. CRITICAL: Increment counter ATOMICALLY (prima dell'esecuzione)
  await userDoc.ref.update({
    backtestExecutionCount: admin.firestore.FieldValue.increment(1)
  });

  // 6. Load data from cache
  const historicalData = await getHistoricalData();

  // 7. Build asset map
  const assetDataMap = new Map();
  for (const alloc of data.portfolio.allocations) {
    const asset = historicalData.get(alloc.symbol);
    if (!asset) throw new HttpsError('not-found', `Asset ${alloc.symbol} not found`);
    assetDataMap.set(alloc.symbol, asset);
  }

  // 8. Execute backtest
  const result = runBacktest(data.portfolio, assetDataMap);

  // 9. Return
  return {
    success: true,
    result,
    remainingBacktests: userData.isPremium ? -1 : (20 - userData.backtestExecutionCount - 1)
  };
});
```

---

### 2. `monthlyResetLimits` (Scheduled)

**Trigger**: `0 0 1 * *` (1° del mese alle 00:00 UTC)

**Logica**:
```typescript
export const monthlyResetLimits = functions.pubsub
  .schedule('0 0 1 * *')
  .timeZone('UTC')
  .onRun(async () => {
    const usersRef = admin.firestore().collection('users');
    const snapshot = await usersRef.where('backtestExecutionCount', '>', 0).get();

    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { backtestExecutionCount: 0 });
    });

    await batch.commit();
    console.log(`Reset ${snapshot.size} users`);
  });
```

---

## 🔄 Types Condivisi (Shared Package)

**Strategia**: Creare package `@quota/shared` usato sia da frontend che backend.

**Setup**:
```bash
# Crea shared package
mkdir shared && cd shared
npm init -y

# In shared/package.json
{
  "name": "@quota/shared",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}

# Link a frontend e functions
cd ../frontend && npm install file:../shared
cd ../functions && npm install file:../shared
```

**Contenuto**:
```typescript
// shared/types/index.ts
export type { Portfolio, PortfolioAllocation } from './portfolio';
export type { BacktestResult, PerformanceMetrics, EquityPoint } from './backtest';
export type { AssetData, Candle, AssetCategory } from './asset';
```

---

## 📝 Step-by-Step Implementation

### **Fase 1: Setup Firebase Functions** (30 min)

```bash
# 1. Installare Firebase CLI
npm install -g firebase-tools
firebase login

# 2. Inizializzare Functions
cd "C:\Users\edoni\Desktop\ETF ECC"
firebase init functions
# Seleziona: TypeScript, ESLint, Install dependencies

# 3. Configurare firebase.json
```

**File: `firebase.json`**
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  }
}
```

**File: `functions/package.json`**
```json
{
  "engines": { "node": "20" },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0",
    "date-fns": "^4.1.0"
  }
}
```

---

### **Fase 2: Shared Types Package** (20 min)

```bash
# 1. Creare shared directory
mkdir shared && cd shared
npm init -y

# 2. Copiare types da frontend/src/types/
# Estrarre: Portfolio, BacktestResult, AssetData, etc.

# 3. Link a frontend e functions
cd ../frontend && npm install file:../shared
cd ../functions && npm install file:../shared
```

---

### **Fase 3: Migrare Backtest Engine** (45 min)

**1. Copiare backtester.ts**
```bash
cp frontend/src/engine/backtester.ts functions/src/engine/backtester.ts
```

**2. Adattare imports**
```typescript
// functions/src/engine/backtester.ts
import type { Portfolio, BacktestResult, AssetData } from '@quota/shared/types';

// Cambiare firma:
// DA: export async function runBacktest(portfolio: Portfolio)
// A:  export function runBacktest(portfolio: Portfolio, assetDataMap: Map<string, AssetData>)
```

**3. Creare data loader Node.js**
```typescript
// functions/src/data/dataLoader.ts
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, 'historical');

export function loadAllData(): Map<string, AssetData> {
  const categories = ['etf', 'crypto', 'commodities', 'bonds', 'real_estate'];
  const allData = new Map();

  for (const category of categories) {
    const filePath = path.join(DATA_DIR, `${category}_historical.json`);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const categoryData = JSON.parse(rawData);

    Object.values(categoryData).forEach((asset: any) => {
      allData.set(asset.symbol, asset);
    });
  }

  return allData;
}
```

**4. Creare global cache**
```typescript
// functions/src/data/cache.ts
import { loadAllData } from './dataLoader';

let globalCache: Map<string, AssetData> | null = null;

export function getHistoricalData(): Map<string, AssetData> {
  if (!globalCache) {
    console.log('Loading historical data...');
    globalCache = loadAllData();
  }
  return globalCache;
}
```

**5. Copiare JSON files**
```bash
mkdir -p functions/src/data/historical
cp frontend/public/data/*_historical.json functions/src/data/historical/
```

---

### **Fase 4: Implementare Cloud Functions** (60 min)

**File: `functions/src/executeBacktest.ts`**
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { runBacktest } from './engine/backtester';
import { getHistoricalData } from './data/cache';
import { validatePortfolio } from './utils/validation';

export const executeBacktest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const portfolio = data.portfolio;
  const validationError = validatePortfolio(portfolio);
  if (validationError) {
    throw new functions.https.HttpsError('invalid-argument', validationError);
  }

  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();

  const userData = userDoc.data();
  if (!userData) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  if (!userData.isPremium && userData.backtestExecutionCount >= 20) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Limite mensile raggiunto. Passa a Premium!'
    );
  }

  // CRITICAL: Increment BEFORE execution
  await userDoc.ref.update({
    backtestExecutionCount: admin.firestore.FieldValue.increment(1)
  });

  const historicalData = getHistoricalData();
  const assetDataMap = new Map();

  for (const alloc of portfolio.allocations) {
    const asset = historicalData.get(alloc.symbol);
    if (!asset) {
      throw new functions.https.HttpsError('not-found', `Asset not found: ${alloc.symbol}`);
    }
    assetDataMap.set(alloc.symbol, asset);
  }

  const result = runBacktest(portfolio, assetDataMap);

  if (!result) {
    throw new functions.https.HttpsError('internal', 'Backtest failed');
  }

  return {
    success: true,
    result,
    remainingBacktests: userData.isPremium ? -1 : (20 - userData.backtestExecutionCount - 1)
  };
});
```

**File: `functions/src/utils/validation.ts`**
```typescript
import type { Portfolio } from '@quota/shared/types';

export function validatePortfolio(portfolio: Portfolio): string | null {
  if (!portfolio || !portfolio.allocations) {
    return 'Invalid portfolio';
  }

  if (portfolio.allocations.length === 0) {
    return 'Portfolio must have at least one asset';
  }

  const total = portfolio.allocations.reduce((sum, a) => sum + a.percentage, 0);
  if (Math.abs(total - 100) > 0.01) {
    return `Allocations must sum to 100% (got ${total}%)`;
  }

  if (portfolio.initialCapital <= 0) {
    return 'Initial capital must be positive';
  }

  return null;
}
```

**File: `functions/src/monthlyReset.ts`**
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const monthlyResetLimits = functions.pubsub
  .schedule('0 0 1 * *')
  .timeZone('UTC')
  .onRun(async () => {
    const snapshot = await admin.firestore()
      .collection('users')
      .where('backtestExecutionCount', '>', 0)
      .get();

    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { backtestExecutionCount: 0 });
    });

    await batch.commit();
    console.log(`Monthly reset: ${snapshot.size} users`);
  });
```

**File: `functions/src/index.ts`**
```typescript
import * as admin from 'firebase-admin';
admin.initializeApp();

export { executeBacktest } from './executeBacktest';
export { monthlyResetLimits } from './monthlyReset';
```

---

### **Fase 5: Aggiornare Frontend** (30 min)

**1. Creare service per Cloud Functions**
```typescript
// frontend/src/services/backtestService.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import type { Portfolio, BacktestResult } from '@quota/shared/types';

export async function executeBacktestRemote(portfolio: Portfolio): Promise<BacktestResult> {
  const callable = httpsCallable(functions, 'executeBacktest');
  const response = await callable({ portfolio });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Backtest failed');
  }

  return response.data.result;
}
```

**2. Aggiornare firebase config**
```typescript
// frontend/src/config/firebase.ts
import { getFunctions } from 'firebase/functions';

export const functions = getFunctions(app); // ADD THIS LINE
```

**3. Aggiornare App.tsx**
```typescript
// frontend/src/App.tsx
import { executeBacktestRemote } from './services/backtestService';

// In handleRunBacktest:
const backtestResult = await executeBacktestRemote(portfolio);
```

**4. Rimuovere codice vecchio (backup prima)**
```bash
mv frontend/src/engine frontend/src/engine_BACKUP
mv frontend/src/utils/dataLoader.ts frontend/src/utils/dataLoader_BACKUP.ts
```

---

### **Fase 6: Aggiornare Firestore Rules** (10 min)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;

      // CRITICAL: Block direct modification of premium/counter
      allow update: if request.auth != null
                    && request.auth.uid == userId
                    && !request.resource.data.diff(resource.data)
                         .affectedKeys().hasAny(['isPremium', 'backtestExecutionCount']);
    }

    match /backtests/{backtestId} {
      allow read, delete: if request.auth != null
                          && resource.data.userId == request.auth.uid;

      allow create, update: if request.auth != null
                            && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

### **Fase 7: Testing Locale** (30 min)

```bash
# 1. Installare emulators
firebase init emulators
# Seleziona: Functions, Firestore

# 2. Avviare emulators
firebase emulators:start

# 3. Nel frontend, puntare a emulator
// frontend/src/config/firebase.ts (in development)
import { connectFunctionsEmulator } from 'firebase/functions';

if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

**Test checklist**:
- [ ] Backtest eseguito con successo
- [ ] Limite 20 backtest funziona (testare con account free)
- [ ] Premium bypassa limite
- [ ] Portfolio invalido rifiutato
- [ ] Utente non autenticato rifiutato
- [ ] Counter incrementa correttamente

---

### **Fase 8: Deploy** (20 min)

```bash
# 1. Build functions
cd functions
npm run build

# 2. Deploy functions
cd ..
firebase deploy --only functions

# 3. Deploy Firestore rules
firebase deploy --only firestore:rules

# 4. Deploy frontend (Vercel)
cd frontend
npm run build
git add . && git commit -m "feat: Migrate backtest to Cloud Functions"
git push
# Vercel auto-deploy
```

---

## ⚡ Performance Attese

### Latency

| Scenario | Tempo | Note |
|----------|-------|------|
| **Cold Start** | ~3.5s | Prima chiamata dopo deploy o timeout |
| **Warm Container** | ~1.1s | Chiamate successive (container attivo) |
| **Client Attuale** | ~4s | Carica 75MB + calcolo |

**Miglioramento**: **3x più veloce** su chiamate warm!

### Costi (Piano Gratuito)

- **Free Tier**: 2M invocazioni/mese
- **Uso stimato** (100 utenti): ~2,000 backtest/mese
- **Costo**: **€0/mese** (ben dentro free tier)
- **Quando pagare**: Solo se >100,000 backtest/mese (~€5/mese)

---

## 🔒 Garanzie Sicurezza

### Meccanismi Anti-Bypass

1. **Counter Atomico Server-Side**
   ```typescript
   await admin.firestore().FieldValue.increment(1)
   ```
   - Client non può manipolare (Admin SDK)
   - Increment PRIMA dell'esecuzione

2. **Firestore Rules**
   ```javascript
   allow update: if !affectedKeys().hasAny(['isPremium', 'backtestExecutionCount'])
   ```
   - Utente non può modificare premium status
   - Utente non può resettare counter

3. **Auth Validation**
   ```typescript
   if (!context.auth) throw HttpsError('unauthenticated')
   ```
   - Firebase valida JWT automaticamente
   - Impossibile spoofing identità

4. **Input Validation**
   - Portfolio validato server-side
   - Previene payload malevoli

**Attacchi Eliminati**:
- ❌ Modifica counter browser
- ❌ Bypass check limite
- ❌ Spoofing premium
- ❌ Scritture dirette Firestore
- ❌ Replay vecchie richieste

---

## ✅ Verification Checklist

Prima di considerare completata la migrazione:

### Funzionalità
- [ ] Utente free può eseguire max 20 backtest/mese
- [ ] Utente premium può eseguire backtest illimitati
- [ ] Counter si resetta il 1° del mese
- [ ] Backtest produce risultati identici a versione client
- [ ] Portfolio invalidi vengono rifiutati

### Sicurezza
- [ ] Tentativo modifica `backtestExecutionCount` via Firestore fallisce
- [ ] Tentativo modifica `isPremium` via Firestore fallisce
- [ ] Chiamata senza auth fallisce
- [ ] Bypass con F12 impossibile (verificato manualmente)

### Performance
- [ ] Cold start < 5 secondi
- [ ] Warm calls < 2 secondi
- [ ] 10 utenti concorrenti gestiti correttamente

### Monitoring
- [ ] Cloud Functions logs visibili in Firebase Console
- [ ] Errori tracciati correttamente
- [ ] Costi monitorati in Firebase Billing

---

## 🎯 Critical Files Summary

### Da Creare
1. `functions/src/index.ts` - Entry point
2. `functions/src/executeBacktest.ts` - Main logic
3. `functions/src/monthlyReset.ts` - Scheduled reset
4. `functions/src/engine/backtester.ts` - Migrated engine
5. `functions/src/data/cache.ts` - Global caching
6. `functions/src/utils/validation.ts` - Input validation
7. `shared/types/index.ts` - Shared types
8. `frontend/src/services/backtestService.ts` - Cloud Function client

### Da Modificare
1. `firebase.json` - Add functions config
2. `firestore.rules` - Block direct counter writes
3. `frontend/src/config/firebase.ts` - Add getFunctions
4. `frontend/src/App.tsx` - Replace runBacktest with executeBacktestRemote

### Da Rimuovere (Backup Prima)
1. `frontend/src/engine/` - No longer needed
2. `frontend/src/utils/dataLoader.ts` - No longer needed

---

## 🚀 Post-Migration Next Steps

Una volta deployato e testato:

1. **Stripe Integration** - Aggiungere pagamenti per piano Premium
2. **Analytics** - Tracciare backtest più usati, asset popolari
3. **Optimization** - Se cold start frequente, attivare min instances = 1
4. **Caching Avanzato** - Cache risultati backtest by portfolio hash
5. **Progress Streaming** - Per backtest >10 secondi, streamare progresso

---

**Tempo Totale Stimato**: ~4-5 ore
**Complessità**: Media-Alta
**Risk Level**: Basso (testabile in emulator prima di deploy)
