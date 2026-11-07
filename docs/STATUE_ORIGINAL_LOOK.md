# Hoàn trả vật liệu và bố trí lễ tượng

## 03/11/2026 — Vật liệu gốc, tượng10m, bộ ba50m, tháp màu và nơi hành lễ (ĐÃ LÊN SERVER)

Revision `2026-11-03-original-statues-1`. Checkpoint trước sửa: `authoring/checkpoints/20261103-original-statues`. Bỏ override triadGold cho toàn bộ20tượng owner-collection20: giữ PBR/material/texture được nhập từ file ở cả3LOD, kể cả viewer owner-collection.html. Bộ20tượng đều cao10m theo hàng6tượng (bao gồm tượng nghìn tay trước đây100m, khất thực20m và Di Lặc cổng7m). Bốn Thiên Vương50m, Phật nằm20m, tượng tháp5m và Phật chính160m không đổi.

Sáu vị thiên về hai hành lang có sẵn, x±358, z278,46/359,69/440,92; cao10m, chân bệ0,92m. Hành lang nâng eave14,5/ridge18m, có sàn walkable0,12m và bệ vừa footprint; bỏ các bệ tượng cũ trống gây lộn xộn. Hai tượng riêng x300,z380 và x380,z160 giữ mốc vị trí, có đình nhỏ bốn mặt thoáng, mái ngói/cột tròn/sàn0,12m. Các tượng Bồ Tát trong điện cao10m, bệ tự nới theo footprint như trước. generate-layout.py đã cập nhật quy cách mới, placements.json cùng dữ liệu.

Bộ ba phía trước cao50m; tâm Thích Ca(-150,568), hai bên x≈-181,75978/-118,51755, giữ khoảng mép3m. Vẫn chất liệu vàng24k theo yêu cầu riêng trước đó, điều chỉnh roughness/metallic/emission/fill để giảm sẫm. Tượng vườn không nhận shadow map ở cả3LOD, tránh chuyển màu/bầm khi nâng mức đồ họa; vẫn giữ hình học/normal và bóng trên cảnh nền. Không áp màu/emissive mới lên vật liệu bộ20tượng gốc. Nhãn và camera xem bộ ba đã đổi50m.

Tháp: mái #ef852b cam, tường #efd068 vàng, mặt dưới mái #9c2923 đỏ, alpha1/two-sided và không lấy texture xám làm bẩn màu. Mỗi tầng vươn mái thêm3m, hai mái đỉnh cũng rộng hơn. Giữ36tầng/500m, thang/lan can/thang máy và sàn chặn tầng36.

Phật tử: đủ27tượng ngoài sân đều có ít nhất2điểm hành lễ ban đầu (trong80người khu tượng), kèm54đệm vàng. Bổ sung bộ ba và Phật dưới bồ đề vào danh sách, tránh bàn hương/bệ/cột và xử lý riêng vị trí trước Phật nằm. Sau đó đổi người/hoạt động; người cuối của điểm lễ chờ có người khác mới rời. Chu kỳ3lạy→quỳ nghỉ→chắp tay, lệch pha cá nhân; thêm kneel cho LOD xa. TempleLife500 bật update sớm khi renderer đang tải lần lượt các bộ trang phục, thay vì giấu cả500đến khi xong toàn bộ. Không reset nhân vật người chơi, đồ áo dài/UI mobile/APK hoặc hệ nén/cache Claude vừa thêm.

Đã kiểm:37/37test hồi quy tượng/kiến trúc/tháp;4/4test mới (đủ20cao10m/bộba50m,27điểm có2người/54đệm, renderer thật giữ đúng object material+texture cả3LOD bằng NullEngine, không chạm bệ/tượng/cột/bàn hương);4/4test chọn lọc mô phỏng500người/đường đi/cây đạt. TypeScript và public build đạt. Kiểm renderer là test dữ liệu/vật liệu với NullEngine, không phải ảnh render GPU. CUA vẫn timeout, chưa nhìn/chơi trực tiếp được; chưa xác nhận thẩm mỹ màu cuối trên GPU, toàn bộ500người xuất hiện trong game thật, FPS/mobile hay chu kỳ nhiều giờ. Không tuyên bố hết lag/hoàn toàn giống thật.

Server: health200, main `main-Cyqgy5kP.js`, SHA256 `b48e3cb249a2acb003e588b8cf6f9d2222407fa71ec857e2378346334e1d2ec0`. Model60LOD mới +9bộba +3tháp +7far sân và các chunk liên quan khớp dist-public nén. Manifest `c59899927b25`,621file,0mismatch. Giữ3tài khoản và công đức[35,2,33,446]. Backup `/root/anlien-backups/2026-11-03-original-statues-1-20261103T135333Z`. Gói overlay nén57,32MB, script pack-original-statues.mjs dùng dist-public, kèm SW/manifest/decoder và kiểm hash manifest. Full baseline nén đã có thay đổi Claude; không ghi đè bằng GLB thô public/. Nguồn ZIP và vật liệu gốc không sửa.

Log/chi tiết: `docs/statue-original-*.log/json`, `docs/STATUE_ORIGINAL_LOOK.md`. Tiếp theo cần chơi thật q=low/high, nhìn bản gốc/triad trong ánh sáng cao, kiểm hành lang/sàn/đệm và theo NPC. Trước khi nghiệm thu hình ảnh phải kiểm trong trình duyệt; không dùng test headless thay cho kết luận mỹ thuật.

