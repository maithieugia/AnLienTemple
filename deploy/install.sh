#!/usr/bin/env bash
# Chùa An Liên online — install/update on the Bebooking VM. Run as root after uploading anlien-release.tar.gz to /root.
set -euo pipefail
REL=/root/anlien-release.tar.gz; APP=/opt/anlien; WEB=/var/www/anlien; DATA=/opt/anlien-data; PORT=8930
[ -f "$REL" ] || { echo "Missing $REL"; exit 1; }
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]'); [ "$NODE_MAJOR" -ge 22 ] || { echo "Need Node >= 22, have $(node -v)"; exit 1; }
if ss -ltn | grep -q ":$PORT " && ! pm2 describe anlien-server >/dev/null 2>&1; then echo "Port $PORT already used by something else"; exit 1; fi
TMP=$(mktemp -d); tar -xzf "$REL" -C "$TMP"
mkdir -p "$APP" "$WEB" "$DATA"
rm -rf "$APP/server" "$APP/src" "$APP/node_modules"; cp -r "$TMP/app/." "$APP/"
rm -rf "$WEB"/*; cp -r "$TMP/dist/." "$WEB/"
# Caddy runs as user 'caddy': static files must be world-readable (see the 2026-09-17 deploy incident).
chown -R www-data:www-data "$WEB"; chmod -R a+rX "$WEB"; chmod 700 "$DATA"
rm -rf "$TMP"
FLAGS="--experimental-strip-types --experimental-sqlite --disable-warning=ExperimentalWarning"
if pm2 describe anlien-server >/dev/null 2>&1; then
  PORT=$PORT HOST=127.0.0.1 DATA_DIR=$DATA STATIC_DIR=$WEB COOKIE_SECURE=1 pm2 restart anlien-server --update-env
else
  PORT=$PORT HOST=127.0.0.1 DATA_DIR=$DATA STATIC_DIR=$WEB COOKIE_SECURE=1 pm2 start "$APP/server/server.ts" --name anlien-server --node-args="$FLAGS" --max-memory-restart 400M
fi
pm2 save
sleep 2; curl -fsS "http://127.0.0.1:$PORT/api/health" && echo " <- server OK"
# Caddy site block (added once, validated before reload; old file kept as a backup).
CF=/etc/caddy/Caddyfile
if ! grep -q 'dichua.palo.io.vn' "$CF"; then
  cp "$CF" "$CF.bak-anlien-$(date +%Y%m%d%H%M)"
  cat >> "$CF" <<'CADDY'

dichua.palo.io.vn {
	encode zstd gzip
	@live path /api/* /ws
	handle @live {
		reverse_proxy 127.0.0.1:8930
	}
	handle {
		root * /var/www/anlien
		@hashed {
			path_regexp \.(js|css)$
			not path /sw.js
		}
		header /sw.js Cache-Control "no-cache"
		header /asset-manifest.json Cache-Control "no-cache"
		header @hashed Cache-Control "public, max-age=31536000, immutable"
		header /assets/sanctuary/* Cache-Control "public, max-age=604800"
		@page path / /index.html
		header @page Cache-Control "no-cache"
		@spa {
			not path /assets/*
			not file
		}
		rewrite @spa /index.html
		file_server
	}
}
CADDY
  if caddy validate --config "$CF" --adapter caddyfile; then systemctl reload caddy; echo "Caddy reloaded"; else cp "$(ls -t $CF.bak-anlien-* | head -1)" "$CF"; echo "Caddy config invalid — restored backup"; exit 1; fi
fi
echo "Done. Check: https://dichua.palo.io.vn/api/health"
