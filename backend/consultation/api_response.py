"""
Frontend-Ready Output for Doctor Consultation
==============================================
Call this from your FastAPI route when Stage A/B returns HIGH_RISK or
CONFIRMED_PCOS.

patient_lat / patient_lon come from the browser's navigator.geolocation
API on your frontend (no need for backend geocoding).

Optionally pass place_name (e.g. "Kothrud, Pune") if coordinates are
not available — Nominatim will geocode it for free.

Returns clean JSON for the frontend's hospital recommendation card,
with real live data from OpenStreetMap (CSV fallback if offline).
"""
import json

from .recommend_doctor import recommend_hospitals
from .osm_hospital_search import geocode_place


def get_consultation_payload(patient_lat: float = None,
                              patient_lon: float = None,
                              place_name: str = None,
                              top_n: int = 5,
                              radius_m: int = 5000) -> dict:
    """
    Parameters
    ----------
    patient_lat, patient_lon : from browser navigator.geolocation (preferred)
    place_name               : fallback if no coords — e.g. "Kothrud, Pune"
    top_n                    : number of hospitals to return (default 5)
    radius_m                 : OSM search radius in metres (default 5000 = 5 km)

    Returns
    -------
    JSON-serialisable dict with:
        source, patient_location, search_radius_km,
        recommended_specialties, hospitals[], disclaimer
    """
    # Geocode place name to coords if needed
    if (patient_lat is None or patient_lon is None) and place_name:
        patient_lat, patient_lon = geocode_place(place_name)

    if patient_lat is None or patient_lon is None:
        raise ValueError("Provide either (patient_lat, patient_lon) or place_name")

    result = recommend_hospitals(
        patient_lat=patient_lat,
        patient_lon=patient_lon,
        top_n=top_n,
        radius_m=radius_m,
    )

    return {
        "source":                  result["source"],
        "patient_location":        result["patient_location"],
        "search_radius_km":        result.get("search_radius_km"),
        "recommended_specialties": result["recommended_specialties"],
        "hospitals": [
            {
                "name":          h["name"],
                "lat":           h.get("lat"),
                "lon":           h.get("lon"),
                "distance_km":   h["distance_km"],
                "address":       h["address"],
                "phone":         h["phone"],
                "opening_hours": h["opening_hours"],
                "speciality":    h.get("speciality", "Gynaecology"),
                "website":       h.get("website"),
                "osm_id":        h.get("osm_id"),
            }
            for h in result["hospitals"]
        ],
        "disclaimer": result["disclaimer"],
    }


if __name__ == "__main__":
    payload = get_consultation_payload(
        patient_lat=18.5074,
        patient_lon=73.8077,
        radius_m=5000,
        top_n=5,
    )
    print(json.dumps(payload, indent=2))