#!/usr/bin/env bash
# Server hardening for the An Lien game on the Google Cloud VM (deploy@34.143.183.97), 2026-11-06. Safe to re-run.
#  - web ports 80/443 only from Cloudflare (the origin IP can't be hit directly, Cloudflare absorbs floods)
#  - SSH key-only + fail2ban; automatic security updates
#  - TURN ports stay open to everyone (calls)
#  - Caddy security headers, small request bodies; pm2 memory guard; nightly DB backups; health watchdog
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
sudo apt-get install -y -qq ufw fail2ban sqlite3 >/dev/null 2>&1

# ---------- firewall ----------
sudo tee /usr/local/sbin/anlien-cf-firewall >/dev/null <<'EOF'
#!/usr/bin/env bash
# Rebuild the ufw rules: web only from Cloudflare's published ranges (refreshed weekly by cron).
set -euo pipefail
v4=$(curl -fsS -m 20 https://www.cloudflare.com/ips-v4) && v6=$(curl -fsS -m 20 https://www.cloudflare.com/ips-v6) || { echo "could not fetch Cloudflare ranges, keeping current rules"; exit 0; }
[ "$(echo "$v4" | wc -l)" -ge 10 ] || { echo "Cloudflare list looks wrong, keeping current rules"; exit 0; }
ufw --force reset >/dev/null
ufw default deny incoming >/dev/null; ufw default allow outgoing >/dev/null
ufw allow 22/tcp comment 'ssh (key only, fail2ban)' >/dev/null
ufw allow 3478/tcp comment 'turn' >/dev/null; ufw allow 3478/udp comment 'turn' >/dev/null; ufw allow 49160:49999/udp comment 'turn relay' >/dev/null
for r in $v4 $v6; do ufw allow proto tcp from "$r" to any port 80,443 comment 'cloudflare' >/dev/null; done
ufw --force enable >/dev/null
echo "firewall: $(ufw status | grep -c cloudflare) cloudflare rules"
EOF
sudo chmod 755 /usr/local/sbin/anlien-cf-firewall
sudo /usr/local/sbin/anlien-cf-firewall
echo '17 4 * * 1 root /usr/local/sbin/anlien-cf-firewall >> /var/log/anlien-cf-firewall.log 2>&1' | sudo tee /etc/cron.d/anlien-cf-firewall >/dev/null

# ---------- ssh + fail2ban + updates ----------
sudo tee /etc/ssh/sshd_config.d/90-anlien.conf >/dev/null <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
MaxAuthTries 4
LoginGraceTime 30
EOF
sudo sshd -t && sudo systemctl reload ssh
sudo tee /etc/fail2ban/jail.d/anlien.local >/dev/null <<'EOF'
[sshd]
enabled = true
maxretry = 5
findtime = 10m
bantime = 1h
EOF
sudo systemctl enable --now fail2ban >/dev/null 2>&1; sudo systemctl restart fail2ban
printf 'APT::Periodic::Update-Package-Lists "1";\nAPT::Periodic::Unattended-Upgrade "1";\n' | sudo tee /etc/apt/apt.conf.d/20auto-upgrades >/dev/null

# ---------- Caddy: headers, body size; the raw-IP test name is retired (the firewall only admits Cloudflare) ----------
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-$(date +%s)
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
{
	servers {
		timeouts {
			read_header 10s
			idle 2m
		}
	}
}
dichua.palo.io.vn {
	encode zstd gzip
	header {
		Strict-Transport-Security "max-age=31536000"
		X-Content-Type-Options "nosniff"
		Referrer-Policy "strict-origin-when-cross-origin"
		X-Frame-Options "SAMEORIGIN"
		Permissions-Policy "camera=(self), microphone=(self), geolocation=(), payment=()"
		-Server
	}
	@live path /api/* /ws
	handle @live {
		request_body {
			max_size 64KB
		}
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
	handle_errors 404 {
		header Cache-Control "no-store"
		respond "Not found" 404
	}
}
EOF
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null 2>&1 && sudo systemctl reload caddy && echo "caddy reloaded"

# ---------- pm2 memory guard (keeps env such as TURN_SECRET) ----------
pm2 restart anlien-server --max-memory-restart 1500M >/dev/null 2>&1 || true; pm2 save >/dev/null 2>&1 || true

# ---------- nightly database backup (14 days) ----------
mkdir -p "$HOME/anlien-db-backups"; chmod 700 "$HOME/anlien-db-backups"
cat > "$HOME/anlien-backup.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
D=$HOME/anlien-db-backups; F=$D/anlien-$(date -u +%Y%m%dT%H%M%SZ).sqlite
sqlite3 /opt/anlien-data/anlien.sqlite ".backup '$F'" && gzip "$F"
find "$D" -name 'anlien-*.sqlite.gz' -mtime +14 -delete
EOF
chmod 700 "$HOME/anlien-backup.sh"

# ---------- watchdog: restart the game server if health fails 3 minutes in a row ----------
cat > "$HOME/anlien-watchdog.sh" <<'EOF'
#!/usr/bin/env bash
S=$HOME/.anlien-watchdog
if curl -fsS -m 5 127.0.0.1:8930/api/health >/dev/null; then echo 0 > "$S"; exit 0; fi
n=$(( $(cat "$S" 2>/dev/null || echo 0) + 1 )); echo $n > "$S"
if [ $n -ge 3 ]; then echo "$(date -u) health failed $n× → restart" >> $HOME/anlien-watchdog.log; pm2 restart anlien-server >/dev/null; echo 0 > "$S"; fi
EOF
chmod 700 "$HOME/anlien-watchdog.sh"
( { crontab -l 2>/dev/null || true; } | grep -v -e anlien-backup.sh -e anlien-watchdog.sh || true; echo "23 3 * * * $HOME/anlien-backup.sh"; echo "* * * * * PATH=/usr/bin:/bin:/usr/local/bin $HOME/anlien-watchdog.sh" ) | crontab -
"$HOME/anlien-backup.sh" && ls "$HOME/anlien-db-backups" | tail -1
echo "HARDENED"
