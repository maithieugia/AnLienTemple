@echo off
scp -q -i C:/Users/Admin/.ssh/wiservices-bebooking.key deploy/river80-overlay.tar.gz deploy/update-river80.sh deploy/verify-river80.mjs root@221.121.3.69:/tmp/
if errorlevel 1 exit /b 1
ssh -o BatchMode=yes -i C:/Users/Admin/.ssh/wiservices-bebooking.key root@221.121.3.69 bash /tmp/update-river80.sh /tmp/river80-overlay.tar.gz > docs/river80-deploy.log 2>&1
if errorlevel 1 exit /b 1
ssh -o BatchMode=yes -i C:/Users/Admin/.ssh/wiservices-bebooking.key root@221.121.3.69 node --experimental-strip-types /tmp/verify-river80.mjs > docs/river80-server-verification.log 2>&1
if errorlevel 1 exit /b 1
python deploy/record-river80.py
