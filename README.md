# 📊 QUOTA - Portfolio Backtest Platform

🌐 **Live**: [quota.finance](https://quota.finance) | 📱 **Android App**: In sviluppo

Piattaforma per simulare strategie di investimento con **70+ asset** e **30+ anni di dati storici**.

---

## 🎯 COSA VUOI FARE?

### 💻 Sviluppo Web (Quotidiano)

```bash
cd frontend
npm run dev
```

✅ Apri: http://localhost:5173
✅ Modifica codice → Auto-reload
✅ Push su GitHub → Auto-deploy Vercel

### 📱 Testare App Android

```bash
cd frontend
build-mobile.bat
```

✅ APK in: `android/app/build/outputs/apk/debug/app-debug.apk`
✅ Copia su telefono e installa

### 💾 Fare Backup

```bash
backup-project.bat
```

✅ Backup in: `C:\Users\edoni\Desktop\ETF ECC BACKUPS\`

### 🚀 Deploy Produzione

```bash
git add .
git commit -m "Descrizione modifiche"
git push
```

✅ Vercel deploya automaticamente
✅ Live su quota.finance in ~2 minuti

---

## 📚 DOCUMENTAZIONE

### Per Sviluppo Completo
👉 **[DEV-GUIDE.md](DEV-GUIDE.md)** - Setup, sviluppo web/mobile, deploy, Play Store

### Per Backup & Restore
👉 **[BACKUP-GUIDE.md](BACKUP-GUIDE.md)** - Backup, restore, schedule, emergency

---

## ⚡ Quick Reference

### Comandi Essenziali

```bash
# Web Development
npm run dev              # Dev server
npm run build            # Build production
npm run preview          # Preview build

# Mobile Development
build-mobile.bat         # Build APK debug
npx cap sync android     # Sync web → Android
npx cap open android     # Open in Android Studio

# Backup & Deploy
backup-project.bat       # Backup progetto
git push                 # Deploy automatico
```

### Link Utili

| Cosa | Dove |
|------|------|
| 🌐 App Live | [quota.finance](https://quota.finance) |
| 📊 GitHub | [MajinBull/Quota](https://github.com/MajinBull/Quota) |
| 🚀 Vercel Dashboard | [vercel.com/dashboard](https://vercel.com/dashboard) |
| 🔥 Firebase Console | [console.firebase.google.com](https://console.firebase.google.com) |

---

## 🛠️ Stack Tecnologico

**Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
**Backend**: Firebase (Auth + Firestore)
**Deploy**: Vercel (auto-deploy da GitHub)
**Mobile**: Capacitor (Android native)

---

## 📁 Struttura Progetto

```
QUOTA/
├── frontend/              # App React
│   ├── src/              # Codice sorgente
│   ├── public/data/      # Dati storici JSON (70+ asset)
│   ├── android/          # App Android (Capacitor)
│   └── package.json
├── data/                 # Backup dati locali
├── README.md            # ← SEI QUI (dashboard)
├── DEV-GUIDE.md         # Guida sviluppo completa
└── BACKUP-GUIDE.md      # Guida backup completa
```

---

## ✨ Features

✅ **70+ Asset**: ETF, crypto, commodities, bonds, real estate, stocks
✅ **Backtest Storici**: Fino a 30+ anni di dati reali
✅ **Salva & Confronta**: Fino a 4 strategie contemporaneamente
✅ **Metriche Avanzate**: CAGR, Sharpe Ratio, Max Drawdown, volatilità
✅ **i18n**: Italiano + Inglese
✅ **Dark/Light Theme**: Persistente
✅ **SEO Ottimizzato**: Meta tags, sitemap, robots.txt
✅ **Mobile App**: Android nativa con Google Sign-In

---

## 🚀 Prossime Release

**High Priority:**
- [ ] Miglioramenti UI/UX mobile
- [ ] Export PDF/CSV risultati
- [ ] Sistema pagamenti Stripe (Premium)

**In Backlog:**
- [ ] Portfolio optimizer
- [ ] Pubblicazione Play Store
- [ ] iOS app

---

## ⚠️ Note Importanti

- I risultati storici **non garantiscono** performance future
- Tool per scopi **educativi**, non consulenza finanziaria
- Non include costi transazione/tasse
- Ultimo aggiornamento dati: Febbraio 2026

---

## 🆘 Problemi?

1. **Errori build**: Vedi [DEV-GUIDE.md](DEV-GUIDE.md) sezione "Troubleshooting"
2. **Backup/Restore**: Vedi [BACKUP-GUIDE.md](BACKUP-GUIDE.md)
3. **Firebase issues**: Controlla [Firebase Console](https://console.firebase.google.com)

---

**Licenza**: MIT - Uso libero per scopi personali ed educativi
