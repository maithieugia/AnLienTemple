# Tích hợp tính năng gõ mõ / gõ chuông / lần chuỗi hạt — Hướng dẫn cho Claude

Tính năng nghi lễ cho game Chùa Online An Liên: người chơi bấm vào bộ lễ
trong chánh điện → hiện khung nhìn cận cảnh 3D (bát chuông vàng, mõ chạm,
chuỗi hạt, 2 dùi) → bấm vào mõ/chuông/chuỗi: dùi vung gõ + tiếng kêu + cộng
1 điểm công đức. File tham chiếu: `ritual-reference.ts` trong thư mục này
(code mẫu để adapt, KHÔNG phải file drop-in — xem mục "Điểm cần quyết").

## 1. Copy file model 3D

Nguồn: `~/workspace/chua_online/go_mo_chuong_chuoi/models/` (bản v2, đã chốt
theo ảnh mẫu). Đích trong game: `/assets/sanctuary/ritual/`.

| File | Mô tả | Tris |
|---|---|---|
| `chuong_v2.glb` | Bát chuông vàng, Ø 0.43 m, cao 0.223 m | 9.264 |
| `mo_v2.glb` | Mõ chạm khắc, 0.356 × 0.230 × 0.283 m | 13.728 |
| `goi_v2.glb` | Gối đỏ thêu sen vàng, Ø 0.458 m, cao 0.134 m (cần 2 cái) | 4.396 |
| `dui_chuong_v2.glb` | Dùi đầu VÀNG (cho bát chuông), dài 0.366 m | 4.588 |
| `dui_mo_v2.glb` | Dùi đầu GỖ (cho mõ), dài 0.357 m | 4.588 |
| `chuoi_v2.glb` | Chuỗi 108 hạt + hạt cái VÀNG + tua rua ĐỎ | 11.792 |

Tất cả Y-up, đơn vị mét, PBR, texture đã nhúng trong GLB. Gốc tọa độ:
bát/mõ/gối = tâm đáy; dùi = đầu cán (xoay quanh gốc để gõ); chuỗi = tâm vòng,
vòng nằm mặt phẳng XZ, tua rua hướng -Z, tâm vòng lệch khỏi gốc ~0.05 m về +Z.
Ảnh xem trước: `models/*_v2_front.png`, `*_v2_angle.png`, `group_v2.png`.

## 2. Âm thanh — dùng file THẬT của game, KHÔNG dùng file tổng hợp

| Hành động | File dùng | Ghi chú |
|---|---|---|
| Gõ mõ | `/assets/amb/chua_mo_tram.mp3` (đã có sẵn trong game, 1.0 s) | Tiếng mõ trầm, đúng ý chủ game ("dầy và trầm"). Bản dự phòng: `chua_mo.mp3` (0.65 s, sáng hơn). **Anh đã chốt 07/11: dùng đúng file này — file anh gửi `tieng-mo-chanh-dien.mp3` khớp từng byte (md5) với `chua_mo_tram.mp3`.** |
| Gõ chuông | `/assets/amb/chua_bell.mp3` (đã có sẵn trong game, 40 s) | File dài 40 s — mỗi lần gõ chỉ phát 1 lần rồi **fade out sau ~6 s** (code mẫu đã làm sẵn), nếu không nhiều lần gõ sẽ chồng thành tiếng chuông 40 s liên tục. Nếu muốn gọn hơn thì cắt file còn ~6 s. |
| Lần hạt | `bead-tick.mp3` trong gói này (copy vào `/assets/sanctuary/ritual/bead-tick.mp3`) | **File tổng hợp duy nhất còn dùng** — game KHÔNG có file tiếng lần hạt thật. Đây là bản copy của `sounds/hat.mp3` (tick gỗ khô 0.08 s). |

KHÔNG dùng `sounds/mo.mp3` và `sounds/chuong.mp3` (bản tổng hợp cũ) — đã bị
file thật của game thay thế. Chỉ `hat.mp3` → `bead-tick.mp3` là còn cần.

## 3. Gắn code tham chiếu vào client

1. Copy `ritual-reference.ts` vào source client, sửa đường import Babylon
   theo đúng kiểu import của client (client dùng module `.pure` / thinEngine —
   API gọi trong file là Babylon chuẩn, chỉ đường import là cần adapt).
2. Khởi tạo `RitualView` với: `scene` hiện tại, hàm `send` của WebSocket game,
   hàm `showToast` sẵn có của client, và (nên có) `setPlayerControlsEnabled`
   để khóa di chuyển khi khung lễ đang mở.
3. Gắn trigger mở khung lễ: truyền mesh bộ lễ trong chánh điện (hoặc một hộp
   trigger vô hình trước bàn thờ) vào `attachWorldTrigger(mesh)`. Đóng khung
   bằng nút đóng sẵn có của client → gọi `close()` (khôi phục camera cũ).
4. Trong khung lễ: bấm vào bát → `strike('chuong')`; bấm vào mõ →
   `strike('mo')`; bấm vào chuỗi → `countBead()`. Dùng pick (ActionManager
   OnPickTrigger) trên từng mesh như code mẫu đã ghi chú.
5. Hiển thị điểm công đức: KHÔNG cần code mới — server trả `{t:'merit', m,
   note}` và client đã có handler hiển thị note. Nếu muốn hiện note ngay
   trong khung lễ thì nối thêm hook hiển thị của overlay vào đó.

## 4. Hợp đồng WebSocket (server đã có handler riêng — Muse làm phần server)

```
Client -> Server:  { t: 'ritual', kind: 'mo' | 'chuong' | 'chuoi' }
Server -> Client:  { t: 'merit', m, note }     // +1, note vd '+1 công đức · gõ mõ'
Server -> Client:  { t: 'notice', text }       // khi đang cooldown hoặc không ở chánh điện
```

- **Cooldown 2 giây, CHUNG cho cả 3 loại** (gõ mõ xong phải đợi 2 s mới được
  gõ chuông/lần hạt). Client chặn trước bằng throttle 2 s trong code mẫu
  (hiện toast "Xin chờ giây lát rồi gõ tiếp"); server là nơi quyết định cuối.
- **Chỉ cộng điểm khi người chơi đang ở chánh điện** — server kiểm tra vị trí,
  ngoài chánh điện thì trả `{t:'notice'}` và không cộng điểm. Client không
  cần tự kiểm tra vị trí.
- Mỗi lần chạm hợp lệ = +1 công đức đúng loại đó (mõ/chuông/chuỗi riêng).

## 5. Điểm cần quyết (Claude quyết, đã đánh dấu ASSUMPTION trong code)

1. **Đường import Babylon** — adapt theo module `.pure`/thinEngine của client.
2. **Cách phát âm thanh** — dùng `new Sound` như code mẫu hay dùng module
   `spatialWebAudio`/`webAudioSoundSource` sẵn có của client (nên dùng module
   sẵn có để tiếng phát ra đúng vị trí 3D).
3. **Góc vung dùi** — hằng số `REST = 0.35`, `HIT = -0.65` rad và vị trí pivot
   trong code mẫu là giá trị ước lượng; cần chỉnh trong game thật sao cho đầu
   dùi chạm đúng mặt bát/mõ lúc đánh. Dùi ở tư thế nghỉ đang "cầm sẵn" phía
   trên vật gõ; nếu muốn đúng ảnh mẫu (dùi nằm trên bàn) thì thêm pha nhấc
   dùi lên trước khi vung xuống.
4. **Vị trí chuỗi hạt** — 108 hạt đã join chung 1 mesh trong GLB nên không
   tô sáng từng hạt riêng được; code mẫu dùng một viên đánh dấu phát sáng
   nhảy tới hạt đang đếm. Nếu muốn tô sáng hạt thật thì phải build lại GLB
   với hạt tách riêng.
5. **File chuông 40 s** — giữ nguyên + fade sau 6 s (như code mẫu) hay cắt
   file còn ~6 s cho gọn.
6. **Nút đóng khung lễ** — dùng nút/UI sẵn có của client; code mẫu chỉ lo
   phần 3D + camera.

## 6. Checklist test

- [ ] Mở game, vào chánh điện, bấm vào bộ lễ → khung cận cảnh hiện ra (bát
      trái trên gối, mõ phải trên gối, chuỗi phía trước, 2 dùi đúng chỗ).
- [ ] Bấm mõ → dùi gỗ vung xuống đúng mặt mõ, tiếng `chua_mo_tram.mp3` kêu
      đúng lúc chạm, hiện `+1 công đức · gõ mõ`, tổng công đức tăng 1.
- [ ] Bấm chuông → dùi đầu vàng vung xuống, tiếng chuông kêu, hiện
      `+1 công đức · gõ chuông`, tiếng chuông tắt dần sau ~6 s (không kéo 40 s).
- [ ] Bấm chuỗi → viên đánh dấu nhảy sang hạt kế tiếp, tick kêu, hiện
      `+1 công đức · lần chuỗi`; bấm 108 lần → báo "Đã lần hết một vòng".
- [ ] Bấm liên tục 3 lần trong 1 s → chỉ lần đầu cộng điểm, các lần sau hiện
      thông báo chờ (không cộng điểm, không spam socket).
- [ ] Ra khỏi chánh điện rồi gõ (nếu mở được khung lễ) → server trả notice,
      không cộng điểm.
- [ ] Đóng khung lễ → camera về góc nhìn người chơi, di chuyển lại bình thường.
- [ ] Kiểm tra trên máy yếu: 6 model v2 tổng ~48k tris + texture nhúng — không
      giật khung hình khi mở khung lễ.

## 7. File trong gói này

- `ritual-reference.ts` — code tham chiếu (Babylon.js, có chú thích đầy đủ).
- `bead-tick.mp3` — tiếng lần hạt (tổng hợp, 0.08 s, copy của `sounds/hat.mp3`).
- `INTEGRATION.md` — file này.
- Model GLB + ảnh mẫu nằm ở `../models/` (không copy lại vào đây để tránh trùng).
