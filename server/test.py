import requests

# Factory first (example factory coord), then the 7 stops from your list (lon, lat)
coords = [
    (-122.0841, 37.4220),  # Factory (Google HQ, keep as start)
    (23.3064, 42.7245),  # бул. Захари Стоянов 20
    (23.2985, 42.7333),  # ул. 302-ра 15
    (23.2934, 42.7300),  # бул. Царица Йоанна 90
    (23.3091, 42.7398),  # ул. 302-ра 10
    (23.2968, 42.7376),  # бул. Захари Стоянов 15
    (23.3044, 42.7362),  # ул. Добринова скала 34
    (23.3004, 42.7252),  # ул. Ген. Асен Николов 10
]

coord_str = ";".join(f"{lon},{lat}" for lon, lat in coords)
url = (
    f"http://router.project-osrm.org/trip/v1/driving/{coord_str}"
    "?source=first&roundtrip=true"
    "&steps=true&geometries=geojson&annotations=false&overview=full"
)

print("GET:", url)
r = requests.get(url, timeout=20)
r.raise_for_status()
js = r.json()

print("OSRM code:", js.get("code"))

# --- Extract optimized order from OSRM Trip response ---
waypoints = js.get("waypoints", [])

# Defensive: some OSRM builds omit trips_index when there's only one trip; default to 0
def _trip_idx(wp):
    return wp.get("trips_index", 0)

def _wp_idx(wp):
    # waypoint_index is required in Trip API; but be safe
    return wp.get("waypoint_index", 0)

# Sort waypoints by (trip, waypoint order)
wps_sorted = sorted(waypoints, key=lambda w: (_trip_idx(w), _wp_idx(w)))

print("\nOptimized visit order:")
optimized_coords = []
for visit_num, wp in enumerate(wps_sorted):
    input_idx = wp.get("input_index")
    lon, lat = wp.get("location")  # OSRM gives [lon, lat]
    print(f"{visit_num:2d}: input_idx={input_idx}  lon={lon:.6f}  lat={lat:.6f}")
    optimized_coords.append((lon, lat, input_idx))

# If you want *just* lon/lat in visit order:
optimized_lonlats = [(lon, lat) for lon, lat, _ in optimized_coords]

# If you want to close the loop explicitly (factory start=end), append first coord:
if optimized_lonlats and optimized_lonlats[0] != optimized_lonlats[-1]:
    optimized_lonlats.append(optimized_lonlats[0])
