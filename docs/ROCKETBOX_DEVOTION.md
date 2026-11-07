## Cập nhật 01/11/2026 — biển mây + người chơi rig gốc
Chi tiết thay đổi, kiểm chứng/giới hạn, checkpoint và log: docs/CLOUD_SEA_PLAYER.md. Rocketbox đã thay người chơi online (NPC giữ nguyên); các mục cũ nói chưa tích hợp chỉ mô tả giai đoạn trước. Mới thêm biển mây bốn hướng ngoài chùa; không đổi tài khoản/công đức.

# Tư thế lễ trên Rocketbox — 01/11/2026

Theo yêu cầu anh Thanh thử chắp tay/ngồi thiền/quỳ lạy trên2mẫu có xương mới. Chỉ viewer local http://127.0.0.1:5196/rigged-people.html ; chưa thay NPC/người chơi hoặc triển khai lên server.

## Thay đổi

- RocketboxDevotion.ts điều khiển TransformNode gắn với80xương gốc của GLB; giữ nguyên mesh, weights, texture và chuỗi khớp. Không cắt tay/chân ra hay thêm khối thay bộ phận người.
- Chắp tay đứng; ngồi xếp chân trên đệm vàng, hai bàn tay chồng với độ cao khác nhau; quỳ thẳng; lạy rồi trở lại quỳ theo chu kỳ6giây. IK hai đoạn theo chiều dài thật của từng rig, bàn tay định cả hướng ngón và roll theo2trục, duỗi thêm các khớp ngón ở tư thế chắp/lạy. Giữ thumb tự nhiên của nguồn.
- Chuyển tư thế bằng blend0,7s trên khớp gốc, có nút dừng hình. Lạy có thanh mức cúi để xem chính xác từng đoạn; dùng mức100 để rà cúi thấp nhất. Cận mặt/Cận tay lấy vị trí xương hiện tại, không còn nhắm vào tọa độ đứng cố định.
- Có bóng nền, đệm nhỏ dưới hông và tấm lót phẳng để dễ xem tiếp xúc sàn, không dùng đệm dày phủ cả cẳng chân. Quần áo/giày vẫn là đồ đời thường từ mẫu nguồn, chưa phải áo tràng/càsa hay nghi thức đã được thẩm định.
- Checkpoint trước sửa viewer: authoring/checkpoints/20261101-rocketbox-devotion/rigged-people.ts. Không sửa Pilgrim/online/rig Claude hay dữ liệu tài khoản.

## Kiểm chứng

TypeScript/local build: docs/rocketbox-devotion-build.log. Test dữ liệu GLB gốc + test điều khiển hai mẫu thật với Babylon NullEngine (bỏ vật liệu khi headless): docs/rocketbox-devotion-tests.log. Test giữ chiều dài vai–khuỷu–cổ tay/đùi–gối–cổ chân, tọa độ hữu hạn, ngón chắp hướng lên, gối/cổ chân trên mặt đất và đầu hạ thấp khi lạy. Không coi marker xương là bằng chứng không có bất kỳ xuyên da/quần áo nào.

Đã thử cả hai mẫu trong trình duyệt; bản cuối có ảnh rocketbox-prayer-final.png, rocketbox-sit-final.png, rocketbox-kneel-final.png và rocketbox-bow-final.png. Build đạt,4/4 test dữ liệu/pose đạt; console QA không có error. Đệm ban đầu phủ rộng cắt cẳng chân đã đổi thành đệm nhỏ dưới hông + tấm lót phẳng. Một số ảnh first là lượt kiểm ban đầu, không đại diện bản cuối: prayer-first thực ra người dùng đã chuyển sang nữ/ngồi trước khi chụp; prayer-palms là trước khi kéo sát lòng bàn tay; bow-first/bow-side là trước chỉnh độ cúi cuối.

## Giới hạn / còn lại

Đây là prototype pose để đánh giá rig: chưa mô phỏng vải/va chạm cơ thể đầy đủ, chưa tư thế chuyển xuống ngồi theo toàn bộ động học thực tế, ngón cái chưa tinh chỉnh mọi đốt, ngồi xếp chân không khẳng định full kiết già chuẩn. Còn cần sửa điểm xuyên nhỏ ở chân/quần/giày và tiếp xúc lòng bàn tay sau khi chọn tạo hình/trang phục, rà ở mọi góc/cơ thể khác. Chưa bake thành clip GLB độc lập, chưa tích hợp1500người/LOD/online hoặc kiểm điện thoại thật. Không khẳng định đạt mỹ thuật cuối cùng khi chỉ test cơ học qua.
