import numpy as np
from sklearn.cluster import DBSCAN, KMeans
from .models import Truck

def cluster_locations(packages_data, driverUsernames):
    if not isinstance(packages_data, list) or not isinstance(driverUsernames, list):
        raise ValueError("Both 'packages' and 'driverUsernames' must be lists")

    if not packages_data:
        raise ValueError("No packages to cluster")
    
    if not driverUsernames:
        raise ValueError("No drivers provided")

    num_drivers = len(driverUsernames)
    
    # If only one driver, assign all packages to them
    if num_drivers == 1:
        return [{"zone": 0, "driverUsername": driverUsernames[0], "packages": packages_data}]

    # 2) Convert lat/long to arrays
    coords = np.array([[loc["latitude"], loc["longitude"]] for loc in packages_data])
    coords_rad = np.radians(coords)
    if coords_rad.size == 0:
        raise ValueError("No packages or locations to cluster. Please select drivers with available packages.")
    
    # 3) Always use KMeans with exactly num_drivers clusters for even distribution
    kmeans = KMeans(n_clusters=num_drivers, random_state=42, n_init=10)
    kmeans_labels = kmeans.fit_predict(coords)

    # 4) Create clusters
    clusters = {}
    for label, loc in zip(kmeans_labels, packages_data):
        clusters.setdefault(int(label), []).append(loc)

    # 5) Ensure we have exactly num_drivers zones
    zones = []
    for zone_label in range(num_drivers):
        packages = clusters.get(zone_label, [])
        zones.append({
            "zone": zone_label, 
            "driverUsername": driverUsernames[zone_label], 
            "packages": packages
        })

    # 6) If any zone is empty, redistribute packages more evenly
    empty_zones = [zone for zone in zones if not zone["packages"]]
    if empty_zones:
        # Find zones with many packages
        zones_with_packages = [zone for zone in zones if len(zone["packages"]) > 1]
        
        for empty_zone in empty_zones:
            if zones_with_packages:
                # Take one package from the zone with most packages
                source_zone = max(zones_with_packages, key=lambda z: len(z["packages"]))
                if len(source_zone["packages"]) > 1:
                    package_to_move = source_zone["packages"].pop()
                    empty_zone["packages"].append(package_to_move)
                    
                    # Update zones_with_packages if source zone now has only 1 package
                    if len(source_zone["packages"]) == 1:
                        zones_with_packages = [z for z in zones_with_packages if z != source_zone]

    return zones
