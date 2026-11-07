# Nghi lễ 20 sư thầy — 31/10/2026

## Đã triển khai

Mẫu **Monk / creator424** người dùng chọn, CC BY4.0, áo trong vàng và cà sa đỏ kẻ vàng. Giữ nguyên GLB gốc và file ghi công; không mua hoặc upload tài nguyên. Tạo rig runtime mới trực tiếp trên các bề mặt thật của GLB, không thay bằng nhân vật ghép khối.

- `CeremonyMonks.ts`: một thư viện mesh/texture dùng chung, 20 skeleton riêng, 20 bone/actor (hips/chest/head/skirt, hai tay/chân và xương điều khiển tay áo). Trọng số tối đa 4 ảnh hưởng/đỉnh. Hình học gốc 33.692 tris/actor; bề mặt da chân dưới y=.88 bỏ khỏi rig nghi lễ vì bị áo che, giảm xuyên ở tư thế ngồi; quần/giày ẩn khi ngồi/lạy. Bản xem nguồn Monk ban đầu không bị thay đổi.
- Dáng ngồi thiền trên đệm, tay trên lòng; quỳ chắp tay và cúi lạy theo chu kỳ 14s; dâng nhang nâng/hạ theo chu kỳ 24s, ba cây nhang có đầu đỏ và khói alpha; gõ mõ mỗi1,6s với dùi/mõ/đệm riêng; bước hành lễ trên tuyến khép kín quanh hai bên đạo tràng.
- Áo ngoài gom lại để ngồi, tay áo dùng khung giữ độ rủ, giảm kéo ngang/xuyên. Chuyển chế độ trong viewer blend .75s. Đây là rig procedural/cage có chỉnh riêng, chưa phải rig nghệ sĩ và cloth simulation.
- `CeremonyPlan.ts`: đúng20 vị:8thiền,6lạy,2nhang,2mõ,2hành lễ. Tọa độ x≈±3…±14,z≈-108…-89, cao nền1.205m. Quay về Phật chính phía z=-162, chừa lối giữa. Tuyến hành lễ tránh nhóm ngồi và bệ tượng.
- Tự tải khi người chơi/camera đến gần chánh đàn (220m); ẩn/cắt cập nhật actor quá180m. Không phải chọn chế độ để có nghi lễ trong thế giới.
- Main có nút **20 sư thầy làm lễ**, query `?q=low&view=ceremony`. Nối tiếng mõ `chua_mo.mp3` đã có vào nhịp gõ; chỉ phát sau Bật âm thanh, âm lượng giảm theo khoảng cách, dừng phát ở ngoài35m. Nhạc/kinh hiện hữu giữ nguyên. Đây là âm thanh có sẵn của dự án, không phải bản thu mới hay chứng nhận âm thanh thực.
- `ceremony.html`: viewer kiểm riêng5động tác và nhóm20; dùng cùng actor/plan của main. Không can thiệp save/công đức hay online.

## Kiểm chứng

-45/45test đạt (`docs/ceremony-tests.log`), gồm2test mới xác nhận đủ20ID/5vai trò, khoảng cách nhóm ngồi, lối giữa, tuyến hành lễ hữu hạn/ngoài nhóm ngồi/bệ tượng.
-TypeScript + Vite build đạt (`docs/ceremony-build.log`), build với `--emptyOutDir false` do lỗi dọn thư mục dist/assets trên Windows đã gặp trước đó.
-Đã xem mesh thật trong WebGL: thiền, cúi xuống/đứng lên lạy, dâng nhang, mõ và bước đi; kiểm20 vị trong viewer và chánh điện thật, phía trước bệ Phật. Console không có error trong phiên kiểm.
-Ảnh `docs/ceremony-meditate.png`, `ceremony-incense.png`; ảnh chánh điện cuối được lưu riêng. Chỉ là kiểm trực quan trong IAB trên máy này; chưa phải duyệt mỹ thuật.
-Viewer riêng từng ghi khoảng64–95FPS, nhóm20 khoảng47–52FPS; chánh điện lúc tải nhiều tài nguyên chỉ8–12FPS, còn biến động mạnh khi đồng thời nhiều tab WebGL/build. Không coi đây là benchmark hoặc đã đạt60FPS trong cảnh chùa hoàn chỉnh.

## Còn lại / giới hạn

Ngón tay vẫn dùng hình bàn tay mở từ nguồn, chưa rig riêng từng đốt để nắm kín dùi hoặc nhang. Tư thế thiền giấu chân trong áo, chưa nhìn rõ bàn chân kiết già. Vạt/tay áo còn có thể co, gập hoặc giao nhau ở góc sát, chưa có tự va chạm vải. Chu kỳ nhang: đưa đầu nhang nghiêng tới ngọn nến, đầu nhang sáng/khói sau giai đoạn châm rồi nâng/hạ; chưa có thao tác cắm nhang vào lư. Không gọi5động tác là bộ motion capture hoàn thiện. Cần fine tune bàn tay/cloth trước cinematic cận cảnh; giữ thư viện nguồn/rig này để tiếp tục.

Chưa kiểm chủ quan chất lượng nghe tiếng mõ/kinh, chưa benchmark GPU/mobile nhiều thiết bị, chưa xuất GLB chứa rig/animation. Rig đang chạy bằng code, không có sẵn clip trong GLB. Chưa triển khai lên website công khai hay EXE cài sẵn. Bộ10sư sân chùa cũ và các người hành hương online giữ nguyên.

Checkpoint trước thay main/viewer/config: `authoring/checkpoints/20261031-ceremony`.

Bản release cuối `revision=ceremony-2`: build23,66s; đã bật âm thanh qua UI (hiện Tắt âm thanh), không xác nhận nghe chủ quan. Main tải đủ tài nguyên, giữ công đức17;≈9–16FPS trong phiên kiểm thực, vẫn cần tối ưu cảnh chùa. Có nút Đến đạo tràng (đi bộ tại lối giữa,nền1,2m); góc nhìn rộng36m để không cắt nhóm ở cửa sổ hẹp. Server5196 giữ chạy, dev5197 đã tắt.
Release cuối ceremony-3 có châm nhang vào nến thật theo vị trí đầu nhang trong hoạt cảnh; đã xem trên WebGL, sau đó nâng nhang. Nguồn động tác/rig/props tiếp tục nằm trong CeremonyMonks.ts, không nhúng hoạt cảnh vào GLB. Cập nhật ảnh ceremony-incense.png. Không mua/tải thêm tài nguyên mới.

## Cổ tay/cánh tay liên tục — bản sửa sau phản hồi
Xem IMPLEMENTATION_STATUS.md mục Sửa cổ tay rời. ConnectedArms.ts lấy hai vòng biên20đỉnh thật từ source, nối cánh tay/bo khuỷu và tay áo trong; mép cuối đi theo cùng ma trận hand của bề mặt gốc. Không dùng vị trí cổ tay đoán. Bộ giải tầm với giữ nguyên chiều dài hai đoạn, điều chỉnh thiền/mõ và điểm bám dụng cụ sau blend. Chuẩn hóa theo tâm thân. Có Cận tay trong ceremony.html.48test gồm3test mới đạt, logs connected-arms-{build,tests}.log. Áp dụng toàn20vị qua CeremonyLibrary. Phần ngón tay/va chạm vải vẫn cần làm tiếp, không tuyên bố hoàn thiện vật lý cơ/vải.

Kiểm cuối đường nối:49test đạt gồm kiểm cả skinGPU xa và bề mặt chi tiết gần, đều giữ mép cổ tay<1e-6m. LOD6m/caching/tối ưu vòng lặp, decomposeSLERP tránh xẹp hình khi chuyển tư thế; điểm cực khuỷu và xoay cổ tay lạy được làm mượt. Main query revision=connected-arms-4. Vẫn cần tối ưu toàn cảnh chùa/kiểm GPU/mobile; không dùng sốtest để tuyên bố mỹ thuật hoặc mô phỏng vật lý hoàn thiện.

## Bố cục mới 01/11/2026
Bản20vị ở trên là lịch sử. Hiện có100lạy (10hàng×10,2m²/người, lối giữa4m),10đi (5mỗi bên,2m cách nhau) và12nghi thức giữ lại. Xem IMPLEMENTATION_STATUS.md mục mới nhất.54test đạt, build đạt; đã thấy trong viewer vàmain. Hiệu năng chưa đạt: viewer5–11FPS/main≈1FPS ở IAB, cần crowdLOD/pose sharing/giảm draw calls. Không tăng sốngười thêm trước tối ưu. Nguồn và giới hạn rig/ngón/vải ở trên vẫn áp dụng.

Chỉnh mới nhất: khoảng cách nhóm lạy đã tăng2m ngang/dọc, bằng nhóm ngồi đệm; mỗi ô4m² thay2m² lịch sử. Giữ100vị và hai đoàn5vị. Chi tiết/kiểm tra trong IMPLEMENTATION_STATUS.md mục Giãn hàng lạy. Bản assembly-2.

Assembly-3: nay10vị đi mỗi bên,20đi/tổng132vị, giữ khoảng cách2m. Bản122vị ở trên là lịch sử.
