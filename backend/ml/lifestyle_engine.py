"""
CycleWise - Lifestyle Recommendation Engine
Rule-based (not ML) by design - see project notes. Operates on the
same feature dict produced by onboarding_mapper.onboarding_to_stage_a_input.
"""


def recommend(patient: dict) -> list:
    recs = []

    bmi = patient.get("bmi", 22)
    if bmi >= 25:
        recs.append({
            "category": "diet",
            "advice": "Your BMI is in the overweight/obese range. A modest 5-10% "
                       "weight reduction is associated with improved cycle "
                       "regularity in PCOS. Consider a low-glycemic-index diet."
        })
    if patient.get("fast_food_frequent"):
        recs.append({
            "category": "diet",
            "advice": "Frequent fast food intake detected. Reducing refined "
                       "carbs and trans fats can help insulin sensitivity."
        })
    if not patient.get("regular_exercise"):
        recs.append({
            "category": "exercise",
            "advice": "No regular exercise reported. Aim for 150 min/week of "
                       "moderate aerobic activity plus 2x/week resistance training."
        })
    if patient.get("cycle_irregular"):
        recs.append({
            "category": "tracking",
            "advice": "Irregular cycles detected. Track cycle length for 3 "
                       "months and share the log with a clinician if it persists."
        })
    if patient.get("waist_hip_ratio", 0) and patient["waist_hip_ratio"] > 0.85:
        recs.append({
            "category": "metabolic",
            "advice": "Elevated waist-to-hip ratio suggests central adiposity, "
                       "a key PCOS metabolic marker - prioritize core/visceral "
                       "fat reduction over general weight loss."
        })
    if not recs:
        recs.append({
            "category": "general",
            "advice": "No major lifestyle risk factors detected. Maintain "
                       "current habits and repeat screening periodically."
        })
    return recs