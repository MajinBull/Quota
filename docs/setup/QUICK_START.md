# ⚡ Quick Start - Firebase Auth + Firestore

## 🚀 Inizia Subito (5 minuti)

### STEP 1: Verifica Dev Server

Il dev server è già in esecuzione su:
```
http://localhost:5175/
```

Apri nel browser e dovresti vedere l'**AuthModal** (schermata di login).

### STEP 2: Configura Firebase Security Rules

**IMPORTANTE**: Prima di testare, devi pubblicare le security rules.

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Seleziona progetto "quota-8f121"
3. Vai su **Firestore Database** → **Rules**
4. Copia-incolla il contenuto di `firestore.rules`
5. Clicca **Publish**

✅ Fatto! Le rules sono attive.

### STEP 3: Crea il Composite Index

Hai 2 opzioni:

#### Opzione A: Automatico (Consigliato - 30 secondi)
1. Apri http://localhost:5175/
2. Fai signup/login
3. Vai a tab "Backtest Salvati"
4. Console browser mostrerà un errore con **link diretto**
5. Clicca sul link → Firebase crea l'indice automaticamente
6. Attendi 2-5 minuti

#### Opzione B: Manuale (2 minuti)
1. Firebase Console → Firestore Database → **Indexes**
2. Click **Create Index**
3. Collection: `backtests`
4. Fields:
   - `userId` (Ascending)
   - `savedAt` (Descending)
5. Click **Create**
6. Attendi 2-5 minuti

✅ Quando lo status è "Enabled", sei pronto!

### STEP 4: Test Rapido

1. **Signup**:
   - Apri http://localhost:5175/
   - Tab "Registrati"
   - Nome: "Test User"
   - Email: "test@example.com"
   - Password: "test123"
   - Click "Crea Account"

2. **Esegui Backtest**:
   - Seleziona un template (es: "60/40 Portfolio")
   - Click "Esegui Backtest"
   - Verifica counter: "1/5 backtest"

3. **Salva Backtest**:
   - Click "💾 Salva Backtest"
   - Click "Salva ✓"

4. **Visualizza Salvati**:
   - Tab "Backtest Salvati"
   - Dovresti vedere il backtest appena salvato ✅

5. **Test Free Tier Limit**:
   - Torna a "Configuration"
   - Esegui altri 4 backtest (totale 5)
   - Al 6° tentativo → **UpgradeModal** appare ✅

✅ Se tutto funziona, l'implementazione è completa!

---

## 📖 Documentazione Completa

Per testing approfondito, leggi:

1. **`TESTING_CHECKLIST.md`** - Testing completo (11 fasi)
2. **`FIREBASE_SETUP_GUIDE.md`** - Setup dettagliato
3. **`IMPLEMENTATION_SUMMARY.md`** - Overview implementazione

---

## 🐛 Problemi Comuni

### "Missing index" error
- **Causa**: Index non creato ancora
- **Soluzione**: Segui STEP 3 (opzione A è la più veloce)

### "Permission denied" error
- **Causa**: Security rules non pubblicate
- **Soluzione**: Segui STEP 2

### AuthModal non appare
- **Causa**: Dev server non avviato
- **Soluzione**: `cd frontend && npm run dev`

---

## ✅ Checklist Veloce

- [ ] Dev server running (http://localhost:5175/)
- [ ] Security rules pubblicate
- [ ] Composite index creato
- [ ] Signup funziona
- [ ] Backtest execution funziona (counter incrementa)
- [ ] Save backtest funziona
- [ ] Load backtests funziona
- [ ] Free tier limit funziona (UpgradeModal al 6°)

---

## 🎯 Prossimo Passo

Una volta completato il quick test:

```bash
# Testing completo
Apri: TESTING_CHECKLIST.md

# Quando sei soddisfatto, fai il build
npm run build

# E poi deploy
git add .
git commit -m "feat: Firebase Auth + Firestore integration"
git push origin main
```

**Buon testing! 🚀**
