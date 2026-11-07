from pathlib import Path
import re

root=Path(__file__).resolve().parent.parent
log=(root/'docs/river80-deploy.log').read_text(encoding='utf-8-sig')
assert 'DEPLOYED 2026-11-05-river-tower-camera-2' in log
backup=re.search(r'BACKUP (.+)',log).group(1).strip()
counts=re.search(r'After: (.+)',log).group(1).strip()
entry=f'''## 05/11/2026 — Sông 80 m, tượng bên sông, sửa tháp và camera (ĐÃ LÊN SERVER)

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

**Deploy:** chỉ cập nhật app/src, JS/HTML và release, giữ model/texture nén/cache; manifest sinh lại từ file server. Không mua tài nguyên hoặc gọi dịch vụ trả phí. Checkpoint: authoring/checkpoints/20261104-tower-camera, 20261105-river-statues, 20261105-river80. Sao lưu server `{backup}`. Số liệu sau triển khai: `{counts}`; script kiểm tra tài khoản/công đức không giảm. Log docs/river80-deploy.log, kiểm tra runtime server docs/river80-server-verification.log. Chỉ restart anlien-server, không đổi các ứng dụng khác/Caddy.

Game: https://dichua.palo.io.vn/?q=low&revision=2026-11-05-river-tower-camera-2

'''
for name in ['IMPLEMENTATION_STATUS.md','CLAUDE_HANDOFF.md']:
    p=root/name;p.write_text(entry+p.read_text(encoding='utf-8'),encoding='utf-8')
p=root/'ASSETS.md'
p.write_text('''## 05/11/2026 — Sen giữa sông và bảng tên

Không thêm asset mua/tải ngoài. Tượng new-18 dùng nguyên model/vật liệu owner-collection20/18, scale 30 m từ mặt nước −2,4 m, vị trí x150/z640. Sen hoa/lá/gương/cuống là mesh gộp nguyên gốc trong StatueGarden.riverLotus, quanh tượng, không có physics dưới nước. Danh hiệu Phật nằm và tên Thiên Vương chỉ đổi nhãn; file nguồn tượng giữ nguyên. River-shrine.html là QA local; ảnh cũ trước khi bỏ bảng/nới sông được ghi rõ trong IMPLEMENTATION_STATUS.md.

'''+p.read_text(encoding='utf-8'),encoding='utf-8')
print('RECORDED',backup,counts)
