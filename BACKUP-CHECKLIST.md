# QUOTA - Backup Checklist & Schedule

**Quick reference checklist for regular backups**

---

## 🚀 Quick Start

**Before making ANY major changes:**
```bash
backup-project.bat
```

That's it! The rest is automated.

---

## 📋 Before Major Changes Checklist

Use this checklist **every time** before:
- Refactoring code
- Adding new features
- Updating dependencies
- Changing database structure
- Modifying authentication
- UI/UX overhaul

### Pre-Change Backup Steps:

```
[ ] 1. Commit all current work
       git add .
       git commit -m "Work before [change]"

[ ] 2. Create git tag
       git tag -a v1.X.X-snapshot -m "Before [change description]"
       git push origin main
       git push origin v1.X.X-snapshot

[ ] 3. Run automated backup
       backup-project.bat

[ ] 4. Verify backup created
       Check: C:\Users\edoni\Desktop\ETF ECC BACKUPS\

[ ] 5. Note backup location
       Write down: QUOTA-BACKUP-[TIMESTAMP]

✅ You're now safe to make changes!
```

---

## 📅 Weekly Backup (Every Sunday)

**Time required: 5 minutes**

```
[ ] 1. Run code backup
       backup-project.bat

[ ] 2. Verify backup size
       Should be ~50-100 MB (without node_modules)

[ ] 3. Copy to external drive
       Copy folder to: F:\QUOTA Backups\

[ ] 4. Update backup log (below)

✅ Weekly backup complete!
```

---

## 📅 Monthly Backup (First Sunday of Month)

**Time required: 15-20 minutes**

### Part 1: Code Backup

```
[ ] 1. Create git tag for month
       git tag -a v1.X.X-monthly-YYYY-MM -m "Monthly backup [Month]"
       git push origin v1.X.X-monthly-YYYY-MM

[ ] 2. Run code backup
       backup-project.bat

[ ] 3. Copy to external drive
       F:\QUOTA Backups\Monthly\YYYY-MM\
```

### Part 2: Firebase Backup

```
[ ] 1. Run Firebase backup script
       backup-firebase.bat

[ ] 2. Export Firestore via Firebase Console
       - Go to: https://console.firebase.google.com
       - Project: quota-finance
       - Firestore → Menu → Export
       - Export all collections
       - Destination: gs://quota-finance.appspot.com/firestore-backups/YYYY-MM

[ ] 3. Export Firestore rules
       firebase firestore:rules get -o firestore.rules

[ ] 4. Export Authentication users
       - Screenshot user list
       - Or use: firebase auth:export users-YYYY-MM.json

[ ] 5. Save to external drive
       Copy Firebase exports to: F:\QUOTA Backups\Monthly\YYYY-MM\Firebase\
```

### Part 3: Critical Files Verification

```
[ ] 1. Verify .env in password manager
       Check: 1Password / Bitwarden

[ ] 2. Verify .env in encrypted cloud
       Check: Google Drive / Dropbox (encrypted vault)

[ ] 3. Verify .env on USB backup
       Check: USB drive in safe

[ ] 4. If keystore created, verify in 3 locations:
       [ ] Password manager
       [ ] Encrypted cloud
       [ ] USB drive

[ ] 5. Test one backup location
       Download .env and verify contents
```

### Part 4: Test Restore (Quarterly - Every 3 Months)

**Do this in addition to monthly backup every 3 months:**

```
[ ] 1. Create test folder
       mkdir C:\temp\quota-backup-test

[ ] 2. Restore from latest backup
       Copy backup to test folder

[ ] 3. Install dependencies
       cd frontend && npm install

[ ] 4. Restore .env from password manager

[ ] 5. Test run
       npm run dev

[ ] 6. Verify functionality
       [ ] App loads
       [ ] Can login
       [ ] Can create portfolio
       [ ] Can run backtest
       [ ] Database connection works

[ ] 7. Clean up
       Delete test folder

✅ Restore test successful!
```

---

## 📅 Before Play Store Release

**Every 2-3 weeks when releasing app update:**

```
[ ] 1. Update version in build.gradle
       versionCode: [increment]
       versionName: "X.Y.Z"

[ ] 2. Create release tag
       git tag -a vX.Y.Z -m "Release X.Y.Z: [features]"
       git push origin vX.Y.Z

[ ] 3. Full code backup
       backup-project.bat

[ ] 4. Firebase backup
       backup-firebase.bat

[ ] 5. Create GitHub Release
       - Go to: https://github.com/MajinBull/Quota/releases
       - Create release from tag vX.Y.Z
       - Add changelog
       - Attach APK/AAB if desired

[ ] 6. If first release (keystore created):
       [ ] Copy keystore to password manager IMMEDIATELY
       [ ] Copy keystore to encrypted cloud
       [ ] Copy keystore to USB drive
       [ ] Save passwords in password manager
       [ ] VERIFY all 3 backups accessible
       [ ] Add to .gitignore (already done)

[ ] 7. Update backup log

✅ Release backup complete!
```

---

## 🎯 Critical Events That REQUIRE Immediate Backup

**DO NOT proceed without backup if:**

- [ ] Updating Firebase dependencies
- [ ] Changing authentication system
- [ ] Modifying database structure
- [ ] Major dependency updates (React, Vite, etc.)
- [ ] Refactoring core functionality
- [ ] Changing build configuration
- [ ] Updating Android/Capacitor
- [ ] Deploying to production after major changes

**Always better safe than sorry!**

---

## 📊 Backup Log

**Track all backups here:**

### March 2026

| Date | Type | Tag/Version | Location | Verified | Notes |
|------|------|-------------|----------|----------|-------|
| 2026-03-09 | Snapshot | v1.0.0-snapshot | GitHub + Local | ✅ | Before UI/UX improvements |
| | | | | | |

### April 2026

| Date | Type | Tag/Version | Location | Verified | Notes |
|------|------|-------------|----------|----------|-------|
| | | | | | |
| | | | | | |

### May 2026

| Date | Type | Tag/Version | Location | Verified | Notes |
|------|------|-------------|----------|----------|-------|
| | | | | | |

---

## 🔐 Critical Files Status

**Update this section whenever files are created/moved:**

### .env File (Firebase Credentials)

| Location | Last Verified | Status |
|----------|---------------|--------|
| Password Manager | YYYY-MM-DD | ⬜ Not Yet / ✅ Verified |
| Encrypted Cloud | YYYY-MM-DD | ⬜ Not Yet / ✅ Verified |
| USB Backup Drive | YYYY-MM-DD | ⬜ Not Yet / ✅ Verified |

### Play Store Keystore (quota-release-keystore.jks)

| Location | Last Verified | Status |
|----------|---------------|--------|
| Password Manager | YYYY-MM-DD | ⬜ Not Created Yet / ✅ Verified |
| Encrypted Cloud | YYYY-MM-DD | ⬜ Not Created Yet / ✅ Verified |
| USB Backup Drive | YYYY-MM-DD | ⬜ Not Created Yet / ✅ Verified |

**Keystore Passwords Saved:** ⬜ No / ✅ Yes

**Where:** _________________________

---

## ⚠️ Emergency Contacts

**If something goes wrong:**

1. **GitHub Repository**
   - URL: https://github.com/MajinBull/Quota
   - All code history available
   - Tags for restore points

2. **Firebase Console**
   - URL: https://console.firebase.google.com
   - Project: quota-finance
   - Check Firestore backups in Cloud Storage

3. **Vercel Dashboard**
   - URL: https://vercel.com
   - Production deployment history
   - Can rollback deployments

4. **Backup Locations**
   - Local: `C:\Users\edoni\Desktop\ETF ECC BACKUPS\`
   - External: `F:\QUOTA Backups\` (or your drive)
   - Cloud: Google Drive / Dropbox (encrypted)

---

## 📖 Quick Commands Reference

### Backup Commands

```bash
# Quick backup before changes
backup-project.bat

# Firebase backup
backup-firebase.bat

# Create git tag
git tag -a vX.Y.Z-snapshot -m "Description"
git push origin vX.Y.Z-snapshot

# See all backup tags
git tag -l "v*-snapshot"
git tag -l "v*-monthly"
```

### Restore Commands

```bash
# List available tags
git tag -l

# Restore to specific tag
git checkout vX.Y.Z-snapshot

# See what changed since tag
git diff vX.Y.Z-snapshot

# Hard reset to tag (DESTRUCTIVE)
git reset --hard vX.Y.Z-snapshot
```

### Firebase Commands

```bash
# Export Firestore
firebase firestore:export gs://quota-finance.appspot.com/firestore-backups/$(date +%Y%m%d)

# Import Firestore
firebase firestore:import gs://quota-finance.appspot.com/firestore-backups/YYYYMMDD

# Export auth users
firebase auth:export users-backup.json

# Export rules
firebase firestore:rules get -o firestore.rules
```

---

## ✅ Monthly Checklist Summary

**Print this and check off monthly:**

### First Sunday of Every Month:

- [ ] Code backup (`backup-project.bat`)
- [ ] Git tag (monthly)
- [ ] Firebase backup (`backup-firebase.bat`)
- [ ] Firestore export (via Console/CLI)
- [ ] Auth users export
- [ ] Copy to external drive
- [ ] Verify .env in 3 locations
- [ ] Verify keystore in 3 locations (when created)
- [ ] Update backup log above
- [ ] Test restore (every 3 months)

**Estimated time: 15-20 minutes**

---

## 💡 Pro Tips

1. **Set Calendar Reminder**
   - First Sunday of every month
   - Reminder: "QUOTA Monthly Backup"

2. **Automate What You Can**
   - Use Task Scheduler (Windows) to run backup-project.bat weekly
   - Set Firebase export to auto-schedule via Cloud Functions

3. **Test Your Backups**
   - A backup you haven't tested is not a real backup
   - Do restore test quarterly

4. **Keep Backup Log Updated**
   - Note date, location, what was backed up
   - Future you will thank you

5. **Version Your Backups**
   - Don't overwrite old backups
   - Keep at least 3 months of history

6. **Store Securely**
   - Encrypt sensitive files
   - Use strong passwords
   - Never commit secrets to git

---

## 🎯 Remember

**The backup you skip is the one you'll need.**

**3-2-1 Rule:**
- **3** copies of data
- **2** different storage types
- **1** offsite backup

**Before EVERY major change:**
```bash
backup-project.bat
```

**That's it. Stay safe! 🛡️**
