@echo off
setlocal
cd /d "%~dp0"
if not exist "data-local" mkdir "data-local"
node "%~dp0deploy\start-local.mjs"
if errorlevel 1 (
 pause
 exit /b 1
)
start "" "http://127.0.0.1:5200/?q=low&online=1"
