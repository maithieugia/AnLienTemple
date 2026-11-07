# Bộ 10 mẫu áo dài — 02/11/2026

Trang xem: http://127.0.0.1:5199/ao-dai-collection.html?revision=ten-2 . Đây là mười phối trang phục/tóc trên cùng nữ fit-5, không phải mười gương mặt riêng. Chưa thay người chơi/NPC online.

## Bộ mẫu

01 Lam sen, 02 Ngọc lan trắng, 03 Tím Huế, 04 Đào hồng, 05 Trúc ngọc, 06 Lụa vàng, 07 Gấm đỏ, 08 Sóng đêm, 09 Cúc trà, 10 Thiên thanh. Mỗi mẫu có màu áo/quần/tóc và SVG hoa văn riêng. Sáu hình dáng tóc: búi cao, thấp, xoắn, đôi, đuôi ngựa và tết. Palette nằm trong AoDaiCollectionPlan.ts và looks.json.

## Cấu trúc, tái tạo và nguồn

Dùng chung Female_AoDai_Collection.glb với 80 xương/sáu clip của fit-5; mỗi clone có skeleton/animation/material riêng và chia sẻ geometry/texture gốc. Tách áo, quần, tóc; UV2 giữ mask chống xuyên, UV3 cho hoa văn. Chỉ bật hình tóc được chọn. Các phần tóc skin vào bộ xương gốc; chưa có mô phỏng tóc mềm.

Áo ghostnoface CC BY4.0; thân/da/búi gốc Microsoft Rocketbox MIT; chuyển động Quaternius UAL CC0. Hoa văn SVG, palette và hình strand mới do An Liên dựng bằng code. SOURCE.json/CREDITS.md/LICENSE-Microsoft.md đi kèm asset. Không mua hoặc gọi dịch vụ trả phí.

Scripts: authoring/vietnamese-wardrobe/build-collection.py và build-patterns.mjs; Blender collection.blend. Checkpoint authoring/checkpoints/20261102-ao-dai-ten. Không ghi đè bản fit-5 hoặc game online.

## Trang xem và kiểm tra

Có xem cả mười, chọn riêng, đứng/đi/chạy/chắp tay/ngồi/lạy/đẩy, cận tóc/mặt và nhìn sau. Chuyển góc xóa quán tính camera. Bộ sưu tập chạy riêng ở cổng 5199; server.mjs bổ sung MIME image/svg+xml để tải SVG đúng. Các phiên game cũ giữ nguyên. Nhật ký server: docs/ao-dai-ten-server5199.log và .err.log.

Đã kiểm XML của 11 SVG. Một kiểm tra trên dữ liệu/profile/GLB đạt: đủ 10 ID, 10 màu áo/10 SVG khác nhau, sáu kiểu tóc/tám mesh tóc, 80 xương/sáu clip, weights chuẩn hóa, UV2/UV3 và hash khớp. Log docs/ao-dai-ten-tests.log. TypeScript/Vite build đạt trước lần chỉnh camera cuối; log cuối và rà UI ghi bổ sung bên dưới.

Chưa benchmark điện thoại/thiết bị yếu; chưa rà mọi pha tóc/cổ và cả mười mẫu trong mọi động tác. Các giới hạn cloth khi gập sâu vẫn giữ. Không coi đây là mười khuôn mặt Việt mới hoặc các bộ tóc scan mới.

## Kết quả cuối

TypeScript/Vite build cuối đạt (54,72 giây), kiểm dữ liệu/GLB 1/1 đạt sau lần xuất model cuối. SHA trong SOURCE.json khớp model; asset đã đối chiếu/copy đúng dist. XML 11 SVG hợp lệ, server5199 trả image/svg+xml; online server đã hỗ trợ SVG sẵn, không sửa game online. Model master khoảng13,7MB, chỉ tải một lần.

Đã mở trang và xem đủ mười mẫu có màu/hoa văn riêng, chọn mẫu01/06, đổi góc tóc và kích hoạt tư thế chắp tay. Console phiên cuối không có error. Ảnh ao-dai-ten-overview.png ghi đủ mười mẫu; các ảnh chọn riêng có thể được người dùng đổi góc đồng thời nên không nhận là đã kiểm hết pha tóc/mọi tư thế. Chưa benchmark FPS hoặc thử trên điện thoại thật. Các bản fit-5 gốc không bị ghi đè (SHA d5dbb915d4da5123cca669fc5c6d3d7330e12ca69393c9fdb8f5757ee1cd88bf).

Đã sửa lỗi shader nhuộm cả vùng da ở đường tóc: CollectionHairTint.ts dùng độ sáng atlas để giữ da, tóc rời nhuộm toàn phần. Phần búi gốc dùng nhiều material đã được tách đầy đủ hơn; không để một búi nâu nguyên gốc xuất hiện trên mọi kiểu tóc. Chưa coi đây là tóc vật lý mềm hoặc chất lượng scan. Khi đưa vào game cần giữ AoDaiCloth, CollectionHairTint và các UV/texture/profile liên quan.

## 2026-11-02 — Sửa mảng đầu phía sau trong bộ 10 áo dài

Nguyên nhân: tách búi tóc gốc đã xóa cả mặt da đầu tích hợp. Đã bổ sung vỏ da đầu cong liên tục (1.537 mặt), gán trọng số Head, vật liệu riêng theo màu tóc; giữ bản fit-5 gốc. Checkpoint: authoring/checkpoints/20261102-collection-head-repair.

Đã kiểm chứng: xuất GLB thành công; build TypeScript/Vite đạt; test bộ sưu tập 1/1 đạt, bao gồm vật liệu/vỏ đầu, 80 xương, 6 clip, trọng số và SHA256. Trình duyệt 5199 đã kiểm tra góc sau mẫu 06 tóc tết và 05 đuôi ngựa, không còn mảng trống lớn, không có console error. Ảnh: docs/ao-dai-head-repair-back.png.

Chưa kiểm chứng: mọi tư thế của đủ 10 mẫu, thiết bị di động và game online. Còn lại: làm mượt tiếp giáp tóc gốc/vỏ mới và chất liệu sợi tóc; hiện vẫn thấy gồ/cạnh ở cận cảnh. Đây là sửa lỗ hổng hình học, chưa phải hoàn thiện chất lượng tóc. Link: http://127.0.0.1:5199/ao-dai-collection.html?look=06&revision=head-repair-1

## 2026-11-02 — Chân tóc ôm sát da đầu (hair-contact-2)

Đã sao lưu tại authoring/checkpoints/20261102-hair-contact. Sửa build-collection.py: đưa viền scalp còn lại về cùng mặt cong với vỏ đầu mới, bỏ viền búi tóc nhô cao; giảm khoảng lùi dây buộc 20 mm; thu gốc bím/đuôi ngựa và đưa gốc vào lớp tóc nền. Xuất lại GLB/collection.blend, cập nhật SHA và đồng bộ dist của server 5199. Không thay code runtime nên không build lại bundle ở lượt này.

Kiểm chứng: test ao-dai-collection 1/1 đạt (80 xương, 6 clip, trọng số, vật liệu cap và hash). Xem thực tế mẫu 06 phía sau và nghiêng, mẫu 05 phía sau: hết khe hở lớn giữa tóc và đầu; console không lỗi. Ảnh docs/ao-dai-hair-contact-back.png. Chưa rà đủ mọi animation/mọi góc của cả 10 mẫu; tóc còn đơn giản, đường chân tóc và búi nối vẫn cần tinh chỉnh mỹ thuật. Chưa đưa bộ mẫu vào game online.

http://127.0.0.1:5199/ao-dai-collection.html?look=06&revision=hair-contact-2

## 2026-11-02 — Khôi phục tóc gốc theo yêu cầu anh

Quyết định hiện hành thay cho các lượt sửa tóc trước: cả 10 mẫu giữ nguyên tóc, da đầu và vật liệu từ fitted-preview.blend (fit-5). Không tách búi, không vỏ vá, không tóc dựng thêm, không đổi màu tóc. Chỉ thay áo/hoa văn và quần. Checkpoint: authoring/checkpoints/20261102-original-hair.

Đã xuất lại collection.blend/GLB, cập nhật manifest, build TypeScript/Vite thành công và test collection 1/1 đạt (80 xương, 6 clips, trọng số, SHA; xác nhận không có cap/hair mesh thay thế). Đã xem trực tiếp gáy mẫu 06 trong trình duyệt, ảnh docs/ao-dai-original-hair.png. Chưa rà toàn bộ hoạt ảnh trên cả 10 mẫu; chưa thay người trong game online. UI còn ô màu tóc lịch sử nhưng không áp dụng màu này; tất cả thực tế dùng màu tóc gốc.

http://127.0.0.1:5199/ao-dai-collection.html?look=06&revision=original-hair-final
