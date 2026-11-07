# Áo dài fit-2: cổ tay, đường may và chống xuyên — 02/11/2026

Bản xem thử: http://127.0.0.1:5196/rigged-people.html?outfit=ao-dai&revision=fit-2 . Chưa thay model trong game online.

## Thay đổi
- Khâu các mép pattern trùng nhau của áo gốc và thêm lớp vải trong dày 1,5 mm. Giữ UV, màu lam và hoa văn của ghostnoface.
- Căn 235 đỉnh của ống tay theo vai, khuỷu và cổ tay Rocketbox. Miệng tay phủ qua cổ tay 14 mm, vòng cuff gắn trực tiếp vào xương bàn tay. Tăng khoảng hở tại khuỷu; thu nhẹ bán kính phần cẳng tay bị vải che, giữ nguyên bàn tay/ngón tay nhìn thấy.
- Bỏ phần áo/quần cũ bị che; kéo dài gấu quần trắng. Hai tà dùng trọng số liên tục theo hông và hai đùi, tránh bị mỗi bàn chân kéo ra một hướng.
- Thêm AoDaiCloth.ts chỉ cho lựa chọn áo dài trong viewer. UV2 đánh dấu tà trước/sau; shader đẩy vải tránh các capsule của đùi, cẳng chân, bàn chân và mặt sàn sau khi skin. Đây là xử lý chống xuyên đơn giản, không phải mô phỏng vải đầy đủ.

## Kiểm chứng
- Blender xuất thành công; TypeScript và Vite local build đạt: docs/ao-dai-sleeves-web-build.log.
- Hai kiểm tra trên GLB thật đạt: hash, skin 80 xương, sáu hoạt ảnh, trọng số chuẩn hóa; vải có lớp kín, không có cạnh hở hoặc cạnh non-manifold; UV2 có đủ các nhãn 0/1/2. Kiểm vị trí cuff qua 20 mẫu pha Idle/Walk/Run/Push và chín tư thế prayer/sit/bow: không rời cổ tay. Log docs/ao-dai-sleeves-tests.log.
- Đã xem trực tiếp đứng, chắp tay và quỳ trên trình duyệt. Shader chống xuyên biên dịch, console không có error trong phiên cuối. Ảnh nghiệm thu dáng đứng: docs/ao-dai-sleeves-standing-final.png; chắp tay: docs/ao-dai-sleeves-prayer-final.png.
- Người dùng cũng điều khiển camera/nút trong phiên QA. File ao-dai-sleeves-clearance-walk.png thực tế chụp tư thế quỳ từ phía sau; không dùng tên file đó làm bằng chứng đã kiểm đủ chu kỳ đi. Các ảnh walk trước khi thêm capsule còn thể hiện quần xuyên tà, giữ lại để đối chiếu.

## Giới hạn và bàn giao
Chưa rà toàn bộ mọi góc/pha chạy, ngồi, lạy hoặc mọi dạng tự va chạm vải. Chưa đo riêng chi phí GPU hay kiểm điện thoại/multiplayer. Normals chưa được tính lại theo độ đẩy capsule; cần tinh chỉnh nếp vải và hình dáng tà ở tư thế gập sâu trước dùng online. Kiểm cuff không đồng nghĩa bảo đảm hết mọi xuyên vải.

Checkpoint: authoring/checkpoints/20261102-ao-dai-sleeves. Script tái tạo: authoring/vietnamese-wardrobe/fit.py. Model cuối 15.639 tam giác, 80 xương, sáu clip; SHA256 73790cf02ae961b0e77fa5470157a49e8c01fa607b0b86cf9cea93f2d7df9cef. Nguồn và giấy phép CC BY4.0 / MIT / CC0 nằm trong SOURCE.json, CREDITS.md của asset. Khi tích hợp cần đem cả UV2 và AoDaiCloth.ts, không chỉ thay GLB.
