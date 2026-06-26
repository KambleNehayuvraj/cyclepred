"""
Weekly Timetable Printer
=========================
Prints a clean, readable 7-day timetable for all three tracks:
  - Diet
  - Exercise / Yoga
  - Mood Enhancing

Usage:
    python weekly_timetable.py
    
Edit the `patient` dict at the bottom with real patient values.
"""
from ml.chart_builder import generate_personalized_chart, DAYS, MEALS

SLOT_LABELS = {
    "breakfast": "Morning",
    "lunch":     "Midday",
    "snack":     "Afternoon",
    "dinner":    "Evening",
}

TRACK_TITLES = {
    "diet":          "🥗  DIET PLAN",
    "exercise_yoga": "🧘  EXERCISE & YOGA PLAN",
    "mood":          "😊  MOOD ENHANCING PLAN",
}

TRACK_KEYS = {
    "diet":          "diet",
    "exercise_yoga": "exercise_yoga",
    "mood":          "mood",
}

SEP = "=" * 80


def print_timetable(patient: dict, seed: int = 42):
    result = generate_personalized_chart(patient, seed=seed)

    print(f"\n{SEP}")
    print("  PERSONALIZED 7-DAY WELLNESS TIMETABLE")
    print(SEP)

    for track_key, title in TRACK_TITLES.items():
        track = result[track_key]
        active = ", ".join(track["active_categories"].keys())

        print(f"\n{'-'*80}")
        print(f"  {title}")
        print(f"  Active categories: {active}")
        print(f"{'-'*80}")
        print(f"  {'DAY':<12} {'MORNING':<22} {'MIDDAY':<22} {'AFTERNOON':<22} {'EVENING'}")
        print(f"  {'-'*10:<12} {'-'*20:<22} {'-'*20:<22} {'-'*20:<22} {'-'*20}")

        for day in DAYS:
            slots = []
            for slot in MEALS:
                item = track["chart"][day][slot]["item"]
                # Wrap at 20 chars
                slots.append(item[:20] + ".." if len(item) > 20 else item)
            print(f"  {day:<12} {slots[0]:<22} {slots[1]:<22} {slots[2]:<22} {slots[3]}")

    print(f"\n{SEP}")
    print("  ALL CATEGORY PROBABILITIES (model confidence scores)")
    print(SEP)
    for cat, prob in sorted(result["all_category_probabilities"].items(), key=lambda x: -x[1]):
        bar = "█" * int(prob * 20)
        print(f"  {cat:<30} {prob:.2f}  {bar}")
    print()


if __name__ == "__main__":
    # ── Edit this patient dict with real values ──────────────────────
    patient = {
        "age": 27,
        "height_cm": 160,
        "weight_kg": 80,
        "bmi": 31.2,
        "waist_cm": 95,
        "hip_cm": 106,
        "waist_hip_ratio": 0.90,
        "bp_systolic": 124,
        "bp_diastolic": 82,
        "cycle_irregular": 1,       # 1 = yes, 0 = no
        "cycle_length_days": 48,
        "weight_gain": 1,           # 1 = yes, 0 = no
        "hair_growth_excess": 1,    # 1 = yes, 0 = no
        "skin_darkening": 1,        # 1 = yes, 0 = no
        "hair_loss": 1,             # 1 = yes, 0 = no
        "pimples": 1,               # 1 = yes, 0 = no
        "fast_food_frequent": 1,    # 1 = yes, 0 = no
        "regular_exercise": 0,      # 1 = yes, 0 = no
    }
    # ─────────────────────────────────────────────────────────────────

    print_timetable(patient, seed=42)
