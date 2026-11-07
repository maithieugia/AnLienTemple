## Cập nhật 01/11/2026 — biển mây + người chơi rig gốc
Chi tiết thay đổi, kiểm chứng/giới hạn, checkpoint và log: docs/CLOUD_SEA_PLAYER.md. Rocketbox đã thay người chơi online (NPC giữ nguyên); các mục cũ nói chưa tích hợp chỉ mô tả giai đoạn trước. Mới thêm biển mây bốn hướng ngoài chùa; không đổi tài khoản/công đức.

# Người có rig gốc — 01/11/2026

Theo yêu cầu tìm người có bộ xương đẹp hơn, tải và thử riêng, chưa thay nhân vật/NPC trong chùa hay trên server công khai.

## Hai mẫu chạy được trong engine

Nguồn chính chủ: https://github.com/microsoft/Microsoft-Rocketbox — giấy phép MIT, giữ LICENSE.md. Kho tác giả mô tả115 nhân vật và417 hoạt cảnh; không có nghĩa dự án đã tải tất cả.

| Mẫu đã tải | Tam giác thực | Skin joints | Clip thử | GLB |
| --- | ---: | ---: | --- | ---: |
| Male_Adult_08 | 7.364 | 80 | Idle / Walk | 24.614.732 byte |
| Female_Adult_17 | 8.516 | 80 | Idle / Walk | 27.939.848 byte |

File gốc FBX, texture TGA, Idle/Walk nam/nữ, MIT/README nằm trong authoring/rigged-candidates/rocketbox-source. Danh mục tải URL/bytes/SHA256: rocketbox-downloads.json. GLB và SOURCE.json/hash/giấy phép trong public/assets/chars/ready-made/rocketbox.

Chuyển đổi bằng Blender4.5.9 LTS chính chủ, kiểm SHA256 từ download.blender.org; chạy --disable-autoexec. Script prepare_rocketbox.py giữ skeleton và trọng số gốc, relink texture, đổi PNG (head colour2K, các map khác1K), roughness studio .72. FBX motion có rest pose khác avatar; sao chép curve trực tiếp để lại tay dang A-pose. Đã sửa bằng CopyRotation world-space theo tên xương, bake Idle/Walk vào rig avatar, không dùng cách chia tay/thân rời hay gán weight theo khối hình học. Demo đi tại chỗ; chưa xử lý foot IK/planting cho gameplay thật. Actor không có áo nhà sư.

Viewer: http://127.0.0.1:5196/rigged-people.html — chọn nam/nữ, Toàn thân/Cận mặt/Cận tay, Đứng/Đi, dừng hình, hiện xương; kéo xoay360độ. Chạy node server.mjs tại project sau npm run build. Vite entry chỉ thêm trong build local, không thêm vào mode public. Checkpoint vite.config.ts: authoring/checkpoints/20261101-rigged-people.

## Kiểm chứng

- TypeScript và local Vite build đạt: docs/rigged-people-build.log; tsc sau thêm test cũng đạt (rigged-people-types.log rỗng, exit0).
- Hai kiểm tra dữ liệu đạt: test/rigged-library.test.ts / docs/rigged-people-tests.log. Kiểm SHA, skin80joints, trọng số hữu hạn/tổng1, index xương hợp lệ, quaternion đơn vị và chuyển động thực trong cả2clip, license đi kèm.
- Đã mở cả nam/nữ, chuyển đứng/đi, cận mặt và bật/tắt xương. Sau sửa rest pose, tay nam hạ và đi bình thường trong preview. Console không có error trong phiên xem mẫu nữ.
- Ảnh: rigged-male-face.png (gương mặt trước khi sửa motion, texture vẫn cùng nguồn); rigged-male-walk-fixed.png (motion mới), rigged-original-bones.png, rigged-female-face.png. rigged-male-walk.png là lượt A-pose lỗi trước sửa, không dùng làm bằng chứng motion cuối.
- Không chạy lại full suite gameplay vì chỉ thêm viewer và tài nguyên riêng, không sửa runtime game. Full suite gần nhất trước nhiệm vụ này94/94. Chưa thử crowd1500, thiết bị yếu/mobile, động tác chắp tay/ngồi/lạy, giữ tiếp xúc chân khi đi địa hình, avatar online hay trang phục chùa mới.
- Đây là mô hình tầm trung có texture và rig tốt hơn cơ chế dựng tay cũ, không khẳng định chất lượng AAA/PUBG. Mặt và tóc vẫn có giới hạn ở cự ly rất gần; trang phục và nhận dạng Việt Nam cần làm tiếp.

## Nguồn thứ ba đã lấy: Snow / Blender Studio

https://studio.blender.org/characters/snow/v3/ — CC BY4.0, credit: Snow Rig © Blender Foundation | studio.blender.org. ZIP và SHA trong authoring/rigged-candidates/snow-source.json; native snow-v3/snow_v03.blend mở được với autoexec tắt. RIG-Snow có1.552 xương điều khiển/tổng,292 xương deform; META-Snow398 là metarig, không cộng vào bộ xương xuất game. Có mesh gán armature, ví dụ thân5.828vertices trước subdivision. Snow là phong cách hoạt hình, không phải người quét photoreal. Chưa convert GLB, chưa bake vật liệu/rig/animation cho web; không gọi là game-ready chỉ vì đã tải .blend. Metadata: snow-inspection.json.

## Các nguồn đối chiếu nhưng không chọn để ship

- Renderpeople: https://renderpeople.com/free-3d-people/ có người quét/rig tốt. Điều khoản https://renderpeople.com/general-terms-and-conditions/ mục4.3(b) không cho để file3D dễ tải riêng; chưa chọn cho cách phục vụ GLB công khai của game hiện tại, chưa tải/mua.
- Monk CG-Moon: https://sketchfab.com/3d-models/monk-rigged-3d-model-999aac12a3354a10862ae87f1eaee31c ghi1.2Ktris và chính mô tả nói bản Sketchfab không có rig. Không coi nhãn rigged là bằng chứng file đã có xương.
- Hai mẫu Monk/ni sư tải cũ vẫn giữ nguyên. Source0skin/0animation; rig runtime cũ không bị thay trong lần nghiên cứu này.

Bước tiếp theo nếu chọn nền này: chọn khuôn mặt/vóc dáng phù hợp, làm áo tràng/càsa có topology và weight theo cùng rig, retarget lễ và kiểm xuyên vải/tay ở cận cảnh trước thay NPC. Không tự nhân1500nhân vật chi tiết đầy đủ khi chưa có LOD/budget.

## Cập nhật tư thế cùng ngày
Đã thêm bản thử chắp/ngồi/quỳ/lạy trên rig mới; xem docs/ROCKETBOX_DEVOTION.md và mục mới nhất IMPLEMENTATION_STATUS.md. Các câu chưa thử động tác lễ phía trên thuộc mốc nhập thư viện trước bản thử này. Chưa tích hợp gameplay/public.
