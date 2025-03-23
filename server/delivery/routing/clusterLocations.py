import numpy as np
from sklearn.cluster import DBSCAN, KMeans
from ..models import Truck

def clusterLocations(packagesData, driverUsernames):
    if not isinstance(packagesData, list) or not isinstance(driverUsernames, list):
        raise ValueError("Both 'packagesData' and 'driverUsernames' must be lists")

    numOfTrucks = Truck.objects.count()
    numOfDrivers = min(numOfTrucks, len(driverUsernames))

    # Step 1: Convert lat/lng to numpy array and radians
    coordinates = np.array([[pkg["latitude"], pkg["longitude"]] for pkg in packagesData])
    coordinatesRad = np.radians(coordinates)
    earthRadius = 6371.0  # in kilometers
    epsKm = 1.5
    eps = epsKm / earthRadius  # convert radius to radians

    # Step 2: Use DBSCAN for initial spatial clustering
    dbscan = DBSCAN(eps=eps, min_samples=1, metric='haversine')
    dbscanLabels = dbscan.fit_predict(coordinatesRad)

    clusters = {}
    for label, pkg in zip(dbscanLabels, packagesData):
        clusters.setdefault(int(label), []).append(pkg)

    zones = [{"zone": zoneLabel, "driverUsername": "", "locations": locations}
             for zoneLabel, locations in clusters.items()]

    # Step 3: If DBSCAN makes more clusters than we have drivers/trucks, fallback to KMeans
    if len(zones) > numOfDrivers:
        kmeans = KMeans(n_clusters=numOfDrivers, random_state=0)
        kmeansLabels = kmeans.fit_predict(coordinates)

        clusters = {}
        for label, pkg in zip(kmeansLabels, packagesData):
            clusters.setdefault(int(label), []).append(pkg)

        zones = [{"zone": zoneLabel, "driverUsername": "", "locations": locations}
                 for zoneLabel, locations in clusters.items()]

    # Step 4: Assign each zone to a driver
    for i, zone in enumerate(zones):
        if i < len(driverUsernames):
            zone["driverUsername"] = driverUsernames[i]

    return zones
