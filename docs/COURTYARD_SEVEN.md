# Bảy tượng anh cung cấp — 03/11/2026
Nguồn: đúng 7 ZIP P1..P5, 84b0a620-72d7-4b47-8531-b2bfbe7f99d9 và phật nằm trong Downloads/Tượng Phật. Chỉ đọc base_basic_pbr.glb, không chạy nội dung ZIP; nguồn/hash tại authoring/courtyard-seven/sources.json. Không tự gán danh hiệu/giấy phép. Giữ vật liệu gốc, không làm tiếp thử nghiệm điêu khắc đã dừng.

Tọa độ tính theo mét, bên phải là Đông khi từ cổng nhìn vào chánh điện. Phật nằm: (150,540), mặt hướng vào chánh điện (yaw π), sát mép ngoài trước sân ở cánh phải, canh giữa trục cổng x0 và Thiên Vương phải x300; bệ 64×20m bắt đầu tại z530, cao model20m, bệ0.8m; sáu tượng còn lại cao model10m, bệ0.8m, dọc phía trước sân z520, x=-220,-145,-70,70,145,220 nhìn vào chánh điện. Các tượng cũ giữ kích thước và vị trí. Bệ chặn va chạm, vùng cây/ghế được dành trống; bổ sung menu vườn tượng.

Pipeline nhập lại source, chuẩn hóa cao1m, hàn seam1e-7 trước giảm lưới, tính normals; high120k/low35k/far8k và texture2048/1024/512. Không tăng tam giác để giả chi tiết. Source và blend/render nằm authoring/courtyard-seven; runtime public/assets/sanctuary/courtyard-seven. Trang kiểm riêng courtyard-seven.html; game chính dùng cùng StatueGardenPlan/StatueGarden, không chỉ đặt trong trang QA.

Checkpoint trước sửa: authoring/checkpoints/20261103-courtyard-seven. Tình trạng kiểm cuối cùng xem IMPLEMENTATION_STATUS.md.

## Kiểm tra lưới cuối
Audit28nguồn/LOD:21/21runtime không có cạnh hở/khôngmanifold, hash kèm hole-audit.json. NguồnP5 có1cạnhnonmanifold nhưng khôngcạnhhở; high/low/far sau chuẩn bị đều kín. Một sốLOD xuất có tam giác suy biến mảnh dài khoảng0.012–0.014m ở môhìnhchuẩnhóa; đã gộp3đỉnhbiên vềtâm tại đúng các khe đó (close-slivers.py), không remesh làm đầy toàn bộ các khe hoa văn hợp lệ. patch-tiny-gaps/patch-micro-seams thử trước không giải quyết các tamgiácđồngphẳng này; không coi các lầnthử đó là kết quả cuối.
