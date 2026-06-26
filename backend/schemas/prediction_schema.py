"""
CycleWise - Prediction Pydantic Schemas
PCOS prediction, recommendations, and report analysis.
"""

from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


# -------------------------------
# PCOS PREDICTION
# -------------------------------

class PCOSPredictionResponse(BaseModel):
    user_id: str
    pcos_detected: bool
    risk_probability: float = Field(..., ge=0.0, le=1.0)
    risk_level: str  # low / moderate / high
    key_risk_factors: List[str]
    prediction_date: datetime


# -------------------------------
# DIET RECOMMENDATIONS
# -------------------------------

class DietRecommendation(BaseModel):
    category: str
    title: str
    description: str
    foods_to_include: List[str]
    foods_to_avoid: List[str]


# -------------------------------
# LIFESTYLE RECOMMENDATIONS
# -------------------------------

class LifestyleRecommendation(BaseModel):
    category: str
    title: str
    description: str
    tips: List[str]


# -------------------------------
# FINAL RECOMMENDATION RESPONSE
# -------------------------------

class RecommendationResponse(BaseModel):
    user_id: str
    pcos_detected: bool
    diet_recommendations: List[DietRecommendation]
    lifestyle_recommendations: List[LifestyleRecommendation]
    cycle_tips: List[str]
    generated_at: datetime


# -------------------------------
# DOCTOR SUGGESTIONS
# -------------------------------

class DoctorSuggestion(BaseModel):
    name: str
    specialty: str
    hospital: str
    city: str
    rating: float
    experience_years: int
    consultation_fee: int
    phone: str
    available_slots: List[str]


class DoctorSuggestionResponse(BaseModel):
    user_id: str
    message: str
    doctors: List[DoctorSuggestion]
    generated_at: datetime


# -------------------------------
# REPORT ANALYSIS (CNN OUTPUT)
# -------------------------------

class ReportAnalysisResponse(BaseModel):
    user_id: str
    report_type: str
    findings: List[str]
    explanation: str
    severity: str  # normal / mild_concern / requires_attention
    recommendations: List[str]
    analyzed_at: datetime