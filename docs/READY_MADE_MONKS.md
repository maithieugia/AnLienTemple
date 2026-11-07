# Nhân vật và áo dựng sẵn — 31/10/2026

Theo yêu cầu chuyển hướng khỏi nhân vật/áo procedural, đã tải hợp lệ qua nút Download của Sketchfab đang đăng nhập. Không mua, không dùng API trả phí, không upload ảnh hay dữ liệu dự án. Bản cũ giữ nguyên, chưa thay NPC.

## Đã lấy về

| Mẫu | Tác giả | Tam giác thực trong GLB | Bản tải | Rig / animation |
| --- | --- | ---: | --- | --- |
| Monk | creator424 | 33.692 | 22.415.436 byte, texture tối đa 2K | 0 / 0 |
| Character Model Buddhist Nun | YoungNorris2010 | 216.497 | 21.799.188 byte, texture tối đa 1K | 0 / 0 |

Nguồn chính chủ:
- https://sketchfab.com/3d-models/monk-a37a0ea77f654aee830920ed148ec0f2
- https://sketchfab.com/3d-models/character-model-buddhist-nun-b874783342f1445587cc58542c427ea6

Cả hai trang tải ghi CC Attribution 4.0, cho dùng thương mại khi ghi công. Giữ SOURCE.json (URL, tác giả, license, SHA256, số liệu) và CREDITS.md cạnh GLB trong public/assets/chars/ready-made. GLB giữ nguyên; viewer chỉ chuẩn hóa chiều cao 1,8m, vị trí để so sánh. Mẫu ni sư được tác giả mô tả dùng Adobe Fuse, Marvelous Designer, Substance Painter, Blender và 3ds Max. Không gọi mẫu ni sư là nam tu sĩ hoặc y phục Việt Nam đã được xác thực.

## Xem và tiếp tục

http://127.0.0.1:5196/monk-library.html — chọn mẫu, toàn thân/cận mặt/cận áo/sau lưng, kéo xoay 360 độ. Viewer riêng, không can thiệp main hay save. Vite checkpoint: authoring/checkpoints/20261031-ready-made-monks/vite.config.ts.

Kiểm nhị phân GLB xác nhận số lượng mesh, tam giác, texture, không có skin/animation. Build xem docs/ready-made-monks-build.log. Không coi việc tải được và build thành công là đã đạt mỹ thuật. Cần chọn hình dáng phù hợp, rig/weight áo, thử chắp tay/đi/ngồi, xử lý xuyên áo rồi mới tích hợp NPC. Mẫu ni sư cần LOD/texture cao hơn nếu được chọn để nhìn gần. Chưa kiểm mobile hay hiệu năng nhiều NPC.

Đã đối chiếu thêm Monk Robe by Tripo (https://sketchfab.com/3d-models/monk-robe-by-tripo-ccf60b86290544e992cd9b15cfbf2f99): trang ghi 1,9 triệu tam giác, tạo bởi AI, CC BY. Chưa tải/chưa tích hợp vì nặng và chưa có bằng chứng rig; không coi là áo game-ready.

Kiểm chứng cuối: TypeScript + Vite build đạt (31,91s phần bundling). Lượt đầu lỗi ENOTEMPTY khi Vite dọn dist/assets trên Windows; build lại --emptyOutDir false thành công, giữ file hash cũ. Máy chủ 5196 đã được khởi động lại. Đã xem trực tiếp Monk trong WebGL: mặt, áo, chất liệu hiện, pose gốc T-pose; ảnh docs/ready-made-monk.png. Không phát sinh rig hay animation từ việc import.
Mẫu ni sư cũng đã xem trong WebGL, chuyển mẫu thành công; console không có error trong phiên này. Ảnh docs/ready-made-nun.png. Chất liệu đỏ bóng cần rà roughness/metallic trước sử dụng; chưa xác nhận là chuẩn y phục Việt Nam. Không chạy lại toàn bộ test game vì không sửa gameplay; kiểm build + import thực tế.

## Mẫu chọn: Monk đỏ / vàng
Người dùng chọn Monk/creator424, đổi áo ngoài đỏ kẻ vàng. RedGoldKasaya.ts áp shader riêng lên material gasa, giữ nếp mesh/normal/roughness và áo trong/mặt. GLB gốc không thay đổi, vẫn giữ attribution. Build và xem WebGL đạt; ảnh docs/monk-red-gold.png. Chưa rig/animation/chưa thay NPC. Checkpoint authoring/checkpoints/20261031-red-gold-robe.
