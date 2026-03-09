# 🛠️ QUOTA - Development Guide

**Guida completa per sviluppo web, mobile e deployment**

---

## 📋 Indice

1. [Setup Iniziale](#-setup-iniziale)
2. [Sviluppo Web](#-sviluppo-web)
3. [Sviluppo Mobile](#-sviluppo-mobile)
4. [Deploy Produzione](#-deploy-produzione)
5. [Play Store Release](#-play-store-release)
6. [Troubleshooting](#-troubleshooting)

---

## 🚀 Setup Iniziale

### Prerequisiti

- Node.js 18+
- Git
- Java 17 (per Android)
- Android Studio (opzionale, per mobile)

### Prima Volta

```bash
# 1. Clone repository
git clone https://github.com/MajinBull/Quota.git
cd Quota/frontend

# 2. Installa dipendenze
npm install

# 3. Crea file .env (chiedi le credenziali Firebase)
# Crea: frontend/.env
# Contenuto:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
# ... (altre variabili Firebase)

# 4. Avvia dev server
npm run dev
```

✅ Apri: http://localhost:5173

---

## 💻 Sviluppo Web

### Workflow Quotidiano

```bash
# 1. Avvia dev server
cd frontend
npm run dev

# 2. Modifica codice in src/
# → Auto-reload istantaneo

# 3. Quando pronto, commit e push
git add .
git commit -m "feat: Descrizione modifiche"
git push

# 4. Vercel deploya automaticamente
# → Live su quota.finance in ~2 min
```

### Comandi Utili

```bash
npm run dev          # Dev server (localhost:5173)
npm run build        # Build produzione
npm run preview      # Preview build locale
npm run lint         # Linter ESLint
```

### Struttura Codice

```
frontend/src/
├── components/        # UI components
│   ├── auth/         # Login, signup, profile
│   ├── PortfolioBuilder.tsx
│   ├── BacktestResults.tsx
│   └── ...
├── pages/            # Route pages
│   └── LandingPage.tsx
├── contexts/         # React Context (Auth, Theme)
├── stores/           # Zustand stores (portfolio, comparison)
├── services/         # Firebase services
├── engine/           # Backtest logic
├── utils/            # Utilities
├── locales/          # Traduzioni i18n (it/en)
└── App.tsx           # Main app
```

### Firebase (Auth + Database)

**Accesso:**
- Console: https://console.firebase.google.com
- Progetto: quota-finance

**Firestore Collections:**
- `users` - Dati utente
- `portfolios` - Portfolio salvati
- `backtests` - Backtest salvati

---

## 📱 Sviluppo Mobile

### Setup Mobile (Prima Volta)

```bash
cd frontend

# Installa Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Aggiungi piattaforma Android
npx cap add android
```

### Build APK per Test

```bash
# Usa script automatico
build-mobile.bat

# O manualmente:
npm run build
npx cap sync android
cd android
gradlew.bat assembleDebug
```

✅ APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Testare su Telefono

**Via USB:**
```bash
# 1. Abilita debug USB su telefono
# 2. Collega telefono a PC
# 3. Build e installa
build-and-install.bat
```

**Via File:**
```bash
# 1. Build APK
build-mobile.bat

# 2. Copia APK su telefono (USB, email, cloud)
# 3. Installa manualmente
```

### Differenze Web vs Mobile

| Feature | Web | Mobile |
|---------|-----|--------|
| **Landing Page** | Mostra | Bypassa → app diretta |
| **Google Sign-In** | Popup browser | SDK nativo Android |
| **Deploy** | Auto (Vercel) | Manuale (Play Store) |
| **Testing** | Browser dev tools | Telefono fisico |

**Come Implementare:**

```tsx
// Controlla se è app mobile
import { isNativePlatform } from './utils/capacitor';

if (isNativePlatform()) {
  // Logica mobile
} else {
  // Logica web
}
```

### Aprire in Android Studio

```bash
npx cap open android
```

---

## 🚀 Deploy Produzione

### Deploy Web (Automatico)

```bash
# Push su GitHub → Auto-deploy Vercel
git add .
git commit -m "Descrizione modifiche"
git push
```

✅ Vercel deploya automaticamente
✅ Live su quota.finance in ~2 minuti

**Verifica Deploy:**
- Dashboard: https://vercel.com/dashboard
- Vedi logs, rollback, analytics

### Workflow Web + Mobile

**Quotidiano (web):**
```bash
# Lavoro normale, push frequenti
git push  # → Auto-deploy
```

**Ogni 2-3 Settimane (mobile):**
```bash
# Accumula modifiche web
# Poi build mobile per Play Store
# Vedi sezione Play Store Release
```

---

## 📦 Play Store Release

### Prima Volta (Setup Account)

**1. Crea Account Google Play Developer**
- Vai su: https://play.google.com/console
- Costo: €25 una tantum
- Serve Google account

**2. Crea Keystore (CRITICO)**

```bash
cd frontend
create-keystore.bat
```

⚠️ **IMPORTANTISSIMO:**
- **Backup keystore in 3 posti sicuri** (password manager, cloud, USB)
- **Senza keystore NON puoi aggiornare app in futuro**
- Password: salvale in password manager

**3. Configura App su Play Console**
- Nome app: QUOTA
- Package name: `finance.quota.app`
- Categoria: Finance
- Carica icone, screenshot, descrizione

### Release Successivi (Ogni 2-3 Settimane)

**Checklist Pre-Release:**

```
[ ] 1. Aggiorna versione in android/app/build.gradle
       versionCode 2      // +1 ogni release
       versionName "1.1.0"

[ ] 2. Testa app su telefono
       build-mobile.bat → Installa → Testa tutto

[ ] 3. Backup prima del build
       backup-project.bat

[ ] 4. Build e firma AAB
       build-and-sign-release.bat
       (inserisci password keystore quando richiesto)

[ ] 5. Verifica AAB firmato
       File: android/app/build/outputs/bundle/release/app-release.aab

[ ] 6. Upload su Play Console
       - Vai su Play Console
       - Production → Create new release
       - Upload app-release.aab
       - Scrivi changelog (cosa è nuovo)
       - Submit for review

[ ] 7. Attendi approvazione (1-7 giorni)

[ ] 8. Create git tag
       git tag -a v1.1.0 -m "Release 1.1.0: [features]"
       git push origin v1.1.0
```

**Script Utili:**

```bash
create-keystore.bat          # Crea keystore (1 volta sola)
build-and-sign-release.bat   # Build + firma AAB per Play Store
build-mobile.bat             # Build APK per test
```

---

## 🐛 Troubleshooting

### Errore: "Firebase not initialized"

**Problema:** File .env mancante o incompleto

**Soluzione:**
```bash
# Verifica .env esiste
ls frontend/.env

# Controlla variabili (tutte presenti?)
cat frontend/.env

# Se mancante, ricrea con credenziali Firebase
# Vedi sezione Setup Iniziale
```

### Errore: "npm install fails"

**Problema:** Conflitti peer dependencies

**Soluzione:**
```bash
# Aggiungi flag legacy-peer-deps
npm install --legacy-peer-deps

# O usa .npmrc (già presente)
echo "legacy-peer-deps=true" > .npmrc
```

### Errore: "Capacitor not found"

**Problema:** Capacitor non installato

**Soluzione:**
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap sync android
```

### Errore: "Google Sign-In not working on Android"

**Problema:** SHA-1 certificate non configurato

**Soluzione:**
```bash
# 1. Ottieni SHA-1 fingerprint
cd frontend/android
gradlew.bat signingReport

# 2. Copia SHA-1 fingerprint
# 3. Vai su Firebase Console → Project Settings
# 4. Android app → Add fingerprint
# 5. Paste SHA-1
# 6. Download google-services.json aggiornato
# 7. Sostituisci in: android/app/google-services.json
```

### Build Android Fallisce

**Problema:** Java version mismatch

**Soluzione:**
```bash
# Verifica Java version
java -version

# Serve Java 17
# Se hai version diversa, installa Java 17
# Oppure forza in build.gradle (già fatto)
```

### App Lenta su Sviluppo

**Problema:** Dev mode non ottimizzato

**Normale!** Build produzione è molto più veloce:
```bash
npm run build
npm run preview
```

### Vercel Deploy Fallisce

**Problema:** Build error

**Soluzione:**
```bash
# 1. Testa build locale
npm run build

# 2. Vedi errori
# 3. Fixa errori
# 4. Commit e push

# 5. Se build locale funziona ma Vercel no:
# → Controlla Vercel dashboard logs
# → Verifica variabili ambiente su Vercel
```

---

## ⚡ Quick Commands Cheat Sheet

```bash
# Development
npm run dev                    # Dev server web
build-mobile.bat              # Build APK mobile

# Deploy
git push                      # Deploy web (auto)
build-and-sign-release.bat    # Release mobile

# Backup
backup-project.bat            # Backup completo

# Firebase
npm run build                 # Test build production
npx cap sync android          # Sync web → mobile

# Android
npx cap open android          # Open Android Studio
gradlew.bat assembleDebug     # Build APK debug
gradlew.bat bundleRelease     # Build AAB release
```

---

## 📚 Risorse Utili

**Documentazione:**
- React: https://react.dev
- Vite: https://vite.dev
- Tailwind: https://tailwindcss.com
- Firebase: https://firebase.google.com/docs
- Capacitor: https://capacitorjs.com

**Dashboard:**
- Vercel: https://vercel.com/dashboard
- Firebase: https://console.firebase.google.com
- Play Console: https://play.google.com/console

**Altro:**
- [BACKUP-GUIDE.md](BACKUP-GUIDE.md) - Backup e restore
- [README.md](README.md) - Dashboard principale

---

**Problemi non risolti?** Controlla Firebase Console logs o Vercel deployment logs.
