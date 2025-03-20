import requests
from rest_framework.views import APIView
from rest_framework.response import Response

class CreateRoutes(APIView):
    """
    Accepts a JSON payload which is a list of zones.
    Each zone should be a dictionary with:
      - "zone": a zone label (can be any identifier)
      - "locations": a list of location dictionaries, where each location should have:
            "address" (or name), "latitude", and "longitude"
    
    For each zone, this view calls the OSRM trip service to compute a route,
    then extracts the leg segments and returns them as part of the zone's route.
    """

    def post(self, request, *args, **kwargs):
        zones = request.data  # Expecting a list of zones
        if not isinstance(zones, list):
            return Response({"detail": "Expected a list of zones."}, status=400)

        results = []
        for zone in zones:
            zone_label = zone.get("zone")
            locations = zone.get("locations", [])
            
            # Prepare input for OSRM: create a dictionary with key "locations"
            # OSRM requires each location to have "longitude", "latitude", and "name"
            osrm_input = {"locations": []}
            for loc in locations:
                # Map "address" to "name" if needed
                new_loc = {
                    "name": loc.get("address", ""),  # use address as name
                    "latitude": loc.get("latitude"),
                    "longitude": loc.get("longitude")
                }
                # Ensure latitude and longitude exist
                if new_loc["latitude"] is None or new_loc["longitude"] is None:
                    continue  # Skip invalid entries
                osrm_input["locations"].append(new_loc)
            
            # Skip zones with no valid locations
            if not osrm_input["locations"]:
                continue

            # Get OSRM trip result for this zone
            osrm_response = self.get_trip_service(osrm_input)
            routes = self.extract_leg_routes(osrm_response)
            
            results.append({
                "zone": zone_label,
                "routes": routes
            })

        return Response(results)

    def get_trip_service(self, data):
        """
        Calls the OSRM trip service with the provided locations.
        Constructs a URL with coordinates in the required format and returns
        the JSON response from OSRM.
        """
        # Build a list of "longitude,latitude" strings for each location
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

    def extract_leg_routes(self, osrm_response):
        """
        Processes the OSRM response to extract route segments (legs).
        It finds the indices of the waypoints in the full route coordinates
        and then extracts each segment along with its duration.
        """
        if "trips" not in osrm_response or not osrm_response["trips"]:
            return None

        trip = osrm_response["trips"][0]
        coords = trip["geometry"]["coordinates"]

        def find_coord_index(target, coords, tol=1e-6):
            for i, c in enumerate(coords):
                if abs(c[0] - target[0]) < tol and abs(c[1] - target[1]) < tol:
                    return i
            return None

        # Process waypoints: find each waypoint's index in the coordinates list
        wp_indices = []
        for wp in osrm_response.get("waypoints", []):
            idx = find_coord_index(wp["location"], coords)
            if idx is not None:
                wp_indices.append((idx, wp))
        wp_indices.sort(key=lambda x: x[0])

        legs = trip.get("legs", [])
        output = []

        for i, _ in enumerate(wp_indices):
            if i == 0:
                # First waypoint: start point of the route
                output.append({
                    "waypoint_index": 0,
                    "route": [coords[0]],
                    "location": coords[0],
                    "duration": 0
                })
                continue

            start_idx = wp_indices[i-1][0]
            end_idx = wp_indices[i][0]
            segment = coords[start_idx:end_idx + 1]
            leg_info = legs[i-1] if i-1 < len(legs) else {}
            wp = wp_indices[i][1]
            output.append({
                "waypoint_index": wp.get("waypoint_index"),
                "route": segment,
                "location": wp.get("location", []),
                "duration": leg_info.get("duration", 0)
            })

        return output
