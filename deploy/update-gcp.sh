#!/usr/bin/env bash
# Update the An Lien copy on the Google Cloud server (34.143.183.97, user deploy). Backs up app/web/db first; keeps pm2 env (TURN).
set -euo pipefail
ARCHIVE=${1:-$HOME/anlien-release.tar.gz}; APP=/opt/anlien; WEB=/var/www/anlien; DATA=/opt/anlien-data
STAMP=$(date -u +%Y%m%dT%H%M%SZ); BACK=$HOME/anlien-backups/$STAMP; mkdir -p "$BACK"; chmod 700 "$HOME/anlien-backups"
W=$(mktemp -d); tar -xzf "$ARCHIVE" -C "$W"
cp -a "$APP" "$BACK/app"; sudo cp -a "$WEB" "$BACK/web"
[ -f "$DATA/anlien.sqlite" ] && sqlite3 "$DATA/anlien.sqlite" ".backup '$BACK/anlien.sqlite'" 2>/dev/null || cp "$DATA/anlien.sqlite" "$BACK/" 2>/dev/null || true
# keep old hashed chunks for browsers still on the previous version
sudo find "$WEB/assets" -maxdepth 1 -type f \( -name '*.js' -o -name '*.css' \) -exec cp -n {} "$W/dist/assets/" \;
sudo rsync -a --delete "$W/dist/" "$WEB/"; sudo chown -R www-data:www-data "$WEB"; sudo chmod -R a+rX "$WEB"
rm -rf "$APP/server" "$APP/src"; cp -a "$W/app/server" "$W/app/src" "$APP/"
pm2 restart anlien-server >/dev/null; sleep 3
curl -sf 127.0.0.1:8930/api/health >/dev/null || { echo "health failed, restoring $BACK" >&2; rm -rf "$APP/server" "$APP/src"; cp -a "$BACK/app/server" "$BACK/app/src" "$APP/"; sudo rsync -a --delete "$BACK/web/" "$WEB/"; pm2 restart anlien-server; exit 1; }
ls -1dt "$HOME"/anlien-backups/* | tail -n +6 | xargs -r sudo rm -rf   # keep the last 5 backups
rm -rf "$W"; echo "UPDATED $STAMP (backup $BACK)"; curl -s 127.0.0.1:8930/api/health
