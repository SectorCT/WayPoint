import numpy as np
from sklearn.cluster import DBSCAN
import json

def cluster_locations(data, eps_km=1.5):
    """
    Cluster locations using DBSCAN based on their latitude and longitude.

    Parameters:
      data (dict): A dictionary with key "locations", where the value is a list of locations.
                   Each location should be a dict containing at least "latitude" and "longitude".
      eps_km (float): Distance threshold in kilometers for clustering.

    Returns:
      list: A list of zones. Each zone is a dict with a "zone" key (cluster label)
            and "locations" key (list of locations belonging to that cluster).
    """
    # Extract coordinates and convert to a NumPy array
    coords = np.array([[loc["latitude"], loc["longitude"]] for loc in data.get("locations", [])])
    
    # Convert degrees to radians for the haversine metric
    coords_rad = np.radians(coords)
    
    # Earth's radius in kilometers
    earth_radius = 6371.0
    
    # Convert eps from kilometers to radians
    eps = eps_km / earth_radius
    
    # Create and fit the DBSCAN model using the haversine metric
    dbscan = DBSCAN(eps=eps, min_samples=1, metric='haversine')
    labels = dbscan.fit_predict(coords_rad)
    
    # Group locations by cluster label, converting labels to native integers
    clusters = {}
    for label, loc in zip(labels, data.get("locations", [])):
        clusters.setdefault(int(label), []).append(loc)
    
    # Build the zones list with each zone represented as a JSON-like dict
    zones = []
    for zone_label, locations in clusters.items():
        zone = {
            "zone": zone_label,
            "locations": locations
        }
        zones.append(zone)
    
    return zones

# Example usage:
if __name__ == "__main__":
    # Example JSON data with locations
    data = {
        "locations": [
            {"name": "Alexander Nevsky Cathedral", "latitude": 42.6957, "longitude": 23.3320},
            {"name": "Vitosha Boulevard", "latitude": 42.6875, "longitude": 23.3190},
            {"name": "National Palace of Culture", "latitude": 42.6858, "longitude": 23.3189},
            {"name": "South Park", "latitude": 42.6662, "longitude": 23.3103},
            {"name": "Borisova Gradina", "latitude": 42.6861, "longitude": 23.3390},
            {"name": "Sofia University", "latitude": 42.6934, "longitude": 23.3340},
            {"name": "Serdika Center", "latitude": 42.6968, "longitude": 23.3483},
            {"name": "Boyana Church", "latitude": 42.6443, "longitude": 23.2666},
            {"name": "Sofia Zoo", "latitude": 42.6521, "longitude": 23.3314},
            {"name": "Lions' Bridge", "latitude": 42.7054, "longitude": 23.3217},
            {"name": "Mladost 1 Metro Station", "latitude": 42.6561, "longitude": 23.3775},
            {"name": "Mladost 2 Park", "latitude": 42.6552, "longitude": 23.3797},
            {"name": "Mladost 4 Business Park", "latitude": 42.6257, "longitude": 23.3771},
            {"name": "Lozenets Residential Area", "latitude": 42.6775, "longitude": 23.3199},
            {"name": "Lozenets Park", "latitude": 42.6758, "longitude": 23.3211},
            {"name": "Druzhba Lake", "latitude": 42.6613, "longitude": 23.3892},
            {"name": "Druzhba 2 Park", "latitude": 42.6632, "longitude": 23.3875},
            {"name": "Oborishte Park", "latitude": 42.6992, "longitude": 23.3398},
            {"name": "Studentski Grad Central Area", "latitude": 42.6483, "longitude": 23.3447},
            {"name": "Studentski Grad Park", "latitude": 42.6468, "longitude": 23.3469},
            {"name": "Ovcha Kupel Metro Station", "latitude": 42.6725, "longitude": 23.2719},
            {"name": "Ovcha Kupel Park", "latitude": 42.6708, "longitude": 23.2745}
        ]
    }
    
    zones = cluster_locations(data, eps_km=1.5)
    print(json.dumps(zones, indent=2))
