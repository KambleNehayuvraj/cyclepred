import pandas as pd
from ml.model_loader import ModelStore

LOW_RISK_THRESHOLD  = 0.40
HIGH_RISK_THRESHOLD = 0.75

STAGE_A_FEATURES = [
    "age", "height_cm", "weight_kg", "bmi", "waist_cm", "hip_cm",
    "waist_hip_ratio", "bp_systolic", "bp_diastolic", "cycle_irregular",
    "cycle_length_days", "weight_gain", "hair_growth_excess", "skin_darkening",
    "hair_loss", "pimples", "fast_food_frequent", "regular_exercise",
]

STAGE_B_FEATURES = STAGE_A_FEATURES + [
    "fsh", "lh", "lh_fsh_ratio", "amh", "testosterone_ng_ml", "tsh",
    "prolactin", "follicle_no_l", "follicle_no_r",
    "avg_f_size_l_mm", "avg_f_size_r_mm", "endometrium_mm",
]


def route_patient(prob: float) -> str:
    if prob < LOW_RISK_THRESHOLD:
        return "LOW_RISK"
    elif prob < HIGH_RISK_THRESHOLD:
        return "AMBIGUOUS_GO_TO_STAGE_B"
    else:
        return "HIGH_RISK"


def run_stage_a(input_data: dict, store: ModelStore) -> dict:
    X = pd.DataFrame([input_data])[STAGE_A_FEATURES]
    # Stage A v2 is a Random Forest — no scaler needed or available
    prob = float(store.stage_a_model.predict_proba(X)[0][1])
    return {"probability": round(prob, 4), "route": route_patient(prob)}


def confirm_diagnosis(prob: float, lifestyle_score: float) -> str:
    if prob >= 0.5 and lifestyle_score < 0.5:
        return "CONFIRMED_PCOS_REFER_CLINICAL"
    elif prob >= 0.5 and lifestyle_score >= 0.5:
        return "LIFESTYLE_DRIVEN_REFER_LIFESTYLE_ENGINE"
    else:
        return "NOT_CONFIRMED"


def run_stage_b(input_data: dict, store: ModelStore) -> dict:
    X = pd.DataFrame([input_data])[STAGE_B_FEATURES]
    prob = float(store.stage_b_model.predict_proba(X)[0][1])

    bmi = float(input_data.get("bmi", 22))
    lifestyle_score = (1 - min(prob, 1.0)) if bmi > 25 else 0.3

    outcome = confirm_diagnosis(prob, lifestyle_score)
    return {
        "probability": round(prob, 4),
        "outcome": outcome,
        "lifestyle_score": round(lifestyle_score, 4),
    }