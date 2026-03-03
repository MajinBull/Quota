# 🚀 Deploy to Production - Checklist & Instructions

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Build Status
- ✅ **Build completes successfully**: `npm run build` → SUCCESS (0 errors)
- ✅ **Bundle size acceptable**: 647 KB (~192 KB gzipped)
- ✅ **TypeScript compilation**: No errors
- ✅ **All imports resolved**: No missing dependencies

### 2. Security
- ✅ **`.env` file is git-ignored**: Protected in both root and frontend `.gitignore`
- ✅ **No credentials in code**: All Firebase config uses environment variables
- ✅ **Firestore security rules published**: User isolation working
- ✅ **Composite index created**: Query performance optimized

### 3. Firebase Configuration
- ✅ **Firestore rules active**: Published and tested locally
- ✅ **Composite index enabled**: `backtests` collection (userId + savedAt)
- ✅ **Authentication providers enabled**:
  - Email/Password: ✅
  - Google OAuth: ✅
- ✅ **Local testing complete**: All features working

### 4. Testing
- ✅ **Signup/Login tested**: Working
- ✅ **Free tier limit tested**: 5 backtest limit enforced
- ✅ **UpgradeModal tested**: Appears at 6th attempt
- ✅ **Save/Load tested**: Firestore CRUD operations working
- ✅ **Delete modal tested**: Confirmation popup working
- ✅ **User isolation tested**: Cross-user access blocked

---

## 🔐 CRITICAL: Configure Vercel Environment Variables

**IMPORTANTE**: Firebase usa le stesse credenziali per locale e produzione, MA devi configurarle in Vercel perché il file `.env` locale NON viene deployato (è git-ignored per sicurezza).

### Step-by-Step Instructions:

1. **Apri il tuo file `.env` locale**:
   ```bash
   C:\Users\edoni\Desktop\ETF ECC\frontend\.env
   ```

2. **Copia TUTTE le variabili** (dovrebbero essere 6):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. **Vai su Vercel Dashboard**:
   - Apri https://vercel.com/dashboard
   - Seleziona il tuo progetto (probabilmente "ETF-ECC" o simile)
   - Vai su **Settings** → **Environment Variables**

4. **Aggiungi ogni variabile**:
   - Click "Add New"
   - **Name**: `VITE_FIREBASE_API_KEY` (copia esattamente dal .env)
   - **Value**: Il valore corrispondente (es: `AIzaSy...`)
   - **Environments**: Seleziona **Production**, **Preview**, **Development** (tutte e 3)
   - Click "Save"
   - Ripeti per TUTTE le 6 variabili

5. **Verifica le variabili**:
   Dovresti avere 6 variabili configurate:
   ```
   VITE_FIREBASE_API_KEY          → Production, Preview, Development
   VITE_FIREBASE_AUTH_DOMAIN      → Production, Preview, Development
   VITE_FIREBASE_PROJECT_ID       → Production, Preview, Development
   VITE_FIREBASE_STORAGE_BUCKET   → Production, Preview, Development
   VITE_FIREBASE_MESSAGING_SENDER_ID → Production, Preview, Development
   VITE_FIREBASE_APP_ID           → Production, Preview, Development
   ```

---

## 📦 DEPLOYMENT PROCESS

Una volta configurate le environment variables in Vercel, procedi con il deploy:

### Step 1: Stage Files

```bash
cd "C:\Users\edoni\Desktop\ETF ECC"

# Add all modified and new files
git add frontend/src/
git add frontend/package.json
git add frontend/.gitignore
git add frontend/.env.example
git add firestore.rules
git add firestore.indexes.json
git add *.md

# Verify .env is NOT staged (critical!)
git status
```

### Step 2: Verify .env is NOT in commit

**CRITICAL CHECK**:
```bash
git status
```

Verifica che `.env` NON appaia nella lista dei file da committare.
Deve apparire solo in "Untracked files" o essere completamente assente.

✅ **CORRETTO**: `.env` non appare o è in "Untracked files"
❌ **ERRORE**: `.env` appare in "Changes to be committed"

Se appare in "Changes to be committed":
```bash
git reset frontend/.env
git rm --cached frontend/.env
```

### Step 3: Create Commit

```bash
git commit -m "feat: Add Firebase Auth + Firestore integration

- Email/Password & Google OAuth authentication
- Free tier: 5 backtest execution limit
- Firestore database for cloud storage
- User profile with backtest counter
- Premium upgrade modal
- Data compression (~90% reduction)
- Security rules & user isolation
- Delete confirmation modal

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Step 4: Push to GitHub

```bash
git push origin main
```

### Step 5: Monitor Vercel Deployment

1. **Automatic Deploy**: Vercel inizierà il deploy automaticamente
2. **Check Dashboard**: Vai su https://vercel.com/dashboard
3. **Monitor Progress**: Dovresti vedere "Building..." → "Deploying..." → "Ready"
4. **Build Time**: ~1-2 minuti

---

## 🧪 POST-DEPLOYMENT TESTING

Una volta deployato, testa in produzione:

### 1. Open Production URL

Vai al tuo URL production (es: `https://your-app.vercel.app`)

### 2. Critical Tests

- [ ] **AuthModal appare** (force login)
- [ ] **Signup funziona** (crea account)
- [ ] **Login funziona** (email/password)
- [ ] **Google OAuth funziona** (popup Google)
- [ ] **UserProfileButton visibile** con nome utente
- [ ] **Esegui backtest** → counter incrementa (1/5, 2/5, etc.)
- [ ] **Free tier limit enforced** → UpgradeModal al 6° tentativo
- [ ] **Save backtest** → salvato in Firestore
- [ ] **Load backtests** → caricati da Firestore
- [ ] **Delete backtest** → modal conferma appare → elimina correttamente
- [ ] **Vercel Analytics** funziona (check dashboard dopo qualche minuto)

### 3. Firestore Console Check

Vai su [Firebase Console](https://console.firebase.google.com):

- [ ] Vai su **Firestore Database**
- [ ] Verifica che i documenti vengano creati in `users/` e `backtests/`
- [ ] Verifica che `backtestExecutionCount` incrementa correttamente
- [ ] Verifica che ogni backtest ha il campo `userId` corretto

### 4. Cross-Browser Testing

Testa su:
- [ ] Chrome/Edge (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (Mac/iOS)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iPhone)

---

## 🐛 TROUBLESHOOTING

### Build Fails on Vercel

**Sintomi**: Deploy fallisce con errori di build

**Cause possibili**:
1. Environment variables non configurate
2. Typo nei nomi delle variabili
3. Valori mancanti

**Soluzione**:
1. Vai su Vercel → Settings → Environment Variables
2. Verifica che TUTTE le 6 variabili siano presenti
3. Verifica che i nomi siano ESATTAMENTE come in `.env` locale
4. Re-deploy: Deployments → Latest → "Redeploy"

### Firebase Connection Error in Production

**Sintomi**: "Failed to initialize Firebase" o errori auth

**Causa**: Environment variables mancanti o errate

**Soluzione**:
1. Apri Console del browser (F12) in produzione
2. Controlla errori specifici
3. Verifica che le variabili in Vercel matchino il .env locale
4. Se modifichi variabili, devi ri-deployare

### "Missing index" Error

**Sintomi**: Errore quando si caricano i backtest salvati

**Causa**: Composite index non creato in Firebase

**Soluzione**:
1. Clicca sul link nell'errore (crea index automaticamente)
2. Oppure manuale: Firebase Console → Indexes → Create
3. Attendi 2-5 minuti per la costruzione

### Users Can't Login

**Sintomi**: Login fallisce, "auth/operation-not-allowed"

**Causa**: Provider non abilitato in Firebase Console

**Soluzione**:
1. Firebase Console → Authentication → Sign-in method
2. Verifica che Email/Password sia "Enabled"
3. Verifica che Google sia "Enabled"

---

## 📊 EXPECTED PRODUCTION METRICS

Dopo il deploy, dovresti vedere:

### Vercel Analytics
- **First Load**: < 3s
- **Lighthouse Performance**: > 85
- **Bundle Size**: ~647 KB (192 KB gzipped)

### Firebase Usage (Free Tier)
- **Firestore Reads**: ~10-50 per user session
- **Firestore Writes**: ~1-5 per backtest saved
- **Auth Operations**: ~2-3 per login session
- **Storage**: ~5-50 KB per backtest (compressed)

---

## ✅ SUCCESS CHECKLIST

Deploy completato con successo quando:

- [ ] Vercel deployment status = "Ready"
- [ ] Production URL accessibile
- [ ] AuthModal appare correttamente
- [ ] Signup/Login funzionano
- [ ] Free tier limit funziona (5 backtest)
- [ ] Save/Load Firestore funziona
- [ ] No console errors in production
- [ ] Vercel Analytics riceve dati
- [ ] Firebase Firestore riceve documenti

---

## 🎉 CONGRATULATIONS!

Se tutti i check sono ✅, hai deployato con successo:

- ✅ Firebase Authentication (Email + Google OAuth)
- ✅ Firestore Cloud Database
- ✅ Free Tier Limits (5 backtest)
- ✅ Premium Upgrade Path
- ✅ Secure Multi-User Architecture
- ✅ Production-Ready App on Vercel

**Your app is now LIVE! 🚀**

---

## 🔗 Quick Links

- **Production URL**: https://your-app.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com
- **Analytics**: Vercel Dashboard → Your Project → Analytics

---

## 📝 NOTES

### Environment Variables Best Practices
- ✅ Le variabili in Vercel sono sicure (encrypted)
- ✅ Ogni environment (Production/Preview/Development) può avere valori diversi
- ✅ Se cambi le variabili, devi ri-deployare

### Firebase Costs
Con il Free Tier hai:
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Auth**: Unlimited users
- **Hosting**: N/A (usi Vercel)

Per un'app in early stage, il free tier è più che sufficiente!

### Future Improvements
- [ ] Monitoring (Sentry for errors)
- [ ] Email verification flow
- [ ] Stripe integration for premium
- [ ] Advanced analytics
- [ ] Admin dashboard

---

**Ready to deploy? Segui gli step sopra! 🚀**
