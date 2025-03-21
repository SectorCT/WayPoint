import numpy as np
from sklearn.cluster import DBSCAN, KMeans
from .models import Truck

def cluster_locations(packages_data, driverUsernames):
    if not isinstance(packages_data, list) or not isinstance(driverUsernames, list):
        raise ValueError("Both 'packages' and 'driverUsernames' must be lists")

    numOfTrucks = Truck.objects.count()
    delivers = min(numOfTrucks, len(driverUsernames))

    # 2) Convert lat/long to arrays
    coords = np.array([[loc["latitude"], loc["longitude"]] for loc in packages_data])
    coords_rad = np.radians(coords)
    earth_radius = 6371.0
    eps_km = 1.5
    eps = eps_km / earth_radius

    # 3) DBSCAN
    dbscan = DBSCAN(eps=eps, min_samples=1, metric='haversine')
    labels = dbscan.fit_predict(coords_rad)

    clusters = {}
    for label, loc in zip(labels, packages_data):
        clusters.setdefault(int(label), []).append(loc)

    zones = [{"zone": zone_label, "driverUsername": "", "locations": locations}
             for zone_label, locations in clusters.items()]

    # 4) If more zones than delivers, fall back to KMeans
    if len(zones) > delivers:
        kmeans = KMeans(n_clusters=delivers, random_state=0)
        kmeans_labels = kmeans.fit_predict(coords)

        clusters = {}
        for label, loc in zip(kmeans_labels, packages_data):
            clusters.setdefault(int(label), []).append(loc)

        zones = [{"zone": zone_label, "driverUsername": "", "locations": locations}
                 for zone_label, locations in clusters.items()]

    # 5) Assign drivers
    for i, zone in enumerate(zones):
        if i < len(driverUsernames):
            zone["driverUsername"] = driverUsernames[i]

    return zones
