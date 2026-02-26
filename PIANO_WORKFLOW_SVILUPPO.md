# Piano Workflow Sviluppo - Modifiche, Fix e Aggiornamenti

## 🔄 Come Funziona il Deployment Continuo

Una volta configurato Vercel + GitHub (vedi PIANO_DEPLOYMENT.md), il processo è **completamente automatico**:

```
┌─────────────────────────────────────────────────────┐
│  TU fai modifiche in locale                         │
│  ↓                                                   │
│  Commit + Push su GitHub                            │
│  ↓                                                   │
│  Vercel rileva automaticamente il push              │
│  ↓                                                   │
│  Build automatico (2-3 minuti)                      │
│  ↓                                                   │
│  Deploy automatico in produzione                    │
│  ↓                                                   │
│  Sito aggiornato - ZERO configurazione manuale      │
└─────────────────────────────────────────────────────┘
```

**Tempo totale:** ~5 minuti dal commit al sito aggiornato ✨

---

## 🛠️ Workflow per Diversi Tipi di Modifiche

### Scenario 1: **Piccola modifica/fix veloce** (es. typo, piccolo bug)

```bash
# 1. Assicurati di essere aggiornato
cd "C:\Users\edoni\Desktop\ETF ECC"
git pull origin main

# 2. Fai le modifiche (ad esempio fix typo in un componente)
# Modifica file con VSCode/editor

# 3. Testa in locale
cd frontend
npm run dev
# Apri http://localhost:5173 e verifica che tutto funzioni

# 4. Commit e push
git add .
git commit -m "Fix: corretto typo nella landing page"
git push origin main

# 5. Vercel rebuilda automaticamente
# Vai su vercel.com → vedi il deployment in corso
# Dopo 2-3 minuti: sito aggiornato! ✅
```

**Tempo totale: 5-10 minuti**

---

### Scenario 2: **Feature più grande** (es. nuovo template, nuova metrica)

Per modifiche più sostanziali, usa **Git Branches** per evitare di rompere la produzione:

```bash
# 1. Crea un branch per la feature
git checkout -b feature/add-crypto-template

# 2. Lavora sulla feature
# Fai modifiche, test, iterazioni...
cd frontend
npm run dev  # testa continuamente

# 3. Quando sei soddisfatto, fai commit
git add .
git commit -m "Add: nuovo template 100% crypto portfolio"

# 4. Push del branch (NON su main ancora!)
git push origin feature/add-crypto-template

# 5. Vercel crea AUTOMATICAMENTE un "Preview Deployment"
# Ti dà un URL tipo: https://etf-backtest-git-feature-add-crypto-xxx.vercel.app
# Puoi testare la feature online senza toccare il sito principale!

# 6. Se tutto ok, mergi su main
git checkout main
git merge feature/add-crypto-template
git push origin main

# 7. Vercel deploya automaticamente in produzione
```

**Vantaggi:**
- ✅ Sito principale non viene mai rotto
- ✅ Puoi testare online prima di deployare
- ✅ Colleghi/amici possono vedere preview
- ✅ Puoi lavorare su più features contemporaneamente

---

### Scenario 3: **Bug critico in produzione** 🚨

Succede. Il sito è online, qualcosa non funziona. Ecco come gestirlo:

#### Opzione A: Fix rapido e deploy

```bash
# 1. Identifica il problema
# Guarda Vercel logs: Dashboard → Deployments → Runtime Logs

# 2. Fix veloce in locale
# Modifica il codice

# 3. Test veloce
npm run dev

# 4. Deploy immediato
git add .
git commit -m "Hotfix: risolto bug caricamento dati crypto"
git push origin main

# Deploy in 2-3 minuti
```

#### Opzione B: Rollback immediato

Se il bug è grave e il fix richiede tempo:

```
Su Vercel Dashboard:
1. Vai a "Deployments"
2. Trova l'ultimo deployment funzionante
3. Click "..." → "Promote to Production"
4. Sito torna alla versione precedente in 30 secondi!

Poi fix con calma e re-deploy
```

---

## 🌍 Ambienti: Development vs Staging vs Production

### Setup Multi-Ambiente

```
┌──────────────────────────────────────────────────┐
│  AMBIENTE LOCALE (il tuo computer)               │
│  - npm run dev                                   │
│  - Modifiche e test rapidi                      │
│  - Non visibile a nessuno                        │
└──────────────────────────────────────────────────┘
                    ↓ (git push branch)
┌──────────────────────────────────────────────────┐
│  STAGING/PREVIEW (Vercel automatic)              │
│  - URL: feature-xyz.vercel.app                   │
│  - Test features prima di produzione             │
│  - Condivisibile con beta tester                 │
└──────────────────────────────────────────────────┘
                    ↓ (merge to main)
┌──────────────────────────────────────────────────┐
│  PRODUZIONE (tuodominio.com)                     │
│  - Sito pubblico                                 │
│  - Utenti reali                                  │
│  - Deployment solo dopo test                     │
└──────────────────────────────────────────────────┘
```

---

## 📋 Best Practices

### 1. **Sempre testare in locale PRIMA di pushare**

```bash
# SEMPRE fai questo prima di git push:
cd frontend
npm run build  # Verifica che il build funzioni
npm run preview  # Testa il build locale

# Apri http://localhost:4173
# Testa tutte le funzionalità modificate
# Solo poi: git push
```

### 2. **Commit messages descrittivi**

#### ❌ BAD
```bash
git commit -m "fix"
git commit -m "changes"
git commit -m "update"
```

#### ✅ GOOD
```bash
git commit -m "Fix: grafico confronto con date diverse"
git commit -m "Add: template 60/40 stocks/bonds"
git commit -m "Update: migliorato calcolo Sharpe Ratio"
git commit -m "Refactor: ottimizzato dataLoader per performance"
```

**Formato consigliato:**
- `Fix:` - Correzione bug
- `Add:` - Nuova feature
- `Update:` - Miglioramento feature esistente
- `Refactor:` - Refactoring codice (stesso comportamento)
- `Docs:` - Documentazione
- `Style:` - Formattazione, CSS

### 3. **Branch naming conventions**

```bash
feature/nome-feature    # Nuove funzionalità
fix/nome-bug           # Bug fix
hotfix/critical-bug    # Bug critici in produzione
refactor/nome          # Refactoring
docs/nome              # Documentazione
```

### 4. **Piccoli commit frequenti > grandi commit rari**

#### ✅ GOOD - Commit incrementali
```bash
git commit -m "Add: struttura base LoginModal"
git commit -m "Add: form validation per login"
git commit -m "Add: integrazione Firebase Auth"
git commit -m "Add: error handling login"
```

#### ❌ BAD - Un commit gigante
```bash
git commit -m "Add: tutto il sistema di login completo"
```

---

## 🔍 Monitoraggio e Debugging Post-Deploy

### Vercel Dashboard Tools

#### 1. Deployment Logs
```
Dashboard → Deployments → Click su deployment → "View Function Logs"
```

Vedi:
- Build logs (errori compilation)
- Runtime logs (errori durante esecuzione)
- Request logs

#### 2. Analytics
```
Dashboard → Analytics
```

Vedi:
- Traffico real-time
- Performance (Core Web Vitals)
- Top pages
- Errori 404/500

#### 3. Runtime Error Tracking (Opzionale)

Per errori JavaScript lato client, considera **Sentry** (gratis fino a 5k errori/mese):

```bash
npm install @sentry/react
```

```typescript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@sentry.io/xxx",
  environment: import.meta.env.MODE, // 'production' o 'development'
  tracesSampleRate: 1.0,
});
```

Ora ricevi email automatiche quando qualcosa va storto!

---

## 🚦 Workflow Completo Consigliato

### Per modifiche NON urgenti

```
┌─────────────────────────────────────────────────┐
│ 1. Pianifica modifica                           │
│    - Scrivi cosa vuoi fare                      │
│    - Identifica file da modificare              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. Crea branch                                  │
│    git checkout -b feature/nome                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. Sviluppa in locale                           │
│    npm run dev                                  │
│    Modifica, testa, ripeti                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. Test build produzione locale                 │
│    npm run build && npm run preview             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 5. Commit e push branch                         │
│    git add . && git commit -m "..."             │
│    git push origin feature/nome                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 6. Test Preview Deployment                      │
│    Vercel crea URL preview automatico           │
│    Testa online                                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 7. Merge su main se OK                          │
│    git checkout main                            │
│    git merge feature/nome                       │
│    git push origin main                         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 8. Deploy automatico in produzione              │
│    Vercel rebuilda e deploya                    │
│    2-3 minuti                                   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 9. Verifica produzione                          │
│    Apri tuodominio.com                          │
│    Testa funzionalità modificata                │
│    Check analytics/logs per errori              │
└─────────────────────────────────────────────────┘
```

---

## 🆘 Troubleshooting Comuni

### Problema 1: "Build failed" su Vercel

**Causa:** Errori TypeScript o dipendenze mancanti

**Soluzione:**
```bash
# Test build in locale PRIMA di pushare
cd frontend
npm run build

# Se fallisce, fix errori
# Se passa, puoi pushare
```

### Problema 2: "Funziona in locale ma non in produzione"

**Causa comune:** Environment variables o path assoluti

**Soluzione:**
```typescript
// ❌ BAD - Path assoluto Windows
const data = await fetch('C:/Users/edoni/data.json');

// ✅ GOOD - Path relativo
const data = await fetch('/data/data.json');
```

### Problema 3: "Deploy lentissimo (>10 minuti)"

**Causa:** File troppo grandi o dipendenze pesanti

**Soluzione:**
```bash
# Verifica dimensione node_modules
cd frontend
du -sh node_modules

# Pulisci e reinstalla
rm -rf node_modules package-lock.json
npm install

# Verifica file .gitignore escluda node_modules
```

### Problema 4: "Dati JSON non caricano in produzione"

**Causa:** File non in cartella `public/`

**Soluzione:**
```bash
# ✅ Verifica che JSON siano in:
frontend/public/data/*.json

# ❌ NON in:
data/*.json  # Fuori da frontend
```

### Problema 5: "Deployment bloccato su 'Building...'"

**Causa:** Build timeout o processo infinito

**Soluzione:**
```bash
# 1. Cancella deployment su Vercel dashboard
# 2. Verifica build locale funzioni:
npm run build

# 3. Se passa, re-push:
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

---

## 📊 Esempio Workflow Reale

**Scenario:** Vuoi aggiungere un nuovo template "Aggressive Growth"

```bash
# ═══════════════════════════════════════════════════
# GIORNO 1: Sviluppo
# ═══════════════════════════════════════════════════

# 1. Crea branch
git checkout -b feature/aggressive-growth-template

# 2. Modifica frontend/src/components/PortfolioTemplates.tsx
# Aggiungi nuovo template:
{
  name: 'Aggressive Growth',
  description: 'High risk, high potential return',
  allocations: [
    { symbol: 'QQQ', percentage: 50 },
    { symbol: 'VWO', percentage: 30 },
    { symbol: 'BTC-USD', percentage: 20 }
  ]
}

# 3. Test in locale
cd frontend
npm run dev
# Apri http://localhost:5173
# Verifica template appare e funziona

# 4. Commit
git add frontend/src/components/PortfolioTemplates.tsx
git commit -m "Add: template Aggressive Growth (50% QQQ, 30% VWO, 20% BTC)"

# 5. Push branch
git push origin feature/aggressive-growth-template

# 6. Vercel crea preview URL automaticamente
# URL: https://etf-backtest-git-feature-aggressive-xxx.vercel.app
# Email/notifica da Vercel con link

# 7. Testa preview online
# Apri URL preview
# Testa template funziona online
# Condividi URL con amico per feedback

# ═══════════════════════════════════════════════════
# GIORNO 2: Deploy in produzione
# ═══════════════════════════════════════════════════

# 8. Tutto ok? Merge su main
git checkout main
git pull origin main  # Assicurati di essere aggiornato
git merge feature/aggressive-growth-template

# 9. Push su main
git push origin main

# 10. Vercel deploya automaticamente
# Vai su vercel.com → vedi deployment in corso
# Ricevi email "Deployment Ready"
# Dopo 2-3 minuti: https://tuodominio.com aggiornato!

# 11. Verifica produzione
# Apri tuodominio.com
# Testa nuovo template
# Check Vercel Analytics per errori

# 12. Cleanup branch (opzionale)
git branch -d feature/aggressive-growth-template
git push origin --delete feature/aggressive-growth-template

# ═══════════════════════════════════════════════════
# DONE! ✅
# ═══════════════════════════════════════════════════
```

---

## 🔄 Aggiornamento Dati Storici

Quando vorrai aggiornare i dati JSON con nuove quotazioni:

```bash
# 1. Esegui script Python in locale
cd "C:\Users\edoni\Desktop\ETF ECC"
python download_data.py

# Lo script scarica dati aggiornati da Yahoo Finance

# 2. Verifica file aggiornati
ls -lh data/
# Dovresti vedere date modifiche recenti

# 3. Copia in frontend/public/data
cp data/*.json frontend/public/data/

# 4. Commit e push
git add frontend/public/data/
git commit -m "Update: dati storici aggiornati a $(date +%B\ %Y)"
git push origin main

# 5. Vercel rebuilda con nuovi dati
# 2-3 minuti → sito ha dati freschi! ✅
```

### Automazione Futura (GitHub Actions)

Puoi automatizzare l'aggiornamento dati mensilmente:

```yaml
# .github/workflows/update-data.yml
name: Update Historical Data

on:
  schedule:
    - cron: '0 0 1 * *'  # Primo giorno del mese
  workflow_dispatch:  # Manuale

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Download data
        run: python download_data.py

      - name: Copy to frontend
        run: cp data/*.json frontend/public/data/

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add frontend/public/data/
          git commit -m "Auto: update historical data $(date +%Y-%m-%d)"
          git push
```

---

## 📝 Checklist Prima di Ogni Deploy

```
Modifiche pronte per deploy?

□ Testato in locale (npm run dev)
□ Build passa (npm run build)
□ Preview locale funziona (npm run preview)
□ Commit message descrittivo
□ Nessun console.log dimenticato nel codice
□ Nessun TODO critico rimasto
□ File sensibili non committati (.env)
□ Branch aggiornato con main (se applicabile)
□ Nessun warning critico TypeScript

Se tutto ✅ → git push!
```

---

## 💡 Tips & Tricks

### 1. **Alias Git utili**

Aggiungi al file `~/.gitconfig` (o `C:\Users\TUO_USER\.gitconfig` su Windows):

```bash
[alias]
    st = status
    co = checkout
    br = branch
    cm = commit -m
    pom = push origin main
    poh = push origin HEAD
    last = log -1 HEAD
    unstage = reset HEAD --
    graph = log --graph --oneline --all
```

**Uso:**
```bash
git st              # invece di git status
git cm "Fix bug"    # invece di git commit -m "Fix bug"
git pom             # invece di git push origin main
git graph           # visualizza grafico branch
```

### 2. **VSCode Git Integration**

Usa interfaccia grafica di VSCode invece del terminale:

1. **Source Control panel** (icona branch a sinistra)
2. Vedi tutte le modifiche visualizzate
3. Commit con click
4. Push con click
5. Gestione branch visuale
6. Diff integrato

**NO bisogno terminale per operazioni base!**

### 3. **Vercel CLI per deploy da terminale**

```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy production da terminale
cd "C:\Users\edoni\Desktop\ETF ECC"
vercel --prod

# Deploy preview
vercel
```

### 4. **Notifiche Deployment**

Configura notifiche Vercel:

1. Dashboard Vercel → Settings → Notifications
2. Abilita:
   - Email quando deploy completa ✅
   - Email quando deploy fallisce ❌
   - Slack/Discord integration (opzionale)

### 5. **Environment Variables per diversi ambienti**

Se in futuro servono config diverse per dev/prod:

```typescript
// Vercel Dashboard → Settings → Environment Variables
// Aggiungi variabili:
// - VITE_API_URL (production): https://api.tuodominio.com
// - VITE_API_URL (preview): https://api-staging.tuodominio.com

// Nel codice:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### 6. **Git Hooks per validazioni automatiche**

Previeni commit con errori TypeScript:

```bash
# Installa husky
npm install --save-dev husky

# Inizializza hooks
npx husky init

# Crea pre-commit hook
echo "cd frontend && npm run build" > .husky/pre-commit
```

Ora ogni commit esegue build - se fallisce, commit bloccato! ✅

---

## 🔐 Best Practices Sicurezza

### 1. **Non committare file sensibili**

```bash
# Verifica .gitignore include:
.env
.env.local
.env.production
*.key
*.pem
credentials.json
config/secrets.json
```

### 2. **Environment Variables su Vercel**

Mai mettere API keys nel codice:

```typescript
// ❌ BAD
const STRIPE_KEY = 'sk_live_xxxxxxxxxxxxx';

// ✅ GOOD
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
```

Configura su Vercel Dashboard → Settings → Environment Variables

### 3. **Verifica cosa viene committato**

```bash
# Prima di commit, controlla:
git status
git diff

# Mostra cosa sarà committato:
git diff --cached
```

---

## 📊 Monitoraggio Performance Post-Deploy

### Core Web Vitals da monitorare

**1. Largest Contentful Paint (LCP)**
- Target: < 2.5s
- Misura: Tempo caricamento contenuto principale
- Come migliorare: Ottimizza immagini, lazy loading

**2. First Input Delay (FID)**
- Target: < 100ms
- Misura: Reattività a primo input utente
- Come migliorare: Riduci JavaScript blocking

**3. Cumulative Layout Shift (CLS)**
- Target: < 0.1
- Misura: Stabilità visuale (elementi che saltano)
- Come migliorare: Definisci dimensioni immagini, evita content injection

**Controlla su:**
- Vercel Analytics → Performance
- Google PageSpeed Insights: https://pagespeed.web.dev

---

## 🎯 Comandi Git Comuni Quick Reference

```bash
# ════════════════════════════════════════════════════
# SETUP INIZIALE (una volta)
# ════════════════════════════════════════════════════
git config --global user.name "Tuo Nome"
git config --global user.email "tua@email.com"

# ════════════════════════════════════════════════════
# WORKFLOW QUOTIDIANO
# ════════════════════════════════════════════════════

# Vedere stato modifiche
git status

# Vedere differenze
git diff

# Aggiungere file modificati
git add .                    # Tutti i file
git add file.tsx             # File specifico

# Commit
git commit -m "Messaggio"

# Push su GitHub
git push origin main

# Pull (scaricare aggiornamenti)
git pull origin main

# ════════════════════════════════════════════════════
# BRANCHES
# ════════════════════════════════════════════════════

# Creare branch
git checkout -b feature/nome

# Cambiare branch
git checkout main
git checkout feature/nome

# Vedere tutti i branch
git branch

# Mergare branch
git checkout main
git merge feature/nome

# Eliminare branch
git branch -d feature/nome                    # Locale
git push origin --delete feature/nome        # Remoto

# ════════════════════════════════════════════════════
# UNDO / ROLLBACK
# ════════════════════════════════════════════════════

# Annullare modifiche non committate
git restore file.tsx         # File specifico
git restore .                # Tutti i file

# Annullare ultimo commit (mantiene modifiche)
git reset --soft HEAD~1

# Annullare ultimo commit (elimina modifiche) ⚠️
git reset --hard HEAD~1

# Annullare file da staging
git restore --staged file.tsx

# ════════════════════════════════════════════════════
# VISUALIZZAZIONE
# ════════════════════════════════════════════════════

# Vedere storia commit
git log
git log --oneline            # Compatto
git log --graph --all        # Grafico branch

# Vedere ultimo commit
git show

# Vedere chi ha modificato cosa
git blame file.tsx

# ════════════════════════════════════════════════════
# STASH (salvare modifiche temporaneamente)
# ════════════════════════════════════════════════════

# Salvare modifiche senza commit
git stash

# Ripristinare modifiche salvate
git stash pop

# Vedere stash salvati
git stash list
```

---

## 🚨 Comandi di Emergenza

### Reset completo al repository remoto

```bash
# ⚠️ ATTENZIONE: Elimina TUTTE le modifiche locali

# Scarica ultimo stato da GitHub
git fetch origin

# Resetta completamente a GitHub main
git reset --hard origin/main

# Forza push (solo se necessario)
git push --force origin main
```

### Ripristino file specifico da commit precedente

```bash
# Vedere storia commit di un file
git log -- path/to/file.tsx

# Ripristinare file da commit specifico
git checkout <commit-hash> -- path/to/file.tsx
git commit -m "Restore: ripristinato file.tsx da commit precedente"
```

---

## 📚 Risorse Utili

### Documentazione
- **Git Basics**: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Docs**: https://docs.github.com

### Tool Visuali
- **GitHub Desktop**: https://desktop.github.com (Git GUI)
- **GitKraken**: https://gitkraken.com (Git client avanzato)
- **VSCode Git Integration**: Built-in

### Cheat Sheets
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Vercel CLI**: https://vercel.com/docs/cli

---

## ✅ Riepilogo Workflow Standard

**Per modifiche normali:**
1. `git pull origin main` - Aggiorna
2. Modifica codice
3. `npm run dev` - Testa locale
4. `npm run build` - Verifica build
5. `git add .` - Stage modifiche
6. `git commit -m "Tipo: descrizione"` - Commit
7. `git push origin main` - Deploy automatico

**Per feature grandi:**
1. `git checkout -b feature/nome` - Branch
2. Sviluppa e testa
3. `git push origin feature/nome` - Preview deployment
4. Testa preview online
5. `git checkout main && git merge feature/nome` - Merge
6. `git push origin main` - Deploy produzione

**Per emergenze:**
1. Vercel Dashboard → Rollback
2. Oppure hotfix rapido e push

---

**Ultimo aggiornamento:** 26 Febbraio 2026

🎯 **Prossimi passi:** Dopo deployment iniziale (PIANO_DEPLOYMENT.md), usa questo workflow per tutti gli aggiornamenti futuri!
