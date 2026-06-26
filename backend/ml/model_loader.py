"""
model_loader.py  – CycleWise
Loads all ML models once at startup and exposes them via get_models().
"""
import json
import os
import joblib

BASE = os.path.dirname(__file__)
MODELS_DIR = os.path.join(BASE, "models")


class ModelStore:
    stage_a_model = None
    stage_a_meta: dict = {}
    stage_b_model = None
    stage_b_meta: dict = {}
    cycle_phase_model = None
    cycle_phase_encoder = None
    cycle_phase_meta: dict = {}
    # ── NEW ──────────────────────────────
    recommendation_model = None
    recommendation_meta: dict = {}
    # ── NEW: next-period date regressor (pairs with cycle_phase v2) ────
    next_period_model = None
    next_period_meta: dict = {}


models = ModelStore()


def load_all_models():
    def _load(filename):
        path = os.path.join(MODELS_DIR, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Model file not found: {path}")
        return joblib.load(path)

    def _load_json(filename):
        path = os.path.join(MODELS_DIR, filename)
        with open(path) as f:
            return json.load(f)

    # Stage A
    models.stage_a_model = _load("stage_a_model_v2.joblib")
    models.stage_a_meta  = _load_json("stage_a_meta_v2.json")

    # Stage B
    models.stage_b_model = _load("stage_b_model_v2.joblib")
    models.stage_b_meta  = _load_json("stage_b_meta_v2.json")

    # Cycle phase — v2 preferred, falls back to v1 silently
    cycle_phase_v2 = os.path.join(MODELS_DIR, "cycle_phase_model_v2.joblib")
    cycle_phase_v1 = os.path.join(MODELS_DIR, "cycle_phase_model.joblib")

    if os.path.exists(cycle_phase_v2):
        models.cycle_phase_model   = joblib.load(cycle_phase_v2)
        models.cycle_phase_encoder = _load("cycle_phase_label_encoder_v2.joblib")
        models.cycle_phase_meta    = _load_json("cycle_phase_meta_v2.json")
        print("[model_loader] Cycle phase model v2 loaded.")
    elif os.path.exists(cycle_phase_v1):
        models.cycle_phase_model   = joblib.load(cycle_phase_v1)
        models.cycle_phase_encoder = _load("cycle_phase_label_encoder.joblib")
        models.cycle_phase_meta    = _load_json("cycle_phase_meta.json")
        print("[model_loader] Cycle phase model v1 loaded (v2 not found).")
    else:
        print("[model_loader] WARNING: No cycle phase model found, skipping.")

    # ── Next period date regressor (pairs with cycle phase v2) ─────────
    next_period_path = os.path.join(MODELS_DIR, "next_period_model_v2.joblib")
    if os.path.exists(next_period_path):
        models.next_period_model = joblib.load(next_period_path)
        models.next_period_meta  = _load_json("next_period_meta_v2.json")
        print("[model_loader] Next period regressor loaded.")
    else:
        print("[model_loader] WARNING: next_period_model_v2.joblib not found, skipping.")

    # ── Recommendation model (multi-output Random Forest) ─────────────
    rec_path = os.path.join(MODELS_DIR, "recommendation_model.joblib")
    if os.path.exists(rec_path):
        models.recommendation_model = joblib.load(rec_path)
        models.recommendation_meta  = _load_json("recommendation_meta.json")
        print("[model_loader] Recommendation model loaded.")
    else:
        print("[model_loader] WARNING: recommendation_model.joblib not found, skipping.")

    print("[model_loader] All models loaded successfully.")


def get_models() -> ModelStore:
    return models