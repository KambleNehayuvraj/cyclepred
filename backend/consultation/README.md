# Doctor Consultation — Integration Guide

## Install

```bash
pip install pandas
```
No other dependencies. Uses Python's built-in `urllib` for API calls.

---

## Call from your backend

```python
import sys
sys.path.insert(0, "path/to/scripts")

from api_response import get_consultation_payload

# Option A — coordinates from frontend geolocation (recommended)
payload = get_consultation_payload(
    patient_lat=18.5074,
    patient_lon=73.8077,
    radius_m=5000,  # 5 km search radius
    top_n=5,
)

# Option B — place name (Nominatim geocodes it automatically)
payload = get_consultation_payload(
    place_name="Kothrud, Pune",
    top_n=5,
)
```

---

## Response

```json
{
  "source": "OpenStreetMap (Nominatim + Overpass API) — free, no API key",
  "patient_location": { "lat": 18.5074, "lon": 73.8077 },
  "search_radius_km": 5.0,
  "recommended_specialties": ["gynaecology"],
  "hospitals": [
    {
      "name": "Deenanath Mangeshkar Hospital",
      "distance_km": 2.31,
      "address": "Erandwane, Pune",
      "phone": "+91-20-49150000",
      "opening_hours": "Mo-Sa 08:00-20:00",
      "speciality": "gynaecology",
      "website": "https://deenanath.com",
      "osm_id": 123456789
    }
  ],
  "disclaimer": "..."
}
```

---

## How location works

- **Frontend** calls `navigator.geolocation.getCurrentPosition()` in JS
- Sends `lat` and `lon` to your backend via POST
- Backend passes them to `get_consultation_payload(patient_lat, patient_lon)`

```javascript
// Frontend JS snippet
navigator.geolocation.getCurrentPosition(pos => {
  fetch("/consultation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude })
  })
  .then(r => r.json())
  .then(data => renderHospitals(data.hospitals));
});
```

```python
# Flask route
from scripts.api_response import get_consultation_payload

@app.route("/consultation", methods=["POST"])
def consultation():
    data = request.json
    payload = get_consultation_payload(
        patient_lat=data["lat"],
        patient_lon=data["lon"],
    )
    return jsonify(payload)
```

---

## APIs used (free, no key)

| API | Purpose |
|---|---|
| Overpass API | Live hospital search near coordinates |
| Nominatim | Place name → lat/lon (only if no coords) |

## Fallback

If OSM is unreachable, automatically falls back to `data/pune_hospitals.csv`
ranked by straight-line distance. No crash, no error shown to user.

---

## Files

```
doctor_consultation_only/
├── data/
│   └── pune_hospitals.csv       ← fallback hospital list
└── scripts/
    ├── api_response.py          ← CALL THIS from your backend
    ├── osm_hospital_search.py   ← Nominatim + Overpass API logic
    └── recommend_doctor.py      ← OSM primary + CSV fallback logic
```
