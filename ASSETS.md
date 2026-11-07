## 05/11/2026 — Sen giữa sông và bảng tên

Không thêm asset mua/tải ngoài. Tượng new-18 dùng nguyên model/vật liệu owner-collection20/18, scale 30 m từ mặt nước −2,4 m, vị trí x150/z640. Sen hoa/lá/gương/cuống là mesh gộp nguyên gốc trong StatueGarden.riverLotus, quanh tượng, không có physics dưới nước. Danh hiệu Phật nằm và tên Thiên Vương chỉ đổi nhãn; file nguồn tượng giữ nguyên. River-shrine.html là QA local; ảnh cũ trước khi bỏ bảng/nới sông được ghi rõ trong IMPLEMENTATION_STATUS.md.

## 04/11/2026 — Mái ngói lớn và bố trí tượng mới

Mái vb-sanctuary-grand-roof dựng lại từ recipe Blender gốc: high 733.180, low 210.493 tam giác. Low giữ mặt ngói và mặt dưới để tránh lỗ do decimation. Source/script: authoring/build/recipes/sanctuary_grand.py, authoring/build/blender_build.py, authoring/reexport-roof-low.py; số liệu/hashes trong authoring/large-roof-tiles-audit.json. GLB gốc ở public, bản Meshopt nén ở dist-public; không chép bản thô đè lại dist trước khi deploy. Texture ngói và sân tròn procedural, không tải tài nguyên ngoài. Các tượng chỉ đổi tên/bố trí/kích thước, không thay vật liệu hoặc giấy phép. Chi tiết và giới hạn kiểm chứng xem IMPLEMENTATION_STATUS.md, revision open-hall-statues-1.

## 04/11/2026 — Đá hoa cương sân/cầu

EntranceGranite.ts tạo texture 1024px có hạt khoáng, ron và viền sáng; 16 ô, cạnh thực 1,2m, không tài nguyên ngoài. Một texture/material dùng chung, không thêm mesh từng viên.

## 03/11/2026 — Hoàn trả vật liệu nguồn

Owner-collection20 giữ PBR và texture GLB gốc, không phủ vật liệu vàng dùng chung ở mọiLOD. Chỉ đổi transform chiều cao10m/bố trí, không sửa model nguồn; viewer cũng giữ vật liệu nhập. Bộ ba riêng vẫn vàng theo yêu cầu trước, cao50m. Giữ nén Meshopt/WebP ở dist-public và nguồn public nguyên vẹn; không mua/tải asset mới. Đệm/đình là geometry của dự án. Xem docs/STATUE_ORIGINAL_LOOK.md.

## 03/11/2026 — Cảnh quan và hoạt động tham quan

Dùng lại cây PBR tree-small-02 (Rico Cilliers/Poly Haven CC0):118vị trí đất trồng, tránh footprint nền/sỏi. Không tải/mua asset mới; nhang cầm tay là mesh batch của dự án. Nguồn public/ giữ nguyên; dist-public/ do Claude nén Meshopt/WebP, kiểm hash với bản nén khi deploy. 5mẫu decode giữ geometry bounds/triangles/khớp/tên clip. Chưa so hình browser sau nén. Xem docs/CAMPUS_VISITORS.md.

## 03/11/2026 — 20 tượng chủ cung cấp

Đã tích hợp đủ20ZIP; nguồn gốc/LOD/audit/bố trí tại docs/OWNER_COLLECTION20.md. Giữ nguồn riêng trong authoring/owner-collection20; public/assets/sanctuary/owner-collection20 có60GLB. Không tự gán giấy phép; không mua tài nguyên. Render dùng vàng PBR, không sửa texture nguồn.

## 03/11/2026 — Ba tượng chủ cung cấp, cao 100 m

Ba ZIP Phật Thích Ca Mâu Ni / Quán Thế Âm Bồ Tát (2) / Địa Tạng Vương Bồ Tát: giữ bản gốc ở authoring/front-triad/incoming; 3LOD và hash trong public/assets/sanctuary/front-triad/01..03. Chỉ thay vật liệu khi render sang vàng PBR. Nguồn và 9LOD đều kín lưới sau audit, không mua tài nguyên. Chi tiết: docs/FRONT_TRIAD.md.

## 03/11/2026 — Tượng 288 cửa tháp
Mẫu do chủ dự án cung cấp: Downloads/Tượng Phật/Tượng phật.zip, base_basic_pbr.glb; không tải/mua dịch vụ. authoring/tower-buddhas/source.glb giữ nguyên. public/assets/sanctuary/tower-buddha có high80k/low18k/far2k, chuẩn hóa cao1m rồi dựng5m; giữ vật liệu/UV; hàn seam trước giảm lưới. Kiểm source và3LOD:0boundary/0nonmanifold. Hash/đo kích thước ở asset.json, audit ở authoring/tower-buddhas/hole-audit.json. Quyền phân phối do chủ dự án cung cấp, chưa có giấy phép độc lập kèmZIP; không gán CC cho asset này.
Danh hiệu từ bản Việt Nguyên Thuận — Kinh Hiện Tại Hiền Kiếp Thiên Phật Danh, TaishōT0447a, https://rongmotamhon.net/xem-kinh_hien-tai-hien-kiep_lckmltkq_viet2.html ; bản nguồn lưu canonical-source.html, ordinal/hash trong names-audit.json. Lấy vị101–388,288tên không trùng100vị chánh điện. Đây là bài trí cùngmẫu mỹthuật, không tuyên bố288hình tướng kinhđiển riêng.

## Cập nhật 01/11/2026 — biển mây + người chơi rig gốc
Chi tiết thay đổi, kiểm chứng/giới hạn, checkpoint và log: docs/CLOUD_SEA_PLAYER.md. Rocketbox đã thay người chơi online (NPC giữ nguyên); các mục cũ nói chưa tích hợp chỉ mô tả giai đoạn trước. Mới thêm biển mây bốn hướng ngoài chùa; không đổi tài khoản/công đức.

Bản0.6.0 — **Vườn tượng**: đưa 29/30 mẫu tượng anh Thanh chốt (assets-src/tuong_phat_30_mau.zip) vào khuôn viên: đài A Di Đà lộ thiên giữa hai kinh luân, Di Lặc đón khách sau tam quan, Quan Âm/Địa Tạng trước chánh điện, hai hành lang mái ngói 13 gian dọc tường (chư Phật / chư Bồ Tát). Nút Vườn tượng, Đài A Di Đà, menu từng pho. Chi tiết, nguồn, giấy phép: [docs/STATUE_GARDEN.md](docs/STATUE_GARDEN.md).

Bản0.5.0 — thêm100 danh hiệu Phật,50mỗi bên chánh điện, chọn danh hiệu trên thanh công cụ. Xem [nguồn, kiểm chứng và giới hạn tạo hình](docs/HUNDRED_BUDDHAS.md). Hiện thân tượng dùng chung mẫu ngồi chi tiết; chưa phải100 điêu khắc độc lập. Checkpoint: ../AnLienTemple-backup-20261031-hundred-buddhas.

# Tài nguyên / nguồn — An Liên0.2.0

Tượng: giữ CREDITS.md và SOURCES.json tại public/assets/sanctuary/statues. Tượng chính AI Meshy CC BY4.0, hai tượng Mia scan CC0.

Cây sân vườn Tree Small02, Rico Cilliers / Poly Haven, CC0: https://polyhaven.com/a/tree_small_02 . Không đổi tên thành cây bồ đề; đây là Burkea africana dùng làm cây cảnh trong chùa hư cấu. Tải nguyên bản theo API, kiểm MD5, chuẩn hóa cao1m, giữ bản đồ albedo/normal/roughness, giảm từ≈2,06triệu tam giác xuống216561/51562; High2K, Low1K, Far512px/10312tris. Bản gốc tải ở authoring/tree-small-02, runtime chứaGLB, tác giả/hash tại public/assets/garden/tree-small-02/asset.json. Vỏ bồ đề tái sử dụng bề mặt thân từ nguồn này; hình cây/lá bồ đề là nguyên bản dựng bằng code.

HDRI Kloofendal48d Partly Cloudy Pure Sky, Greg Zaal/Jarod Guest / Poly Haven, CC0: https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky . Nguồn/hash tại public/assets/lighting/SOURCE.json. Ghi Powered by Poly Haven trong UI vì dùng API lúc chuẩn bị tài nguyên; lúc chơi không gọi API.

Mái/cột năm lớp: recipe gốc Claude được chỉnh riêng cho dự án An Liên; authoring/sanctuary_grand.py, worker/spec ở authoring/build. MáiHigh1105820tris, Low287146tris; cột14404/5038. Nguồn Blender ở authoring/generated. Không kéo giãn GLB cũ. Gạch bông/trần/gỗ là ảnh procedural gốc; không tài nguyên trả phí. Âm thanh tổng hợp giữ nguyên từ bản tách.

## Kinh luân0.3.0
Mesh/khắc relief nguyên bản của dự án. Chân ngôn cổ ॐ मणि पद्मे हूँ; font Noto Sans Devanagari của The Noto Project Authors, SIL OFL1.1, đầy đủ giấy phép trong public/assets/fonts/noto-devanagari/OFL.txt. Font chỉ tạo hình chữ, không dùng font Windows để phân phối. Nguồn và đối chiếu tại docs/PRAYER_WHEELS.md.

## Bộ10nhà sư 31/10
Tái sử dụng MinhV2/texture cơ thể trong Veilbound và rig/animation Quaternius đã có. Trangphục vàng/càsa đỏ kẻvàng là mesh/UV/hoa văn procedural mới, skinning cùng rig. Không tải hoặc mua tài nguyên mới. Xem docs/EAST_TOWER_MONKS.md; không coi10biến thể là10điêukhắc độc lập.

## Mẫu nhà sư theo concept người dùng
Nguồn giải phẫu/UV/texture MinhV2 hiện hữu (MakeHuman publicdomain, giữ ghi công thư viện gốc); refine.py chỉnh/làm mịn bằng Blender. SaffronMonk.ts dựng áo/vạt/cổ/hạt/lôngmày và gánxương mới. Ảnh concept chỉ lưu ở authoring, không nhúng ảnhgiả3D vào runtime. Chưa đạt likeness/mỹthuật của concept; xem docs/SAFFRON_REFERENCE_MONK.md.

## Tài nguyên nhân vật dựng sẵn — 31/10/2026
Monk by creator424 và Character Model Buddhist Nun by YoungNorris2010, Sketchfab CC BY4.0. Giữ attribution/source/hash trong public/assets/chars/ready-made. Đã tải qua chức năng chính chủ; không mua/không upload. Xem docs/READY_MADE_MONKS.md, viewer monk-library.html. GLB nguyên bản chưa có rig/animation, chưa thay NPC.
Monk được người dùng chọn: biến thể cà sa đỏ kẻ vàng do An Liên chỉnh bằng RedGoldKasaya.ts trên material gasa; GLB gốc/ghi công creator424 CC BY4.0 giữ nguyên. Chưa có rig/animation.

Nghi lễ20sư: Monk/creator424 CC BY4.0 được gán rig/weights/động tác runtime trong CeremonyMonks.ts, áo gom lại và chỉnh tay áo riêng. GLB nguồn không đổi; biến thể và công cụ nghi lễ do An Liên tạo. Xem docs/HALL_CEREMONY.md, giữ nguồn/ghi công public/assets/chars/ready-made/creator424-monk. Tiếng mõ dùng chua_mo.mp3 hiện hữu, không thu/tải mới.

Sửa tay lễ: ConnectedArms.ts nối phần cánh tay thiếu theo vòng cổ tay của Monk/creator424 và dùng cùng nguồn da/vải; geometry bổ sung/IK do An Liên tạo, GLB nguồn không đổi. Giữ CC BY4.0/ghi công. Xem docs/HALL_CEREMONY.md.

Phù điêu tường: scan Bronze Seated Buddha/Mia CC0 hiện hữu được bake sang heightfield/normal và vật liệu vàng, khung vuông doAnLiên tạo. Nguồn/hash/ghi công trong public/assets/sanctuary/wall-buddha-relief/{SOURCE.json,CREDITS.md}; docs/BUDDHA_WALLS.md. Không tải/mua thêm. Mẫu Monk/creator424 dùng cho122vị vẫn giữCC BY4.0 và nguyênGLB.

Đạo tràng1.500phật tử: dùng cùng nguồn Monk/creator424 CC BY4.0 đã có, giữ nguyênGLB/hash/ghi công. Biến thể áo tràng xám + pose/LOD/đệm vàng doAnLiên thực hiện. Không phải1.500mẫu người riêng. Xem docs/LAY_ASSEMBLY.md; không tải/mua dịch vụ mới.

Tóc phật tử: LayHair.ts làhình học nguyênbản củaAnLiên (mái ômđầu/búitóc,LOD), gắn lêncơthể/rigcreator424 CC BY4.0 hiệnhữu; không dùng ảnh tóc/nguồn/trảphí mới. Giữghi công GLB gốc. Trần trắnghọatiết doCanvas của dựán vẽ, khôngdownloadtexturemới.

Tóc fitted-black: cap chiếutheo lướiđầuthật củaMonk/creator424 CC BY4.0 (biếnthể giữghi công), naperayfit/khungmesh doAnLiên; khôngtải hoặc mua tài nguyênmới. GLBnguồn/hashgiữnguyên.

Tay áo soft-sleeves là chỉnh bone/weight trên sourceMonk/creator424 CC BY4.0 hiệnhữu, khôngđổiGLBnguồn/ghi công, khôngmua/tải hoặc thêm tài nguyên mới. Meshsource/texture/giấyphép giữnguyên.

01/11/2026 — Chân lễ: dùng lại geometry bàn chân/pants của Monk / creator424 (CC BY 4.0 đã ghi nguồn ở trên), tách foot mesh/vật liệu da và chỉnh gấu quần/rig tại runtime. GLB gốc không chỉnh sửa; không phát sinh tài nguyên mua hay tải mới.

TikTok LIVE tool01/11: tiktok-live-connector2.5.0 AGPL-3.0-only, nguồngithub.com/zerodytrash/TikTok-Live-Connector, giấyphép live/LICENSE.connector.txt, mãbridge/UI kèm trong dựán. ws8.21.0MIT. Âmchuông tổng hợpWebAudio, giọngquaWebSpeechhệthống (máy cóMicrosoftAnvi-VN); không tải nhạc/TTStrảphí, không dùngảnh/avatarremote.

Live seats01/11: bảng tên và phép chiếu3D là code/UI của dự án, dùng lại NPC/đệm/hair hiện hữu; không tải mẫu, ảnh đại diện hay âm thanh mới. Không lấy mã/ảnh từ dự án trong ảnh tham khảo của người dùng. Phần connector AGPL giữ giấy phép đã ghi trong live/LICENSE.connector.txt.

01/11/2026 — Rocketbox: Male_Adult_08/Female_Adult_17 + Idle/Walk chính chủ từ https://github.com/microsoft/Microsoft-Rocketbox (MIT). Giữ LICENSE/SOURCE/CREDITS/hash tại public/assets/chars/ready-made/rocketbox; nguồn FBX/texture trong authoring/rigged-candidates. Retarget world-rotation/bake, chuyểnPNG/GLB; rig/weight gốc giữ nguyên. Chỉ viewer, chưa thay NPC. Snow v3/Blender Studio CC BY4.0 được tải/mở native, giữ nguồn/credit ở authoring/rigged-candidates/snow-source.json; chưa xuất web. Xem docs/RIGGED_PEOPLE_LIBRARY.md.

01/11/2026 — Tư thế RocketboxDevotion do An Liên tạo runtime trên rig/skin Microsoft Rocketbox MIT có sẵn. Không thay GLB, texture, source/license; chỉ viewer. Đệm/bóng studio là hình học/vật liệu mới của dự án, không tải hay mua thêm. Xem docs/ROCKETBOX_DEVOTION.md.
`nBiển mây: shader procedural nguyên bản trong src/game/world/CloudSea.ts, không dùng ảnh/mesh/dịch vụ bên ngoài. HDRI Poly Haven vẫn dùng cho phản xạ; giữ ghi công cũ.

01/11 tối: thêmPilgrimWalk/PilgrimRun/Push từ Quaternius UAL CC0 có sẵn, retarget lên Rocketbox MIT, không thay da/mesh/weights. docs/PLAYER_MOTION.md và SOURCE.json trong asset ghi nguồn/hash.

Áo dài nữghépthử02/11: ghostnoface CC BY4.0, source/model/license/changes/hash trong public/assets/chars/ready-made/ao-dai-preview/SOURCE.json và CREDITS.md; bodyMicrosoftRocketboxMIT, motionQuaterniusCC0. docs/AO_DAI_FIT.md ghi giới hạn fit/cloth. Chưa áp vào online.

Áo dài fit-2: seamswelded/innershell, sleevearmchain/cuffweights, panthems/outerflapskin vàUV2clearancemask; AoDaiCloth.ts làcodegốccủadựán. Ghi nguồn/hash tạiassetSOURCE/CREDITS. GiữCCBYghostnoface/MITMicrosoft/CC0Quaternius.
Bộ 10 áo dài ở public/assets/chars/ready-made/ao-dai-collection: ghostnoface CC BY4.0, Microsoft Rocketbox MIT, Quaternius UAL CC0; SVG hoa văn, phối màu và biến thể tóc An Liên. SOURCE.json/CREDITS.md ghi nguồn/hash. Chỉ bản xem mẫu; docs/AO_DAI_COLLECTION.md ghi giới hạn.


## 02/11/2026 — Bộ 10 áo dài dùng trong sinh hoạt chùa

Cảnh chính tái sử dụng `public/assets/chars/ready-made/ao-dai-collection/Female_AoDai_Collection.glb`, giữ tóc gốc; 10 hoa văn và màu quần. Microsoft Rocketbox MIT, áo dài ghostnoface CC BY4.0, hoạt ảnh Quaternius CC0. Ghi công/giấy phép/SHA tiếp tục nằm trong thư mục tài nguyên. Không mua hoặc dùng dịch vụ mới. Chi tiết sinh hoạt/đệm nghe pháp/giới hạn tại docs/TEMPLE_LIFE.md.

Bảy tượng sân mới 03/11: user-supplied P1..P5/84b0a620.../phật nằm.zip; source SHA authoring/courtyard-seven/sources.json; normalized3LOD public/assets/sanctuary/courtyard-seven. Không kèm license/tác giả, không tự gán CC. Vật liệu gốc; không mua. Docs/COURTYARD_SEVEN.md.

Sông/cầu tam quan (03/11): hình học gốc và shader nước tự viết tại EntranceRiver.ts/EntranceRiverPlan.ts; không tải tài nguyên ngoài/không trả phí. Lan can hoa sen/nét cuốn là hình học mới, giữ nguồn GLB khác nguyên vẹn. Docs/ENTRANCE_RIVER.md.
