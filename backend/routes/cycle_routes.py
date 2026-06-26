from fastapi import APIRouter, HTTPException, status, Depends
from datetime import date, datetime, timedelta
import pandas as pd

from database import get_health_data_collection
from utils.auth import get_current_user
from utils.cycle_calculator import calculate_cycle_info
from ml.model_loader import get_models
from ml.inference import run_stage_a
from ml.onboarding_mapper import onboarding_to_stage_a_input

router = APIRouter(prefix="/predict", tags=["Cycle Prediction"])

DAY_OF_WEEK_CODES = {
    "Friday": 0, "Monday": 1, "Saturday": 2, "Sunday": 3,
    "Thursday": 4, "Tuesday": 5, "Wednesday": 6,
}

# Matches the cutoff /predict/pcos uses: prob < 0.40 -> "low" / not detected.
PCOS_THRESHOLD = 0.40

# Symptom keys shared verbatim between Stage A's feature set and the cycle
# models' feature set — onboarding_to_stage_a_input() already produces
# these exact key names, so no separate mapping is needed here.
SYMPTOM_KEYS = [
    "weight_gain", "hair_growth_excess", "skin_darkening",
    "hair_loss", "pimples", "fast_food_frequent", "regular_exercise",
]


@router.get("/cycle-phase")
async def predict_cycle_phase(current_user: dict = Depends(get_current_user)):
    """
    Runs the cycle-phase classifier + next-period regressor together,
    using the user's stored onboarding data plus a LIVE Stage A PCOS
    probability — onboarding only captures symptoms, not a diagnosis,
    so has_pcos is derived the same way /predict/pcos derives it.
    """
    store = get_models()
    if store.cycle_phase_model is None or store.next_period_model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cycle prediction model is not available right now.",
        )

    health_col = get_health_data_collection()
    user_id = str(current_user["_id"])
    health_data = await health_col.find_one({"user_id": user_id})

    if not health_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health data not found. Please complete onboarding first.",
        )

    onboarding = health_data.get("onboarding_data", {})
    last_period_str = onboarding.get("last_period_date")
    if not last_period_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Last period date is missing from your profile.",
        )

    # Single source of truth for onboarding -> model field names, same
    # mapper Stage A/B and recommendations already rely on.
    try:
        stage_a_input = onboarding_to_stage_a_input(onboarding)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing onboarding field: {e}")

    # has_pcos isn't a stored field — it's the live Stage A verdict.
    stage_a_result = run_stage_a(stage_a_input, store)
    pcos_probability = stage_a_result["probability"]
    has_pcos = int(pcos_probability >= PCOS_THRESHOLD)

    avg_cycle_length = stage_a_input.get("cycle_length_days", onboarding.get("avg_cycle_length", 28))
    avg_period_duration = onboarding.get("avg_period_duration", 5)

    # Reuse the SAME cycle-day math the rest of the app already uses
    # (the wheel / stats on the dashboard), so this stays consistent.
    fresh_cycle = calculate_cycle_info(
        date.fromisoformat(last_period_str),
        avg_cycle_length,
        avg_period_duration,
    )
    cycle_day = fresh_cycle.current_cycle_day

    inputs = {
        "has_pcos": has_pcos,
        "age": stage_a_input.get("age", 25),
        "bmi": stage_a_input.get("bmi", 22.0),
        **{k: int(bool(stage_a_input.get(k, 0))) for k in SYMPTOM_KEYS},
        "cycle_length_days": avg_cycle_length,
        "cycle_day": cycle_day,
        # Not collected anywhere yet — defaults until BBT tracking exists.
        "bbt_celsius": onboarding.get("bbt_celsius", 36.5),
    }

    # ── 1. Cycle phase classification ──────────────────────────────────
    today = datetime.now()
    row = {**inputs}
    row["day_of_week"] = DAY_OF_WEEK_CODES.get(today.strftime("%A"), 1)
    row["month"] = today.month
    row["days_since_period_start"] = cycle_day

    phase_features = store.cycle_phase_meta["features"]
    X_phase = pd.DataFrame([{k: row.get(k, 0) for k in phase_features}])[phase_features]
    probs = store.cycle_phase_model.predict_proba(X_phase)[0]
    phase = store.cycle_phase_encoder.inverse_transform([probs.argmax()])[0]
    phase_probabilities = {
        cls: round(float(p), 3)
        for cls, p in zip(store.cycle_phase_encoder.classes_, probs)
    }

    # ── 2. Next period date regression ─────────────────────────────────
    period_features = store.next_period_meta["features"]
    X_period = pd.DataFrame([{k: inputs.get(k, 0) for k in period_features}])[period_features]
    predicted_length = round(float(store.next_period_model.predict(X_period)[0]))

    last_start = date.fromisoformat(last_period_str)
    next_date = last_start + timedelta(days=predicted_length)
    mae = round(store.next_period_meta.get("val_mae_days", 5))
    earliest = next_date - timedelta(days=mae)
    latest = next_date + timedelta(days=mae)

    return {
        "current_phase": phase,
        "phase_probabilities": phase_probabilities,
        "predicted_cycle_length_days": predicted_length,
        "next_period_date": next_date.isoformat(),
        "earliest_likely_date": earliest.isoformat(),
        "latest_likely_date": latest.isoformat(),
        "has_pcos": bool(has_pcos),
        "pcos_probability": round(pcos_probability * 100, 1),
    }