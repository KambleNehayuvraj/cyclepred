"""
CycleWise - Explainability Layer
Introspects already-trained Stage A / Stage B models to surface
genuine model-driven risk factors (not hand-picked heuristics).
Uses model.feature_importances_ where available; for VotingClassifier
(Stage B), averages importances/|coef_| across base learners that expose them.
"""

import numpy as np
import pandas as pd

# Human-readable labels for features, used only for display
FEATURE_LABELS = {
    "cycle_irregular": "Irregular menstrual cycle",
    "weight_gain": "Unexplained weight gain",
    "hair_growth_excess": "Excess hair growth",
    "skin_darkening": "Skin darkening",
    "hair_loss": "Hair thinning / loss",
    "pimples": "Frequent acne",
    "fast_food_frequent": "Frequent fast food intake",
    "bmi": "Elevated BMI",
    "waist_hip_ratio": "Elevated waist-to-hip ratio",
    "bp_systolic": "Elevated blood pressure",
    "regular_exercise": "Low physical activity",
}

# Thresholds for continuous features - value at/above this counts as "flagged"
_CONTINUOUS_FLAG = {
    "bmi": 25.0,
    "waist_hip_ratio": 0.85,
    "bp_systolic": 130.0,
}


def get_feature_importance(model, feature_names: list) -> pd.Series:
    """Returns a normalized importance Series indexed by feature name."""
    if hasattr(model, "feature_importances_"):
        imp = pd.Series(model.feature_importances_, index=feature_names)

    elif hasattr(model, "named_estimators_"):  # VotingClassifier (Stage B)
        parts = []
        for est in model.named_estimators_.values():
            inner = est
            # logreg is wrapped in a Pipeline -> unwrap to the classifier step
            if hasattr(est, "named_steps"):
                inner = est.named_steps.get("clf", est)
            if hasattr(inner, "feature_importances_"):
                parts.append(pd.Series(inner.feature_importances_, index=feature_names))
            elif hasattr(inner, "coef_"):
                parts.append(pd.Series(np.abs(inner.coef_[0]), index=feature_names))
        if not parts:
            return pd.Series(0.0, index=feature_names)
        imp = pd.concat(parts, axis=1).mean(axis=1)

    else:
        return pd.Series(0.0, index=feature_names)

    total = imp.sum()
    return imp / total if total > 0 else imp


def get_patient_risk_factors(input_data: dict, importance: pd.Series, top_n: int = 6) -> list:
    """
    Ranks features by trained-model importance, then keeps only those
    where THIS patient's value is actually flagged as a risk indicator.
    Grounds the displayed factors in real model importance, not a fixed list.
    """
    ranked = importance.sort_values(ascending=False)
    factors = []

    for feat in ranked.index:
        if feat not in FEATURE_LABELS:
            continue
        val = input_data.get(feat)
        if val is None:
            continue

        flagged = False
        if feat in _CONTINUOUS_FLAG:
            flagged = float(val) >= _CONTINUOUS_FLAG[feat]
        elif feat == "regular_exercise":
            flagged = int(val) == 0
        else:
            flagged = int(val) == 1

        if flagged:
            factors.append(FEATURE_LABELS[feat])

        if len(factors) >= top_n:
            break

    return factors