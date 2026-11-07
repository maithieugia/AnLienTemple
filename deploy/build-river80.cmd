node node_modules/typescript/bin/tsc --noEmit > docs\river80-typecheck.log 2>&1
if errorlevel 1 exit /b 1
node deploy/build-river80.mjs > docs\river80-build.log 2>&1
