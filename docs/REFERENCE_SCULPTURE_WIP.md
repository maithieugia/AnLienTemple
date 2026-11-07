Cập nhật: đã có PLY3D và bộLOD từ TripoSR; chưa đạt mỹ thuật. Mẫu ghép đầu bị loại. Xem PHOTO_BUDDHA.md để tiếp tục, không làm lại bước tải model.

# Tượng theo ảnh — công việc đang làm, 31/10/2026

Yêu cầu mới của anh: lấy ảnh C:/Users/Admin/Desktop/tuong-phat-thich-ca-5.jpg làm mẫu, bỏ kiểu các khối ghép. Giữ nguyên các danh hiệu; người dùng đã cho phép tạo hình mỹ thuật, nhưng không chấp nhận chất lượng mẫu ghép.

Đã dừng tiến trình sculpt-hundred.py ở khoảng48mẫu. Không coi số file GLB khác nhau là đạt yêu cầu mỹ thuật. Những mẫu này CHƯA ĐƯỢC DUYỆT. Không tự chạy tiếp nhân100.

Đã phục hồi src/game/world/HundredBuddhas.ts từ checkpoint AnLienTemple-backup-20261031-distinct-sculptures để bản chùa không phụ thuộc pack100 chưa hoàn tất. Bản v5 vẫn là mẫu dùng chung, không được báo là100 điêu khắc riêng.

Blender thử lại một mẫu có bàn tay giơ lên và bàn tay để ngửa ở đùi, sửa kết nối cổ/vai/cổ tay bằng voxel union. Kiểm ảnh render phát hiện mất phần chân và các chỗ nối vẫn xấu. Tượng này KHÔNG ĐẠT; public/assets/sanctuary/reference-buddha đang là bản thử, không được đưa vào điện hay coi là kết quả cuối. Recipe authoring/canonical-buddhas/sculpt-reference.py và source.blend được giữ để tra lỗi; docs/v6-reference-stone-sculpture.png cho thấy lỗi, không phải ảnh duyệt.

Đang thử hướng ảnh-sang-3D thực sự, TripoSR MIT chạy local (https://github.com/VAST-AI-Research/TripoSR). Máy RTX3050Laptop4GB, torch2.5.1+cu121 sẵn. Cài môi trường riêng tools/.venv-triposr --system-site-packages, không sửa pip toàn máy. Nguồn tools/vendor/TripoSR, trọng số tools/models/TripoSR từ stabilityai/TripoSR chính thức. Không upload ảnh, không dịch vụ trả phí.

Runner tools/reconstruct-buddha-local.py: tách vật thể bằng mask/GrabCut phục vụ suy luận3D, torchFP16, chunk4096, marching cubesCPU scikit-image thay torchmcubes vốn khó build Windows, xuất authoring/photo-reconstruction/photo-mesh.ply. Model/input-private không kèm bản phát hành. Chưa xác nhận thành công cho tới khi có PLY và xem trực tiếp.

Trang reference.html / src/reference-preview.ts dành riêng xem thử mẫu, nút chính diện/nghiêng/sau/đá-vàng. Chưa nên gửi link trước khi asset đạt hình khối. Chùa không tự thay tượng.

Cần làm tiếp: chạy suy luận, kiểm model so ảnh, sửa bàn tay/mặt/áo nếu đủ nền tốt, xuất GLB 3LOD, chơi thử trình xem, rồi cập nhật trạng thái/đóng gói. Không nói đã dựng giống nguyên mẫu từ một ảnh; mặt sau là phần suy đoán.
