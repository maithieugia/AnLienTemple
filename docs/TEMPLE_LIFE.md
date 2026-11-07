# Sinh hoạt phật tử trong chùa — 02/11/2026

Revision: `2026-11-02-temple-life-1`.
Checkpoint trước sửa: `authoring/checkpoints/20261102-temple-residents/`.

## Thay đổi

- Cảnh chính dùng bộ 10 áo dài đã chốt, nguyên tóc/đầu gốc. Chia sẻ một GLB và texture nguồn; hoa văn áo và màu quần riêng.
- TempleLife có đồng hồ, đích đến và hàng đợi tìm đường riêng cho từng người. Chỉ đi bộ 1,35 m/s; tại mỗi hoạt động ở lại 300–600 giây. Có ngồi trong chánh điện, thiền, lễ ngoài sân, đi dạo hiên và đẩy kinh luân; sau đó đổi khu vực. Hai người dạo hiên đi ngay từ đầu. Không dịch chuyển xuyên vật cản khi tìm đường lỗi: chờ rồi chọn lại.
- Grid A* giới hạn công việc, kiểm va chạm và cao độ trên đường; chỉ một lần tìm đường mỗi frame. Cư dân ngoài tầm 230m ẩn hình nhưng lịch/vị trí vẫn cập nhật.
- Kinh luân có chuyển động trang trí từ NPC, tách khỏi bộ đếm vòng/công đức và giao thức người chơi.
- Cảnh chính không khởi tạo LayAssembly 1.500 người nữa. Giữ 1.500 đệm vàng + 15 đệm lễ bằng thin instances; 132 sư và tính năng hiện hữu vẫn giữ. Viewer lay-assembly.html lịch sử vẫn là công cụ QA cũ.
- Online: click/tap đệm vàng để chọn, vòng sáng chỉ vị trí. Đến trong 3m, bấm Ngồi nghe pháp để ngồi đúng tâm đệm, mặt hướng Phật. WASD hoặc Đứng dậy thoát tư thế. Kiểm tra ghế NPC và người chơi từ trạng thái remote đã nhận; chưa có khóa ghế do server quản lý khi hai người click đồng thời.
- Đệm dành sẵn cho các điểm sinh hoạt NPC không nhận người chơi. Không đổi đăng nhập, công đức hay giao thức hành động; dùng act sit hiện có.
- Bổ sung 5 lối bậc trước hiên (8 bậc × 0,15m, mặt bậc 0,34m), hình và va chạm cùng dữ liệu, nối sân với nền 1,2m.
- Người điều khiển vẫn dùng RocketboxPlayer với PilgrimWalk / PilgrimRun / Push đã chuyển từ nhân vật cũ, blend .18s, push 1,5x / 1,8s. Đã chạy lại test clip thật nam/nữ.

## Nguồn và giới hạn

Microsoft Rocketbox MIT; áo dài ghostnoface CC BY4.0; hoạt ảnh Quaternius CC0; 10 hoa văn SVG của dự án. Giữ SOURCE/CREDITS/LICENSE trong assets/chars/ready-made/ao-dai-collection. Không mua tài nguyên/dịch vụ.

NPC chạy độc lập phía trình duyệt, chưa đồng bộ vị trí NPC giữa nhiều người chơi hoặc lưu lịch qua lần mở game. Tìm đường dựa vào collider đang được thế giới đăng ký; cần chơi lâu để rà mọi lối/nội thất được stream. Chưa có cloth physics/foot IK hoàn chỉnh; áo khi ngồi/lạy còn cần rà xuyên vải. Thao tác nghe pháp là tư thế/chọn đệm, chưa thêm bản thu bài giảng. Không tự bật lại âm tụng chánh điện đã được yêu cầu tắt trước đó.

## Kiểm chứng

- Bộ kiểm tra rộng: 108/108 đạt, `docs/temple-life-all-tests.log`.
- Kiểm tra clip thật và bộ sưu tập: 5/5 đạt, `docs/temple-life-targeted-tests.log`.
- Thêm kiểm tra ngồi đúng đệm, từ chối xa/chiếm chỗ/sai tầng và cả 5 lối thang: `docs/temple-life-navigation-tests.log`.
- Build local đạt; public build/typecheck có log `docs/temple-life-public-build.log` và `docs/temple-life-public-final-build.log`.
- Chơi thử trực tiếp đang bị giới hạn: đã mở cảnh chính và thấy trạng thái tắt đám đông/đệm mới, nhưng trình duyệt mất kết nối trong lúc tải cảnh nặng. Chưa xác nhận bằng hình đầy đủ 10 NPC hoặc chơi đủ chu kỳ 10 phút, chọn đệm thực tế, nhiều người chơi và điện thoại. Không coi các test dữ liệu là đã kiểm chứng đồ họa thực tế.

## Triển khai

Đang chuẩn bị gói public. Chỉ dùng update-existing.sh trên site hiện hữu, sao lưu app/web/SQLite trước thay bản; không chỉnh site khác hoặc ghi đè dữ liệu tài khoản. Bổ sung kết quả triển khai thực vào IMPLEMENTATION_STATUS.md sau khi server xác nhận revision/health.
Đã triển khai thành công. Revision/health/asset hash xác nhận qua HTTPS và SSH; tài khoản/công đức giữ nguyên. Backup: /root/anlien-backups/2026-11-02-temple-life-1-20261102T075706Z. Log: docs/temple-life-deploy.log, docs/temple-life-https-verification.json. Mở lại bản public bằng công cụ trình duyệt vẫn timeout; không có ảnh chơi thử đầy đủ mới. Các giới hạn phía trên vẫn còn hiệu lực.

## Bàn giao dở dang — đã dừng theo yêu cầu 02/11/2026
Nguồn 500 cư dân và vòng hành lang nằm trong TempleLife/TempleLifePlan/TempleCrowdRenderer. Typecheck + 5 kiểm tra đạt. Chưa QA đồ họa/FPS, chưa build/deploy, chưa đồng bộ NPC qua mạng. Mức gần 20/40 rig; mức xa dùng thin instances. 500 là dân cư mô phỏng. Xem cuối IMPLEMENTATION_STATUS.md trước khi tiếp tục; không tự coi bản này đã sẵn sàng phát hành.
