# Vườn tượng An Liên — bản 0.6.0, 31/10/2026

Đưa bộ 30 mẫu tượng anh Thanh chốt (`Veilbound/assets-src/tuong_phat_30_mau.zip` → `assets-src/buddha-library`) vào khuôn viên chùa. 29 mẫu được đặt; mẫu 059 Tian Tan là bản quét cả quả đồi (địa hình + tượng nhỏ), không phải một pho tượng đứng riêng, nên không đặt.

## Bố cục kiến trúc (toạ độ mét, gốc ở tâm chánh điện, +Z hướng ra cổng)

Trục thần đạo theo lối chùa Việt: **Tam quan (z 565) → Phật Di Lặc đón khách (z 492) → Đài Phật A Di Đà lộ thiên (z 388) → Chánh điện (z 200)**.

| Khu | Vị trí | Tượng | Kiến trúc |
|---|---|---|---|
| Đài A Di Đà lộ thiên | (0, 388), giữa hai kinh luân (±195, 388) | 019 A Di Đà ngồi, cao 20 m | sân đá tròn R38 m, 3 tầng bệ tròn (R24/19.5/15.5, viền vàng + băng sơn son), đài sen 2 vòng cánh vàng kim loại so le, lan can đá mở 4 hướng, 8 đèn đá, bàn hương lớn + lư đồng + khói nhang, bảng "NAM MÔ A DI ĐÀ PHẬT" |
| Di Lặc đón khách | (0, 492) | 056 Di Lặc cười ngọc bích, 7 m | sân tròn R13, bệ 2 tầng đá/sơn son, vòng sen, 2 đèn đá, bàn hương |
| Trước chánh điện | Tây (−150, 268) / Đông (150, 268) | 010 Quan Thế Âm 16 m / 020 Địa Tạng (cầm tích trượng) 10 m | sân tròn R12, bệ 2 tầng + vòng sen, lối nối ra đường ngang trước điện, bàn hương; hai tượng hơi nghiêng vào trục (±0.3 rad), đối xứng |
| Hành lang chư Phật | dọc tường Tây, x = −358, z 248–512 | 13 tượng Phật (011, 004, 034, 013, 029, 017, 012, 060, 041, 009, 045, 022, 001) | hành lang mái ngói cam 13 gian, 2 hàng cột son (x ±338/±376), tường hậu vôi + chân sơn son chỉ vàng, sàn đá; mỗi tượng một gian, bệ đá vuông viền son/vàng (đầu tượng đặt trên trụ đá tiện), bảng tên đọc từ phía sân |
| Hành lang chư Bồ Tát | dọc tường Đông, x = 358 | 12 tượng Bồ Tát/Di Lặc (023, 027, 024, 035, 031, 003, 014, 025, 026, 038, 037, 039); gian giữa là bàn hương | như trên |

Tất cả tượng quay mặt về phía người xem: trục chính và hai tượng trước điện nhìn ra cổng; hai dãy hành lang nhìn vào sân. Ghế đá, đèn và cây vườn tự né các vùng này (`statueGardenReserved`).

## Xử lý mẫu 3D

`authoring/buddha-library/prepare.py` (Blender 4.5.15, chạy nền):
- `inspect`: gộp lưới, dựng đứng, chuẩn hoá cao 1 m, chụp 4 góc → `authoring/buddha-library/inspect/*.png` để xác định mặt trước.
- `front-yaw.json`: góc xoay đưa mặt tượng về +Z (001: 180°; 010, 020, 027, 035, 037, 038, 039, 056: −90°).
- `export`: 3 mức chi tiết high 60k / low 15k / far 3k tam giác (023, 024 far ~5.5k vì lưới nhiều mảnh rời), texture JPEG 2048/1024/256 → `public/assets/sanctuary/library/<mã>/{high,low,far}.glb` + `asset.json` (tác giả, giấy phép, SHA256 nguồn và từng LOD).

Runtime `src/game/world/StatueGarden.ts`: nạp từng mẫu một, ưu tiên bản xa của mọi tượng rồi mới tới bản chi tiết gần người chơi; mức chi tiết tính theo khoảng cách chia chiều cao tượng (`gardenLod`), nên tượng 20 m giữ chi tiết từ xa hơn tượng 5 m. Bản high được giải phóng khi rời xa. Va chạm: bệ tượng, cột, tường hậu, bàn hương.

## Giấy phép

28 mẫu CC BY 4.0, mẫu 035 CC BY-SA 4.0 (bản chỉnh giữ CC BY-SA). Ghi công đầy đủ: `public/assets/sanctuary/library/CREDITS.md`. Phải giữ file này khi phát hành.

## Điều hướng

Thanh công cụ: **Vườn tượng** (toàn cảnh), **Đài A Di Đà**, menu **Vườn tượng · 29 pho** để bay tới từng tượng. URL: `?view=statue-garden`, `?view=amitabha`, `?statue=<mã>` (ví dụ `?statue=010`).

## Kiểm chứng / còn lại

- `npm test`: thêm 7 test (`test/statue-garden.test.ts`) — đủ 29 mẫu không trùng, trục đối xứng giữa hai kinh luân, Quan Âm/Địa Tạng đối xứng, mỗi gian một tượng quay vào sân và nằm trong tường, không đè kinh luân, cây không mọc vào vùng tượng, LOD theo chiều cao, mỗi tượng đủ 3 GLB trong ngân sách tam giác và có ghi công.
- Đã xem bằng trình duyệt (chế độ Nhẹ): đài A Di Đà, Di Lặc, Quan Âm, Địa Tạng, hành lang.
- Chưa đo FPS trên GPU thật khi đứng giữa sân thấy cùng lúc nhiều tượng; chưa kiểm điện thoại. Danh xưng một số tượng (ví dụ 009, 031 đầu bốn mặt; 037, 039 tượng màu) là tên mô tả theo hình dáng, cần người am hiểu Phật học rà lại trước khi phát hành.
- Tổng dung lượng tượng trong `public` khoảng vài chục tới ~100 MB; nếu cần nhẹ hơn có thể hạ texture high xuống 1024.

## Đại lộ hộ pháp (thêm 31/10/2026)

19 vị Nhị thập bát bộ chúng Sanjūsangen-dō (`assets-src/sanjusangendo-28`, @apishkaede) nhân đôi đối xứng thành **hai hàng dọc lối đi giữa, từ sau cổng tam quan (z 553) vào tới trước sân A Di Đà (z 433)**: x = ±17, cách 6,7 m, vị số 1 gần cổng nhất, cùng thứ tự hai bên, quay mặt vào lối đi. Tượng cao 4,4 m trên bệ đá 1,1 m viền son/vàng, có bậc đá phía lối đi và bảng tên Hán–Việt. Di Lặc đứng giữa hai hàng. Hai hàng dùng chung một bản model mỗi mức chi tiết (38 tượng, 19 model).

Xử lý: `LIB=guardians blender -b -P authoring/buddha-library/prepare.py -- inspect|export <số>` → `public/assets/sanctuary/guardians/<số>/`. Cả 19 mẫu cùng hướng mặt nên không cần xoay; tất cả đều hàn đỉnh trùng trước khi giảm lưới.

**Giấy phép CC BY-NC-ND 4.0 — chỉ build cá nhân.** Công tắc `INCLUDE_NC_GUARDIANS` trong `StatueGardenPlan.ts`; trước khi phát hành phải tắt và xoá `public/assets/sanctuary/guardians` (xem CREDITS.md trong thư mục đó). Nút **Đại lộ hộ pháp**, URL `?view=guardians`.

## Phật dưới cội bồ đề (thêm 31/10/2026)

"Meditating Buddha" của restore50 (Sketchfab, CC BY 4.0, file anh tải về `Downloads/meditating-buddha.zip` → `assets-src/meditating-buddha`). Ngồi trên nền đá tròn R3 m viền vàng trước thân cây bồ đề (−90, 287), cách thân 7 m giữa các rễ toả, quay mặt ra lối vào, cao 3,6 m, bàn hương nhỏ phía trước. Xử lý `LIB=bodhi … prepare.py -- export bodhi` → `public/assets/sanctuary/library/bodhi`. Menu: Vườn bồ đề · Phật Thích Ca thiền định; URL `?statue=bodhi`.

## Thượng điện tầng 2 (thêm 31/10/2026)

Bộ Diana123456 (CC BY 4.0, `assets-src/diana-buddha`) đặt ở khoảng không cột phía sau tầng 2, ngay trên Phật chính tầng dưới, theo kiểu bàn thờ nhiều cấp: 04 Phật ngồi 16 m trên bệ 3 tầng (0,−172); 06 Phật A Di Đà đứng 7 m phía trước (0,−138) cùng bàn hương lớn; cặp tượng gỗ chạm có hào quang 01/02 ở x=±36; cặp Quan Âm 09 (ngồi) / 05 (đứng) ở x=±90 (vùng trống trên Quan Âm tầng dưới). Bệ tròn đá/sơn son viền vàng + vòng sen. Mẫu không texture được phủ vàng. Nút **Thượng điện**, URL `?view=upper-shrine`. Tải mức chi tiết theo khoảng cách 3D nên đứng ở tầng dưới không nạp bản chi tiết của tầng trên.
