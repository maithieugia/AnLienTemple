#!/usr/bin/env bash
# Update only the existing An Lien site. Leave Caddy and other sites untouched.
set -euo pipefail
ARCHIVE=${1:?archive path required}; APP=/opt/anlien; WEB=/var/www/anlien; DATA=/opt/anlien-data
[ -f "$ARCHIVE" ] && [ -d "$APP/server" ] && [ -d "$WEB/assets" ] && [ -f "$DATA/anlien.sqlite" ]
pm2 describe anlien-server >/dev/null
WORK=$(mktemp -d /var/www/.anlien-update.XXXXXX)
tar -xzf "$ARCHIVE" -C "$WORK"
REV=$(node -p "JSON.parse(require('fs').readFileSync('$WORK/dist/release.json')).revision")
[[ "$REV" =~ ^[a-zA-Z0-9.-]+$ ]] || exit 1
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACK=/root/anlien-backups/$REV-$STAMP
mkdir -p "$BACK"; chmod 700 /root/anlien-backups "$BACK"
cp -a "$APP" "$BACK/app"; cp -a "$WEB" "$BACK/web"
python3 - "$DATA/anlien.sqlite" "$BACK/anlien.sqlite" <<'PY'
import sqlite3,sys,json
src=sqlite3.connect(sys.argv[1]); dst=sqlite3.connect(sys.argv[2]);src.backup(dst);dst.close()
counts={'users':src.execute('select count(*) from users').fetchone()[0], 'merit':list(src.execute('select coalesce(sum(wheel),0),coalesce(sum(incense),0),coalesce(sum(bows),0),coalesce(sum(sits),0) from merit').fetchone())}
open(sys.argv[2]+'.counts.json','w').write(json.dumps(counts)); print('Before:',json.dumps(counts)); src.close()
PY
chmod 600 "$BACK/anlien.sqlite" "$BACK/anlien.sqlite.counts.json"
# Keep old hashed chunks readable for browsers already in the previous version.
find "$WEB/assets" -maxdepth 1 -type f \( -name '*.js' -o -name '*.css' \) -exec cp -n {} "$WORK/dist/assets/" \;
chown -R www-data:www-data "$WORK/dist"; chmod -R a+rX "$WORK/dist"
SWAPPED=0
rollback(){
 code=$?; trap - ERR
 if [ "$SWAPPED" = 1 ]; then
  [ ! -e "$APP" ] || mv "$APP" "$BACK/failed-app"
  [ ! -e "$WEB" ] || mv "$WEB" "$BACK/failed-web"
  cp -a "$BACK/app" "$APP"; cp -a "$BACK/web" "$WEB"
  PORT=8930 HOST=127.0.0.1 DATA_DIR="$DATA" STATIC_DIR="$WEB" COOKIE_SECURE=1 pm2 restart anlien-server --update-env || true
 fi
 echo "Update failed; previous app/web restored. Database untouched. Backup: $BACK" >&2
 exit "$code"
}
trap rollback ERR
SWAPPED=1
mv "$APP" "$WORK/previous-app"; mv "$WORK/app" "$APP"
mv "$WEB" "$WORK/previous-web"; mv "$WORK/dist" "$WEB"
PORT=8930 HOST=127.0.0.1 DATA_DIR="$DATA" STATIC_DIR="$WEB" COOKIE_SECURE=1 pm2 restart anlien-server --update-env
sleep 2
curl --fail --silent http://127.0.0.1:8930/api/health
ACTUAL=$(curl --fail --silent http://127.0.0.1:8930/release.json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).revision")
[ "$ACTUAL" = "$REV" ]
python3 - "$DATA/anlien.sqlite" "$BACK/anlien.sqlite.counts.json" <<'PY'
import sqlite3,sys,json
db=sqlite3.connect('file:'+sys.argv[1]+'?mode=ro',uri=True)
after={'users':db.execute('select count(*) from users').fetchone()[0], 'merit':list(db.execute('select coalesce(sum(wheel),0),coalesce(sum(incense),0),coalesce(sum(bows),0),coalesce(sum(sits),0) from merit').fetchone())}
before=json.load(open(sys.argv[2]));assert after['users']>=before['users'];assert all(a>=b for a,b in zip(after['merit'],before['merit']))
print('\nAfter:',json.dumps(after));db.close()
PY
pm2 save >/dev/null
trap - ERR
echo "DEPLOYED $REV"
echo "BACKUP $BACK"
# WORK holds only unpacked release and old app/web; the backup remains intact.
case "$WORK" in /var/www/.anlien-update.*) rm -rf -- "$WORK";; *) exit 1;; esac
