# Chùa Online An Liên — app Android

App Capacitor chỉ là "vỏ": mở thẳng https://dichua.palo.io.vn/ (capacitor.config.json → server.url). Game không đóng gói vào APK, nên sửa game và deploy web là app tự có bản mới, **không cần làm lại APK**. Chỉ build lại APK khi đổi tên, biểu tượng, quyền, hay MainActivity.

- Gói: `vn.io.palo.chuaanlien` · user agent thêm `ChuaAnLienApp` (game tự bật giao diện điện thoại).
- MainActivity: toàn màn hình, giữ màn hình sáng, cho phép phát âm thanh sau khi bấm Vào chùa, xoay ngang/dọc tự do.
- Biểu tượng: `python mobile-app/make_icons.py` (ảnh gốc `store/icon-1024.png`).
- **Khóa ký** `keys/chuaanlien-release.jks` + `keys/keystore.properties` — GIỮ KỸ, mất khóa thì máy đã cài không cập nhật đè được nữa. Không đưa lên git/server.

## Build APK
```
cd mobile-app
npx cap sync android
cd android && set JAVA_HOME=C:\Android\jdk21 && gradlew.bat assembleRelease
```
APK: `android/app/build/outputs/apk/release/app-release.apk` (nhớ tăng versionCode/versionName trong android/app/build.gradle khi phát hành bản mới).
