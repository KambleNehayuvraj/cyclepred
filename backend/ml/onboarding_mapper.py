"""
CycleWise - Onboarding → Model Feature Mapper
Converts the onboarding questionnaire into the exact feature dict
expected by STAGE_A_FEATURES / STAGE_B_FEATURES.
"""


def onboarding_to_stage_a_input(onboarding: dict) -> dict:
    """
    onboarding: the 'onboarding_data' dict as stored in MongoDB
    (i.e. HealthOnboarding.model_dump() plus computed bmi).
    """
    waist = onboarding["waist_cm"]
    hip = onboarding["hip_cm"]

    return {
        "age": float(onboarding["age"]),
        "height_cm": float(onboarding["height_cm"]),
        "weight_kg": float(onboarding["weight_kg"]),
        "bmi": float(onboarding["bmi"]),
        "waist_cm": float(waist),
        "hip_cm": float(hip),
        "waist_hip_ratio": round(waist / hip, 3) if hip else 0.0,
        "bp_systolic": float(onboarding["bp_systolic"]),
        "bp_diastolic": float(onboarding["bp_diastolic"]),
        "cycle_irregular": 0 if onboarding["cycle_regularity"] == "regular" else 1,
        "cycle_length_days": float(onboarding["avg_cycle_length"]),
        "weight_gain": int(onboarding.get("has_weight_gain", False)),
        "hair_growth_excess": int(onboarding.get("has_excessive_hair_growth", False)),
        "skin_darkening": int(onboarding.get("has_skin_darkening", False)),
        "hair_loss": int(onboarding.get("has_hair_thinning", False)),
        "pimples": int(onboarding.get("has_acne", False)),
        "fast_food_frequent": int(onboarding.get("fast_food_frequent", False)),
        "regular_exercise": 1 if int(onboarding.get("exercise_days_per_week", 0)) >= 3 else 0,
    }


def build_stage_b_input(stage_a_input: dict, lab_report: dict) -> dict:
    """
    lab_report: dict produced from /predict/report-analysis (FSH, LH, AMH, etc.)
    Merges Stage A fields with lab values to satisfy STAGE_B_FEATURES.
    """
    merged = dict(stage_a_input)
    required_lab_fields = [
        "fsh", "lh", "amh", "testosterone_ng_ml", "tsh", "prolactin",
        "follicle_no_l", "follicle_no_r", "avg_f_size_l_mm",
        "avg_f_size_r_mm", "endometrium_mm",
    ]
    missing = [f for f in required_lab_fields if f not in lab_report]
    if missing:
        raise ValueError(f"Missing lab fields for Stage B: {missing}")

    merged.update({k: float(lab_report[k]) for k in required_lab_fields})
    lh, fsh = merged["lh"], merged["fsh"]
    merged["lh_fsh_ratio"] = round(lh / fsh, 3) if fsh else 0.0
    return merged


def derive_risk_factors(stage_a_input: dict) -> list:
    """Human-readable risk factor labels for the frontend's RiskFactors pills."""
    labels = {
        "cycle_irregular": "Irregular cycle",
        "weight_gain": "Unexplained weight gain",
        "hair_growth_excess": "Excess hair growth",
        "skin_darkening": "Skin darkening",
        "hair_loss": "Hair thinning/loss",
        "pimples": "Frequent acne",
        "fast_food_frequent": "Frequent fast food",
    }
    return [label for key, label in labels.items() if stage_a_input.get(key)]