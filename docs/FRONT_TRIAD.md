## Hiện tại03/11/2026:50m

Bộ ba đã hạ50m, giữ z568 và khoảng trống mép3m. Tâm x−150, hai bên x≈−181,75978/−118,51755. Chỉnh chất liệu/nhận shadow để giảm sẫm q=high. Các mốc100m dưới đây là lịch sử. Xem docs/STATUE_ORIGINAL_LOOK.md.

## 03/11/2026 — Bộ ba sát sông, trả hàng tượng cũ, tạo chiều sâu bậc xuống nước (ĐÃ LÊN SERVER)

Revision `2026-11-03-riverfront-triad-3`. Bộ ba dịch z568 (tiến28m về sông), giữ x và khoảng hở mép3m, cao100m/vật liệu vàng/hướng mặt như cũ. Mặt trước footprint còn3,35–4,20m tới bậc đầu z597,5, đủ một lối đi trước tượng. Ba tượng nhỏ trái trả z465→520, thẳng hàng đối xứng với ba tượng bên phải; Phật nằm không đổi.

Bậc bờ sông giữ đúng hình học/cao độ và collider. Thêm mặt đứng màu đá xám, viền mép trắng và dải bóng tiếp xúc ngay dưới mỗi cổ bậc; hiệu ứng hoạt động cả mức Nhẹ khi bóng động toàn cảnh tắt. Không tăng shadow map toàn game. Preview entrance-river.html được thêm vào input Vite public để bản kiểm tra dùng đúng mã renderer hiện tại thay vì HTML/chunk cũ còn trong dist-public.

Đã kiểm:13/13test bộ ba/sông/7tượng cũ đạt; xác nhận hàng6tượng z520 đối xứng, footprint bộ ba không chồng tượng nhỏ/cổng/sông, bậc vẫn liên tục. TypeScript và build public đạt. Browser local thử capsule đi xuống hết bậc đạt chân−2,24m sát nước; đã nhìn rõ nhịp bậc (docs/riverfront-stairs-local.png). Public preview đã mở bản mới và thấy bậc có mặt đứng đậm. Chưa đi bộ thử toàn bộ mặt trước bộ ba bằng avatar online, chưa nghiệm thu mọi góc ánh sáng/mobile.

Backup server: /root/anlien-backups/2026-11-03-riverfront-triad-3-20261103T081141Z. Health/release/SHA main/shared landscape/layout/stupa và9GLB bộ ba,3GLB tháp,7GLB sân đều đạt. Số liệu DB sau cập nhật: users=2, merit=[35, 2, 33, 446]; không reset dữ liệu. Log docs/riverfront-triad-deploy.log, riverfront-triad-verify.log, riverfront-triad-production-verification.json. Dùng pack-front-triad.mjs hoặc full release mới cho lần sau; full baseline cũ cần overlay đủ asset như các bản trước.

Checkpoint: authoring/checkpoints/20261103-riverfront-triad. Bản trước ghi z540/hàng nhỏ465 là lịch sử, đã được thay bằng bố trí này.

## 03/11/2026 — Bộ ba tượng vàng 100 m ở cánh trái sân (ĐÃ LÊN SERVER)

Revision `2026-11-03-front-triad-gold-1`. Dùng đúng ba ZIP chủ dự án cung cấp: Phật Thích Ca Mâu Ni, Quán Thế Âm Bồ Tát (2), Địa Tạng Vương Bồ Tát. Bố trí (x,z): Quán Âm (−240,540), Thích Ca (−150,540), Địa Tạng (−60,540). Tâm cụm phản chiếu x=150 của Phật nằm sang x=−150, giữ cùng z540; khoảng cách tâm 90 m đều hai bên. Tất cả cao 100 m gồm tòa sen có sẵn, base0, yaw0: mặt +Z ra ngoài, lưng về chánh điện. Không thêm bệ lớn. Ba tượng nhỏ cũ ở cánh trái chuyển z520→465; giữ nguyên kích thước và mẫu để không chồng lưới vào bộ ba.

Vật liệu dùng chung create24kGold trong StatueGold.ts: metallic1, roughness0.28, vàng ấm có phản xạ HDR (albedo1/.68/.14, ánh sáng bổ sung nhỏ). Màu là diễn giải hình ảnh vàng 24K cho game, không khẳng định phép đo quang học chính xác trên mọi màn hình. Bỏ màu tối của texture nguồn tại thời điểm render; giữ nguyên GLB gốc và điêu khắc. Ba mức lưới mỗi mẫu: high120k / low35k / far8k. Có LOD riêng cho các tượng khổng lồ để không giữ high trên toàn khuôn viên.

Đã kiểm: source và3LOD mỗi tượng (12 bản) đều0boundary/0nonmanifold; riêng Địa Tạng far có một khe tam giác khi giảm lưới, đã vá và audit lại. 22/22 test bộ ba/tượng cũ/vườn đạt, gồm kích thước/hướng/đối xứng/tâm đều, khoảng cách cổng/sông/Tứ Thiên Vương/tượng nhỏ và bảo toàn7tượng cũ. TypeScript và build public đạt. Browser local đã thấy3/3mẫu riêng dưới vật liệu vàng, và xem bộ ba trong khuôn viên đầy đủ: docs/front-triad-local.png và front-triad-in-courtyard-local.png. Public preview cũng đã tải và hiện3/3mẫu high với vật liệu vàng; ảnh docs/front-triad-production.png. Chưa đi bộ quanh toàn bộ chân tượng trong online; chưa nghiệm thu mọi góc LOD/thiết bị mobile. Một góc main local ghi3FPS trong lúc nhiều WebGL tab đang mở; đó không phải benchmark độc lập, không tuyên bố toàn game mượt.

Bản preview riêng: front-triad.html?q=high. Trong game: ?q=low&view=front-triad, nút “Ba tượng vàng 100 m” ở giao diện xem kiến trúc; ba mẫu có trong menu vườn tượng và hoạt động ở game online như các công trình khác. Quyền phân phối asset chủ cung cấp chưa có giấy phép độc lập kèm ZIP; không tự gán CC.

Đã triển khai bằng deploy/front-triad-overlay.tar.gz (~20,7MB), bao gồm cả các asset tower-buddha trước đó và9GLB mới. Backup /root/anlien-backups/2026-11-03-front-triad-gold-1-20261103T071448Z. Health sau deploy đạt, giữ2tài khoản và công đức[35,2,30,445]. Chỉ cập nhật anlien-server. Xem docs/front-triad-deploy.log và front-triad-production-verification.json để đối chiếu SHA. Baseline full deploy/anlien-release.tar.gz vẫn là river cũ; lần sau phải dùng pack-front-triad.mjs (kèm tower-buddha và front-triad), hoặc đóng lại full release.

Checkpoint trước sửa: authoring/checkpoints/20261103-front-triad. Nguồn bất biến, blend, ảnh và audit: authoring/front-triad; assets chuẩn hóa và hash: public/assets/sanctuary/front-triad/01..03/asset.json. Dev Vite từng dừng khi watcher đọc nhiều thư mục overlay đang ghi; vite.config.ts nay bỏ theo dõi deploy/dist-public/authoring/docs/assets-src, vẫn theo dõi src/public và cấu hình.

