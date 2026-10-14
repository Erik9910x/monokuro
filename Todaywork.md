# MONOKURO - NHẬT KÝ CÔNG VIỆC HÔM NAY (TODAYWORK.MD)
*Ngày cập nhật: 12/10/2026*

---

## 📌 1. Bối Cảnh Dự Án (Project Context)
**Monokuro** là nền tảng không gian làm việc & học tập tập trung đơn nhiệm (Monotask Study Workspace), kết hợp bộ ba công cụ:
1. **FocusX**: Đồng hồ bấm giờ Pomodoro / Monotask tối giản với chế độ toàn màn hình và âm thanh chuông sinh học.
2. **VibraX**: Không gian âm nhạc & môi trường học tập không quảng cáo, đồng bộ lời bài hát Karaoke Synced Lyrics theo thời gian thực (Line & Word mode), hỗ trợ nhập link từ Spotify, Apple Music, SoundCloud, YouTube.
3. **FrameWhisper**: Không gian học qua video bài giảng với ghi chú & đánh dấu Bookmark theo mốc thời gian (Timestamp).

---

## 🚀 2. Toàn Bộ Công Việc & Vấn Đề Đã Giải Quyết Trong Ngày

### 🛠️ 1. Sửa Lỗi Hydration & Cơ Sở Dữ Liệu IndexedDB
- **Lỗi Hydration Mismatch:**
  - Sửa xung đột thuộc tính giữa SSR (Server Side Rendering) và Client trên Next.js Turbopack do các giá trị thời gian/random và extension trình duyệt.
  - Áp dụng cờ `isMounted` và xử lý an toàn cho các component client-only.
- **Lỗi `IDBDatabase: The database connection is closing`:**
  - Thiết kế lại module `src/lib/storage/index.ts` với hàm bọc an toàn `withDB()`, tự động mở lại kết nối khi bị đóng ngắt quãng, xử lý tuần tự không bị nghẽn transaction.

---

### 🎵 2. Sửa Lỗi Loader Xoay Tròn & Đồng Bộ Mốc Thời Gian (0:00)
- **Vấn đề cũ:** Khi chuyển bài mới, thanh tiến trình vẫn lưu số giây của bài cũ (ví dụ 02:45) và loader xoay tròn rất lâu hoặc không tải được.
- **Giải pháp:**
  - Khi người dùng bấm chuyển sang bất kỳ bài hát nào, lập tức reset ngay mốc thời gian `progress: 0` (0:00).
  - Tạm dừng và tua lại cả hai engine (HTML5 Audio `currentTime = 0` và YouTube Player `seekTo(0, true)`).
  - Thêm cơ chế Watchdog tự phục hồi: nếu tải quá 7 giây sẽ tự động chuyển sang stream dự phòng hoặc đưa ra thông báo rõ ràng, không treo cứng app.

---

### 🛡️ 3. Cơ Chế Chống Quảng Cáo (Anti-Ads) & Lọc Video Rác
- **Chặn quảng cáo & video nhảm cho Spotify:**
  - Nâng cấp API `/api/music/resolve` sử dụng cơ chế bóc tách SSR `__NEXT_DATA__` từ Spotify Embed.
  - Lấy được tên bài hát, nghệ sĩ thực tế, danh sách toàn bộ bài trong Album, kèm luồng nghe trước chất lượng cao trực tiếp từ CDN Spotify (`p.scdn.co/mp3-preview/...`), hoàn toàn sạch không quảng cáo.
- **Lọc video rác trên YouTube:**
  - Nâng cấp `/src/lib/music/youtube.ts` phân tích `ytInitialData`.
  - Loại bỏ hoàn toàn các video quảng cáo được tài trợ, video reaction, parody chế rác.
  - Ưu tiên chọn bản phát hành chuẩn từ YouTube Music Official Topic (`- Topic` / `Official Audio`).
- **Hỗ trợ link rút gọn:**
  - Hỗ trợ các link rút gọn từ SoundCloud (`on.soundcloud.com/`), YouTube (`youtu.be/`), iTunes, Spotify.

---

### 🌐 4. Hệ Thống Đa Ngôn Ngữ Chuẩn Quốc Tế (6 Ngôn Ngữ)
Đã triển khai hệ thống dịch thuật hoàn chỉnh trong `src/lib/i18n/index.ts` hỗ trợ:
1. **Tiếng Việt (`vi`)**
2. **English (`en`)**
3. **Español (`es`)**
4. **Tiếng Trung chuẩn (`zh`)**
5. **Tiếng Thái chuẩn (`th`)**
6. **Tiếng Hàn chuẩn (`ko`)**

Toàn bộ nhãn nút bấm, thông báo trạng thái, chế độ lặp, PIP, và các thể loại âm nhạc đều được bản địa hóa 100%.

---

### 🔍 5. Thiết Kế Lại Giao Diện Hộp Tìm Kiếm Âm Nhạc (Music App Search Box)
- Đã biến nút catalog đơn điệu thành một thanh tìm kiếm thông minh chuẩn phong cách ứng dụng nghe nhạc hiện đại ([CatalogSearchPanel.tsx](file:///d:/1.PROJECT%20CODE/Monokuro/src/components/vibrax/CatalogSearchPanel.tsx)):
  - Hỗ trợ vừa gõ tìm kiếm bài hát/nghệ sĩ, vừa tự nhận diện link URL dán vào để Import ngay.
  - Lưu lịch sử tìm kiếm gần đây (Recent Searches) trong localStorage.
  - Dải nút chọn thể loại tâm trạng (Vibe Pills):
    - 🌟 **Tất Cả** (All)
    - ☕ **Lofi Học Tập** (Lofi Study)
    - 🎹 **Piano Thư Giãn** (Calm Piano)
    - 🎻 **Cổ Điển** (Classical)
    - 🌌 **Deep Ambient** (Deep Ambient)
    - 🌧️ **Mưa & Tự Nhiên** (Rain & Nature)
  - Xóa bỏ nút play thừa gây rối mắt ở ngang tên bài, chỉ cần bấm vào dòng bài hát là phát ngay.

---

### 🔽 6. Nút Ẩn / Hiện Thanh Player Dock (`BottomPlayerDock.tsx`)
- Thêm nút thu gọn (**`ChevronDown`**) ở góc phải thanh Player Dock.
- Khi bấm ẩn: Thanh Player trượt xuống dưới giải phóng 100% không gian màn hình, **âm nhạc vẫn tiếp tục phát không gián đoạn**.
- Xuất hiện một **Viên Mini Player Nổi (Floating Mini Pill)** ở góc dưới bên phải (`bottom-4 right-4`):
  - Ảnh đại diện đĩa xoay tròn sinh động.
  - Tên bài hát & thời gian phát trực tiếp.
  - Nút Play / Pause nhanh ngay trên viên mini.
  - Nút **`HIỆN PLAYER`** (**`ChevronUp`**) để đưa toàn bộ thanh player trở lại bất cứ lúc nào.

---

### 🪟 7. Cửa Sổ Video PIP: Kéo Thả Tự Do & Phóng To Thu Nhỏ Theo Ý Muốn
Nâng cấp toàn diện cho cửa sổ Picture-in-Picture trong [GlobalAudioPlayer.tsx](file:///d:/1.PROJECT%20CODE/Monokuro/src/components/player/GlobalAudioPlayer.tsx):
- **Kéo thả tự do (Draggable):** Giữ chuột trên thanh tiêu đề (`cursor-grab` / `Move`) để kéo cửa sổ PIP đến bất kỳ vị trí nào trên màn hình.
- **Tự do thay đổi kích thước (Freely Resizable):** Có góc kéo kích thước ở góc dưới bên phải (`cursor-se-resize`), kéo chuột tự do phóng to hoặc thu nhỏ video theo ý muốn.
- **3 Nút kích thước nhanh (Presets):**
  - **`S`** (Small ~280px)
  - **`M`** (Medium ~420px)
  - **`L`** (Large ~600px)
- **Lớp chắn chống nuốt chuột qua Iframe:** Tự động bật lớp phủ trong suốt khi đang kéo thả hoặc chỉnh kích thước để tránh việc con trỏ chuột trượt vào iframe YouTube làm mất sự kiện rê chuột.

---

### 💿 8. Xử Lý Album Hoàn Chỉnh (Hàng Đợi 15 Bài & Next / Back Mượt Mà)
- **Vấn đề cũ:** Khi nhập link Album (15 bài), hệ thống chỉ nạp 1 bài duy nhất vào hàng đợi, người dùng không thể Next/Back qua các bài khác trong album.
- **Giải pháp:**
  - Xây dựng hàm `playQueue(tracks, startIndex)` trong `playerStore.ts`.
  - Khi nhập Album:
    - Có nút **`CHƠI TOÀN BỘ ALBUM (15 BÀI)`** ở đầu album.
    - Bấm vào bất kỳ bài nào trong danh sách 15 bài thì bài đó sẽ phát ngay, đồng thời **toàn bộ 15 bài của album được nạp vào hàng đợi (Queue)** với vị trí chính xác.
  - Nút **Next Track** (`SkipForward`) và **Previous Track** (`SkipBack`) chuyển bài tuần tự qua toàn bộ album.
  - Khi phát hết một bài, hệ thống **tự động chuyển tiếp sang bài kế tiếp**.
  - Hiển thị badge số thứ tự bài trên Player Dock: ví dụ **`1/15`**, **`2/15`**...
  - Lưu toàn bộ danh sách bài của Album vào IndexedDB, bấm **`PHÁT LẠI`** trong thư viện đã lưu sẽ nạp lại toàn bộ album.

---

### ⚡ 9. Sửa Triệt Để Lỗi Nút "PHÁT LẠI" / Play Bị Xoay Vô Tận
- **Nguyên nhân cốt lõi phát hiện được:**
  - Khi bấm nút "PHÁT LẠI" ở Saved Library hoặc ở box tìm kiếm, kho dữ liệu đã có `userIntent = 'play'` và ID bài hát không đổi.
  - Trong `GlobalAudioPlayer.tsx`, bộ nạp YouTube thấy `lastLoadedYtVideoIdRef.current === ytId` thì thoát hàm (`return;`) mà không gọi `playVideo()`.
  - Kết quả là video không được lệnh phát và player bị kẹt vĩnh viễn ở trạng thái `loading` (con quay xoay tròn vô tận), chỉ khi bấm nút dock thì menu mới ép toggle trạng thái.
- **Giải pháp:**
  - Thêm tín hiệu kích hoạt phát độc lập **`playTrigger`** trong [playerStore.ts](file:///d:/1.PROJECT%20CODE/Monokuro/src/lib/store/playerStore.ts).
  - Kết nối trực tiếp logic phát của thanh menu player vào tất cả các nút:
    - Nút **`PHÁT LẠI`** trong Saved Library.
    - Nút bài hát / album trong Box Tìm Kiếm (`CatalogSearchPanel`).
    - Nút trong danh sách Resolved Album.
  - Khi bấm bất kỳ nút nào, hệ thống phát ngay lập tức (`seekTo(0)` + `playVideo()` / `audio.play()`), xóa bỏ hoàn toàn tình trạng bị kẹt spinner.

---

## 📁 3. Danh Sách Các File Quan Trọng Đã Thay Đổi
- [src/types/index.ts](file:///d:/1.PROJECT%20CODE/Monokuro/src/types/index.ts): Bổ sung lưu danh sách `tracks` cho SavedMusicLink.
- [src/lib/store/playerStore.ts](file:///d:/1.PROJECT%20CODE/Monokuro/src/lib/store/playerStore.ts): Bổ sung `playQueue`, `playTrack`, `playTrigger`, CURATED_STUDY_TRACKS 5 thể loại.
- [src/lib/storage/index.ts](file:///d:/1.PROJECT%20CODE/Monokuro/src/lib/storage/index.ts): Bổ sung hàm tính thời gian học hôm nay `getTodayStudyStats` chính xác từng giây để mở khóa CineChill.
- [src/lib/i18n/index.ts](file:///d:/1.PROJECT%20CODE/Monokuro/src/lib/i18n/index.ts): 6 ngôn ngữ quốc tế và bản dịch các tính năng mới + CineChill.
- [src/components/app-shell/AppShell.tsx](file:///d:/1.PROJECT%20CODE/Monokuro/src/components/app-shell/AppShell.tsx): Cập nhật menu điều hướng thay thế FrameWhisper bằng CineChill (icon Film).
- [src/app/page.tsx](file:///d:/1.PROJECT%20CODE/Monokuro/src/app/page.tsx): Cập nhật thẻ Module 03 trên trang chủ thành CineChill.
- [src/app/cinechill/page.tsx](file:///d:/1.PROJECT%20CODE/Monokuro/src/app/cinechill/page.tsx): Không gian rạp phim CineChill hỗ trợ cả 2 phương án test (A: In-App Cinema, B: Netflix Mini-Theater Pop-out + Bộ đếm giờ giải lao Monokuro), khóa sau 30 phút học và nút gạt Test Demo.
- [src/app/framewhisper/page.tsx](file:///d:/1.PROJECT%20CODE/Monokuro/src/app/framewhisper/page.tsx): Chuyển tiếp tự động sang CineChill.
- [scripts/backup.mjs](file:///d:/1.PROJECT%20CODE/Monokuro/scripts/backup.mjs): Lệnh sao lưu nhanh `npm run backup` tạo snapshot Git và thư mục lưu trữ.

---

## 🎬 4. Nâng Cấp Toàn Diện CineChill & Sửa Lỗi Hệ Thống
- **Đổi tên & Tính năng Phương án A $\rightarrow$ VibeTube:**
  - **Tích hợp Anti-ADs:** Tự động áp dụng cờ triệt tiêu quảng cáo và video rác (`rel=0&modestbranding=1&iv_load_policy=3&disablekb=0&playsinline=1`). Có badge kiểm định `ANTI-ADS ACTIVE (0% QUẢNG CÁO)`.
  - **Full F11 Mode:** Nút phóng to toàn màn hình rạp chiếu điện ảnh tràn viền 100% không viền trình duyệt.
- **Đổi tên & Tính năng Phương án B $\rightarrow$ FlixOut:**
  - **Tích hợp sẵn tài khoản Netflix vào Web:** Thẻ *Hồ sơ tài khoản Netflix đã liên kết* (Linked Account Vault) ghi nhớ Profile và Email người dùng, nút 1-click mở thẳng Netflix.
  - Cửa sổ Pop-out rạp chiếu không viền (S, M, L) và bộ đếm ngược giờ giải lao (15p, 30p, 45p) kèm chuông Zen nhắc học.
- **Cinematic Blur Popup Modal (Khi chưa đủ điều kiện 30 phút):**
  - Màn hình popup mờ ảo Cinematic Blur (`backdrop-blur-2xl`) che trọn màn hình báo *Chưa đủ điều kiện...*.
  - Hiển thị chính xác tiến độ học hôm nay và thời gian còn thiếu.
  - Cung cấp đúng 2 lựa chọn theo yêu cầu:
    1. **HỌC NGAY ĐỂ MỞ KHÓA (Vào FocusX)**: Chuyển ngay đến trang học tập.
    2. **RỜI KHỎI CINEMATIC BLUR MODE**: Đóng popup để nhìn giao diện bên dưới, nhưng toàn bộ trình phát và nút bấm vẫn bị khóa mờ (`pointer-events-none opacity-30 select-none`), hoàn toàn không được dùng.
- **Ghi nhận thời gian học liên tục từng giây (Không mất thời gian oan uổng):**
  - Trong `timerStore.ts`: Cập nhật `pause()`, `resume()`, và `reset()` lưu ngay số giây đã học vào `IndexedDB`. Ngay cả khi người học bấm Reset giữa chừng, số giây đã học vẫn được bảo toàn nguyên vẹn cho ngày hôm đó!
  - Trong `CineChill`: Timer đếm nhịp mỗi 1 giây cộng dồn thời gian đang chạy từ FocusX sang CineChill theo thời gian thực (Real-time).
- **Sửa triệt để lỗi VibraX chỉ phát nhạc 30s:**
  - Phát hiện nguyên nhân: Link Spotify và iTunes tìm kiếm chỉ cung cấp audio preview 30s (`p.scdn.co/mp3-preview/...`), và hệ thống cũ bị chặn điều kiện `!track.audioUrl` nên không tìm bản đầy đủ.
  - Khắc phục: Xóa bỏ rào cản, tự động tra cứu video YouTube Official Audio/Topic cho mọi bài hát thiếu `youtubeId`. Khi bài hát đang phát bản nghe thử, hệ thống tự động nâng cấp mượt mà sang bản đầy đủ của YouTube mà không bao giờ bị cắt ở giây 30.

---

## 🧪 5. Trạng Thái Build & Kiểm Tra Hiện Tại
- Lệnh build: `npm run build` (Turbopack + TypeScript check)
- Kết quả: **Thành công 100% (Exit code 0, 0 lỗi TypeScript, 15/15 static pages generated)**.
- Lệnh sao lưu dự án: `npm run backup` (hoặc `node scripts/backup.mjs`)
- Dev server đang chạy ổn định tại: `http://localhost:3000/cinechill`.
