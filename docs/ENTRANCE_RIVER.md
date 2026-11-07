# Sông và cầu đá trước cổng tam quan — 03/11/2026

Sông chạy ngang phía ngoài cổng z565: dài790m theo trục x, rộng40m từz600 đến640. Bờở0m, mặt nước−2.4m, đáy−5m; địa hình campus được đào xuống thật và mở rộng đếnz720, không chỉ phủ mặt nước lên nền phẳng. Bỏ tường ngang cũ z595 để đi từ sân ra lối bậc đá được. Giữ các thay đổi tượng/500NPC trước đó.

Cầu trên trục x0, từz585 đến655, rộng14m. Mặt cầu là cung tròn cao8m, dày0.85m, có mạch đá, lan can đá trắng với vòng hoa sen/nét cuốn, tay vịn và trụ chạy theo cung. Dùng đoạn cung tròn có dốc tối đa khoảng26°, thay vì nửa vòng tròn đứng90° không đi được. Cùng entranceBridgeY/entranceFeetY điều khiển mặt cầu và chân nhân vật local/online; không dùng collider phẳng. Lan can có280đoạn chặn theo caođộ. Xuống dốc cho phép chân theo mặt cầu ở tốc độ chạy9m/s, không lơ lửng do giới hạn rơi quá chậm.

Bờ trong có8bậc dài chia hai bên cầu, rộngmặtbậc1.2m, cao0.28m/bậc; chiếu cuối−2.24m nằm trên mặt nước. Hai lối mở gầnx±100 cho xuống bậc, lan can ở mép cuối ngăn đi tuột ra lòng sông. Không bổ sung cơ chế bơi mới. Lan can bờ/chuvi dùng cùng các chi tiết đá trắng. Sửa riêng pháp tuyến các ống đá mới bằng CarvedStoneBatch; không sửa toàn bộ SanctuaryBatch cũ.

Nước xanh dương dùng shader gợn sóng biên độ2.5cm+1.6cm, vân pháp tuyến và lóe sáng theo mắt nhìn; low3200/high12800tamgiác, không cần phản xạ/refract toàn màn hình hay dịch vụ trả phí. Đây là nước mỹ thuật, không mô phỏng thủy lực.

Tích hợp: Sanctuary tạo/hủy toàn bộ cảnhsông, theo dõi va chạm; campusGround đào đáy, CloudSea mở vùng trốngcho bờ ngoài. main.ts và OnlineGame.ts dùng cùng hàm caođộ. WORLD_BOUNDS mởz720/y≥−6; lần vào mới SPAWN(0,0,680) trước cầu, reconnect giữ vị trí như trước. Server đóng gói thêm EntranceRiverPlan.ts vì SanctuaryPlan.ts dùng hàm địa hình này.

Kiểm chứng: TypeScript/build public đạt;27/27tests gồm kiểm cung nối đất, độcao8m, đi/chạy hai chiều với chính các đoạn va chạm lan can;6/6online-server tests đạt. BrowserQA entrance-river.html đã thấy nước/độ cong/bậc/hoa văn; chạy capsule theo cùng code chân từz680 qua đỉnh8m tới552, chântrở0m, không cóconsoleerror tại lầnkiểm. Ảnh docs/entrance-river-profile.png và entrance-river-stairs.png. Trang QA chỉ dựng riêng phần cổng/sông, không thay cho chơi lại fullscene500NPC/online-avatar/thửhai tài khoản trên cầu. Chưa đoFPS fullscene/mobile hay kiểm mọi cạnh lan can. main view=entrance-river / view=bridge-walk mở camera/nút kiểm cầu trong gamechính.

Checkpoint authoring/checkpoints/20261103-entrance-river; mã chính EntranceRiver.ts/EntranceRiverPlan.ts. Không mua/tải tài nguyên ngoài. Trạng thái deploy xem cuối IMPLEMENTATION_STATUS.md.

## 03/11 — Điều chỉnh theo góp ý về bậc và thân cầu
Thiết kế hiện tại bỏ lan can ngang chắn dãy bậc và lan can cuối bậc. Chiếu đầu0m ởz597.5 nối mặt bờ,8bậc đầy xuống−2.24m, chiếu cuối đếnz609.5 để tiếp cận nước; các bậc đắp đặc tới nền−5m. Không cần chen qua các khe lan can6m như bản cũ.
Thân cầu chuyển thành tường đá, lòng vòm bán nguyệtR9m gặp mặt nước−2.4m; viền đá trắng và mạch đá lập trình. Bốn trụ vuông3.3m/cao~5.4m ởbốn góc có hoa văn vàcollision. Đường cong mặt cầu/logic lênxuống giữ nguyên. Chưa có thảhoađăng/bơi, chưa xử lý trọn bộ va chạm khi di chuyển dưới nước.
29tests/tsc/build đạt; browserQA xuốngđược−2.24m vàquacầu8→0m, consolekhônglỗi. Ảnh/backup/log/publicrevision trong mục mới nhất IMPLEMENTATION_STATUS.md. Không dùng ảnh entrance-river-stairs.png cũ để đánh giá thiết kế mới.

## 03/11 — Bậc nối sát cầu và cổng cao
Hai dãy bậc hiện kết thúc tại x±6.975, chồng2.5cm vào thân cầu x±7 thay cho khe3m trước đó. Geometry vàentranceWalkY dùng chungdữliệumép.
Cổng giữ chân0m, cột18m/tiết diện×1.5, hai mái56×22/42×16m, đỉnh27.4m, bảng tên vàchữ nângtheo. ENTRANCE_GATE lànguồn dữliệu chung. Không nhấc toàncổng lênkhỏinền.
30tests/tsc/buildđạt; browserQA đãxemmốinối/cổng vàroutequacầu8→0mđạt. Ảnh docs/stair-bridge-join-tall-gate.png. Đãdeploy2026-11-03-stair-bridge-join-tall-gate-3; kiểmchứng/backup/giớihạn cuốiIMPLEMENTATION_STATUS.md.
