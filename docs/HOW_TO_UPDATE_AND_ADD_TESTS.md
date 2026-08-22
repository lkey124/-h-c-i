# 📖 HƯỚNG DẪN QUẢN LÝ, CẬP NHẬT VÀ THÊM MỚI BỘ ĐỀ THI (EDUQUEST B1)

Tài liệu này hướng dẫn chi tiết cách quản trị, thêm mới câu hỏi, cập nhật file audio và tự động sinh thêm đề thi mới cho nền tảng học tiếng Anh B1.

---

## 📂 1. CẤU TRÚC DỮ LIỆU ĐÃ TẠO

Hệ thống đã tạo sẵn và phân tầng hoàn chỉnh **50 Bộ Đề Thi B1**:
* **📁 `data/question_bank.json`**: Ngân hàng câu hỏi gốc (Listening, Reading, Writing, Speaking) trích xuất từ 41 files Audio và các sách PDF B1.
* **📁 `data/exams_50_dataset.json`**: Bộ 50 đề thi độc lập, phân chia thành 3 cấp độ:
  - 🟢 **Level 1 - Foundation (Đề 01 ➔ 15)**: Kiến thức nền tảng, tốc độ cơ bản.
  - 🟡 **Level 2 - Intermediate (Đề 16 ➔ 35)**: Độ khó tiêu chuẩn B1, có bẫy nghe & ngữ pháp nâng cao.
  - 🔴 **Level 3 - Advanced Mastery (Đề 36 ➔ 50)**: Mô phỏng 100% đề thi thực tế.

---

## 🛠️ 2. SỬ DỤNG CÔNG CỤ QUẢN LÝ ĐỀ THI (EXAM CLI TOOL)

Bạn có thể quản lý, kiểm tra và sinh thêm đề bất cứ lúc nào qua dòng lệnh `exam_cli.py`:

### 1. Xem danh sách 50 đề thi:
```bash
python scripts/exam_cli.py --list
```

### 2. Lọc danh sách đề theo từng Cấp độ (Level 1, 2, hoặc 3):
```bash
# Xem các đề Level 1 (Foundation):
python scripts/exam_cli.py --list --level 1

# Xem các đề Level 2 (Intermediate):
python scripts/exam_cli.py --list --level 2

# Xem các đề Level 3 (Advanced):
python scripts/exam_cli.py --list --level 3
```

### 3. Xem chi tiết nội dung 1 bộ đề bất kỳ:
```bash
python scripts/exam_cli.py --view B1-SET-01
python scripts/exam_cli.py --view B1-SET-25
```

### 4. Tự động sinh thêm N bộ đề mới (Ví dụ: sinh thêm 10 đề để có 60 đề):
```bash
python scripts/exam_cli.py --generate 10
```

---

## ➕ 3. CÁCH THÊM CÂU HỎI MỚI VÀO NGÂN HÀNG DỮ LIỆU

Để bổ sung câu hỏi mới, bạn chỉ cần mở file `data/question_bank.json` và thêm vào danh mục tương ứng:

### 🎧 Thêm câu hỏi Listening (Kèm Audio MP3):
```json
{
  "id": "LIS-P1-008",
  "audio_track": "public/audios/02-TEST 1 _ Part 1.mp3",
  "difficulty": "medium",
  "question": "Where is the woman going next?",
  "options": ["A. Post office", "B. Supermarket", "C. Train station"],
  "correct_answer": "A",
  "explanation": "She mentions needing to mail a parcel before meeting her friend.",
  "tapescript": "I need to drop by the post office to send this package first."
}
```

### ✍️ Thêm câu hỏi Biến đổi câu Writing Part 1:
```json
{
  "id": "WRI-P1-007",
  "difficulty": "medium",
  "original": "She started learning piano five years ago.",
  "target_word": "BEEN",
  "prompt": "She has ____________________ for five years.",
  "correct_answer": "been learning piano",
  "grammar_pattern": "Past Simple with 'started' -> Present Perfect Continuous",
  "explanation": "S + started + V-ing + [time] ago = S + has/have + been + V-ing + for [time]."
}
```

---

## 🛡️ 4. CƠ CHẾ KHÓA ĐỀ & ĐIỀU KIỆN VƯỢT ẢI 50%

* **Mặc định**: Chỉ có **Đề số 1 (`B1-SET-01`)** ở trạng thái mở (`UNLOCKED`), các đề từ 02 đến 50 ở trạng thái khóa (`LOCKED`).
* **Logic Mở Khóa**:
  ```typescript
  // Quy tắc kiểm tra mở khóa đề thi kế tiếp
  function checkUnlockNextExam(currentExamScorePercent: number, nextExamId: string) {
    if (currentExamScorePercent >= 50.0) {
      unlockExam(nextExamId);
      return { success: true, message: "Chúc mừng bạn đã vượt qua mốc 50%! Đề tiếp theo đã được mở khóa." };
    } else {
      return { 
        success: false, 
        message: `Bạn đạt ${currentExamScorePercent}%. Cần đạt tối thiểu 50% để mở khóa đề tiếp theo. Vui lòng ôn lại lỗi sai và thi lại!` 
      };
    }
  }
  ```

---

## 🔄 5. ĐỒNG BỘ DỮ LIỆU VÀO DATABASE (PRISMA / POSTGRESQL)

Khi kết nối với Cơ sở dữ liệu Web App, bạn chỉ cần chạy lệnh nạp dữ liệu:
```bash
# Nạp toàn bộ 50 đề vào database
python scripts/generate_exams.py
npx prisma db seed
```
Mọi thông tin người dùng, lịch sử thi và trạng thái mở khóa của từng tài khoản sẽ được bảo toàn nguyên vẹn trên Database Cloud.
