"""
Doctor Consultation Recommender — OSM Live + CSV Fallback
===========================================================
Triggered when Stage A/B returns HIGH_RISK or CONFIRMED_PCOS.

Primary:  Live query to OpenStreetMap Overpass API — returns real
          hospitals near the patient's coordinates, fetched at runtime.
          No API key. No cost.

Fallback: If OSM is unreachable (offline, timeout, rate-limit),
          falls back to the curated pune_hospitals.csv ranked by
          haversine distance — same behaviour as before.

Run:
    python -m consultation.recommend_doctor
"""
import math
from pathlib import Path

import pandas as pd

from .osm_hospital_search import find_nearby_hospitals

# Resolve relative to this file, not the process's working directory —
# the original "../data/pune_hospitals.csv" broke depending on where
# uvicorn/python was launched from.
HOSPITALS_CSV = Path(__file__).resolve().parent / "data" / "pune_hospitals.csv"


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi    = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)


def _csv_fallback(patient_lat: float, patient_lon: float, top_n: int) -> dict:
    """Rank static CSV by haversine when OSM is unreachable."""
    hospitals = pd.read_csv(HOSPITALS_CSV)
    hospitals["distance_km"] = hospitals.apply(
        lambda r: haversine_km(patient_lat, patient_lon, r["latitude"], r["longitude"]), axis=1
    )
    top = hospitals.sort_values("distance_km").head(top_n)
    return {
        "patient_location": {"lat": patient_lat, "lon": patient_lon},
        "search_radius_km": None,
        "source": "Static CSV fallback (OSM unavailable)",
        "hospitals": [
            {
                "name":          r["name"],
                "lat":           r["latitude"],
                "lon":           r["longitude"],
                "distance_km":   r["distance_km"],
                "address":       r["address_hint"],
                "phone":         "Not listed",
                "opening_hours": r["opd_hours"],
                "speciality":    "Gynaecology",
                "website":       None,
            }
            for _, r in top.iterrows()
        ],
        "disclaimer": (
            "Showing results from curated static list (OSM unavailable). "
            "Distances are straight-line approximations. Call ahead to confirm hours."
        ),
    }


def recommend_hospitals(patient_lat: float, patient_lon: float,
                         top_n: int = 5, radius_m: int = 5000) -> dict:
    """
    Returns top_n nearest gynaecology hospitals for the patient.
    Tries OSM live first; falls back to CSV on any network error.
    """
    try:
        result = find_nearby_hospitals(
            lat=patient_lat, lon=patient_lon,
            radius_m=radius_m, top_n=top_n
        )
        # If OSM returned zero results (e.g. sparse coverage area), fall
        # back to the curated CSV instead of showing an empty card.
        if not result["hospitals"]:
            raise ValueError("OSM returned 0 hospitals in radius")
        result["recommended_specialties"] = ["gynaecology"]
        return result
    except Exception as e:
        print(f"[OSM unavailable: {e}] — using CSV fallback")
        result = _csv_fallback(patient_lat, patient_lon, top_n)
        result["recommended_specialties"] = ["gynaecology"]
        return result


if __name__ == "__main__":
    # Demo: patient near Kothrud, Pune
    patient_lat, patient_lon = 18.5074, 73.8077
    result = recommend_hospitals(patient_lat, patient_lon, top_n=5, radius_m=5000)

    print(f"\nSource           : {result['source']}")
    print(f"Patient location : ({patient_lat}, {patient_lon})")
    print(f"\nTop {len(result['hospitals'])} nearest hospitals:\n")
    for h in result["hospitals"]:
        print(f"  {h['distance_km']:>5.2f} km  {h['name']}")
        print(f"           Address : {h['address']}")
        print(f"           Phone   : {h['phone']}")
        print(f"           Hours   : {h['opening_hours']}")
        print()
    print(f"⚠  {result['disclaimer']}")