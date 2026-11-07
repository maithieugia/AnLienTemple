# Tường phù điêu Phật vàng — 01/11/2026

Dùng nguồn quét tượng đồng ngồi của Minneapolis Institute of Art, CC0, đã có tại assets/sanctuary/statues/buddha/high.glb. Đối chiếu nguồn gốc tại https://collections.artsmia.org/art/1753/seated-buddha-thailand và SOURCE.json/CREDITS.md trong public/assets/sanctuary/wall-buddha-relief. Đây là phiên bản chuyển sang phù điêu vàng của dự án, không phải quét một ô gạch vàng có thật.

BuddhaWallPlan.ts phủ 5600 ô 5×5m trên ba tường trong của hai tầng: tường sau 2400 ô, hai bên mỗi bên1600 ô. Giữ tường cửa vào, nền gạch bông, sàn/thang, tượng và nghi lễ. Bề mặt mới ở trong lớp tường chịu lực cũ. Va chạm ba mặt liên tục.

Quy trình tái tạo: python authoring/bake-buddha-wall.py. Raster mặt trước của scan, giữ chiều sâu thành heightfield; tạo albedo/normal/height và grid64/128. Hai nhóm thin instances: xa dùng quad và normal map, gần dùng lưới nổi; Low tối đa6 ô chi tiết, High12 ô. Không nhân bản5600 GLB nguyên bộ. Ảnh tĩnh không thay thế toàn bộ hình học gần. Giới hạn: heightfield chỉ giữ mặt trước, chưa phải tượng tròn đầy đủ; viền nghiêng có thể còn bậc theo độ phân giải grid.

Đã xem mảng12ô, góc nghiêng và tường sau trong chánh điện WebGL; console không error tại phiên kiểm. Ảnh buddha-wall-sample.png và large-assembly-hall.png. Bố cục/normal hướng vào trong cả ba mặt và hai tầng có kiểm tự động. Chưa đi bộ rà hết góc nối/tầng hai bằng UI; chưa benchmark GPU/mobile. Không coi chất lượng mỹ thuật là đã được người dùng duyệt.

Mở wall-relief.html để xem mẫu riêng; ?q=low&view=buddha-wall để xem trong chùa. Checkpoint authoring/checkpoints/20261031-buddha-walls.
