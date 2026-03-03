# Firebase Security Rules & Index Setup Guide

## 📋 Overview

Questa guida ti aiuterà a configurare le regole di sicurezza Firestore e gli indici necessari per il corretto funzionamento dell'applicazione.

---

## 🔒 STEP 1: Configurare Firestore Security Rules

### Opzione A: Tramite Firebase Console (Consigliato)

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Seleziona il tuo progetto "quota-8f121" (o il nome che hai scelto)
3. Nel menu laterale, vai su **Firestore Database**
4. Clicca sulla tab **Rules** (Regole)
5. Sostituisci il contenuto esistente con le regole presenti nel file `firestore.rules`
6. Clicca su **Publish** (Pubblica)

### Opzione B: Firebase CLI (Avanzato)

Se hai Firebase CLI installato, puoi deployare le regole con:

```bash
firebase deploy --only firestore:rules
```

---

## 📊 STEP 2: Creare Composite Index

Firestore richiede un indice composito per eseguire query con più ordinamenti/filtri.

### Metodo 1: Automatico (Consigliato)

1. **Esegui l'app e prova a caricare i backtest salvati**
2. Apri la Console del browser (F12)
3. Dovresti vedere un errore con un link diretto per creare l'indice
4. Clicca sul link nell'errore → Firebase creerà automaticamente l'indice
5. Attendi 2-5 minuti che l'indice venga costruito

### Metodo 2: Manuale via Firebase Console

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Seleziona il progetto
3. Vai su **Firestore Database** → **Indexes** (Indici)
4. Clicca su **Create Index** (Crea indice)
5. Configura:
   - **Collection**: `backtests`
   - **Fields to index**:
     - Field: `userId`, Order: `Ascending`
     - Field: `savedAt`, Order: `Descending`
   - **Query scope**: `Collection`
6. Clicca su **Create** (Crea)
7. Attendi che lo stato diventi "Enabled" (2-5 minuti)

### Metodo 3: Firebase CLI (Avanzato)

Se hai Firebase CLI installato:

```bash
firebase deploy --only firestore:indexes
```

Questo utilizzerà il file `firestore.indexes.json` per creare l'indice.

---

## ✅ STEP 3: Verifica Configurazione

### Test Security Rules:

1. **Test Accesso Proprio Backtest**:
   - Accedi all'app
   - Salva un backtest
   - Vai alla sezione "Backtest Salvati"
   - Dovresti vedere il tuo backtest ✅

2. **Test Isolamento Utenti**:
   - Crea un secondo account
   - Verifica che NON vedi i backtest del primo account ✅

### Test Composite Index:

1. Vai alla sezione "Backtest Salvati"
2. I backtest devono caricarsi correttamente
3. Prova a ordinare per:
   - Preferiti
   - Data
   - Nome
   - Rendimento

Se tutto funziona senza errori, la configurazione è completa! ✅

---

## 🔍 Risoluzione Problemi

### Errore: "Missing index"

**Causa**: L'indice composito non è stato creato o non è ancora pronto.

**Soluzione**:
1. Usa il link nell'errore per creare l'indice automaticamente
2. Oppure segui il Metodo 2 sopra
3. Attendi 2-5 minuti per la costruzione

### Errore: "Permission denied"

**Causa**: Le security rules non sono state applicate correttamente.

**Soluzione**:
1. Verifica che le regole nel file `firestore.rules` siano state pubblicate
2. Controlla che l'utente sia autenticato (deve fare login)
3. Verifica che il campo `userId` nei documenti corrisponda all'ID dell'utente loggato

### Errore: "PERMISSION_DENIED: Missing or insufficient permissions"

**Causa**: Stai cercando di accedere a dati di un altro utente.

**Soluzione**:
- Questo è corretto! Le security rules stanno funzionando.
- Ogni utente vede solo i propri backtest.

---

## 📝 Note Importanti

1. **Non modificare `isPremium` manualmente**: Le security rules impediscono agli utenti di modificare questo campo. Solo admin/server possono farlo.

2. **Ogni utente vede solo i suoi dati**: Le regole garantiscono l'isolamento completo tra utenti.

3. **Gli indici possono richiedere tempo**: Dopo la creazione, gli indici Firestore richiedono 2-5 minuti per essere costruiti.

4. **Testing locale**: Durante lo sviluppo locale, Firestore potrebbe mostrare warning sulle regole. È normale.

---

## 🚀 Prossimi Passi

Dopo aver completato questa configurazione:

1. ✅ Testa il login/signup
2. ✅ Testa la creazione di backtest
3. ✅ Testa il salvataggio
4. ✅ Testa il caricamento dei backtest salvati
5. ✅ Testa il limite free tier (5 backtest)
6. ✅ Testa tutte le operazioni CRUD (rename, delete, toggle favorite)

Se tutto funziona, sei pronto per passare al testing finale! 🎉
