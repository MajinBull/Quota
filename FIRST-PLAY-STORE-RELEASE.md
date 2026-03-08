# Prima Pubblicazione su Google Play Store

Guida completa step-by-step per pubblicare QUOTA su Play Store per la prima volta.

---

## 📅 Timeline Prevista

| Fase | Durata | Note |
|------|--------|------|
| Setup account | 15-30 min | Una tantum, €25 |
| Creazione keystore | 5 min | **FONDAMENTALE - conservare** |
| Compilazione listing | 1-2 ore | Testi, screenshot, icone |
| Build e firma AAB | 10 min | Automatico con script |
| Upload e submit | 15 min | Google Play Console |
| **Revisione Google** | **1-7 giorni** | Media 1-3 giorni |
| **TOTALE** | **2-4 ore + 1-7 giorni** | Prima volta più lunga |

---

## 🔐 FASE 1: Setup Account (Una Tantum)

### Crea Account Sviluppatore

1. **Vai su:** [Google Play Console Signup](https://play.google.com/console/signup)

2. **Login con Gmail** - usa email professionale o aziendale

3. **Paga €25** (una tantum, lifetime)
   - Carta di credito/debito
   - Pagamento processato immediatamente

4. **Compila informazioni sviluppatore:**
   - Nome sviluppatore (visibile agli utenti): "QUOTA" o tuo nome
   - Email contatto
   - Indirizzo (opzionale ma consigliato)
   - Sito web: `https://quota.finance`

5. **Accetta accordi:**
   - Developer Distribution Agreement
   - Policy privacy e contenuti

**Tempo:** 15-30 minuti
**Costo:** €25 (pagamento unico)

---

## 🔑 FASE 2: Crea Keystore di Release ⚠️ CRITICO

**QUESTO È IL PASSO PIÙ IMPORTANTE!**

### Perché è Fondamentale?

- Ogni APK/AAB caricato su Play Store deve essere firmato con lo **stesso keystore**
- Se perdi il keystore, **NON potrai mai più aggiornare l'app**
- Dovrai creare una nuova app con package name diverso (perdendo tutti gli utenti)

### Crea Keystore

```bash
cd frontend
create-keystore.bat
```

**Ti chiederà:**
1. **Password keystore** (scegli una forte, es: 16+ caratteri)
2. **Password alias** (può essere uguale alla keystore)
3. **Nome e Cognome** (o nome azienda)
4. **Unità organizzativa** (opzionale, premi ENTER)
5. **Organizzazione** (es: "QUOTA")
6. **Città**
7. **Provincia/Stato**
8. **Codice paese** (IT)

**Output:** `quota-release-keystore.jks` (circa 2 KB)

### 🚨 BACKUP IMMEDIATO

**FAI SUBITO (APPENA CREATO):**

1. **Copia keystore in 3 luoghi SICURI:**
   - ✅ Cloud cifrato (Google Drive, Dropbox, OneDrive)
   - ✅ Chiavetta USB offline
   - ✅ Password manager (1Password, Bitwarden, LastPass)

2. **Salva password in password manager:**
   - Password keystore
   - Password alias
   - Tutte le info inserite (nome, città, ecc.)

3. **NON committare su git** (già in `.gitignore`)

**SENZA QUESTO FILE = IMPOSSIBILE AGGIORNARE L'APP IN FUTURO**

---

## 📱 FASE 3: Prepara Asset Grafici

### Cosa Serve

**Obbligatori:**

1. **Icona App** (512x512 px, PNG)
   - Senza trasparenza
   - Design pulito, riconoscibile
   - Usa logo QUOTA

2. **Screenshot** (minimo 2, massimo 8)
   - **Telefono:** 1080x1920 px (portrait)
   - Mostra funzionalità principali:
     - Home/Portfolio Builder
     - Backtest Results
     - Saved Backtests
     - Login/Auth

3. **Graphic Feature** (1024x500 px)
   - Banner promozionale
   - Appare in Play Store listing

**Opzionali ma Consigliati:**

4. **Screenshot Tablet** (1200x1920 px)
5. **Video Promo** (30-120 secondi, YouTube link)

### Suggerimenti Screenshot

**Come Creare:**
1. Apri app su telefono/emulatore
2. Naviga alle schermate principali
3. Prendi screenshot (Volume Down + Power su Android)
4. Ridimensiona a 1080x1920 se necessario

**Schermate Consigliate:**
- Portfolio Builder (mostra costruzione portfolio)
- Backtest Results (mostra grafici performance)
- Asset selection (mostra 70+ asset)
- Saved Backtests (mostra cloud sync)
- Dark mode (mostra tema scuro)

---

## 🏗️ FASE 4: Build App Bundle (AAB)

### Aggiorna Versione

**File:** `frontend/android/app/build.gradle`

```gradle
defaultConfig {
    applicationId "finance.quota.app"
    minSdkVersion 24
    targetSdkVersion 36
    versionCode 1        // ← Primo rilascio = 1
    versionName "1.0"    // ← Prima versione pubblica = 1.0
    ...
}
```

### Build e Firma AAB

```bash
cd frontend
build-and-sign-release.bat
```

**Lo script:**
1. ✅ Pulisce build precedenti
2. ✅ Builda web app (React)
3. ✅ Sync Capacitor
4. ✅ Builda Android App Bundle (AAB)
5. ✅ Firma AAB con keystore
6. ✅ Verifica firma

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

**Tempo:** ~5-10 minuti

---

## 🚀 FASE 5: Crea App su Play Console

### 1. Crea Nuova App

1. **Login:** [Google Play Console](https://play.google.com/console)
2. **Click:** "Crea app"
3. **Compila:**
   - Nome app: **QUOTA**
   - Lingua predefinita: **Italiano**
   - App o gioco: **App**
   - Gratuita o a pagamento: **Gratuita**
4. **Accetta:** Dichiarazioni (contenuti conformi alle policy)

### 2. Compila Scheda del Negozio

**Vai a:** Dashboard → Presenza su Google Play → Scheda del negozio principale

#### **Dettagli App**

**Nome app:** (30 caratteri max)
```
QUOTA - Portfolio Backtest
```

**Descrizione breve:** (80 caratteri max)
```
Simula strategie di investimento con 30+ anni di dati storici reali
```

**Descrizione completa:** (4000 caratteri max)
```
QUOTA è una piattaforma di backtest portfolio che ti permette di simulare come sarebbe andato il tuo portafoglio investendo nel passato.

🎯 FUNZIONALITÀ PRINCIPALI

📊 70+ Asset Disponibili
- 22 ETF (SPY, QQQ, VOO, VTI...)
- 20 Stocks (AAPL, MSFT, GOOGL, AMZN...)
- 13 Crypto (Bitcoin, Ethereum, Solana...)
- 12 Commodities (Oro, Argento, Petrolio...)
- 15 Bond (AGG, BND, TLT...)
- 8 Real Estate (VNQ, IYR...)

📈 Dati Storici Reali
- Fino a 30+ anni di storico
- SPY dal 1993
- Dati aggiornati quotidianamente

💼 Backtest Completi
- Lump Sum (investimento singolo)
- PAC - Piano di Accumulo Capitale
- Ribilanciamento periodico (mensile/trimestrale/annuale)

📊 Metriche Avanzate
- Rendimento totale e CAGR
- Sharpe Ratio
- Volatilità
- Max Drawdown
- Best/Worst day

💾 Cloud Sync
- Salva backtest illimitati
- Confronta fino a 4 strategie
- Accesso da qualsiasi dispositivo

🎨 Interfaccia Moderna
- Dark/Light mode
- Grafici interattivi
- Design responsive

⚡ Ribilanciamento Smart
- Calcolatore automatico
- Simula vendite/acquisti
- Ottimizza allocazioni

🌍 Multilingua
- Italiano
- English

⚠️ DISCLAIMER
Questo strumento è per scopi educativi e di ricerca. I risultati storici non garantiscono performance future. Non costituisce consulenza finanziaria.

📧 SUPPORTO
Email: support@quota.finance
Web: https://quota.finance
```

#### **Asset Grafici**

Upload:
- ✅ Icona app (512x512)
- ✅ Feature graphic (1024x500)
- ✅ Screenshot telefono (min 2)

#### **Classificazione App**

- **Categoria:** Finanza
- **Email contatto:** tuo@email.com (visibile pubblicamente)
- **Sito web:** https://quota.finance

### 3. Configura Classificazione Contenuti

**Vai a:** Presenza su Google Play → Classificazione contenuti

**Questionario:**
1. Email contatto
2. Categoria: **Utilità o produttività**
3. L'app contiene violenza? **No**
4. Contenuti sessuali? **No**
5. Linguaggio volgare? **No**
6. Temi sensibili? **Sì - Contenuti finanziari** (backtest, investimenti)
7. Invia questionario

**Google assegna età:** Probabilmente 3+ o 7+

### 4. Imposta Target e Contenuti

**Vai a:** Criteri di idoneità → Target e contenuti

- **Target audience:** Adulti (18+)
- **Bambini:** L'app è progettata per bambini? **No**
- **App per famiglie:** Vuoi partecipare? **No**

### 5. Privacy Policy

**Obbligatoria per app con dati utente (Firebase Auth!)**

**Opzioni:**
1. Crea privacy policy (puoi usare generatori gratuiti)
2. Hosta su `https://quota.finance/privacy-policy`
3. Inserisci URL in Play Console

**Punti da includere:**
- Raccolta email per autenticazione
- Uso Firebase per auth e storage
- Dati backtest salvati su cloud
- Non vendiamo dati a terzi
- Conformità GDPR (se in EU)

### 6. Sicurezza dei Dati

**Vai a:** Criteri di idoneità → Sicurezza dei dati

**Domande:**
1. **Raccogli o condividi dati utente?** Sì
   - Email (obbligatorio per account)
   - Portfolio data (backtest salvati)

2. **Dati cifrati in transito?** Sì (HTTPS, Firebase)

3. **Gli utenti possono richiedere eliminazione?** Sì
   - Possono eliminare account da app
   - O contattare support@quota.finance

4. **Certificazioni sicurezza?** No (opzionale)

---

## 📤 FASE 6: Upload AAB e Rilascio

### 1. Crea Rilascio di Produzione

**Vai a:** Rilascio → Produzione → Crea nuova versione

### 2. Upload AAB

- **Click:** "Carica" → seleziona `app-release.aab`
- Google processa il file (1-2 minuti)
- Appare summary con:
  - Dimensione APK (~28 MB)
  - Versioni supportate (Android 7.0+)
  - Permessi richiesti (internet)

### 3. Note Versione

**Cosa c'è di nuovo (max 500 caratteri per lingua):**

**Italiano:**
```
Versione 1.0 - Prima Versione Ufficiale

🎉 Benvenuto su QUOTA!

✨ Funzionalità:
• 70+ asset (ETF, Stocks, Crypto, Commodities, Bonds, Real Estate)
• Backtest con dati storici fino a 30+ anni
• Salvataggio cloud illimitato
• Confronto strategie multiple
• Ribilanciamento portfolio intelligente
• Dark/Light mode
• Interfaccia multilingua (IT/EN)

📊 Inizia a simulare le tue strategie di investimento!
```

**English:**
```
Version 1.0 - First Official Release

🎉 Welcome to QUOTA!

✨ Features:
• 70+ assets (ETF, Stocks, Crypto, Commodities, Bonds, Real Estate)
• Backtest with up to 30+ years of historical data
• Unlimited cloud saving
• Compare multiple strategies
• Smart portfolio rebalancing
• Dark/Light mode
• Multi-language interface (IT/EN)

📊 Start simulating your investment strategies!
```

### 4. Revisione e Invio

1. **Rivedi tutto:**
   - Scheda negozio completa ✅
   - Classificazione contenuti ✅
   - Privacy policy ✅
   - AAB caricato ✅
   - Note versione ✅

2. **Click:** "Rivedi versione"
3. **Click:** "Inizia rollout in produzione"

**Messaggio conferma:** "Versione inviata per revisione"

---

## ⏳ FASE 7: Revisione Google

### Cosa Succede

1. **Google revisiona app** (automatica + manuale)
   - Controlli sicurezza
   - Policy compliance
   - Funzionalità app
   - Contenuti appropriati

2. **Tempo medio:** 1-3 giorni (raramente fino a 7)

3. **Notifiche via email:**
   - Revisione iniziata
   - App approvata ✅ o rigettata ❌

### Se Approvata ✅

**Email:** "Your app is now live on Google Play"

**L'app sarà disponibile su Play Store entro 1-2 ore**

Link: `https://play.google.com/store/apps/details?id=finance.quota.app`

### Se Rigettata ❌

**Email:** Spiega motivo rigetto

**Cause comuni:**
- Privacy policy mancante/incompleta
- Screenshot non chiari
- Descrizione fuorviante
- Permessi non giustificati

**Soluzione:**
1. Leggi email con dettagli
2. Correggi problema
3. Invia nuova versione
4. Nuova revisione (1-3 giorni)

---

## 🎉 POST-PUBBLICAZIONE

### App Live - Cosa Fare

1. **Verifica su Play Store:**
   - Cerca "QUOTA" su Play Store
   - Verifica tutti i dettagli siano corretti
   - Testa download e installazione

2. **Monitora:**
   - **Play Console → Dashboard** - download, crash, recensioni
   - **Firebase Analytics** - utilizzo app
   - **Crashlytics** (se attivo) - errori

3. **Rispondi recensioni:**
   - Leggi feedback utenti
   - Rispondi (soprattutto negativi)
   - Implementa suggerimenti

4. **Promuovi:**
   - Condividi link su social
   - Aggiungi badge Play Store su sito web
   - Email newsletter

### Badge Play Store per Sito

```html
<a href="https://play.google.com/store/apps/details?id=finance.quota.app">
  <img
    alt="Get it on Google Play"
    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
    width="200"
  />
</a>
```

---

## 🔄 AGGIORNAMENTI FUTURI

### Quando Rilasciare Nuova Versione

**Ogni 2-3 settimane** (come pianificato):

1. **Incrementa versione:**
   ```gradle
   versionCode 2        // +1
   versionName "1.1"    // MAJOR.MINOR
   ```

2. **Build e firma:**
   ```bash
   build-and-sign-release.bat
   ```

3. **Play Console → Produzione → Nuova versione**

4. **Upload AAB + note versione**

5. **Invio → revisione (1-2 giorni, più veloce dopo la prima)**

---

## 💰 COSTI TOTALI

| Voce | Costo | Frequenza |
|------|-------|-----------|
| Google Play Developer | €25 | Una tantum (lifetime) |
| Firebase (Spark plan) | €0 | Finché sotto limiti free |
| Vercel (web hosting) | €0 | Piano hobby |
| **TOTALE INIZIALE** | **€25** | **Una tantum** |
| **TOTALE MENSILE** | **€0** | **(se sotto limiti free)** |

**Note:**
- Firebase free tier: 10k utenti attivi/mese, 1 GB storage
- Se cresci: Firebase Blaze (pay-as-you-go, ~€10-50/mese)

---

## 📋 CHECKLIST COMPLETA

### Pre-Pubblicazione

- [ ] Account Google Play creato (€25)
- [ ] Keystore creato e salvato in 3 luoghi
- [ ] Password keystore salvate in password manager
- [ ] Icona 512x512 pronta
- [ ] Screenshot (min 2) pronti
- [ ] Feature graphic 1024x500 pronto
- [ ] Privacy policy scritta e online
- [ ] versionCode = 1, versionName = "1.0"

### Google Play Console

- [ ] App creata
- [ ] Scheda negozio compilata (nome, descrizioni)
- [ ] Asset grafici caricati
- [ ] Classificazione contenuti completata
- [ ] Target audience impostato
- [ ] Privacy policy URL inserito
- [ ] Sicurezza dati configurata

### Build e Upload

- [ ] `build-and-sign-release.bat` eseguito con successo
- [ ] AAB firmato (app-release.aab)
- [ ] AAB caricato su Play Console
- [ ] Note versione scritte (IT + EN)
- [ ] Revisione finale completata
- [ ] Versione inviata per revisione

### Post-Approvazione

- [ ] App live verificata su Play Store
- [ ] Download e installazione testati
- [ ] Badge Play Store aggiunto al sito
- [ ] Link condiviso
- [ ] Monitoraggio attivato

---

## 🆘 TROUBLESHOOTING

### "Signature verification failed"
→ Password keystore errata o file corrotto
→ Ricrea keystore (MA non potrai aggiornare app esistente!)

### "Package name already in use"
→ Qualcun altro ha già `finance.quota.app`
→ Cambia in `build.gradle`: `applicationId "com.tuonome.quota"`

### "Privacy policy required"
→ Aggiungi URL privacy policy in Play Console
→ Crea pagina su quota.finance/privacy

### "Upload failed: APK not signed"
→ Devi firmare con jarsigner
→ Usa `build-and-sign-release.bat`

### "Version code must be greater than previous"
→ Incrementa `versionCode` in build.gradle
→ Ogni upload richiede versionCode maggiore

---

## 📞 RISORSE UTILI

- **Play Console:** https://play.google.com/console
- **Policy Google Play:** https://play.google.com/about/developer-content-policy
- **Badge Generator:** https://play.google.com/intl/en_us/badges
- **Privacy Policy Generator:** https://www.privacypolicygenerator.info
- **Android Asset Studio:** https://romannurik.github.io/AndroidAssetStudio

---

**Prossimo rilascio previsto:** [Data]
**Ultima modifica:** Marzo 2026
