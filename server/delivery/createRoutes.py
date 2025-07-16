import requests

def create_routes(zones):
    """
    Call OSRM /trip for each zone and return per-zone routing payloads.

    IMPORTANT CLARIFICATION:
    OSRM /trip returns `waypoints` in *input* order. The optimization results
    appear in each waypoint's `waypoint_index` (visit order) and `trips_index`.
    `_extract_leg_routes()` sorts by visit order before building our internal list.
    Do NOT assume the raw OSRM `waypoints` array is visit-ordered.
    """
    if not isinstance(zones, list):
        raise ValueError("Expected a list of zones.")

    results = []
    for zone in zones:
        zone_label = zone.get("zone")
        driver_username = zone.get("driverUsername", "")
        truck_lp = zone.get("truckLicensePlate")
        locations = zone.get("locations", [])

        osrm_input = {"locations": []}
        for loc in locations:
            new_loc = {
                "name": loc.get("address", ""),
                "latitude": loc.get("latitude"),
                "longitude": loc.get("longitude"),
                "package_info": loc.get("package_info", loc),
            }
            if new_loc["latitude"] is None or new_loc["longitude"] is None:
                continue
            osrm_input["locations"].append(new_loc)

        loc_ct = len(osrm_input["locations"])
        print(f"[create_routes] zone={zone_label} loc_ct={loc_ct}")

        if loc_ct == 0:
            continue

        if loc_ct == 1:
            only = osrm_input["locations"][0]
            wp = {
                "waypoint_index": 0,
                "package_info": only.get("package_info", {}),
                "route": [],
                "location": [only["longitude"], only["latitude"]],
                "duration": 0,
                "steps": [],
            }
            results.append({
                "zone": zone_label,
                "driverUsername": driver_username,
                "truckLicensePlate": truck_lp,
                "route": [wp],
                "trip_geometry": [],
            })
            continue

        osrm_response = _get_trip_service(osrm_input)

        if osrm_response.get("error"):
            raise RuntimeError(f"OSRM HTTP/parse error for zone {zone_label}: {osrm_response}")

        if osrm_response.get("code") and osrm_response["code"] != "Ok":
            raise RuntimeError(f"OSRM returned {osrm_response['code']} for zone {zone_label}: {osrm_response}")

        try:
            trip_geom = osrm_response["trips"][0]["geometry"]["coordinates"]
        except Exception:
            trip_geom = []

        routes = _extract_leg_routes(osrm_response, osrm_input["locations"]) or []

        print("[DEBUG:OSRM_ORDER]", zone_label, [
            wp["package_info"].get("packageID") for wp in routes
        ])

        if not routes:
            print(f"[create_routes] WARNING: no per-leg routes extracted; will fall back to trip geometry only.")


        results.append({
            "zone": zone_label,
            "driverUsername": driver_username,
            "truckLicensePlate": truck_lp,
            "route": routes,
            "trip_geometry": trip_geom,
        })

    return results




def _get_trip_service(data):
    """
    Call OSRM Trip service for a *loop* (start at first coord, return to start).

    NOTE: Public OSRM demo server uses the 'driving' profile (NOT 'car').
    """
    coordinates = [f"{loc['longitude']},{loc['latitude']}" for loc in data['locations']]
    coordinates_str = ";".join(coordinates)
    profile = "driving"  # <-- FIXED
    url = (
        f"http://router.project-osrm.org/trip/v1/{profile}/{coordinates_str}"
        "?source=first&roundtrip=true"
        "&steps=true&geometries=geojson&annotations=false&overview=full"
    )
    print(f"[OSRM] GET ({len(url)} chars) {url[:200]}{'...' if len(url) > 200 else ''}")
    try:
        resp = requests.get(url, timeout=20)
    except Exception as e:
        print(f"[OSRM] REQUEST ERROR: {e}")
        return {"error": "request-failed", "exception": str(e)}

    print(f"[OSRM] HTTP status={resp.status_code} content-type={resp.headers.get('Content-Type')}")
    body_sample = resp.text[:500]
    if resp.status_code != 200:
        print(f"[OSRM] NON-200 body sample:\n{body_sample}")
        return {"error": resp.status_code, "body": body_sample}

    try:
        js = resp.json()
    except ValueError as e:
        print(f"[OSRM] JSON decode error: {e}. Body sample:\n{body_sample}")
        return {"error": "json-decode", "body": body_sample}

    print(f"[OSRM] parsed code={js.get('code')} trips={len(js.get('trips') or [])}")
    return js



def _extract_leg_routes(osrm_response, input_locations):
    """
    Extract optimized visit order + per-leg metadata from an OSRM Trip response.

    OSRM RESPONSE CONTRACT (Trip API):
    - `waypoints` array == *input order* (same order you sent coordinates).
    - Each waypoint has:
        * `waypoint_index`  -> visit position within its assigned trip (0..N-1)
        * `trips_index`     -> which trip (usually 0 unless OSRM split)
        * `location`        -> snapped [lon, lat]
    - Per-leg detail lives in `trips[TRIP].legs` (legs[i] goes from visit[i] -> visit[i+1]).

    We must:
      1. Capture the original input index (enumerate the raw waypoints list).
      2. Sort by (trips_index, waypoint_index) to get visit order.
      3. Use the *captured input index* to look up `input_locations` / package_info.
      4. Emit a list of waypoints in VISIT order.
      5. Append a synthetic closing return‑to‑factory marker (ADMIN) so downstream
         code can show a closed loop sequence if desired.

    Returns:
        list[dict] of visit-waypoint records (+ closing return marker).
    """
    trips = osrm_response.get("trips")
    waypoints = osrm_response.get("waypoints")

    if not trips or not waypoints:
        print("[_extract_leg_routes] missing trips or waypoints.")
        return None

    trip = trips[0]
    legs = trip.get("legs", [])

    # 1. Capture input index
    annotated = []
    for input_idx, wp in enumerate(waypoints):
        wi = wp.get("waypoint_index", 0)
        ti = wp.get("trips_index", 0)
        annotated.append({
            "input_idx": input_idx,
            "visit_idx": wi,
            "trip_idx": ti,
            "wp": wp,
        })

    # 2. Sort to VISIT order
    annotated.sort(key=lambda a: (a["trip_idx"], a["visit_idx"]))

    # 3. Build visit‑ordered output
    output = []
    for visit_pos, rec in enumerate(annotated):
        input_idx = rec["input_idx"]
        wp = rec["wp"]
        snapped_loc = wp.get("location", [])

        # Guard: if something went wrong, clamp
        if input_idx is None or input_idx < 0 or input_idx >= len(input_locations):
            print(f"[WARN] visit_pos={visit_pos} had bad input_idx={input_idx}; clamping to 0.")
            input_idx = 0

        pkg_info = input_locations[input_idx].get("package_info", {})

        # inbound leg (from previous visit) lives at legs[visit_pos-1]
        if visit_pos == 0:
            duration = 0
            steps = []
            leg_geom = []
        else:
            leg = legs[visit_pos - 1] if visit_pos - 1 < len(legs) else {}
            duration = leg.get("duration", 0)
            steps = leg.get("steps", [])
            # OSRM Trip legs geometry may be absent/empty; we don't rely on it
            leg_geom = []

        output.append({
            "waypoint_index": visit_pos,   # visit order for downstream display
            "input_index": input_idx,      # ORIGINAL index into input_locations
            "package_info": pkg_info,
            "route": leg_geom,
            "location": snapped_loc,
            "duration": duration,
            "steps": steps,
        })

    # 4. Append closing ADMIN return to start
    # Use the *last* leg duration (legs[-1] is from last visit back to first when roundtrip=true)
    if legs:
        closing_leg = legs[-1]
        factory_pkg = input_locations[0].get("package_info", {})  # assumes input_locations[0] = factory
        factory_wp = annotated[0]["wp"]  # visit start
        output.append({
            "waypoint_index": len(output),   # last in sequence
            "input_index": 0,
            "package_info": factory_pkg,
            "route": [],
            "location": factory_wp.get("location", []),
            "duration": closing_leg.get("duration", 0),
            "steps": closing_leg.get("steps", []),
            "_return_leg": True,
        })

    print(f"[_extract_leg_routes] produced {len(output)} waypoint records (incl. return).")
    return output