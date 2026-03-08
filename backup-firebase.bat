@echo off
echo ========================================
echo QUOTA - Firebase Backup Script
echo ========================================
echo.
echo This script guides you through backing up your Firebase data.
echo.
echo WHAT WILL BE BACKED UP:
echo - Firestore database (users, portfolios, backtests)
echo - Firestore security rules
echo - Firebase Authentication users
echo - Firebase Storage files (if any)
echo - Firebase configuration
echo.
pause
echo.

REM Get current date for backup folder
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%_%dt:~8,2%-%dt:~10,2%"

set "BACKUP_DIR=C:\Users\edoni\Desktop\ETF ECC BACKUPS\FIREBASE-BACKUP-%timestamp%"
mkdir "%BACKUP_DIR%"

echo ========================================
echo STEP 1: FIRESTORE DATABASE EXPORT
echo ========================================
echo.
echo MANUAL STEP REQUIRED:
echo 1. Go to: https://console.firebase.google.com
echo 2. Select your project: quota-finance
echo 3. Go to Firestore Database
echo 4. Click the 3 dots menu (top right)
echo 5. Select "Import/Export"
echo 6. Click "Export" tab
echo 7. Select "All collections" or specific collections:
echo    - users
echo    - portfolios
echo    - backtests
echo    - savedBacktests
echo 8. Choose export location (Cloud Storage bucket)
echo 9. Click "Export"
echo.
echo Alternative: Use Firebase CLI
echo Run: firebase firestore:export gs://quota-finance.appspot.com/firestore-backups/%timestamp%
echo.
pause

echo.
echo ========================================
echo STEP 2: EXPORT FIRESTORE RULES
echo ========================================
echo.
echo Exporting Firestore security rules...
echo.
echo MANUAL STEP:
echo 1. Go to Firestore Database -^> Rules tab
echo 2. Copy all rules
echo 3. Save to: %BACKUP_DIR%\firestore.rules
echo.
echo Or use Firebase CLI:
echo Run: firebase firestore:rules get -o "%BACKUP_DIR%\firestore.rules"
echo.
pause

echo.
echo ========================================
echo STEP 3: EXPORT AUTHENTICATION USERS
echo ========================================
echo.
echo Unfortunately, Firebase doesn't provide direct export for Auth users.
echo.
echo OPTIONS:
echo 1. Use Firebase Admin SDK to export users programmatically
echo 2. Use third-party tools like "firebase-auth-export"
echo 3. Use Google Cloud Identity Platform (paid feature)
echo.
echo For now, we'll save the user count and configuration.
echo.
echo MANUAL STEP:
echo 1. Go to Authentication section
echo 2. Note the number of users
echo 3. Screenshot the user list
echo 4. Save screenshot to: %BACKUP_DIR%\auth-users-screenshot.png
echo.
pause

echo.
echo ========================================
echo STEP 4: BACKUP FIREBASE CONFIGURATION
echo ========================================
echo.
echo Copying Firebase configuration files...

if exist "frontend\src\config\firebase.ts" (
    copy /Y "frontend\src\config\firebase.ts" "%BACKUP_DIR%\firebase.ts"
    echo ✓ firebase.ts copied
) else (
    echo ✗ firebase.ts not found
)

if exist "frontend\.env" (
    copy /Y "frontend\.env" "%BACKUP_DIR%\.env"
    echo ✓ .env copied
) else (
    echo ⚠ .env not found (this is CRITICAL for restore!)
)

if exist "frontend\.env.production" (
    copy /Y "frontend\.env.production" "%BACKUP_DIR%\.env.production"
    echo ✓ .env.production copied
)

echo.
echo ========================================
echo STEP 5: BACKUP STORAGE FILES
echo ========================================
echo.
echo If you have files in Firebase Storage:
echo 1. Go to Storage section
echo 2. Use gsutil to download all files:
echo    gsutil -m cp -r gs://quota-finance.appspot.com %BACKUP_DIR%\storage
echo.
echo Or download manually from Firebase Console
echo.
pause

echo.
echo ========================================
echo STEP 6: CREATE BACKUP DOCUMENTATION
echo ========================================
echo.

(
    echo FIREBASE BACKUP INFORMATION
    echo ==========================
    echo.
    echo Backup Date: %date% %time%
    echo Backup Location: %BACKUP_DIR%
    echo.
    echo FIREBASE PROJECT DETAILS:
    echo ------------------------
    echo Project ID: quota-finance
    echo Project Name: QUOTA
    echo.
    echo BACKUP CONTENTS:
    echo ---------------
    echo [√] Firebase configuration files
    echo [ ] Firestore database export (manual - see instructions above^)
    echo [ ] Firestore security rules
    echo [ ] Authentication users export (manual - see instructions above^)
    echo [ ] Storage files (if applicable^)
    echo.
    echo RESTORE INSTRUCTIONS:
    echo --------------------
    echo 1. Create new Firebase project or use existing
    echo 2. Import Firestore data from Cloud Storage bucket
    echo 3. Import Firestore rules from firestore.rules file
    echo 4. Restore .env file to frontend folder
    echo 5. Import Authentication users (if exported^)
    echo 6. Restore Storage files (if any^)
    echo.
    echo IMPORTANT:
    echo - Keep .env file SECURE (contains API keys^)
    echo - Firestore export is stored in Cloud Storage bucket
    echo - Authentication users require programmatic export
    echo.
    echo For complete restore guide, see BACKUP-RESTORE-GUIDE.md
) > "%BACKUP_DIR%\FIREBASE-BACKUP-INFO.txt"

echo.
echo ========================================
echo FIREBASE BACKUP PROCESS COMPLETED!
echo ========================================
echo.
echo Backup Location: %BACKUP_DIR%
echo.
echo FILES BACKED UP LOCALLY:
dir /B "%BACKUP_DIR%"
echo.
echo IMPORTANT NOTES:
echo ✓ Firebase config files saved locally
echo ⚠ Firestore data export must be done via Firebase Console or CLI
echo ⚠ Auth users export requires additional steps
echo.
echo NEXT STEPS:
echo 1. Complete Firestore export via Firebase Console
echo 2. Download Firestore export from Cloud Storage bucket
echo 3. Save Auth users screenshot or use export tool
echo 4. Store backup in secure location (encrypted cloud storage)
echo.
echo See FIREBASE-BACKUP-INFO.txt for detailed instructions
echo.
pause
