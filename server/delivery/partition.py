from rest_framework.views import APIView
from rest_framework.response import Response
from sklearn.cluster import DBSCAN
import numpy as np

class ClusterLocations(APIView):
    def post(self, request, eps_km=1.5):
        # Expecting the payload to be a list of packages
        packages = request.data  
        
        if not isinstance(packages, list):
            return Response({"detail": "Expected a list of packages."}, status=400)

        processed_locations = []
        for package in packages:
            # Map package fields to our clustering location structure
            new_loc = {
                "address": package.get("address", ""),
                "latitude": package.get("latitude"),
                "longitude": package.get("longitude"),
                "recipient": package.get("recipient", ""),
                "recipientPhoneNumber": package.get("recipientPhoneNumber", ""),
                "deliveryDate": package.get("deliveryDate", ""),
                "weight": package.get("weight", "")
            }
            processed_locations.append(new_loc)
        
        # Ensure we have valid locations with latitude and longitude
        try:
            coords = np.array([
                [float(loc["latitude"]), float(loc["longitude"])]
                for loc in processed_locations
            ])
        except (TypeError, ValueError) as e:
            return Response({"detail": "Invalid latitude or longitude data."}, status=400)
        
        # Convert degrees to radians for the haversine metric
        coords_rad = np.radians(coords)
        
        # Earth's radius in kilometers
        earth_radius = 6371.0
        
        # Convert eps from kilometers to radians
        eps = eps_km / earth_radius
        
        # Create and fit the DBSCAN model using the haversine metric
        dbscan = DBSCAN(eps=eps, min_samples=1, metric='haversine')
        labels = dbscan.fit_predict(coords_rad)
        
        # Group processed locations by cluster label
        clusters = {}
        for label, loc in zip(labels, processed_locations):
            clusters.setdefault(int(label), []).append(loc)
        
        # Format the clusters as a list of zones
        zones = []
        for zone_label, locations in clusters.items():
            zone = {
                "zone": zone_label,
                "locations": locations
            }
            zones.append(zone)
        
        return Response(zones)
