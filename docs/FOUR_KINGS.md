# Bốn tượng Thiên Vương — 02/11/2026

Nguồn: bốn ZIP anh cung cấp trong Downloads; giữ nguyên ZIP, trích base_basic_pbr.glb về authoring/four-kings/incoming. Không chạy nội dung trong ZIP. sources.json ghi tên file và SHA256. ZIP không kèm giấy phép/tác giả; không tự gán giấy phép. Không mua/tải tài nguyên ngoài.

Đặt trong StatueGarden: x ±300, z 265/495, tâm sân (0,380). Tượng cao 50 m từ chân model tới đỉnh hào quang; bệ thêm 3 m, toàn bộ cao 53 m. Yaw = atan2(-x,380-z), mặt +Z của GLB nhìn chính xác vào tâm sân. Bệ đá ba cấp 40m, viền son/vàng, có collision và bảng tên hướng vào sân. Vùng tượng được dành riêng để cây/ghế không mọc vào. Tượng dùng tên mẫu theo file nguồn, chưa tự xác nhận danh hiệu Đông/Tây/Nam/Bắc của từng hình tượng.

Bốn nguồn đều 500000 triangles. Giữ PBR gốc, không sửa/sculpt. Blender chuẩn hóa cao 1m, xuất high120k/low35k/far8k với texture 2048/1024/512; runtime scale50. Mặt trước đã xem render Blender cả bốn: đàn, kiếm, tháp, rồng. Nguồn/file Blender/scripts: authoring/four-kings. Runtime public/assets/sanctuary/four-kings/01..04, manifest mỗi mẫu có hash và kích thước.

Đã kiểm: TypeScript noEmit đạt; 13/13 tests four-kings + statue-garden đạt. Browser trang four-kings.html báo 4/4 và đã thấy mô hình; ảnh docs/four-kings-preview.png. Build public đạt, assets đã copy dist-public và local5200/release.json trả four-kings-1. Chưa chơi thử đầy đủ collision/LOD trong toàn cảnh chùa, chưa đo FPS GPU/điện thoại. Chưa deploy server công khai.

Trang xem gọn đã mở: http://127.0.0.1:5202/four-kings.html . Nếu server local đã tắt, chạy XEM-TU-THIEN-VUONG.cmd để bật lại. Game local: http://127.0.0.1:5200/?q=low&view=four-kings . Dev không cần đăng nhập: http://127.0.0.1:5202/?q=low&view=four-kings . Các mục Tứ Thiên Vương có trong menu vườn tượng.

Giữ dừng công việc cũ: bản 500 phật tử chưa QA được giữ ở TempleLife500.ts và crowd500.html; gameplay hiện hành dùng lại TempleLife 10 người từ checkpoint. Không tự đưa bản 500 đang thử vào bản bốn tượng. Không làm tiếp điêu khắc thử.

## Sửa thủng lưới — 03/11/2026, closed-2
Nguyên nhân đã xác minh: nguồn 500k của cả4 tượng kín, nhưng glTF có các đỉnh trùng tại đường nối UV/normal. Decimate trên lưới chưa hàn làm rơi nhiều mảnh; high cũ có khoảng9nghìn nhóm cạnh hở/mẫu. Không phải do vật liệu trong suốt (source/export đều opaque, doubleSided). Đây là lỗi pipeline chuẩn bị tài nguyên.

Đã bỏ cache GLB/.blend đã giảm lưới, nhập lại nguồn, hàn đỉnh trùng 1e-7 sau chuẩn hóa (giữ UV theo góc mặt), tính lại normal rồi mới decimate. Không remesh lấp kín các khoảng trống hợp lệ quanh dải lụa/hào quang. Audit Blender đã kiểm cả4 nguồn +12 LOD: boundaryLoops0 và nonmanifold0 tất cả. authoring/four-kings/hole-audit.json kèm SHA256 đúng từng file; checkpoint trước sửa authoring/checkpoints/20261103-kings-holes có tài nguyên và audit lỗi cũ.

14/14 tests đạt, có kiểm hash của từng file tương ứng audit lưới kín; TypeScript/build đạt. Đã xem browser4/4 tải, cận mặt trước của các mẫu và sau mẫu4, ảnh docs/four-kings-closed-front.png/back.png cùng các ảnh mẫu. Build/asset local5200 và preview5202 cập nhật. Cache key closed-2 tránh dùng GLB cũ. Revision2026-11-03-four-kings-closed-2. Không deploy public; chưa rà mọi góc/từng LOD bằng mắt, không đo FPS/mobile ở lượt sửa này.

## Public đã cập nhật
Đã deploy2026-11-03-four-kings-closed-2 thành công; HTTPS health/release/trangchính và4hash far GLB đã xác nhận. Tài khoản/côngđức nguyên vẹn. Backup và log chi tiết cuối IMPLEMENTATION_STATUS.md. Link: https://dichua.palo.io.vn/?q=low&view=four-kings&revision=2026-11-03-four-kings-closed-2 . Chưa kiểm chơi thực tế toàn cảnhpublic/FPS/mobile saudeploy.
