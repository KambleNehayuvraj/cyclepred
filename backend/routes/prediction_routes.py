from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ml.model_loader import ModelStore, get_models
from ml.inference import run_stage_a, run_stage_b, STAGE_A_FEATURES, STAGE_B_FEATURES
from ml.onboarding_mapper import onboarding_to_stage_a_input, build_stage_b_input
from ml.explainability import get_feature_importance, get_patient_risk_factors
from ml.lifestyle_engine import recommend
from ml.chart_builder import build_all_charts
from ml.api_response import CATEGORY_LABELS, CATEGORY_COLORS
from ml.food_bank import DAYS, MEALS
from database import get_health_data_collection
from utils.auth import get_current_user
import pandas as pd

router = APIRouter(prefix="/predict", tags=["prediction"])


class StageAInput(BaseModel):
    age: float
    height_cm: float
    weight_kg: float
    bmi: float
    waist_cm: float
    hip_cm: float
    waist_hip_ratio: float
    bp_systolic: float
    bp_diastolic: float
    cycle_irregular: int
    cycle_length_days: float
    weight_gain: int
    hair_growth_excess: int
    skin_darkening: int
    hair_loss: int
    pimples: int
    fast_food_frequent: int
    regular_exercise: int


class StageBInput(StageAInput):
    fsh: float
    lh: float
    lh_fsh_ratio: float
    amh: float
    testosterone_ng_ml: float
    tsh: float
    prolactin: float
    follicle_no_l: int
    follicle_no_r: int
    avg_f_size_l_mm: float
    avg_f_size_r_mm: float
    endometrium_mm: float


# Lab-only body — frontend sends only these 11 fields
class LabInput(BaseModel):
    fsh: float
    lh: float
    amh: float
    testosterone_ng_ml: float
    tsh: float
    prolactin: float
    follicle_no_l: int
    follicle_no_r: int
    avg_f_size_l_mm: float
    avg_f_size_r_mm: float
    endometrium_mm: float


# ── Debug endpoints ───────────────────────────────────────────────────────

@router.post("/stage-a")
def predict_stage_a(body: StageAInput, store: ModelStore = Depends(get_models)):
    try:
        return run_stage_a(body.dict(), store)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stage-b")
def predict_stage_b(body: StageBInput, store: ModelStore = Depends(get_models)):
    try:
        return run_stage_b(body.dict(), store)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Main PCOS screening ───────────────────────────────────────────────────

@router.get("/pcos")
async def predict_pcos(
    current_user: dict = Depends(get_current_user),
    store: ModelStore = Depends(get_models),
):
    health_col  = get_health_data_collection()
    health_data = await health_col.find_one({"user_id": str(current_user["_id"])})

    if not health_data:
        raise HTTPException(status_code=400, detail="Please complete onboarding first.")

    try:
        stage_a_input = onboarding_to_stage_a_input(health_data["onboarding_data"])
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing onboarding field: {e}")

    stage_a_result = run_stage_a(stage_a_input, store)
    prob = stage_a_result["probability"]

    if prob < 0.40:
        risk_level    = "low"
        pcos_detected = False
    elif prob < 0.75:
        risk_level    = "ambiguous"
        pcos_detected = True
    else:
        risk_level    = "high"
        pcos_detected = True

    importance   = get_feature_importance(store.stage_a_model, STAGE_A_FEATURES)
    risk_factors = get_patient_risk_factors(stage_a_input, importance)

    return {
        "risk_probability": round(prob * 100, 1),
        "risk_level":       risk_level,
        "pcos_detected":    pcos_detected,
        "key_risk_factors": risk_factors,
        "stage":            "stage_a",
    }


# ── Stage B confirmatory endpoint ─────────────────────────────────────────
# Frontend sends only 11 lab fields.
# Backend fetches onboarding from MongoDB, merges, runs Stage B ensemble.

@router.post("/stage-b-confirm")
async def stage_b_confirm(
    body: LabInput,
    current_user: dict = Depends(get_current_user),
    store: ModelStore = Depends(get_models),
):
    health_col  = get_health_data_collection()
    health_data = await health_col.find_one({"user_id": str(current_user["_id"])})

    if not health_data:
        raise HTTPException(status_code=400, detail="Please complete onboarding first.")

    try:
        stage_a_input = onboarding_to_stage_a_input(health_data["onboarding_data"])
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing onboarding field: {e}")

    try:
        stage_b_input = build_stage_b_input(stage_a_input, body.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        stage_b_result = run_stage_b(stage_b_input, store)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stage B model error: {str(e)}")

    prob = stage_b_result["probability"]

    verdict       = "high" if prob >= 0.5 else "low"
    pcos_confirmed = prob >= 0.5

    return {
        "probability":    round(prob * 100, 1),
        "verdict":        verdict,
        "pcos_confirmed": pcos_confirmed,
        "outcome":        stage_b_result["outcome"],
        "stage":          "stage_b",
    }


# ── Standalone recommendations ────────────────────────────────────────────

@router.get("/recommendation")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    health_col  = get_health_data_collection()
    health_data = await health_col.find_one({"user_id": str(current_user["_id"])})
    if not health_data:
        raise HTTPException(status_code=400, detail="Please complete onboarding first.")

    stage_a_input = onboarding_to_stage_a_input(health_data["onboarding_data"])
    return {"recommendations": recommend(stage_a_input)}


# ── ML-powered weekly plan ────────────────────────────────────────────────

@router.get("/weekly-plan")
async def get_weekly_plan(
    current_user: dict = Depends(get_current_user),
    store: ModelStore = Depends(get_models),
):
    if store.recommendation_model is None:
        raise HTTPException(status_code=503, detail="Recommendation model not loaded.")

    health_col  = get_health_data_collection()
    health_data = await health_col.find_one({"user_id": str(current_user["_id"])})
    if not health_data:
        raise HTTPException(status_code=400, detail="Please complete onboarding first.")

    try:
        patient = onboarding_to_stage_a_input(health_data["onboarding_data"])
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing onboarding field: {e}")

    try:
        meta       = store.recommendation_meta
        X          = pd.DataFrame([{k: patient.get(k, 0) for k in meta["features"]}])
        proba_list = store.recommendation_model.predict_proba(X)
        category_probs = {
            label: float(proba_list[i][0, 1])
            for i, label in enumerate(meta["labels"])
        }

        tracks = build_all_charts(category_probs, seed=None)

        def _format_badges(active_cats):
            return [
                {
                    "category":   cat,
                    "label":      CATEGORY_LABELS[cat],
                    "confidence": round(p, 2),
                    "color":      CATEGORY_COLORS[cat],
                }
                for cat, p in sorted(active_cats.items(), key=lambda x: -x[1])
            ]

        def _format_grid(chart):
            grid = []
            for day in DAYS:
                row = {"day": day}
                for slot in MEALS:
                    entry = chart[day][slot]
                    row[slot] = {
                        "item":     entry["item"],
                        "category": entry["category"],
                        "color":    CATEGORY_COLORS[entry["category"]],
                    }
                grid.append(row)
            return grid

        return {
            "diet_active_categories":     _format_badges(tracks["diet"]["active_categories"]),
            "weekly_diet_chart":          _format_grid(tracks["diet"]["chart"]),
            "exercise_active_categories": _format_badges(tracks["exercise_yoga"]["active_categories"]),
            "weekly_exercise_chart":      _format_grid(tracks["exercise_yoga"]["chart"]),
            "mood_active_categories":     _format_badges(tracks["mood"]["active_categories"]),
            "weekly_mood_chart":          _format_grid(tracks["mood"]["chart"]),
            "all_category_probabilities": {
                k: round(v, 3) for k, v in category_probs.items()
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation engine error: {str(e)}")