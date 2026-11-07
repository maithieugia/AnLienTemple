# Tháp và phật tử tham quan — 03/11/2026

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

## Mã nguồn

- StupaPlan/Stupa/TowerBuddhaPlan: dịch toàn bộ kiến trúc, tượng, nhãn và physics từ cùng tâm; lùi tượng theo bán kính, mở rộng chiếu nghỉ; sàn đỉnh/collider.
- StupaElevatorPlan/StupaElevator: vùng gọi thang dùng hàm kiểm được bằng test.
- TempleVisitPlan: điểm đích, biến thiên cá nhân, nghỉ, đi bộ, đường tầng/ban công/spiral. TempleLifePlan giữ API lịch sử cho viewer và bổ sung giới hạn tìm đường; TempleLife500 dùng lịch mới.
- TempleLife500: tìm đường nền tối đa1600node, giãn0,15giây giữa hai yêu cầu; một người một lịch; kiểm collider và rail tháp, nhường/né, nghỉ riêng. Không dùng teleport khi tìm đường lỗi; đợi rồi thử đích khác. Chưa có worker/navmesh đa tầng hoàn chỉnh; cần rà thời gian dài/các tình huống tắc dòng người thật.
- TempleCrowdRenderer: giữ20rig mức nhẹ/40rig mức cao, mid/far thin instances; khoảng cách3D cho người trên tháp, thêm tư thế chắp tay và nhang batch.
- SanctuaryPlan/SanctuaryArchitecture/BuddhaWallPlan: ba cửa sau, khung/collider/phù điêu theo khẩu độ, hiên mở và bậc nối sân sau; tránh cột tròn ở lối cửa.
- CampusLayoutPlan: footprint nền/đường/sỏi/đá dùng chung; SanctuaryLandscape tạo đường/rào/đá thật cùng collider; GardenTreePlan chỉ trồng trong đất phù hợp. Giữ nguồn PBR cây CC0 hiện hữu.

## Kiểm tiếp theo

1. Chơi main online bằng avatar: tới tháp từ sân, gọi thang trệt, đi36→1→18, ra cả hai phía tượng tại tầng36, thử chạm thanh chắn cuối thang.
2. Kiểm ba cửa sau, đặc biệt cửa giữa qua lớp phù điêu, bậc và lối nối vườn; đi chạm đá13vị trí và nhìn cây ở các giao đường.
3. Theo một NPC qua chu kỳ dài: sân→tháp→ban công→đổi tầng→xuống; theo người lễ nhang/đẩy kinh luân/lễ tượng; rà deadlock ở cửa và lệch chân/áo.
4. Đo FPS/VRAM với500cư dân ở q=low/high và mobile; test tải lần đầu/lần lại cùng SW mới. Không coi test mock controller là chạy500rig render thật.
5. So thẩm mỹ ảnh nén: decode/bounds/triangle-count đạt không chứng minh màu và vi chi tiết WebP ở mọi góc giống hệt.

Game: https://dichua.palo.io.vn/?q=low&revision=2026-11-03-campus-visits-1
Preview tháp: https://dichua.palo.io.vn/stupa.html?q=low&revision=2026-11-03-campus-visits-1
