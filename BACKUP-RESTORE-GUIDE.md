# QUOTA - Backup & Restore Guide

**Complete guide for backing up and restoring the QUOTA project**

---

## 📋 Table of Contents

1. [Backup Strategy](#backup-strategy)
2. [How to Create Backups](#how-to-create-backups)
3. [How to Restore from Backup](#how-to-restore-from-backup)
4. [Emergency Recovery](#emergency-recovery)
5. [Backup Schedule](#backup-schedule)
6. [Critical Files Checklist](#critical-files-checklist)

---

## 🎯 Backup Strategy

This project uses a **6-level backup system** for maximum safety:

| Level | Type | What | Where | Frequency |
|-------|------|------|-------|-----------|
| 1 | Git Tags | Code snapshots | GitHub | Before major changes |
| 2 | GitHub Releases | Official versions | GitHub | Every release |
| 3 | Local Backup | Full project copy | External drive | Weekly |
| 4 | Firebase Backup | Database + Auth | Cloud Storage | Monthly |
| 5 | Critical Files | .env + keystore | 3 secure locations | Always |
| 6 | Automated Scripts | Backup automation | Local | On-demand |

---

## 💾 How to Create Backups

### **Quick Backup (Before Changes)**

```bash
# 1. Create git tag
git tag -a v1.X.X-snapshot -m "Backup before [description]"
git push origin v1.X.X-snapshot

# 2. Run automated backup script
backup-project.bat
```

### **Full Backup (Complete System)**

#### **Step 1: Code Backup**

Run the automated script:

```bash
backup-project.bat
```

This creates a timestamped backup in: `C:\Users\edoni\Desktop\ETF ECC BACKUPS\`

**What it backs up:**
- ✅ All source code (frontend/src, backend)
- ✅ Configuration files (.env, package.json, tsconfig.json)
- ✅ Documentation (all .md files)
- ✅ Data files (data folder)
- ✅ Git information (commit hash, branch, status)

**What it excludes:**
- ❌ node_modules (reinstall with `npm install`)
- ❌ Build artifacts (dist, build folders)
- ❌ Android build files (.gradle, build)
- ❌ Keystores (.jks files - backed up separately)

#### **Step 2: Firebase Backup**

Run the Firebase backup script:

```bash
backup-firebase.bat
```

Follow the on-screen instructions to:
1. Export Firestore database via Firebase Console
2. Save Firestore security rules
3. Export Authentication users (screenshot or programmatic)
4. Backup Firebase configuration files
5. Download Storage files (if any)

**Manual Steps Required:**

**Firestore Export:**
```bash
# Using Firebase CLI (recommended)
firebase login
firebase firestore:export gs://quota-finance.appspot.com/firestore-backups/$(date +%Y%m%d)
```

Or via Firebase Console:
1. Go to https://console.firebase.google.com
2. Select project: quota-finance
3. Firestore Database → Menu (⋮) → Import/Export
4. Export → All collections → Export

**Authentication Export:**
```bash
# Using firebase-admin SDK (Node.js script needed)
# See: https://firebase.google.com/docs/cli/auth
firebase auth:export users-backup.json --format=json
```

#### **Step 3: Critical Files Backup**

**MUST backup these files in 3 secure locations:**

1. **`.env` file** (Firebase credentials)
   - Contains API keys
   - Without this, app won't connect to Firebase
   - Location: `frontend/.env`

2. **Play Store Keystore** (when created)
   - File: `quota-release-keystore.jks`
   - **WITHOUT THIS FILE YOU CANNOT UPDATE THE APP**
   - Also backup keystore passwords

3. **Backup locations:**
   - Primary: Password manager (1Password, Bitwarden)
   - Secondary: Encrypted cloud storage (Google Drive encrypted, Dropbox)
   - Tertiary: USB drive in safe location

#### **Step 4: External Storage**

Copy the backup folder to:
- External USB drive
- Cloud storage (Google Drive, Dropbox, OneDrive)
- Network attached storage (NAS)

**Recommended folder structure:**
```
External Drive/
└── QUOTA Backups/
    ├── 2026-03-09_Critical-Files/
    │   ├── .env
    │   ├── quota-release-keystore.jks
    │   └── keystore-passwords.txt (encrypted)
    ├── 2026-03-09_Code-Backup/
    │   └── QUOTA-BACKUP-2026-03-09_15-30-00/
    └── 2026-03-09_Firebase-Export/
        ├── firestore-export/
        ├── auth-users.json
        └── firestore.rules
```

---

## 🔄 How to Restore from Backup

### **Scenario 1: Code Broke, Need to Rollback**

**Option A: Git Tag Restore (Fastest)**

```bash
# 1. See available backup tags
git tag -l "v*-snapshot"

# 2. Restore to specific tag
git checkout v1.0.0-snapshot

# 3. Create new branch from this point
git checkout -b fix-from-backup

# 4. Or hard reset to tag (DESTRUCTIVE - be careful!)
git reset --hard v1.0.0-snapshot
```

**Option B: GitHub Release Restore**

1. Go to: https://github.com/MajinBull/Quota/releases
2. Find the release before the problem
3. Download source code (ZIP)
4. Extract to project folder
5. Run `npm install` in frontend folder

**Option C: Local Backup Restore**

```bash
# 1. Navigate to backup folder
cd "C:\Users\edoni\Desktop\ETF ECC BACKUPS"

# 2. Find the backup you need
dir

# 3. Copy files back to project
xcopy /E /I /Y "QUOTA-BACKUP-2026-03-09_15-30-00\*" "C:\Users\edoni\Desktop\ETF ECC\"

# 4. Reinstall dependencies
cd "C:\Users\edoni\Desktop\ETF ECC\frontend"
npm install

# 5. Restore .env file (from secure backup)
# Copy .env from password manager or encrypted storage

# 6. Test
npm run dev
```

### **Scenario 2: Complete System Restore (New Computer)**

**Step-by-step process:**

#### **1. Install Prerequisites**

```bash
# Install Node.js (v18+)
# Download from: https://nodejs.org

# Install Git
# Download from: https://git-scm.com

# Install Firebase CLI
npm install -g firebase-tools

# Install Android Studio (for mobile app)
# Download from: https://developer.android.com/studio
```

#### **2. Restore Code**

**Option A: Clone from GitHub (if pushed)**

```bash
git clone https://github.com/MajinBull/Quota.git
cd Quota
git checkout v1.0.0-snapshot  # or desired tag
```

**Option B: Copy from local backup**

```bash
# Copy entire backup folder to desired location
xcopy /E /I "F:\QUOTA Backups\QUOTA-BACKUP-2026-03-09\*" "C:\Dev\Quota\"
```

#### **3. Restore Configuration Files**

```bash
# Copy .env from secure backup
cp /secure-location/.env frontend/.env

# Verify .env contains all required variables
cat frontend/.env
# Should have:
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# VITE_FIREBASE_PROJECT_ID=...
# etc.
```

#### **4. Install Dependencies**

```bash
cd frontend
npm install

# If errors, clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### **5. Restore Firebase Data (if needed)**

**Firestore Restore:**

```bash
# Using Firebase CLI
firebase login
firebase firestore:import gs://quota-finance.appspot.com/firestore-backups/20260309

# Or via Firebase Console:
# 1. Go to Firestore Database → Menu → Import/Export
# 2. Import → Select Cloud Storage bucket path
# 3. Choose collections to import
# 4. Click Import
```

**Authentication Restore:**

```bash
# Using firebase-admin SDK or Firebase Console
firebase auth:import users-backup.json --hash-algo=BCRYPT
```

**Storage Restore:**

```bash
# Upload files to Firebase Storage
gsutil -m cp -r backup-storage/* gs://quota-finance.appspot.com/
```

#### **6. Test Application**

```bash
# Start development server
npm run dev

# Test in browser
# Open: http://localhost:5173

# Verify:
# ✅ App loads without errors
# ✅ Can login (email/password, Google)
# ✅ Can create portfolio
# ✅ Can run backtest
# ✅ Can save backtest
```

#### **7. Restore Mobile App (if needed)**

```bash
# Restore keystore from secure backup
cp /secure-location/quota-release-keystore.jks frontend/

# Sync with Capacitor
cd frontend
npm install @capacitor/core @capacitor/cli
npx cap sync android

# Build APK
cd android
gradlew.bat assembleDebug

# Or for release (if have keystore)
# Use: build-and-sign-release.bat
```

### **Scenario 3: Firebase Database Corruption**

**Restore from Firestore export:**

1. **Stop all writes to database** (put app in maintenance mode if possible)

2. **Export current state** (even if corrupted, for comparison)
```bash
firebase firestore:export gs://quota-finance.appspot.com/firestore-corrupted-$(date +%Y%m%d)
```

3. **Clear corrupted collections** (be VERY careful)
```bash
# Delete specific collection via Firebase Console
# Or use Firebase CLI (requires confirmation)
```

4. **Import from backup**
```bash
firebase firestore:import gs://quota-finance.appspot.com/firestore-backups/[BACKUP_DATE]
```

5. **Verify data integrity**
   - Check user counts
   - Verify portfolio data
   - Test backtest execution

### **Scenario 4: Lost .env File**

If you lose the `.env` file with Firebase credentials:

1. **Check backup locations:**
   - Password manager
   - Encrypted cloud storage
   - USB backup drive

2. **If truly lost, regenerate Firebase config:**
   - Go to Firebase Console → Project Settings
   - Scroll to "Your apps" section
   - Click on web app (</> icon)
   - Copy configuration
   - Recreate `.env` file:

```bash
# frontend/.env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=quota-finance.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quota-finance
VITE_FIREBASE_STORAGE_BUCKET=quota-finance.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**⚠️ WARNING:** If you lost the `.env` file, also check:
- Is the Firebase project still accessible?
- Do you still have owner permissions?
- Are billing settings intact?

---

## 🚨 Emergency Recovery

### **Critical Files Lost**

**Priority 1: .env file**
- Impact: App cannot connect to Firebase
- Recovery: See "Scenario 4" above
- Prevention: Always keep in 3 locations

**Priority 2: Play Store Keystore**
- Impact: **CANNOT UPDATE APP ON PLAY STORE**
- Recovery: **NO RECOVERY POSSIBLE** - must publish as new app
- Prevention: Backup immediately after creation in 3 secure locations

**Priority 3: Firestore Data**
- Impact: All user data lost
- Recovery: Restore from Firebase export (if exists)
- Prevention: Monthly automated exports

### **Complete System Failure**

If everything is lost:

1. **Check GitHub** - Latest code should be there
2. **Check Cloud Storage** - Firestore exports stored in Google Cloud
3. **Check External Backups** - USB drive, cloud backups
4. **Contact Firebase Support** - May have automated backups (paid plans)

### **Rollback Production**

If deployed broken code to production:

```bash
# 1. Find last working commit
git log --oneline

# 2. Revert to last working version
git revert [commit-hash]
git push origin main

# Vercel will auto-deploy the revert
# Or manually redeploy from Vercel dashboard
```

---

## 📅 Backup Schedule

### **Before Every Major Change**

```bash
# Quick backup
git tag -a v1.X.X-snapshot -m "Before [change description]"
git push origin v1.X.X-snapshot
backup-project.bat
```

### **Weekly (Every Sunday)**

- [x] Run `backup-project.bat`
- [x] Copy backup to external drive
- [x] Verify backup size (should be ~50-100 MB without node_modules)

### **Monthly (First of Month)**

- [x] Run `backup-firebase.bat`
- [x] Export Firestore database
- [x] Export Authentication users
- [x] Verify .env file backup in 3 locations
- [x] Test restore process (on test environment)

### **Before Play Store Release**

- [x] Create git tag: `v1.X.X-release`
- [x] Full code backup
- [x] Firebase backup
- [x] **Backup keystore** (if not already in 3 locations)
- [x] Create GitHub release with changelog

### **After Play Store Keystore Creation**

**IMMEDIATE ACTIONS:**
- [x] Copy keystore to password manager
- [x] Copy keystore to encrypted cloud storage
- [x] Copy keystore to USB drive
- [x] Save keystore passwords in password manager
- [x] Test that all 3 backups are accessible
- [x] **NEVER commit keystore to git**

---

## ✅ Critical Files Checklist

Before considering backup complete, verify these files are backed up:

### **Code Files**

- [x] All `.ts` and `.tsx` files in `frontend/src`
- [x] All configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`)
- [x] All `.md` documentation files
- [x] All data files in `data/` folder
- [x] `.gitignore` file
- [x] Git commit history (via GitHub push)

### **Configuration Files**

- [x] `frontend/.env` (Firebase credentials)
- [x] `frontend/.env.production` (if different)
- [x] `frontend/capacitor.config.ts` (mobile config)
- [x] `frontend/src/config/firebase.ts`

### **Mobile App Files**

- [x] `android/app/build.gradle` (version codes)
- [x] `android/variables.gradle` (dependencies)
- [x] **Play Store keystore** (`.jks` file) - **CRITICAL**
- [x] Keystore passwords (in password manager)

### **Firebase Data**

- [x] Firestore database export
- [x] Firestore security rules
- [x] Authentication users export
- [x] Storage files (if any)

### **Documentation**

- [x] README.md
- [x] DEVELOPMENT-WORKFLOW.md
- [x] FIRST-PLAY-STORE-RELEASE.md
- [x] BACKUP-RESTORE-GUIDE.md (this file)
- [x] All other .md files

### **Backup Metadata**

- [x] Git commit hash saved
- [x] Git branch saved
- [x] Backup timestamp recorded
- [x] Backup location documented

---

## 🔐 Security Best Practices

### **Sensitive Files**

**NEVER commit to git:**
- `.env` files (Firebase keys)
- Keystore files (`.jks`)
- Password files
- API keys
- Private keys

**ALWAYS encrypt before cloud storage:**
- .env files
- Keystore files
- Database exports (contain user data)

### **Backup Storage Recommendations**

**Password Manager (1Password, Bitwarden):**
- .env file content
- Keystore file (as attachment)
- Keystore passwords
- Firebase project credentials

**Encrypted Cloud Storage:**
- Use Cryptomator or VeraCrypt
- Store encrypted vault in Google Drive/Dropbox
- Contains: .env, keystore, sensitive docs

**Physical Backup:**
- USB drive in safe/secure location
- Update monthly
- Test restore quarterly

---

## 🧪 Testing Your Backups

**Monthly backup verification:**

```bash
# 1. Create test folder
mkdir "C:\temp\quota-backup-test"

# 2. Restore from backup
xcopy /E /I "LATEST-BACKUP\*" "C:\temp\quota-backup-test\"

# 3. Install and test
cd C:\temp\quota-backup-test\frontend
npm install
npm run dev

# 4. Verify app works
# - Can login
# - Can run backtest
# - Database connection works

# 5. Clean up
cd ..
rmdir /S /Q "C:\temp\quota-backup-test"
```

**DO THIS EVERY MONTH** - A backup you haven't tested is not a real backup!

---

## 📞 Support

If you have issues with backup/restore:

1. Check this guide thoroughly
2. Review error messages carefully
3. Check Firebase Console for data
4. Check GitHub for code history
5. Review git log for recent changes

---

## 📝 Backup Log Template

Keep a log of backups performed:

```
| Date       | Type           | Location                    | Verified | Notes                |
|------------|----------------|-----------------------------|----------|----------------------|
| 2026-03-09 | Code + Git Tag | GitHub + Local              | ✅       | Before UI improvements |
| 2026-03-09 | Firebase       | Cloud Storage               | ✅       | Monthly backup        |
| 2026-03-15 | Code           | External Drive F:\          | ✅       | Weekly backup         |
```

---

**Remember:**
- **3-2-1 Backup Rule**: 3 copies, 2 different media, 1 offsite
- **Test your backups regularly**
- **Automate when possible**
- **Document everything**

**The best backup is the one you have when you need it.**
