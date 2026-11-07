# Điêu khắc thử khuôn mặt Phật — 02/11/2026

Mục tiêu lượt này là sửa hình học cục bộ trên tượng Phật ngồi, không coi tăng số tam giác là tăng chi tiết. Nguồn giữ nguyên: authoring/tripo/incoming/phat-ngoi-01.glb (501106 tam giác). Checkpoint trước lượt: authoring/checkpoints/20261102-sculpt-face/.

Quy trình trong authoring/tripo/refine-buddha.py:
- Dùng bản nguồn đầy đủ; bổ sung lưới rồi đưa về 800000 tam giác.
- Bỏ global sharpening vì ảnh thử làm nổi lỗi sần/nhọn trên mặt.
- Vẽ các đường khắc theo tọa độ khuôn mặt trong ảnh render orthographic: hai mí mắt, hai nếp mí trên, khe môi, hai cánh mũi, hai rãnh tai; thêm hai hốc mũi. Đổi vị trí vertex theo normal với vùng ảnh hưởng nhỏ và mask mặt trước. Đây là điêu khắc hình học theo đường dẫn, không thêm chi tiết giả bằng texture hay lấy model trả phí.
- Giữ đối tượng nguồn ẩn trong .blend; xuất GLB và ảnh trung tính trước/sau, góc nghiêng trái/phải để đánh giá.

Đây là bản khắc cục bộ thử nghiệm. Tỷ lệ và khối nền khuôn mặt vẫn từ nguồn H2.5; chưa xây lại giải phẫu khuôn mặt, ngón tay, y phục, tóc hoặc đài sen. Không tuyên bố tương đương Tripo 3.1. Không đổi giấy phép nguồn, không deploy public.

Chạy Blender portable với --background --python authoring/tripo/refine-buddha.py. Đầu ra: authoring/tripo/detail-study/buddha-800k-study.blend, phat-ngoi-800k.glb, report.json và face-*.png. Lệnh hiện dùng CPU render Cycles nên có thể mất vài phút. Xem local: http://127.0.0.1:5202/authoring/tripo/preview.html?sculpt=1 . Hai nút cận mặt dùng cùng vật liệu xám và góc nhìn để so sánh.
