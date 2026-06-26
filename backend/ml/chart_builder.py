"""
Personalized Weekly Recommendation Chart Builder
==================================================
Every patient always receives THREE separate 7-day x 4-slot charts:

  1. DIET chart       — built from the 6 diet categories
                        (low_glycemic, high_fiber, anti_inflammatory,
                         weight_mgmt, hormone_support, general_wellness)

  2. EXERCISE/YOGA chart — built from the 2 physical categories
                        (needs_exercise, needs_yoga)
                        Both are always included; weights shift based on
                        which the model is more confident about.

  3. MOOD ENHANCING chart — always built from needs_mood_enhancing,
                        regardless of model confidence.

Personalization mechanism (same as before, now applied per-track):
  1. Get category probabilities from the model.
  2. For each track, keep categories above the confidence threshold.
     If none qualify in a track, fall back to the track's default category.
  3. Weighted-sample within the track for each day/slot.

This guarantees every patient gets all three tracks — no patient ever
misses diet, exercise, or mood recommendations.
"""
import json
import joblib
import numpy as np
import pandas as pd

from ml.food_bank import FOOD_BANK, DAYS, MEALS

MODEL_DIR = "../models"
CONFIDENCE_THRESHOLD = 0.5

# Track definitions — which food_bank keys belong to each track
DIET_CATEGORIES = [
    "needs_low_glycemic", "needs_high_fiber", "needs_anti_inflammatory",
    "needs_weight_mgmt", "needs_hormone_support", "needs_general_wellness",
]
EXERCISE_YOGA_CATEGORIES = ["needs_exercise", "needs_yoga"]
MOOD_CATEGORIES = ["needs_mood_enhancing"]

# Fallback category per track (used when nothing clears the threshold)
DIET_FALLBACK = "needs_general_wellness"
EXERCISE_FALLBACK = "needs_exercise"
MOOD_FALLBACK = "needs_mood_enhancing"


def load_model():
    model = joblib.load(f"{MODEL_DIR}/recommendation_model.joblib")
    with open(f"{MODEL_DIR}/recommendation_meta.json") as f:
        meta = json.load(f)
    return model, meta


def predict_categories(model, meta, patient: dict) -> dict:
    X = pd.DataFrame([{k: patient.get(k, 0) for k in meta["features"]}])
    proba_list = model.predict_proba(X)
    probs = {label: float(proba_list[i][0, 1]) for i, label in enumerate(meta["labels"])}
    return probs


def _build_track_chart(track_categories: list, category_probs: dict,
                       fallback: str, rng) -> dict:
    """
    Build a 7-day x 4-slot chart for a single track (diet / exercise-yoga / mood).
    Weighted-samples within the given track categories only.
    """
    active = {k: v for k, v in category_probs.items()
              if k in track_categories and v >= CONFIDENCE_THRESHOLD}
    if not active:
        active = {fallback: max(category_probs.get(fallback, 0.5), 0.5)}

    categories = list(active.keys())
    weights = np.array(list(active.values()))
    weights = weights / weights.sum()

    chart = {}
    recent = {slot: [] for slot in MEALS}

    for day in DAYS:
        chart[day] = {}
        for slot in MEALS:
            cat = rng.choice(categories, p=weights)
            options = [m for m in FOOD_BANK[cat][slot] if m not in recent[slot][-2:]]
            if not options:
                options = FOOD_BANK[cat][slot]
            choice = rng.choice(options)
            chart[day][slot] = {"item": choice, "category": cat}
            recent[slot].append(choice)

    return {"active_categories": active, "chart": chart}


def build_all_charts(category_probs: dict, seed: int = None) -> dict:
    """
    Always returns all three tracks for the patient.
    """
    rng = np.random.default_rng(seed)

    diet = _build_track_chart(DIET_CATEGORIES, category_probs, DIET_FALLBACK, rng)
    exercise_yoga = _build_track_chart(EXERCISE_YOGA_CATEGORIES, category_probs, EXERCISE_FALLBACK, rng)
    mood = _build_track_chart(MOOD_CATEGORIES, category_probs, MOOD_FALLBACK, rng)

    return {
        "diet": diet,
        "exercise_yoga": exercise_yoga,
        "mood": mood,
    }


def generate_personalized_chart(patient: dict, seed: int = None) -> dict:
    model, meta = load_model()
    probs = predict_categories(model, meta, patient)
    tracks = build_all_charts(probs, seed=seed)
    tracks["all_category_probabilities"] = probs
    return tracks


if __name__ == "__main__":
    patient_a = {  # high BMI, irregular cycle, acne
        "age": 27, "height_cm": 160, "weight_kg": 80, "bmi": 31.2,
        "waist_cm": 95, "hip_cm": 106, "waist_hip_ratio": 0.90,
        "bp_systolic": 124, "bp_diastolic": 82,
        "cycle_irregular": 1, "cycle_length_days": 48,
        "weight_gain": 1, "hair_growth_excess": 1, "skin_darkening": 1,
        "hair_loss": 1, "pimples": 1, "fast_food_frequent": 1, "regular_exercise": 0,
    }
    patient_b = {  # lean, regular cycle, minimal symptoms
        "age": 23, "height_cm": 164, "weight_kg": 56, "bmi": 20.8,
        "waist_cm": 68, "hip_cm": 90, "waist_hip_ratio": 0.76,
        "bp_systolic": 112, "bp_diastolic": 72,
        "cycle_irregular": 0, "cycle_length_days": 28,
        "weight_gain": 0, "hair_growth_excess": 0, "skin_darkening": 0,
        "hair_loss": 0, "pimples": 0, "fast_food_frequent": 0, "regular_exercise": 1,
    }

    for name, patient in [("Patient A (high-risk)", patient_a), ("Patient B (low-risk)", patient_b)]:
        print(f"\n{'='*60}\n{name}\n{'='*60}")
        result = generate_personalized_chart(patient, seed=7)
        for track_name in ["diet", "exercise_yoga", "mood"]:
            track = result[track_name]
            print(f"\n  [{track_name.upper()}] active: {list(track['active_categories'].keys())}")
            for slot in MEALS:
                entry = track["chart"]["Monday"][slot]
                print(f"    Monday {slot:<10} {entry['item']}  [{entry['category']}]")
