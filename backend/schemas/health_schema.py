"""
CycleWise - Health Data Pydantic Schemas
24-question onboarding form (21 original + waist/hip/BP) + cycle tracking schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from enum import Enum


# -------------------------------
# ENUMS
# -------------------------------

class CycleRegularity(str, Enum):
    regular = "regular"
    irregular = "irregular"
    very_irregular = "very_irregular"


class FlowIntensity(str, Enum):
    light = "light"
    moderate = "moderate"
    heavy = "heavy"
    very_heavy = "very_heavy"


# -------------------------------
# ONBOARDING
# -------------------------------

class HealthOnboarding(BaseModel):
    # --- Basic Biometrics (Q1-Q4) ---
    age: int = Field(..., ge=10, le=60, description="Age in years")
    weight_kg: float = Field(..., ge=30, le=200, description="Weight in kilograms")
    height_cm: float = Field(..., ge=100, le=220, description="Height in centimeters")
    bmi: Optional[float] = Field(None, description="Auto-calculated if not provided")

    # --- Body Measurements (NEW - required for Stage A model) ---
    waist_cm: float = Field(..., ge=40, le=200, description="Waist circumference in cm")
    hip_cm: float = Field(..., ge=40, le=200, description="Hip circumference in cm")
    bp_systolic: int = Field(..., ge=70, le=200, description="Systolic blood pressure")
    bp_diastolic: int = Field(..., ge=40, le=130, description="Diastolic blood pressure")

    # --- Cycle Information (Q5-Q9) ---
    cycle_regularity: CycleRegularity = Field(..., description="Cycle regularity")
    avg_cycle_length: int = Field(..., ge=14, le=60, description="Cycle length in days")
    avg_period_duration: int = Field(..., ge=1, le=14, description="Period duration")
    last_period_date: date = Field(..., description="Last period date")
    flow_intensity: FlowIntensity = Field(..., description="Flow intensity")

    # --- Symptoms (Q10-Q17) ---
    has_acne: bool = False
    has_excessive_hair_growth: bool = False
    has_hair_thinning: bool = False
    has_mood_swings: bool = False
    has_cramps: bool = False
    has_bloating: bool = False
    has_fatigue: bool = False
    has_pelvic_pain: bool = False

    # --- NEW symptom/lifestyle fields needed for Stage A model ---
    has_weight_gain: bool = Field(False, description="Unexplained weight gain")
    has_skin_darkening: bool = Field(False, description="Dark patches on neck/underarms/groin")
    fast_food_frequent: bool = Field(False, description="Eats fast food 3+ times/week")

    # --- Lifestyle (Q18-Q21) ---
    exercise_days_per_week: int = Field(..., ge=0, le=7)
    stress_level: int = Field(..., ge=1, le=10)
    sleep_hours: float = Field(..., ge=2, le=14)
    diet_type: str = Field(..., description="vegetarian / non-vegetarian / vegan / mixed")

    class Config:
        json_schema_extra = {
            "example": {
                "age": 25,
                "weight_kg": 60,
                "height_cm": 162,
                "waist_cm": 78,
                "hip_cm": 96,
                "bp_systolic": 118,
                "bp_diastolic": 76,
                "cycle_regularity": "irregular",
                "avg_cycle_length": 35,
                "avg_period_duration": 6,
                "last_period_date": "2026-03-01",
                "flow_intensity": "heavy",
                "has_acne": True,
                "has_excessive_hair_growth": True,
                "has_hair_thinning": False,
                "has_mood_swings": True,
                "has_cramps": False,
                "has_bloating": True,
                "has_fatigue": True,
                "has_pelvic_pain": False,
                "has_weight_gain": True,
                "has_skin_darkening": False,
                "fast_food_frequent": True,
                "exercise_days_per_week": 1,
                "stress_level": 8,
                "sleep_hours": 5.5,
                "diet_type": "vegetarian"
            }
        }


# -------------------------------
# CYCLE RESULT
# -------------------------------

class CycleInfo(BaseModel):
    current_cycle_day: int
    cycle_phase: str
    next_period_date: date
    ovulation_date: Optional[date]
    ovulation_window_start: Optional[date]
    ovulation_window_end: Optional[date]
    days_until_next_period: int
    is_fertile_window: bool


# -------------------------------
# DATABASE RESPONSE
# -------------------------------

class HealthDataResponse(BaseModel):
    id: str
    user_id: str
    onboarding_data: dict
    cycle_info: Optional[CycleInfo]
    created_at: datetime
    updated_at: datetime