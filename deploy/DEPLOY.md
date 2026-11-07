# Đưa Chùa An Liên online lên dichua.palo.io.vn

## 1. Tên miền (Cloudflare, làm 1 lần)
Cloudflare → palo.io.vn → DNS → **Add record**: Type `A`, Name `dichua`, IPv4 `221.121.3.69`, Proxy **bật (mây cam)**.
Cloudflare hỗ trợ WebSocket sẵn, không cần chỉnh gì thêm.

## 2. Build + đóng gói (trên máy anh, PowerShell)
```powershell
cd C:\Users\Admin\Veilbound\projects\AnLienTemple
npm run build:public
Remove-Item -Recurse -Force dist\assets\sanctuary\guardians, dist\assets\sanctuary\photo-buddha, dist\reference.html, dist\sculptures.html -ErrorAction SilentlyContinue
node deploy\pack.mjs
```
(`pack.mjs` tự dừng nếu dist còn tượng hộ pháp NC-ND hoặc tượng thử từ ảnh không có bản quyền.)

## 3. Gửi lên server và cài
```powershell
scp -i $HOME\.ssh\wiservices-bebooking.key deploy\anlien-release.tar.gz deploy\install.sh root@221.121.3.69:/root/
ssh -i $HOME\.ssh\wiservices-bebooking.key root@221.121.3.69 "bash /root/install.sh"
```
`install.sh` làm: giải nén code vào `/opt/anlien`, web vào `/var/www/anlien` (quyền đọc cho Caddy), dữ liệu tài khoản ở `/opt/anlien-data` (SQLite, chmod 700),
chạy pm2 `anlien-server` cổng 8930 (chỉ 127.0.0.1), thêm khối `dichua.palo.io.vn` vào Caddyfile **một lần** (sao lưu trước, `caddy validate`, lỗi thì tự khôi phục), reload Caddy.

Kiểm tra: https://dichua.palo.io.vn/api/health → `{"ok":true,...}`; mở https://dichua.palo.io.vn/ → màn đăng nhập.

## Cập nhật bản mới
Làm lại bước 2 + 3 (install.sh tự `pm2 restart`, giữ nguyên tài khoản/công đức).

## Sao lưu tài khoản
`/opt/anlien-data/anlien.sqlite` (+ `-wal`). Ví dụ thêm vào cron sao lưu hiện có: `sqlite3 /opt/anlien-data/anlien.sqlite ".backup /root/backups/anlien-$(date +%F).sqlite"`.

## Ghi chú
- Server: Node ≥ 22 (dùng type-stripping + node:sqlite tích hợp), thư viện duy nhất `ws` đã đóng kèm (server không cần npm).
- Bản công khai KHÔNG có 19 tượng hộ pháp Sanjūsangen-dō (CC BY-NC-ND) — hai hàng bệ lối vào để trống.

## Cập nhật hiện hữu từ 01/11/2026

Giữ build local riêng, tạo build công khai trong `dist-public`:

```powershell
npm run build:public -- --outDir dist-public
node deploy/prepare-public.mjs
node deploy/compress-assets.mjs dist-public   # nén mô hình 3D (meshopt + ảnh WebP), chỉ trong dist-public
node deploy/asset-manifest.mjs dist-public    # danh sách file + mã băm cho service worker (người quay lại tải từ máy)
node deploy/pack.mjs dist-public
scp -i $HOME/.ssh/wiservices-bebooking.key deploy/anlien-release.tar.gz deploy/update-existing.sh root@221.121.3.69:/root/
ssh -i $HOME/.ssh/wiservices-bebooking.key root@221.121.3.69 "bash /root/update-existing.sh /root/anlien-release.tar.gz"
```

`update-existing.sh` chỉ cập nhật site đã cài: sao lưu web/app và SQLite bằng backup API vào `/root/anlien-backups/<revision>-<UTC timestamp>` (riêng tư), chuẩn bị rồi đổi web/app, giữ hashed chunks cũ cho tab đang mở, restart đúng `anlien-server`, kiểm health/release và tổng tài khoản/công đức không giảm. Có rollback app/web khi kiểm tra lỗi; không khôi phục đè DB đang chạy và không chỉnh Caddy/site khác. `install.sh` cũ chỉ dành cài mới.

Bản public không build/ship `live-control.html`, `live-overlay.html`, entry reference hay hai thư mục guardians/photo-buddha. Dashboard/bridge TikTok giữ local5197. Người phát sóng thêm `?broadcast=1` vào game online để thấy nút mở tool localhost ở tab riêng; khách thông thường không thấy nút. Không nhúng HTTP localhost vào trang HTTPS (tránh mixed content); overlay phối trong OBS như docs/TIKTOK_LIVE.md.

`/release.json` và `document.documentElement.dataset.release` dùng xác nhận revision; tài khoản/công đức vẫn ở `/opt/anlien-data/anlien.sqlite`.


## Nén mô hình 3D (từ 03/11/2026)

`deploy/compress-assets.mjs dist-public` nén mọi .glb trong bản công khai: hình khối EXT_meshopt_compression, normal/UV lượng tử hóa, ảnh WebP ≤2048 px (low/far ≤1024). Giữ nguyên tọa độ, khớp xương, tên vật liệu/nút vì code game đọc trực tiếp. Không đụng `public/` (nguồn của Codex và test). Game giải nén bằng `public/assets/vendor/meshopt_decoder.js` (main.ts). Lần đầu: 545,8 MB → 219,6 MB.
