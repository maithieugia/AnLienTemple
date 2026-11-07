# Bình luận TikTok → chỗ ngồi và tên nhân vật

## Dùng khi phát LIVE

1. Chạy `MO-TOOL-LIVE.cmd` hoặc `npm run live`. Mở bảng điều khiển http://127.0.0.1:5197/ và bật âm thanh ở một tab.
2. Mở **Cảnh 3D tương tác** tại http://127.0.0.1:5197/live-seats?clean=1 rồi quay cửa sổ đó bằng OBS. Tên nằm ngay trong cảnh; không cần overlay riêng cho tên. Overlay chat cũ vẫn có thể dùng nếu muốn hiện lời nhắn.
3. Mở LIVE trên @mai.hoaithanh và bấm Kết nối LIVE trong bảng điều khiển. Thử đủ một người tham gia, bình luận lại, đổi nam/nữ và rời chùa trước khi phát chính thức.

Bình luận đầu tiên nhận một chỗ. Gõ đúng `nam` / `nữ` để chọn tóc ngắn / tóc búi; `rời chùa` để trả chỗ. Bình luận tiếp vẫn giữ chỗ, không tạo nhân vật thứ hai. Hai người trùng tên vẫn có chỗ riêng vì dùng ID TikTok. Người xem không cần đăng nhập game web.

Trong bảng điều khiển, nút **Xem** cạnh tên đưa camera orbit đến người đó. **Xóa ghế thử** không xóa người thật. **Làm mới mọi chỗ ngồi** xóa toàn bộ chỗ đã nhận trong phiên tool. Xóa lịch sử bình luận không xóa chỗ.

## Hai cảnh quay

- `/live-seats?clean=1`: cảnh đạo tràng nhẹ, ẩn thanh kiểm thử và chân trang. Chỉ vẽ tối đa 300 NPC nền chưa nhận chỗ, cộng những người đã nhận ở xa hơn; vẫn có 1.500 vị trí có thể nhận. Giảm số bản sao chi tiết gần từ 60 xuống 24 và độ phân giải WebGL để nhẹ hơn. Bảng tên DOM vẫn theo độ phân giải màn hình. Chưa có số benchmark FPS cam kết.
- `/temple?q=low&view=lay-assembly&liveSeats=1`: cảnh có toàn bộ kiến trúc chùa, dùng chung hệ gán ghế/tên. Nặng như game chính; chưa nghiệm thu trực tiếp bản này trong lượt kiểm UI hiện tại.

Cả hai chạy qua bridge local5197 để WebSocket cùng origin. Không cố nhúng localhost HTTP vào game HTTPS. Chế độ game thường ở5196 hoặc server công khai vẫn giữ đội hình và lịch NPC cũ; chức năng tương tác này chưa triển khai lên server public hay biến thành hệ tài khoản multiplayer.

## Dữ liệu và hiển thị

`live/participants.ts` giữ map ID → seatId trong RAM của server tool. Ưu tiên userId TikTok, fallback uniqueId; nickname chỉ để hiển thị. Tải lại cảnh hoặc reconnect WebSocket nhận snapshot và giữ chỗ. Tắt server tool sẽ mất phiên; chưa lưu ra ổ đĩa.

Ghế đã nhận dùng NPC ngồi sẵn, giữ tư thế thiền và không bị lịch nhóm NPC tự kéo đi. Không tạo thêm một rig riêng cho mỗi bình luận. Nam/nữ hiện chỉ đổi kiểu tóc trên nguồn nhân vật đang có; chưa có mẫu mặt/cơ thể nữ hay vai sư/ni mới.

`LiveSeatTags.ts` chiếu tọa độ 3D trên đầu sang lớp tên, quay/zoom theo camera. Tối đa48 nhãn gần, trong khung hình và không đè nhau; dùng nút Xem cho người ở xa. Tên dài được rút gọn, chữ đi qua textContent. Tên thử có nhãn THỬ, không tăng số liệu LIVE thật. Kết nối LIVE mới tự bỏ ghế demo, giữ ghế thật khi reconnect. Tài khoản bị chặn được gỡ khỏi danh sách ghế.

Bridge gửi delta khi có người nhận/đổi/rời chỗ; không gửi lại toàn bộ1500 người cho mỗi lời nhắn thường. `/api/seats/focus`, `/clear-demo`, `/reset` chỉ có trên bridge local và giữ kiểm tra Origin/Host hiện tại. Không gửi chat ngược lên TikTok, không tính công đức từ quà.

## Xác minh và việc còn lại — 01/11/2026

- Checkpoint: `authoring/checkpoints/20261101-live-seats`.
- 16/16 kiểm tra bridge + người tham gia đạt; toàn dự án86/86 đạt trước tinh chỉnh ngân sách vẽ LIVE. Log: `live-seats-tests.log`, `live-seats-all-tests.log`.
- Đã kiểm UI: ba bình luận giả lập tạo ba người có tên đúng trên đầu; bình luận tiếp của An Lạc vẫn giữ3chỗ; nút Xem đưa camera đến An Lạc. Server vẫn giữ ba chỗ sau khi tải lại cảnh. Không gửi các bình luận thử lên TikTok.
- Có lần tải lại/capture cảnh bị chậm hoặc timeout trong trình duyệt thử. Đã thêm giải phóng scene/engine khi rời trang và giảm phần nền riêng chế độ LIVE; không tuyên bố đã loại bỏ mọi vấn đề hiệu năng.
- Chưa nghiệm thu TikTok LIVE thật → avatar hoặc âm thanh/hình qua OBS/TikTok LIVE Studio; chưa đo tải1500 người nhắn liên tục, mobile và mọi góc camera. Thư viện TikTok không chính thức vẫn có giới hạn đã ghi trong TIKTOK_LIVE.md.
- Chưa có hoạt cảnh người mới đi từ cổng vào ghế; hiện là nhận danh tính cho NPC ngồi sẵn. Cần kiểm trực tiếp cảnh chùa đầy đủ, lưu phiên nếu cần, tối ưu thêm hiệu năng và hoàn thiện mẫu nhân vật.

Bản cuối đã build thành công (50,29s). Sau giảm tải phần nền, mở lại cảnh nhận đủ3tên/chỗ cũ, HUD ghi rõ THỬ/CHƯA NỐI TIKTOK và đã capture được ảnh `docs/live-seats-names.png`. Cảnh và dashboard được giữ mở; chỉ có dữ liệu demo, âm thanh chưa bật. Không coi capture thành công là benchmark hoặc nghiệm thu TikTok/OBS thật.
