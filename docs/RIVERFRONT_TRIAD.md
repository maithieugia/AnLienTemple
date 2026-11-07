## 03/11/2026 — Bộ ba sát sông, trả hàng tượng cũ, tạo chiều sâu bậc xuống nước (ĐÃ LÊN SERVER)

Revision `2026-11-03-riverfront-triad-3`. Bộ ba dịch z568 (tiến28m về sông), giữ x và khoảng hở mép3m, cao100m/vật liệu vàng/hướng mặt như cũ. Mặt trước footprint còn3,35–4,20m tới bậc đầu z597,5, đủ một lối đi trước tượng. Ba tượng nhỏ trái trả z465→520, thẳng hàng đối xứng với ba tượng bên phải; Phật nằm không đổi.

Bậc bờ sông giữ đúng hình học/cao độ và collider. Thêm mặt đứng màu đá xám, viền mép trắng và dải bóng tiếp xúc ngay dưới mỗi cổ bậc; hiệu ứng hoạt động cả mức Nhẹ khi bóng động toàn cảnh tắt. Không tăng shadow map toàn game. Preview entrance-river.html được thêm vào input Vite public để bản kiểm tra dùng đúng mã renderer hiện tại thay vì HTML/chunk cũ còn trong dist-public.

Đã kiểm:13/13test bộ ba/sông/7tượng cũ đạt; xác nhận hàng6tượng z520 đối xứng, footprint bộ ba không chồng tượng nhỏ/cổng/sông, bậc vẫn liên tục. TypeScript và build public đạt. Browser local thử capsule đi xuống hết bậc đạt chân−2,24m sát nước; đã nhìn rõ nhịp bậc (docs/riverfront-stairs-local.png). Public preview đã mở bản mới và thấy bậc có mặt đứng đậm. Chưa đi bộ thử toàn bộ mặt trước bộ ba bằng avatar online, chưa nghiệm thu mọi góc ánh sáng/mobile.

Backup server: /root/anlien-backups/2026-11-03-riverfront-triad-3-20261103T081141Z. Health/release/SHA main/shared landscape/layout/stupa và9GLB bộ ba,3GLB tháp,7GLB sân đều đạt. Số liệu DB sau cập nhật: users=2, merit=[35, 2, 33, 446]; không reset dữ liệu. Log docs/riverfront-triad-deploy.log, riverfront-triad-verify.log, riverfront-triad-production-verification.json. Dùng pack-front-triad.mjs hoặc full release mới cho lần sau; full baseline cũ cần overlay đủ asset như các bản trước.

Checkpoint: authoring/checkpoints/20261103-riverfront-triad. Bản trước ghi z540/hàng nhỏ465 là lịch sử, đã được thay bằng bố trí này.

