Trạng thái cuối lượt thử: CHƯA ĐẠT ĐỘ SẮC SẢO CỦA ẢNH. Đã tạo mesh3D từ ảnh, nhưng không có mẫu điêu khắc hoàn thiện. Không triển khai100tượng. Bản ghép đầu cũng bị loại; không quảng bá như thành phẩm. Build qua,19test kỹ thuật qua; đã kiểm trang xem chính diện/nghiêng/sau và vật liệu. Các kiểm tra này không xác nhận mỹ thuật đạt yêu cầu.

# Tượng theo ảnh — bản thử31/10/2026

Ảnh người dùng: C:/Users/Admin/Desktop/tuong-phat-thich-ca-5.jpg. Không kèm ảnh gốc/mask trong runtime.

Đã chuyển ảnh thành lưới3D thực sự bằng TripoSR MIT chạy hoàn toàn local trên RTX3050Laptop4GB. Không upload ảnh, không lượt dịch vụ trả phí. Nguồn chính thức https://github.com/VAST-AI-Research/TripoSR ; weights stabilityai/TripoSR https://huggingface.co/stabilityai/TripoSR . SHA256 model.ckpt429e2c6b22a0923967459de24d67f05962b235f79cde6b032aa7ed2ffcd970ee đã kiểm.

Lưới gốc110056tam giác, low40000, far6999. Ảnh4góc docs/photo-buddha-four-angles.png được render từ chính mesh. Bản AI gốc giữ dáng ngồi và tay giơ, nhưng mặt bị biến dạng, tóc và các ngón tay chưa đủ nét. Không dùng mẫu AI gốc để nhân100. Mặt sau suy đoán, không khẳng định giống tượng gốc.

Bản chỉnh: giữ thân/áo/dáng từ lưới ảnh, dùng đầu chi tiết từ rbmarbletemplearts, CC BY4.0, Meshy AI; nguồn https://sketchfab.com/3d-models/6ea532f741ee41c3b0df9b5bef68e667 . Cắt/định vị cổ, hợp nhất điêu khắc, xuất3LOD. Bản này là mỹ thuật kết hợp, không phải scan hay bản sao chính xác khuôn mặt trong ảnh. Ngón tay vẫn cần điêu khắc riêng; chưa đạt mẫu hoàn thiện để triển khai100vị.

Xem reference.html: chỉ có lướiAIgốc. Bản chỉnh đầu đã bị loại vì còn lộ vết nối ở cổ, giữ ở authoring/unapproved/photo-buddha-sculpted, không xuất hiện trong runtime. Chính diện/nghiêng/sau và đá-vàng; có thể xoay360độ. Không tự thay tượng trong điện.

Quy trình tái lập từ gốc workspace Veilbound:
1. tools/reconstruct-buddha-local.py: mask kỹ thuật cho mô hình3D, suy luận TripoSR FP16/chunk4096, lưu authoring/photo-reconstruction/scene-code.pt. Torch2.5.1+cu121 trên máy, các phụ thuộc nhẹ cài riêng tools/vendor/tripo-extra; source tools/vendor/TripoSR. Môi trường tools/.venv-triposr cài thử đã dừng, không dùng. Không thay pip toàn máy.
2. tools/extract-buddha-scene.py: nạp riêng20tensordecoder từ checkpoint đã kiểm, dùng scene-code có sẵn, densitygrid256 và PyMCubesCPU. Xuất binaryPLY55032đỉnh/110056mặt. Tách bước này tránh nạp lại transformer lớn và lỗi float16/float64 của đường xuất cũ.
3. Blender4.5.9LTS --background --python authoring/canonical-buddhas/prepare-photo-buddha.py -- --no-render: chuẩn hóa cao1m, xoay mặt về+Zgame, sửa pháp tuyến, xuất GLB/bộLOD.
4. Blender --background --python authoring/canonical-buddhas/refine-photo-buddha.py: mẫu chỉnh mặt có nguồn CC BY, nguồn .blend ở authoring/photo-reconstruction.
5. npm run build, npm test, xem thực tế bằngtrình duyệt. Không lấy ảnhconcept thay cho mesh3D.

Lưu ý kỹ thuật: runner hiện đặt sẵn ảnh mẫu này, scene-code thuộc đúng ảnh này. Khi thay ảnh phải xóa/cache theohash hoặc sửa đường dẫn và tạo lại scene-code; không tái dùng scene-code cũ cho ảnh mới. Chưa có bộ lệnh batch100ảnh hoàn chỉnh. Chưa xử lý sắc nét từng ngón tay/chi tiết mặt theo ảnh. Chưa được người dùng chấp nhận mỹ thuật.

Các mẫu lập trình cũ48mẫu và reference-buddha không đạt đã chuyển sang authoring/unapproved, ngoài runtime; giữ lại để tra lỗi. Bộ tải chùa phục hồi v5 dùng tượng chung, giữ tiến độ công đức. Không gọi đó là100mẫu điêu khắc riêng.

Còn lại: điêu khắc chính xác khuôn mặt/ngón tay/nếp áo và retopology; kiểm lại ảnh nhiều góc nếu có. Chưa thử Hunyuan3D/TRELLIS hay giải pháp khác; không kết luận mọi công nghệ đều bất khả. Không được tự mua dịch vụ.
