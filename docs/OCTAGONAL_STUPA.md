
## 03/11/2026 — Tháp 36 tầng / 500m, thang máy và chống rơi (ĐÃ LÊN SERVER)
Revision: `2026-11-03-stupa36-lift-2`. Tháp hông Đông (480,20): 36 sàn y=0..455m, cao độ đỉnh 500m; bán kính sàn thu 50→18m. 3.360 bậc / 96 bậc mỗi vòng, có số trên từng bậc bằng atlas dùng chung. Mỗi tầng có chiếu nghỉ vào sàn; bảng TẦNG gắn trên vách cạnh cửa, bỏ khung cổng/post đứng riêng. Lan can hai thanh và trụ quanh lỗ thang; lan can trong/ngoài xoắn có va chạm analytic; chặn ngang đầu cuối tầng 36, vẫn mở nhánh đi xuống. Lan can đá quanh chân tháp, chừa lối Tây. Sửa normal tube/mặt bậc, tăng sáng vật liệu đá và mặt dưới mái, không nhận bóng đổ trên các mặt này để hạn chế mảng đen.
Lõi giữa đổi thành cabin thang máy kính/đồng: đến chiếu nghỉ gần lõi thấy nút “Thang máy · chọn tầng”, chọn 1–36; đóng cửa, chuyển cao độ êm, mở cửa rồi ra chiếu nghỉ. Cùng một instance dùng bởi điều khiển offline/online và preview. Khi đang đi thang máy khóa di chuyển tay, hủy tự chạy/tư thế ngồi; online cho phép y đến 520m. Không thay dữ liệu cư dân, tượng chủ sở hữu, sông/cầu hoặc công đức.
Kiểm chứng: TypeScript đạt; build public đạt. 26/26 test tháp/sông/tượng đạt, gồm hỗ trợ đủ 3360 vị trí bậc lên/xuống, đường vào từng tầng, chặn hai phía/lỗ sàn/chân tháp/đầu cuối, thang máy mọi tầng hai chiều và các pha cửa. Browser local thử thang máy 1→36 (chân455m) và 36→1 (0m); chạy QA từng bậc xác nhận đến3360/3360 tầng36 cao455m. Preview low ~862.200 tam giác/10 mesh batched (chưa tính mesh cabin), quan sát sau warmup37–58FPS ở một số góc; KHÔNG đại diện FPS toàn cảnh 500NPC hoặc điện thoại. Có ảnh docs/stupa36-lift-floor36.png. Bản QA từng bậc đã siết kiểm cao độ dự kiến để không báo đạt khi chỉ tăng biến đếm.
Triển khai: overlay `deploy/stupa36-lift-overlay.tar.gz` chồng lên baseline full river (KHÔNG chạy baseline một mình). Backup server `/root/anlien-backups/2026-11-03-stupa36-lift-2-20261103T033213Z`. Chỉ restart anlien-server. Health/release, SHA main+shared Stupa chunk và 7farGLB đạt; users2 và tổng công đức[35,2,30,445] giữ nguyên. Log docs/stupa36-lift-deploy.log và stupa36-lift-production-verification.json. Main assets/main-OrUsgfpt.js SHA ce07ea9074bca56f6be012df8a0518eb3feefdbe715dda7d24e72e0fa9ed9184.
Chưa kiểm chứng / còn lại: chơi dài bằng avatar trong bản online đầy đủ, mọi góc cận cảnh/thiết bị mobile và tải nhiều người. Cabin hiện mô phỏng riêng phía client; vị trí người chơi được gửi qua snapshot sẵn có, chưa có cabin/hàng đợi dùng chung đồng bộ giữa nhiều client. Chưa nghiệm thu hết các mặt tối/răng cưa ở mọi góc; không tuyên bố đã xóa hoàn toàn mọi artefact đồ họa. Chưa thử người dùng cố ý dịch chuyển ngoài controller. Checkpoint trước sửa: authoring/checkpoints/20261103-stupa36-500m và 20261103-stupa-lift-top-guard.

## Vịtrí hiện hành
Tháp đã chuyển sang hôngĐông(480,20), có cổng/lối nối. Tọađộ(0,−305) bên dưới là lịch sử. Chi tiết kiểmchứng mới nhất: EAST_TOWER_MONKS.md.

## Sửa dáng tháp thu tầng — 31/10/2026
Thay thiết kế thân thẳng: bán kính sàn giảm đều từ50m ở tầng1 xuống18m ở tầng18 (đường kính100→36m). Mái giảm theo từng tầng, R56→22.5m; đỉnh ba mái R22.5/16.5/10.5m. Vòng cột, tường, khẩu độ cửa, số con tiện và collider cùng co theo tầng. Sàn đứng được tính riêng từng cao độ, không còn sàn vô hình rộng100m trên tầng cao. Ban công tầng18 chuyển vềx15m để nằm trên sàn mới. Giữ1088bậc/180m thân/206m chóp. Checkpoint authoring/checkpoints/20261031-tapered-stupa.
Đã xem WebGL toàn cảnh bản thu tầng (docs/stupa-tapered-v2.png), mẫuLow547064tam giác/8mesh; nút ban công xác nhận đứng trên sàn170m sau khi thu tầng.38test đạt (stupa-taper-tests.log), gồm kiểm co liên tục của18sàn/mái và mép hỗ trợ trên tầng cao; build ở stupa-taper-build-final.log. Chưa kiểm toàn bộ đường leo bằng tay/online/thiết bị di động. Những kích thước thân bằng nhau bên dưới là lịch sử của bản đầu.

# Tháp bát giác 18 tầng — 31/10/2026

## Phạm vi
Dựng thêm trong **projects/AnLienTemple**, giữ vườn tượng/online và save công đức hiện có. Không thay game Veilbound gốc hay trang qa-pagoda 40×60 m lịch sử ở cổng5190. Checkpoint các tệp đã sửa: authoring/checkpoints/20261031-octagonal-tower.

## Kích thước / bố cục
- Tâm (0, −305)m, phía sau chánh điện; trong khuôn viên, nối được lối vườn sau. Không nằm ở phía đông như phương án ban đầu.
- Bát giác đều, đường kính qua hai đỉnh đối diện 100m; chiều rộng qua hai cạnh đối diện ≈92.388m. Giữ kích thước sàn bằng nhau suốt18tầng.
- 18tầng ×10m =180m thân công trình; sàn tại0,10,…170m. 10m là cao độ tầng–tầng, không phải thông thủy sau khi trừ kết cấu.
- Mỗi tầng trung gian có mái cam vàng bo cong/vuốt góc, viền vàng, lớp dưới và đường ngói hình học. Ở đỉnh là3lớp mái riêng tại178/187/194m; khối đỡ bát giác liên tục; chóp cao206m.
- Mái vươn R58m, lớn hơn sànR50m. Cột son, chân đá, hệ kèo,8gian tường kem có cửa rộng7m, hành lang/lan can đá quanh tầng cao.
- Thang xoắn trung tâm bán kính4–8m, 64bậc/vòng/10m.1088bậc đến tầng18, mỗi bậc15.625cm, tay vịn hai bên. Sàn cao chừa lỗ thang; hỗ trợ đi lên/xuống cùng mô hình cao độ, không dịch chuyển từng tầng.

## Chạy / xem
`npm run build` rồi `node server.mjs` trong dự án. Cổng5196.
- `/stupa.html?q=low`: mẫu riêng, có toàn cảnh / cận3mái / đi lên / ban công tầng18. Kéo chuột xoay, cuộnzoom; đi bộWASD/Shift.
- `/?q=low&view=stupa`: tháp cùng toàn khuôn viên chùa.
- `/?view=stupa-walk` và `/?view=stupa-top`: kiểm thang/ban công.
Mã: src/game/world/Stupa.ts (meshbatch), StupaPlan.ts (kích thước/support), main.ts và online/OnlineGame.ts (tích hợp). Hình học/vật liệu procedural của dự án; không tải hay mua tài nguyên mới, không tạo tượng linh thiêng bằng khối.

## Kiểm chứng
Build TypeScript/Vite và test phải đọc kèm log stupa-build-final.log / stupa-tests.log ở workspace. 37test đều đạt (stupa-tests-final.log), gồm3test mới kiểm kích thước,1088bậc lên/xuống, lỗthang/biênbátgiác. Đã mở WebGL tháp trong toàn khuôn viên, thấy mô hình/mái/lan can và giữ côngđức17 trên profile kiểm thử. Mẫu riêng low hiển thị579704tam giác/8mesh; đã điều khiển qua các bậc đầu lên cao chân0.63m; nút ban công tầng18 xác nhận cao chân170m trong UI. FPS quan sát dao động lớn, chưa là benchmark.

## Giới hạn / tiếp tục
Chưa benchmark GPU hoặc kiểm thiết bị di động, chưa chơi thủ công trọn1088bậc, chưa kiểm phiên nhiều người leo tháp. Toàn khuôn viên trên trình duyệt kiểm thử có góc chỉ3FPS, không tuyên bố tối ưu. Mesh tháp có2mức chi tiết lúc tải trang, chưa có LOD động theo khoảng cách. Lan can ngoài/cột/tường có collider; tay vịn thang hiện là hình học, chưa có collider riêng. Chưa thêm nhiệm vụ/âm thanh/điểm côngđức cho tháp. Không triển khai lên website công khai hay đóng EXE lần này.
