@echo off
echo ========================================
echo QUOTA - Create Release Keystore
echo ========================================
echo.
echo IMPORTANTE: Questo crea il keystore di produzione per Play Store
echo.
echo DEVI RICORDARE:
echo - La password del keystore
echo - La password della chiave
echo - Conservare il file .keystore in luogo SICURO
echo.
echo SENZA QUESTO FILE NON POTRAI AGGIORNARE L'APP IN FUTURO!
echo.
pause
echo.

set KEYSTORE_NAME=quota-release-keystore.jks
set ALIAS_NAME=quota-release

echo Creazione keystore...
echo.

keytool -genkey -v -keystore %KEYSTORE_NAME% ^
  -alias %ALIAS_NAME% ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 10000

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Creazione keystore fallita
    pause
    exit /b 1
)

echo.
echo ========================================
echo KEYSTORE CREATO CON SUCCESSO!
echo ========================================
echo.
echo File creato: %KEYSTORE_NAME%
echo.
echo IMPORTANTE - FAI SUBITO:
echo 1. Copia %KEYSTORE_NAME% in un luogo SICURO
echo    (es: chiavetta USB, cloud cifrato, password manager)
echo 2. Salva le password in un password manager
echo 3. NON committare questo file su git (è già in .gitignore)
echo.
echo SENZA QUESTO FILE NON POTRAI AGGIORNARE L'APP!
echo.
pause
