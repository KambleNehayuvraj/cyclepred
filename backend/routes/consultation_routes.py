from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from consultation.api_response import get_consultation_payload

router = APIRouter(prefix="/consultation", tags=["consultation"])


class ConsultationRequest(BaseModel):
    lat: Optional[float] = None
    lon: Optional[float] = None
    place_name: Optional[str] = None
    radius_m: int = 5000
    top_n: int = 5


# Triggered from the frontend's HighRiskPage once Stage A/B comes back
# HIGH_RISK or CONFIRMED_PCOS. No auth dependency — purely a location ->
# nearby-hospitals lookup, doesn't touch the user's health record.
@router.post("/nearby")
def get_nearby_consultation(body: ConsultationRequest):
    if body.lat is None and body.lon is None and not body.place_name:
        raise HTTPException(
            status_code=400,
            detail="Provide either (lat, lon) or place_name.",
        )
    try:
        return get_consultation_payload(
            patient_lat=body.lat,
            patient_lon=body.lon,
            place_name=body.place_name,
            top_n=body.top_n,
            radius_m=body.radius_m,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Consultation lookup failed: {str(e)}")