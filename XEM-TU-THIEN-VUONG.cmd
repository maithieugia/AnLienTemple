@echo off
setlocal
cd /d "%~dp0"
node authoring/four-kings/start-preview.mjs
if errorlevel 1 (pause & exit /b 1)
start "" "http://127.0.0.1:5202/four-kings.html"
