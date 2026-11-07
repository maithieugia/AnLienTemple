## 04/11/2026 — Nền dịu mắt và ba lớp mái (ĐÃ LÊN SERVER)

Revision `2026-11-04-calm-floor-roofs-1`. Nền chánh điện và sàn tầng trên dùng màu be xám đồng nhất, ô 2,4 m (trước 0,6 m), ron nhẹ, specular 0,045; bỏ hoa thị, ngôi sao và hạt tương phản. Không đổi cao độ hay va chạm sàn. Texture 512 px dùng chung, không thêm mesh từng viên. Mức giảm mỏi mắt/chóng mặt cần anh Thanh tự trải nghiệm, chưa được xác nhận trên thiết bị của anh.

Sửa ba mái đỉnh tháp: tầng cuối dừng tường ở +6,7 m, cột/xà ở +6,35 m. Ba mái có mép ở cao độ 176,8 / 178 / 179,1 m, thu bán kính từ 25,5 → 19 → 12,5 m; giảm đầu đao tương ứng, đỉnh vẫn 180 m. Trước đó mái bị tường và xà cố định +8,5…9,35 m che/xuyên qua. Cột/xà các tầng khác cũng hạ khớp mép mái. Giữ 18 tầng, 1.632 bậc, cửa, thang máy và chặn cuối.

Tam quan có ba mái rộng 56 / 46 / 34 m, sâu 22 / 17,5 / 12,5 m, chân mái 18,1 / 23,2 / 27,5 m, đỉnh khoảng 31,1 m. Thêm mặt dưới, diềm dày 0,45 m; sửa normals mặt mái và ống ngói riêng ở cổng để tránh tối đen. Lối vào/cầu/cột/bảng tên vẫn giữ vị trí.

Checkpoint `authoring/checkpoints/20261104-calm-floor-triple-roofs`. TypeScript/public build đạt; 16 kiểm tra cầu/cổng/tháp đạt. Đã xem local nền mới, mái tháp và cổng ba lớp; browser HTTPS xác nhận cổng ba mái, không console error. Ảnh: `docs/calm-hall-floor.png`, `stupa-three-roofs-restored.png`, `tam-quan-three-roofs.png`, `tam-quan-three-roofs-production.png`. QA thêm nút Mái tam quan trong entrance-river.html; chỉnh góc cận mái đỉnh trong stupa-preview. Chưa chơi lại toàn cảnh online, chưa đo FPS/mobile hoặc xác nhận cảm giác khi di chuyển lâu. Không thêm tài nguyên mua ngoài.

Đã deploy overlay giữ nguyên model/texture nén, cache/SW, sinh manifest từ server; runtime EntranceRiverPlan cũng được cập nhật. Health đạt; tài khoản 5, merit [40,5,36,449] được giữ. Backup `/root/anlien-backups/2026-11-04-calm-floor-roofs-1-20261104T142916Z`. Log `docs/calm-floor-roofs-deploy.log`; script `deploy/update-calm-floor-roofs.sh`. Game: https://dichua.palo.io.vn/?revision=2026-11-04-calm-floor-roofs-1

