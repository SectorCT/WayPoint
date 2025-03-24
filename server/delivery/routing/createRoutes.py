import requests

def createRoutes(zones):
    if not isinstance(zones, list):
        raise ValueError("Expected a list of zones.")

    results = []

    for zone in zones:
        zoneLabel = zone.get("zone")
        driverUsername = zone.get("driverUsername", "")
        locations = zone.get("locations", [])

        osrmInput = {"locations": []}
        for loc in locations:
            newLoc = {
                "name": loc.get("address", ""),
                "latitude": loc.get("latitude"),
                "longitude": loc.get("longitude"),
                "package_info": loc.get("package_info", loc)  # fallback if missing
            }
            if newLoc["latitude"] is None or newLoc["longitude"] is None:
                continue
            osrmInput["locations"].append(newLoc)

        if not osrmInput["locations"]:
            continue  # skip empty zones

        osrmResponse = _getTripService(osrmInput)
        routeSegments = _extractLegRoutes(osrmResponse, osrmInput["locations"])

        results.append({
            "zone": zoneLabel,
            "driverUsername": driverUsername,
            "route": routeSegments
        })

    return results


def _getTripService(data):
    """
    Calls OSRM's trip service with provided location data.
    """
    coordinates = [f"{loc['longitude']},{loc['latitude']}" for loc in data['locations']]
    coordinatesStr = ";".join(coordinates)
    profile = "car"
    baseUrl = (
        f"http://router.project-osrm.org/trip/v1/{profile}/{coordinatesStr}"
        "?steps=false&geometries=geojson&annotations=false&overview=full"
    )
    response = requests.get(baseUrl)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.status_code}


def _extractLegRoutes(osrmResponse, inputLocations):
    if "trips" not in osrmResponse or not osrmResponse["trips"]:
        return None

    trip = osrmResponse["trips"][0]
    coords = trip["geometry"]["coordinates"]

    def findCoordIndex(target, coordList, tol=1e-6):
        for i, coord in enumerate(coordList):
            if abs(coord[0] - target[0]) < tol and abs(coord[1] - target[1]) < tol:
                return i
        return None

    wpIndices = []
    for wp in osrmResponse.get("waypoints", []):
        idx = findCoordIndex(wp["location"], coords)
        if idx is not None:
            wpIndices.append((idx, wp))
    wpIndices.sort(key=lambda x: x[0])

    legs = trip.get("legs", [])
    routeOutput = []

    for i, (_, wp) in enumerate(wpIndices):
        if i == 0:
            inputIdx = wp.get("waypoint_index")
            routeOutput.append({
                "waypoint_index": 0,
                "package_info": inputLocations[inputIdx].get("package_info", {}) if inputIdx is not None else {},
                "route": [coords[0]],
                "location": coords[0],
                "duration": 0
            })
            continue

        startIdx = wpIndices[i - 1][0]
        endIdx = wpIndices[i][0]
        segment = coords[startIdx:endIdx + 1]
        legInfo = legs[i - 1] if (i - 1 < len(legs)) else {}

        inputIdx = wp.get("waypoint_index")
        packageInfo = {}
        if inputIdx is not None and 0 <= inputIdx < len(inputLocations):
            packageInfo = inputLocations[inputIdx].get("package_info", {})

        routeOutput.append({
            "waypoint_index": inputIdx,
            "package_info": packageInfo,
            "route": segment,
            "location": wp.get("location", []),
            "duration": legInfo.get("duration", 0)
        })

    return routeOutput
