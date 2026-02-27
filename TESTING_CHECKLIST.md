# 🧪 Testing Checklist - Firebase Auth & Firestore Integration

## ✅ Pre-Test Setup

- [ ] Firebase project creato e configurato
- [ ] File `.env` popolato con credenziali Firebase corrette
- [ ] Firestore security rules pubblicate (vedi `FIREBASE_SETUP_GUIDE.md`)
- [ ] Composite index creato per `backtests` collection
- [ ] Dev server avviato: `npm run dev`
- [ ] App accessibile su http://localhost:5175/

---

## 🔐 FASE 1: Autenticazione

### Signup con Email/Password

- [ ] Aprire http://localhost:5175/
- [ ] Dovrebbe mostrare `AuthModal` (force login)
- [ ] Cliccare tab "Registrati"
- [ ] Compilare form:
  - Nome: almeno 3 caratteri
  - Email: valida
  - Password: almeno 6 caratteri
- [ ] Cliccare "Crea Account"
- [ ] **Verificare**:
  - [ ] Toast di successo: "Registrazione completata!"
  - [ ] Reindirizzamento automatico all'app
  - [ ] User doc creato in Firestore `users/{uid}` con:
    - `backtestExecutionCount: 0`
    - `isPremium: false`
    - `createdAt` timestamp
  - [ ] `UserProfileButton` visibile in header con nome utente
  - [ ] localStorage svuotato (nessun `saved_backtests`)

### Login con Email/Password

- [ ] Logout dall'app (click su `UserProfileButton` → Logout)
- [ ] Dovrebbe tornare a mostrare `AuthModal`
- [ ] Tab "Login" selezionato
- [ ] Compilare form con email/password precedenti
- [ ] Cliccare "Accedi"
- [ ] **Verificare**:
  - [ ] Toast: "Login effettuato con successo!"
  - [ ] User ricaricato correttamente
  - [ ] `lastLogin` aggiornato in Firestore

### Password Reset

- [ ] Logout
- [ ] Nel `AuthModal`, cliccare "Password dimenticata?"
- [ ] Inserire email dell'account
- [ ] Cliccare "Invia Email di Reset"
- [ ] **Verificare**:
  - [ ] Toast: "Email di reset inviata!"
  - [ ] Email ricevuta nella casella (controllare spam)
  - [ ] Link funzionante per reset password

### Google OAuth

- [ ] Logout
- [ ] Nel `AuthModal`, cliccare "Continua con Google"
- [ ] Selezionare account Google
- [ ] **Verificare**:
  - [ ] Login effettuato
  - [ ] User doc creato/aggiornato in Firestore
  - [ ] Toast di successo
  - [ ] Nome Google visibile in `UserProfileButton`

### Auth Persistence

- [ ] Essere loggati
- [ ] Ricaricare la pagina (F5)
- [ ] **Verificare**:
  - [ ] Loading screen mostrato brevemente
  - [ ] Utente resta loggato (no redirect a `AuthModal`)
  - [ ] Dati utente caricati correttamente

---

## 📊 FASE 2: Backtest Execution & Free Tier Limit

### Primo Backtest

- [ ] Accedere all'app
- [ ] Tab "Configuration"
- [ ] Selezionare un template o creare portfolio manuale
- [ ] Verificare allocazione = 100%
- [ ] Cliccare "Esegui Backtest"
- [ ] **Verificare**:
  - [ ] Loading spinner visibile
  - [ ] Backtest eseguito correttamente
  - [ ] Switch automatico a tab "Risultati Backtest"
  - [ ] Grafici e metriche visualizzate
  - [ ] In Firestore: `users/{uid}.backtestExecutionCount = 1`
  - [ ] In `UserProfileButton`: "1/5 backtest"

### Backtest 2-4 (Free Tier in corso)

- [ ] Tornare a tab "Configuration"
- [ ] Modificare portfolio
- [ ] Eseguire altri 3 backtest
- [ ] **Verificare dopo ogni esecuzione**:
  - [ ] Counter incrementa: 2/5, 3/5, 4/5
  - [ ] Firestore `backtestExecutionCount` aggiornato
  - [ ] Progress bar in `UserProfileButton` cambia colore:
    - Verde (0-79%)
    - Amber (80-99%)
    - Rosso (100%)

### Quinto Backtest (Ultimo gratuito)

- [ ] Eseguire il 5° backtest
- [ ] **Verificare**:
  - [ ] Backtest eseguito correttamente
  - [ ] Counter: "5/5 backtest"
  - [ ] Progress bar rossa al 100%
  - [ ] Messaggio "Limite raggiunto!"

### Sesto Tentativo (Free Tier Limit Reached)

- [ ] Tentare di eseguire il 6° backtest
- [ ] **Verificare**:
  - [ ] `UpgradeModal` appare IMMEDIATAMENTE
  - [ ] Backtest NON viene eseguito
  - [ ] Counter resta 5/5
  - [ ] Modal mostra:
    - [ ] Titolo "Passa a Premium!"
    - [ ] Lista 5 benefici premium
    - [ ] Pricing: €9.99/mese
    - [ ] Bottone "Contattaci per l'Upgrade"
  - [ ] Cliccare "Contattaci" → apre email client con subject pre-compilato
  - [ ] Cliccare "Chiudi" → modal si chiude

---

## 💾 FASE 3: Salvataggio Backtest su Firestore

### Salva Primo Backtest

- [ ] Eseguire un backtest (entro limit se free tier)
- [ ] Nella pagina risultati, cliccare bottone "💾 Salva Backtest" (sticky bottom)
- [ ] Modal "Salva Backtest" appare
- [ ] **Verificare form**:
  - [ ] Nome pre-compilato: "Strategy #1"
  - [ ] Checkbox "Aggiungi ai preferiti"
  - [ ] Counter: "Backtest salvati: 0/100"
- [ ] Modificare nome (es: "My First Strategy")
- [ ] Selezionare checkbox "Preferiti"
- [ ] Cliccare "Salva ✓"
- [ ] **Verificare**:
  - [ ] Loading spinner nel bottone "Salvataggio..."
  - [ ] Toast: "Backtest 'My First Strategy' salvato con successo!"
  - [ ] Modal si chiude
  - [ ] In Firestore: documento creato in `backtests` collection con:
    - `userId` = user uid
    - `name` = "My First Strategy"
    - `isFavorite` = true
    - `savedAt` timestamp
    - `portfolio` object
    - `result` object (compressed)

### Verifica Compression

- [ ] In Firestore console, aprire il documento salvato
- [ ] Controllare `result.equityCurve` array
- [ ] **Verificare**:
  - [ ] Length ridotto (~10% dell'originale)
  - [ ] Primo e ultimo elemento sempre presenti
  - [ ] Campionamento ogni ~10 elementi

---

## 📁 FASE 4: Caricamento Backtest Salvati

### Visualizza Lista Backtest

- [ ] Cliccare tab "Backtest Salvati"
- [ ] **Verificare**:
  - [ ] Loading spinner durante caricamento
  - [ ] Backtest caricati da Firestore
  - [ ] Lista mostra "Backtest Salvati (1/100)"
  - [ ] Backtest visibile con:
    - [ ] Stella gialla (isFavorite = true)
    - [ ] Nome corretto
    - [ ] Data formattata correttamente
    - [ ] Allocazioni ETF (chips)
    - [ ] Metriche: Investito, Valore Finale, Rendimento, Drawdown
    - [ ] Checkbox "Confronta"
    - [ ] Bottoni "Visualizza" e "Elimina"

### Test Ordinamento

- [ ] Salvare almeno 3-4 backtest con nomi/rendimenti diversi
- [ ] Provare dropdown "Ordina per":
  - [ ] **Preferiti prima**: preferiti in cima, poi per data
  - [ ] **Più recenti**: ordinati per `savedAt` DESC
  - [ ] **Nome (A-Z)**: alfabetico
  - [ ] **Rendimento**: highest first

---

## ✏️ FASE 5: Operazioni CRUD su Firestore

### Rinomina Backtest

- [ ] Cliccare icona matita accanto al nome
- [ ] Input appare con nome editabile
- [ ] Modificare nome (es: "My Best Strategy")
- [ ] Cliccare "✓"
- [ ] **Verificare**:
  - [ ] Nome aggiornato nella UI
  - [ ] Toast: "Backtest rinominato con successo"
  - [ ] Firestore: campo `name` aggiornato

### Toggle Preferito

- [ ] Cliccare stella accanto al nome
- [ ] **Verificare**:
  - [ ] Stella cambia colore: giallo ↔ grigio
  - [ ] Animazione scale
  - [ ] Firestore: `isFavorite` aggiornato
  - [ ] Nessun toast (operazione silenziosa)
- [ ] Ricliccare per tornare allo stato precedente

### Visualizza Backtest

- [ ] Cliccare "Visualizza" su un backtest
- [ ] **Verificare**:
  - [ ] Switch automatico a tab "Risultati Backtest"
  - [ ] Grafici caricati con dati decompressi
  - [ ] Metriche corrette
  - [ ] Equity curve visualizzata

### Elimina Backtest

- [ ] Tornare a "Backtest Salvati"
- [ ] Cliccare "Elimina" su un backtest
- [ ] Confermare nel dialog del browser
- [ ] **Verificare**:
  - [ ] Backtest rimosso dalla lista immediata (optimistic update)
  - [ ] Firestore: documento eliminato
  - [ ] Counter aggiornato: "Backtest Salvati (N-1/100)"
  - [ ] Se era selezionato per confronto, deselezionato automaticamente

---

## 📊 FASE 6: Confronto Backtest

### Seleziona per Confronto

- [ ] Salvare almeno 3 backtest diversi
- [ ] Selezionare checkbox "Confronta" su 2 backtest
- [ ] **Verificare**:
  - [ ] Checkbox selezionate
  - [ ] Bottone sticky bottom: "📊 Confronta Selezionati (2)"
  - [ ] Bottone abilitato (indigo)
  - [ ] Messaggio: "Confronta fino a 3 backtest contemporaneamente"

### Test Limite 3 Backtest

- [ ] Selezionare 3 backtest
- [ ] Tentare di selezionare un 4°
- [ ] **Verificare**:
  - [ ] Checkbox disabilitata
  - [ ] Tooltip: "Massimo 3 backtest selezionabili"

### Visualizza Confronto

- [ ] Con 2-3 backtest selezionati, cliccare "Confronta Selezionati"
- [ ] **Verificare**:
  - [ ] Modal/View di confronto appare
  - [ ] Grafici comparativi visualizzati
  - [ ] Metriche affiancate
  - [ ] Possibile chiudere il confronto
  - [ ] Selezione pulita al close

---

## 🔒 FASE 7: Firestore Security Rules

### Test Isolamento Utenti

1. **Setup**:
   - [ ] Creare Account A e salvare 2-3 backtest
   - [ ] Logout
   - [ ] Creare Account B e salvare 1 backtest

2. **Test Read Isolation**:
   - [ ] Con Account B loggato
   - [ ] Andare a "Backtest Salvati"
   - [ ] **Verificare**:
     - [ ] Vede SOLO il backtest di Account B
     - [ ] NON vede i backtest di Account A
     - [ ] Lista mostra "Backtest Salvati (1/100)"

3. **Test Write Isolation**:
   - [ ] Aprire Firestore console
   - [ ] Copiare un `backtestId` di Account A
   - [ ] In console browser, tentare di eliminarlo con Account B loggato:
     ```javascript
     const db = firebase.firestore();
     await db.collection('backtests').doc('ID_ACCOUNT_A').delete();
     ```
   - [ ] **Verificare**:
     - [ ] Errore: "Missing or insufficient permissions"
     - [ ] Documento NON eliminato

### Test isPremium Protection

- [ ] Aprire console browser
- [ ] Tentare di modificare campo `isPremium`:
  ```javascript
  const db = firebase.firestore();
  const userId = 'YOUR_USER_ID';
  await db.collection('users').doc(userId).update({ isPremium: true });
  ```
- [ ] **Verificare**:
  - [ ] Errore o update ignorato
  - [ ] Campo `isPremium` resta `false` in Firestore

---

## 💳 FASE 8: Premium Features (Mock Test)

### Test Premium Badge

- [ ] **Manualmente in Firestore**:
  - [ ] Aprire Firestore console
  - [ ] Trovare il proprio user doc
  - [ ] Modificare `isPremium: true`
- [ ] Ricaricare app
- [ ] **Verificare**:
  - [ ] `UserProfileButton` mostra "✓ Premium" badge
  - [ ] Dropdown mostra "Piano Premium" con "✓ Attivo"
  - [ ] Progress bar nascosta
  - [ ] Backtest counter mostra "∞" invece di "N/5"

### Test Unlimited Backtest

- [ ] Con `isPremium: true`
- [ ] Eseguire più di 5 backtest
- [ ] **Verificare**:
  - [ ] Nessun `UpgradeModal` appare
  - [ ] Tutti i backtest eseguiti correttamente
  - [ ] Counter continua ad incrementare ma no limit

---

## 📱 FASE 9: Responsive Design

### Mobile (< 768px)

- [ ] Ridimensionare browser o aprire DevTools mobile view
- [ ] **Verificare**:
  - [ ] `AuthModal` responsive
  - [ ] `UserProfileButton` visibile e funzionante
  - [ ] Tab switcher condensato ("Config", "Risultati", "Salvati")
  - [ ] Lista backtest: layout mobile (grid 2x2 metriche)
  - [ ] Sticky buttons full-width con padding corretto
  - [ ] Modals full-screen su mobile

### Tablet (768px - 1280px)

- [ ] Testare su dimensioni tablet
- [ ] **Verificare**:
  - [ ] Layout adattivo
  - [ ] Tab switcher hybrid
  - [ ] Liste leggibili

### Desktop (> 1280px)

- [ ] Desktop view
- [ ] **Verificare**:
  - [ ] Layout tabulare completo per backtest list
  - [ ] Tutte le colonne visibili
  - [ ] Buttons sticky posizionati correttamente

---

## ⚠️ FASE 10: Error Handling

### Firebase Connection Errors

- [ ] Disabilitare rete (offline mode)
- [ ] Tentare login
- [ ] **Verificare**:
  - [ ] Toast errore: "Errore di connessione"
  - [ ] Nessun crash dell'app

### Invalid Credentials

- [ ] Tentare login con password sbagliata
- [ ] **Verificare**:
  - [ ] Toast: "Email o password non corrette"
  - [ ] Form non si resetta

### Validation Errors

- [ ] Signup con:
  - [ ] Nome < 3 caratteri → warning
  - [ ] Email invalida → validation error
  - [ ] Password < 6 caratteri → validation error

---

## 🎨 FASE 11: UX Polish

### Loading States

- [ ] Verificare spinner visibili durante:
  - [ ] Auth (login, signup, Google OAuth)
  - [ ] Backtest execution
  - [ ] Salvataggio backtest
  - [ ] Caricamento lista backtest
  - [ ] Delete/rename operations

### Toast Notifications

- [ ] Verificare toast per:
  - [ ] Signup success
  - [ ] Login success
  - [ ] Password reset sent
  - [ ] Backtest saved
  - [ ] Backtest renamed
  - [ ] Errori vari

### Empty States

- [ ] Con 0 backtest salvati
- [ ] **Verificare**:
  - [ ] Messaggio: "Nessun backtest salvato"
  - [ ] Suggerimento: "Esegui un backtest e salvalo..."

---

## ✅ CHECKLIST FINALE

Prima di deployare in produzione:

- [ ] Tutti i test sopra completati ✅
- [ ] Nessun errore console (Chrome DevTools)
- [ ] Nessun warning React
- [ ] Build production funziona: `npm run build`
- [ ] Preview build: `npm run preview`
- [ ] `.env` NON committato in Git
- [ ] Firestore security rules pubblicate
- [ ] Composite index creato e "Enabled"
- [ ] localStorage pulito su primo login
- [ ] Tutti i file necessari committati
- [ ] `FIREBASE_SETUP_GUIDE.md` documentazione completa

---

## 🚀 DEPLOYMENT

Una volta completati tutti i test:

```bash
# 1. Commit finale
git add .
git commit -m "feat: Add Firebase Auth + Firestore integration with free tier limits"

# 2. Push to main
git push origin main

# 3. Vercel deployment automatico
# Controllare dashboard Vercel per status

# 4. Test in produzione
# Ripetere tests critici su URL production
```

---

## 📊 METRICHE ATTESE

Dopo l'implementazione:

- **Build size**: ~645 KB (index.js) - aumento ~100 KB per Firebase
- **Lighthouse Performance**: > 90
- **First Load**: < 2s
- **Firestore Read/Write**: < 500ms
- **Auth Persistence**: < 100ms

---

## 🐛 Known Issues / Future Improvements

- [ ] Aggiungere email verification dopo signup
- [ ] Implementare Stripe per payments
- [ ] Export PDF/CSV (premium feature)
- [ ] Advanced comparison (5 backtest per premium)
- [ ] Offline mode con sync
