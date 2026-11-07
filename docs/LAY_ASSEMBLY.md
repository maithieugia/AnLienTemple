# Đạo tràng 1.500 phật tử — 01/11/2026

## Bố trí và nghi lễ

- 15 hàng, đúng100người/hàng, 1.500 ID/chỗ ngồi cố định. Áo tràng xám dùng cùng nguồn người creator424 đã được chọn, tách màu với các sư vàng–đỏ. Đây là một mẫu người dùng chung, chưa phải thư viện nhiều khuôn mặt/giới tính/tóc.
- Đệm vàng đường kính1,12m, dày14cm, hoa văn dệt/viền. Tâm người ngang cách2m, hàng cách ít nhất3m; nới khoảng qua các tuyến cột kết cấu20m. Hàng nằm z=-67…-10m, x=-105…105m, sau nhóm sư. Chừa giữa6m và hai lối tại x=±22m. Không bỏ cột để nhường chỗ người.
- 15đệm lễ riêng trước tượng chính, z=-137m, x=-21…21m, cách3m. Nằm trước nhóm sư và ngoài bệ Phật; mặc định không xếp người ngồi thường trực ở đây.
- Từng tốp15người tiến lên, theo lối ngang trước hàng rồi lối bên hông x=±22, ngang tại z=-130, vào đúng ô lễ. Đi tốc độ1,25m/s; đặt lịch qua cửa lối chung lệch3s, không teleport lên đệm. Cả tốp đủ chỗ mới bắt đầu lạy.
- Mỗi người đúng3chu kỳ14s (42s), rồi rời đệm theo đường về đúng ID/chỗ cũ, ngồi thiền lại. 100tốp đi hết1.500người rồi quay vòng. Lượt đầu khoảng5phút thời gian mô phỏng, không tua nhanh trong game; thời gian thực phụ thuộc tốc độ khung hình hiện hữu của main. Viewer có nút nhảy pha phục vụ QA, main không gọi chúng và không tác động công đức/save.

## Kỹ thuật và nguồn

LayAssemblyPlan.ts thuần dữ liệu/đường đi/trạng thái; LayAssembly.ts hiển thị, CrowdMesh.ts tạo LOD xa. Chỗ ngồi xa dùng mesh pose đã bake và thin instances, cận (tối đa60người trong22m) chia sẻ geometry đầy đủ và cùng skeleton tư thế tĩnh. Chỉ15người của tốp đang lễ có rig cập nhật độc lập; không tạo1.500rig. Đệm1.500và15ô lễ có2nhóm instancing. Người rời chỗ được bỏ khỏi nhóm ngồi ngay khi trạng thái đổi, tránh bản sao. Quần/giày giữ tên material gốc để bật đúng lúc đi, chân lúc đi ở nền1,205m, lúc lễ ở mặt đệm.

Giữ Monk/creator424 CC BY4.0, nguồn GLB/texture và CREDITS tại public/assets/chars/ready-made/creator424-monk. Áo xám, đệm vàng, đường đi và LOD là biến thể của AnLiên. Không mua/tải/upload mới. ConnectedArms/rig và các giới hạn ngón tay/nếp vải trước vẫn áp dụng.

HallCeremony tải phần phật tử tự động cùng nghi lễ. Main có 1.500 phật tử /15đệm lễ và báo tốp/pha. Viewer ceremony.html vẫn chỉ nhóm132sư (includeLay=false); viewer mới lay-assembly.html kiểm riêng1.500người.

Checkpoint: authoring/checkpoints/20261101-lay-assembly (main,rig/config trước sửa).

## Kiểm chứng / giới hạn

6test mới xác nhận1500ID,15×100,15ô lễ,100tốp bao phủ mỗiID đúng1lượt,3chu kỳlạy và về đúngtọa độ, lối đi hữu hạn, khoảng cách tốp di chuyển>.5m ở mẫu thời gian.5s trên100tốp, đệm/lối ngang tránh cột, LOD bỏ mặt co/đúp. Đây là kiểm lịch định trước, không phải navmesh/collision động hoàn thiện.

Đã xem các pha ngồi/lên lễ/quỳ lạy/về trong WebGL viewer, console khôngerror. Ảnh lay-assembly-{close,bow,return}.png. Viewer từng quan sát30–60FPS tùy góc/pha; chưa benchmark GPU hoặc mobile. Main chùa vốn nặng, không cam kết60FPS. Không coi ảnh một khung là kiểm đủ3lạy hoặc100tốp bằng UI: số chu kỳ/ID kiểm tự động; chưa chạy xem liên tục hết vòng nhiều giờ.

Còn lại: đa dạng người/cải thiện mỹ thuật cận (nguồn chung vẫn có mép/cắt/nếp áo và giải phẫu cần chỉnh, ảnh cận chưa đạt photoreal), chân kiết già/ngón tay, chuyển đứng–quỳ–ngồi và góc rẽ vẫn là rig kinematic; chưa mô phỏng vải/tựva chạm. Đường theo lịch tránh nhóm sư nhưng chưa có tránh người chơi/NPC động hoặc nghiệm thu va chạm mọi công trình bằng chơi tự do. Thời gian nghi lễ chưa lưu khi reload. Không cộng công đức tự động cho NPC. Không sửa game Veilbound gốc hoặc EXE.

Đồng hồ phật tử ở main dùng delta thực, chặn tối đa.25s/khung (tách khỏi bước.035s của di chuyển cũ), để tốp/3lạy không chậm nhiều lần ở cảnh7–10FPS; vẫn không bắt kịp thời gian dài khi tab treo. Góc 1.500phật tử giữ camera dưới trần tầng một; cảnh nhiều cột có thể che người, kéo/pan hoặc đi bộ để xem các hàng hai bên.
Kiểm tích hợp main cuối: ảnh lay-assembly-hall.png và lay-fifteen-pads-hall.png, UI1500/côngđức17, no consoleerror. Main6–7FPS quan sátIAB, chưađạt hiệunăng; chưa xem hếtmộtchu kỳ bằngUI main, viewer đãkiểm từngpha. Toàn60test/buildđạt.

## Thay thế bố cục/nhịp lễ cũ — bản hàng dọc
Hiện tại15cột dọc×100người theo chiều ra cửa (z=-65…172,6,x=-27…27); mỗi lượt chọn một lớp ngang15người. Đi3,2m/s,3lạy×8s,2s sau lạyxong thì tốp sau xuấtphát, người cũ vềđườngriêng; không chờ cả tốp về mới mời lượt mới. Tốiđa3tốp hoạtđộng cùnglúc/3bank×15rig, người ngồi vẫnLOD/thininstances. Không cam kết15đệm liên tục cóngười: tốp mới cần thời gian đi từchỗngồi lên. Nam tócngắn/nữ tócbúi,750profile mỗi kiểu; mesh tóc gắn xươnghead và cùngLOD người ngồi. Cơthể/mặt hiện vẫn nguồn người dùng chung, chưa córig/nữ hoặcfaceđa dạng.
Trần ha tầng trắng sáng: vậtliệu mới và mặt dưới riêng che mặt gạchbông dưới sàn tầnghai, giữ4ôthang và gạchbông mặt trên. Vậtliệu sáng vừa cóhọatiết, không đổi mái/cộtgỗ sang trắng.
Checkpoint20261101-vertical-hair-white,8testlayout/hair/lịch đạt,62testtoàndựánpass. Chi tiếtkiểmUI vàgiới hạn tại IMPLEMENTATION_STATUS.md mục mới nhất.

Bản fitted-black-1 thay haircap ước lượng bằng scalpSurface lấy từ nguồnđầu thật, giữ hởmặt/cổáo và phủtóc xuốnggáy; materialđen ítspecular. Áp dụng chung2LOD/vàactorđộng. Hai kiểm rayđộc lập trênGLB thật/đườngtócgáy,64testtoàn suitepass, build6,88s. Ảnhfitted-black-hair-close.png. Khôngcoiđã duyệtmỹthuật mọi góc, không haircards hay tóc động.

## Tay áo rủ — bản soft-sleeves
SleeveDrape.ts giữ Y của vải theo trọng lực thay vì quay vuông góc cẳngtay, nới hai phía và cho daođộngnhẹ bằngbone; clip độrủ theođộcao tay gần nền. Điều chỉnh trọng số thân/skirt và giảm phồng khi ngồi. Factory chung cập nhật cảsư/phật tử, vẫn giữ pose dùngchung cho đámđông,không clothsimulation1.500người. Giữ đầyđủgasa gốc: phươngáncắt/bỏlayerkhôngđượcgiữ vìlộkhe. Không đổi cổtay/IK/tóc/nhịplễ.67testpass,chi tiếtkiểm/giới hạn ởmục mới nhất IMPLEMENTATION_STATUS.md. Còn cần tinhchỉnh mỹthuật vải cận vàclothcollision, khônggọi làvật lýhoànthiện.

## Chân khi ngồi và lạy — 01/11/2026
Nguyên nhân: loader từng bỏ tam giác da dưới y=.88m, đồng thời ẩn pants/shoes khi ngồi/lạy. Đã khôi phục phần chân nguồn, giữ quần ở mọi động tác; sandals chỉ hiện khi đứng/đi. Tách tam giác bàn chân nguồn dưới .15m thành mesh chung với vật liệu da, không dựng chân bằng hình khối và không đổi file GLB. Gấu quần nâng lên để lộ bàn chân; sửa tâm bind foot theo nguồn x±.20,y.075,z-.02. RitualLegs.ts giữ chiều dài đùi/cẳng chân bằng IK: ngồi bắt chéo, cổ chân lệch cao; quỳ đầu gối sát đệm, cẳng chân gập về sau. Giới hạn gấu áo quỳ để không chui qua nền. Tay áo vẫn dùng SleeveDrape.ts như mục trên, chưa phải mô phỏng vải.
Đám đông ngồi: đã thử bake CPU cả near/far nhưng kiểm UI có bề mặt bị lỗi; đã hủy thử nghiệm đó. Near giữ geometry nguồn + skeleton pose chung như bản trước, far bake/giảm lưới rồi thin-instance. Không tạo 1.500 rig mới. 45 actor lễ động vẫn rig riêng; tóc, lịch lễ, vị trí đệm và tiến độ giữ nguyên. Checkpoint authoring/checkpoints/20261101-visible-legs và 20261101-soft-sleeves.
Ba test mới kiểm chiều dài khớp, chân bắt chéo, đầu gối/cổ chân xuyên suốt chu kỳ lạy và bước đi. Kết quả build/test/UI cuối xem đoạn xác minh bên dưới. Giới hạn: chưa có cloth collision hay retarget animation do nghệ sĩ làm; nếp vải nguồn và khớp gập cận cảnh còn cần cải thiện. Chưa nghiệm thu toàn bộ từng NPC/mọi góc nhìn/GPU/mobile.

Xác minh cuối: toàn bộ70/70test đạt (docs/visible-legs-all-tests.log); sau chỉnh hướng bàn chân,10/10test chân/cổtay/tay áo vẫn đạt (docs/visible-legs-tests.log). TypeScript/Vite build bản cuối tại docs/visible-legs-release-build.log. UI đã xem ngồi bắt chéo và chân phía sau khi quỳ/lạy trong ceremony.html; khôngerrorconsole. Geometry bàn chân nguồn còn thô, ngón chân/nếp vải/chỗ cổ chân cần chỉnh mỹ thuật thêm; không coi đây là mẫu nhân vật hoàn hảo hay mô phỏng vải mềm thực. Giới hạn hiệu năng chánh điện trước đây vẫn chưa giải quyết; không báo FPS viewer là FPS game.
