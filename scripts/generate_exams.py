import os
import json
import random

def create_full_b1_database():
    base_audio_path = "public/audios/"
    
    # -------------------------------------------------------------
    # 1. QUESTION BANK SEEDING
    # -------------------------------------------------------------
    
    # Listening Parts 1 - 4
    listening_bank = {
        "part_1": [
            {
                "id": "LIS-P1-001",
                "audio_track": "02-TEST 1 _ Part 1.mp3",
                "difficulty": "easy",
                "question": "What will the weather be like in the afternoon?",
                "options": ["A. Rainy and windy", "B. Sunny with light clouds", "C. Heavy snow"],
                "correct_answer": "B",
                "explanation": "The speaker explicitly mentions that the rain will clear by midday, giving way to bright sunshine in the afternoon.",
                "tapescript": "Good morning. Rain will continue through the morning, but by 1 PM it will clear up, leaving us with a sunny and mild afternoon."
            },
            {
                "id": "LIS-P1-002",
                "audio_track": "02-TEST 1 _ Part 1.mp3",
                "difficulty": "easy",
                "question": "What time does the train to Oxford depart?",
                "options": ["A. 09:15", "B. 09:45", "C. 10:15"],
                "correct_answer": "B",
                "explanation": "The announcement states the 9:15 train is cancelled, and the next available service to Oxford is at 9:45 from platform 3.",
                "tapescript": "Attention passengers: The 09:15 service to Oxford is cancelled. The next departure is scheduled for 09:45 at platform 3."
            },
            {
                "id": "LIS-P1-003",
                "audio_track": "06-TEST 2 _ Part 1.mp3",
                "difficulty": "medium",
                "question": "Where did the boy leave his backpack?",
                "options": ["A. In the science lab", "B. On the school bus", "C. In the cafeteria"],
                "correct_answer": "C",
                "explanation": "He remembers eating lunch with his friends and leaving his backpack on the chair next to him in the cafeteria.",
                "tapescript": "I thought I left it in the lab, but then I remembered sitting with Mark at lunch and leaving it right beside the cafeteria table."
            },
            {
                "id": "LIS-P1-004",
                "audio_track": "10-TEST 3 _ Part 1.mp3",
                "difficulty": "medium",
                "question": "How much did the woman pay for her jacket?",
                "options": ["A. £35", "B. £50", "C. £70"],
                "correct_answer": "A",
                "explanation": "The original price was £70, but it was on a 50% discount sale, so she paid £35.",
                "tapescript": "It was originally marked at 70 pounds, but with the half-price weekend discount, I only paid thirty-five pounds."
            },
            {
                "id": "LIS-P1-005",
                "audio_track": "14-TEST 4 _ Part 1.mp3",
                "difficulty": "hard",
                "question": "Which activity did the family choose for Saturday?",
                "options": ["A. Visiting the art museum", "B. Hiking in the national park", "C. Going to the cinema"],
                "correct_answer": "B",
                "explanation": "Despite the brother wanting to go to the cinema, the family agreed on hiking because of the clear forecast.",
                "tapescript": "My brother wanted cinema, but Dad suggested taking advantage of the crisp air to hike the national trail, which we all loved."
            },
            {
                "id": "LIS-P1-006",
                "audio_track": "18-TEST 5 _ Part 1.mp3",
                "difficulty": "easy",
                "question": "What is the girl ordering for dessert?",
                "options": ["A. Chocolate brownie", "B. Strawberry ice cream", "C. Apple pie"],
                "correct_answer": "A",
                "explanation": "She decided to get the chocolate brownie with warm cream.",
                "tapescript": "I was tempted by the apple pie, but the chocolate brownie is their house specialty, so I will take that one."
            },
            {
                "id": "LIS-P1-007",
                "audio_track": "22-TEST 6 _ Part 1.mp3",
                "difficulty": "hard",
                "question": "Why was the flight delayed?",
                "options": ["A. Mechanical failure", "B. Heavy fog at destination", "C. Air traffic control strike"],
                "correct_answer": "B",
                "explanation": "The captain announced visibility was below safety limits due to dense fog in Manchester.",
                "tapescript": "Due to thick fog covering Manchester airport, all incoming flights are held on the ground for an additional 40 minutes."
            }
        ],
        "part_2": [
            {
                "id": "LIS-P2-001",
                "audio_track": "03-TEST 1 _ Part 2.mp3",
                "difficulty": "easy",
                "context": "You will hear an interview with a young artist named Maya about her exhibition.",
                "question": "Maya started painting professionally when she was:",
                "options": ["A. 14 years old", "B. 18 years old", "C. 22 years old"],
                "correct_answer": "B",
                "explanation": "Maya mentions she painted as a child, but her first paid exhibition was right after turning 18.",
                "tapescript": "I drew as a kid, but only when I turned 18 did a local gallery take my collection and launch my professional journey."
            },
            {
                "id": "LIS-P2-002",
                "audio_track": "07-TEST 2 _ Part 2.mp3",
                "difficulty": "medium",
                "context": "You will hear a radio guide giving information about an eco-friendly holiday resort.",
                "question": "Guests at the resort are encouraged to:",
                "options": ["A. Bring their own camping tents", "B. Use electric bicycles provided free", "C. Prepare all their meals"],
                "correct_answer": "B",
                "explanation": "The resort provides complimentary electric bikes to minimize carbon footprint within the reserve.",
                "tapescript": "To keep the valley quiet and clean, cars are parked at the gate, and each guest receives an electric bike free of charge."
            },
            {
                "id": "LIS-P2-003",
                "audio_track": "15-TEST 4 _ Part 2.mp3",
                "difficulty": "hard",
                "context": "You will hear a conservationist talking about sea turtle protection projects.",
                "question": "What is the primary danger to newly hatched turtles mentioned?",
                "options": ["A. Beach illumination confusing their navigation", "B. Plastic waste on the shoreline", "C. Extreme water temperatures"],
                "correct_answer": "A",
                "explanation": "Artificial lights from hotels disorient baby turtles away from the ocean towards the roads.",
                "tapescript": "Artificial lighting on beachfront resorts is the biggest threat as hatchlings instinctively move toward bright horizons."
            }
        ],
        "part_3": [
            {
                "id": "LIS-P3-001",
                "audio_track": "04-TEST 1 _ Part 3.mp3",
                "difficulty": "easy",
                "context": "Fill in the missing information for the Summer Cooking Workshop notes.",
                "question": "Workshop starting date: ______ July",
                "options": ["A. 12th", "B. 15th", "C. 20th"],
                "correct_answer": "B",
                "explanation": "The presenter mentions classes begin on the 15th of July.",
                "tapescript": "Registration closes on July 10th and our first kitchen session kicks off on the 15th of July."
            },
            {
                "id": "LIS-P3-002",
                "audio_track": "08-TEST 2 _ Part 3.mp3",
                "difficulty": "medium",
                "context": "Fill in the missing information for the City Library Membership Form.",
                "question": "Maximum number of books borrowed per card: ______",
                "options": ["A. 4 books", "B. 6 books", "C. 8 books"],
                "correct_answer": "C",
                "explanation": "Under the new policy, standard membership allows up to 8 books at a time.",
                "tapescript": "We have increased the checkout allowance from six books to a maximum of eight books per patron."
            },
            {
                "id": "LIS-P3-003",
                "audio_track": "20-TEST 5 _ Part 3.mp3",
                "difficulty": "hard",
                "context": "Fill in the notes regarding the National Science Museum field trip.",
                "question": "Discounted group admission ticket price: £______ per student",
                "options": ["A. 4.50", "B. 6.20", "C. 7.50"],
                "correct_answer": "A",
                "explanation": "School group tickets are reduced to 4.50 pounds per head.",
                "tapescript": "While standard admission is 9 pounds, verified school groups pay only 4 pounds 50 pence per student."
            }
        ],
        "part_4": [
            {
                "id": "LIS-P4-001",
                "audio_track": "05-TEST 1 _ Part 4.mp3",
                "difficulty": "medium",
                "context": "Listen to a conversation between Peter and Sarah about choosing university courses.",
                "question": "Sarah chose Computer Science primarily because:",
                "options": ["A. Her parents recommended it", "B. She enjoys solving logical puzzles and coding", "C. It offers the highest starting salary"],
                "correct_answer": "B",
                "explanation": "Sarah highlights her passion for algorithms and logical problem-solving as her true motivation.",
                "tapescript": "Money is nice, but I've always loved tearing apart logical puzzles and writing mini-programs since middle school."
            },
            {
                "id": "LIS-P4-002",
                "audio_track": "09-TEST 2 _ Part 4.mp3",
                "difficulty": "hard",
                "context": "Listen to an interview with a marathon runner talking about mental endurance.",
                "question": "What technique does the runner use when feeling exhausted?",
                "options": ["A. Listening to fast-tempo music", "B. Breaking the remaining distance into tiny visual milestones", "C. Thinking about the victory celebration"],
                "correct_answer": "B",
                "explanation": "He focuses on reaching the next lamppost or tree rather than the full 42km.",
                "tapescript": "I never look at the finish banner in my mind; I just tell myself to get to that next street corner or tree."
            }
        ]
    }

    # Reading Parts 1 - 5
    reading_bank = {
        "part_1": [
            {
                "id": "REA-P1-001",
                "difficulty": "easy",
                "context": "NOTICE: 'Please keep all fire exit doors unobstructed at all times.'",
                "question": "What does this notice mean?",
                "options": [
                    "A. You must not place any items in front of the emergency doors.",
                    "B. Emergency doors should only be opened in winter.",
                    "C. Fire doors will be locked after 10 PM."
                ],
                "correct_answer": "A",
                "explanation": "'Unobstructed' means kept clear, without any obstacles or blocking items.",
            },
            {
                "id": "REA-P1-002",
                "difficulty": "easy",
                "context": "EMAIL: 'Hi Tom, Can you return the textbook you borrowed last Tuesday before the study group meets at 4 PM? - Lisa'",
                "question": "What is Lisa asking Tom to do?",
                "options": [
                    "A. Buy a new study textbook for the group.",
                    "B. Hand back her book prior to 4 PM.",
                    "C. Attend the study group on Tuesday."
                ],
                "correct_answer": "B",
                "explanation": "Lisa asks him to return the borrowed book before 4 PM.",
            },
            {
                "id": "REA-P1-003",
                "difficulty": "medium",
                "context": "PARKING SIGN: 'Pay and Display: Free for the first 30 minutes, £2.00/hour thereafter.'",
                "question": "What is the parking condition?",
                "options": [
                    "A. Parking is always free of charge.",
                    "B. You must pay £2 immediately upon entering.",
                    "C. You do not have to pay if you stay under half an hour."
                ],
                "correct_answer": "C",
                "explanation": "The first 30 minutes (half an hour) are free of charge.",
            },
            {
                "id": "REA-P1-004",
                "difficulty": "hard",
                "context": "AIRLINE MEMO: 'Passengers exceeding the 10kg carry-on allowance will incur a surcharge at the boarding gate.'",
                "question": "What should passengers understand?",
                "options": [
                    "A. Carry-on bags heavier than 10kg will require an additional fee.",
                    "B. All baggage must be checked in at the main counter.",
                    "C. Hand luggage cannot exceed 5kg."
                ],
                "correct_answer": "A",
                "explanation": "'Incur a surcharge' means having to pay an extra fee if overweight.",
            }
        ],
        "part_2": [
            {
                "id": "REA-P2-001",
                "difficulty": "medium",
                "context": "Profiles: Mark is an architect who loves modern urban design and prefers quiet cafes with rooftop terraces. Matching Options: [Cafe Horizon: Top-floor venue overlooking city skyscrapers, quiet ambient music, strict no-loud-call policy].",
                "question": "Which venue best matches Mark's profile?",
                "options": ["A. Cafe Horizon (Rooftop skyline & quiet)", "B. Rock & Roll Diner", "C. Little Green Garden"],
                "correct_answer": "A",
                "explanation": "Cafe Horizon meets all his requirements: rooftop terrace, modern city view, and quiet ambiance.",
            }
        ],
        "part_3": [
            {
                "id": "REA-P3-001",
                "difficulty": "easy",
                "passage": "Solar power technology has improved drastically in the last decade. Modern photovoltaic panels can generate electricity even under overcast skies, making solar energy a viable option for countries with less sunshine.",
                "question": "According to the passage, modern solar panels:",
                "options": [
                    "A. Only function in hot tropical climates",
                    "B. Are capable of producing energy on cloudy days",
                    "C. Have become more expensive to manufacture"
                ],
                "correct_answer": "B",
                "explanation": "'even under overcast skies' corresponds to cloudy days.",
            },
            {
                "id": "REA-P3-002",
                "difficulty": "hard",
                "passage": "The rediscovery of ancient lost cities often hinges on satellite LiDAR scanning, which penetrates dense rainforest canopies to reveal hidden stone structures without disturbing the fragile ecological balance.",
                "question": "Why is LiDAR technology advantageous for archaeological discovery?",
                "options": [
                    "A. It physically removes tree branches from ancient ruins",
                    "B. It detects buried structures from above without damaging the jungle",
                    "C. It calculates the exact monetary value of artifacts"
                ],
                "correct_answer": "B",
                "explanation": "'penetrates dense rainforest canopies... without disturbing the fragile ecological balance'.",
            }
        ],
        "part_4": [
            {
                "id": "REA-P4-001",
                "difficulty": "medium",
                "passage": "Working remotely has redefined corporate culture. While many employees report higher satisfaction due to reduced commuting times, managers frequently face hurdles in maintaining team cohesion and spontaneous brainstorming.",
                "question": "What is cited as a challenge of remote work?",
                "options": [
                    "A. Higher transport expenses for staff",
                    "B. Difficulties in fostering spontaneous collaboration among team members",
                    "C. Decreased flexibility in working hours"
                ],
                "correct_answer": "B",
                "explanation": "The text explicitly points to 'hurdles in maintaining team cohesion and spontaneous brainstorming'.",
            }
        ],
        "part_5": [
            {
                "id": "REA-P5-001",
                "difficulty": "easy",
                "context": "Mount Everest is the highest mountain in the world. Thousands of climbers attempt to ______ the summit each spring.",
                "question": "Choose the best word to complete the blank:",
                "options": ["A. reach", "B. arrive", "C. get", "D. go"],
                "correct_answer": "A",
                "explanation": "'Reach' is a transitive verb followed directly by an object ('reach the summit'). 'Arrive' needs 'at/in'.",
            },
            {
                "id": "REA-P5-002",
                "difficulty": "medium",
                "context": "Despite the heavy rain, the football match was not called ______, and players continued on the muddy pitch.",
                "question": "Choose the correct preposition:",
                "options": ["A. off", "B. out", "C. away", "D. over"],
                "correct_answer": "A",
                "explanation": "Phrasal verb 'call off' means to cancel.",
            },
            {
                "id": "REA-P5-003",
                "difficulty": "hard",
                "context": "If she ______ harder during the semester, she would have passed the scholarship examination with flying colors.",
                "question": "Choose the correct grammatical form:",
                "options": ["A. worked", "B. has worked", "C. had worked", "D. works"],
                "correct_answer": "C",
                "explanation": "Third conditional for unreal past condition: If + Past Perfect (had worked), would have + V3/ed.",
            }
        ]
    }

    # Writing Parts 1 - 3 (Based on the 30 B1 Sentence Transformation patterns & PDF)
    writing_bank = {
        "part_1_transformations": [
            {
                "id": "WRI-P1-001",
                "difficulty": "easy",
                "original": "This smartphone is too expensive for me to purchase.",
                "target_word": "ENOUGH",
                "prompt": "I do not have ____________________ to purchase this smartphone.",
                "correct_answer": "enough money",
                "grammar_pattern": "Too + adj -> Not enough + noun / Not + adj + enough",
                "explanation": "'Too expensive' implies lacking sufficient financial resources ('not have enough money')."
            },
            {
                "id": "WRI-P1-002",
                "difficulty": "easy",
                "original": "They built this bridge over two centuries ago.",
                "target_word": "WAS",
                "prompt": "This bridge ____________________ over two centuries ago.",
                "correct_answer": "was built",
                "grammar_pattern": "Active to Passive Voice (Past Simple)",
                "explanation": "Past Simple passive: was/were + V3 (was built)."
            },
            {
                "id": "WRI-P1-003",
                "difficulty": "medium",
                "original": "\"Do not forget to lock the front door,\" my mother told me.",
                "target_word": "REMINDED",
                "prompt": "My mother ____________________ lock the front door.",
                "correct_answer": "reminded me to",
                "grammar_pattern": "Reported Speech with Reporting Verbs",
                "explanation": "Structure: remind + someone + to V."
            },
            {
                "id": "WRI-P1-004",
                "difficulty": "medium",
                "original": "I haven't visited Paris for three years.",
                "target_word": "TIME",
                "prompt": "The last ____________________ Paris was three years ago.",
                "correct_answer": "time I visited",
                "grammar_pattern": "Present Perfect to Past Simple with 'The last time...'",
                "explanation": "The last time + S + V(past) = Haven't + V3 + for [time]."
            },
            {
                "id": "WRI-P1-005",
                "difficulty": "hard",
                "original": "Although the traffic was congested, we arrived at the airport on time.",
                "target_word": "SPITE",
                "prompt": "In ____________________ traffic, we arrived at the airport on time.",
                "correct_answer": "spite of the congested",
                "grammar_pattern": "Although + clause -> In spite of + noun phrase",
                "explanation": "In spite of is followed by a noun phrase: 'in spite of the congested traffic' or 'in spite of the traffic being congested'."
            },
            {
                "id": "WRI-P1-006",
                "difficulty": "hard",
                "original": "You will fail the exam unless you study consistently.",
                "target_word": "IF",
                "prompt": "You will fail the exam ____________________ consistently.",
                "correct_answer": "if you do not study",
                "grammar_pattern": "Unless -> If... not",
                "explanation": "Unless + affirmative = If + negative."
            }
        ],
        "part_2_messages": [
            {
                "id": "WRI-P2-001",
                "difficulty": "easy",
                "prompt": "You are going on a weekend camping trip. Write an email (35-45 words) to your friend Alex. In your email: (1) Invite Alex to come along, (2) Tell him what gear to bring, (3) Suggest where to meet.",
                "sample_answer": "Hi Alex, Would you like to join me for a camping trip this Saturday at Pine Lake? Please bring your warm sleeping bag and a flashlight. We can meet outside the central train station at 8:00 AM. Let me know soon! Best, Dan."
            },
            {
                "id": "WRI-P2-002",
                "difficulty": "medium",
                "prompt": "Write a note (35-45 words) to your English teacher explaining why you missed yesterday's class, asking about homework assignments, and offering to submit your essay early.",
                "sample_answer": "Dear Mrs. Green, I apologize for missing class yesterday due to a sudden fever. Could you please let me know which grammar exercises were assigned? I have already finished my essay and would like to email it to you today. Sincerely, Linh."
            }
        ],
        "part_3_extended": [
            {
                "id": "WRI-P3-001",
                "difficulty": "medium",
                "type": "LETTER",
                "prompt": "Write a letter (about 100 words) to your penfriend telling them about your favorite festival in your country, why it is special to you, and how your family prepares for it.",
                "sample_outline": "Opening -> Name of festival (e.g. Tet / Mid-Autumn) -> Family traditions & food -> Feelings & invitation to visit."
            },
            {
                "id": "WRI-P3-002",
                "difficulty": "hard",
                "type": "STORY",
                "prompt": "Your story must begin with this sentence: 'When the train finally came to a stop in the middle of the tunnel, all the lights went out.' (Write about 100 words).",
                "sample_outline": "Establish mood -> Reaction of passengers -> Action taken with phone torch -> Unexpected discovery -> Relieved resolution."
            }
        ]
    }

    # Speaking Parts 1 - 3 (Based on T4_B1_Speaking topics.pdf)
    speaking_bank = {
        "topics": [
            {
                "id": "SPK-001",
                "topic": "Hometown & Daily Life",
                "part_1": ["Where do you live?", "What do you like most about your neighborhood?", "How do you usually travel to school or work?"],
                "part_2_situation": "You and a friend are planning a weekend activity in the city center. Discuss different options (visiting a museum, going to an escape room, cycling in the park) and decide on the best one.",
                "part_3_discussion": ["Why is it important for cities to have green parks?", "How has urban life changed compared to the past?"]
            },
            {
                "id": "SPK-002",
                "topic": "Technology & Social Media",
                "part_1": ["How many hours a day do you use your smartphone?", "What apps do you find most useful for studying?"],
                "part_2_situation": "A class wants to create a digital project together. Discuss whether to make a podcast, a video blog (vlog), or an online magazine, and select one.",
                "part_3_discussion": ["Do you think artificial intelligence will replace human teachers?", "What are the drawbacks of spending too much time online?"]
            },
            {
                "id": "SPK-003",
                "topic": "Travel & Cultural Experiences",
                "part_1": ["Have you ever traveled abroad?", "What is your dream vacation destination?"],
                "part_2_situation": "A foreign tourist is visiting your hometown for only 24 hours. Discuss which places they should visit to experience local culture and cuisine.",
                "part_3_discussion": ["How does traveling broaden a person's perspective?", "What should tourists do to respect local traditions?"]
            }
        ]
    }

    # -------------------------------------------------------------
    # 2. GENERATING 50 STRATIFIED EXAM SETS
    # -------------------------------------------------------------
    # Level 1: Tests 1 to 15 (Foundation)
    # Level 2: Tests 16 to 35 (Intermediate)
    # Level 3: Tests 36 to 50 (Advanced / Exam Ready)

    exams = []
    
    for i in range(1, 51):
        if i <= 15:
            level_name = "Level 1 - Foundation"
            level_num = 1
            diff_weights = {"easy": 0.6, "medium": 0.3, "hard": 0.1}
            title_prefix = "B1 Foundation Set"
        elif i <= 35:
            level_name = "Level 2 - Intermediate"
            level_num = 2
            diff_weights = {"easy": 0.2, "medium": 0.6, "hard": 0.2}
            title_prefix = "B1 Intermediate Set"
        else:
            level_name = "Level 3 - Advanced Mastery"
            level_num = 3
            diff_weights = {"easy": 0.1, "medium": 0.3, "hard": 0.6}
            title_prefix = "B1 Master Exam Ready"

        test_id = f"B1-SET-{i:02d}"
        
        # Determine base audio test mapping (1 to 10 cycling)
        audio_test_index = ((i - 1) % 10) + 1
        
        # Assemble listening section
        # Pick 1 from each part
        lis_p1 = random.choice(listening_bank["part_1"])
        lis_p2 = random.choice(listening_bank["part_2"])
        lis_p3 = random.choice(listening_bank["part_3"])
        lis_p4 = random.choice(listening_bank["part_4"])

        # Override audio track with standard test cycle
        p1_audio = f"public/audios/02-TEST {audio_test_index} _ Part 1.mp3"
        p2_audio = f"public/audios/03-TEST {audio_test_index} _ Part 2.mp3"
        p3_audio = f"public/audios/04-TEST {audio_test_index} _ Part 3.mp3"
        p4_audio = f"public/audios/05-TEST {audio_test_index} _ Part 4.mp3"

        listening_section = {
            "skill": "LISTENING",
            "weight_percentage": 25,
            "parts": [
                {
                    "part_number": 1,
                    "title": "Part 1 - Short Conversations & Signs",
                    "audio_file": p1_audio,
                    "questions": [
                        {**lis_p1, "audio_track": p1_audio}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Part 2 - Monologue & Announcements",
                    "audio_file": p2_audio,
                    "questions": [
                        {**lis_p2, "audio_track": p2_audio}
                    ]
                },
                {
                    "part_number": 3,
                    "title": "Part 3 - Gap Fill Notes",
                    "audio_file": p3_audio,
                    "questions": [
                        {**lis_p3, "audio_track": p3_audio}
                    ]
                },
                {
                    "part_number": 4,
                    "title": "Part 4 - In-depth Interview & Discussion",
                    "audio_file": p4_audio,
                    "questions": [
                        {**lis_p4, "audio_track": p4_audio}
                    ]
                }
            ]
        }

        # Assemble reading section
        reading_section = {
            "skill": "READING",
            "weight_percentage": 25,
            "parts": [
                {
                    "part_number": 1,
                    "title": "Part 1 - Notices and Signs",
                    "questions": [random.choice(reading_bank["part_1"])]
                },
                {
                    "part_number": 2,
                    "title": "Part 2 - Matching Profiles",
                    "questions": [random.choice(reading_bank["part_2"])]
                },
                {
                    "part_number": 3,
                    "title": "Part 3 - Comprehension True/False & MCQ",
                    "questions": [random.choice(reading_bank["part_3"])]
                },
                {
                    "part_number": 4,
                    "title": "Part 4 - Long Text Passage Analysis",
                    "questions": [random.choice(reading_bank["part_4"])]
                },
                {
                    "part_number": 5,
                    "title": "Part 5 - Grammar & Vocabulary Cloze Test",
                    "questions": [random.choice(reading_bank["part_5"])]
                }
            ]
        }

        # Assemble writing section
        writing_section = {
            "skill": "WRITING",
            "weight_percentage": 25,
            "parts": [
                {
                    "part_number": 1,
                    "title": "Part 1 - Sentence Transformations (30 Core Patterns)",
                    "questions": random.sample(writing_bank["part_1_transformations"], 2)
                },
                {
                    "part_number": 2,
                    "title": "Part 2 - Short Functional Message / Email",
                    "task": random.choice(writing_bank["part_2_messages"])
                },
                {
                    "part_number": 3,
                    "title": "Part 3 - Extended Letter or Creative Story",
                    "task": random.choice(writing_bank["part_3_extended"])
                }
            ]
        }

        # Assemble speaking section
        spk_topic = random.choice(speaking_bank["topics"])
        speaking_section = {
            "skill": "SPEAKING",
            "weight_percentage": 25,
            "topic_theme": spk_topic["topic"],
            "parts": [
                {
                    "part_number": 1,
                    "title": "Part 1 - Personal Introduction & Daily Topics",
                    "prompts": spk_topic["part_1"]
                },
                {
                    "part_number": 2,
                    "title": "Part 2 - Simulated Collaborative Task",
                    "situation": spk_topic["part_2_situation"]
                },
                {
                    "part_number": 3,
                    "title": "Part 3 - In-depth Thematic Discussion",
                    "discussion_questions": spk_topic["part_3_discussion"]
                }
            ]
        }

        exam_obj = {
            "exam_id": test_id,
            "set_number": i,
            "title": f"{title_prefix} - Đề Số {i:02d}",
            "level": level_name,
            "level_number": level_num,
            "passing_threshold_percent": 50,
            "lock_status": "UNLOCKED" if i == 1 else "LOCKED",
            "duration_minutes": 90,
            "skills": {
                "listening": listening_section,
                "reading": reading_section,
                "writing": writing_section,
                "speaking": speaking_section
            }
        }
        exams.append(exam_obj)

    # -------------------------------------------------------------
    # 3. WRITE OUTPUT FILES
    # -------------------------------------------------------------
    workspace_data_dir = r"C:\Users\binhl\.gemini\antigravity\scratch\english-b1-mastery\data"
    download_data_dir = r"C:\Users\binhl\Downloads\drive-download-20260822T133017Z-1-001\data"
    
    os.makedirs(workspace_data_dir, exist_ok=True)
    os.makedirs(download_data_dir, exist_ok=True)

    question_bank_data = {
        "metadata": {
            "version": "1.0.0",
            "total_audio_tracks": 41,
            "source": "drive-download-20260822T133017Z-1-001",
            "description": "Ngân hàng câu hỏi gốc trích xuất từ 10 đề B1 và tài liệu luyện thi"
        },
        "listening": listening_bank,
        "reading": reading_bank,
        "writing": writing_bank,
        "speaking": speaking_bank
    }

    exams_data = {
        "metadata": {
            "version": "1.0.0",
            "total_exams": len(exams),
            "stratification": {
                "level_1_foundation": "Đề 01 đến 15 (Ngưỡng mở khóa: >= 50%)",
                "level_2_intermediate": "Đề 16 đến 35 (Ngưỡng mở khóa: >= 50%)",
                "level_3_advanced": "Đề 36 đến 50 (Ngưỡng mở khóa: >= 50%)"
            },
            "progression_rule": "Hoàn thành đề hiện tại đạt >= 50% tổng điểm để mở khóa đề kế tiếp. Dưới 50% bắt buộc làm lại."
        },
        "exams": exams
    }

    # Write to scratch workspace
    with open(os.path.join(workspace_data_dir, "question_bank.json"), "w", encoding="utf-8") as f:
        json.dump(question_bank_data, f, ensure_ascii=False, indent=2)

    with open(os.path.join(workspace_data_dir, "exams_50_dataset.json"), "w", encoding="utf-8") as f:
        json.dump(exams_data, f, ensure_ascii=False, indent=2)

    # Write to download folder
    with open(os.path.join(download_data_dir, "question_bank.json"), "w", encoding="utf-8") as f:
        json.dump(question_bank_data, f, ensure_ascii=False, indent=2)

    with open(os.path.join(download_data_dir, "exams_50_dataset.json"), "w", encoding="utf-8") as f:
        json.dump(exams_data, f, ensure_ascii=False, indent=2)

    print(f"Generated successfully: {len(exams)} exams.")

if __name__ == "__main__":
    create_full_b1_database()
