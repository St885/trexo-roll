@echo off
REM iniciar-juego.bat — Arranca TREXoRoll en local con doble clic.
REM Deja esta ventana abierta mientras juegas; ciérrala para apagar el servidor.
title TREXoRoll - servidor local (cierra esta ventana para apagarlo)
cd /d "%~dp0"
echo.
echo   TREXoRoll - servidor local
echo   Abriendo http://localhost:3000 en tu navegador...
echo.
start "" cmd /c "timeout /t 3 >nul & start http://localhost:3000"
npx serve . -p 3000 -L
