## Sửa áo suông / hai bàn tay — 31/10/2026
Theo phản hồi người dùng: thu áo ngoài về bánkính .235→.243m (trước .272→.377m), áo trong .210→.218m. Gấu gầnngang, giảm nếplớn/độ xòe/tay áo phồng; giảm trọngsố chân của vạt để không bungtheo từng bước. Dáng mặcđịnh chắp tay đứngthẳng, chỉnh trục cổ/lưng/chân.
Hai bàn tay: cổtay ±.033m, có nghiêng trục ngón vào nhau nhẹ (bản ±.016m thử trước đó làm hai lòng tay giao nhau), ngón hướng lên, khớp cổtay căn cả trục ngón lẫn phương ngang qua các khớp ngón (PalmPose.ts), thay vì chỉ aim mộttrục. Lượt kiểm cận phát hiện da ngón bị kéo do retarget; đã tách bề mặt bàn tay giải phẫu từ cùng mesh, duỗi/căn ngón một lần, gán cứng theo xương cổtay cho riêng chếđộ chắp tay. Chếđộ đi dùng lại bàn tay/xương ngón cũ; nút Cận bàn tay trong viewer để kiểm từnhiều góc. Động tác cũ sit/kneel/bow giữ nhánhriêng.
Checkpoint authoring/checkpoints/20261031-straight-robe-palms.43test đạt gồm thử phép căn hai trục trên bàn tay trái/phải; buildlog straight-robe-build-final.log. Lịch sử áo xòe bên dưới đã được thay trong mẫu riêng. Chưa coi mỹthuật mặt/vải là hoànthiện, chưa nhân10 hay đưa vào NPCmain; chưa kiểm mọi clip/thiếtbị.

# Nhà sư theo concept — mẫu riêng,31/10/2026

Nguồn tham chiếu: ảnh người dùng `Saffron Monk Character Concept Sheet.png`, lưu bản gốc tại authoring/monk-reference/concept.png. Chỉ dùng để tham khảo tạo hình; không coi các nhãn trong ảnh là thông số texture/rig thực. Không tải lên dịch vụ, không dùng dịch vụ trả phí.

## Đã dựng
- Prototype riêng `monk-reference.html`, factory `src/game/chars/SaffronMonk.ts`. Chưa thay10mẫu trong game: người dùng đã chê bộ cũ, mẫu mới cần được xem chất lượng trước khi nhân bản.
- Giữ nền giải phẫu/UV/xương hiện hữu MinhV2. Chỉnh nhẹ tỷ lệ hàm/trán và dùng Blender4.5.9LTS làm mịn bề mặt. Đây không phải đầu được điêu khắc hoàn toàn mới hay tái dựng khuôn mặt chính xác từ nhiều ảnh.
- Skin134664tam giác,69656đỉnh; mắt1032tam giác. Bỏ trùng đỉnh cùng vịtrí/UV/pháp tuyến/trọng số, làm tròn6chữ số: JSON83.8MB→10.63MB, không giảm sốtamgiác. Giữ đầy đủ nhóm xương/trọng số.
- Áo vàngnghệ/ochre riêng với tay rộng, vạt trong dài và áo phủ chéo bấtđối xứng; nếp gấp là biến thiên hình học có pháp tuyến, không chỉ hình in. Hai lớp cổV mềm, quần nâu, dép.48hạt gỗ tròn gán xương thân.
- Lông mày ôm mặt bằng lưới riêng; dùng texture da/mắt hiệncó, chưa đạt likeness với gương mặt concept. Chấtliệu vải dùng ánhsáng classic tương thích renderer, chưa hệ skinSSS/PBR4K như minh họa trên ảnh.
- Idle/Walk và chếđộ chắp tay dùng IK của Pilgrim mởrộng, trả ngón tay về bindpose để tránh nắm tay. Không có môphỏng vải, biểu cảm mặt hoặc võ thuật.

## Dựng lại
1. Blender --background --python authoring/monk-reference/refine.py (đườngdẫnworkspace trong script hiện hardcoded; sửa R nếu chuyển máy).
2. python authoring/monk-reference/pack.py.
3. npm test; npm run build; node server.mjs.
4. http://127.0.0.1:5196/monk-reference.html?q=low . Có nút chínhdiện/3phần4/sau/mặt/nếpáo/chắptay/đi.
`refined-anatomy.blend` chứa nguồn cơ thể/mắt; nguồn trangphục/phụkiện là SaffronMonk.ts. RuntimeJSON, sốliệu/hash: public/assets/chars/monk-reference/{avatar.json,asset.json}. Checkpoint: authoring/checkpoints/20261031-saffron-reference.

## Kiểm chứng / còn lại
42test đạt trong saffron-tests.log, gồm hash/dunglượng/topology/trọng số củabề mặt mới. Buildrelease đọc saffron-build-delivery.log. Đã thấy mesh thật trong WebGL và thử đứng/chắp tay; phát hiện Tposebanđầu, hướng pháp tuyến vải và nắm tay, đã sửa trong lượt cuối. Lượt cuối có cân đầu/thân, điểm áo bám vai, cổV và màu ánhsáng; bộ phận mới vẫn là prototype, không được coi là đã đạt mẫu ảnh.
Chưa được duyệt mỹthuật. Mặt chưa giống concept; vải vẫn có thể xuyên/co kéo khi đi hoặc đổi pose. Chưa chơi toàn clip/thiết bị di động/GPU benchmark, chưa đưa vào chùa, chưa xuất GLB có đủrig/animation. Bộ10mẫu cũ chưa được gọi là đã thay bằng nhânvật mới. Cần tiếp tục chỉnh mặt, mắt, môi, độ rủ vải và vị trí hạt khi chắp tay trước khi nhân10.

## Sự cố quan sát khi QA
Console có WebGL context lost rồi restored; sau đó các mesh/vậtliệu procedural hiện không đầyđủ. Đã tải lại viewer để khôiphục; chưa chứngminh phục hồi context tựđộng antoàn. Đây là lỗi runtime cần xửlý trước khi phát hành, không được coi là mẫu productionready.

## Kết quả bản xem revision5
Build cuối đạt (saffron-build-delivery.log),42test đạt. Đã tải lại sau WebGLreset, thấy đầyđủ áo/vạt/hạt, thử lại Idle/Walk/chắptay với ngón mở. MẫuLow180242tamgiác; ảnh thật từviewer docs/saffron-reference-prayer.png. Không khẳngđịnh hoànthiện mỹthuật hoặc tươngđương ảnhconcept; mặt/cổáo/độrủ và phục hồiWebGL vẫn là việc còn lại.

Cậpnhật căn tay: lấy trục dọc/ngang từ khung thực của mesh bàn tay thay vì chỉ lấy vịtrí xương ngón; tính đến độdày lòng bàn tay. Mesh tay riêng giữ active khi cận cảnh để không bị cắt theo boundsTpose. Chếđộ đi khôi phục indices của bàn tay gốc, chắptay dùng mesh đã duỗi riêng.
