## 04/11/2026 — Tượng 80 m, mái 100 m, tháp 18 tầng / 180 m (ĐÃ LÊN SERVER)

Revision `2026-11-04-compact-sharp-1`. Checkpoint: `authoring/checkpoints/20261104-compact-temple`.

**Kích thước:** Tượng chính (gồm hào quang và đài sen) cao 80 m, chân bệ ở 5,8 m, đỉnh ở 85,8 m. Bệ thu nửa cạnh từ 53 xuống 27 m; bàn thờ, điểm nhang và va chạm lấy theo plan. Chánh điện giữ diện tích 600 × 400 m, thông tầng và 5 lớp mái. Hai tầng cao 30 m, sàn trên 31,65 m, mép mái 61,3 m, đỉnh cao nhất 100 m. Trần vòm cuối 92,8 m. Đổi hình học mái/cột khi tải, tính lại normals; không sửa GLB nguồn. Tượng thượng điện, hàng phù điêu và collision tường đồng bộ chiều cao mới (6 hàng mỗi tầng thay 10).

**Tháp:** 18 tầng, sàn cách nhau 10 m, sàn cuối 170 m, đỉnh 180 m. Có 1.632 bậc, 3 lớp mái đỉnh, chặn cuối thang, thang máy 1–18. Giữ 8 tượng mỗi tầng, tổng 144; danh sách 288 tên gốc vẫn lưu để tái dùng. Các điểm tham quan và đường NPC dùng số tầng mới. Giữ 200 cư dân nam/nữ do Claude vừa chỉnh.

**Độ nét và tải dựng:** Bỏ cơ chế hạ độ phân giải tới 2,2 lần mỗi 0,7 giây. Giới hạn cạnh dài 2.304 px (Cao), 1.600 px (Nhẹ); DPR tối đa 1,5 / 1,25. Desktop 1.920 px ở mức Cao giữ ít nhất một pixel trên mỗi pixel CSS. Chỉ đổi sau 3 giây, bước 4%, có vùng FPS ổn định và mức giảm tối đa 12% / 25%; bỏ thời gian tải dài và tab ẩn khỏi phép đo. Tăng anisotropy tối đa 8 theo GPU; tắt preserveDrawingBuffer ở cảnh chính. Giảm số tầng, tượng và hàng phù điêu giúp giảm tải. Chưa có số đo trước/sau đủ điều kiện để cam kết FPS.

**Đã kiểm:** TypeScript và public build đạt. 32 kiểm tra kiến trúc/tháp/visitors/tượng/scale đạt; 14 kiểm tra hall/relief/scale đạt; 9 kiểm tra online-server đạt. Browser local đo mái 100,00 m, xem tượng không cắt hào quang; đi đủ 1.632 bậc lên tầng 18 và đi thang máy xuống tầng 1 về 0 m. Browser HTTPS xác nhận tháp 18 tầng, 180 m và 144 tượng, không có console error. Ảnh: `docs/compact-hall-buddha.png`, `compact-stupa18.png`, `compact-stupa18-production.png`. Cảnh tháp Low có 435.288 tam giác kiến trúc / 11 mesh, chưa cộng tượng và NPC.

**Chưa kiểm / còn lại:** Chưa chơi lại toàn cảnh online sau deploy, chưa benchmark cùng camera và thiết bị trước/sau, chưa đo điện thoại. Fullscene localhost tải và bake tài nguyên chậm khi nhiều tab 3D cùng chạy; không dùng FPS trong ảnh preview làm cam kết hiệu năng. Cần profiling tiếp phần khởi tạo crowd, mái và tường trên thiết bị thật nếu còn lag. `compact-hall.html` / `src/compact-hall-preview.ts` là QA riêng ở local, không phải cảnh gameplay đầy đủ và không thêm vào public build.

**Deploy:** Overlay trên bản đang chạy, giữ tài nguyên Meshopt/WebP, cache và SW; manifest sinh từ file thật trên server. Script `deploy/update-compact-temple.sh` sao lưu app, web, SQLite rồi cập nhật runtime plans và khởi động lại riêng anlien-server. Health đạt; 5 tài khoản và công đức [40,5,36,448] trước/sau không đổi. Backup: `/root/anlien-backups/2026-11-04-compact-sharp-1-20261104T141443Z`. Log: `docs/compact-sharp-deploy.log`. Không mua tài nguyên hoặc gọi API.

Game: https://dichua.palo.io.vn/?q=high&revision=2026-11-04-compact-sharp-1

