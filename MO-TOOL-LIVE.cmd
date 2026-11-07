@echo off
setlocal
cd /d "%~dp0"
title An Lien - TikTok LIVE
where node >nul 2>nul
if errorlevel 1 (
 echo Can cai Node.js 24 LTS tu nodejs.org de chay tool.
 pause
 exit /b 1
)
if not exist "node_modules\tiktok-live-connector\package.json" (
 echo Chua cai thu vien. Mo Terminal tai thu muc nay va chay: npm ci
 pause
 exit /b 1
)
if not exist "dist\live-control.html" (
 echo Chua co ban build. Mo Terminal va chay: npm run build -- --emptyOutDir false
 pause
 exit /b 1
)
echo Mo bang dieu khien: http://127.0.0.1:5197/
echo Giu cua so nay khi dung tool. Ctrl+C de tat.
node live/server.mjs
pause
