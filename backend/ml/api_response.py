"""
Frontend-Ready Output
========================
Every patient always receives three complete weekly recommendation tracks:
  - weekly_diet_chart       : 7-day x 4-meal personalized diet plan
  - weekly_exercise_chart   : 7-day x 4-slot exercise & yoga plan
  - weekly_mood_chart       : 7-day x 4-slot mood-enhancing activities

The active categories within each track (and their confidence scores)
are returned as badge arrays so the frontend can show WHY each
recommendation was chosen.

Run:
    python api_response.py            # demo patient, prints JSON
"""
import json
from ml.chart_builder import generate_personalized_chart, DAYS, MEALS

CATEGORY_LABELS = {
    "needs_low_glycemic":      "Low glycemic / blood sugar focus",
    "needs_high_fiber":        "High fiber",
    "needs_anti_inflammatory": "Anti-inflammatory",
    "needs_weight_mgmt":       "Weight management",
    "needs_hormone_support":   "Hormone support",
    "needs_general_wellness":  "General wellness",
    "needs_exercise":          "Exercise & movement",
    "needs_yoga":              "Yoga & breathwork",
    "needs_mood_enhancing":    "Mood enhancement",
}

CATEGORY_COLORS = {
    "needs_low_glycemic":      "#378ADD",
    "needs_high_fiber":        "#E24B4A",
    "needs_anti_inflammatory": "#888780",
    "needs_weight_mgmt":       "#BA7517",
    "needs_hormone_support":   "#639922",
    "needs_general_wellness":  "#5F5E5A",
    "needs_exercise":          "#E07B39",
    "needs_yoga":              "#7B5EA7",
    "needs_mood_enhancing":    "#D4896A",
}


def _format_badges(active_cats: dict) -> list:
    return [
        {
            "category": cat,
            "label": CATEGORY_LABELS[cat],
            "confidence": round(prob, 2),
            "color": CATEGORY_COLORS[cat],
        }
        for cat, prob in sorted(active_cats.items(), key=lambda x: -x[1])
    ]


def _format_grid(chart: dict) -> list:
    grid = []
    for day in DAYS:
        row = {"day": day}
        for slot in MEALS:
            entry = chart[day][slot]
            row[slot] = {
                "item": entry["item"],
                "category": entry["category"],
                "color": CATEGORY_COLORS[entry["category"]],
            }
        grid.append(row)
    return grid


def get_frontend_payload(patient: dict, seed: int = None) -> dict:
    result = generate_personalized_chart(patient, seed=seed)

    return {
        # ── Diet track ──────────────────────────────────────────────
        "diet_active_categories": _format_badges(result["diet"]["active_categories"]),
        "weekly_diet_chart": _format_grid(result["diet"]["chart"]),

        # ── Exercise / Yoga track ───────────────────────────────────
        "exercise_active_categories": _format_badges(result["exercise_yoga"]["active_categories"]),
        "weekly_exercise_chart": _format_grid(result["exercise_yoga"]["chart"]),

        # ── Mood track ──────────────────────────────────────────────
        "mood_active_categories": _format_badges(result["mood"]["active_categories"]),
        "weekly_mood_chart": _format_grid(result["mood"]["chart"]),

        # ── Raw probabilities (all 9 labels) ────────────────────────
        "all_category_probabilities": {
            k: round(v, 3) for k, v in result["all_category_probabilities"].items()
        },
    }


if __name__ == "__main__":
    demo_patient = {
        "age": 27, "height_cm": 160, "weight_kg": 80, "bmi": 31.2,
        "waist_cm": 95, "hip_cm": 106, "waist_hip_ratio": 0.90,
        "bp_systolic": 124, "bp_diastolic": 82,
        "cycle_irregular": 1, "cycle_length_days": 48,
        "weight_gain": 1, "hair_growth_excess": 1, "skin_darkening": 1,
        "hair_loss": 1, "pimples": 1, "fast_food_frequent": 1, "regular_exercise": 0,
    }
    payload = get_frontend_payload(demo_patient, seed=7)
    print(json.dumps(payload, indent=2))
