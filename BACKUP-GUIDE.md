# 💾 QUOTA - Backup & Restore Guide

**Guida rapida per backup e restore del progetto**

---

## 🎯 Quick Start

### Fare Backup Prima di Modifiche

```bash
backup-project.bat
```

✅ Backup creato in: `C:\Users\edoni\Desktop\ETF ECC BACKUPS\`

### Restore da Backup

```bash
# Opzione 1: Git Tag (più veloce)
git checkout v1.0.0-snapshot

# Opzione 2: Da backup locale
# Copia files da backup folder → progetto
```

---

## 📅 Quando Fare Backup

### SEMPRE Prima Di:
- ✅ Modifiche importanti al codice
- ✅ Aggiornare dipendenze (npm update)
- ✅ Refactoring grosso
- ✅ Cambiare Firebase config
- ✅ Release Play Store

### Schedule Regolare:
- 📅 **Settimanale** (Domenica): Backup codice
- 📅 **Mensile** (1a Domenica): Backup completo + Firebase
- 📅 **Ogni 3 mesi**: Test restore

---

## 🎯 Sistema di Backup a 3 Livelli

### Livello 1: Git Tags (Codice)

```bash
# Prima di modifiche importanti
git tag -a v1.X.X-snapshot -m "Before [descrizione]"
git push origin v1.X.X-snapshot

# Restore
git checkout v1.X.X-snapshot
```

✅ Veloce, su GitHub, sempre disponibile

### Livello 2: Backup Locale (Progetto Completo)

```bash
backup-project.bat
```

**Cosa salva:**
- Tutto il codice sorgente
- Configurazioni
- Documentazione
- Dati
- Git info

**NON salva (reinstallabile):**
- node_modules
- build/dist folders
- Android build cache

✅ Backup in: `C:\Users\edoni\Desktop\ETF ECC BACKUPS\QUOTA-BACKUP-[TIMESTAMP]\`

**Copia su drive esterno ogni settimana!**

### Livello 3: Firebase Backup (Database)

```bash
backup-firebase.bat
```

Segui istruzioni per:
1. Export Firestore database
2. Backup regole sicurezza
3. Export utenti Auth
4. Backup configurazione

---

## 🔐 File CRITICI da Backuppare in 3 Posti

### 1. File .env (Firebase Credentials)

**Dove:** `frontend/.env`

**Backup in:**
- ✅ Password Manager (1Password, Bitwarden)
- ✅ Cloud criptato (Google Drive + Cryptomator)
- ✅ USB drive (cassaforte)

⚠️ **Senza questo file l'app non funziona**

### 2. Keystore Play Store (quando creato)

**Dove:** `frontend/quota-release-keystore.jks`

**Backup in:**
- ✅ Password Manager
- ✅ Cloud criptato
- ✅ USB drive

⚠️ **SENZA QUESTO FILE NON PUOI MAI AGGIORNARE L'APP SU PLAY STORE**

### 3. Password Keystore

**Backup in:**
- ✅ Password Manager (CRITICO)

---

## 🔄 Come Fare Restore

### Scenario 1: Codice Rotto, Serve Rollback

**Via Git Tag (Veloce):**

```bash
# 1. Vedi tag disponibili
git tag -l "v*-snapshot"

# 2. Restore
git checkout v1.0.0-snapshot

# 3. Se vuoi continuare da qui
git checkout -b fix-from-backup
```

**Via Backup Locale:**

```bash
# 1. Trova backup
dir "C:\Users\edoni\Desktop\ETF ECC BACKUPS\"

# 2. Copia files
xcopy /E /I "BACKUP-FOLDER\*" "C:\Users\edoni\Desktop\ETF ECC\"

# 3. Reinstalla dipendenze
cd frontend
npm install

# 4. Restore .env da password manager

# 5. Test
npm run dev
```

### Scenario 2: Firebase Database Corrotto

```bash
# 1. Via Firebase Console
# - Vai su Firestore → Menu → Import/Export
# - Import da Cloud Storage backup

# 2. O via CLI
firebase firestore:import gs://quota-finance.appspot.com/firestore-backups/[DATA]
```

### Scenario 3: .env File Perso

**Opzione 1: Restore da backup**
- Controlla Password Manager
- Controlla Cloud criptato
- Controlla USB drive

**Opzione 2: Ricrea da Firebase Console**

```bash
# 1. Vai su Firebase Console → Project Settings
# 2. Scroll "Your apps" → Web app
# 3. Copia config

# 4. Crea .env:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=quota-finance.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quota-finance
# ... (altre variabili)
```

### Scenario 4: Keystore Perso

⚠️ **NON C'È SOLUZIONE**

- Non puoi recuperare keystore perso
- Non puoi aggiornare app esistente su Play Store
- Devi pubblicare come nuova app (nuovo package name)

**QUESTO È IL MOTIVO PER CUI SERVE BACKUP IN 3 POSTI!**

---

## 📋 Checklist Backup Settimanale

**Ogni Domenica (5 minuti):**

```
[ ] 1. Backup codice
       backup-project.bat

[ ] 2. Verifica backup creato
       Check folder creato in BACKUPS/

[ ] 3. Copia su drive esterno
       USB / hard disk esterno

✅ Done!
```

---

## 📋 Checklist Backup Mensile

**Prima Domenica del mese (20 minuti):**

```
[ ] 1. Backup codice
       backup-project.bat

[ ] 2. Git tag mensile
       git tag -a v1.X.X-monthly-2026-03 -m "Monthly backup"
       git push origin v1.X.X-monthly-2026-03

[ ] 3. Firebase backup
       backup-firebase.bat
       Segui istruzioni export Firestore

[ ] 4. Verifica file critici in 3 posti
       [ ] .env in password manager
       [ ] .env in cloud criptato
       [ ] .env su USB drive
       [ ] Keystore (se creato) in password manager
       [ ] Keystore in cloud criptato
       [ ] Keystore su USB drive

[ ] 5. Copia tutto su drive esterno

✅ Done!
```

---

## 📋 Checklist Prima di Modifiche Importanti

```
[ ] 1. Commit lavoro corrente
       git add .
       git commit -m "Before [modifica]"

[ ] 2. Crea git tag
       git tag -a v1.X.X-snapshot -m "Before [descrizione]"
       git push origin main
       git push origin v1.X.X-snapshot

[ ] 3. Backup locale
       backup-project.bat

[ ] 4. Verifica backup creato

✅ Ora sei al sicuro per fare modifiche!
```

---

## 🚨 Test Restore (Ogni 3 Mesi)

**Per verificare che i backup funzionino:**

```bash
# 1. Crea cartella test
mkdir C:\temp\quota-test

# 2. Restore da backup
xcopy /E "LATEST-BACKUP\*" "C:\temp\quota-test\"

# 3. Installa e avvia
cd C:\temp\quota-test\frontend
npm install
npm run dev

# 4. Verifica funzioni
# - App si apre
# - Puoi fare login
# - Backtest funziona

# 5. Pulisci
cd ..
rmdir /S /Q C:\temp\quota-test
```

**Se qualcosa non funziona → Fixa il processo di backup!**

Un backup non testato non è un vero backup.

---

## 📊 Backup Status Log

**Tieni traccia dei backup:**

| Data | Tipo | Tag | Verificato | Note |
|------|------|-----|------------|------|
| 2026-03-09 | Snapshot | v1.0.0-snapshot | ✅ | Prima UI improvements |
| | | | | |

---

## ⚡ Quick Commands

```bash
# Backup
backup-project.bat              # Backup codice
backup-firebase.bat             # Backup Firebase (guidato)

# Git Tags
git tag -a vX.Y.Z -m "Message"  # Crea tag
git push origin vX.Y.Z          # Push tag
git tag -l                      # Lista tag
git checkout vX.Y.Z             # Restore tag

# Restore
git checkout [tag]              # Restore da git
xcopy [backup] [dest]           # Restore da locale
```

---

## 📚 Regola d'Oro: 3-2-1

**3** copie dei dati
**2** tipi di storage diversi
**1** copia offsite (cloud/esterno)

**Per QUOTA:**
1. Copia 1: GitHub (codice)
2. Copia 2: Backup locale
3. Copia 3: Drive esterno / Cloud

---

## 🆘 Emergency

Se tutto fallisce:
1. **GitHub** ha sempre il codice
2. **Firebase Cloud Storage** ha export Firestore
3. **Password Manager** ha .env e keystore

**In ultimo:** Contatta supporto Firebase / Google Play Console

---

**Ricorda:** Il backup che salti è quello che ti servirà.

**Prima di ogni modifica importante:**
```bash
backup-project.bat
```

**30 secondi che ti salvano ore/giorni di lavoro.**
