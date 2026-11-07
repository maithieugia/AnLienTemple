# An Liên · TikTok LIVE Companion

Tool local độc lập với game, mặc định tài khoản **@mai.hoaithanh**. Không tự phát LIVE, gửi chat, đăng bài, đăng nhập hoặc thu tiền. Không thay save/gameplay hay đổi nhân vật trong chùa.

## Mở và sử dụng

1. Bấm `MO-TOOL-LIVE.cmd` trong thư mục dự án, giữ cửa sổ chạy. Hoặc `npm run live` với Node.js24. Khi chuyển máy: `npm ci`, `npm run build -- --emptyOutDir false`, rồi `npm run live`.
2. Bảng điều khiển: **http://127.0.0.1:5197/**. Bấm **Bật âm thanh**, chọn giọng Tiếng Việt, bấm **Nghe thử**. Trên máy hiện tại đã thấy Microsoft An — vi-VN qua UI. Giọng dùng Web Speech của trình duyệt/hệ thống; không có thuê bao TTS hay API key. Không khẳng định mọi giọng trên mọi máy hoạt động offline.
3. Mở OBS, quay cửa sổ game từ http://127.0.0.1:5196/?q=low&view=lay-assembly. Tool không tự chạy server game; mở game bằng quy trình hiện tại nếu5196 chưa chạy.
4. Thêm Browser Source **http://127.0.0.1:5197/overlay** lên trên nguồn game; nền trong suốt. Ngang1920×1080 hoặc dọc1080×1920. Overlay chỉ hiển thị, không phát TTS lần thứ hai. Giữ một tab điều khiển mở và thu âm thanh desktop/trình duyệt trong OBS. Nếu TikTok LIVE Studio có nguồn liên kết ở phiên bản đang dùng, có thể dùng overlay ở đó; chưa nghiệm thu LIVE Studio/OBS thực tế trong phiên này.
5. Mở phiên LIVE trên TikTok, rồi bấm **Kết nối LIVE**. Chỉ bấm kết nối sẽ tạo truy cập mạng TikTok và dịch vụ ký kết nối của thư viện. Nếu tài khoản offline, tool hiện rõ cần mở LIVE. Khi ngắt/mất kết nối dùng nút Kết nối lại; không có vòng thử vô hạn.
6. Thử một lượt thật của từng loại trước khi lên sóng chính thức. Nút thử có nhãn THỬ NGHIỆM, không gửi gì lên TikTok và không tăng số liệu thật.

## Hành vi

- Người vào: tên + “đã vào chùa, hoan hỷ đón chào”.
- Like: tên + “đã thả tim, công đức vô lượng”. Share: tên + “đã chia sẻ, công đức vô lượng”. Chuông nhẹ tổng hợp trước thông báo.
- Bình luận: tên và nội dung hiện ngay trong feed, tối đa5thẻ gần nhất trên overlay; tự ngắt dòng. Mặc định đọc lời nhắn, có thể tắt ở bảng điều khiển. Hiển thị tối đa280ký tự, đọc tối đa160ký tự nội dung.
- Tiếng nói đi tuần tự, tối đa12lượt chờ, bỏ lượt đợi quá25s; watchdog18s tránh một giọng đọc kẹt vô hạn. Join cùng người chỉ chào lại sau60s, like15s, share10s. Số tim thật vẫn cộng delta của mỗi gói sự kiện. Không đảm bảo đọc từng lượt khi quá tải; bình luận vẫn đi vào feed.
- Khóa Web Locks chỉ cho một tab điều khiển trong cùng trình duyệt/origin phát tiếng. Không khóa được giữa hai trình duyệt khác nhau; chỉ dùng một bảng điều khiển để tránh tiếng lặp.
- Có nút tắt tiếng, xóa overlay/dừng đọc, cài âm lượng/tốc độ, bật/tắt từng loại lời đọc, chặn @tài khoản. Mở overlay sau không đọc lại lịch sử. Cài đặt/số liệu/lịch sử giữ trong RAM của phiên server, không lưu chat xuống ổ đĩa; chọn giọng lưu localStorage trên trình duyệt. Cần nhập lại cài đặt sau khi tắt server.
- Server chỉ nghe127.0.0.1, kiểmHost/Origin, chỉ nhận JSON cho mutation, giới hạn request8KB/WebSocket1KB, lịch sử100event và cache chốngtrùng tốiđa2000key. Tên/bình luận luôn render bằngtextContent; không thực thi HTML từ chat.

## Kết nối và nguồn

`tiktok-live-connector@2.5.0`, **AGPL-3.0-only** theo package/LICENSE đã cài: https://github.com/zerodytrash/TikTok-Live-Connector . Giữ giấy phép và mã nguồn tool khi đóng gói/phân phối; không mô tả dependency này là MIT. Bản giấy phép lưu ở `live/LICENSE.connector.txt`. Đây là thư viện không chính thức, dựa vào dịch vụ Webcast và dịch vụ ký Euler Stream. Không phải API được TikTok bảo đảm ổn định; có thể thiếu sự kiện, bị giới hạn, đổi giao thức hoặc dịch vụ ký yêu cầu key/quota. Không tạo tài khoản trả phí, không cung cấp session/cookie/OAuth, không dùng authenticateWs hay gửi credentials cho bên ký. Không tự nâng cấp dịch vụ nếu free path bị chặn.

Adapter đang dùng đúng payload2.5: `member`, `like`, `share`, `chat`; `user.nickname/uniqueId`, `event.msgId`, `likeCount`, `comment`. Không xử lý gift/đổi quà thành điểm công đức. Câu “công đức vô lượng” là lời đáp mỹ thuật trên live, không phải sổ điểm tâm linh hay giao dịch.

## Xác minh 01/11/2026

- Checkpoint package/lock/Vite trước sửa: `authoring/checkpoints/20261101-live-tool`.
- Build TypeScript/Vite đạt: `docs/live-tool-build.log`. Test mới9/9đạt: `live-tool-tests.log`; toàn dự án79/79đạt: `live-tool-all-tests.log`. Các test kết nối dùng fakeconnector, không dùng LIVE thật.
- Kiểm normalization payload2.5, IDs chốngtrùng, like cooldown/đếmdelta, demo không tăngcount, giới hạn/chặnuser, HTTP→adapter→WebSocket đủ4loại, clear/settings, originvalidation, lỗi offline, connect xongmuộn sau cancel và timeout.
- npm audit sau cập nhật `ws@8.21.0`:0lỗhổng theo kết quả registry lúc kiểm (`live-tool-audit.json`). Fullsuite gồm online server của chùa vẫn đạt sau cập nhậtws.
- UI đã hiện bảng điều khiển, preview/overlay nhận tên/bình luận/sẻchia/tim có nhãn thử, số liệu thật vẫn0. Nhận được giọng Microsoft An vi-VN, giao diện đã vào trạng thái đọc rồi sẵn sàng. Chưa nghe/ghi âm thẩm định tiếng ra OBS hoặc kiểm cân âm chuông/TTS/kinh trong cảnh phát thật.
- Thử mạng thực tế @mai.hoaithanh: thư viện trả **UserOfflineError: The requested user isn't online**. Đã sửa mapping nhận diệnclass thực tế và câu lỗi này. Chưa có LIVE đang phát nên **chưa xác minh end-to-end sự kiện thật**, chưa chứng minh nhận đủ mọi lượt vào/like/share/chat, chưa nghiệm thu TikTok LIVE Studio/OBS, chưa test tải lớn nhiều giờ.
- Overlay/dashboard không tự mở cổng Internet hay tự phát lên tài khoản. Khi chạy OBS thật, người vận hành chọn nguồn âm thanh và bấm phát LIVE như quy trình đang dùng.

## Handoff kỹ thuật

`live/model.ts` xử lý event/settings/bounded history; `live/server.mjs` HTTP/WS, connector và lifecycle; `src/live/control.ts` dashboard; `speaker.ts` Web Speech/Web Audio/queue; `overlay.ts` lớp trong suốt. Vite thêm2HTMLentry, không import tool vào bundle gameplay. `npm run live` cầnNode24 vì server import sharedTS dùng striptypes.

Ưu tiên tiếp: nghiệm thu4sự kiện trong một phiênLIVE đang chạy và ghi âm OBS; đo tải thực và chỉnh nhịp chào/like; xác minh giọng sau khi khởi động lại máy; tùy nhu cầu lưu cấu hình riêng vào file. Không đánh dấu connector là production-ready khi chưa có kiểm nghiệm live thật.

Chốt UI: sửa việc chủ động Tắt/clear bị speechSynthesis báo canceled thành lỗi; clear bỏ tham chiếu utterance trước cancel, handler bỏ qua utterance đã hủy. Đã kiểm trạng thái Đã tắt âm thanh sau thao tác. Connector chủ động bỏ SIGN_API_KEY/SIGN_API_URL từ môi trường bằng SignConfig trước tạo client, không dùng key/quota trả phí máy có sẵn. 9/9test tool vẫn đạt sau sửa backend; build cuối đạt sau sửa speaker.

## Bình luận để ngồi và hiện tên

Đã có cảnh tương tác http://127.0.0.1:5197/live-seats?clean=1 . Bình luận đầu nhận ghế, `nam` / `nữ` chọn tóc, `rời chùa` trả chỗ; tên nằm trên đầu nhân vật trong cảnh quay. Xem [hướng dẫn và kết quả kiểm tra](LIVE_SEATS.md). Chưa nghiệm thu sự kiện TikTok LIVE thật.
