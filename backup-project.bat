@echo off
setlocal enabledelayedexpansion

echo ========================================
echo QUOTA - Project Backup Script
echo ========================================
echo.

REM Get current date and time for backup folder name
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%_%dt:~8,2%-%dt:~10,2%-%dt:~12,2%"

REM Define backup location
set "BACKUP_ROOT=C:\Users\edoni\Desktop\ETF ECC BACKUPS"
set "BACKUP_DIR=%BACKUP_ROOT%\QUOTA-BACKUP-%timestamp%"

echo Creating backup directory...
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
mkdir "%BACKUP_DIR%"

echo.
echo [1/7] Saving git information...
git log -1 --oneline > "%BACKUP_DIR%\git-commit-info.txt"
git status > "%BACKUP_DIR%\git-status.txt"
git branch --show-current > "%BACKUP_DIR%\git-branch.txt"
git remote -v > "%BACKUP_DIR%\git-remote.txt"

echo.
echo [2/7] Copying source code...
mkdir "%BACKUP_DIR%\frontend"
xcopy /E /I /Y /EXCLUDE:backup-exclude.txt "frontend\src" "%BACKUP_DIR%\frontend\src"
xcopy /E /I /Y /EXCLUDE:backup-exclude.txt "frontend\public" "%BACKUP_DIR%\frontend\public"
copy /Y "frontend\*.json" "%BACKUP_DIR%\frontend\"
copy /Y "frontend\*.ts" "%BACKUP_DIR%\frontend\"
copy /Y "frontend\*.js" "%BACKUP_DIR%\frontend\"
copy /Y "frontend\*.config.*" "%BACKUP_DIR%\frontend\" 2>nul
copy /Y "frontend\.env*" "%BACKUP_DIR%\frontend\" 2>nul

echo.
echo [3/7] Copying backend code...
if exist "backend" (
    mkdir "%BACKUP_DIR%\backend"
    xcopy /E /I /Y /EXCLUDE:backup-exclude.txt "backend" "%BACKUP_DIR%\backend"
)

echo.
echo [4/7] Copying documentation...
copy /Y "*.md" "%BACKUP_DIR%\" 2>nul
copy /Y "frontend\*.md" "%BACKUP_DIR%\frontend\" 2>nul

echo.
echo [5/7] Copying configuration files...
copy /Y ".gitignore" "%BACKUP_DIR%\"
copy /Y "package*.json" "%BACKUP_DIR%\" 2>nul
copy /Y "tsconfig.json" "%BACKUP_DIR%\" 2>nul

echo.
echo [6/7] Copying data files...
if exist "data" (
    mkdir "%BACKUP_DIR%\data"
    xcopy /E /I /Y "data" "%BACKUP_DIR%\data"
)

echo.
echo [7/7] Creating backup info file...
(
    echo QUOTA PROJECT BACKUP
    echo ==================
    echo.
    echo Backup Date: %date% %time%
    echo Backup Location: %BACKUP_DIR%
    echo.
    echo Git Information:
    echo ----------------
    type "%BACKUP_DIR%\git-commit-info.txt"
    echo.
    echo Branch:
    type "%BACKUP_DIR%\git-branch.txt"
    echo.
    echo.
    echo RESTORE INSTRUCTIONS:
    echo --------------------
    echo 1. Copy this backup folder to your desired location
    echo 2. Run: npm install (in frontend folder^)
    echo 3. Restore .env file with your Firebase credentials
    echo 4. Run: npm run dev (to test^)
    echo.
    echo IMPORTANT FILES TO RESTORE SEPARATELY:
    echo - Firebase credentials (.env^)
    echo - Play Store keystore (if created^)
    echo - node_modules (reinstall with npm install^)
    echo.
    echo For complete restore guide, see BACKUP-RESTORE-GUIDE.md
) > "%BACKUP_DIR%\BACKUP-INFO.txt"

echo.
echo ========================================
echo BACKUP COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Backup Location:
echo %BACKUP_DIR%
echo.
echo Backup Size:
for /f "tokens=3" %%a in ('dir /s "%BACKUP_DIR%" ^| find "File(s)"') do set size=%%a
echo Approximately %size% bytes
echo.
echo NEXT STEPS:
echo 1. Verify backup folder exists and contains files
echo 2. Consider copying to external drive or cloud storage
echo 3. For Firebase backup, run: backup-firebase.bat
echo 4. Keep this backup before making major changes
echo.
pause
