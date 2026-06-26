"""
Food Bank
==========
Categorized meal options, organized by the same 9 categories the
classifier predicts. The chart builder pulls from whichever
categories the model scored highest for THIS patient, so two patients
with different predicted categories get visibly different charts.

Diet categories (breakfast/lunch/snack/dinner) follow the original
6-category structure. Exercise, Yoga and Mood-Enhancing categories
follow the same 4-slot structure but contain activity/practice
recommendations instead of meals — making them directly usable as
parallel "lifestyle" recommendation columns alongside the diet chart.

This is hand-curated content (nutrition + wellness guidance, not ML
output) — the ML part is WHICH categories apply to a given patient.
"""

FOOD_BANK = {
    # ─────────────────────────────────────────────
    # DIET CATEGORIES (original 6)
    # ─────────────────────────────────────────────
    "needs_low_glycemic": {
        "breakfast": ["Vegetable omelette with whole-grain toast", "Greek yogurt with chia seeds and berries",
                      "Steel-cut oats with cinnamon and walnuts", "Besan (chickpea flour) vegetable pancake"],
        "lunch": ["Grilled paneer/tofu salad with olive oil dressing", "Quinoa bowl with roasted vegetables",
                  "Lentil soup with a side of greens", "Brown rice with mixed vegetable curry"],
        "snack": ["Handful of almonds and walnuts", "Cucumber and hummus", "Roasted chickpeas",
                  "Apple slices with peanut butter"],
        "dinner": ["Grilled fish/tofu with steamed broccoli", "Vegetable stir-fry with brown rice",
                   "Dal with sautéed spinach", "Baked chicken/tempeh with quinoa"],
    },
    "needs_high_fiber": {
        "breakfast": ["Oat bran porridge with flaxseed", "Whole-grain cereal with sliced banana",
                      "Multigrain paratha with curd", "Bran muffin with berries"],
        "lunch": ["Mixed bean salad", "Whole wheat wrap with vegetables and hummus",
                  "Barley and vegetable soup", "Chickpea and spinach curry with brown rice"],
        "snack": ["Pear or apple with skin", "Roasted edamame", "Carrot and celery sticks with hummus",
                  "Air-popped popcorn"],
        "dinner": ["Vegetable and lentil stew", "Stir-fried broccoli, carrots, and tofu",
                   "Whole wheat pasta with vegetable sauce", "Grilled vegetables with quinoa"],
    },
    "needs_anti_inflammatory": {
        "breakfast": ["Turmeric-ginger smoothie with spinach", "Berries with flaxseed and almond milk",
                      "Avocado on whole-grain toast", "Walnut and chia seed pudding"],
        "lunch": ["Salmon/tofu salad with olive oil and leafy greens", "Turmeric lentil soup",
                  "Mixed greens with walnuts and pomegranate", "Grilled vegetable and quinoa bowl"],
        "snack": ["Walnuts and green tea", "Berries", "Turmeric-spiced roasted nuts", "Dark chocolate (70%+) square"],
        "dinner": ["Baked salmon/tofu with steamed greens", "Turmeric cauliflower with brown rice",
                   "Vegetable curry with anti-inflammatory spices (turmeric, ginger)", "Grilled vegetables with olive oil"],
    },
    "needs_weight_mgmt": {
        "breakfast": ["Egg whites with sautéed spinach", "Protein smoothie with berries (no added sugar)",
                      "Low-fat Greek yogurt with seeds", "Vegetable upma with minimal oil"],
        "lunch": ["Large salad with lean protein, light dressing", "Grilled chicken/tofu with steamed vegetables",
                  "Clear vegetable soup with whole grain roll", "Lentil salad with cucumber and tomato"],
        "snack": ["Cucumber slices", "Small portion of nuts (controlled)", "Roasted makhana (fox nuts)",
                  "Green tea with a small fruit"],
        "dinner": ["Light vegetable soup", "Grilled fish/tofu with salad", "Steamed vegetables with small portion grain",
                   "Stir-fried vegetables with minimal oil"],
    },
    "needs_hormone_support": {
        "breakfast": ["Flaxseed smoothie with berries", "Whole grain toast with avocado and pumpkin seeds",
                      "Oats with cinnamon and walnuts", "Greek yogurt with seeds"],
        "lunch": ["Leafy greens with seeds and olive oil", "Salmon/tofu with roasted vegetables",
                  "Lentil and vegetable curry", "Quinoa salad with pumpkin seeds"],
        "snack": ["Pumpkin seeds", "Sesame seed (til) balls in moderation", "Flaxseed crackers", "Walnuts"],
        "dinner": ["Grilled fish/tofu with sautéed greens", "Vegetable and lentil stew with seeds",
                   "Stir-fried vegetables with sesame oil", "Baked sweet potato with greens"],
    },
    "needs_general_wellness": {
        "breakfast": ["Balanced fruit and yogurt bowl", "Whole grain cereal with milk",
                      "Vegetable sandwich", "Idli/dosa with sambar"],
        "lunch": ["Balanced thali (grain + vegetable + protein)", "Mixed vegetable rice with curd",
                  "Grilled protein with salad", "Whole wheat roti with dal and vegetables"],
        "snack": ["Seasonal fruit", "Mixed nuts", "Sprouts salad", "Buttermilk"],
        "dinner": ["Balanced home-cooked meal", "Soup and salad combo", "Grilled protein with vegetables",
                   "Khichdi with vegetables"],
    },

    # ─────────────────────────────────────────────
    # EXERCISE CATEGORY (new)
    # Slots reused as: morning / midday / evening / rest-day
    # ─────────────────────────────────────────────
    "needs_exercise": {
        "breakfast": [  # morning activity (pre or post breakfast)
            "30-min brisk walk (fasted or post-meal)",
            "20-min low-impact cardio warm-up",
            "15-min morning stretch + 10-min jog",
            "Stair climbing — 3 sets of 5 floors",
        ],
        "lunch": [  # midday movement
            "10-min post-lunch walk (reduces glucose spike)",
            "Desk stretches + 5-min standing break every hour",
            "15-min light cycling or stationary bike",
            "Office yoga — neck, shoulder, and hip flexor release",
        ],
        "snack": [  # short activity break
            "5-min jumping jacks + 5-min skipping",
            "Wall sits — 3 × 30 sec",
            "10-min resistance band routine (arms + legs)",
            "Bodyweight squats — 3 × 15",
        ],
        "dinner": [  # evening workout
            "30-min moderate-intensity cardio (cycle / elliptical / walk)",
            "20-min strength training — lower body focus",
            "25-min HIIT circuit (beginner level)",
            "40-min dance fitness or Zumba session",
        ],
    },

    # ─────────────────────────────────────────────
    # YOGA CATEGORY (new)
    # Slots: morning practice / midday reset / evening / restorative
    # ─────────────────────────────────────────────
    "needs_yoga": {
        "breakfast": [  # morning yoga practice
            "Sun Salutation (Surya Namaskar) — 5 rounds",
            "Pranayama — Anulom Vilom (10 min) + Kapalbhati (5 min)",
            "Hormonal balance sequence: Baddha Konasana, Supta Baddha Konasana, Viparita Karani",
            "Cat-Cow + Child's Pose + Downward Dog warm-up flow",
        ],
        "lunch": [  # midday reset / desk yoga
            "Seated spinal twist (Ardha Matsyendrasana) — 3 min each side",
            "Standing forward fold + neck rolls — 5 min desk reset",
            "Butterfly pose (Baddha Konasana) with deep breathing — 5 min",
            "3-min box breathing (4 sec inhale, 4 hold, 4 exhale, 4 hold)",
        ],
        "snack": [  # short mindful practice
            "5-min body scan meditation",
            "Alternate nostril breathing — 10 rounds",
            "Legs-up-the-wall pose (Viparita Karani) — 5 min",
            "Guided visualization — 5 min stress release",
        ],
        "dinner": [  # evening / restorative yoga
            "Yin yoga sequence — Pigeon, Dragon, Sleeping Swan (20 min)",
            "Restorative yoga — bolster-supported backbend + legs up wall (20 min)",
            "PCOS-specific sequence: Bridge, Supported Fish, Supta Baddha Konasana (15 min)",
            "Nidra yoga (yoga sleep) — 20-min guided body relaxation",
        ],
    },

    # ─────────────────────────────────────────────
    # MOOD ENHANCING CATEGORY (new)
    # Slots: morning ritual / midday boost / afternoon lift / evening wind-down
    # ─────────────────────────────────────────────
    "needs_mood_enhancing": {
        "breakfast": [  # morning mood ritual
            "5-min gratitude journaling + herbal tea (ashwagandha / chamomile)",
            "10-min sunlight exposure + positive affirmations",
            "Morning pages — free-write 3 pages to clear mental clutter",
            "5-min laughing exercise + energising playlist",
        ],
        "lunch": [  # midday social / cognitive boost
            "Eat lunch away from screens — mindful eating practice",
            "5-min walk outdoors + notice 5 things in nature",
            "Short social connection — call or text a friend",
            "Doodle or colour for 5 min — creative micro-break",
        ],
        "snack": [  # afternoon mood lift
            "Dark chocolate (70%+) square + walnuts — serotonin-supportive snack",
            "5-min aromatherapy — lavender or rose oil diffuser",
            "Uplifting podcast or music playlist — 10 min",
            "Brief body movement — shake it out, stretch, or dance",
        ],
        "dinner": [  # evening wind-down
            "Digital sunset — no screens 1 hr before bed, dim lights",
            "Journaling — 3 good things that happened today",
            "Warm bath with Epsom salts + lavender — 15 min",
            "10-min progressive muscle relaxation before sleep",
        ],
    },
}

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
MEALS = ["breakfast", "lunch", "snack", "dinner"]
