# Hiện hành0.4.0: thânØ50m, thay hai hồ

Xem [thông số và kiểm chứng0.4.0](WIDE_PRAYER_WHEELS.md). Bản dưới là lịch sử0.3.0 trước khi tăng kích thước; chữ/điều khiển/lưu điểm vẫn giữ.

# Hai kinh luân — An Liên0.3.0, 31/10/2026

Hai trụ đặt đối xứng X−45/+45,Z470 trước sân; chừa đường trục24m. Cao tổng100m tính cả chân/đỉnh; bán kính thân trống5m, bệ đá6.8m. Thân xoay từ2.8m đến96.4m, trục/đỉnh cố định. Tay đẩy ngang cao1.25m, vòng tay đẩy đường kính11.6m. Bệ có va chạm, bỏ ghế gần trụ để không xuyên vật thể.

Chân ngôn Sanskrit viết Devanagari: ॐ मणि पद्मे हूँ (Oṃ maṇi padme hūṃ).72hàng×4câu quanh mỗi thân≈288câu, lặp từ dưới tới trên; không vẽ chữ Latin thay thế. Font Noto Sans Devanagari OFL được đóng gói local, trình duyệt shaping đầy đủ dấu/chữ ghép. Chữ là relief khắc lõm qua height/normal-map + màu vàng sẫm, không phải hàng triệu chữ mesh cắt xuyên thân. Thân/cổ/diềm/đỉnh/cánh sen/tay đẩy là hình học gốc. Mức Cao atlas4096×2048, Nhẹ2048×1024, vật liệu PBR vàng.

Xoay: đi bộ đến≤10m từ trục, đứng dưới3m cao. Nhấn E (không nhận auto-repeat), click trực tiếp thân/tay đẩy hoặc nút Xoay. Có thể dùng nút Đến trụ Tây/Đông trong thanh xem mẫu để thử ngay. Xoay thuận chiều kim đồng hồ từ trên, có quán tính và ma sát; không tự quay khi chưa được đẩy. Một vòng hoàn chỉnh+1 công đức trong game; bấm nút không cộng điểm trực tiếp. Hai trụ có tốc độ/vòng riêng. Lưu số vòng trên localStorage key anlien.prayer-merit.v1, cùng origin5196; không sửa save Veilbound. Không lưu tốc độ/vòng dở dang để tránh điểm tự tăng khi tải lại.

Kiểm:11test qua (4kiến trúc cũ+7kinh luân): kích thước/đối xứng, đứng xa/ở tầng cao không dùng được, chuyển động độc lập, không thưởng idle, đủ vòng mới thưởng, nhất quánFPS, dữ liệu lưu hỏng. Build TypeScript/Vite đạt. WebGL đã thấy2trụ/dòng chữ, dùng nút/click3D/E; Tây5vòng, Đông2vòng (7điểm phát sinh từ QA, không xoá dữ liệu), tải lại vẫn giữ5điểm ở lần kiểm trước. Ảnh v3-*.png. Chưa benchmark mobile/GPU, chưa kiểm cảm ứng trên điện thoại thật hoặc review bởi chuyên gia thư pháp Phạn. Không thêm bản thu kinh/âm thanh mới.

Nguồn đối chiếu:
- https://en.wikipedia.org/wiki/Om_mani_padme_hum — cách viết Devanagari.
- https://fpmt.org/media/resources/microfilm-for-stupas-and-prayer-wheels/how-to-fill-a-prayer-wheel/ — chân ngôn Sanskrit trên mặt kinh luân.
- https://www.palpung.org/english/monastery/sherabling/utility/wheel.asp — chiều xoay kim đồng hồ.
- https://github.com/google/fonts/tree/main/ofl/notosansdevanagari — font/OFL; giấy phép trong public/assets/fonts/noto-devanagari.
