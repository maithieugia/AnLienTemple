# Authoring0.2.0

Mái/cột: Blender4.5 LTS, worker `build/blender_build.py`, recipe `build/recipes/sanctuary_grand.py`, specs `sanctuary-grand-roof.json` / `sanctuary-giant-column.json`. Worker lưu source.blend và xuất High/Low; nguồn hiện hành ở generated. Chép GLB vào public/assets/workshop đúng id, giữ spec/report/hash đồng bộ. Không cần Blender để chơi.

Cây: `python authoring/fetch-garden-tree.py` lấy nguồn CC0 có kiểm MD5. Chạy Blender background với `prepare-garden-tree.py`, sau đó `prepare-tree-far.py`. Nguồn tải lớn không kèm ZIP; manifest/info và recipe có trong gói. RuntimeGLB đã đầy đủ và không cần tải lại khi chơi.

Code quần thể/bề mặt/bảng tên: src/game/world. Không dùng các file dưới Veilbound gốc. Giữ ASSETS.md và AUTHOR_CREDITS.md khi phát hành.
