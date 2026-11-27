# COMPETITOR_INTELLIGENCE

Nguồn: `docs/07-blog-120-days.md` §A và `docs/nguon/nghien-cuu/`. Chủ sở hữu: market-intelligence. Mỗi dòng mới phải có ngày + nguồn.

## Nội dung (SEO)

| Đối thủ | Mảng | Điểm mạnh | Khoảng trống Mira khai thác | Nguồn |
|---|---|---|---|---|
| The Present Writer | FIRE / tối giản | DA cao, cộng đồng trung thành | Không có công cụ tính; không nối tiền↔giờ↔người thân | docs/07 §A (2026-08) |
| Prudential, AIA, topi, cafebiz | Tự do tài chính | Volume từ khoá đầu | Nội dung mỏng, công thức lặp (tiết kiệm 50–70%, ×25) | docs/07 §A |
| Bài "7 mẹo cân bằng" (nhiều trang) | Gia đình – công việc | — | Không ai đưa con số | docs/07 §A |

## App (Google Play, đọc 2026-10-13; nguồn N-112 đến N-116 trong `docs/nguon/nghien-cuu/2026-10-13-doi-thu.md`; bảng đủ 14 app: `growth/os/research/competitors-2026-10-13.csv`)

Lượt cài là dải của Play. "Chưa đo" = trang không hiển thị. Giá gói trả phí chưa đo. Cột "Mira khác" suy từ listing, chưa dùng app.

| App | Nhóm | Cài | Rating (số ĐG) | Cập nhật | Từ khoá nhắm | Mira khác | N |
|---|---|---|---|---|---|---|---|
| Money Lover: Sổ Thu Chi | chi tiêu VN | 5M+ | 4,7 (208K) | 2026-10-09 | sổ thu chi; chi tiêu; ngân sách | quy tiền ra giờ, nối người thân | N-112 |
| Sổ Thu Chi MISA (MoneyKeeper) | chi tiêu VN | 1M+ | 4,6 (50,3K) | 2026-10-01 | sổ thu chi; chi tiêu; AI | như trên | N-112 |
| Toggl Track | time tracking | 1M+ | 4,6 (26,1K) | 2026-10-09 | time tracking; teams | giờ đáng bao nhiêu, giờ cho người thân | N-113 |
| aTimeLogger | time tracking | 1M+ | 4,7 (26,7K) | 2026-05-20 | time tracker; activities; goals | như trên | N-113 |
| ATracker | time tracking | 100K+ | 3,6 (3,18K) | 2026-01-10 | task tracker; habits | như trên | N-113 |
| WeCroak | đếm ngược đời | 50K+ | chưa đo | 2026-08-25 | mortality; death reminder | số cá nhân (giờ, tiền); không nhắc cái chết | N-114 |
| The Life Calendar Wallpaper | đếm ngược đời | 100K+ | 4,8 (3,1K) | 2026-08-02 | life calendar; weeks | gắn người thân cụ thể; mặc định tắt đồng hồ cát | N-114 |
| FireCalc: FIRE Calculator | FIRE | 100+ | chưa đo | 2026-10-07 | FIRE calculator; Monte Carlo | tiếng Việt; vốn tự do theo tháng | N-115 |
| Cozi Family Organizer | gia đình | 5M+ | 4,6 (121K) | 2026-09-26 | family organizer; shared calendar | đo giờ bên nhau thay vì xếp lịch | N-116 |

Tham chiếu ngoài VN (có trong CSV): Wallet 10M+, Monefy 10M+, Spendee 1M+, YNAB 1M+, Life Calendar: Weeks & Widget 10K+.

### Ngôn ngữ họ dùng (câu hứa trên store, 2026-10-13)

- Money Lover: "Money Lover là cuốn sổ thu chi trên điện thoại, giúp theo dõi chi tiêu hàng ngày" (Play vi).
- MISA: "Sổ thu chi tích hợp AI giúp quản lý chi tiêu cá nhân dễ dàng và hiệu quả" (Play vi).
- YNAB: "Never worry about money again". Cozi: "The surprisingly simple way to organize the family".

### Chạm ba rủi ro (`docs/00-vision.md`)

- Rủi ro 1 (đồng hồ cát gây tê liệt): WeCroak, The Life Calendar Wallpaper, Life Calendar: Weeks & Widget. Chưa đọc đánh giá nên chưa biết người dùng phản ứng ra sao. ⚑ N-114.
- Rủi ro 3 (vốn tự do làm thấy tệ): FireCalc chạm nhưng chưa rõ cách xử lý.

### Khoảng trống (quan sát, không phải đề xuất tính năng)

1. Không app nào trong 14 app nối tiền với giờ với người thân.
2. App ghi chi tiêu VN đã chiếm từ khoá "sổ thu chi"/"chi tiêu"; ngách "giờ làm / tỷ giá đời" chưa ai nhắm.
3. FIRE calculator trên Play gần trống, chưa thấy bản tiếng Việt (độ tin thấp, cần kiểm lại).

## Việc mở

- [x] market-intelligence: chạy `mira-nghien-cuu` lane doi-thu, điền bảng app với số từ Play Store (xong 2026-10-13, 14 app, N-112..N-116).
- [ ] market-intelligence: đọc đánh giá 1-3 sao của 4 app để tìm phàn nàn lặp lại; tìm thêm app Việt và app FIRE tiếng Việt; lấy giá gói trả phí.
- [ ] aso-specialist: lấy title/subtitle/screenshot 5 app gần nhất làm chuẩn so sánh (title/short desc Play đã có trong CSV, còn iOS và screenshot).
