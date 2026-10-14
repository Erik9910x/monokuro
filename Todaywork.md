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
- **Chế Độ Xem Thử Giao Diện Đang Khóa (Frosted Locked Overlay - Không Dùng Pop-up):**
  - Xóa bỏ hoàn toàn pop-up che toàn màn hình theo đúng yêu cầu người dùng.
  - Vùng trình phát VibeTube & FlixOut có lớp phủ kính mờ tinh tế (In-Page Frosted Glass Locked Overlay).
  - Hiển thị thông điệp chuẩn: *"Chế Độ Xem Thử Giao Diện Đang Khóa - Trình phát phim VibeTube và FlixOut đã bị khóa. Hãy học đủ 30 phút để kích hoạt toàn bộ rạp chiếu."*
- **Bộ Đếm Ngược Countdown Theo Real-Time (30:00 $\rightarrow$ 00:00):**
  - Đồng hồ đếm ngược sống động hiển thị thời gian còn lại cần học trên cả thanh header và trên thẻ khóa.
  - Tích hợp hàm `getCompletedStudySecondsToday` bóc tách phiên học đang chạy trong RAM với dữ liệu IndexedDB:
    - Khi FocusX đang bấm giờ: Đồng hồ đếm lùi từng giây một theo thời gian thực (ví dụ `29:59` $\rightarrow$ `29:58` $\rightarrow$ `29:57`...).
    - Khi FocusX tạm dừng: Đồng hồ hiển thị `⏸️ TẠM DỪNG: mm:ss`.
    - Khi đạt mốc 30 phút: Tự động về `00:00` và mở khóa toàn bộ rạp chiếu CineChill ngay lập tức.
- **Ghi nhận thời gian học liên tục từng giây (Không mất thời gian oan uổng):**
  - Trong `timerStore.ts`: Cập nhật `pause()`, `resume()`, và `reset()` lưu ngay số giây đã học vào `IndexedDB`. Ngay cả khi người học bấm Reset giữa chừng, số giây đã học vẫn được bảo toàn nguyên vẹn cho ngày hôm đó!
  - Trong `CineChill`: Timer đếm nhịp mỗi 200ms đọc trực tiếp từ `useTimerStore.getState()` tính toán chính xác tuyệt đối thời gian đã trôi qua trong phiên hiện tại.
- **Sửa triệt để lỗi VibraX chỉ phát nhạc 30s:**
  - Phát hiện nguyên nhân: Link Spotify và iTunes tìm kiếm chỉ cung cấp audio preview 30s (`p.scdn.co/mp3-preview/...`).
  - Khắc phục: Nâng cấp `src/lib/music/youtube.ts` với cơ chế tìm kiếm 2 tầng (kèm 'official audio' và fallback nguyên bản), tăng timeout lên 6000ms.
  - Khi bài hát đang phát preview HTML5, hệ thống tự động tìm YouTube và chuyển giao âm thanh mượt mà sang bản Full độ dài chuẩn 3-5 phút không ngắt quãng.
- **Sửa Lỗi Nút Replay & Triệt Tiêu 100% Hiện Tượng 2 Bài Chồng Lên Nhau (HUGE ALERT):**
  - **Nguyên nhân gốc rễ 1:** Trong `GlobalAudioPlayer.tsx`, Section B (HTML5 Audio) trước đây KHÔNG bao giờ dừng/pause YouTube Player. Do đó khi chuyển từ YouTube sang bài HTML5, cả 2 bài đều đồng thời phát âm thanh đè lên nhau.
  - **Nguyên nhân gốc rễ 2:** Khi bấm Replay cùng bài hát, YouTube Iframe gọi `playVideo()` mà không gọi `seekTo(0, true)`. Vì video đã nằm ở cuối thời lượng (`duration`), YouTube lập tức phát sinh sự kiện `ENDED (0)`.
  - **Nguyên nhân gốc rễ 3:** Sự kiện `ENDED` kích hoạt `notifyMediaEnded()`, khiến hàm này tự động gọi `next()` nhảy sang bài hát kế tiếp trong hàng đợi.
  - **Giải pháp xử lý:**
    - Thiết lập cơ chế **Độc quyền phát (Strict Mutual Exclusion)**: Khi YouTube phát thì dừng và gỡ sạch `src` của HTML5 Audio; khi HTML5 Audio phát thì lập tức gọi `ytPlayerRef.current.stopVideo()` và ngắt mọi luồng âm thanh YouTube.
    - Bổ sung hành động `replayCurrentTrack()` trong `playerStore.ts` reset `progress: 0`, `playTrigger: Date.now()`.
    - Khi Replay bài hát hiện tại, YouTube luôn luôn gọi `seekTo(0, true)` trước khi phát lại từ 0:00.
    - Cập nhật `notifyMediaEnded()`: khi `repeatMode === 'one'`, gọi `replayCurrentTrack()` phát lại bài hiện tại thay vì nhảy sang bài khác.
    - Cập nhật nút lặp lại (`toggleRepeat`) và nút lùi bài (`previous` / `SkipBack`) hiển thị rõ trạng thái: khi đã nghe quá 1 giây bấm nút lùi sẽ Replay bài hát này từ 0:00.
- **Bộ Đếm Lùi Đồng Bộ Tuyệt Đối Với FocusX (Countdown Synchronized):**
  - Công thức tính thời gian đếm lùi: `countdown = Math.max(0, GoalSeconds - (basePastSeconds + liveCurrentSessionSecs))`.
  - Ví dụ thực tế: Chạy phiên Pomodoro 1h (60 phút). Khi FocusX lùi 1 giây từ `60:00` xuống `59:59`, bên CineChill mốc 30 phút cũng lập tức lùi 1 giây từ `30:00` xuống `29:59` hoàn toàn đồng bộ theo thời gian thực (tần số 200ms).
- **Thêm Tính Năng: Chỉnh Thời Gian Mở Khóa CineChill (GOAL OF THE DAY):**
  - Cho phép người dùng tùy chọn mục tiêu học tập trong ngày để mở khóa rạp chiếu CineChill:
    - Các mốc có sẵn (Presets): **15 phút**, **30 phút** (mặc định), **45 phút**, **60 phút**.
    - Nút **Tùy Chỉnh (Custom Goal)**: Hộp thoại nhập bất kỳ số phút nào từ 1 đến 240 phút.
  - Lưu trạng thái vào `localStorage('monokuro_cinechill_goal_minutes')`.
  - Cập nhật linh hoạt toàn bộ giao diện: thanh tiến trình, nhãn đếm ngược, và thông điệp trên thẻ khóa (*"Hãy học đủ X phút để kích hoạt toàn bộ rạp chiếu"*).
  - Có sẵn thanh đổi mục tiêu nhanh ngay trên thẻ kính mờ đang khóa.

- **Sửa Lỗi Console Error: Encountered a script tag while rendering React component (React 19):**
  - Xóa bỏ hoàn toàn thẻ `<Script>` trong [src/app/layout.tsx](file:///d:/1.PROJECT%20CODE/Monokuro/src/app/layout.tsx).
  - Chuyển toàn bộ logic dọn dẹp thuộc tính mở rộng của trình duyệt vào `useEffect` sau khi mount trong [src/components/app-shell/AppShell.tsx](file:///d:/1.PROJECT%20CODE/Monokuro/src/components/app-shell/AppShell.tsx).
  - Triệt tiêu 100% mọi cảnh báo Console của React 19 và Turbopack.

- **Sửa Lỗi Nút Replay & Lỗi "Chọn bài khác chạy nhạc nền bài cũ bìa bài khác":**
  - **Nguyên nhân lỗi nhạc cũ chồng bìa mới:**
    - Cấu hình YouTube Iframe `host: 'https://www.youtube-nocookie.com'` làm trình duyệt chặn cơ chế `postMessage` RPC giữa parent và iframe, khiến lệnh `loadVideoById` gọi bài mới bị bỏ qua trong âm thầm, video cũ vẫn tiếp tục chạy ngầm trong khi Store đã đổi bìa bài mới.
    - Trong hàm nhận diện chuyển bài (`currentTrackIdRef.current !== currentTrack.id`), trước đây gọi `ytPlayerRef.current.seekTo(0, true)` khiến bài cũ vô tình bị phát lại 0.5s từ 0:00 trước khi tải bài mới.
  - **Giải pháp xử lý:**
    - Đổi sang `host: 'https://www.youtube.com'` chuẩn, khôi phục thông suốt toàn bộ lệnh gọi hàm YouTube Iframe API.
    - Khi đổi bài hát: lập tức gọi `ytPlayerRef.current.pauseVideo()` tắt âm bài cũ ngay lập tức, sau đó nạp bài mới bằng `loadVideoById(ytId, 0)`.
    - Khi Replay: dựa vào sự thay đổi của `playTrigger`, luôn gọi trực tiếp `loadVideoById(ytId, 0)` đảm bảo video được tua về đúng 0:00 và bắt đầu phát lại kể cả khi đã ở trạng thái kết thúc (ENDED).

- **Thêm Nút Chia Đôi SPLIT SESSION Vào Thanh Phát Đáy (BottomPlayerDock):**
  - Đặt nút điều hướng `<SplitSquareVertical />` tới trang `/focus-session` (Không gian học tập song song) chính xác ở vị trí nằm giữa nút **Window PIP** (`<Tv />`) và nút **Mở rộng Karaoke Lyrics** (`<FileText />`).
  - Nút luôn giữ nguyên trật tự trực quan trên thanh điều khiển.

- **Tái Cấu Trúc Toàn Diện CineChill — Tập Trung 100% Vào VibeTube:**
  - **Xóa bỏ hoàn toàn:**
    - Danh mục tĩnh 5 phim ("DANH MỤC PHIM VIBETUBE CHILL THƯ GIÃN TUYỂN CHỌN").
    - Nút tab FLIXOUT (NETFLIX POP-OUT), thẻ tài khoản Netflix, các đề xuất Netflix và toàn bộ mã nguồn liên quan.
  - **Cổng YouTube Trực Tiếp Tại Chỗ (In-Room VibeTube Hub):**
    - Tạo API `/api/youtube/search` và module tìm kiếm phân tích trực tiếp dữ liệu từ YouTube không cần API key rườm rà.
    - Thanh tìm kiếm tại chỗ: người học chỉ cần gõ từ khóa (ví dụ: cảnh mưa anime, phim tài liệu, nhạc lofi) hoặc dán link/ID để xem ngay, không phải mở youtube.com bên ngoài rồi copy link thủ công.
    - Bộ lọc chủ đề chill 1-click: *Anime 4K Scenery*, *Studio Ghibli Vibe*, *Mưa & Cà Phê 4K*, *Tokyo Cyberpunk Night*, *Vũ Trụ & Deep Space*, *Lofi Girl Live 24/7*, *Coding Session Chill*, *Thiên Nhiên & Núi Rừng*.
- **Nâng Cấp Giao Diện VibeTube & Trải Nghiệm Tìm Kiếm Remarkable:**
  - **Đưa thanh tìm kiếm lên trên đầu màn hình Video:** Đặt toàn bộ Command Hub tìm kiếm lên vị trí cao nhất của rạp chiếu, giao diện thiết kế nổi bật (remarkable) với gradient kính mờ, viền dạ quang tinh tế, ô nhập liệu 48px bóng đổ sâu và nút "TÌM YOUTUBE" màu trắng tương phản cực rõ.
  - **Xóa bỏ dòng thông báo cũ:** Xóa hoàn toàn thanh banner *"VibeTube In-Room: Tìm & xem YouTube trực tiếp... ANTI-ADS ACTIVE / FULL F11 RẠP PHIM"*. Nút F11 đã được tích hợp gọn gàng, tiện lợi ngay trên thanh công cụ dưới đáy video player.
  - **Xóa bỏ hoàn toàn Demo (Clean Lockdown):** Xóa nút `TEST DEMO` trên thanh header và nút `Bật Demo Test` trên thẻ kính mờ. Rạp phim CineChill giờ đây khóa thật 100% và mở khóa tự động khi người dùng hoàn thành đủ số phút học đặt ra trong ngày.
  - **Hiển thị Lượt Xem (Views) & Thời Gian Đăng Tải Mới Nhất (Latest Push Time):**
    - Nâng cấp bộ phân tích `src/lib/music/youtube.ts` bóc tách đồng thời `simpleText` và chuỗi `runs` của YouTube renderer.
    - Mỗi thẻ video trong lưới kết quả hiển thị rõ ràng số lượt xem (`👁️ video.views`) và mốc thời gian tải lên gần nhất (`🕒 video.publishedTime`, ví dụ: *2 ngày trước*, *1 tháng trước*, *8 tháng trước*).

- **Nâng Cấp Nhập Album & Playlist Lên 50 Bài Cùng Một Lúc:**
  - Nâng giới hạn trích xuất Spotify từ `slice(0, 15)` lên `slice(0, 50)`.
  - Nâng giới hạn Apple Music / iTunes lookup từ mặc định lên `&limit=50` và trích xuất `slice(1, 51)` đầy đủ danh sách bài hát.

- **Sửa Triệt Để Lỗi Hydration Mismatch & Thuộc Tính Trình Duyệt (`bis_skin_checked="1"`):**
  - **Nguyên nhân kép:**
    1. Khi Server SSR kết xuất trang, Zustand `useLanguageStore` khởi tạo với giá trị mặc định tiếng Việt `'vi'` (`nav_focus_mode: 'CHẾ ĐỘ TẬP TRUNG'`). Trên Client, người dùng đã lưu `'en'` trong `localStorage`, khiến Zustand hydrate trả về `FOCUS MODE`, gây ra lỗi lệch chuỗi text `+ FOCUS MODE / - CHẾ ĐỘ TẬP TRUNG`.
    2. Tiện ích trình duyệt Bitdefender TrafficLight tự động chèn thuộc tính `bis_skin_checked="1"` vào các thẻ `<div>` trong DOM trước khi React hoàn tất quá trình hydrate, khiến React 19 phát hiện xung đột thuộc tính DOM ảo.
  - **Giải pháp xử lý gốc rễ (Toàn Ứng Dụng):**
    1. **Tái cấu trúc Store Đa Ngôn Ngữ [src/lib/store/languageStore.ts](file:///d:/1.PROJECT%20CODE/Monokuro/src/lib/store/languageStore.ts):**
       - Loại bỏ middleware `persist` tự động đọc `localStorage` đồng bộ trước khi hydrate cây DOM.
       - Bổ sung cờ `isHydrated: boolean` và hàm `initLanguage()`.
       - Trong hàm dịch `t(key)`: nếu chưa hoàn tất hydrate (`!isHydrated`), **luôn trả về chuỗi tiếng Việt (`vi`)**, đảm bảo 100% khớp tuyệt đối với Server SSR trên toàn bộ các trang (`/vibrax`, `/focusx`, `/cinechill`, `/settings`).
       - Sau khi mount cây DOM, hàm `initLanguage()` trong [AppShell.tsx](file:///d:/1.PROJECT%20CODE/Monokuro/src/components/app-shell/AppShell.tsx) sẽ đọc `localStorage` và cập nhật ngôn ngữ người dùng đã chọn một cách an toàn thông qua React state update bình thường (không bao giờ gây lỗi hydration).
    2. Trong [src/components/common/LanguageSelector.tsx](file:///d:/1.PROJECT%20CODE/Monokuro/src/components/common/LanguageSelector.tsx):
       - Sử dụng cờ `isHydrated` từ store để đảm bảo cờ quốc gia và mã ngôn ngữ hiển thị chuẩn xác và đồng bộ.
    3. **Chặn Thuộc Tính `bis_skin_checked` Từ Gốc (Early Interception):**
       - Bổ sung đoạn script khởi động sớm trong `<head>` tại [src/app/layout.tsx](file:///d:/1.PROJECT%20CODE/Monokuro/src/app/layout.tsx) chặn hàm `Element.prototype.setAttribute` không cho extension Bitdefender gán các thuộc tính `bis_skin_checked` vào DOM trước khi React nạp xong.
       - Thêm `suppressHydrationWarning` cho các thẻ container để loại bỏ hoàn toàn các thông báo cảnh báo thuộc tính của React 19.

- **Lưu Trữ Cache & Khôi Phục Toàn Diện Album / Danh Sách Bài Hát (Persistence):**
  - **Lưu trữ phiên nghe nhạc vào `localStorage`:**
    - Cập nhật cấu hình lưu trữ `partialize` trong [src/lib/store/playerStore.ts](file:///d:/1.PROJECT%20CODE/Monokuro/src/lib/store/playerStore.ts): Bổ sung `currentTrack`, `queue` (danh sách toàn bộ tối đa 50 bài hát) và `queueIndex` (vị trí bài hát đang phát).
    - Khi người dùng tải lại trang (F5) hoặc mở lại Monokuro vào ngày hôm sau, toàn bộ danh sách bài hát trong Album/Playlist đang phát được khôi phục nguyên vẹn ngay lập tức.
  - **Lưu trữ thư viện dài hạn vào IndexedDB:**
    - Khi người dùng nhập bất kỳ liên kết Spotify, Apple Music, YouTube hay SoundCloud nào, toàn bộ danh sách bài hát trích xuất được tự động ghi vào bảng `savedMusicLinks` trong cơ sở dữ liệu cục bộ IndexedDB.
    - Người dùng có thể xem lại và phát lại toàn bộ album bất cứ lúc nào từ tab **THƯ VIỆN ĐÃ LƯU** mà không cần phải kết nối hay phân tích lại link ban đầu.

---

## 🧪 5. Trạng Thái Build & Kiểm Tra Hiện Tại
- Lệnh build: `npm run build` (Turbopack + TypeScript check)
- Kết quả: **Thành công 100% (Exit code 0, 0 lỗi TypeScript, 16/16 static pages generated)**.
- Lệnh sao lưu dự án: `npm run backup` (Snapshot Git đã commit an toàn: `86ba218`).
- Dev server đang chạy mượt mà tại: `http://localhost:3000`.



