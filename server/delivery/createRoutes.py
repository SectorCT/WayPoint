import requests

def create_routes(zones):
    """
    Expects `zones` to be a list of dicts, where each dict includes:
        {
            "zone": ...,
            "driverUsername": ...,
            "locations": [
                { "address": "...",
                  "latitude": ...,
                  "longitude": ...,
                  "package_info": ... (optional) }
            ]
        }
    Returns a list of similar dictionaries but with a "route" field
    describing OSRM-based route segments.
    """
    if not isinstance(zones, list):
        raise ValueError("Expected a list of zones.")

    results = []
    for zone in zones:
        zone_label = zone.get("zone")
        driver_username = zone.get("driverUsername", "")
        locations = zone.get("locations", [])

        # Prepare OSRM input, storing both coordinate data & full package info
        osrm_input = {"locations": []}
        for loc in locations:
            # We'll place entire package info in the 'package_info' field
            new_loc = {
                "name": loc.get("address", ""),
                "latitude": loc.get("latitude"),
                "longitude": loc.get("longitude"),
                "package_info": loc.get("package_info", loc)  # fallback to the entire loc if not present
            }
            # Skip invalid entries
            if new_loc["latitude"] is None or new_loc["longitude"] is None:
                continue
            osrm_input["locations"].append(new_loc)

        # Skip zones with no valid locations
        if not osrm_input["locations"]:
            # Optionally: results.append(...) an empty route
            continue

        # 1) Get OSRM trip result
        osrm_response = _get_trip_service(osrm_input)

        # 2) Extract route segments, passing entire OSRM input for reference
        routes = _extract_leg_routes(osrm_response, osrm_input["locations"])

        results.append({
            "zone": zone_label,
            "driverUsername": driver_username,
            "route": routes
        })

    return results


def _get_trip_service(data):
    """
    Calls OSRM's trip service with the provided location data.
    Returns the OSRM JSON response or a dict with {'error': status_code}.
    """
    coordinates = [f"{loc['longitude']},{loc['latitude']}" for loc in data['locations']]
    coordinates_str = ";".join(coordinates)
    profile = "car"
    base_url = (
        f"http://router.project-osrm.org/trip/v1/{profile}/{coordinates_str}"
        "?steps=false&geometries=geojson&annotations=false&overview=full"
    )
    response = requests.get(base_url)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.status_code}


def _extract_leg_routes(osrm_response, input_locations):
    """
    OSRM returns "trips" with "waypoints" and "legs".
    We match them back to the user-supplied data:
      input_locations = [{"latitude": ..., "longitude": ..., "package_info": {...}}, ...]
    Then we build a route list of segments.
    """
    # If OSRM didn't return a valid trip, bail out
    if "trips" not in osrm_response or not osrm_response["trips"]:
        return None

    trip = osrm_response["trips"][0]
    coords = trip["geometry"]["coordinates"]

    def find_coord_index(target, coord_list, tol=1e-6):
        for i, c in enumerate(coord_list):
            if abs(c[0] - target[0]) < tol and abs(c[1] - target[1]) < tol:
                return i
        return None

    # OSRM waypoints contain 'waypoint_index' that maps back to the input location order
    wp_indices = []
    for wp in osrm_response.get("waypoints", []):
        # find index in coords
        idx = find_coord_index(wp["location"], coords)
        if idx is not None:
            wp_indices.append((idx, wp))
    # sort them by coordinate index to preserve path order
    wp_indices.sort(key=lambda x: x[0])

    legs = trip.get("legs", [])
    output = []

    # Build route segments
    for i, _ in enumerate(wp_indices):
        if i == 0:
            # The first waypoint
            first_wp = wp_indices[i][1]
            input_idx = first_wp.get("waypoint_index")  # OSRM's reference to input loc index

            output.append({
                "waypoint_index": 0,
                "package_info": input_locations[input_idx].get("package_info", {}) if input_idx is not None else {},
                "route": [coords[0]],
                "location": coords[0],
                "duration": 0
            })
            continue

        start_idx = wp_indices[i-1][0]
        end_idx = wp_indices[i][0]
        segment = coords[start_idx:end_idx + 1]
        leg_info = legs[i-1] if (i-1 < len(legs)) else {}
        wp = wp_indices[i][1]

        input_idx = wp.get("waypoint_index")
        pkg_info = {}
        if input_idx is not None and 0 <= input_idx < len(input_locations):
            pkg_info = input_locations[input_idx].get("package_info", {})

        output.append({
            "waypoint_index": input_idx,
            "package_info": pkg_info,
            "route": segment,
            "location": wp.get("location", []),
            "duration": leg_info.get("duration", 0)
        })

    return output
