# Tháp phía đông và bộ10nhà sư — 31/10/2026

## Tháp
Chuyển tâm từ(0,−305) về(480,20)m: bên hông đông chánh điện600×400m. Giữ18tầng/thuØ100→36m/10m mỗi tầng/3mái đỉnh. Mái lớn nhấtR56m cách tường đông tạix395m là29m; không đè lên chánh điện. Mở cổng hông rộng12m tại tườngđông,z14–26 và lối đá từx330 đến420. Sân tháp nối đến cổng, bệ kín xuống nền ngoài, không để sàn lơ lửng. Điểm đến/camera/cao độ thang theo STUPA tự đổi. Checkpoint: authoring/checkpoints/20261031-east-tower-monks.

## Bộnhà sư
-10mã riêng monk-01…10; đầu trọc (không gắn tóc/mũ), áo vàng và càsa đỏ phủ chéo, các ô vải kẻ vàng ánhkim. Loại các vạt/mũ của bộ thầy cúng gốc, thay bằng càsa phủ kín, tránh lớp vải trong đâm ra ngoài. Cao1.62–1.8m,3dáng mặt nền,5sắc da/áo/càsa. Đây là10biến thể trên cùng nền cơ thể, không phải10khuôn mặt được điêu khắc riêng, chưa có phê duyệt mỹthuật của người dùng.
-Cơ thể liền MinhV2/texture đã có trong Veilbound; khung xương/hoạtảnh Quaternius của thư viện hiện hữu. Giữ nguồn/ghi công từ ASSETS.md gốc. Không tải dịch vụ/tài nguyên mới hoặc trả phí. Bản thân càsa/UV/hoa văn do dựán tạo; áo được gán trọng số xương để theo tư thế. Chưa phải môphỏng vải.
-Màu áo dùng StandardMaterial để tương thích ánhsáng hiện tại; đườngvàng có màu/specular, chưa phải vậtliệu kimloại PBR riêng cho từng sợi.
-Dữ liệu: src/game/chars/MonkPlan.ts. Factory: new MonkLibrary(scene,low).load(), create(profile), update(dt), dispose(). Root metadata chứa monkId/role. Không sửa avatarngười chơi hay save.
-Main phân bổ10vịtrí trong sân trước chùa; chỉ tải thư viện khi vào gần sân, tạo nhânvật trong65m và ẩn ngoài90m để giảm tải cảnh lớn. Có nhãn vai trò trongdữliệu để tiếp tục vận hành; hiện chỉ hoạtảnh đứng, chưa AI làmviệc, hội thoại, lịch sinhhoạt hoặc đồng bộ NPC online.
-Viewer `/monks.html?q=low`: chọn từng mẫu, cậnmặt/càsa, xem cảbộ, thử chuyển đứng/đi tại chỗ. Dùng chung khungxương và clip với pilgrim. Đây là bộ runtime có nguồn, chưa xuất10fileGLB độc lập.

## Kiểm chứng / giới hạn
BuildTypeScript/Vite và41test đã đạt (east-monks-build.log/east-monks-tests.log); có kiểm10ID, trọng số da/xương, đủtexture và vịtrí tháp. Bản chỉnh vậtliệu cuối xem east-monks-build-final.log. Đã mởviewer10/10; phát hiện vậtliệu tối và sửa trước bàn giao. Đã xem đủ10/10 trong viewer, cậncàsa/đầutrọc và đổi Idle↔Walk; ảnh monks-ten-lineup.png, monks-kashaya-detail.png. Cảnh toànchùa tải chậm/ảnh canvas không xácnhận được trong phiên nhiều tab3D, nên không ghi là đã chơi trọn lối cổnghông. Đã đổi NPC main sang tải gần để giảm áp lực khởiđộng; chưa benchmark lại toànchùa.
Chưa kiểm hết10mẫu khi cúi/lạy/ngồi, chưa kiểm xuyênvải ở mọi clip, chưa cóbenchmark GPU/di động hay kiểm nguyênlộ trình đi từ chánhđiện sang tháp. Nguồnnhânvật từ cùng thư viện đangdùng nên mứcchitiết mặt vẫn cần anh duyệt.
