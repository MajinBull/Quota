# Piano di Deployment - ETF Backtest Platform

## Obiettivo
Pubblicare online la piattaforma di backtesting ETF utilizzando hosting gratuito Vercel, con dominio personalizzato e analytics integrate.

---

## Panoramica Architettura

**Tipo progetto**: Frontend-only React + TypeScript
**Build tool**: Vite 7.3
**Dati**: 40MB di file JSON statici (25 asset, 20 anni di storico)
**Hosting**: Vercel (gratuito)
**Dominio**: Custom domain (da acquistare)
**Analytics**: Vercel Analytics (gratuito, privacy-focused)

---

## FASE 1: Preparazione Pre-Deployment

### 1.1 Ottimizzazioni Codice

**File da modificare: `frontend/vite.config.ts`**

Aggiungere configurazioni di build ottimizzate:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,              // Rimuove source maps (riduce dimensione bundle)
    chunkSizeWarningLimit: 1000,   // Aumenta limite warning per file grandi
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'utils': ['date-fns', 'zustand']
        }
      }
    }
  }
})
```

**Benefici:**
- Rimuove source maps → riduce dimensione bundle ~30%
- Code splitting intelligente → caricamento più veloce
- Separa librerie esterne → migliore caching

### 1.2 Configurazione Vercel

**File da creare: `vercel.json`** (nella root del progetto)

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/data/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Cosa fa:**
- Definisce comando di build e cartella output
- Configura SPA routing (tutte le route → index.html)
- Cache aggressiva per file JSON (1 anno)

### 1.3 Verifica File Dati

**✅ FATTO:** I file JSON sono già correttamente posizionati in `frontend/public/data/`

File presenti (40MB totali):
- all_assets.json (21 MB)
- etf_historical.json (4.5 MB)
- crypto_historical.json (2.7 MB)
- metals_historical.json (3.8 MB)
- bonds_historical.json (4.5 MB)
- real_estate_historical.json (3.7 MB)
- download_summary.json (1 KB)

**Nessuna azione richiesta** - Vite copia automaticamente `public/` in `dist/` durante il build.

### 1.4 Verifica Build Locale

**Prima di deployare**, testare il build localmente:

```bash
cd frontend
npm run build
npm run preview
```

Aprire http://localhost:4173 e verificare:
- ✅ App carica correttamente
- ✅ Dati JSON vengono caricati
- ✅ Backtest funziona
- ✅ Grafici si visualizzano
- ✅ Nessun errore console

---

## FASE 2: Setup Repository Git/GitHub

### 2.1 Inizializzazione Git (se non già fatto)

**AZIONE UTENTE:**

1. Aprire terminale nella cartella progetto:
```bash
cd "C:\Users\edoni\Desktop\ETF ECC"
git init
```

2. Creare `.gitignore` (se non esiste):
```
# Dependencies
node_modules/
frontend/node_modules/

# Build outputs
frontend/dist/
frontend/dist-ssr/

# Environment files
.env
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Python
__pycache__/
*.pyc
venv/
.venv/

# Logs
*.log
```

3. Commit iniziale:
```bash
git add .
git commit -m "Initial commit - ETF Backtest Platform"
```

### 2.2 Creazione Repository GitHub

**AZIONE UTENTE:**

1. Andare su https://github.com
2. Cliccare "New Repository" (bottone verde in alto a destra)
3. Compilare:
   - **Repository name**: `etf-backtest-platform` (o nome a scelta)
   - **Description**: "Portfolio backtesting platform with 25 assets and 20 years of historical data"
   - **Visibility**: Public (necessario per Vercel gratuito)
   - **NON** selezionare "Initialize with README" (hai già codice locale)
4. Cliccare "Create Repository"

5. Collegare repository locale a GitHub (GitHub fornisce i comandi):
```bash
git remote add origin https://github.com/TUO_USERNAME/etf-backtest-platform.git
git branch -M main
git push -u origin main
```

**Verifica:** Ricaricare la pagina GitHub - dovresti vedere tutti i file del progetto.

---

## FASE 3: Deploy su Vercel

### 3.1 Creazione Account Vercel

**AZIONE UTENTE:**

1. Andare su https://vercel.com
2. Cliccare "Sign Up"
3. Scegliere "Continue with GitHub"
4. Autorizzare Vercel ad accedere al tuo account GitHub
5. Completare onboarding

### 3.2 Import Progetto

**AZIONE UTENTE:**

1. Dalla dashboard Vercel, cliccare "Add New..." → "Project"
2. Nella lista repositories, trovare `etf-backtest-platform`
3. Cliccare "Import"

4. Configurare progetto:
   - **Framework Preset**: Other (lasciare vuoto)
   - **Root Directory**: `./` (root)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`

5. Cliccare "Deploy"

**Tempo stimato:** 2-3 minuti

**Risultato:** URL tipo `https://etf-backtest-platform.vercel.app`

### 3.3 Verifica Deployment

**AZIONE UTENTE:**

Aprire l'URL fornito da Vercel e testare:
- ✅ App carica
- ✅ Navigazione funziona (Configuration, Risultati, Backtest Salvati)
- ✅ Selezionare asset e fare backtest
- ✅ Grafici si visualizzano correttamente
- ✅ Salvare backtest funziona (localStorage)
- ✅ Confronto backtest funziona

**Se ci sono errori:** Controllare i logs nella dashboard Vercel → "Deployments" → cliccare deployment → "Build Logs"

---

## FASE 4: Configurazione Dominio Personalizzato

### 4.1 Acquisto Dominio

**AZIONE UTENTE:**

1. Scegliere registrar dominio (raccomandati):
   - **Namecheap** (https://namecheap.com) - ~10€/anno
   - **Google Domains** (https://domains.google)
   - **Cloudflare Registrar** (https://cloudflare.com) - prezzo base

2. Cercare dominio disponibile (es. `etfbacktest.com`, `portfolioanalyzer.com`, ecc.)

3. Acquistare dominio (costo tipico: 10-15€/anno)

### 4.2 Aggiunta Dominio su Vercel

**AZIONE UTENTE:**

1. Nella dashboard Vercel, aprire il progetto
2. Andare su tab "Settings"
3. Sezione "Domains" → cliccare "Add"
4. Inserire il dominio acquistato (es. `tuodominio.com`)
5. Cliccare "Add"

**Vercel fornirà i DNS records da configurare:**
- Tipo A record: `76.76.21.21`
- CNAME record per www: `cname.vercel-dns.com`

### 4.3 Configurazione DNS

**AZIONE UTENTE:**

1. Tornare al sito del registrar dominio
2. Trovare "DNS Management" o "DNS Settings"
3. Aggiungere i record forniti da Vercel:

**Record A:**
- Type: A
- Name: @ (o lasciare vuoto)
- Value: `76.76.21.21`
- TTL: Automatic (o 3600)

**Record CNAME (per www):**
- Type: CNAME
- Name: www
- Value: `cname.vercel-dns.com`
- TTL: Automatic

4. Salvare modifiche

**Tempo propagazione DNS:** 5 minuti - 48 ore (tipicamente 15-30 minuti)

### 4.4 Verifica Dominio

**AZIONE UTENTE:**

1. Tornare su Vercel dopo 15-30 minuti
2. Il dominio dovrebbe mostrare "Valid Configuration" ✅
3. Aprire il dominio custom nel browser
4. Vercel fornisce **HTTPS automatico** (certificato SSL gratuito)

**Risultato:** App accessibile da `https://tuodominio.com` 🎉

---

## FASE 5: Integrazione Analytics

### 5.1 Abilitazione Vercel Analytics

**AZIONE UTENTE:**

1. Dashboard Vercel → aprire progetto
2. Tab "Analytics"
3. Cliccare "Enable Analytics"
4. Scegliere piano "Hobby" (gratuito)
5. Confermare

**Nessuna modifica al codice necessaria** - Vercel inietta automaticamente lo script.

### 5.2 Metriche Raccolte

Vercel Analytics (gratuito) fornisce:
- **Real User Monitoring (RUM)**:
  - Page views
  - Unique visitors
  - Performance scores (Core Web Vitals)
  - Geographic distribution
  - Device types (desktop/mobile/tablet)

- **Privacy-focused**:
  - Nessun cookie
  - Nessun fingerprinting
  - GDPR compliant
  - Dati aggregati

**Limite gratuito:** 100k eventi/mese (più che sufficiente per iniziare)

### 5.3 Visualizzazione Dati

**AZIONE UTENTE:**

Dopo 24-48 ore dal primo traffico:
1. Dashboard Vercel → progetto → "Analytics"
2. Visualizzare:
   - Traffico giornaliero
   - Pagine più visitate
   - Performance scores
   - Top locations

---

## FASE 6: Post-Deployment Testing

### 6.1 Checklist Funzionalità

**Testare su produzione:**

- [ ] Landing page carica correttamente
- [ ] Tab "Configuration" - selezione asset funziona
- [ ] Slider allocazioni funzionano
- [ ] Templates caricano correttamente
- [ ] Pulsante "Esegui Backtest" funziona
- [ ] Tab "Risultati" - grafici si visualizzano
- [ ] Metriche corrette (rendimento, drawdown, ecc.)
- [ ] Pulsante "Salva Backtest" funziona
- [ ] Tab "Backtest Salvati" - lista backtests
- [ ] Selezione per confronto funziona
- [ ] Pulsante "Confronta" apre modale corretta
- [ ] Grafici confronto corretti (no linee tratteggiate)
- [ ] Eliminazione backtest funziona
- [ ] Preferiti funzionano (stella)

### 6.2 Test Performance

**Tools da usare:**

1. **Google PageSpeed Insights**: https://pagespeed.web.dev
   - Inserire URL del sito
   - Verificare score > 80 (idealmente > 90)

2. **Vercel Analytics** (dopo qualche giorno):
   - Core Web Vitals dovrebbero essere "Good"

**Metriche target:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Total Blocking Time (TBT): < 200ms

### 6.3 Test Devices

Testare su diversi dispositivi:
- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (smartphone)
- [ ] Tablet

Verificare responsive design funziona correttamente.

---

## FASE 7: Ottimizzazioni Opzionali

### 7.1 Compressione Dati

**Considerazione:** I file JSON sono 40MB totali.

**Opzione A (Immediata):** Vercel comprime automaticamente con Brotli/Gzip
- Riduzione tipica: 40MB → ~4-5MB trasferiti
- Nessuna azione richiesta

**Opzione B (Futura):** Pre-comprimere e decomprimere lato client
- Salvare file come .json.gz
- Decomprimere in browser con pako.js
- Ulteriore riduzione ~20-30%

**Decisione:** Usare Opzione A per ora (sufficiente).

### 7.2 Favicon e Meta Tags

**File da aggiungere/modificare: `frontend/index.html`**

Aggiungere meta tags SEO:
```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- SEO Meta Tags -->
  <title>ETF Backtest Platform - Analizza Portfolio con 20 Anni di Dati</title>
  <meta name="description" content="Backtest gratuito per portfolio di investimento. 25 asset (ETF, Crypto, Bond, Metalli, Real Estate). Confronta strategie PAC e lump sum con dati storici." />
  <meta name="keywords" content="backtest, portfolio, ETF, investimenti, PAC, rebalancing" />

  <!-- Open Graph (per condivisioni social) -->
  <meta property="og:title" content="ETF Backtest Platform" />
  <meta property="og:description" content="Analizza e confronta strategie di investimento con 20 anni di dati storici" />
  <meta property="og:type" content="website" />
</head>
```

### 7.3 Custom 404 Page

Se un utente va su URL inesistente, React Router gestisce già il routing.

Nessuna azione necessaria.

---

## FASE 8: Workflow Futuro

### 8.1 Aggiornamenti Codice

**Processo git-based:**

1. Modificare codice localmente
2. Testare con `npm run dev`
3. Commit e push:
```bash
git add .
git commit -m "Descrizione modifiche"
git push origin main
```

4. **Vercel rebuilda automaticamente** (deploy in 2-3 minuti)
5. Verificare su produzione

**ZERO configurazione** - deployment automatico ad ogni push su main.

### 8.2 Aggiornamenti Dati (Futuro)

**Quando deciderai di aggiornare dati periodicamente:**

1. Creare GitHub Action che:
   - Esegue `download_data.py` mensile
   - Committa nuovi JSON
   - Trigga rebuild Vercel automaticamente

2. Alternative:
   - Eseguire manualmente `download_data.py` ogni 3-6 mesi
   - Push manuale su GitHub

**Per ora:** Dati attuali sono sufficienti (20 anni di storico).

### 8.3 Rollback

Se un deployment rompe qualcosa:

1. Dashboard Vercel → "Deployments"
2. Trovare deployment precedente funzionante
3. Cliccare "..." → "Promote to Production"

**Ripristino immediato** senza bisogno di git revert.

---

## FASE 9: Costi e Limiti

### 9.1 Vercel Free Tier

**Incluso gratis:**
- ✅ 100 GB bandwidth/mese
- ✅ Deploy illimitati
- ✅ HTTPS automatico
- ✅ Edge Network globale (CDN)
- ✅ Analytics (100k eventi/mese)
- ✅ 1 team member

**Limiti:**
- Serverless functions: 100 GB-hours/mese (non usate in questo progetto)
- Build time: 6000 minuti/mese (questo progetto usa ~1-2 min/build)

**Per questo progetto:** Free tier è più che sufficiente.

**Se superi limiti:** Vercel ti avvisa e chiede upgrade a $20/mese (molto improbabile).

### 9.2 Dominio

**Costo annuale:** 10-15€/anno (rinnovo)

**Nota:** Alcuni registrar offrono primo anno scontato (~8€) poi rinnovano a prezzo pieno.

### 9.3 Totale

**Anno 1:** ~10-15€ (solo dominio)
**Anni successivi:** ~10-15€/anno (rinnovo dominio)

**Hosting Vercel:** GRATIS per sempre (con limiti free tier)

---

## Riepilogo Azioni Utente

### 🔴 AZIONI CRITICHE (devi farle tu):

1. **GitHub:**
   - [ ] Creare account GitHub (se non hai)
   - [ ] Creare repository pubblico
   - [ ] Push codice su GitHub

2. **Vercel:**
   - [ ] Creare account Vercel (con GitHub)
   - [ ] Importare repository
   - [ ] Configurare build settings
   - [ ] Avviare primo deploy

3. **Dominio:**
   - [ ] Acquistare dominio su Namecheap/altro
   - [ ] Aggiungere dominio su Vercel
   - [ ] Configurare DNS records

4. **Testing:**
   - [ ] Testare app in produzione
   - [ ] Verificare tutte le funzionalità

### 🟢 AZIONI OPZIONALI:

- [ ] Abilitare Vercel Analytics
- [ ] Aggiungere meta tags SEO
- [ ] Test performance con PageSpeed

---

## File Critici da Modificare

1. **`frontend/vite.config.ts`** - Ottimizzazioni build
2. **`vercel.json`** - Configurazione Vercel (creare nuovo)
3. **`frontend/public/data/`** - Spostare file JSON (se non già in public)
4. **`.gitignore`** - Escludere node_modules e dist
5. **`frontend/index.html`** - Meta tags SEO (opzionale)

---

## Verifica Finale

**Prima di dichiarare successo, verificare:**

✅ Sito accessibile da dominio custom con HTTPS
✅ Tutte le funzionalità core funzionano
✅ Dati caricano correttamente
✅ Performance accettabile (PageSpeed > 80)
✅ Analytics attivo e traccia visite
✅ Build automatico funziona (push → deploy)

---

## Supporto e Troubleshooting

**Problemi comuni:**

**1. "Build failed" su Vercel**
- Controllare Build Logs nella dashboard
- Verificare che `npm run build` funzioni localmente
- Controllare versione Node.js (Vercel usa Node 18 di default)

**2. "404 su /data/*.json"**
- Verificare che file JSON siano in `frontend/public/data/`
- Controllare path in `dataLoader.ts` sia `/data/...`

**3. "DNS non si propaga"**
- Attendere 24-48 ore massimo
- Verificare record DNS con https://dnschecker.org

**4. "App lenta a caricare"**
- Normale al primo caricamento (40MB dati)
- Caricamenti successivi usano cache browser
- Considerare lazy loading futuro

**Risorse utili:**
- Vercel Docs: https://vercel.com/docs
- Vercel Support: support@vercel.com
- GitHub Docs: https://docs.github.com

---

## Timeline Stimata

**Totale: 2-3 ore** (prima volta)

- ⏱️ Preparazione codice: 30 min
- ⏱️ Setup Git/GitHub: 15 min
- ⏱️ Deploy Vercel: 30 min
- ⏱️ Acquisto dominio: 15 min
- ⏱️ Configurazione DNS: 15 min + 30 min attesa
- ⏱️ Testing finale: 30 min

**Deployment successivi:** 2-3 minuti (automatici)

---

## Prossimi Passi

Dopo completamento di questo piano:

1. **Immediate:** Monitorare analytics per capire utilizzo
2. **Settimana 1:** Raccogliere feedback utenti, fix bug
3. **Mese 1:** Ottimizzazioni performance basate su dati reali
4. **Futuro:** Aggiungere aggiornamenti dati automatici con GitHub Actions

🚀 Ready to deploy!
