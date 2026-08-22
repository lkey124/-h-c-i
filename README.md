# 🎓 B1 ENGLISH MASTER PLATFORM (EduQuest B1)
> **Hệ Thống Luyện Thi & Khảo Sát Năng Lực Tiếng Anh B1 Thông Minh Theo Chuẩn Khung Châu Âu / VSTEP**

---

## 🌟 1. TỔNG QUAN DỰ ÁN & Ý TƯỞNG CỐT LÕI (PROJECT OVERVIEW)

Dự án **B1 English Master Platform** là một nền tảng Web học và luyện thi Tiếng Anh trình độ B1 toàn diện, được phát triển và tối ưu hóa dựa trên nguồn học liệu chuẩn hóa từ thư mục tài nguyên gốc:
* **41 Audio Tracks** (`01-AudioTrack 01.mp3` đến `41-TEST 10 - Part 4.mp3`): Trọn bộ 10 bài Test Nghe chuẩn (Mỗi Test gồm 4 Parts).
* **Sach B1.pdf**: Giáo trình & Ngân hàng đề thi đầy đủ 4 kỹ năng (Nghe, Đọc, Viết, Nói).
* **T4_B1_Writing Part 1_30 sentences.pdf**: Ngân hàng 30 cấu trúc chuyển đổi câu chuẩn B1 Writing Part 1.
* **T4_B1_Speaking topics.pdf**: Trọn bộ chủ đề và câu hỏi phỏng vấn chuẩn B1 Speaking.

```
       ┌────────────────────────────────────────────────────────┐
       │             NGUỒN DỮ LIỆU GỐC (DATA ASSETS)            │
       │   41 Audio Tracks + Sach B1.pdf + Writing + Speaking   │
       └───────────────────────────┬────────────────────────────┘
                                   │ (Data Extraction & ETL)
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             NGÂN HÀNG CÂU HỎI (QUESTION BANK)          │
       │   Phân loại theo Kỹ năng, Part, Độ khó, Dạng bài       │
       └───────────────────────────┬────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
       ┌─────────────────────────┐   ┌──────────────────────────┐
       │  DYNAMIC TEST GENERATOR │   │  50% PROGRESSION ENGINE  │
       │   Trộn đề ngẫu nhiên    │   │  Cơ chế vượt ải mở khóa  │
       │   Đúng format chuẩn     │   │  Bắt buộc đạt >= 50%     │
       └────────────┬────────────┘   └─────────────┬────────────┘
                    │                              │
                    └──────────────┬───────────────┘
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │     GIAO DIỆN HỌC TẬP THẨM MỸ & REVIEW CHI TIẾT        │
       │  Chấm điểm từng kỹ năng • Phân tích lỗi • Audio Sync   │
       └────────────────────────────────────────────────────────┘
```

---

## 🎯 2. CÁC TÍNH NĂNG ĐỘT PHÁ (KEY FEATURES)

### 🎲 2.1. Bộ Sinh Đề Ngẫu Nhiên Thông Minh (Dynamic Exam Generator)
- **Chuẩn hóa Format B1**: Mỗi đề thi tạo ra tuân thủ cấu trúc ma trận đề thi chính thức:
  - **Listening (4 Parts)**:
    - *Part 1*: 7 câu hỏi tranh/tình huống ngắn (Chọn đáp án A/B/C) kèm audio từng câu.
    - *Part 2*: 6 câu hỏi hội thoại dài/bài thông báo (Chọn đáp án A/B/C).
    - *Part 3*: 6 chỗ trống điền thông tin/ghi chú ngắn nghe được.
    - *Part 4*: 6 câu hỏi phỏng vấn/đối thoại (Đúng/Sai hoặc A/B/C).
  - **Reading (5 Parts)**: Biển báo/tin nhắn ngắn, Ghép nối thông tin (Matching), Đọc hiểu đoạn văn dài, Điền từ vào đoạn văn (Cloze test).
  - **Writing (3 Parts)**: Viết lại câu (Sentence Transformation dựa trên bộ 30 câu mẫu), Viết tin nhắn/email ngắn, Viết bài luận/câu chuyện.
  - **Speaking (3 Parts)**: Phỏng vấn cá nhân, Thảo luận tình huống thực tế, Miêu tả tranh & mở rộng chủ đề.
- **Trộn đề ngẫu nhiên đa dạng**: Hệ thống bốc ngẫu nhiên các Parts từ 10 Tests và ngân hàng câu hỏi để tạo ra hàng trăm bộ đề tổ hợp khác nhau, không gây cảm giác học thuộc lòng.

---

### 🛡️ 2.2. Cơ Chế Khóa Đề & Vượt Ải (50% Threshold Progression Gate)
- **Quy tắc Vượt ải nghiêm ngặt**:
  - Khi bắt đầu, học viên chỉ được làm **Bộ đề 1 (Level 1)**.
  - Sau khi nộp bài, hệ thống chấm điểm tự động. Nếu điểm số **< 50%**, bộ đề tiếp theo **vẫn ở trạng thái KHÓA (LOCKED)**.
  - Học viên bắt buộc phải ôn tập lại lỗi sai và làm lại bài kiểm tra (hoặc làm bài thi khắc phục tương đương) đạt **>= 50%** mới kích hoạt mở khóa **Bộ đề 2 (Level 2)** và các bộ đề tiếp theo.
- **Gamification (Hệ thống Khích lệ Học tập)**:
  - Hiển thị bản đồ lộ trình học (Learning Roadmap Tree) trực quan dạng chặng đua (Level 1 ➔ Level 10 ➔ Master Exam).
  - Huy hiệu (Badges), Điểm kinh nghiệm (EXP), Chuỗi ngày học liên tục (Streaks).

---

### 🔍 2.3. Chấm Điểm Đa Chiều & Phân Tích Lỗi Sai Sâu (Error Analytics)
- **Bảng điểm kỹ năng độc lập**:
  - Thống kê chi tiết điểm số của từng kỹ năng: `Listening Score`, `Reading Score`, `Writing Score`, `Speaking Score`.
  - Biểu đồ mạng nhện (Radar Chart) đánh giá điểm mạnh / điểm yếu.
- **Chi tiết từng lỗi sai**:
  - Đối chiếu đáp án học viên chọn với Đáp án đúng.
  - **Giải thích ngữ pháp & Từ vựng then chốt** cho từng câu.
  - **Tapescript Audio tích hợp**: Nhấp vào câu sai sẽ tự động highlight đoạn hội thoại chứa câu trả lời trong tapescript và phát đúng mốc giây (timestamp) trong audio.

---

### 📜 2.4. Trình Xem Lại Bài Thi (Interactive History & Review Mode)
- Lưu trữ toàn bộ lịch sử các lần thi theo từng tài khoản.
- Chế độ xem lại (Review Mode):
  - Xem lại chính xác trạng thái bài làm trong quá khứ.
  - Lọc nhanh các câu sai để ôn luyện lại (Focus on Mistakes).
  - Ghi chú cá nhân (Personal Notes) trực tiếp trên từng câu hỏi.

---

### 👤 2.5. Hệ Thống Tài Khoản & Bảo Toàn Dữ Liệu Bền Vững (Data Persistence)
- **Bảo mật & Xác thực**: Đăng nhập qua Email/Mật khẩu hoặc Google One-Tap Login (OAuth 2.0).
- **Cơ chế Đồng bộ Không Mất Mát Dữ Liệu**:
  - Áp dụng cấu trúc Database quan hệ (PostgreSQL / Supabase) với Schema Versioning & Database Migration (Prisma ORM).
  - Dữ liệu người dùng, tiến độ vượt ải, bài đã làm được lưu trữ vĩnh viễn trên Cloud.
  - Cơ chế **Auto-save**: Tự động lưu tiến độ làm bài dở dang theo từng câu (phòng ngừa mất kết nối mạng hoặc tắt trình duyệt đột ngột).

---

### 📊 2.6. Trang Quản Trị Viên Toàn Diện (Admin Dashboard & CMS)
- **Quản lý Học viên**: Danh sách người dùng, tiến độ vượt ải, thời gian học, tỷ lệ đạt.
- **Quản lý Đề & Ngân hàng câu hỏi (CMS)**:
  - Thêm / Sửa / Xóa câu hỏi, đáp án, lời giải thích.
  - Tải lên (Upload) file Audio MP3, cấu hình mốc thời gian (Timestamps) cho từng Part.
  - Cấu hình ngưỡng điểm vượt ải linh hoạt (mặc định 50%, có thể điều chỉnh 60%, 70% tùy mục tiêu khóa học).

---

## 🎨 3. THIẾT KẾ GIAO DIỆN (UI/UX DESIGN GUIDELINES)

* **Phong cách Thiết kế**: Hiện đại, thẩm mỹ cao (Sleek Clean / Modern EdTech Style), tối giản hóa thao tác, tạo cảm giác nhẹ nhàng không áp lực khi thi.
* **Tone màu chủ đạo**:
  - **Primary**: Deep Indigo (`#4F46E5`) & Electric Cyan (`#06B6D4`) - Thể hiện sự chuyên nghiệp, tập trung.
  - **Success / Passed**: Emerald Green (`#10B981`) - Thông báo vượt ải thành công.
  - **Alert / Locked**: Amber Orange (`#F59E0B`) & Rose Red (`#F43F5E`) - Thông báo chưa đạt 50% hoặc mục bị khóa.
  - **Background**: Slate Neutral (`#0F172A` Dark Mode / `#F8FAFC` Light Mode).
* **Trình phát Audio Chuyên Dụng (Audio Player Widget)**:
  - Giao diện sóng âm (Waveform), nút tua nhanh 5s/10s, chỉnh tốc độ phát (0.8x, 1.0x, 1.2x), nút phát lại theo Part/Câu.
* **Thiết kế Đáp ứng Toàn diện (Fully Responsive)**: Tối ưu hoàn hảo trên Desktop, Laptop, Máy tính bảng (iPad/Tablet) và Điện thoại di động (Mobile).

---

## 🛠️ 4. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (TECH STACK)

| Thành phần | Công nghệ Đề xuất | Lý do lựa chọn |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (App Router) + React + TypeScript** | Tối ưu SEO, hiệu năng cao, Server-Side Rendering & Client-Side linh hoạt |
| **Styling & UI** | **Tailwind CSS + Shadcn/UI + Framer Motion** | Giao diện hiện đại, tinh chỉnh nhanh, hiệu ứng mượt mà, chuẩn UI/UX cao cấp |
| **Audio Engine** | **Wavesurfer.js / Howler.js** | Xử lý âm thanh đa luồng, hỗ trợ waveform trực quan và quản lý mốc thời gian chính xác |
| **Backend** | **Next.js Server Actions / API Routes / Node.js** | Tối ưu hóa xử lý API, bảo mật cao, kết nối trực tiếp cơ sở dữ liệu |
| **Database** | **PostgreSQL (qua Supabase hoặc Neon DB)** | Chuẩn hóa dữ liệu quan hệ, ACID compliance, lưu trữ an toàn không sợ mất mát |
| **ORM** | **Prisma ORM** | Type-safe queries, dễ dàng thực hiện Database Migrations khi cập nhật tính năng mới |
| **Authentication** | **NextAuth.js (Auth.js) / Supabase Auth** | Hỗ trợ JWT, OAuth 2.0 (Google, GitHub), bảo mật Session và Cookie an toàn |
| **Cloud Storage** | **Cloudinary / Supabase Storage / AWS S3** | Lưu trữ tối ưu 41 file MP3 và tài liệu PDF với tốc độ streaming cực nhanh |

---

## 🗄️ 5. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

```mermaid
erDiagram
    USERS ||--o{ TEST_ATTEMPTS : "thực hiện"
    USERS ||--o{ USER_PROGRESSION : "sở hữu"
    TESTS ||--o{ TEST_PARTS : "chứa"
    TEST_PARTS ||--o{ QUESTIONS : "gồm"
    QUESTIONS ||--o{ QUESTION_OPTIONS : "có"
    TEST_ATTEMPTS ||--o{ USER_ANSWERS : "lưu chi tiết"
    TEST_ATTEMPTS ||--o{ SKILL_SCORES : "kết quả"

    USERS {
        uuid id PK
        string email UK
        string full_name
        string role "STUDENT | ADMIN"
        datetime created_at
        datetime updated_at
    }

    USER_PROGRESSION {
        uuid id PK
        uuid user_id FK
        int current_unlocked_level
        int total_exp
        int current_streak
        datetime last_active_at
    }

    TESTS {
        uuid id PK
        string title "Ví dụ: B1 Standard Test 01"
        int test_level "Level 1 -> Level 10"
        int passing_score_percentage "Mặc định 50%"
        boolean is_active
    }

    TEST_PARTS {
        uuid id PK
        uuid test_id FK
        string skill_type "LISTENING | READING | WRITING | SPEAKING"
        int part_number "1 -> 4"
        string audio_url "Đường dẫn file MP3"
        text instructions
        text context_text "Đoạn văn đọc hiểu hoặc kịch bản"
    }

    QUESTIONS {
        uuid id PK
        uuid part_id FK
        int question_number
        text question_text
        text audio_timestamp "Mốc giây trong audio"
        text explanation "Giải thích chi tiết vì sao đúng/sai"
        int score_weight
    }

    QUESTION_OPTIONS {
        uuid id PK
        uuid question_id FK
        string option_key "A, B, C, D"
        text option_text
        boolean is_correct
    }

    TEST_ATTEMPTS {
        uuid id PK
        uuid user_id FK
        uuid test_id FK
        float total_score
        float max_score
        float percentage_score
        boolean is_passed ">= 50%"
        int time_spent_seconds
        datetime completed_at
    }

    SKILL_SCORES {
        uuid id PK
        uuid attempt_id FK
        string skill_type
        float score
        float max_score
        float percentage
    }

    USER_ANSWERS {
        uuid id PK
        uuid attempt_id FK
        uuid question_id FK
        string selected_option_key
        text text_answer "Dành cho bài viết/điền từ"
        boolean is_correct
        float earned_score
    }
```

---

## 📁 6. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

```
english-b1-mastery/
├── .env.example                     # File mẫu biến môi trường (Database, Auth, S3)
├── package.json                     # Thông tin package & dependencies
├── tsconfig.json                    # Cấu hình TypeScript
├── prisma/
│   └── schema.prisma                # Schema cơ sở dữ liệu quan hệ & migrations
├── public/
│   ├── audios/                      # Thư mục chứa 41 file audio MP3 phân loại theo Test
│   │   ├── test-01/
│   │   │   ├── 02-TEST 1 _ Part 1.mp3
│   │   │   └── ...
│   │   └── test-10/
│   ├── documents/                   # Tài liệu PDF (Sach B1, Writing, Speaking)
│   └── images/                      # Assets hình ảnh, minh họa biển báo, bài thi
├── src/
│   ├── app/                         # Next.js 14 App Router
│   │   ├── (auth)/                  # Nhóm route xác thực (Login, Register, Forgot Password)
│   │   ├── (dashboard)/             # Giao diện chính của học viên
│   │   │   ├── roadmap/             # Bản đồ vượt ải các bộ đề
│   │   │   ├── test/[testId]/       # Giao diện phòng thi trực tuyến
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/      # AudioPlayer, QuestionView, CountdownTimer
│   │   │   ├── history/             # Danh sách các bài đã làm
│   │   │   ├── review/[attemptId]/  # Giao diện xem lại lỗi sai & phân tích
│   │   │   └── profile/             # Thông tin cá nhân & Thống kê kỹ năng
│   │   ├── admin/                   # Bảng điều khiển Quản trị viên
│   │   │   ├── questions/           # CMS quản lý câu hỏi
│   │   │   ├── users/               # Quản lý tài khoản học viên
│   │   │   └── analytics/           # Thống kê kết quả & tỷ lệ đạt
│   │   └── api/                     # API Endpoints (Submit Test, Randomize, Progress)
│   ├── components/                  # UI Components tái sử dụng (Button, Modal, Card, AudioWave)
│   ├── lib/                         # Cấu hình Prisma, NextAuth, Helper tính điểm
│   ├── services/                    # Business Logic (Exam Generator, Grading Engine, Lock Rules)
│   └── types/                       # Khai báo kiểu dữ liệu TypeScript
└── README.md                        # Tài liệu hướng dẫn dự án (File này)
```

---

## 🚀 7. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (QUICK START)

### ⚙️ Yêu cầu Hệ thống
- **Node.js**: Phiên bản 18.x hoặc 20.x trở lên
- **PostgreSQL**: Phiên bản 14 trở lên (hoặc kết nối Supabase / Neon Cloud)
- **Trình duyệt**: Google Chrome / Microsoft Edge / Safari phiên bản mới nhất

### 📦 Các bước cài đặt:

1. **Clone mã nguồn hoặc mở thư mục dự án**:
   ```bash
   cd english-b1-mastery
   ```

2. **Cài đặt các gói phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

3. **Cấu hình Biến môi trường (`.env`)**:
   Tạo file `.env` từ `.env.example` và điền các thông tin:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/b1_mastery?schema=public"
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Khởi tạo Cơ sở dữ liệu & Đồng bộ Schema**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed # Chạy script import ngân hàng đề từ PDF & Audio
   ```

5. **Khởi chạy ứng dụng ở chế độ Phát triển (Development Mode)**:
   ```bash
   npm run dev
   ```
   Truy cập trình duyệt tại: `http://localhost:3000`

---

## 🗺️ 8. LỘ TRÌNH PHÁT TRIỂN (ROADMAP)

- [x] **Giai đoạn 1**: Trích xuất dữ liệu từ 41 files Audio và 3 file tài liệu PDF B1 sang định dạng JSON/Database.
- [x] **Giai đoạn 2**: Thiết kế Database Schema, cơ chế Auth và luồng Khóa đề / Vượt ải 50%.
- [ ] **Giai đoạn 3**: Xây dựng Giao diện Phòng thi (Exam Room) với Audio Player đồng bộ Tapescript.
- [ ] **Giai đoạn 4**: Xây dựng Chế độ Review Mode (Xem lại lỗi sai, giải thích ngữ pháp).
- [ ] **Giai đoạn 5**: Hoàn thiện Admin CMS quản lý câu hỏi & đề thi.
- [ ] **Giai đoạn 6 (Mở rộng AI)**: Tích hợp AI (Gemini Flash) chấm điểm tự động cho phần Writing (Part 2, 3) và Speaking (Speech-to-Text).

---

## 📄 9. BẢN QUYỀN & ĐÓNG GÓP (LICENSE)
Dự án được xây dựng phục vụ mục đích học tập và ôn luyện chứng chỉ tiếng Anh B1. Mọi đóng góp xin vui lòng tạo Pull Request hoặc liên hệ ban quản trị.
