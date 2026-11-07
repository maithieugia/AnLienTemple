# 500 phật tử — bản triển khai 03/11/2026

Theo yêu cầu bật và đưa lên server, main.ts dùng TempleLife500. Bản TempleLife10người vẫn giữ riêng để đối chiếu; không làm tiếp điêu khắc. Không phải500tài khoản online:500NPC được mô phỏng phía client; vị trí/lịch chưa đồng bộ giữa các người chơi.

Khởi tạo350người nghe pháp trên đệm riêng rải hai khối,120người đi hai làn vòng kín quanh4phía chánh điện,28người sinh hoạt sân,2người đẩy kinh luân. Đứng/ngồi300–600giây rồi tự tìm chỗ khác chưa được đặt; vòng hành lang dài trên2km, chỉ đi bộ1.35m/s và hoàn tất vòng rồi mới chuyển việc. A* kiểm collider/cao độ và giới hạn1tìmđường/frame; không teleport khi tìm đường thất bại. Chưa có tránh va chạm động đầy đủ giữa NPC, nên giao cắt đông có thể xuyên nhau.

10hoa văn áo gốc ×50biến thể sắc áo/quần, giữ đầu/tóc gốc. Bộ model/nguồn/giấy phép cũ không thay. Người gần dùng rig đầy đủ giới hạn20(low)/40(high), tầm45m; còn lại dùng mesh chia sẻ theo tư thế và thin instances,85m trở ra dùng lưới thô hơn. Cập nhật hiển thị xa5Hz, bước đi xa chỉ2khung nên còn giật/đơn giản; người gần dùng animation gốc. Ẩn ngoài500m(low)/1000m(high), mô phỏng vẫn tiếp tục. Không khởi tạo500skeleton toàn phần.

Kiểm chứng: TypeScript đạt;8/8test temple-life+four-kings đạt; buildpublic đạt. Đã chạy viewer local:500/500sẵn sàng,120đangđi,14/20riggần,khoảng622ktrisxa, không lỗi tải đã quan sát. FPS trong phiên trình duyệt kiểm thử chỉ khoảng4–5; CHƯA chứng minh hiệu năng tốt hoặc đã đạt30/60FPS. Chưa chơi toàncảnh chùa đủ chu kỳ hoạt động hoặc đo GPU/điệnthoại. Không gọi kiểm dữ liệu/HTTP là kiểm đồ họa. Các giới hạn này cần giữ nguyên trong bàn giao.

Checkpoint authoring/checkpoints/20261103-crowd500-activate. Logs docs/crowd500-typecheck.log, crowd500-tests.log, crowd500-build.log; kết quả deploy và backup sẽ bổ sung vào IMPLEMENTATION_STATUS.md. Revision mục tiêu2026-11-03-crowd500-1. Không bật lại1500phật tử cũ; các đệm và chọnngồinghepháp vẫn giữ, chỗNPC đang dùng/đang đến được chặn khỏi lựa chọn.

## Kết quả triển khai
Đã deploy2026-11-03-crowd500-1. Health/release/trang200, mainbundle vàGLBnhânvật đúnghash, có mãrenderer500 trongmain. Tài khoản/côngđức nguyên vẹn; backup/log chi tiết cuối IMPLEMENTATION_STATUS.md. Chưa xácnhận publicbrowserđủchu kỳ hay GPU/mobile. FPSviewerlocal còn4–5, cần tốiưu tiếp, không dùng HTTPtest làm bằngchứnggamechạymượt.
