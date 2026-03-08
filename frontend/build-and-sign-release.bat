@echo off
echo ========================================
echo QUOTA - Build and Sign Release AAB
echo ========================================
echo.

REM Check version update
echo BEFORE RUNNING:
echo 1. Have you updated versionCode in android/app/build.gradle?
echo 2. Have you updated versionName in android/app/build.gradle?
echo 3. Have you tested the app thoroughly?
echo.
set /p continue="Continue? (y/n): "
if /i not "%continue%"=="y" (
    echo Build cancelled.
    pause
    exit /b 1
)

echo.
echo [1/6] Cleaning previous builds...
cd android
call gradlew.bat clean
if %errorlevel% neq 0 (
    echo ERROR: Clean failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [2/6] Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Web build failed
    pause
    exit /b 1
)

echo.
echo [3/6] Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed
    pause
    exit /b 1
)

echo.
echo [4/6] Building Android App Bundle (AAB)...
cd android
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo ERROR: AAB build failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [5/6] Signing AAB...
echo.
echo Enter keystore location (default: quota-release-keystore.jks):
set /p KEYSTORE_PATH=
if "%KEYSTORE_PATH%"=="" set KEYSTORE_PATH=quota-release-keystore.jks

echo Enter alias name (default: quota-release):
set /p ALIAS_NAME=
if "%ALIAS_NAME%"=="" set ALIAS_NAME=quota-release

jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 ^
  -keystore "%KEYSTORE_PATH%" ^
  android/app/build/outputs/bundle/release/app-release.aab ^
  "%ALIAS_NAME%"

if %errorlevel% neq 0 (
    echo ERROR: Signing failed
    pause
    exit /b 1
)

echo.
echo [6/6] Verifying signature...
jarsigner -verify -verbose -certs ^
  android/app/build/outputs/bundle/release/app-release.aab

if %errorlevel% neq 0 (
    echo ERROR: Verification failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo BUILD AND SIGN COMPLETED!
echo ========================================
echo.
echo Signed AAB location:
echo android\app\build\outputs\bundle\release\app-release.aab
echo.
echo NEXT STEPS:
echo 1. Upload to Google Play Console
echo 2. Fill in release notes
echo 3. Submit for review
echo.
echo Average review time: 1-3 days
echo.
pause
