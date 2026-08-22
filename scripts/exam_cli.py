import os
import sys
import json
import argparse
import random

# Ensure UTF-8 output in Windows PowerShell/cmd
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
QUESTION_BANK_FILE = os.path.join(DATA_DIR, "question_bank.json")
EXAMS_FILE = os.path.join(DATA_DIR, "exams_50_dataset.json")

def load_json(filepath):
    if not os.path.exists(filepath):
        print(f"Error: File not found: {filepath}")
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def list_exams(level_filter=None):
    data = load_json(EXAMS_FILE)
    if not data:
        return
    exams = data.get("exams", [])
    print("\n" + "="*70)
    print(f"📋 DANH SÁCH {len(exams)} BỘ ĐỀ THI B1 (EDUQUEST PLATFORM)")
    print("="*70)
    
    for ex in exams:
        if level_filter and str(ex.get("level_number")) != str(level_filter):
            continue
        status_icon = "🔓" if ex.get("lock_status") == "UNLOCKED" else "🔒"
        print(f"[{ex['exam_id']}] {status_icon} {ex['title']} | Cấp độ: {ex['level']} | Điểm đỗ: >={ex['passing_threshold_percent']}%")
    print("="*70 + "\n")

def view_exam_detail(exam_id):
    data = load_json(EXAMS_FILE)
    if not data:
        return
    exam = next((e for e in data.get("exams", []) if e["exam_id"].upper() == exam_id.upper()), None)
    if not exam:
        print(f"❌ Không tìm thấy đề thi với mã: {exam_id}")
        return
    
    print("\n" + "#"*70)
    print(f"CHI TIẾT ĐỀ THI: {exam['title']} ({exam['exam_id']})")
    print(f"Cấp độ: {exam['level']} | Thời gian: {exam['duration_minutes']} phút | Ngưỡng đỗ: {exam['passing_threshold_percent']}%")
    print("#"*70)

    # Listening
    lis = exam["skills"]["listening"]
    print("\n🎧 [1] PHẦN THI NGHE (LISTENING - 25%):")
    for p in lis["parts"]:
        print(f"  • {p['title']} (File Audio: {p['audio_file']})")
        for q in p["questions"]:
            print(f"    - Câu hỏi: {q.get('question')}")
            print(f"      Đáp án đúng: {q.get('correct_answer')} | Giải thích: {q.get('explanation')}")

    # Reading
    rea = exam["skills"]["reading"]
    print("\n📖 [2] PHẦN THI ĐỌC (READING - 25%):")
    for p in rea["parts"]:
        print(f"  • {p['title']}")
        for q in p["questions"]:
            print(f"    - Câu hỏi: {q.get('question')}")
            print(f"      Đáp án đúng: {q.get('correct_answer')} | Giải thích: {q.get('explanation')}")

    # Writing
    wri = exam["skills"]["writing"]
    print("\n✍️ [3] PHẦN THI VIẾT (WRITING - 25%):")
    p1 = wri["parts"][0]
    print(f"  • {p1['title']}")
    for q in p1["questions"]:
        print(f"    - Câu gốc: {q.get('original')} (Từ gợi ý: {q.get('target_word')})")
        print(f"      Đáp án chuẩn: {q.get('correct_answer')}")

    # Speaking
    spk = exam["skills"]["speaking"]
    print(f"\n🗣️ [4] PHẦN THI NÓI (SPEAKING - 25%) - Chủ đề: {spk.get('topic_theme')}:")
    for p in spk["parts"]:
        print(f"  • {p['title']}")
    print("#"*70 + "\n")

def add_more_exams(count=5):
    """Sinh thêm N bộ đề mới và nối vào danh sách hiện có"""
    data = load_json(EXAMS_FILE)
    qbank = load_json(QUESTION_BANK_FILE)
    if not data or not qbank:
        return
    
    current_exams = data.get("exams", [])
    current_count = len(current_exams)
    
    print(f"\n⚡ Đang tự động sinh thêm {count} bộ đề mới...")
    
    for i in range(current_count + 1, current_count + count + 1):
        test_id = f"B1-SET-{i:02d}"
        level_name = "Level 3 - Advanced Mastery" if i > 35 else ("Level 2 - Intermediate" if i > 15 else "Level 1 - Foundation")
        level_num = 3 if i > 35 else (2 if i > 15 else 1)
        audio_idx = ((i - 1) % 10) + 1

        new_exam = {
            "exam_id": test_id,
            "set_number": i,
            "title": f"B1 Custom Mastery Set - Đề Số {i:02d}",
            "level": level_name,
            "level_number": level_num,
            "passing_threshold_percent": 50,
            "lock_status": "LOCKED",
            "duration_minutes": 90,
            "skills": {
                "listening": {
                    "skill": "LISTENING",
                    "weight_percentage": 25,
                    "parts": [
                        {
                            "part_number": 1,
                            "title": "Part 1 - Short Conversations",
                            "audio_file": f"public/audios/02-TEST {audio_idx} _ Part 1.mp3",
                            "questions": [random.choice(qbank["listening"]["part_1"])]
                        },
                        {
                            "part_number": 2,
                            "title": "Part 2 - Monologue",
                            "audio_file": f"public/audios/03-TEST {audio_idx} _ Part 2.mp3",
                            "questions": [random.choice(qbank["listening"]["part_2"])]
                        }
                    ]
                },
                "reading": {
                    "skill": "READING",
                    "weight_percentage": 25,
                    "parts": [
                        {
                            "part_number": 1,
                            "title": "Part 1 - Signs & Notices",
                            "questions": [random.choice(qbank["reading"]["part_1"])]
                        },
                        {
                            "part_number": 5,
                            "title": "Part 5 - Cloze Test",
                            "questions": [random.choice(qbank["reading"]["part_5"])]
                        }
                    ]
                },
                "writing": {
                    "skill": "WRITING",
                    "weight_percentage": 25,
                    "parts": [
                        {
                            "part_number": 1,
                            "title": "Part 1 - Sentence Transformations",
                            "questions": random.sample(qbank["writing"]["part_1_transformations"], 2)
                        }
                    ]
                },
                "speaking": {
                    "skill": "SPEAKING",
                    "weight_percentage": 25,
                    "topic_theme": random.choice(qbank["speaking"]["topics"])["topic"],
                    "parts": [
                        {
                            "part_number": 1,
                            "title": "Part 1 - General Questions",
                            "prompts": ["What is your favorite hobby?", "Why do you learn English?"]
                        }
                    ]
                }
            }
        }
        current_exams.append(new_exam)

    data["exams"] = current_exams
    data["metadata"]["total_exams"] = len(current_exams)
    save_json(EXAMS_FILE, data)
    print(f"✅ Đã tạo thành công {count} bộ đề mới! Tổng số đề hiện tại: {len(current_exams)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="EduQuest B1 Exam Manager & Generator CLI")
    parser.add_argument("--list", action="store_true", help="Liệt kê danh sách đề thi")
    parser.add_argument("--level", type=int, help="Lọc theo level (1, 2, hoặc 3)")
    parser.add_argument("--view", type=str, help="Xem chi tiết bộ đề theo mã (Ví dụ: B1-SET-01)")
    parser.add_argument("--generate", type=int, help="Tự động sinh thêm N bộ đề mới")

    args = parser.parse_args()

    if args.list:
        list_exams(args.level)
    elif args.view:
        view_exam_detail(args.view)
    elif args.generate:
        add_more_exams(args.generate)
    else:
        print("\n💡 HƯỚNG DẪN SỬ DỤNG EXAM MANAGER CLI:")
        print("  python scripts/exam_cli.py --list                 # Liệt kê tất cả 50 đề")
        print("  python scripts/exam_cli.py --list --level 1       # Liệt kê các đề Level 1 (Foundation)")
        print("  python scripts/exam_cli.py --view B1-SET-01       # Xem chi tiết cấu trúc Đề số 1")
        print("  python scripts/exam_cli.py --generate 10          # Tự động tạo thêm 10 bộ đề mới\n")
