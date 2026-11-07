#!/usr/bin/env bash
set -euo pipefail
WEB=/var/www/anlien
ARCHIVE=${1:?web overlay required}
REV=2026-11-04-entrance-granite-1
BASE=2026-11-03-wheel-small-script-1
[ "$(node -p "JSON.parse(require('fs').readFileSync('$WEB/release.json')).revision")" = "$BASE" ]
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACK=/root/anlien-backups/$REV-$STAMP
STAGE=$(mktemp -d /var/www/.anlien-granite.XXXXXX)
mkdir -p "$BACK"; chmod 700 "$BACK"
cp -a "$WEB" "$BACK/web"
cp -a "$WEB/." "$STAGE/"
tar -xzf "$ARCHIVE" -C "$STAGE"
# Hash the actual preserved compressed assets, not local source GLBs.
node --input-type=module - "$STAGE" <<'JS'
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=process.argv[2],files={};
function walk(dir){for(const f of fs.readdirSync(dir).sort()){const p=path.join(dir,f);if(fs.statSync(p).isDirectory())walk(p);else files['/'+path.relative(root,p).replaceAll('\\','/')]=crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex').slice(0,12);}}
walk(path.join(root,'assets'));
fs.writeFileSync(path.join(root,'asset-manifest.json'),JSON.stringify({version:crypto.createHash('sha1').update(JSON.stringify(files)).digest('hex').slice(0,12),files}));
JS
chown -R www-data:www-data "$STAGE"; chmod -R a+rX "$STAGE"
mv "$WEB" "$BACK/previous-web"
if ! mv "$STAGE" "$WEB"; then mv "$BACK/previous-web" "$WEB"; exit 1; fi
if ! curl --fail --silent http://127.0.0.1:8930/api/health; then
 mv "$WEB" "$BACK/failed-web"; mv "$BACK/previous-web" "$WEB"; exit 1
fi
[ "$(node -p "JSON.parse(require('fs').readFileSync('$WEB/release.json')).revision")" = "$REV" ]
echo "DEPLOYED $REV"
echo "BACKUP $BACK"
