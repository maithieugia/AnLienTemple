## 05/11/2026 — Sông 80 m, tượng bên sông, sửa tháp và camera (ĐÃ LÊN SERVER)

Revision `2026-11-05-river-tower-camera-2`. Thay cả các bổ sung về tượng và các sửa tháp/camera trong cùng phiên. Đã có bản `-1` lên server trước khi anh Thanh yêu cầu nới sông; bản `-2` là bản cuối.

- Sông mở từ z600–640 thành z600–680 (40 → 80 m), chỉ dịch bờ ngoài về phía đường. Giữ bờ phía chùa và toàn bộ bậc xuống nước. Mặt nước −2,4 m, đáy −5 m. Cầu cong kéo dài từ 70 lên 110 m, nối z585–695, đỉnh vẫn +8 m; cập nhật trụ góc, toàn bộ nhịp lan can, mặt cầu/khối đá/vòm, lan can bờ ngoài, tuyến thử cầu và điểm vào game z705 trên sân khô. Không để người mới vào giữa mặt nước/cầu.
- Tượng Phật nằm vẫn cao 20 m, dời từ z540 tới z568, cùng hàng với bộ ba tượng phía tây và đối xứng tâm x150/−150. Tên mới: Nam Mô Bổn Sư Thích Ca Mâu Ni Phật. Tăng bảng tên tượng này lên 18 m để chứa danh hiệu dài.
- Tượng Bồ Tát tưới sen `new-18` rời chánh điện, ở x150/z640 giữa sông phía Phật nằm, chân mô hình ở mặt nước, cao 30 m tính từ mặt nước. Giữ nguyên model/vật liệu. Không dựng bảng tên 3D của tượng này (tên vẫn có trong danh mục chọn tượng). Cụm sen có lá cong khuyết mép, hai vòng cánh hoa, cuống và gương sen với các hạt; dùng mesh gộp, không mua asset. Điểm lễ của phật tử nằm trên bờ z594, không bố trí người quỳ dưới sông. Đồng bộ placements.json cho lần tái sinh source sau.
- Biển Thiên Vương rộng 16 m, tự giảm cỡ chữ theo tên; vị trí theo mặt phẳng đỡ của bệ vuông thay vì đặt trên đường tròn nội tiếp. Trước đây bảng nghiêng chui một phần vào bệ nên mất chữ. Đã xem cận một bảng đầy đủ tên trong QA. Giữ thứ tự danh hiệu đã được anh Thanh chỉ định, không suy đoán lại pháp khí.
- Bỏ biển Vườn bồ đề. Biển CHÁNH ĐIỆN rộng 90 m (trước 30), tâm x0, chân bảng y42 (trước 38), áp mặt trước z201 để tránh lẫn vào tường. Chưa kiểm tra cận bảng lớn trong bản cuối online.
- Chân tường tháp: hai dải tường vàng và chân đỏ trước đây vẽ trùng mặt; nay chia tại cao độ 0,9 m, tắt nhận bóng động trên phần đỏ; tách mặt sân/ring tầng trệt. Lối nối từ hiên đến tháp có nền liên tục và hai hàng lan can đá, thu từ nửa rộng 12 về 6 m ở cửa vào sân tháp; có collider, chừa tâm lối đi. Sửa normal mặt nền nối để không bị tối do quay xuống.
- Biển tầng có hai mặt chữ riêng với thứ tự UV đúng cho camera Babylon trái tay, bật back-face culling; không hiển thị một mặt chữ lật gương khi đi từ hướng ngược lại. Hai kiểm tra hình học hướng đọc/cách mặt nền đã đạt.
- Khi ở gần thang máy hiện nút Chọn tầng thang máy giữa màn hình; bấm mới mở bảng tầng. Đã thao tác thực trên trang tháp: chọn tầng 2 từ tầng 1, đến chân 10,00 m, trạng thái tầng 2/18. Giữ lối ra đối diện thang bộ và toàn bộ chặn an toàn cũ.
- Cư dân ngắm cảnh dừng 5–10 s, kể cả các khoảng dừng giữa chặng và lần thử lại sau khi không tìm được đường. Các nghi lễ/ngồi nghe pháp giữ thời lượng cũ; không tự tăng từ 200 lên 500 cư dân.
- Camera cận mắt: nhấn C hoặc nút đổi góc nhìn, chỉnh FOV 35–100° và độ cao 0,6–3,2 m, cuộn chuột để zoom. Thiết lập lưu localStorage, có đặt lại; trở về góc ngoài khôi phục FOV/khoảng cách trước đó, nhân vật vẫn ẩn trong góc cận mắt. Đã thử trên HTTPS giá trị 2,2 m / 50°, rồi đặt lại và trở về góc ngoài. Nút Camera được tách khỏi hàng nút dưới trên desktop để tránh đè các nút nghi lễ; chỉnh bố cục cuối chưa chụp lại do browser chậm.

**Đã kiểm chứng:** TypeScript/public build đạt. 41 kiểm tra của bản đầu đạt; sau mở sông, 34 kiểm tra liên quan đạt, cộng 2 kiểm tra mặt biển và normal nền nối đạt. Log: docs/river-tower-camera-tests-final.log, river80-tests-final.log, sign-faces-tests.log, river80-typecheck.log, river80-build.log. Kiểm tra cầu đi/chạy hai chiều, bậc xuống nước, điểm sinh trên sân khô, vị trí tượng trong lòng sông và điểm quỳ trên bờ đều đạt. Đã xem trực tiếp tượng tưới sen/cụm sen, Phật nằm/danh hiệu và bảng Thiên Vương ở bản local trước khi nới sông; game HTTPS mở và điều chỉnh camera được ở bản -1.

**Chưa kiểm chứng / việc tiếp tục:** Trình duyệt kiểm tra mất phản hồi trong lần mở bản sông 80 m, nên chưa chơi lại toàn bộ bản -2 bằng chuột, chưa có ảnh trực tiếp sông 80 m/bảng tên đã bỏ, chưa đo FPS hay rà mọi góc ở đồ họa Cao/mobile. Không khẳng định mọi dạng bóng đen/nhiễu đều hết trên mọi GPU. Ảnh docs/river-lotus-statue-local.png và reclining-riverfront-name.png ghi nhận giai đoạn trước yêu cầu bỏ bảng/nới sông; không dùng làm bằng chứng hình ảnh của bản cuối. Ảnh heavenly-king-full-name.png xác nhận tên không bị cắt; eye-camera-controls-production.png xác nhận điều khiển camera. QA local có river-shrine.html, chưa xuất bản trang này.

**Deploy:** chỉ cập nhật app/src, JS/HTML và release, giữ model/texture nén/cache; manifest sinh lại từ file server. Không mua tài nguyên hoặc gọi dịch vụ trả phí. Checkpoint: authoring/checkpoints/20261104-tower-camera, 20261105-river-statues, 20261105-river80. Sao lưu server `/root/anlien-backups/2026-11-05-river-tower-camera-2-20261105T000853Z`. Số liệu sau triển khai: `{"users": 5, "merit": [44, 20, 67, 474]}`; script kiểm tra tài khoản/công đức không giảm. Log docs/river80-deploy.log, kiểm tra runtime server docs/river80-server-verification.log. Chỉ restart anlien-server, không đổi các ứng dụng khác/Caddy.

Game: https://dichua.palo.io.vn/?q=low&revision=2026-11-05-river-tower-camera-2

## 04/11/2026 — Đổi tên tượng, mở chánh điện, ngói lớn (ĐÃ LÊN SERVER)

Revision `2026-11-04-open-hall-statues-1`. Đã cập nhật trực tiếp dự án AnLienTemple và server dichua.palo.io.vn. Checkpoint trước sửa: `authoring/checkpoints/20261104-large-yinyang-tiles` và `authoring/checkpoints/20261104-hall-statue-layout`.

- P1 A Di Đà; P2 Thích Ca Mâu Ni; P3 Dược Sư (sửa chính tả từ yêu cầu “Dượt Sư”); P4 Tỳ Lô Giá Na; P5 Đại Nhật Như Lai; P6 A Súc Bệ. Giữ nguyên asset, kích thước và vị trí của sáu tượng. Bốn file Thiên Vương lần lượt mang bốn tên Đông Phương Trì Quốc, Nam Phương Tăng Trưởng, Tây Phương Quảng Mục, Bắc Phương Đa Văn theo thứ tự người dùng đưa; chưa đối chiếu lại pháp khí từng file để xác nhận danh tính tạo hình.
- `new-19`: Thiên Thủ Thiên Nhãn Đại Bi Quán Âm, cao 60 m, footprint tăng tỷ lệ theo chiều cao, vẫn ở giữa hai Thiên Vương phía đông. Bỏ cột/xà/mái che riêng của tượng này và Phật khất thực; giữ nền, vị trí và vật liệu gốc.
- Dỡ toàn bộ sàn tầng hai, cầu thang lên tầng hai, lan can tầng hai, viền sàn sau và la phông/vòm trần giả. Giữ mái thật, mặt dưới mái và kết cấu đỡ mái. Không gian chánh điện thông lên mái 100 m; tượng chính giữ 80 m. Các trường LEVELS.upper/lowerHeight/upperHeight và VAULT còn lưu làm mốc cũ cho tường/phù điêu/tính bao, không có nghĩa còn sàn hoặc trần giả. `sanctuaryUpperPieces()` và `SANCTUARY_STAIRS` nay rỗng. Nút thử thang cũ ẩn để tránh truy cập mảng rỗng.
- Sáu tượng thượng điện chuyển ra hiên có sẵn: x ±310 m, z −138 / −66 / 78 m; chân bệ từ sàn hiên 1,2 m. Giữ các ID d04/d06/d01/d02/d09/d05, tên API upper-* và vật liệu hiện có để không phá dữ liệu. Bàn thờ, nhang và bảng tên đi theo vị trí mới. Cập nhật nhãn UI “Tượng hai bên hiên”. Bốn bệ trống không còn tượng hoặc model thay thế được bỏ cả mesh và collision; các bệ có tượng giữ lại.
- Bỏ các cành/hoa trang trí của helper bàn thờ dùng chung cho toàn khuôn viên. Giữ bình, đèn, bộ lư và nhang; không xóa hoa sen thuộc điêu khắc tượng.
- Ngói âm dương lớn: dựng lại main roof bằng Blender, khoảng cách ống ngói 4,8 m trong model nguồn, texture màu đất cam ít tương phản/ít bóng. Mái procedural cổng/tháp/hành lang dùng UV theo mét, cặp ngói 2,4 × 1,8 m. Cổng có ống ngói cách 2,4 m. Bốn sân tròn trục cổng/đài A Di Đà/hai bên được lát ô vuông 2,4 m theo tọa độ thế giới, mặt lát +0,07 m tránh trùng mặt nền, không kéo texture thành múi.
- Tìm ra low-LOD cũ giảm các quad rời của mái thành lỗ, lộ mặt dưới tối tạo sọc. Xuất lại low giữ nguyên mặt ngói/mặt dưới, chỉ giảm chi tiết còn lại; thêm ngoại lệ trong blender_build.py và script reexport-roof-low.py để tái lập. High 733.180 tam giác (trước 1.105.820), low 210.493; hai GLB runtime nén khoảng 18,9 MB tổng. Giữ normals nguồn theo phép đổi cao độ, bỏ tangent/normal map cũ trên ngói nhập, nới khoảng cách mặt dưới và dùng chiếu sáng hai mặt. Các nhịp ngói hình học vẫn có thể alias ở góc rất xiên/xa; chưa thể khẳng định hết nhiễu trên mọi GPU.

**Đã kiểm chứng:** TypeScript không lỗi; public build thành công (cảnh báo chunk/import tĩnh-động sẵn có). 44/44 kiểm tra kiến trúc, layout, tượng, collision điểm lễ, cầu/cổng và UV sân tròn đạt (`docs/open-hall-tests-final.log`). Đã xem local ngói mái, sân lát và tượng 60 m không mái che. Đã vào game HTTPS bằng phiên đăng nhập hiện có; không thấy console error trong lượt kiểm tra. Manifest của cả hai GLB mái khớp hash file thực tế trên server (`docs/open-hall-manifest-verification.log`).

**Chưa kiểm chứng / còn lại:** Chưa đi bộ rà hết hiên và mọi bàn thờ sau di dời; chưa đo FPS hoặc thử dài trên máy anh Thanh/mobile. Cảnh đầy đủ tải và tương tác chậm trong môi trường QA; không coi ảnh preview hoặc số FPS khi nhiều tab là benchmark. Kiểm tra chi tiết không gian trong nhà online còn hạn chế; các điều kiện không còn slab/stairs/bệ rỗng đã kiểm bằng mã/test. Không thêm tài nguyên trả phí. 200 cư dân hiện hành, 18 tầng tháp và dữ liệu tiến độ giữ nguyên. File generate-layout.py nay đọc placements.json đã đồng bộ từ runtime, không chạy lại layout hardcode cũ làm hồi quy vị trí.

**Deploy:** overlay thay JS/HTML, source và hai model mái, giữ các asset nén/cache/SW khác; sinh manifest từ file server. Chỉ restart anlien-server. Backup `/root/anlien-backups/2026-11-04-open-hall-statues-1-20261104T150847Z`. Health OK; users 5, tổng merit [40,5,36,449] trước/sau không đổi. Log `docs/open-hall-deploy.log`; script `deploy/update-open-hall-statues.sh`. Ảnh `docs/thousand-arm-60m-local.png`, `docs/large-yinyang-main-roof.png`, `docs/round-plaza-square-paving.png`, `docs/open-hall-production-game.png`.

Game: https://dichua.palo.io.vn/?q=low&revision=2026-11-04-open-hall-statues-1

## 04/11/2026 — Nền dịu mắt và ba lớp mái (ĐÃ LÊN SERVER)

Revision `2026-11-04-calm-floor-roofs-1`. Nền chánh điện và sàn tầng trên dùng màu be xám đồng nhất, ô 2,4 m (trước 0,6 m), ron nhẹ, specular 0,045; bỏ hoa thị, ngôi sao và hạt tương phản. Không đổi cao độ hay va chạm sàn. Texture 512 px dùng chung, không thêm mesh từng viên. Mức giảm mỏi mắt/chóng mặt cần anh Thanh tự trải nghiệm, chưa được xác nhận trên thiết bị của anh.

Sửa ba mái đỉnh tháp: tầng cuối dừng tường ở +6,7 m, cột/xà ở +6,35 m. Ba mái có mép ở cao độ 176,8 / 178 / 179,1 m, thu bán kính từ 25,5 → 19 → 12,5 m; giảm đầu đao tương ứng, đỉnh vẫn 180 m. Trước đó mái bị tường và xà cố định +8,5…9,35 m che/xuyên qua. Cột/xà các tầng khác cũng hạ khớp mép mái. Giữ 18 tầng, 1.632 bậc, cửa, thang máy và chặn cuối.

Tam quan có ba mái rộng 56 / 46 / 34 m, sâu 22 / 17,5 / 12,5 m, chân mái 18,1 / 23,2 / 27,5 m, đỉnh khoảng 31,1 m. Thêm mặt dưới, diềm dày 0,45 m; sửa normals mặt mái và ống ngói riêng ở cổng để tránh tối đen. Lối vào/cầu/cột/bảng tên vẫn giữ vị trí.

Checkpoint `authoring/checkpoints/20261104-calm-floor-triple-roofs`. TypeScript/public build đạt; 16 kiểm tra cầu/cổng/tháp đạt. Đã xem local nền mới, mái tháp và cổng ba lớp; browser HTTPS xác nhận cổng ba mái, không console error. Ảnh: `docs/calm-hall-floor.png`, `stupa-three-roofs-restored.png`, `tam-quan-three-roofs.png`, `tam-quan-three-roofs-production.png`. QA thêm nút Mái tam quan trong entrance-river.html; chỉnh góc cận mái đỉnh trong stupa-preview. Chưa chơi lại toàn cảnh online, chưa đo FPS/mobile hoặc xác nhận cảm giác khi di chuyển lâu. Không thêm tài nguyên mua ngoài.

Đã deploy overlay giữ nguyên model/texture nén, cache/SW, sinh manifest từ server; runtime EntranceRiverPlan cũng được cập nhật. Health đạt; tài khoản 5, merit [40,5,36,449] được giữ. Backup `/root/anlien-backups/2026-11-04-calm-floor-roofs-1-20261104T142916Z`. Log `docs/calm-floor-roofs-deploy.log`; script `deploy/update-calm-floor-roofs.sh`. Game: https://dichua.palo.io.vn/?revision=2026-11-04-calm-floor-roofs-1

## 04/11/2026 — Tượng 80 m, mái 100 m, tháp 18 tầng / 180 m (ĐÃ LÊN SERVER)

Revision `2026-11-04-compact-sharp-1`. Checkpoint: `authoring/checkpoints/20261104-compact-temple`.

**Kích thước:** Tượng chính (gồm hào quang và đài sen) cao 80 m, chân bệ ở 5,8 m, đỉnh ở 85,8 m. Bệ thu nửa cạnh từ 53 xuống 27 m; bàn thờ, điểm nhang và va chạm lấy theo plan. Chánh điện giữ diện tích 600 × 400 m, thông tầng và 5 lớp mái. Hai tầng cao 30 m, sàn trên 31,65 m, mép mái 61,3 m, đỉnh cao nhất 100 m. Trần vòm cuối 92,8 m. Đổi hình học mái/cột khi tải, tính lại normals; không sửa GLB nguồn. Tượng thượng điện, hàng phù điêu và collision tường đồng bộ chiều cao mới (6 hàng mỗi tầng thay 10).

**Tháp:** 18 tầng, sàn cách nhau 10 m, sàn cuối 170 m, đỉnh 180 m. Có 1.632 bậc, 3 lớp mái đỉnh, chặn cuối thang, thang máy 1–18. Giữ 8 tượng mỗi tầng, tổng 144; danh sách 288 tên gốc vẫn lưu để tái dùng. Các điểm tham quan và đường NPC dùng số tầng mới. Giữ 200 cư dân nam/nữ do Claude vừa chỉnh.

**Độ nét và tải dựng:** Bỏ cơ chế hạ độ phân giải tới 2,2 lần mỗi 0,7 giây. Giới hạn cạnh dài 2.304 px (Cao), 1.600 px (Nhẹ); DPR tối đa 1,5 / 1,25. Desktop 1.920 px ở mức Cao giữ ít nhất một pixel trên mỗi pixel CSS. Chỉ đổi sau 3 giây, bước 4%, có vùng FPS ổn định và mức giảm tối đa 12% / 25%; bỏ thời gian tải dài và tab ẩn khỏi phép đo. Tăng anisotropy tối đa 8 theo GPU; tắt preserveDrawingBuffer ở cảnh chính. Giảm số tầng, tượng và hàng phù điêu giúp giảm tải. Chưa có số đo trước/sau đủ điều kiện để cam kết FPS.

**Đã kiểm:** TypeScript và public build đạt. 32 kiểm tra kiến trúc/tháp/visitors/tượng/scale đạt; 14 kiểm tra hall/relief/scale đạt; 9 kiểm tra online-server đạt. Browser local đo mái 100,00 m, xem tượng không cắt hào quang; đi đủ 1.632 bậc lên tầng 18 và đi thang máy xuống tầng 1 về 0 m. Browser HTTPS xác nhận tháp 18 tầng, 180 m và 144 tượng, không có console error. Ảnh: `docs/compact-hall-buddha.png`, `compact-stupa18.png`, `compact-stupa18-production.png`. Cảnh tháp Low có 435.288 tam giác kiến trúc / 11 mesh, chưa cộng tượng và NPC.

**Chưa kiểm / còn lại:** Chưa chơi lại toàn cảnh online sau deploy, chưa benchmark cùng camera và thiết bị trước/sau, chưa đo điện thoại. Fullscene localhost tải và bake tài nguyên chậm khi nhiều tab 3D cùng chạy; không dùng FPS trong ảnh preview làm cam kết hiệu năng. Cần profiling tiếp phần khởi tạo crowd, mái và tường trên thiết bị thật nếu còn lag. `compact-hall.html` / `src/compact-hall-preview.ts` là QA riêng ở local, không phải cảnh gameplay đầy đủ và không thêm vào public build.

**Deploy:** Overlay trên bản đang chạy, giữ tài nguyên Meshopt/WebP, cache và SW; manifest sinh từ file thật trên server. Script `deploy/update-compact-temple.sh` sao lưu app, web, SQLite rồi cập nhật runtime plans và khởi động lại riêng anlien-server. Health đạt; 5 tài khoản và công đức [40,5,36,448] trước/sau không đổi. Backup: `/root/anlien-backups/2026-11-04-compact-sharp-1-20261104T141443Z`. Log: `docs/compact-sharp-deploy.log`. Không mua tài nguyên hoặc gọi API.

Game: https://dichua.palo.io.vn/?q=high&revision=2026-11-04-compact-sharp-1

## 04/11/2026 — Sân/cầu/lối tam quan lát đá hoa cương (ĐÃ LÊN SERVER)

Revision 2026-11-04-entrance-granite-1. Lát đá hoa cương xám bạc, ron sẫm và viền vát sáng; ô 1,2m, atlas 4x4 ô/1024px, UV theo tọa độ chung trên sân và mặt cầu cong. Bao phủ sân ngoài z640–710, mặt cầu, lối nối z554–585 và chiếu bờ trong. Giữ cao độ/collision và bậc xuống nước. Texture lập trình có hạt khoáng, không mua asset. Một material/texture dùng chung, giải phóng khi dispose; không dựng hàng nghìn viên mesh. Bỏ twoSidedLighting để tránh đảo pháp tuyến gây đen. Checkpoint authoring/checkpoints/20261104-entrance-granite/EntranceRiver.ts.

Đã kiểm: TypeScript đạt; public build đạt (docs/entrance-granite-build.log); 6/6 entrance-river tests đạt. Browser local xem cận cả 3 vùng; route z680→552 đạt đỉnh8m/chân0m/“Đã qua cầu, vào cổng”. Browser HTTPS entrance-river.html thấy mặt cầu kẻ ô, không có console error. Ảnh docs/entrance-granite-close.png, entrance-granite-bridge.png, entrance-granite-gate.png, entrance-granite-production.png. Chưa đo FPS/mobile, chưa chơi lại toàn cảnh 500NPC hoặc nhiều tài khoản; ảnh QA là cảnh riêng nhưng renderer được dùng chung trong Sanctuary/game chính.

Deploy web overlay giữ nguyên toàn bộ GLB/texture nén trên server, sinh lại manifest từ file thực tế, giữ chunk cũ/cache/SW; không thay DB/server process. Health ok, online1. Backup /root/anlien-backups/2026-11-04-entrance-granite-1-20261104T135344Z. Script deploy/update-entrance-granite-web.sh. Trang thử có nút Sân lát đá / Mặt cầu lát đá / Lối vào tam quan. Game: https://dichua.palo.io.vn/?view=entrance-river&revision=2026-11-04-entrance-granite-1 .

## 03/11/2026 — Rodin qua giao diện web, không dùng API

Theo yêu cầu mới, dừng API và thao tác trực tiếp tab Rodin đã đăng nhập. Đã thấy model nữ áo bà ba tím, quần đen, tóc dài tại https://hyper3d.ai/workspace/rodin/9f6f5a21-a8ae-4828-8e70-a1fa48fdcbe5. Đã tạo skeleton Human; ví hiển thị 1.5 credit so với 2.5 trước đó (chênh 1 credit). Không mua gói/nạp tiền. Chỉ tạo một asset, không retry generation tính phí.

ĐÃ KIỂM: hình model trên web; skeleton Hips/Spine/Head/LeftArm/LeftForeArm/LeftHand và chân đối xứng; preview Walking bị co rút vai/tay và biến dạng thân. Đổi Shell sang Core trên UI nhưng preview vẫn lỗi. Không đạt tiêu chuẩn thay nhân vật. Ảnh bằng chứng web-result.png trong thư mục asset.

CHƯA KIỂM/CHƯA XONG: tải GLB. Export trên UI từng báo Packing 95%, công cụ chờ download hết hạn hai lần, chưa nhận đường dẫn file; không khẳng định file đã tải. Không coi dialog NSFW có trong DOM ẩn là thông báo đang chặn vì screenshot không hiện dialog đó. Cần hoàn tất tải bằng nút Download, kiểm bind pose/weights và sửa vai trước khi tích hợp. Chưa thay player, chưa deploy. Dùng UI tiếp, KHÔNG chạy run_baba_player.py/API theo chỉ dẫn cũ bên dưới.

## 03/11/2026 — Nhân vật nữ Việt Nam áo bà ba (CHƯA CÓ3D: API Rodin bị chặn)

Yêu cầu mới thay pilot tượng/nhà sư bằng cô gái Việt Nam trưởng thành tóc dài mặc áo bà ba. Đã chuẩn bị generation Gen-2.5High/Quad50k/PBR/GLB/A-pose và rig human/core walking/running/happy_idle, ngân sách tối đa1credit, không nạp thêm/không paid retry tự động. API trả HTTP201 nhưng error=API_NO_ACTIVE_SUBSCRIPTION; không có UUID, không có job3Dđược chấp nhận, consumed0. Không coi HTTP201là thành công. CUA browser timeout nên không tạo thay bằng website được. Cần tài khoản có quyền/gói API hoạt động hoặc công cụ web kết nối lại; không tự mua gói.

Đã tạo ảnh2Dtham chiếu bằng imagegen tích hợp: authoring/rodin/vietnamese-baba-player/reference-front.png, áo bà ba tím nhạt/quần đen, tóc đen dài gọn sau vai, A-pose tay/tay áo liền. Đây KHÔNG phải model3D/GLB/nhân vật chơi được. Đã xem ảnh; chưa kiểm mesh/rig/animation vì chưa có3D. Chưa thay nhân vật game/chưa deploy. Không ảnh hưởng thay đổi shader/CPU/camera/áo dài/mobile/APK Claude đang làm.

Client authoring/rodin/run_baba_player.py nhận key bằng getpass, không ghi key vào repo/public/log; riêng task state *.private.json bị .gitignore. generation-image.json ưu tiên ảnh đã tạo, generation.json là prompt text dự phòng; rigging.json lưu clip hiện có theo tài liệu (human_sp/*). Không dùng lại human/Walking cũ. Script có resume job, không tự gửi lại POST có kết quả không rõ, dừng khi API từ chối, chỉ cho phép tải artifact HTTPS không gửi key sang CDN. Hồ sơ/prompt/imagegen provenance trong thư mục asset. Khi được mở quyền API hãy tiếp tục tạo, kiểm mô hình/skin/cloth/clip, làm LOD và viewer trước khi tích hợp RocketboxPlayerLibrary; bone names hiện tại Bip01 cần mapping với rig Rodin. Không nói đã tạo/gắn xương/đưa game khi mới chỉ có concept2D.

## 03/11/2026 — Chữ kinh luân nhỏ10lần (ĐÃ LÊN SERVER)

Revision `2026-11-03-wheel-small-script-1`. Rows72→720, phrasesPerRow20→200: chữ theo cảhai chiều còn1/10, số cụm trên thân mỗi trụ1.440→144.000. Repeat UV albedo/normal, không tăng atlas/số mesh; giữ câu Sanskrit, chữ UI, hình trụ và xoay/công đức. Checkpoint authoring/checkpoints/20261103-wheel-small-script. 9/9test đạt, TypeScript/public build đạt. Đã kiểm JS/static web trên server có rows720/phrases200, main/shared chunk khớp manifest đang phục vụ, localhost health đạt. HTTPS verifier gặp timeout IPv6 nên chuyển kiểm server trực tiếp; chưa kiểm hình browser/FPS. Claude build đồng thời nên so theo manifest server, không theo dist-public đang được thay mới. Giữ3users, merit[35,2,33,446]. Backup /root/anlien-backups/2026-11-03-wheel-small-script-1-20261103T142350Z. Log docs/wheel-small-script-*.log/json; overlay pack-wheel-script.mjs giữ nén/cache/SW/manifest và source PrayerWheelPlan server.

## 03/11/2026 — Vật liệu gốc, tượng10m, bộ ba50m, tháp màu và nơi hành lễ (ĐÃ LÊN SERVER)

Revision `2026-11-03-original-statues-1`. Checkpoint trước sửa: `authoring/checkpoints/20261103-original-statues`. Bỏ override triadGold cho toàn bộ20tượng owner-collection20: giữ PBR/material/texture được nhập từ file ở cả3LOD, kể cả viewer owner-collection.html. Bộ20tượng đều cao10m theo hàng6tượng (bao gồm tượng nghìn tay trước đây100m, khất thực20m và Di Lặc cổng7m). Bốn Thiên Vương50m, Phật nằm20m, tượng tháp5m và Phật chính160m không đổi.

Sáu vị thiên về hai hành lang có sẵn, x±358, z278,46/359,69/440,92; cao10m, chân bệ0,92m. Hành lang nâng eave14,5/ridge18m, có sàn walkable0,12m và bệ vừa footprint; bỏ các bệ tượng cũ trống gây lộn xộn. Hai tượng riêng x300,z380 và x380,z160 giữ mốc vị trí, có đình nhỏ bốn mặt thoáng, mái ngói/cột tròn/sàn0,12m. Các tượng Bồ Tát trong điện cao10m, bệ tự nới theo footprint như trước. generate-layout.py đã cập nhật quy cách mới, placements.json cùng dữ liệu.

Bộ ba phía trước cao50m; tâm Thích Ca(-150,568), hai bên x≈-181,75978/-118,51755, giữ khoảng mép3m. Vẫn chất liệu vàng24k theo yêu cầu riêng trước đó, điều chỉnh roughness/metallic/emission/fill để giảm sẫm. Tượng vườn không nhận shadow map ở cả3LOD, tránh chuyển màu/bầm khi nâng mức đồ họa; vẫn giữ hình học/normal và bóng trên cảnh nền. Không áp màu/emissive mới lên vật liệu bộ20tượng gốc. Nhãn và camera xem bộ ba đã đổi50m.

Tháp: mái #ef852b cam, tường #efd068 vàng, mặt dưới mái #9c2923 đỏ, alpha1/two-sided và không lấy texture xám làm bẩn màu. Mỗi tầng vươn mái thêm3m, hai mái đỉnh cũng rộng hơn. Giữ36tầng/500m, thang/lan can/thang máy và sàn chặn tầng36.

Phật tử: đủ27tượng ngoài sân đều có ít nhất2điểm hành lễ ban đầu (trong80người khu tượng), kèm54đệm vàng. Bổ sung bộ ba và Phật dưới bồ đề vào danh sách, tránh bàn hương/bệ/cột và xử lý riêng vị trí trước Phật nằm. Sau đó đổi người/hoạt động; người cuối của điểm lễ chờ có người khác mới rời. Chu kỳ3lạy→quỳ nghỉ→chắp tay, lệch pha cá nhân; thêm kneel cho LOD xa. TempleLife500 bật update sớm khi renderer đang tải lần lượt các bộ trang phục, thay vì giấu cả500đến khi xong toàn bộ. Không reset nhân vật người chơi, đồ áo dài/UI mobile/APK hoặc hệ nén/cache Claude vừa thêm.

Đã kiểm:37/37test hồi quy tượng/kiến trúc/tháp;4/4test mới (đủ20cao10m/bộba50m,27điểm có2người/54đệm, renderer thật giữ đúng object material+texture cả3LOD bằng NullEngine, không chạm bệ/tượng/cột/bàn hương);4/4test chọn lọc mô phỏng500người/đường đi/cây đạt. TypeScript và public build đạt. Kiểm renderer là test dữ liệu/vật liệu với NullEngine, không phải ảnh render GPU. CUA vẫn timeout, chưa nhìn/chơi trực tiếp được; chưa xác nhận thẩm mỹ màu cuối trên GPU, toàn bộ500người xuất hiện trong game thật, FPS/mobile hay chu kỳ nhiều giờ. Không tuyên bố hết lag/hoàn toàn giống thật.

Server: health200, main `main-Cyqgy5kP.js`, SHA256 `b48e3cb249a2acb003e588b8cf6f9d2222407fa71ec857e2378346334e1d2ec0`. Model60LOD mới +9bộba +3tháp +7far sân và các chunk liên quan khớp dist-public nén. Manifest `c59899927b25`,621file,0mismatch. Giữ3tài khoản và công đức[35,2,33,446]. Backup `/root/anlien-backups/2026-11-03-original-statues-1-20261103T135333Z`. Gói overlay nén57,32MB, script pack-original-statues.mjs dùng dist-public, kèm SW/manifest/decoder và kiểm hash manifest. Full baseline nén đã có thay đổi Claude; không ghi đè bằng GLB thô public/. Nguồn ZIP và vật liệu gốc không sửa.

Log/chi tiết: `docs/statue-original-*.log/json`, `docs/STATUE_ORIGINAL_LOOK.md`. Tiếp theo cần chơi thật q=low/high, nhìn bản gốc/triad trong ánh sáng cao, kiểm hành lang/sàn/đệm và theo NPC. Trước khi nghiệm thu hình ảnh phải kiểm trong trình duyệt; không dùng test headless thay cho kết luận mỹ thuật.

## 03/11/2026 — Tháp sát sân, an toàn tầng36, phật tử tham quan và sân sau (ĐÃ LÊN SERVER)

Revision `2026-11-03-campus-visits-1`. Checkpoint trước sửa: `authoring/checkpoints/20261103-campus-visitors` (world/chars/main/release/status). Tháp dịch (480,20)→(480,240), ngang mép trước hiên z238. Cửa rào đông và lối sân nối tháp dịch theo; lối hông vòng x389 tránh Phật khất thực. 288 tượng giữ danh hiệu/cao5m/hướng ra ngoài, lùi tâm3m về phía trong. Nới chiếu nghỉ và khoảng mở lan can để còn đi hai bên tượng trên tầng cao.

Tầng36 bổ sung sàn kín nửa lỗ xoắn không còn nhịp đi lên, giữ nửa xuống thang; thêm thanh chắn hiển thị và collider thật ở cuối. Sàn nối đúng mép, tránh chồng mặt. Thang máy gọi/chọn tầng trong vùng nội thất bán kính18m của mọi tầng, kể cả tầng trệt; vẫn có đóng/mở cửa và đưa ra phía đối diện thang bộ.

500 phật tử giả lập dùng TempleLife500 + TempleVisitPlan mới: lựa điểm theo từng người, tốc độ1,12–1,46m/s (không chạy), giờ đến/nghỉ không đồng bộ; có ghé tượng ngoài sân, lễ nhang gần lư mới, nghe pháp, đi vườn sau, lên các tầng tháp và dừng ngắm mây ở ban công. Có cả hai chiều trên hiên/ban công, dừng/nhường đường/đi tránh người rồi tiếp tục; không còn khởi động vòng hiên bất tận trong TempleLife500. Lộ trình tháp qua cửa bên tượng, chiếu nghỉ và từng bậc, không nội suy xuyên tầng. Người đang nghe pháp ở300–600giây; ngắm cảnh/lễ/đi dạo có thời gian khác nhau. Nhang cầm tay và đầu đỏ dùng chung batch, không cộng công đức giả. Tính năng đệm nghe pháp/người chơi/132 sư/tóc gốc giữ nguyên.

Sân sau có3lối: hai cửa x±290 và cửa giữa x0 rộng24m, bậc giữa rộng28m; mở cả lớp phù điêu/collider tường, bỏ cột chắn lối và nối đường vườn sau. Có118cây PBR trong đất trồng (54phía sau); dùng chung footprint lát nền/sỏi để loại cây mọc từ nền đá, bổ sung hai hông. 13hòn đá cảnh có vật cản không leo/xuyên được.

Đã kiểm: lần đầu152test có150đạt, 1test còn đòi vị trí tháp cũ và1test mạng timeout khi chạy đồng thời. Cập nhật điều kiện vị trí, chạy riêng monks+online10/10đạt. Sau chỉnh chiếu nghỉ/rail:57/57test liên quan đạt; rà lối cây/nền/đường tránh tượng thêm3/3đạt. Có kiểm đủ3360bậc lên/xuống, đường qua cả288vị trí tầng với kích thước cột/tường/tượng và rail giải tích, vùng gọi thang36tầng. Controller500người chạy40giây mô phỏng, asset/renderer được mock: không teleport, lịch/điểm khác nhau. TypeScript/public build đạt. Đây không phải chứng nhận đồ họa/FPS thực tế.

Server đã phục vụ đúng bundle mới, health200. Giữ3tài khoản, công đức[35,2,33,446]. Backup của lần cập nhật: `/root/anlien-backups/2026-11-03-campus-visits-1-20261103T114308Z`; Claude tiếp tục full deploy nén cùng revision, có backup `...T115303Z`. 397tài nguyên public khớp bản build NÉN; manifest619file không có mismatch, SW/manifest HTTP khớp. 5mẫu nén đại diện giải mã được, giữ số tam giác, bounds POSITION, số khớp skin và tên animation so nguồn. Main `main-USQUMl5d.js`, SHA256 `59c2141dd177a10d7383326fd9e8a05bb2b4daebf439175b3d17d146e1c9452e`.

Quan trọng về phối hợp Claude: chênh hash so public/ ban đầu là do nén Meshopt/WebP trong dist-public/, KHÔNG phải ghi đè hỏng mô hình. Không phục hồi GLB thô lên server. Giữ thay đổi tăng tốc/cache của Claude. Deploy theo DEPLOY.md: build public → prepare-public → compress-assets → asset-manifest → pack full dist-public. Overlay pack-campus-visits.mjs đã đổi sang GLB nén trong dist-public, kèm SW/manifest/decoder và kiểm hash manifest; gói mới57,25MB. Không dùng lại overlay owner20 cũ lấy asset từ public/. Full baseline local/server đã được Claude cập nhật nén, nhận diện manifest `7473cdb3c030` tại thời điểm kiểm.

Chưa kiểm chứng: browser gameplay/ảnh thực tế/FPS/mobile, bấm chọn thang bằng UI tại mọi tầng, hoạt động dài hàng giờ trong cảnh render thật và tất cả va chạm sau stream. CUA timeout; computer-use Node không khởi tạo được (kernel assets path missing). Chưa xác nhận thẩm mỹ sau nén ảnh/WebP bằng trình duyệt. Cư dân là mô phỏng từng client, không phải500tài khoản đồng bộ; chưa có full cloth/foot IK hay động tác IK cắm nhang vào tro. Không tự bật lại tượng đá cũ, sư sân đã tắt,1500phật tử cũ hoặc công việc điêu khắc Tripo đã dừng.

Chi tiết/log: `docs/CAMPUS_VISITORS.md`, `docs/campus-visitors-*.log/json`. Cần nghiệm thu trực tiếp các mục chưa kiểm trước khi tuyên bố hết lỗi đồ họa/hết lag.

## 03/11/2026 — 20 tượng chủ cung cấp (ĐÃ LÊN SERVER)

Revision `2026-11-03-owner20-placement-1`. Đã nhập đủ 20 ZIP: 11 Bồ Tát trong các ô trống chánh điện, 6 vị thiên ngoài sân theo ba cặp đối xứng, thay Di Lặc đón khách (không nhân đôi tượng cũ), Bồ Tát nghìn tay cao 100m giữa hai Hộ Pháp cánh phải, Phật khất thực cao 20m ở hông giáp tháp. Tượng mới dùng vàng PBR; bản nguồn giữ nguyên. Các tượng đá đã tắt vẫn tắt; giữ Phật chính, bộ ba sát sông, tháp, sông/cầu, người chơi và hoạt động hiện có.

Bố trí: nghìn tay (300,380), quay -X vào giữa sân; đúng trung điểm hai Hộ Pháp (300,265)/(300,495). Khất thực (380,160), quay +X ra ngoài. Với câu “bên trái, giữa tháp và sân”, bản này ưu tiên mốc tháp phía đông x480: đặt hông giáp tháp, không phải hông tây x âm. Sáu tượng sân cao18m; hai tượng đầu hàng chánh điện12m, tám tượng bên7m, tượng tưới sen cuối điện8m; Di Lặc cổng7m. Bệ ở các ô tái sử dụng được nới theo kích thước tượng, có vùng chừa nội thất và collider riêng.

Đã kiểm: 43/43 test hồi quy và 7/7 test online; TypeScript/build public đạt. Audit 20 nguồn +60LOD đều 0 cạnh hở/0 cạnh nonmanifold; kiểm hash đủ60GLB mới cùng asset tháp/bộ ba/tượng sân cũ và bundle public khớp bản local. Health/release200, service hoạt động. DB users=2, merit=[35,2,33,446], không reset. Backup server `/root/anlien-backups/2026-11-03-owner20-placement-1-20261103T100050Z`. Checkpoint trước sửa: `authoring/checkpoints/20261103-owner20`.

Chưa kiểm chứng: chơi trực tiếp trong trình duyệt, tất cả góc nhìn/LOD/va chạm bằng avatar và FPS/mobile. Công cụ trình duyệt mất kết nối, không được ghi là đã chơi thử. Đã xem render Blender kiểm tra hướng và tỷ lệ cụm phía đông (`docs/owner20-east-placement-render.png`); đây là render bố trí trên nền tham chiếu, không phải ảnh game đang chạy. Cần nghiệm thu game thực tế tiếp theo.

Bàn giao: `docs/OWNER_COLLECTION20.md`, `docs/owner20-production-verification.json` và các log `docs/owner20-*.log`. Deploy tiếp phải dùng `deploy/pack-owner20.mjs` hoặc full release mới: overlay giữ cả tower-buddha/front-triad/owner-collection20 và source `OwnerCollectionPlan.ts` vì SanctuaryPlan server có import. Không deploy baseline cũ một mình. Không mua tài nguyên/dịch vụ.

## 03/11/2026 — Bộ ba sát sông, trả hàng tượng cũ, tạo chiều sâu bậc xuống nước (ĐÃ LÊN SERVER)

Revision `2026-11-03-riverfront-triad-3`. Bộ ba dịch z568 (tiến28m về sông), giữ x và khoảng hở mép3m, cao100m/vật liệu vàng/hướng mặt như cũ. Mặt trước footprint còn3,35–4,20m tới bậc đầu z597,5, đủ một lối đi trước tượng. Ba tượng nhỏ trái trả z465→520, thẳng hàng đối xứng với ba tượng bên phải; Phật nằm không đổi.

Bậc bờ sông giữ đúng hình học/cao độ và collider. Thêm mặt đứng màu đá xám, viền mép trắng và dải bóng tiếp xúc ngay dưới mỗi cổ bậc; hiệu ứng hoạt động cả mức Nhẹ khi bóng động toàn cảnh tắt. Không tăng shadow map toàn game. Preview entrance-river.html được thêm vào input Vite public để bản kiểm tra dùng đúng mã renderer hiện tại thay vì HTML/chunk cũ còn trong dist-public.

Đã kiểm:13/13test bộ ba/sông/7tượng cũ đạt; xác nhận hàng6tượng z520 đối xứng, footprint bộ ba không chồng tượng nhỏ/cổng/sông, bậc vẫn liên tục. TypeScript và build public đạt. Browser local thử capsule đi xuống hết bậc đạt chân−2,24m sát nước; đã nhìn rõ nhịp bậc (docs/riverfront-stairs-local.png). Public preview đã mở bản mới và thấy bậc có mặt đứng đậm. Chưa đi bộ thử toàn bộ mặt trước bộ ba bằng avatar online, chưa nghiệm thu mọi góc ánh sáng/mobile.

Backup server: /root/anlien-backups/2026-11-03-riverfront-triad-3-20261103T081141Z. Health/release/SHA main/shared landscape/layout/stupa và9GLB bộ ba,3GLB tháp,7GLB sân đều đạt. Số liệu DB sau cập nhật: users=2, merit=[35, 2, 33, 446]; không reset dữ liệu. Log docs/riverfront-triad-deploy.log, riverfront-triad-verify.log, riverfront-triad-production-verification.json. Dùng pack-front-triad.mjs hoặc full release mới cho lần sau; full baseline cũ cần overlay đủ asset như các bản trước.

Checkpoint: authoring/checkpoints/20261103-riverfront-triad. Bản trước ghi z540/hàng nhỏ465 là lịch sử, đã được thay bằng bố trí này.

## 03/11/2026 — Thu khoảng cách bộ ba còn 3 m giữa mép tượng

Revision `2026-11-03-triad-gap3-2`. Giữ tâm Phật Thích Ca tại (−150,540), cao100m và yaw0 cho cả ba. Quán Âm chuyển x−240→−210.5195607551; Địa Tạng chuyển x−60→−90.0350988146. Khoảng trống theo bounding width giữa mỗi tượng bên và tượng giữa đúng3m; khoảng cách tâm hai bên hơi khác vì chiều rộng các mẫu khác nhau. Giữ vật liệu vàng và các tượng/công trình khác.

3/3 test bộ ba đạt: xác nhận gap3m, vị trí/hướng/chiều cao và khoảng cách cổng/sông/Tứ Thiên Vương/tượng nhỏ. TypeScript và build public đạt. Checkpoint authoring/checkpoints/20261103-triad-gap3. Log docs/triad-gap3-tests.log, triad-gap3-typecheck.log, triad-gap3-build.log. Chưa đi bộ thử cả hai khe hở trong bản online; collider mỗi tượng có padding0.5m nên khoảng trống va chạm thực tế giữa hai collider còn2m. Header preview đã đổi từ khoảng cách tâm90m sang khoảng trống mép3m.


ĐÃ LÊN SERVER: health/release/main/shared chunk và toàn bộ9GLB bộ ba,3GLB tháp,7GLB sân đã đạt SHA. Backup /root/anlien-backups/2026-11-03-triad-gap3-2-20261103T073917Z. Giữ2tài khoản và công đức[35,2,30,446]. Browser public đã thấy3/3tượng với header khoảng trống3m; ảnh docs/triad-gap3-production.png. Xem docs/triad-gap3-production-verification.json.

## 03/11/2026 — Bộ ba tượng vàng 100 m ở cánh trái sân (ĐÃ LÊN SERVER)

Revision `2026-11-03-front-triad-gold-1`. Dùng đúng ba ZIP chủ dự án cung cấp: Phật Thích Ca Mâu Ni, Quán Thế Âm Bồ Tát (2), Địa Tạng Vương Bồ Tát. Bố trí (x,z): Quán Âm (−240,540), Thích Ca (−150,540), Địa Tạng (−60,540). Tâm cụm phản chiếu x=150 của Phật nằm sang x=−150, giữ cùng z540; khoảng cách tâm 90 m đều hai bên. Tất cả cao 100 m gồm tòa sen có sẵn, base0, yaw0: mặt +Z ra ngoài, lưng về chánh điện. Không thêm bệ lớn. Ba tượng nhỏ cũ ở cánh trái chuyển z520→465; giữ nguyên kích thước và mẫu để không chồng lưới vào bộ ba.

Vật liệu dùng chung create24kGold trong StatueGold.ts: metallic1, roughness0.28, vàng ấm có phản xạ HDR (albedo1/.68/.14, ánh sáng bổ sung nhỏ). Màu là diễn giải hình ảnh vàng 24K cho game, không khẳng định phép đo quang học chính xác trên mọi màn hình. Bỏ màu tối của texture nguồn tại thời điểm render; giữ nguyên GLB gốc và điêu khắc. Ba mức lưới mỗi mẫu: high120k / low35k / far8k. Có LOD riêng cho các tượng khổng lồ để không giữ high trên toàn khuôn viên.

Đã kiểm: source và3LOD mỗi tượng (12 bản) đều0boundary/0nonmanifold; riêng Địa Tạng far có một khe tam giác khi giảm lưới, đã vá và audit lại. 22/22 test bộ ba/tượng cũ/vườn đạt, gồm kích thước/hướng/đối xứng/tâm đều, khoảng cách cổng/sông/Tứ Thiên Vương/tượng nhỏ và bảo toàn7tượng cũ. TypeScript và build public đạt. Browser local đã thấy3/3mẫu riêng dưới vật liệu vàng, và xem bộ ba trong khuôn viên đầy đủ: docs/front-triad-local.png và front-triad-in-courtyard-local.png. Public preview cũng đã tải và hiện3/3mẫu high với vật liệu vàng; ảnh docs/front-triad-production.png. Chưa đi bộ quanh toàn bộ chân tượng trong online; chưa nghiệm thu mọi góc LOD/thiết bị mobile. Một góc main local ghi3FPS trong lúc nhiều WebGL tab đang mở; đó không phải benchmark độc lập, không tuyên bố toàn game mượt.

Bản preview riêng: front-triad.html?q=high. Trong game: ?q=low&view=front-triad, nút “Ba tượng vàng 100 m” ở giao diện xem kiến trúc; ba mẫu có trong menu vườn tượng và hoạt động ở game online như các công trình khác. Quyền phân phối asset chủ cung cấp chưa có giấy phép độc lập kèm ZIP; không tự gán CC.

Đã triển khai bằng deploy/front-triad-overlay.tar.gz (~20,7MB), bao gồm cả các asset tower-buddha trước đó và9GLB mới. Backup /root/anlien-backups/2026-11-03-front-triad-gold-1-20261103T071448Z. Health sau deploy đạt, giữ2tài khoản và công đức[35,2,30,445]. Chỉ cập nhật anlien-server. Xem docs/front-triad-deploy.log và front-triad-production-verification.json để đối chiếu SHA. Baseline full deploy/anlien-release.tar.gz vẫn là river cũ; lần sau phải dùng pack-front-triad.mjs (kèm tower-buddha và front-triad), hoặc đóng lại full release.

Checkpoint trước sửa: authoring/checkpoints/20261103-front-triad. Nguồn bất biến, blend, ảnh và audit: authoring/front-triad; assets chuẩn hóa và hash: public/assets/sanctuary/front-triad/01..03/asset.json. Dev Vite từng dừng khi watcher đọc nhiều thư mục overlay đang ghi; vite.config.ts nay bỏ theo dõi deploy/dist-public/authoring/docs/assets-src, vẫn theo dõi src/public và cấu hình.

## 03/11/2026 — Tượng giữa cửa, vàng đồng sáng, bỏ bệ và sửa sàn đen (ĐÃ LÊN SERVER)

Revision `2026-11-03-centred-brass-2`. Checkpoint: authoring/checkpoints/20261103-centred-brass.

288 tượng giữ cao 5 m và cùng danh hiệu. Tượng chuyển về chính giữa trục từng cửa (offset=0), đặt phía ngoài tường với khoảng lùi 0,6 m sau lưng. Khẩu độ cửa tầng 36 là nhỏ nhất: sau khi trừ nửa bề rộng tượng và padding collider 0,15 m, còn khoảng 1,06 m mỗi bên. Đã kiểm đường đi capsule bán kính 0,3 m qua cả hai bên ở mọi tầng. Bỏ hoàn toàn bệ đá ghép, tòa sen gốc đặt trực tiếp trên sàn; bảng tên nâng lên trước chân tòa sen. Màu PBR vàng đồng #dfa83f, metallic0.55/roughness0.38, giảm màu tối nung trong texture albedo gốc và tăng sáng nhẹ; lưới và normal detail gốc giữ nguyên. GLB nguyên bản không sửa.

Sửa hai lỗi sàn: tách mặt sân dưới khỏi sàn trệt (−0,04 m / 0 m) để tránh trùng mặt; quan trọng hơn, BAcc tính normal từ cạnh A→D nên các tam giác dạng quad có D=A (quạt tâm sàn và nắp đá) nhận normal0, gây đen. TowerBatch nay tính normal dự phòng từ A→C qua StupaSurfacePlan.ts. Chỉ áp dụng tháp, không sửa BAcc toàn dự án. UV sàn đổi sang tọa độ phẳng theo mét để gạch không kéo thành nan quạt. Bỏ bump gây nhiễu trên đá/mặt dưới mái của tháp, dùng ánh sáng hai mặt. Mỗi bậc thêm mặt đứng đậm và viền mép sáng, giữ số bậc/cao độ/va chạm cũ.

Đã kiểm: tsc/build đạt, 13/13 test tháp+tượng đạt; có test normal hướng lên của96tamgiáctâmsàn và va chạm đường đi hai bên tượng trên36tầng. Browser local đã thấy sàn nhận sáng, không còn mảng đen ở góc cầu thang đã kiểm; bậc1–11 nhìn tách rõ. Đã chạy QA leo đủ3.360bậc tới tầng36, chân455m sau thay đổi. Ảnh: docs/centred-brass-clear-steps.png và centred-brass-local.png. Chưa nghiệm thu mọi góc chuyển động trong game online đầy đủ, mọi GPU/mobile; không tuyên bố xóa mọi artefact toàn khuôn viên.

Server đã cập nhật qua overlay có đủ3GLB tượng. Backup: /root/anlien-backups/2026-11-03-centred-brass-2-20261103T054059Z. Health/release/main/sharedchunk/3GLB tượng và7GLB sân đạt SHA; giữ2tài khoản và công đức[35,2,30,445]. Main assets/main-CmVe4EWC.js, SHA6600a2afc96312d1b09ef241ed67dff0a189d80f5926f47a5b14a8e8109800a5. Log docs/centred-brass-deploy.log và centred-brass-production-verification.json. Baseline full river vẫn cũ: dùng pack-tower288.mjs cho overlay có đủ asset, hoặc đóng lại full release.

## 03/11/2026 — 288 tượng Phật cao 5 m tại 8 cửa × 36 tầng (ĐÃ LÊN SERVER)

Revision: `2026-11-03-tower288-buddhas-1`. Danh mục và nguồn: docs/TOWER_288_BUDDHAS.md, authoring/tower-buddhas/names-audit.json.

Dùng đúng GLB PBR từ ZIP chủ dự án, giữ chi tiết và vật liệu. Tượng cao 5 m, tính cả tòa sen/hào quang của mẫu; bệ riêng cao 0,4 m. Mỗi cửa có một tượng lệch bên cửa, mặt quay ra ngoài. Giữ nguyên khẩu độ cửa và lan can. Vòng cột ngoài dịch từ r−3 sang r−1,2 m để tránh chạm tượng trên tầng hẹp. Ba LOD 80k/18k/2k tam giác dùng chung thin instances, chia nhóm theo khoảng cách 3D; ẩn ngoài 230 m. Bảng tên dùng một atlas.

288 danh hiệu khác nhau là vị 101–388 trong Kinh Hiện Tại Hiền Kiếp Thiên Phật Danh (Taishō T0447a, bản Việt Nguyên Thuận). Parser trích đủ 1.000 tên; xác nhận 100 tên đầu khớp danh mục chánh điện; không có tên trùng trong 288 vị hoặc trùng 100 vị chánh điện. Cùng một mẫu mỹ thuật mang các danh hiệu theo yêu cầu; không khẳng định 288 hình tướng kinh điển riêng. Nguồn HTML, số thứ tự và hash được lưu trong authoring/tower-buddhas.

Đã kiểm: mẫu gốc và 3 LOD đều 0 boundary / 0 nonmanifold; TypeScript đạt; 30/30 test tháp/sông/tượng đạt, gồm hướng mặt, khoảng trống cửa, biên sàn/lan can/cột ở cả 36 tầng. Build public đạt. Browser local và public đã thấy mẫu vàng chi tiết ở tầng 36; có 3 lưới LOD thật với tổng 55.295 vertices. Ảnh: docs/tower288-production-floor36.png. Đã đăng ký glTF loader trực tiếp trong module; ready chỉ true khi cả 3 lưới LOD có thật, tránh container rỗng trong preview.

Chưa kiểm: đi bộ qua toàn bộ 288 vị, mọi góc LOD/mobile và tải nhiều người thật. Số tam giác/mesh hiện trên preview chỉ tính kiến trúc, không gồm tượng; không dùng nó để báo tổng GPU hoặc hứa FPS toàn game. Quyền phân phối asset do chủ cung cấp chưa có giấy phép độc lập kèm ZIP; không tự gán CC.

Đã deploy bằng deploy/tower288-overlay.tar.gz (~6,7 MB). Backup: `/root/anlien-backups/2026-11-03-tower288-buddhas-1-20261103T050020Z`. Health/release và SHA main/shared chunk/3 GLB mới/7 GLB cũ đạt; 2 tài khoản và tổng công đức [35,2,30,445] giữ nguyên. Log: docs/tower288-deploy.log và tower288-production-verification.json. Main: assets/main-6TuafGOg.js, SHA b3a209583f1a9ac6d7765630182c0e36f902ae5bce5404535d16376b1523feaa.

Lưu ý triển khai tiếp: full baseline deploy/anlien-release.tar.gz vẫn là bản river cũ. Overlay sau phải kèm cả assets/sanctuary/tower-buddha (3 GLB + asset.json), không chỉ JS. Dùng template deploy/pack-tower288.mjs hoặc tạo lại full release từ nguồn mới. Checkpoint trước sửa: authoring/checkpoints/20261103-tower288.

## 03/11/2026 — Tách lối thang máy đối diện thang bộ, rút lan can về mép sàn
Revision `2026-11-03-opposite-lift-3`. Checkpoint `authoring/checkpoints/20261103-opposite-lift`.
Cửa thang máy và chiếu nghỉ đổi sang Tây Nam (phase225°), đối diện thang bộ Đông Bắc45°. Lối thang máy r2.4→8.4m nằm tại cao độ sàn, phía trên nửa vòng thang bộ thấp hơn6.5m; không che bậc đang đi. Lối thang bộ chỉ nối r7.6→8.4m, không nối xuyên vào lõi giữa. Lan can lõi/sàn chừa hai cửa đối diện; lan can cầu nối dừng ở r8.4m (mép lỗ sàn), không kéo dài ra cửa phòng. Giữ lan can trong thang xoắn liên tục; mở phía ngoài tại chiếu nghỉ bộ. Sửa support/collision cùng bố trí, gồm bảo đảm tầng36 không bị end-cap đẩy từ cửa thang máy về cửa bộ.
Đã kiểm: tsc đạt,8/8 test tháp đạt (mọi tầng lối ra thang máy có support và không bị đẩy; thang bộ bên dưới không bị sàn thang máy bắt lên nhầm; va chạm quanh lỗ sàn); browser local chạy đủ3360bậc đến455m tầng36. Ảnh docs/opposite-lift-exit.png cho thấy lan can kết thúc tại sàn, phòng thông thoáng. Build/public/deploy xem docs/opposite-lift-*.log. Thang máy local thử9→10 đạt117m. Server health/release và SHA main/sharedchunk+7GLB đạt; users2 và công đức[35,2,30,445] giữ nguyên. Backup /root/anlien-backups/2026-11-03-opposite-lift-3-20261103T035957Z. Vẫn chưa kiểm chuyến đi nhiều client dùng chung cabin hoặc avatar online dài hạn; giới hạn client-local elevator của bản trước giữ nguyên.


## 03/11/2026 — Tháp 36 tầng / 500m, thang máy và chống rơi (ĐÃ LÊN SERVER)
Revision: `2026-11-03-stupa36-lift-2`. Tháp hông Đông (480,20): 36 sàn y=0..455m, cao độ đỉnh 500m; bán kính sàn thu 50→18m. 3.360 bậc / 96 bậc mỗi vòng, có số trên từng bậc bằng atlas dùng chung. Mỗi tầng có chiếu nghỉ vào sàn; bảng TẦNG gắn trên vách cạnh cửa, bỏ khung cổng/post đứng riêng. Lan can hai thanh và trụ quanh lỗ thang; lan can trong/ngoài xoắn có va chạm analytic; chặn ngang đầu cuối tầng 36, vẫn mở nhánh đi xuống. Lan can đá quanh chân tháp, chừa lối Tây. Sửa normal tube/mặt bậc, tăng sáng vật liệu đá và mặt dưới mái, không nhận bóng đổ trên các mặt này để hạn chế mảng đen.
Lõi giữa đổi thành cabin thang máy kính/đồng: đến chiếu nghỉ gần lõi thấy nút “Thang máy · chọn tầng”, chọn 1–36; đóng cửa, chuyển cao độ êm, mở cửa rồi ra chiếu nghỉ. Cùng một instance dùng bởi điều khiển offline/online và preview. Khi đang đi thang máy khóa di chuyển tay, hủy tự chạy/tư thế ngồi; online cho phép y đến 520m. Không thay dữ liệu cư dân, tượng chủ sở hữu, sông/cầu hoặc công đức.
Kiểm chứng: TypeScript đạt; build public đạt. 26/26 test tháp/sông/tượng đạt, gồm hỗ trợ đủ 3360 vị trí bậc lên/xuống, đường vào từng tầng, chặn hai phía/lỗ sàn/chân tháp/đầu cuối, thang máy mọi tầng hai chiều và các pha cửa. Browser local thử thang máy 1→36 (chân455m) và 36→1 (0m); chạy QA từng bậc xác nhận đến3360/3360 tầng36 cao455m. Preview low ~862.200 tam giác/10 mesh batched (chưa tính mesh cabin), quan sát sau warmup37–58FPS ở một số góc; KHÔNG đại diện FPS toàn cảnh 500NPC hoặc điện thoại. Có ảnh docs/stupa36-lift-floor36.png. Bản QA từng bậc đã siết kiểm cao độ dự kiến để không báo đạt khi chỉ tăng biến đếm.
Triển khai: overlay `deploy/stupa36-lift-overlay.tar.gz` chồng lên baseline full river (KHÔNG chạy baseline một mình). Backup server `/root/anlien-backups/2026-11-03-stupa36-lift-2-20261103T033213Z`. Chỉ restart anlien-server. Health/release, SHA main+shared Stupa chunk và 7farGLB đạt; users2 và tổng công đức[35,2,30,445] giữ nguyên. Log docs/stupa36-lift-deploy.log và stupa36-lift-production-verification.json. Main assets/main-OrUsgfpt.js SHA ce07ea9074bca56f6be012df8a0518eb3feefdbe715dda7d24e72e0fa9ed9184.
Browser public phiên riêng cũng đã thử1→2, chân giữ13m sau khi mở/đóng bảng chọn tầng (docs/stupa36-lift-production.png); không thấy tự tăng tầng khi thử độc lập.
Chưa kiểm chứng / còn lại: chơi dài bằng avatar trong bản online đầy đủ, mọi góc cận cảnh/thiết bị mobile và tải nhiều người. Cabin hiện mô phỏng riêng phía client; vị trí người chơi được gửi qua snapshot sẵn có, chưa có cabin/hàng đợi dùng chung đồng bộ giữa nhiều client. Chưa nghiệm thu hết các mặt tối/răng cưa ở mọi góc; không tuyên bố đã xóa hoàn toàn mọi artefact đồ họa. Chưa thử người dùng cố ý dịch chuyển ngoài controller. Checkpoint trước sửa: authoring/checkpoints/20261103-stupa36-500m và 20261103-stupa-lift-top-guard.

## 02/11/2026 — Bản test local và tối ưu mức Nhẹ

Game local đang phục vụ tại http://127.0.0.1:5200/?q=low&online=1 . File mở lại nằm trên Desktop: C:/Users/Admin/Desktop/CHAY-CHUA-LOCAL.cmd (gọi CHAY-CHUA-LOCAL.cmd trong dự án, dùng Node đã cài). Helper deploy/start-local.mjs khởi động Node ẩn, bind 127.0.0.1:5200, dùng dist-public và data-local riêng; không cần chạy PowerShell script/đổi execution policy. Tạo tài khoản thử trên màn hình local; tài khoản/công đức online không chuyển về và không bị sửa. Mở lại helper sẽ dùng server đang chạy.

Kết quả khảo sát: server online tại lúc đo load average 0,61/0,71/0,77, RAM available khoảng 8,5GB, /api/health phía server khoảng 1,6ms ở một lần đo. Chưa thấy bằng chứng backend quá tải. Dựng hình chạy trên trình duyệt máy người chơi; local giảm phụ thuộc mạng nhưng không tự tăng năng lực GPU.

Đã sửa mức q=low: thay mây volume 32 bước/pixel bằng bề mặt mây trôi với 3 mẫu noise, giữ chân trời/biên khuôn viên; không chạy shadow pass, tỉ lệ dựng hình tối đa 0,85 pixel/CSS pixel; chỉ tải nghi lễ khi tới gần 120m, hiển thị sư trong 90m, cập nhật tư thế 24Hz gần/10Hz xa (vị trí đoàn đi vẫn cập nhật mỗi frame). Chế độ Cao giữ mây volume/bóng/cự ly cũ. A* cư dân dùng binary min heap thay sắp xếp cả hàng đợi mỗi vòng. Không bỏ 10 cư dân, 132 sư hoặc đệm nghe pháp khỏi dữ liệu.

Kiểm chứng: tsc đạt; build public dành local đạt 5,02s; 6 kiểm tra điều hướng/đệm/bậc/clip nam-nữ + 1 kiểm tra hai biến thể shader/uniform với NullEngine đều đạt. HTTP local xác nhận health, revision 2026-11-02-local-performance-1, index/chunk mới, manifest và SVG đúng MIME. Helper đã khởi động server thực tế. Log: docs/performance-local-tests.log, performance-cloud-tests.log, performance-local-build.log, performance-local-http.json và local-game-server*.log.

Chưa đo FPS thực tế trước/sau, chưa nghiệm thu shader bằng GPU, chưa chơi chu kỳ 10 phút: công cụ trình duyệt vẫn timeout khi mở local. Không nhận là đã hết lag hoặc tăng FPS theo một hệ số. Bản tối ưu CHỈ chạy local; public dichua.palo.io.vn vẫn 2026-11-02-temple-life-1. Gói deploy/anlien-release.tar.gz cũ cũng vẫn là bản public đó. Muốn đưa tối ưu lên public, cần kiểm GPU/đường đi/tư thế thực tế, rồi build/pack/deploy và kiểm health/hash lại. Checkpoint trước tối ưu: authoring/checkpoints/20261102-performance-local.
## 02/11/2026 — 10 phật tử sinh hoạt, đệm nghe pháp (đã lên server)

Bản công khai: https://dichua.palo.io.vn/?q=low&revision=2026-11-02-temple-life-1 . Đã thay đám đông 1.500 phật tử trong cảnh chính bằng 10 mẫu áo dài tóc gốc sinh hoạt riêng: chỉ đi bộ, thiền/ngồi trong điện/lạy ngoài sân/đi hiên/đẩy kinh luân, đổi hoạt động sau 300–600 giây. Giữ đệm vàng và các sư. Click/tap đệm, đến trong 3m rồi bấm Ngồi nghe pháp; WASD/Đứng dậy để rời đệm. Bổ sung 5 lối bậc trước hiên nối nền 1,2m. Người chơi giữ bộ PilgrimWalk/PilgrimRun/Push chuyển từ rig cũ.

Kiểm chứng: full suite 108/108 đạt; sau sửa cuối đường nối đầu A*, test điều hướng/đệm/thang 4/4 đạt. Local build đạt; tsc và public build cuối đạt (19,82s). Server update-existing.sh hoàn tất, health OK, public release/index/chunk và manifest mới đã kiểm HTTPS, SHA256 GLB trên server trùng file local (1b067410771f80903740f54e73adc0a0404a88fb0a40ea80301604e46a756ce0). Tài khoản và tổng công đức không giảm. Backup server: /root/anlien-backups/2026-11-02-temple-life-1-20261102T075706Z. Checkpoint local: authoring/checkpoints/20261102-temple-residents.

Chưa kiểm chứng đầy đủ: trình duyệt kiểm tra mất kết nối khi tải cảnh nặng; đã mở cảnh chính thấy trạng thái đám đông tắt/đệm mới nhưng chưa xác nhận hình đủ 10 người, chọn đệm thực tế hoặc một chu kỳ sinh hoạt 10 phút. Thử mở lại public cũng timeout ở công cụ, không có ảnh QA mới đạt. Chưa đo hiệu năng/điện thoại/multiplayer. Không dùng test dữ liệu thay cho xác nhận chất lượng đồ họa.

Giới hạn còn lại: NPC có lịch riêng phía từng trình duyệt, chưa server-sync/lưu lịch. Ghế chưa khóa nguyên tử giữa hai người chơi click đồng thời; tránh ghế theo snapshot remote hiện có. Nghe pháp hiện là tư thế/chọn đệm, chưa thêm bản thu bài giảng. Chưa full cloth physics/foot IK. Cần rà đường đi khi collider stream, vải khi ngồi/lạy và phát âm thanh thực tế. Chi tiết mã, nguồn và log: docs/TEMPLE_LIFE.md; docs/temple-life-https-verification.json; docs/temple-life-deploy.log. Không mua tài nguyên/dịch vụ, không thay dữ liệu tài khoản hoặc cấu hình site khác.
## Fit-5: tiến cổ thêm1cm, làm đều vành sau — 02/11/2026
Theo yêu cầu mới, tăng dịch cổ ra trước từ25mm lên35mm (thêm đúng10mm), giữ hạ30mm. Cạnh trên cổ áo sau được đưa về cùng cao độ nguồn1,650m với chuyển tiếp mềm, thêm8mm khoảng hở theo chiều sâu; các đỉnh trên mép sau gắn cùng Spine2 để giảm răng cưa do weights khác nhau. Không thay skeleton80bones/6clips hay codeviewer/gameonline.
Checkpoint: authoring/checkpoints/20261102-ao-dai-collar-rim. Blenderexport đạt;2/2 kiểm GLB/cuff/weights/UV2/manifold/hash đạt (docs/ao-dai-collar-rim-tests.log); không chạy lại fullbuild do chỉ đổi asset/script. SHA256 mới: d5dbb915d4da5123cca669fc5c6d3d7330e12ca69393c9fdb8f5757ee1cd88bf. Đã cập nhật SOURCE.json và dist. Link: http://127.0.0.1:5196/rigged-people.html?outfit=ao-dai&revision=fit-5 . Cần tiếp tục rà mọi pha gập cổ/cloth như giới hạn fit-4.
## Fit-4: đưa cổ sát thành trước cổ áo — 02/11/2026
Theo yêu cầu anh Thanh, dịch bề mặt đầu/cổ/tóc ra trước25mm theo -Y của Blender, với cùng chuyển tiếp mềm tại chân cổ; giữ độ hạ30mm của fit-3. Giữ áo, skeleton80bones và6clips, không sửa gameonline. fit.py tái tạo được từ nguồn/checkpoint; checkpoint trước sửa: authoring/checkpoints/20261102-ao-dai-neck-forward.
Blender export đạt (docs/ao-dai-neck-forward-build.log).2/2 kiểm GLB/cuff/weights/vải kín/UV2/clips/hash đạt (docs/ao-dai-neck-forward-tests.log). SHA256 mới bef645ea490ba3c82f1539d29acafca44dfdd0cd87ac56bc5542369715ece54f đã cập nhật SOURCE.json và dist. Chỉ đổi asset nên không chạy lại buildTypeScript; viewer/capsule giữ từ bản fit-2 đã build.
Linkxem: http://127.0.0.1:5196/rigged-people.html?outfit=ao-dai&revision=fit-4 . Ảnh cận trước: docs/ao-dai-neck-forward-front.png. Các giới hạn cloth/góc gập sâu/facial animation từ fit-3 vẫn giữ; không xem sửa vị trí cổ là nghiệm thu toàn bộ trang phục.
## Fit-3: hạ cổ vào cổ áo — 02/11/2026
Theo phản hồi anh Thanh, chỉ sửa hình học cổ/đầu của mẫu nữ áo dài. fit.py hạ phần đầu và tóc tối đa30mm, chuyển tiếp smoothstep qua vùng cổ; thu phần da chân cổ ở hai bên vào trong cổ đứng. Giữ bộ xương80joints và6clips, không chỉnh thân/tay áo hoặc cơ chế online. Đây là chỉnh bề mặt mesh trên rig hiện tại; chưa chỉnh lại pivot xương đầu hay dựng facial animation mới.
Checkpoint authoring/checkpoints/20261102-ao-dai-neck lưu fit.py/model/SOURCE trước sửa. Đã tái xuất Blender, cập nhật SHA256 và copy vào dist. SHA256 mới:6e0cddbea757d46523ff78528ba2bc26b0abb7e7e7b3aaca8d8b9c0151198b45. Linklocal: http://127.0.0.1:5196/rigged-people.html?outfit=ao-dai&revision=fit-3 . Gameonline không đổi.
Kiểm:2/2 actualGLB (hash/weights/6clips/vải kín/UV2/cuff qua hoạt ảnh và poses) đạt, docs/ao-dai-neck-tests.log. Blender export đạt, docs/ao-dai-neck-build.log. Đã xem cận mặt khi đứng và tư thế lạy mức100, console không có error; ảnh ao-dai-neck-close-final.png và ao-dai-neck-bow-final.png. Không chạy lại fullbuild vì không sửa TypeScript/UI, chỉ tái tạo asset; module viewer/capsule hiện tại từ buildfit2 giữ nguyên.
Chưa kiểm mọi góc/pha đầu xoay hoặc facial animation. Các giới hạn xuyên vải ở tư thế gập sâu trước đó vẫn cần tiếp tục xử lý; kiểm cổ không đồng nghĩa nghiệm thu toàn bộ trang phục.
## Áo dài fit-2 — 02/11/2026
Đã sửa miệng tay bám cổ tay, khoảng hở khuỷu, đường may/lớp mặt trong và chống chân xuyên tà trong viewer. TypeScript/Vite và 2/2 kiểm tra GLB đạt. Chi tiết, ảnh cuối, checkpoint và các phần chưa kiểm: docs/AO_DAI_SLEEVES.md. Chưa thay game online.

## 02/11/2026 — sửa áo thủng, tay rời ống tay (revision fit-2)
Checkpoint authoring/checkpoints/20261102-ao-dai-sleeves lưu script fit.py, model/SOURCE và viewer trước sửa.
- fit.py khâu các pattern trùng vị trí (merge4mm), thêm lớp vải trong1.5mm áp trước Armature để tránh bake nhầm pose. Xuất UV và hoa văn gốc,80skinbones/6clips giữ nguyên.
- Căn riêng235vertex sleeve theo shoulder/elbow/wrist native; cổ tay kết thúc phủ14mm qua cổ tay, gắnweightsUpperArm/Forearm/Hand theo chuỗi, cuffring theoHand. Tăng độ rộng bắp tay/khuỷu/cổ tay; giữ forearm thật dưới áo, giảm bán kính phần da bị che để tránh lộ khi gập; bàn tay/ngón không sửa. Xóa phần tanktop/jeans bị che, quần trắng kéo dài tới gần giày.
- Hai tà ngoài dùng weights liên tục pelvis + cảhai đùi, tránh bị kéo tách theo mỗi bắp chân/bàn chân. AoDaiCloth.ts chỉ gắn cho lựa chọnáodài trong viewer: UV2 đánh dấu front/backflap, GPU sau skin tránh capsule đùi/gối/cẳng chân/mũi chân và sàn; không ảnh hưởngtay hoặc modelcũ. Đây là chống xuyên hình học đơn giản, chưa mô phỏngcloth/vải vật lý. Không thayonlineplayer.
- Model khoảng15.639tris/80bones,2meshes. Source/hash/giấyphépCCBY/MIT/CC0 trong assetfolder; clothruntime cần AoDaiCloth.ts cùngassetUV2, không chỉcopyGLB sẽthiếuphầnnàykhixemgame.
Kiểm đã đạt2/2 thựcGLB: hash/skinweights/6clips, garment kín2manifoldfaces trênmỗicạnh (khôngopenedges/nonmanifold), UV2có0/1/2; skinned cuff vertices bám cổ tay qua20phaIdle/Walk/Run/Push và9tưthếprayer/sit/bow. NullEnginephảiskeleton.prepare(true) mỗi mẫu để cập nhậtpalette độc lậpframeID (đãsửa lỗi testcachefalsefail). Logs docs/ao-dai-sleeves-tests.log. Không coi testcuff là kiểmtoànbộxuyênbody/vải.
Ảnh rà trung gian phát hiệnbodyxuyênkhuỷu và quầnxuyên tà; đã tăngclearance và bổ sungcapsule. PhầnkếtquảUIcuối/build đượcghi tiếp bên dưới. Cácảnhtrunggian ao-dai-sleeves-walk-final.png có thểđượcchụptrướccapsule, khôngdùng làm ảnhnghiệmthu cuối.
Cần tiếp tục: cloth va chạm tựthân/chuẩnhóanếpvải/chấtnormal sauGPUoffset/skin mọi góc; chưa kiểmmobile/multiplayer hoặc đổiNPC. Khôngmuadịchvụ/tàinguyên.
## Ghép thử áo dài nữ — 02/11/2026
Đã tải và fit áo ghostnoface CC BY4.0 lên Rocketbox nữ, cùng80bones/6clip; previewlocal5196/rigged-people.html?outfit=ao-dai&revision=fit-1. Tsc/build và1/1kiểmasset đạt. Đã xem đứng/đi/ngồi/lạy, sửa vai lòi áo cũ; tà khi ngồi/đi vẫn xuyên/kéo nên chưa thay gamechính. Nguồn/hash/checkpoint/script/ảnh/việccònlại: docs/AO_DAI_FIT.md.

## Bàn giao 02/11/2026 — motion đã public, khảo sát áo dài
Public2026-11-01-pilgrim-motion-1 triển khai02/11: backup /root/anlien-backups/2026-11-01-pilgrim-motion-1-20261102T010016Z; archiveSHA256523173d32444f440cd0d9b218af27be97b71db847c256001de636f7976fa5ded. Users2/merit[31,2,29,276] trước/sau không đổi, healthOK. HTTPSmain/OnlineGame/2GLB khớphash local. Log docs/player-motion-deploy.log và player-motion-https-verification.log.101/101test; xem docs/PLAYER_MOTION.md về các phần chưa kiểm. Phiên UIonline local có mở nhưng không hoàn tất thao tác đi/chạy/đẩy ởtrụ; chỉ công nhận viewer vàkiểmactualGLB, không nhậnđãplaytest end-to-end.
Yêu cầu mới tìmngườiViệt/áodài: docs/VIETNAMESE_WARDROBE.md + authoring/vietnamese-wardrobe/candidates.json. Có áoCCBY4124tris và namBasicRigCCBYSA356700tris; chưadownloadmesh vìAPIyêu cầuđăngnhập(401); browserphiêntảinguồn hếtthờigian. Khôngtựlấymeshviewer/khôngmua. Chưathaytrangphụchoặcngườichơi. Chốtphươngánthiếtkếgarmentrờitrênrigmới, cầnfit/UV/weights/rángồilạy trướcápdụng.
## 01/11/2026 — hoạt ảnh cũ trên nhân vật mới
Theo yêu cầu anh Thanh, giữ model/skin80xương Microsoft Rocketbox nhưng chuyển Walk_Loop (.9x), Jog_Fwd_Loop và Push_Loop từ bộ Quaternius UAL CC0 của Pilgrim cũ sang cả nam/nữ. authoring/rigged-candidates/retarget-pilgrim-motion.mjs lấy GLB gốc từ checkpoint, bake60Hz hướng khớp (khớp theo trái/phải và phương đứng), chuyển dao động pelvisY, giữ nguyên chiều dài xương/weights/mesh. Không copy quaternion thô giữa hai rig khác trục. Giữ Idle/Walk/Run Microsoft để so sánh, thêm PilgrimWalk/PilgrimRun/Push trong GLB. Nam6,300,360bytes, nữ6,796,120bytes; SOURCE.json/hash/inspection/CREDITS đã cập nhật. Script chạy lại từcheckpoint nên không tích lũy clip trùng.

RocketboxPlayer dùng ba clip đã chuyển, blend0.18s, giữ pha đi↔chạy; wheel chuyển từ static prayer/reach sang Push thực, phát1lần tốc1.5 (~1.78s khớp act1.8s), giữframecuối tới khi kết thúc. Bỏ g.speedRatio nhân dtClamped/rawFrameDelta: tại FPS thấp tỷ lệ này từng làm cả dáng đi/chạy/đẩy chậm gần đứng im, và Push không kịp diễn hết trước khi hếtact. Clock hoạt ảnh giờ giống Pilgrim cũ. Không đổi tốc di chuyển/network/collision/thời hạn/công đức. FPS thấp vẫn gây bước hình giật và có thể trượt chân do simulation giới hạndt; chưa phải footIK/clothsimulation hoàn chỉnh.

Checkpoint authoring/checkpoints/20261101-player-motion lưu code/playerlibrary/viewer/SOURCE và2GLB trước sửa. Giữ biển mây, toàn bộ kiến trúc/nghi lễ/NPC. rigged-people viewer thêmChạy/Đẩy, Đi bộ dùng PilgrimWalk để QA cùng clips.

Kiểm:7/7 mục tiêu đạt (asset/hash/weights, actualGLB devotion/clones và2kiểm mới so hướng8đoạnchi với UAL gốc ở6pha cho nam/nữ, dot>.96, jointquaternion hữu hạn/chuẩn hóa và hoạt ảnh thật có chuyển động). Fullsuite101/101 đạt docs/player-motion-all-tests.log; tsc/localbuild vàpublicbuild đạt. Đã xem trêntrìnhduyệt mẫu nam đi/chạy/đẩy và nữ chạy/đẩy; không consoleerror ởphiênnam. Ảnh docs/player-motion-run.png, player-motion-push.png, player-motion-female-push.png. Đây là ảnhviewer; không nhận là đã kiểm đủ tiếp xúc tay vào mặt trụ ở mọi khoảng đứng/góc hay mọi thiết bị. Chưa có tiếp xúc bàn tay động với mặttrụ, fullfootIK, clothcollision hoặc kiểm multiplayer/mobile. Xem IMPLEMENTATION_STATUS để biết deploy/QA online cuối.
## Public đã cập nhật — 2026-11-01-cloud-sea-1
Đã triển khai an toàn lên https://dichua.palo.io.vn/ . Archive SHA256 51ebbc694651268cd3bd9e064c3765e827ca12f132104f24e7cde7e9f9d3ee25; backup /root/anlien-backups/2026-11-01-cloud-sea-1-20261101T134225Z. Health OK; users2 và merit[27,2,28,276] trước/sau không đổi. HTTPS release đúng; main/OnlineGame chunk và model nam tải từ public khớp SHA256 local. Log docs/cloud-sea-deploy.log, docs/cloud-sea-https-verification.log. Không nhập đăng nhập hoặc thử nghi lễ trên tài khoản public; gameplay/ảnh kiểm trên local5198. Model nữ được kiểm actualGLB/headless cùng baseline99test nhưng chưa download hash lại quaHTTPS.
Chi tiết thay đổi/kiểm chứng/giới hạn và phần cần Claude tiếp tục: docs/CLOUD_SEA_PLAYER.md. Ảnh bản cuối cloud-sea-overview-final.png/cloud-sea-tower-final.png. Tsc/publicbuild đạt; giữ baseline99/99 test của phần Rocketbox (không chạy lại fullsuite sau thay đổi thuầnhiểnthị mây/main). Cảnh máy QA vẫn2–7FPS khi nhiều cảnh/crowd cùng tải; cần profile/tối ưu, chưa kiểmmobile. Không gọi là hiệu năngđạt hoặc mô phỏng mây vật lý hoàn chỉnh.
## Cập nhật 01/11/2026 — biển mây + người chơi rig gốc
Chi tiết thay đổi, kiểm chứng/giới hạn, checkpoint và log: docs/CLOUD_SEA_PLAYER.md. Rocketbox đã thay người chơi online (NPC giữ nguyên); các mục cũ nói chưa tích hợp chỉ mô tả giai đoạn trước. Mới thêm biển mây bốn hướng ngoài chùa; không đổi tài khoản/công đức.

## Tư thế Rocketbox thử riêng — 01/11/2026
Mới: RocketboxDevotion.ts +4nútpose/thanhcúi trên rigged-people.html local5196. Rig/weights GLB giữ nguyên, không thay NPC/online.4/4testasset+pose2GLB thật quaNullEngine,tsc/build đạt. Checkpoint20261101-rocketbox-devotion; chi tiết/giới hạn/ảnh trong docs/ROCKETBOX_DEVOTION.md và IMPLEMENTATION_STATUS. Còn đồ thường/giày, chưa áo tràng/càsa/clothcollisions hoặcposeslễfinal. Không tự thay hàngloạt trước rà mỹthuật.

## Nguồn người rigged — 01/11/2026
Đã thêm rigged-people.html local5196:2Rocketbox MIT,80skin joints,Idle/Walk chuyển đúng rest pose bằng bake world rotation; không thay gameplay. docs/RIGGED_PEOPLE_LIBRARY.md ghi nguồn/giới hạn, ảnh,2testasset/tsc/build. Native Snow CC BY4.0 đã tải/mở, chưa xuấtgame. Chưa có áo chùa hay poseslễ trênrigmới. Source/checkpoint/Blender script trong authoring/rigged-candidates và20261101-rigged-people. Public vẫnprocession-loop-1.

Public mới nhất: 2026-11-01-procession-loop-1,94/94test, đã xem đường vòng trong ceremony preview; main/CeremonyMonks chunk khớp hash quaHTTPS. Dữ liệu tài khoản/công đức giữ nguyên. Xem log/ảnh/backup ở IMPLEMENTATION_STATUS.

## Procession loop — 01/11/2026
CeremonyPlan.ts chuyển20sư đi hai bên sang vòng hai làn14/16m, bo1m,0,65m/s, mỗi người lệch2m theo đường; không còn sin đồng pha. Không đổi rig/nghi lễ khác. Checkpoint20261101-procession-loop. Ceremony preview camera/sàn đã cộng HALL_RITUAL_SHIFT. Chi tiết kiểm chứng và publicrevision trong IMPLEMENTATION_STATUS.md.

Public đã cập nhật 2026-11-01-eye-view-1 (backup có trong IMPLEMENTATION_STATUS); hash main/chunk camera khớp qua HTTPS, dữ liệu2tài khoản/côngđức giữ nguyên. Chưa chơi đăng nhập production, đã chơi QA local5198. Không nhầm DB authoring/camera-qa-data với dữ liệu thật.

## Camera online — 01/11/2026
Codex bổ sung theo yêu cầu anh Thanh: OnlineGame.ts nút Góc nhìn + C; ViewMode.ts chiều cao mắt, root riêng của self bị ẩn khi nhìn mắt. 93/93 test pass, ảnh docs/camera-{eye,outside}.png. Checkpoint authoring/checkpoints/20261101-camera-toggle. Không sửa rig/âm thanh/server/auth. Giữ các thay đổi kiến trúc160m/vòm và dời đạo tràng hiện tại của Claude. Chi tiết giới hạn/triển khai trong IMPLEMENTATION_STATUS.md.

## Cập nhật nhânvật 31/10
Người dùng đã loại bộ10nhà sư cũ. Prototype vàngnghệ theo concept tại monk-reference.html; đọc docs/SAFFRON_REFERENCE_MONK.md. Chưa đạt mặt/vải theo mẫu, chưa nhân10 hoặc thay NPCmain. Có nguồn Blender và mãgánxương; giữ các cảnh báo QA/WebGL trong docs.

# BÀN GIAO CHO CLAUDE — AN LIÊN TEMPLE
Ngày31/10/2026. Đọc file này trước, rồi README.md, IMPLEMENTATION_STATUS.md, ASSETS.md và docs.

## Phạm vi và cách chạy
Đây là dự án CHÙA tách riêng từ Veilbound, đang chạy http://127.0.0.1:5196/. Không phải toàn bộ game thị trấn/kinh dị Veilbound.
Từ gốc gói bàn giao: node projects/AnLienTemple/server.mjs. Có sẵn dist để chạy bằng Node, không cần npm hay AI.
Để sửa: npm ci --prefix projects/AnLienTemple; npm run build --prefix projects/AnLienTemple; npm test --prefix projects/AnLienTemple. Đã dùng Node24.18, TS5.9.3, Vite8.3.5, Babylon9.32.
Nếu5196 đang có server thì dùng server đó hoặc dừng đúng server cũ trước khi chạy bản sao. Không đóng các tiến trình khác.

## Những phần đang hoạt động cần giữ
- Chánh điện600×400m,2tầng,50m thông thủy/tầng,5lớp mái vàng cam cong và hiên bốn phía. Sân700×300m, cây/PBR/HDR, cầu thang đi được.
- Hai trụ kinh luân100m, đường kính50m, thân sát nền, thay hai hồ. Xoay theo tương tác, đủ vòng mới cộng công đức.
- Save localStorage an lien: key chính xác anlien.prayer-merit.v1. Không reset/xóa. Save thuộc trình duyệt/origin, không nằm trong ZIP; cùng profile/cổng5196 giữ save hiện có. Đổi cổng/profile không tự mang save theo.
- Dãy100danh hiệu đầu của T0447a, bản Việt Nguyên Thuận,50mỗi bên điện; menu/bảng tên. HIỆN DÙNG CHUNG MỘT THÂN TƯỢNG, KHÔNG PHẢI100 ĐIÊU KHẮC RIÊNG.
- Không có multiplayer, nhiệm vụ tu tập hoàn chỉnh, hoạt cảnh kiết già/cúi lạy hay bản thu kinh trong snapshot này. Không báo những phần đó đã xong.

## Yêu cầu người dùng còn phải làm
Anh muốn100mẫu điêu khắc RIÊNG, giữ100danh hiệu. Anh đã cho phép sáng tác mỹ thuật cho hình dáng/thủ ấn/pháp khí; phải ghi rõ sáng tác của game, không tự nhận là hình tướng kinh điển đã xác minh. Không cần hỏi lại lựa chọn này.
Ưu tiên ngay: làm MỘT tượng đẹp theo ảnh authoring/reference-input/tuong-phat-thich-ca-5.jpg. Vai/tay/cổ liền, mắt/mũi/môi, tóc xoắn và nét chạm khắc rõ. Anh liên tiếp bác các mẫu ghép khối và các mẫu AI mịn bệt; không được nhân100 chỉ vì file khác nhau hoặc tăng số tam giác.
Giữ tiến độ; checkpoint trước chỉnh lớn. Không mua tài nguyên/dùng dịch vụ trả phí khi chưa được đồng ý.

## Kết quả mỹ thuật: CHƯA ĐẠT, không đánh tráo với test kỹ thuật
- public/assets/sanctuary/photo-buddha là TripoSR từ ảnh,110056tam giác, mặt/tóc/ngón tay bị thô và mất rãnh. Người dùng đã bác. reference.html mặc định hiển thị nghiên cứu cũ; không coi là mẫu chốt.
- 48mẫu sculpt-hundred và mẫu ghép đầu bị loại, giữ ở authoring/unapproved; không nằm trong public. Không đưa lại vào chùa.
- Hunyuan3D-2mini đã chạy LOCAL thành công,50steps, seed63122268, FP16, phân giải bề mặt512, trên RTX3050Laptop4GB. Không gửi ảnh lên dịch vụ, không trả phí.
- authoring/hunyuan-study có PLY, .blend,GLB3LOD, ảnh4góc và cận mặt. Sau dọn tam giác lỗi/trùng/diện tích0 còn1992404mặt,996187đỉnh; High giữ toàn bộ số này. Hai triệu mặt vẫn chưa phục hồi tóc xoắn/ngũ quan như ảnh. Có tấm biển do watermark ảnh bị AI dựng thành vật thể ở gối và hình nền thừa ở chân. Mẫu này CHƯA ĐƯỢC CHẤP NHẬN.
- Không voxel-remesh/làm mịn/giảm lưới High trong mẫu Hunyuan để tránh làm mất thêm rãnh. LoD nhỏ chỉ là tùy chọn nghiên cứu.
- Đã lên ý định fit tỉ lệ mặt theo ảnh và dùng ảnh cho relief/normal, hoặc thử ảnh đầu vào784px. CHƯA TRIỂN KHAI các bước này. Đừng báo là đã khắc lại tóc/mắt.

## Tiếp tục phần AI mà không làm lại mọi thứ
Gốc gói giữ cấu trúc projects/AnLienTemple và tools, nên runner dùng đúng đường dẫn tương đối.
Dùng tools/reconstruct-buddha-hunyuan-stream.py. KHÔNG dùng bộ nạp đồng thời reconstruct-buddha-hunyuan.py; nó đã dừng khi nạp toàn bộ trọng số.
Streaming nạp lần lượt conditioner/model/vae lên GPU, giải phóng từng phần. Đã sửa dtype FP16 và bỏ encoder/pre_kl không dùng ở VAE decoder-only. Có cache conditioning.pt và latents-final.pt; chỉ xuất lại lưới thì tái dùng latents, không cần dựng lại50bước.
Vendor Hunyuan đã vá lỗi tọa độ trong volume_decoders.py: next_points=torch.stack(nidx,dim=1).to(torch.float32). Nếu dùng số nguyên, độ phân giải tọa độ bị cắt về0 và bước hierarchical bị lỗi emptyTensor.
Đã dùng scikit-image0.25.2/Lewiner gốc thay adapter PyMCubes ở Hunyuan để xử lý ô thể tích được mask. PyMCubes vẫn cần cho pipelineTripoSR.
Các script clean-hunyuan-study.py,inspect-hunyuan-components.py dọn topology; prepare-hunyuan-study.py chuẩn hóa hướng/cao, xuất GLB và render. Không coi dọn topology là thêm chi tiết.
TripoSR scene-code.pt, extract-buddha-scene.py lưu lại để tra cứu. Không cần lặp lại phương án này để có thêm file mờ.
Ảnh gốc và các mask ở authoring là dữ liệu bàn giao riêng, không tự đưa vào bản phát hành.

## Server xem nghiên cứu riêng
node tools/temple-private-study-server.mjs -> http://127.0.0.1:5197/reference.html?study=hunyuan
Nó chỉ phục vụ GLB từ authoring/hunyuan-study/glb qua route riêng và mã viewer từ dist. Chùa5196 vẫn độc lập; không chép Hunyuan vào public/runtime.
Nút Cận mặt và Cận bàn tay hỗ trợ đánh giá. Khung hình2triệu mặt có thể cập nhật chậm; chờ khung hình thật sau thao tác trước khi kết luận nút không chạy.

## Nguồn, quyền sử dụng, giới hạn
Các nguồn/giấy phép hiện có phải giữ nguyên ở ASSETS.md và public/assets/.../CREDITS.md. Tượng chính là MeshyAI/rbmarbletempleartsCCBY4.0, không gọi là bản scan; hai mẫu MiaCC0 là scan lịch sử.
Hunyuan dùng Tencent Hunyuan3D2 Community License, có giới hạn lãnh thổ và điều kiện sử dụng; xem tools/models/Hunyuan3D-2mini/LICENSE. Output nghiên cứu không phải tài nguyên phát hành toàn cầu không hạn chế. Chỉ giữ thử nghiệm riêng, rà quyền trước khi đưa vào game quốc tế.
TripoSR MIT. Ảnh người dùng cung cấp không có xác minh quyền phát hành thương mại tượng/ảnh gốc; ghi đúng nguồn, không tự tuyên bố CC0.

## Kiểm chứng
Build nguồn hiện tại và19test kỹ thuật đã chạy qua ở lượt trước; sẽ ghi kết quả đóng gói cuối ở HANDOFF_VERIFICATION.json. Test chỉ kiểm cấu trúc/lưu công đức/tọa độ/GLB, không xác nhận đẹp hoặc giống ảnh.
Đã xem thực tế lưới Hunyuan trong Babylon, các góc và cận mặt. Chưa đạt yêu cầu mỹ thuật của anh. Chưa kiểm full100tượng hoặc hiệu năng trên nhiều GPU.
Không có trọng số AI nhiềuGB, môi trường Python/npm cài sẵn, Blender.exe, hay cây nguồn tải lại được trong gói. Có manifest tải đúng trọng số, phiên bản phụ thuộc, codevendor đã vá và GLBruntime đầy đủ. Game chạy được mà không có AI.

## Thứ tự nên làm tiếp
1. Giữ bản game đang hoạt động và save. Xem trực tiếp ảnh gốc, cận mặt của hai thử nghiệm để hiểu lý do bị bác.
2. Làm sạch đầu vào khỏi phần watermark/nền không thuộc tượng; phục hồi nét chạm khắc thật bằng phương pháp phù hợp hoặc điêu khắc có kiểm soát. Không chỉ tăng tris, blur bóng hay ghép đầu.
3. Chứng minh một mẫu ở cận mặt/tay và góc360; ghi rõ phần đo được từ ảnh và phần suy đoán.
4. Chỉ sau khi một mẫu đạt chất lượng mới tổ chức100model riêng, LOD/normal bakes và bố trí vào điện. Không đổi tên100clone thành100điêu khắc.

Bàn giao nghi lễ mới: xem docs/HALL_CEREMONY.md và IMPLEMENTATION_STATUS.md mục20sư, source CeremonyMonks.ts/CeremonyPlan.ts, viewer ceremony.html. Nguồn Monk đã được người dùng chọn; giữ áo trong vàng/cà sa đỏ kẻ vàng.45test đạt, build đạt; còn cần chỉnh ngón tay nắm dụng cụ, cloth cận cảnh và tối ưu cảnh chùa. Không quay lại nhân vật ghép khối cũ cho nhóm nghi lễ.

Bản sửa cổ tay rời mới: ConnectedArms.ts + CeremonyMonks.ts,48test đạt. Ưu tiên giữ đường nối vòng cổ tay thật; không quay lại rig ước lượng vị trí cổ tay. Checkpoint/giới hạn tại IMPLEMENTATION_STATUS.md mục Sửa cổ tay rời.

## Bàn giao 01/11/2026 — tường Phật và122sư
Đọc mục mới nhất IMPLEMENTATION_STATUS.md và docs/BUDDHA_WALLS.md. CeremonyPlan.ts hiện100lạy+10đi+12nghi thức; giữ ConnectedArms/nguồn Monk đã duyệt. Hai checkpoint riêng trước đổi tường và trước mở rộng nghi lễ.54test/build pass, WebGL thấy đội hình và5600ô, ảnh large-assembly-hall.png. Cảnh nặng≈1FPS ở phiên IAB; ưu tiên pose sharing/mesh instancing/crowdLOD thay vì tăng actor tiếp. Viewer5–11FPS. Chưa benchmark đaGPU/mobile hoặc rà hết góc/tầng hai. Giữ save công đức/online/nguồn/giấy phép, không nhận là animation vật lý hay mỹ thuật đã hoàn thiện.

01/11: assembly-2 giãn100vị lạy thành2m giữa tâm cả ngang/dọc, bằng nhóm đệm (4m²/người thay2m²). Hai test bố cục đạt/build đạt, không đổi rig hay số actor.

Bản assembly-3: hai đoàn đi mỗi bên10vị, tổng20đi;100lạy cách2m và12nghi thức giữ nguyên, tổng132vị. CeremonyPlan.ts và UI đã cập nhật,2test bố cục/tuyến đạt. Mọi giới hạn rig/hiệu năng trước vẫn áp dụng. Xem mục mới nhất IMPLEMENTATION_STATUS.md.

## 01/11 — đạo tràng phật tử
Đọc docs/LAY_ASSEMBLY.md và mục mới nhất IMPLEMENTATION_STATUS.md. Mới: 1.500chỗ/15hàng,15đệm lễ,tốp15đi lên/3lạy/vềđúngchỗ; giữ132sưcũ. Source creator424 dùng chung, áo xám,khôngtải/mua mới. LayAssemblyPlan.ts là lịch/trạng thái thuần, LayAssembly.ts thininstances+LOD+15activeactors; CeremonyLibrary.update giới hạn132actor đầu để không cập nhật đúp người đanglễ, includeLay=false giữ viewer nghi lễ cũ. Cần ưu tiên mỹthuật gần (mép/áo/giải phẫu), cloth/ngón/chân, transition, navigation néplayer và benchmark; chưa coi photoreal hay motioncapture. Main tự tải, không nhảypha, không cộngNPCmerit, khônglưu lịchnghi lễ. Viewer lay-assembly.html có nhảypha QA.
Kiểm cuối60test toàn dự án pass (lay-assembly-all-tests.log),6test mới. Nhóm phật tử dùng delta thực chặn.25s, độc lập bước.035s của hệ cũ. Điểm còn lại/mỹthuật/motion/hiệunăng xem LAY_ASSEMBLY.md.
Kết quả cuối:60/60test toàn dự án pass, TypeScript/Vite build9,37s; log lay-assembly-{all-tests,build}.log. Link main revision=lay-3; không coi đãbenchmark/duyệtmỹthuật. Ảnhmain/QA trongdocs.

## 01/11 — dọc/hair/white ceiling
LayAssemblyPlan.ts hiện15hàngdọc×100,3,2m/s,3lạy×8s; nextAfter=outward+bowing+2 để lượt sau khởi hành lúc lượt trước đang về. layTimeline bảo toàn100tốp/3bank15rig, testkhôngtrùngbank/đệm2vòng. Returnpathkhácoutbound. LayHair.ts mái ômđầu/tócbúi2LOD, dynamicheadmatrix, chỉphật tử. 750/750profile, nguồnbodyface vẫncreator424 chung, chưa thật sự đa dạngnamnữ. SanctuaryArchitecture thêm lớp trắngdưới tầnghai vàtrầntrắngmới, giữgạchbôngtrên/ôthang/cộtgỗ.62testpass, logslay-vertical-*.log, checkpoint20261101-vertical-hair-white. Cầnđọc IMPLEMENTATION_STATUS.md mới nhất vềkiểmUI/giới hạn.
KiểmWebGL: docs/lay-vertical-hair.png (búi/tócngắn),lay-vertical-overlap.png (hai tốp),lay-vertical-white-hall.png (hàngdọc/trầntrắng). Main vẫn≈6FPS IAB,62test/build8,84sđạt, noerrorconsole. Trầntầnghai chưaxemUI lại, dùngcùngmaterial. Giữ mọi giới hạnface/body/cloth/navigationđãghi.

Tóc mới fitted-black-1: bỏmũtócước lượng, chiếu lưới tóc sát mặtđầu nguồncreator424, phủnape xuốngthấp, búi sátgáy; đen#030303/giảmF0vàHDRphảnxạ.64testpass/build6,88s; xem IMPLEMENTATION_STATUS.md mụcSửatóc, ảnhfitted-black-hair-close.png. Hairmesh làbiếnthể chiếutheođầunguồn, giữCC BY4.0/ghi công. Còn giớihạnnguồnbody/cloth vàchưa haircards/physics tóc.

01/11soft-sleeves: factory có SleeveDrape.ts trụcgravityY, khung khôngsuybiến, outshift6/22mm, biếnthiên nhỏ, cap gầnfloor; blendclothchest1.12…1.38, seatedskirt1.12/.42/1.12.67testpass gồm3mới+4seam/IK liênquan, buildlogsoft-sleeves-build.log. KHÔNGGIỮ thửnghiệmcắt/bỏgasa hoặccopybumptexture: đãrollbackđểtránhkhe. LayAssembly.ts bảncuối giữnguyênlớpgốc. Cần nghệsĩ/chỉnhvảicận/va chạm, khôngclothsimulation. Status/docsLAY_ASSEMBLYmục mới nhất ghiQA/giới hạn. Checkpoint20261101-soft-sleeves.

## Chân khi ngồi và lạy — 01/11/2026
Nguyên nhân: loader từng bỏ tam giác da dưới y=.88m, đồng thời ẩn pants/shoes khi ngồi/lạy. Đã khôi phục phần chân nguồn, giữ quần ở mọi động tác; sandals chỉ hiện khi đứng/đi. Tách tam giác bàn chân nguồn dưới .15m thành mesh chung với vật liệu da, không dựng chân bằng hình khối và không đổi file GLB. Gấu quần nâng lên để lộ bàn chân; sửa tâm bind foot theo nguồn x±.20,y.075,z-.02. RitualLegs.ts giữ chiều dài đùi/cẳng chân bằng IK: ngồi bắt chéo, cổ chân lệch cao; quỳ đầu gối sát đệm, cẳng chân gập về sau. Giới hạn gấu áo quỳ để không chui qua nền. Tay áo vẫn dùng SleeveDrape.ts như mục trên, chưa phải mô phỏng vải.
Đám đông ngồi: đã thử bake CPU cả near/far nhưng kiểm UI có bề mặt bị lỗi; đã hủy thử nghiệm đó. Near giữ geometry nguồn + skeleton pose chung như bản trước, far bake/giảm lưới rồi thin-instance. Không tạo 1.500 rig mới. 45 actor lễ động vẫn rig riêng; tóc, lịch lễ, vị trí đệm và tiến độ giữ nguyên. Checkpoint authoring/checkpoints/20261101-visible-legs và 20261101-soft-sleeves.
Ba test mới kiểm chiều dài khớp, chân bắt chéo, đầu gối/cổ chân xuyên suốt chu kỳ lạy và bước đi. Kết quả build/test/UI cuối xem đoạn xác minh bên dưới. Giới hạn: chưa có cloth collision hay retarget animation do nghệ sĩ làm; nếp vải nguồn và khớp gập cận cảnh còn cần cải thiện. Chưa nghiệm thu toàn bộ từng NPC/mọi góc nhìn/GPU/mobile.

Xác minh cuối: toàn bộ70/70test đạt (docs/visible-legs-all-tests.log); sau chỉnh hướng bàn chân,10/10test chân/cổtay/tay áo vẫn đạt (docs/visible-legs-tests.log). TypeScript/Vite build bản cuối tại docs/visible-legs-release-build.log. UI đã xem ngồi bắt chéo và chân phía sau khi quỳ/lạy trong ceremony.html; khôngerrorconsole. Geometry bàn chân nguồn còn thô, ngón chân/nếp vải/chỗ cổ chân cần chỉnh mỹ thuật thêm; không coi đây là mẫu nhân vật hoàn hảo hay mô phỏng vải mềm thực. Giới hạn hiệu năng chánh điện trước đây vẫn chưa giải quyết; không báo FPS viewer là FPS game.

UI cuối visible-legs-7: near dùng lại skeleton chung đã hết lỗi mặt/vải của thử nghiệm CPU, thấy hai chân phật tử phía trước đệm; khôngerrorconsole. Ảnh docs/visible-legs-seated.png. Gấu quần chốt .13m trong rest pose để phủ cổ chân tốt hơn; vạt quỳ scaleY.42/scaleZ.75 để chân sau không bị tà áo nuốt.

Chỉnh nối gấu quần: phần cuff .13–.24m blend về xương foot, cùng hướng với bàn chân thay vì giữ toàn bộ theo calf; phần cao hơn vẫn theo cẳng chân. Tránh để cuff đứng yên trong khi bàn chân xoay bắt chéo/gập ra sau. Geometry chân nguồn không có độ chi tiết ngón tốt, chưa coi mỹ thuật hoàn tất.

## TikTok LIVE Companion — 01/11/2026
Đã triển khai tool độc lập local5197, mặc định @mai.hoaithanh. Dashboard live-control.html / overlay live-overlay.html (/overlay); nhận member/like/share/chat, tên+chào vào chùa, tim/chia sẻ “công đức vô lượng”, bình luận hiện ngay và tùy chọn TTS. Chuông tổng hợp + WebSpeech, chọn giọngvi-VN, âm lượng/tốc độ/tắt tiếng/clear/chặn tài khoản, khóa một tab phát tiếng, queue12/TTL25s và cooldown chốngđọctrùng. Chạy MO-TOOL-LIVE.cmd hoặc npm run live. Không sửa gameplay/save/hình học/ceremony của chùa. Vite thêm2entry; ws cập nhật8.21.0, tiktok-live-connector2.5.0 AGPL-3.0-only (giữlicense tronglive). Không có APIkey/sessioncookie, không mua/tạo dịch vụ trảphí.
Checkpoint authoring/checkpoints/20261101-live-tool. 9/9test tool và79/79toàn dự án đạt (docs/live-tool-tests.log /live-tool-all-tests.log), build đạt (live-tool-build.log); audit0vulnerability theo kết quả kiểm. Test dùngfakeconnector gồm lifecyclecancel/timeout/offline, schema2.5/dedup/cooldown/countdemo/bounds/blocked/origin và4event quaHTTP/WS.
Đã kiểm UI nút thử4loại, previewoverlay tên/bìnhluận/côngđức có nhãn THỬ, countLIVE vẫn0. Giọng Microsoft An vi-VN có trên máy, trạng tháiđọc→sẵnsàng hiệnquaUI; chưa ghi/nghe kiểm âm cuối trênOBS. Thử connector thực @mai.hoaithanh trả UserOfflineError (The requested user isn't online), mappingđãsửa/test; chưa xác minh eventLIVE thật, không tuyên bố kết nối thành công. Chưa nghiệm thuOBS/TikTokLIVEStudio/phiên dài/tải lớn; APIkhôngchínhthức cóthể bịgiớihạnhoặc thiếuevent. Hướng dẫn/source/license/việc tiếp: docs/TIKTOK_LIVE.md.

Chốt UI: sửa việc chủ động Tắt/clear bị speechSynthesis báo canceled thành lỗi; clear bỏ tham chiếu utterance trước cancel, handler bỏ qua utterance đã hủy. Đã kiểm trạng thái Đã tắt âm thanh sau thao tác. Connector chủ động bỏ SIGN_API_KEY/SIGN_API_URL từ môi trường bằng SignConfig trước tạo client, không dùng key/quota trả phí máy có sẵn. 9/9test tool vẫn đạt sau sửa backend; build cuối đạt sau sửa speaker.

## Đã cập nhật server online — 01/11/2026
Revision `2026-11-01-live-legs-1` đã phát hành lên **https://dichua.palo.io.vn/** và build local5196. Bao gồm toàn bộ source hiện tại (tay áo rủ, chân ngồi/quỳ, tóc, đội hình/nghi lễ) cùng nút TikTok LIVE trong local và khi online có `?broadcast=1`. Nút mở companion localhost5197 ở tab riêng; không nhúng HTTP vào HTTPS, không phát hành admin/API LIVE lên web công khai. Khách thường không thấy nút này.

Buildpublic tách `dist-public`, không tạo2entryLIVE/reference, prepare-public loại2thư mục guardians/photo-buddha rồi packkiểmtra lại. NguồnLICENCE/mô hình còn lại giữ nguyên. `deploy/update-existing.sh` mới sao lưu app/web/SQLite, giữ hashedchunks cũ và đổi app/web rồi chỉrestart `anlien-server`; không chỉnhCaddy/sitekhác, không ghi đè DB. `deploy/DEPLOY.md` cập nhật quy trình. Ws trênserver đã kiểm8.21.0.

Checkpointlocal `authoring/checkpoints/20261101-server-update`. Archive265.6MB SHA256 `b3a67a12dc7a83bb94565c844238d326e9d99babddbb7caa3782f62b86032e8a` khớp trước/sauupload. Backuponserver `/root/anlien-backups/2026-11-01-live-legs-1-20261101T021903Z` (UTCtimestamp, quyềnriêngtư). SQLitebackupAPI dùng snapshot; thống kêtrước/sau giống hệt:2users, tổngwheel22/incense2/bows25/sits72; giữ sessions/dữliệu hiện tại.

TypeScript/Vite local vàpublic đều đạt (`server-update-local-build.log` /`server-update-public-build.log`). 15/15testserver+LIVE đạt (`server-update-server-tests.log`):đăngnhập/đăngký, lưu côngđức,2người, đilêntháp, reconnectgiữvịtrí và9testbridge. Lần chạy đầu test từcwdrootkhông khởiđộng được testserver; đã chạy lại đúngcwdproject và đạt, không phải lỗi production.

HTTPservervà tênmiền health `{ok:true,online:0}`, `/release.json` đúngrevision. HTMLpublic trỏ main-DmfwRn88.js; SHA256 bundleCDN `fe8fc5efb3cf8b5e135b9791466941d3a8ceb491e87b401183443af44c610bbf` khớp buildlocal. APImeẩn danh401 nhưđúngthiếtkế. `server-update-verification.json` lưu kếtquả. Kiểm trực tiếponserver cácfileLIVEriêng và2foldertàinguyênhạnchế đều không tồn tại trongwebroot.

Đã mởQA đạo tràng qua HTTPS, thấy1.500phật tử/tóc/tayáo/chân với revisionDOMđúng, khôngerrorconsoleởlầnchụp; ảnh `docs/server-update-online-assembly.png`. Khônggọiđây là đãcải thiệnmỹthuật/hiệu năng hơnbảntrước; đây là đồngbộbảnmớilênserver. Cácgiới hạn chân/vải/khungshader/hiệu năng đãghi ởmục trước vẫnápdụng. Chưa đăngnhập tài khoản thật haykiểm hànggiờ/bộthiếtbị saudeploy; testserver dùngDBtạm.

TikTokcompanion5197trênmáy vẫntrảHTTP200. Tài khoản @mai.hoaithanh chưa cóphiênLIVEđểnghiệmthu sựkiệnthật/âmthanhOBS; khôngđưa toolvàoproductionpublic haytuyênbố đãliveconnected.

Kiểm mainonline cuối: tài nguyên10/10/PBR/100danhhiệu/132sư/1500phậttử/tường5600ô đều báo sẵn sàng, nútTikTokLIVEhiệnvới broadcast=1, formđăngnhậphiệnđúng; ảnh docs/server-update-online-main.png. Không đăngnhập tài khoảnthật. Main quan sát4FPS trongIAB, hiệu năng chưa đạt và không được coi là đã tốiưu tronglần deploynày. Tab game đã giữ ởđườngdẫnonlinebảnmới.

## Bình luận nhận chỗ ngồi và tên trên đầu — 01/11/2026

Đã triển khai trong companion local5197: bình luận đầu nhận ghế, map theo TikTok userId/uniqueId; bình luận tiếp giữ ghế, nam/nữ đổi tóc, rời chùa trả chỗ. Tên được chiếu từ tọa độ3D trên đầu NPC ngồi thật. Ghế đã nhận giữ yên, NPC còn lại vẫn dùng lịch nghi lễ. Giữ phiên trong RAM, nhận snapshot khi tải lại; không lưu qua khởi động server.

Dashboard có danh sách, nút Xem để focus camera, xóa ghế thử/reset riêng. Demo có nhãn, không tăng số liệu thật. LiveSeatTags giới hạn48nhãn gần/không đè nhau. Riêng LIVE giảm NPC nền chưa nhận xuống300, bản sao gần24 và độ phân giải WebGL, không giảm đội hình của chế độ thường. Có thêm dispose scene/engine khi rời viewer. Chưa hứa FPS hoặc giải quyết toàn bộ vấn đề tải/capture chậm đã gặp.

Cảnh nhẹ: http://127.0.0.1:5197/live-seats?clean=1 ; cảnh chùa đầy đủ: http://127.0.0.1:5197/temple?q=low&view=lay-assembly&liveSeats=1 . Cùng origin bridge để tránh mixed content/CORS. Không mở admin/public API hay cập nhật server online trong lượt này. Game online/tài khoản/công đức giữ nguyên.

Checkpoint authoring/checkpoints/20261101-live-seats. 16/16test bridge/registry và86/86toàn dự án đạt trước tinh chỉnh render LIVE cuối; build cuối xem docs/live-seats-build.log. UI đã thấy ba tên đúng trên nhân vật, bình luận lặp giữ3ghế, focus An Lạc đúng, snapshot còn3người khi tải lại. Có lần CUA/capture timeout lúc tải cảnh; đã ghi đúng giới hạn. Chưa nghiệm thu TikTok thật/OBS/cảnh chùa đầy đủ/tải lớn/mọi thiết bị. Nhân vật nữ hiện chỉ đổi tóc; chưa có sư/ni riêng, chưa có animation đi từ cổng vào ghế. Hướng dẫn, kiến trúc và việc tiếp theo: docs/LIVE_SEATS.md.

Bản cuối đã build thành công (50,29s). Sau giảm tải phần nền, mở lại cảnh nhận đủ3tên/chỗ cũ, HUD ghi rõ THỬ/CHƯA NỐI TIKTOK và đã capture được ảnh `docs/live-seats-names.png`. Cảnh và dashboard được giữ mở; chỉ có dữ liệu demo, âm thanh chưa bật. Không coi capture thành công là benchmark hoặc nghiệm thu TikTok/OBS thật.
Kiểm cuối fit-2: Blender export đạt; tsc/Vite local build đạt (docs/ao-dai-sleeves-web-build.log,1m25s);2/2test actualGLB đạt sauassetUV2cuối. Viewer đã biên dịch shaderAoDaiCloth trêntrìnhduyệt, consoleerrorrỗng. Có ảnh cuối ao-dai-sleeves-prayer-final.png (taykhôngrời/khônglộkhuỷu), ảnh GPU đangquỳ/nhìnsau ao-dai-sleeves-clearance-walk.png (tênfilewalk nhưng người dùng đã đổi sangQuỳ khichụp, khôngnhậnđâylàảnhđi); cácảnhtrunggianwalk cómảngtrắngxuyêntrướccapsule khôngdùnglàmnghiệmthu. Bảnmẫu cóngườidùngtươngtác trongphiênQA nên khôngcoimỗilầnclick là đãxongkiểmởtưthếđó. Cuffskin đãkiểmđủ20phaclips+9poses bằngNullEngine. Chưa có benchmarkGPU/kiểmfullmọigócngồilạy/va chạmtựthân. Khônghứahết100%mọixuyênvải; khôngdeploygamechính.
Modelcuối80bones/6clips/15.639tris; SHA25673790cf02ae961b0e77fa5470157a49e8c01fa607b0b86cf9cea93f2d7df9cef. Đãcậphash/credits vàcopyđúngdist. Linkbảnmẫu: http://127.0.0.1:5196/rigged-people.html?outfit=ao-dai&revision=fit-2 . Giữmẫucũtrongcheckpoint, gameonlinekhôngđổi. CầnđemcảruntimeAoDaiCloth vàUV2 khi tíchhợp, chưađượcthayGLBđơnlẻvàoonline.
Đã rà cận trước và quay ra sau trên trình duyệt: vành cổ sau hiện rõ hơn sau dịch25mm; ảnh góc sau được lưu trong docs/ao-dai-neck-forward-side.png (tênside nhưng góc chụp thực tế từsau). Chưa rà đủ mọi pha cúi/quay đầu cho fit-4; kiểmcuff/asset không thay thế kiểm toàn bộ tiếp xúc cổ/vải.

Bổ sung nút Cổ áo sau trong rigged-people.ts để đặt camera trực tiếp vào vành cổ sau gáy, giúp kiểm vành mà không cần kéo xoay. Viewer trước sửa nằm trong checkpoint cổ áo fit-5. Build web/ảnh góc sau cuối được ghi tiếp khi hoàn tất.

Fit-5 có bổ sung nút Cổ áo sau; TypeScript và Vite local build đạt (docs/ao-dai-collar-rim-web-build.log). Kiểm asset/cuff2/2 đạt trước đó, modelkhôngđổisaukiểm. Vẫn chưa rà hết mọi pha gập/xoay đầu; giới hạn cloth cũ giữ nguyên. Không triển khai mẫu lêngameonline.

Đã kiểm góc sau bằng nút Cổ áo sau trên trình duyệt: mép trên hiện liền và đều, không còn đường răng cưa rõ như ảnh fit-4. Ảnh cuối: docs/ao-dai-collar-rim-fit5-back-final.png. Các ảnh chụp trước khi thêm nút có thể là góc khác do tương tác đồng thời, không dùng làm bằng chứng góc sau.

## Bộ 10 mẫu áo dài — 02/11/2026
Bộ phối mới dùng chung rig/model fit-5, SVG hoa văn và màu quần/tóc riêng, sáu kiểu tóc. Xem docs/AO_DAI_COLLECTION.md và trang local5199/ao-dai-collection.html?revision=ten-3. Mỗi clone có skeleton/material riêng; giữ UV2 chống xuyên và thêm UV3 hoa văn. Chưa thay online, chưa kiểm tất cả kiểu tóc/poses trên mobile.

Bộ10 đã build và xem được trên local5199. Lần cuối tách lại búi gốc theo nhiều material, nhuộm tóc rời toàn phần và giữ da vùng scalp; mười mẫu là phối trang phục/tóc trên cùng khuôn mặt. Đọc docs/AO_DAI_COLLECTION.md về kiểm tra/giới hạn và các module phải giữ khi tích hợp. Chưa deploy online.


## 02/11/2026 — Chốt và dừng
Đã lưu phần nguồn 500 phật tử, chưa QA đồ họa và chưa deploy. Chi tiết cuối IMPLEMENTATION_STATUS.md; checkpoint authoring/checkpoints/20261102-crowd500. Không tiếp tục công việc còn lại khi chưa có yêu cầu mới.

Public mới nhất: 2026-11-03-four-kings-closed-2, đã đưa bốn tượng Thiên Vương50m kín lưới lên server; tài khoản/côngđức giữ nguyên. Log+giới hạn cuối IMPLEMENTATION_STATUS.md và docs/FOUR_KINGS.md. Phần500NPC vẫn tạm dừng ở TempleLife500.ts, không bật public.

Public mới nhất2026-11-03-crowd500-1: ĐÃ bật500NPC theo yêu cầu mới, không còn dừng ởQA. Source main dùngTempleLife500; chi tiết/backup/kiểmchứng/giới hạn docs/CROWD500_RELEASE.md và cuốiIMPLEMENTATION_STATUS.md. Hiệu năng viewerlocal cònthấp, chưa đạt30/60FPS; publicHTTP/hashđạt, chưaQAtoàncảnhGPU/mobile. Không làm tiếp điêu khắc.

03/11/2026: thêm7tượngnguồnZIPanhcungcấp vàosân,phậtnằm20mĐôngđốidiệnkinhluân,sáutượng10mdọcphíatrướcsân. Docs/COURTYARD_SEVEN.md+IMPLEMENTATION_STATUS.mdghi nguồn/hash/checkpoint/QA. 17tests,build,21LODkín. Giữ500NPC,khôngtiếptụcsculptTripo. Chưakiểmfullwalk/FPS/mobile. XemstatusdeploycuốiIMPLEMENTATION_STATUS.

Bản 7 tượng đã deploy: 2026-11-03-courtyard-seven-1. Server health, main SHA và 7 far GLB SHA đã kiểm. Backup/log/giới hạn ở cuối IMPLEMENTATION_STATUS.md. Giữ 500 NPC và mọi tính năng trước; hiệu năng vẫn cần tối ưu.

Phật nằm đã chỉnh theo yêu cầu mới: (285,540), yawπ hướng vào chánh điện, bệ64×20m sát ngoài mép trước sân phía phải; cao20m. Đã deploy2026-11-03-reclining-facing-hall-2;17tests/tsc/build/HTTPS+hash đạt. Xem status cuối IMPLEMENTATION_STATUS.md. Vị trí(310,388)hướngkinhluân đã bị thay thế.

03/11: Phật nằm hiện(150,540), canh giữa ngang giữa cổngx0 và ThiênVươngphảix300, giữyawπhướngchánhđiện/cao20m/bệ64×20m. Đãdeploy2026-11-03-reclining-centred-3. 17tests/tsc/build/HTTPS+hashđạt;browser timeoutchưaxembằngmắtởlượtdịchnày. XemcuốiIMPLEMENTATION_STATUS.md.

03/11: Đã tắt14tượngđácũtronghall (giữmain-buddhathếpvàng) và25tượng2dãyhiênTây/Đông;giữbệ/layout/GLB đểthaymẫu. Cờ HALL_STONE_STATUES_ENABLED=false / OUTDOOR_GALLERY_STATUES_ENABLED=false; ACTIVE_GARDEN_STATUES dùngrender/load/menu,ALLgiữnguồn. Bỏcollisionthântượngẩn. Deploy2026-11-03-hide-old-stone-1,19tests/tsc/build/HTTPS+SHAđạt,chưakiểmbrowser. Backup/log cuốiIMPLEMENTATION_STATUS. Serverfullarchivevẫncentred-3,đãphủcodeoverlay2.5MB;deploytiếpcầnfullbuildmớihoặcoverlayđúngbaseline,khôngdùngarchivecũđèbảnmới.

03/11: Đã thêm sông/cầutamquan, deploy2026-11-03-entrance-river-1. Sông790×40m, mặt−2.4/đáy−5m; cầu70×14mđỉnh8m, chung caođộ render/playerlocalonline;8bậcdàivàlan canđátrắng. ServerSpawn680/worldz720/ymin−6;phảiđónggóiEntranceRiverPlan.ts.27+6tests/tsc/buildđạt, browserQAroutequađỉnh8m/về0mđạt;fullsceneavatar/mobile/FPSchưakiểm. Docs/ENTRANCE_RIVER.md/statuscuốicólog/backup. Fullarchiveentrance1cầnkèmcodepatchentrance-river-overlay.tar.gzđểcónormalscuối;deploytiếpbuild/packlạitừsource,khôngdùngarchiveđơnlẻ.

03/11: bậc xuống nước đã nối kín/mở toàn bộ frontage, bỏ rail ở chân bậc; cầu thânđáđặc cóvòmbánnguyệtR9 chạm mặtnước,4trụvuôngcao~5.4m. Deploy2026-11-03-river-stairs-solid-bridge-2;29tests/tsc/build/HTTP+SHAđạt;browserQA xuống−2.24 vàquađỉnh8→0đạt. Docs/ENTRANCE_RIVER.md vàcuốiIMPLEMENTATION_STATUS.md ghi kiểmchứng/giới hạn. Chưa cóthảhoađăng/bơi;fullscene/mobile/underwatercollisionchưakiểm. Archivebaseentrance1 cần overlay river-stairs-solid-bridge-overlay.tar.gz;deploytiếp nênpack từsource mới.

03/11: Bậc hai phía nối sát tườngcầu (méptrong6.975m, cầu7m), chunggeometry/footheight. Cổngtamquan tăngcột18m, đỉnh27.4m,máisâurộnghơn,bảngtênnângtheo;chânvẫny0. ENTRANCE_GATE trongEntranceRiverPlan.ts. Deploy2026-11-03-stair-bridge-join-tall-gate-3;30tests/tsc/build/browserQArouteđạt. XemcuốiIMPLEMENTATION_STATUS.md;fullscene/mobile/publicbrowserchưakiểm. Archivebaseentrance1 cần overlay stair-bridge-join-tall-gate-overlay.tar.gz;ưu tiênpacktừsource mới khi deploy tiếp.
