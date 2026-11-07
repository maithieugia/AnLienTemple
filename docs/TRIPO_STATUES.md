# Tượng từ Tripo Studio — 02/11/2026

Đã mở https://studio.tripo3d.ai/ bằng trình duyệt, màn hình hiển thị Sign up/Log in. Chưa đăng nhập, chưa gửi tác vụ, chưa trừ lượt hoặc thanh toán, chưa có file 3D mới. Không coi prompt là tượng đã dựng.

Ba tác vụ đầu được chuẩn bị trong authoring/tripo/jobs.json và prompts/: Phật ngồi, Hộ Pháp, La Hán. Hai mẫu sau là hình tượng mỹ thuật gốc, chưa gán danh hiệu riêng thiếu căn cứ. Làm một mẫu Phật ngồi trước để kiểm chất lượng mặt, bàn tay, nếp áo và mặt lưng; không nhân hàng loạt nếu chưa đạt.

Sau đăng nhập: kiểm gói/lượt của tài khoản, phí hiển thị và quyền xuất. Không mua gói/lượt hoặc tự tiêu số dư trả phí khi chưa được anh đồng ý. Nếu tài khoản có quota miễn phí, ưu tiên chế độ xuất được theo quyền tài khoản; tài liệu hiện ghi Free chỉ xuất H2.5, không mặc định bản mới nhất cũng tải được. Không lấy file bằng cách vượt giới hạn xuất của dịch vụ.

Nguồn chính chủ đã kiểm:

- https://www.tripo3d.ai/product-doc/getting-started/pricing-credits — ghi 200 credits/tháng, H2.5 export và Free commercial with attribution.
- https://www.tripo3d.ai/help/privacy-policy/how-to-use-tripo-models-commercially — lại ghi Free commercial use not granted.
- https://www.tripo3d.ai/terms — 5.2.1 Tripo giữ quyền đối với input/output Free; 5.2.2 mô tả quyền của paid users. Chưa có bằng chứng quyền xuất/cấp phép cụ thể của tài khoản này.

Do thông tin không thống nhất, chưa đưa đầu ra Free lên site/game công khai. Lưu điều kiện tại thời điểm tạo/xuất, link task và tác giả/gói vào manifest khi có model. Không tải lên ảnh tượng có watermark/nguồn không rõ; các prompt ở đây là mô tả mỹ thuật gốc.

Chuẩn bị xuất GLB có PBR, thân/tay/ngón đầy đủ, giữ chi tiết sculpt nguồn. Sau tải vào authoring/tripo/incoming/: kiểm bounding box, mesh, triangles, texture, normal, mặt sau và độ kín; giữ model nguồn nguyên vẹn. Tạo ba LOD với ngân sách trong jobs.json, bake normal để giữ nét khắc, không subdivision lúc chơi. Không dùng nhiều bản high-poly đồng thời trong chùa. Đây là ngân sách dự kiến, chưa có số liệu mesh thực tế.

Các bước còn lại: anh đăng nhập trực tiếp trên tab Tripo; kiểm quyền dùng/lượt miễn phí; tạo pilot, xuất bằng nút chính chủ, ghi hash/license; kiểm Blender và viewer; đặt một mẫu ở khu thử local; đo FPS rồi mới thay hoặc nhân ra. Không thay tượng hiện hành khi chưa có mẫu đạt.

## Cập nhật phiên đã đăng nhập
Đã tạo pilot H2.5 bằng mô tả gốc (982/1000 ký tự). Task: https://studio.tripo3d.ai/workspace/generate/73dc0b43-bdff-4d87-9d9e-e6dbdfb07336 . Giao diện trừ 15 credits, còn 185. Chưa mua gói/lượt. Đang tạo; chưa xuất hoặc thay tượng game. Các ghi chú chưa đăng nhập ở trên là trạng thái cũ.


## Kết quả đã kiểm chứng — 02/11/2026

Đã đăng nhập tài khoản bb.hoaithanh, xác nhận Free trên bảng gói. Tạo và xuất chính thức đủ ba GLB H2.5: Phật ngồi, Hộ Pháp, La Hán. Tổng dùng 45 credits miễn phí, còn 155; còn 12/15 lượt xuất sau ba file. Không mua gói hay credits. Task ID và SHA256 nằm trong authoring/tripo/jobs.json. Prompt thực gửi được rút gọn dưới 1000 ký tự từ ba bản thiết kế ban đầu; lịch sử tác vụ Tripo giữ nội dung thực gửi.

Nguồn giữ nguyên tại authoring/tripo/incoming/. File xuất chỉ có geometry/material, không có ảnh texture. Màu vàng trong ảnh và local-preview là vật liệu PBR tạo tại Blender, không phải texture Tripo. inspect-render.py tạo báo cáo mesh, ảnh trước/sau, rồi decimate bản xem thử 40k/40k/30k tam giác. Đây chưa phải quy trình bake normal/retopology hoàn chỉnh.

Đã kiểm tra ảnh Blender trước/sau. Phật: đủ thân, tư thế và bàn tay nhận diện được; tóc, tay trái, mép sen và nếp áo vẫn mềm/méo ở cận cảnh. Hộ Pháp: đủ hình thể và trượng; mặt, hoa văn còn mềm, bàn tay chưa đủ nét. La Hán: đủ tư thế ôm bát, nếp áo; mặt/ngón tay vẫn cần chỉnh. Không duyệt cả ba làm hero asset và không nhân hàng loạt. Không tự gán danh hiệu cụ thể cho Hộ Pháp/La Hán.

Bộ xem local: http://127.0.0.1:5202/authoring/tripo/preview.html . Chạy lại bằng node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5202 --strictPort tại thư mục dự án. Không đưa authoring vào public hay thay tượng hiện hành. Trình xem Tripo liên tục báo lỗi tải tài nguyên, nhưng nút Export tải GLB thành công và Blender nhập được.

Còn lại: giải quyết quyền phát hành vì tài liệu Free mâu thuẫn; cải thiện sculpt bằng ảnh thiết kế gốc/chỉnh tay; sửa tay và mép hoa văn; bake normal, tạo LOD và đo FPS trong chùa. Chưa kiểm va chạm/LOD/FPS trong gameplay. Không coi bản thử là tượng hoàn chỉnh hoặc được cấp quyền phát hành thương mại.
