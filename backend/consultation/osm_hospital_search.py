"""
OpenStreetMap Hospital Search (No API Key Required)
=====================================================
Uses two FREE OpenStreetMap APIs:

  1. Nominatim  — geocodes a place name / address → (lat, lon)
                  https://nominatim.openstreetmap.org/search
                  (used only if patient sends a place name instead of coords)

  2. Overpass API — queries live OSM map data for hospitals/clinics
                    near the patient's coordinates
                    https://overpass-api.de/api/interpreter
                    (main search engine — fetches real nodes tagged as
                     hospital / clinic / gynaecology within a radius)

Both are completely free, no sign-up, no API key.
OSM usage policy: max 1 request/sec, identify your app via User-Agent.

How it fits into the project:
  recommend_doctor.py  previously ranked a static CSV by haversine distance.
  Now osm_hospital_search.py replaces that CSV lookup with a live OSM call,
  returning real nearby hospitals. The static CSV is kept as a fallback if
  the OSM API is unreachable.

Run:
    python osm_hospital_search.py          # demo: Kothrud, Pune
    python osm_hospital_search.py --lat 18.5074 --lon 73.8077 --radius 5000
"""

import argparse
import json
import math
import time
import urllib.error
import urllib.parse
import urllib.request

# ── constants ──────────────────────────────────────────────────────────────────
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URL  = "https://overpass-api.de/api/interpreter"

# Identify the app to OSM (required by usage policy)
USER_AGENT = "PCOS-WellnessApp/1.0 (educational project; contact: your@email.com)"

DEFAULT_RADIUS_M = 5000   # 5 km default search radius
MAX_RESULTS      = 10
REQUEST_TIMEOUT  = 10     # seconds


# ── helpers ────────────────────────────────────────────────────────────────────
def _get(url: str, params: dict = None) -> dict:
    """Simple GET with JSON response. No third-party libs needed."""
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
        return json.loads(resp.read().decode())


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi   = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)


# ── 1. Nominatim geocoder ──────────────────────────────────────────────────────
def geocode_place(place_name: str) -> tuple[float, float]:
    """
    Convert a human-readable address / place name → (lat, lon).

    Example:
        lat, lon = geocode_place("Kothrud, Pune")
    """
    time.sleep(1)   # respect 1 req/sec rate limit
    results = _get(NOMINATIM_URL, {
        "q": place_name,
        "format": "json",
        "limit": 1,
        "addressdetails": 0,
    })
    if not results:
        raise ValueError(f"Nominatim could not geocode: '{place_name}'")
    lat = float(results[0]["lat"])
    lon = float(results[0]["lon"])
    return lat, lon


# ── 2. Overpass hospital search ────────────────────────────────────────────────
def _build_overpass_query(lat: float, lon: float, radius_m: int) -> str:
    """
    Overpass QL query that fetches nodes/ways tagged as:
      - amenity = hospital
      - amenity = clinic
      - healthcare = hospital
      - healthcare:speciality = gynaecology  (OSM tag for specialist clinics)

    Returns all four in one round-trip.
    """
    return f"""
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:{radius_m},{lat},{lon});
  way["amenity"="hospital"](around:{radius_m},{lat},{lon});
  node["amenity"="clinic"](around:{radius_m},{lat},{lon});
  node["healthcare"="hospital"](around:{radius_m},{lat},{lon});
  node["healthcare:speciality"="gynaecology"](around:{radius_m},{lat},{lon});
);
out center tags;
""".strip()


def search_hospitals_osm(lat: float, lon: float,
                          radius_m: int = DEFAULT_RADIUS_M,
                          top_n: int = MAX_RESULTS) -> list[dict]:
    """
    Query Overpass API for hospitals/clinics near (lat, lon).
    Returns a list of dicts sorted by distance, up to top_n results.

    Each result dict contains:
        name, lat, lon, distance_km, address, phone, opening_hours,
        speciality, osm_id, osm_type
    """
    query = _build_overpass_query(lat, lon, radius_m)

    # Overpass needs a POST with the query in the body
    data = urllib.parse.urlencode({"data": query}).encode()
    req  = urllib.request.Request(
        OVERPASS_URL, data=data,
        headers={"User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded"}
    )
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
        raw = json.loads(resp.read().decode())

    elements = raw.get("elements", [])
    hospitals = []

    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name") or tags.get("name:en") or tags.get("operator")
        if not name:
            continue  # skip unnamed nodes

        # For ways Overpass returns a "center" key with lat/lon
        if el["type"] == "way":
            h_lat = el.get("center", {}).get("lat", lat)
            h_lon = el.get("center", {}).get("lon", lon)
        else:
            h_lat = el.get("lat", lat)
            h_lon = el.get("lon", lon)

        # Build a human-readable address from OSM addr:* tags
        addr_parts = [
            tags.get("addr:housenumber", ""),
            tags.get("addr:street", ""),
            tags.get("addr:suburb", "") or tags.get("addr:neighbourhood", ""),
            tags.get("addr:city", ""),
        ]
        address = ", ".join(p for p in addr_parts if p) or "Address not listed in OSM"

        hospitals.append({
            "name":          name,
            "lat":           h_lat,
            "lon":           h_lon,
            "distance_km":   haversine_km(lat, lon, h_lat, h_lon),
            "address":       address,
            "phone":         tags.get("phone") or tags.get("contact:phone") or "Not listed",
            "opening_hours": tags.get("opening_hours") or "Not listed in OSM — call ahead",
            "speciality":    tags.get("healthcare:speciality") or tags.get("medical_system") or "General / Multispecialty",
            "website":       tags.get("website") or tags.get("contact:website") or None,
            "osm_id":        el.get("id"),
            "osm_type":      el.get("type"),
        })

    # Deduplicate by name (same hospital may appear as node + way)
    seen = set()
    unique = []
    for h in hospitals:
        key = h["name"].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(h)

    return sorted(unique, key=lambda x: x["distance_km"])[:top_n]


# ── 3. Combined function (geocode + search) ────────────────────────────────────
def find_nearby_hospitals(lat: float = None, lon: float = None,
                           place_name: str = None,
                           radius_m: int = DEFAULT_RADIUS_M,
                           top_n: int = 5) -> dict:
    """
    Main entry point. Accepts either:
      - lat + lon  (from browser navigator.geolocation — preferred)
      - place_name (geocoded via Nominatim as fallback)

    Returns:
        {
          "patient_location": {"lat": ..., "lon": ...},
          "search_radius_km": ...,
          "source": "OpenStreetMap Overpass API",
          "hospitals": [ ... sorted by distance ... ],
          "disclaimer": "..."
        }
    """
    if lat is None or lon is None:
        if not place_name:
            raise ValueError("Provide either (lat, lon) or place_name")
        lat, lon = geocode_place(place_name)

    hospitals = search_hospitals_osm(lat, lon, radius_m=radius_m, top_n=top_n)

    return {
        "patient_location": {"lat": lat, "lon": lon},
        "search_radius_km": radius_m / 1000,
        "source": "OpenStreetMap (Nominatim + Overpass API) — free, no API key",
        "hospitals": hospitals,
        "disclaimer": (
            "Results are fetched live from OpenStreetMap community data. "
            "OSM coverage varies — not all hospitals may be listed. "
            "Opening hours shown only where contributors have added them; "
            "always call ahead to confirm. Distances are straight-line (not driving distance)."
        ),
    }


# ── CLI demo ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--lat",    type=float, default=18.5074)
    parser.add_argument("--lon",    type=float, default=73.8077)
    parser.add_argument("--place",  type=str,   default=None,
                        help="Place name to geocode (used if --lat/--lon not given)")
    parser.add_argument("--radius", type=int,   default=5000,
                        help="Search radius in metres (default 5000)")
    parser.add_argument("--top",    type=int,   default=5)
    args = parser.parse_args()

    result = find_nearby_hospitals(
        lat=args.lat, lon=args.lon,
        place_name=args.place,
        radius_m=args.radius,
        top_n=args.top,
    )

    print(f"\nPatient location : ({result['patient_location']['lat']}, {result['patient_location']['lon']})")
    print(f"Search radius    : {result['search_radius_km']} km")
    print(f"Source           : {result['source']}")
    print(f"\nTop {len(result['hospitals'])} nearest hospitals/clinics:\n")
    for h in result["hospitals"]:
        print(f"  {h['distance_km']:>5.2f} km  {h['name']}")
        print(f"           Address  : {h['address']}")
        print(f"           Phone    : {h['phone']}")
        print(f"           Hours    : {h['opening_hours']}")
        print(f"           Speciality: {h['speciality']}")
        if h["website"]:
            print(f"           Website  : {h['website']}")
        print()
    print(f"⚠  {result['disclaimer']}")