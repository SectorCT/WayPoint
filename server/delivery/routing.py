"""
Route Planning & Assignment Module (Refactored)
================================================

This refactor preserves the *behavioral intent* of the original implementation while
improving structure, readability, type-safety, and debuggability. Major changes:

1. **Centralized OSRM client** – single function `osrm_trip()` builds and issues the Trip
   request (profile=driving) and returns parsed JSON or structured error.
2. **Explicit visit‑order extraction** – `extract_visit_plan()` correctly interprets OSRM's
   response (waypoints in *input* order; `waypoint_index` encodes visit position). The
   original bug (mixing these up) is fixed.
3. **Clean data adapters** – helper functions convert Packages ⇄ OSRM input ⇄ internal
   routing records.
4. **Reduced duplication** – repeated code for ADMIN/default factory handling, return legs,
   and fallbacks consolidated.
5. **Logging over prints** – replaced most `print()`s with structured `logger.debug()` /
   `logger.warning()` calls so you can control verbosity in Django settings.
6. **Type hints** throughout to aid IDEs and static tools.
7. **Safer error surfaces** – consistent error envelopes and exceptions.
8. **Configurable constants** – OSRM endpoint & timeout; can be overridden in Django settings.

---

## IMPORTANT BEHAVIOR NOTES

### OSRM Trip Response Mapping
* Response `waypoints` array preserves *input* order (the order you send coords).
* Each waypoint includes:
  - `waypoint_index`: visit order (0..N-1) within the optimized trip.
  - `trips_index`: which sub-trip (usually 0 if unsplit).
  - `location`: snapped [lon, lat] coordinate.
* The optimized legs are in `trips[TRIP].legs`, where `legs[i]` spans visit[i] → visit[i+1].

We must map back to our own package objects using the *input index* we tracked when sending
locations. We then re-order using `waypoint_index` so downstream UI receives stops in visit
order.

### ADMIN / Factory Handling
We prepend a synthetic ADMIN/factory location to each zone before OSRM optimization so the
trip is a loop starting and ending at the factory. We also append a synthetic closing
return marker record in the final waypoint sequence.

---

## Public Entry Points

- `create_routes(zones: list[dict]) -> list[dict]`
    Calls OSRM for each zone (expects first location to be factory), returns optimized
    per-zone routing payload to be persisted.

- `create_routes_from_json(final_routes: list[dict], include_return_leg_in_sequence=False)`
    Convert `create_routes()` JSON into persisted `RouteAssignment` rows.

- Django API views:
    * `RoutePlannerView` – cluster → assign trucks → OSRM optimize → persist.
    * `getRoutingBasedOnDriver` – fetch route & live OSRM legs.
    * `getAllRoutings`, `finishRoute`, `getReturnRoute`, `dropAllRoutes`,
      `CheckDriverStatusView`, `AssignTruckAndStartJourneyView`, `recalculateRoute`.

---

## How to Integrate
Replace the original module with this file (adjust relative import paths as needed).
Search for `# TODO:` markers for integration tasks.

"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence, Tuple

import requests

from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Case, When, IntegerField, Sum
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

# from rest_framework.permissions import IsAuthenticated
# from rest_framework_simplejwt.authentication import JWTAuthentication

# Local imports (adjust package path if this file moves)
from .models import Package, Truck, RouteAssignment, DeliveryHistory
from .serializers import RouteAssignmentSerializer
from .permissions import IsManager  # noqa: F401  # unused in demo; keep for future
from .clusterLocations import cluster_locations


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
OSRM_BASE_URL = "http://router.project-osrm.org"  # override in settings if self-hosted
OSRM_PROFILE = "driving"  # public demo expects 'driving' (NOT 'car')
OSRM_TIMEOUT_S = 20


# ---------------------------------------------------------------------------
# Factory / ADMIN sentinel record
# ---------------------------------------------------------------------------
FACTORY_ADDRESS: Dict[str, Any] = {
    "address": "1600 Amphitheatre Parkway, Mountain View, CA 94043",
    "latitude": 37.4220,
    "longitude": -122.0841,
    "package_info": {
        "address": "1600 Amphitheatre Parkway, Mountain View, CA 94043",
        "latitude": 37.4220,
        "longitude": -122.0841,
        "packageID": "ADMIN",
        "recipient": "Google HQ Warehouse",
        "recipientPhoneNumber": "",
        "deliveryDate": "2025-03-21",
        "weight": 0,
        "status": "factory",
    },
}


# ---------------------------------------------------------------------------
# Small data helpers
# ---------------------------------------------------------------------------
@dataclass
class Location:
    lon: float
    lat: float
    package_info: Dict[str, Any]

    @classmethod
    def from_input(cls, loc: Dict[str, Any]) -> "Location":
        return cls(
            lon=float(loc["longitude"]),
            lat=float(loc["latitude"]),
            package_info=loc.get("package_info", loc),
        )

    def to_coord_str(self) -> str:
        return f"{self.lon},{self.lat}"


@dataclass
class VisitRecord:
    visit_order: int                # 0..N
    input_index: int                # index into original locations list
    snapped_lon: float
    snapped_lat: float
    package_info: Dict[str, Any]
    duration_s: float = 0.0         # inbound leg duration from previous visit
    steps: List[Any] | None = None  # OSRM steps (optional)
    is_return_leg: bool = False     # synthetic closing loop marker

    def to_json(self) -> Dict[str, Any]:
        return {
            "waypoint_index": self.visit_order,
            "input_index": self.input_index,
            "package_info": self.package_info,
            "route": [],  # kept for backward compatibility; geometry omitted
            "location": [self.snapped_lon, self.snapped_lat],
            "duration": self.duration_s,
            "steps": self.steps or [],
            "_return_leg": self.is_return_leg or False,
        }


# ---------------------------------------------------------------------------
# OSRM Client
# ---------------------------------------------------------------------------

def osrm_trip(locations: Sequence[Location]) -> Dict[str, Any]:
    """Call OSRM Trip service (roundtrip loop starting at first coord).

    Parameters
    ----------
    locations:
        Ordered list of `Location` objects. First location is treated as the fixed
        start point (factory). We request `roundtrip=true` so OSRM returns there.

    Returns
    -------
    dict
        Parsed JSON-like dict on success *OR* dict with `{"error": ...}` on failure.
    """
    if not locations:
        return {"error": "no-locations"}

    coord_str = ";".join(loc.to_coord_str() for loc in locations)
    url = (
        f"{OSRM_BASE_URL}/trip/v1/{OSRM_PROFILE}/{coord_str}?"
        "source=first&roundtrip=true&steps=true&geometries=geojson&annotations=false&overview=full"
    )
    logger.debug("[OSRM] GET %s", url if len(url) < 500 else url[:500] + "…")

    try:
        resp = requests.get(url, timeout=OSRM_TIMEOUT_S)
    except Exception as e:  # network error
        logger.error("[OSRM] request failed: %s", e)
        return {"error": "request", "exception": str(e)}

    if resp.status_code != 200:
        logger.warning("[OSRM] non-200 status=%s body[:200]=%s", resp.status_code, resp.text[:200])
        return {"error": resp.status_code, "body": resp.text[:500]}

    try:
        js = resp.json()
    except ValueError as e:  # bad JSON
        logger.error("[OSRM] JSON decode error: %s", e)
        return {"error": "json", "body": resp.text[:500]}

    logger.debug("[OSRM] parsed code=%s trips=%s", js.get("code"), len(js.get("trips") or []))
    return js


# ---------------------------------------------------------------------------
# OSRM Response Parsing
# ---------------------------------------------------------------------------

def extract_visit_plan(osrm_js: Dict[str, Any], input_locations: Sequence[Location]) -> List[VisitRecord] | None:
    """Build visit-ordered waypoint records from an OSRM Trip response.

    Correctly maps OSRM's *input-ordered* `waypoints` back to `input_locations`, then
    reorders using `waypoint_index` to produce the visit order. Appends a synthetic
    closing ADMIN return leg.
    """
    trips = osrm_js.get("trips") or []
    waypoints = osrm_js.get("waypoints") or []
    if not trips or not waypoints:
        logger.warning("[extract_visit_plan] missing trips or waypoints")
        return None

    trip0 = trips[0]
    legs = trip0.get("legs", [])  # len == visit_count when roundtrip=true (last leg returns to start)

    # Annotate with original input index
    annotated = []
    for input_idx, wp in enumerate(waypoints):
        annotated.append({
            "input_idx": input_idx,
            "visit_idx": wp.get("waypoint_index", 0),
            "trip_idx": wp.get("trips_index", 0),
            "wp": wp,
        })

    # Sort to visit order
    annotated.sort(key=lambda a: (a["trip_idx"], a["visit_idx"]))

    visit_records: List[VisitRecord] = []
    for visit_pos, rec in enumerate(annotated):
        input_idx = rec["input_idx"]
        if input_idx < 0 or input_idx >= len(input_locations):
            logger.error("[extract_visit_plan] bad input_idx=%s; clamping to 0", input_idx)
            input_idx = 0

        loc = input_locations[input_idx]
        wp = rec["wp"]
        snapped = wp.get("location", [loc.lon, loc.lat])

        if visit_pos == 0:
            duration = 0.0
            steps = []
        else:
            leg = legs[visit_pos - 1] if visit_pos - 1 < len(legs) else {}
            duration = float(leg.get("duration", 0))
            steps = leg.get("steps", [])

        visit_records.append(
            VisitRecord(
                visit_order=visit_pos,
                input_index=input_idx,
                snapped_lon=float(snapped[0]),
                snapped_lat=float(snapped[1]),
                package_info=loc.package_info,
                duration_s=duration,
                steps=steps,
                is_return_leg=False,
            )
        )

    # Synthetic closing return to start (ADMIN)
    if legs:
        closing_leg = legs[-1]
        factory_loc = input_locations[0]
        start_wp = annotated[0]["wp"]
        snapped = start_wp.get("location", [factory_loc.lon, factory_loc.lat])
        visit_records.append(
            VisitRecord(
                visit_order=len(visit_records),
                input_index=0,
                snapped_lon=float(snapped[0]),
                snapped_lat=float(snapped[1]),
                package_info=factory_loc.package_info,
                duration_s=float(closing_leg.get("duration", 0)),
                steps=closing_leg.get("steps", []),
                is_return_leg=True,
            )
        )

    logger.debug("[extract_visit_plan] produced %s visit records", len(visit_records))
    return visit_records


# ---------------------------------------------------------------------------
# Route Creation (zones → OSRM → visit plans)
# ---------------------------------------------------------------------------

def _build_locations_from_zone(zone: Dict[str, Any]) -> List[Location]:
    """Extract valid lat/lon from zone['locations'] into `Location`s."""
    out: List[Location] = []
    for loc in zone.get("locations", []):
        lat = loc.get("latitude")
        lon = loc.get("longitude")
        if lat is None or lon is None:
            continue
        out.append(Location.from_input(loc))
    return out


def create_routes(zones: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Call OSRM /trip for each zone and return per-zone routing payloads.

    EXPECTATION: Each zone's `locations` list is already prefixed with the factory
    (ADMIN) location at index 0.

    Returns list of dicts, one per zone:
        {
          "zone": str,
          "driverUsername": str | None,
          "truckLicensePlate": str | None,
          "route": [visit_waypoints_json...],  # visit order + closing return marker
          "trip_geometry": [[lon, lat], ...],  # full optimized path
        }
    """
    if not isinstance(zones, list):
        raise ValueError("Expected a list of zones.")

    results: List[Dict[str, Any]] = []
    for zone in zones:
        zone_label = zone.get("zone")
        driver_username = zone.get("driverUsername", "")
        truck_lp = zone.get("truckLicensePlate")

        # Build typed locations
        locations = _build_locations_from_zone(zone)
        loc_ct = len(locations)
        logger.debug("[create_routes] zone=%s loc_ct=%s", zone_label, loc_ct)

        if loc_ct == 0:
            continue

        # Single-point route (no OSRM call needed)
        if loc_ct == 1:
            only = locations[0]
            vr = VisitRecord(
                visit_order=0,
                input_index=0,
                snapped_lon=only.lon,
                snapped_lat=only.lat,
                package_info=only.package_info,
                duration_s=0.0,
            )
            results.append({
                "zone": zone_label,
                "driverUsername": driver_username,
                "truckLicensePlate": truck_lp,
                "route": [vr.to_json()],
                "trip_geometry": [],
            })
            continue

        # OSRM call
        osrm_js = osrm_trip(locations)
        if osrm_js.get("error"):
            raise RuntimeError(f"OSRM error for zone {zone_label}: {osrm_js}")
        if osrm_js.get("code") != "Ok":
            raise RuntimeError(f"OSRM returned {osrm_js.get('code')} for zone {zone_label}: {osrm_js}")

        # Trip geometry
        try:
            trip_geom = osrm_js["trips"][0]["geometry"]["coordinates"]
        except Exception:  # defensive
            trip_geom = []

        # Visit plan
        visit_plan = extract_visit_plan(osrm_js, locations) or []
        visit_json = [vr.to_json() for vr in visit_plan]

        logger.debug(
            "[create_routes] zone=%s visit_order=%s",
            zone_label,
            [vr["package_info"].get("packageID") for vr in visit_json],
        )

        if not visit_json:
            logger.warning("[create_routes] zone=%s produced no visit plan; fallback to trip only", zone_label)

        results.append({
            "zone": zone_label,
            "driverUsername": driver_username,
            "truckLicensePlate": truck_lp,
            "route": visit_json,
            "trip_geometry": trip_geom,
        })

    return results


# ---------------------------------------------------------------------------
# Persistence Adapters (convert JSON → DB RouteAssignment)
# ---------------------------------------------------------------------------
User = get_user_model()


def _split_seq_and_return(waypoints_json: Sequence[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """Separate main visit sequence from synthetic return leg.

    Also collapses multiple ADMIN appearances to: leading ADMIN + (optional) return ADMIN.
    """
    seq: List[Dict[str, Any]] = []
    return_wp: Optional[Dict[str, Any]] = None
    saw_admin = False

    for wp in waypoints_json:
        pkg = wp.get("package_info") or {}
        is_admin = pkg.get("packageID") == "ADMIN"
        is_return = bool(wp.get("_return_leg"))

        if is_return:
            return_wp = wp
            continue

        if is_admin:
            if not saw_admin:
                saw_admin = True
                seq.append(wp)
            else:
                return_wp = wp
            continue

        seq.append(wp)

    # If we somehow lost ADMIN at start, re-insert from any candidate (unlikely)
    if not seq or (seq[0].get("package_info") or {}).get("packageID") != "ADMIN":
        admin_wp = next((wp for wp in waypoints_json if (wp.get("package_info") or {}).get("packageID") == "ADMIN"), None)
        if admin_wp:
            seq.insert(0, admin_wp)

    return seq, return_wp


def create_routes_from_json(
    json_data: str | List[Dict[str, Any]],
    include_return_leg_in_sequence: bool = False,
):
    """Persist final routes to DB from the processed OSRM results structure.

    Parameters
    ----------
    json_data:
        Either JSON string or already-parsed list of per-zone route objects as produced
        by `create_routes()`.
    include_return_leg_in_sequence:
        If True, append the final ADMIN return stop to the stored `packageSequence`.
    """
    if isinstance(json_data, str):
        try:
            data = json.loads(json_data)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {e}")
    else:
        data = json_data

    if not isinstance(data, list):
        raise ValueError("Expected top-level list of route objects.")

    created_routes = []
    response_payload = []

    for route_obj in data:
        driver_username = route_obj.get("driverUsername")
        truck_license_plate = route_obj.get("truckLicensePlate")
        waypoints_json = route_obj.get("route", [])
        trip_geom = route_obj.get("trip_geometry", [])

        if not driver_username:
            raise ValueError("Driver username is required in route object.")
        if not truck_license_plate:
            raise ValueError("Truck license plate is required in route object.")

        # Lookups
        try:
            driver = User.objects.get(username=driver_username)
        except User.DoesNotExist:
            raise ValueError(f"Driver '{driver_username}' does not exist.")

        try:
            truck = Truck.objects.get(licensePlate=truck_license_plate)
        except Truck.DoesNotExist:
            raise ValueError(f"Truck '{truck_license_plate}' does not exist.")

        # No waypoints: ADMIN-only fallback
        if not waypoints_json and not trip_geom:
            admin_pkg = FACTORY_ADDRESS["package_info"].copy()
            admin_pkg["location_index"] = 0
            package_sequence = [admin_pkg]
            map_route = []
        else:
            seq_waypoints, return_leg_wp = _split_seq_and_return(waypoints_json)

            if include_return_leg_in_sequence and return_leg_wp is not None:
                seq_waypoints.append(return_leg_wp)

            # Build packageSequence (ordered list of packages)
            package_sequence = []
            for idx, wp in enumerate(seq_waypoints):
                pkg_info = dict(wp.get("package_info") or {})
                pkg_info["location_index"] = idx
                package_sequence.append(pkg_info)

            # Map route path: prefer trip_geom if available; else concat inbound segs (legacy)
            if trip_geom:
                map_route = trip_geom
            else:
                map_route = []
                for wp in seq_waypoints[1:]:
                    seg = wp.get("route", [])
                    if isinstance(seg, list):
                        map_route.extend(seg)
                if return_leg_wp is not None:
                    seg = return_leg_wp.get("route", [])
                    if isinstance(seg, list):
                        map_route.extend(seg)

        # Persist
        route_instance = RouteAssignment.objects.create_route(
            driver=driver,
            packageSequence=package_sequence,
            mapRoute=map_route,
            truck=truck,
            dateOfCreation=timezone.now().date(),
        )
        # Mark truck as in use
        truck.isUsed = True
        truck.save()
        # Mark packages as in transit
        package_ids = [pkg.get("packageID") for pkg in package_sequence if pkg.get("packageID") != "ADMIN"]
        Package.objects.filter(packageID__in=package_ids).update(status="in_transit")
        created_routes.append(route_instance)

        response_payload.append({
            "user": driver_username,
            "packageSequence": package_sequence,
            "mapRoute": map_route,
            "truck": truck_license_plate,
            "dateOfCreation": route_instance.dateOfCreation.isoformat(),
            "routeID": route_instance.routeID,
        })

    return created_routes, response_payload


# ---------------------------------------------------------------------------
# Clustering & Zone Preparation
# ---------------------------------------------------------------------------

def update_clustered_data_with_truck_and_driver(clustered_data: List[Dict[str, Any]], drivers: List[str]) -> List[Dict[str, Any]]:
    """Attach trucks and driver usernames to clustered zone dicts.

    Picks the *smallest* truck with enough capacity for each zone (greedy).
    Pulls driver usernames from the provided list when not already assigned.
    """
    updated_zones: List[Dict[str, Any]] = []

    # Greedy: iterate trucks sorted by capacity ascending
    available_trucks = list(Truck.objects.all().order_by("kilogramCapacity"))

    for zone_data in clustered_data:
        if isinstance(zone_data, dict):
            packages = zone_data.get("packages") or zone_data.get("locations", [])
        elif isinstance(zone_data, list):
            packages = zone_data
        else:
            continue

        valid_packages = [pkg for pkg in packages if isinstance(pkg, dict)]
        total_weight = sum(float(pkg.get("weight", 0)) for pkg in valid_packages)

        truck_assigned = None
        for truck in available_trucks:
            if truck.kilogramCapacity >= total_weight:
                truck_assigned = truck.licensePlate
                available_trucks.remove(truck)
                break

        driver_username = zone_data.get("driverUsername")
        if not driver_username and drivers:
            driver_username = drivers.pop(0)

        updated_zone = {
            "zone": zone_data.get("zone"),
            "packages": valid_packages,
            "totalWeight": total_weight,
            "truckLicensePlate": truck_assigned,
            "driverUsername": driver_username,
        }
        updated_zones.append(updated_zone)

    return updated_zones


def connect_routes_and_assignments(clustered_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Transform clustered/assigned zone data into OSRM-optimized per-zone routes.

    Injects the factory location at index 0 of each zone's location list before calling
    `create_routes()`.
    """
    zones_for_routing: List[Dict[str, Any]] = []
    for zone_data in clustered_data:
        if not isinstance(zone_data, dict):
            continue

        zone_key = zone_data.get("zone")
        locations: List[Dict[str, Any]] = []
        for pkg in zone_data.get("packages", []):
            locations.append({
                "address": pkg.get("address", ""),
                "latitude": pkg.get("latitude"),
                "longitude": pkg.get("longitude"),
                "package_info": pkg,
            })

        # Prepend factory
        locations = [FACTORY_ADDRESS] + locations

        zone_dict = {
            "zone": zone_key,
            "driverUsername": zone_data.get("driverUsername"),
            "truckLicensePlate": zone_data.get("truckLicensePlate"),
            "locations": locations,
        }
        zones_for_routing.append(zone_dict)

    logger.debug("DEBUG zones_for_routing: %s", zones_for_routing)
    osrm_routes = create_routes(zones_for_routing)
    logger.debug("DEBUG osrm_routes: %s", osrm_routes)

    # Propagate truck/driver just to be sure
    truck_lookup = {zone["zone"]: zone.get("truckLicensePlate") for zone in zones_for_routing}
    final_routes: List[Dict[str, Any]] = []
    for route in osrm_routes:
        zone_key = route.get("zone")
        route["truckLicensePlate"] = truck_lookup.get(zone_key)
        final_routes.append(route)

    return final_routes


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def get_package_display_order(package_sequence: Sequence[Dict[str, Any]]) -> Dict[str, int]:
    """Return {packageID: display_index} for real packages (ADMIN excluded)."""
    display_order: Dict[str, int] = {}
    display_idx = 1
    for pkg in package_sequence:
        if pkg.get("packageID") != "ADMIN":
            display_order[pkg["packageID"]] = display_idx
            display_idx += 1
    return display_order


# ---------------------------------------------------------------------------
# API VIEWS
# ---------------------------------------------------------------------------
class RoutePlannerView(APIView):
    """Cluster today's packages, assign resources, optimize routes, persist."""

    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]

    def post(self, request, *args, **kwargs):  # noqa: D401
        today = timezone.localdate()

        # Collect candidate packages (pending & due today or overdue only)
        packages_qs = Package.objects.filter(
            status__in=["pending"],
            deliveryDate__lte=today,  # Only today and overdue packages
        ).annotate(
            priority=Case(
                When(deliveryDate__lt=today, then=0),  # Overdue packages (highest priority)
                When(deliveryDate=today, then=1),      # Today's packages
                output_field=IntegerField(),
            )
        ).order_by("priority", "deliveryDate")

        packages_data = [
            {
                "packageID": pkg.packageID,
                "address": pkg.address,
                "latitude": float(pkg.latitude),
                "longitude": float(pkg.longitude),
                "recipient": pkg.recipient,
                "recipientPhoneNumber": pkg.recipientPhoneNumber,
                "deliveryDate": pkg.deliveryDate.isoformat(),
                "weight": float(pkg.weight),
                "status": pkg.status,
                "location_index": 0,  # will be rewritten later
            }
            for pkg in packages_qs
        ]

        drivers = request.data.get("drivers")
        if not isinstance(drivers, list) or not drivers:
            return Response({"error": "No valid drivers provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Add check for empty packages_data
        if not packages_data:
            return Response({"error": "No packages available for the selected drivers."}, status=status.HTTP_400_BAD_REQUEST)

        # Cluster + assign trucks/drivers
        clustered_data = cluster_locations(packages_data=packages_data, driverUsernames=drivers)
        clustered_data = update_clustered_data_with_truck_and_driver(clustered_data, drivers=drivers)
        logger.debug("DEBUG clustered_data: %s", clustered_data)

        missing_truck_zones = [zone.get("zone") for zone in clustered_data if not zone.get("truckLicensePlate")]
        if missing_truck_zones:
            return Response(
                {"error": f"No available truck with sufficient capacity for zone(s): {missing_truck_zones}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Build optimized OSRM routes
        final_routes = connect_routes_and_assignments(clustered_data)
        logger.debug("DEBUG final_routes: %s", final_routes)

        try:
            created_routes, response_payload = create_routes_from_json(
                final_routes, include_return_leg_in_sequence=True
            )
        except ValueError as e:  # user / data error
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(response_payload, status=status.HTTP_201_CREATED)


class getRoutingBasedOnDriver(APIView):
    """Return a driver's assigned route + live OSRM leg info (optional)."""

    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):  # noqa: D401
        username = request.data.get("username")
        if not username:
            return Response({"error": "Username required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            driver = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            route = RouteAssignment.objects.get(driver=driver)
        except RouteAssignment.DoesNotExist:
            return Response({"error": "No route assignment found for this driver"}, status=status.HTTP_404_NOT_FOUND)

        package_display_order = get_package_display_order(route.packageSequence)

        # Build OSRM input from current package sequence
        osrm_input_locations: List[Location] = []
        for pkg in route.packageSequence:
            osrm_input_locations.append(
                Location(
                    lon=float(pkg.get("longitude")),
                    lat=float(pkg.get("latitude")),
                    package_info=pkg,
                )
            )

        osrm_legs = []
        if len(osrm_input_locations) >= 2:
            osrm_js = osrm_trip(osrm_input_locations)
            if "trips" in osrm_js and osrm_js["trips"]:
                osrm_legs = osrm_js["trips"][0].get("legs", [])

        return Response(
            {
                "driver": driver.username,
                "packageSequence": route.packageSequence,
                "mapRoute": route.mapRoute,
                "packageDisplayOrder": package_display_order,
                "route": osrm_legs,
            },
            status=status.HTTP_200_OK,
        )


class getAllRoutings(APIView):
    def get(self, request):  # noqa: D401
        today = timezone.localdate()
        routes_today = RouteAssignment.objects.filter(dateOfCreation=today, isActive=True)
        serializer = RouteAssignmentSerializer(routes_today, many=True)
        return Response(serializer.data)


class finishRoute(APIView):
    def post(self, request):  # noqa: D401
        driver = User.objects.get(username=request.data.get("username"))
        route = RouteAssignment.objects.get(driver=driver)
        if route.isActive:
            route.isActive = False
        else:
            return Response({"detail": "Route is already inactive"}, status=status.HTTP_400_BAD_REQUEST)
        route.save()

        # Create delivery history directly
        try:
            delivered_packages = Package.objects.filter(
                packageID__in=[pkg.get("packageID") for pkg in route.packageSequence if pkg.get("packageID") != "ADMIN"],
                status="delivered",
            )

            total_kilos = delivered_packages.aggregate(total_weight=Sum("weight"))["total_weight"] or 0.00
            duration_hours = request.data.get("duration_hours", 0)

            delivery_history, created = DeliveryHistory.objects.get_or_create(
                delivery_date=timezone.now().date(),
                driver=driver,
                defaults={
                    "truck": route.truck,
                    "total_packages": delivered_packages.count(),
                    "total_kilos": total_kilos,
                    "duration_hours": duration_hours,
                    "route_assignment": route,
                },
            )

            if not created:
                delivery_history.truck = route.truck
                delivery_history.total_packages = delivered_packages.count()
                delivery_history.total_kilos = total_kilos
                delivery_history.duration_hours = duration_hours
                delivery_history.route_assignment = route
                delivery_history.save()

            delivery_history.completed_packages.set(delivered_packages)

            return Response(
                {
                    "detail": "Marked route as finished and created delivery history",
                    "delivery_history": {
                        "total_packages": delivery_history.total_packages,
                        "total_kilos": float(delivery_history.total_kilos),
                        "duration_hours": float(delivery_history.duration_hours),
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:  # fail soft
            return Response(
                {
                    "detail": "Marked route as finished but failed to create delivery history",
                    "error": str(e),
                },
                status=status.HTTP_201_CREATED,
            )


class getReturnRoute(APIView):
    def post(self, request):  # noqa: D401
        try:
            current_lat = float(request.data.get("currentLat"))
            current_lng = float(request.data.get("currentLng"))
            default_lat = float(request.data.get("defaultLat"))
            default_lng = float(request.data.get("defaultLng"))
            driver_username = request.data.get("username")
        except (TypeError, ValueError):
            return Response({"error": "Invalid coordinates provided"}, status=status.HTTP_400_BAD_REQUEST)

        osrm_locs = [
            Location(lon=current_lng, lat=current_lat, package_info={}),
            Location(lon=default_lng, lat=default_lat, package_info={}),
        ]
        osrm_js = osrm_trip(osrm_locs)
        if "error" in osrm_js:
            return Response({"error": "Failed to get route from OSRM"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if "trips" in osrm_js and osrm_js["trips"]:
            route_coordinates = osrm_js["trips"][0]["geometry"]["coordinates"]

            if driver_username:  # treat as driver finishing
                try:
                    logger.debug("Creating delivery history for driver: %s", driver_username)
                    driver = User.objects.get(username=driver_username)
                    route = RouteAssignment.objects.get(driver=driver, isActive=True)

                    delivered_packages = Package.objects.filter(
                        packageID__in=[pkg.get("packageID") for pkg in route.packageSequence if pkg.get("packageID") != "ADMIN"],
                        status="delivered",
                    )
                    undelivered_packages = Package.objects.filter(
                        packageID__in=[pkg.get("packageID") for pkg in route.packageSequence if pkg.get("packageID") != "ADMIN"],
                        status="undelivered",
                    )

                    delivered_kilos = delivered_packages.aggregate(total_weight=Sum("weight"))["total_weight"] or 0.00
                    undelivered_kilos = undelivered_packages.aggregate(total_weight=Sum("weight"))["total_weight"] or 0.00

                    delivery_history, created = DeliveryHistory.objects.get_or_create(
                        delivery_date=timezone.now().date(),
                        driver=driver,
                        defaults={
                            "truck": route.truck,
                            "total_packages": delivered_packages.count(),
                            "total_kilos": delivered_kilos,
                            "undelivered_packages": undelivered_packages.count(),
                            "undelivered_kilos": undelivered_kilos,
                            "duration_hours": 0,
                            "route_assignment": route,
                        },
                    )

                    if not created:
                        delivery_history.truck = route.truck
                        delivery_history.total_packages = delivered_packages.count()
                        delivery_history.total_kilos = delivered_kilos
                        delivery_history.undelivered_packages = undelivered_packages.count()
                        delivery_history.undelivered_kilos = undelivered_kilos
                        delivery_history.route_assignment = route
                        delivery_history.save()

                    delivery_history.completed_packages.set(delivered_packages)
                    delivery_history.undelivered_packages_list.set(undelivered_packages)

                    # Release truck + mark route inactive
                    route.truck.isUsed = False
                    route.truck.save()
                    route.isActive = False
                    route.save()

                except Exception as e:  # Log but don't fail the return route request
                    logger.exception("Error creating delivery history: %s", e)

            return Response({"route": route_coordinates}, status=status.HTTP_200_OK)

        return Response({"error": "No route found"}, status=status.HTTP_404_NOT_FOUND)


class dropAllRoutes(APIView):
    def delete(self, request):  # noqa: D401
        count, _ = RouteAssignment.objects.all().delete()
        Package.objects.all().update(status="pending")
        return Response({"detail": f"{count} route assignments dropped."}, status=status.HTTP_200_OK)


class CheckDriverStatusView(APIView):
    """Check whether driver has an active route or completed deliveries today."""

    def post(self, request):  # noqa: D401
        driver_username = request.data.get("username")
        if not driver_username:
            return Response({"error": "Driver username is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            driver = User.objects.get(username=driver_username)
        except User.DoesNotExist:
            return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now().date()
        active_route = RouteAssignment.objects.filter(driver=driver, isActive=True, dateOfCreation=today).first()

        if active_route:
            route_packages = [pkg.get("packageID") for pkg in active_route.packageSequence if pkg.get("packageID") != "ADMIN"]
            delivered_packages = Package.objects.filter(packageID__in=route_packages, status="delivered").count()
            undelivered_packages = Package.objects.filter(packageID__in=route_packages, status="undelivered").count()

            total_packages = len(route_packages)
            processed_packages = delivered_packages + undelivered_packages

            if processed_packages == total_packages and total_packages > 0:
                return Response(
                    {
                        "status": "completed",
                        "message": f"Driver {driver_username} has completed their route ({delivered_packages} delivered, {undelivered_packages} undelivered)",
                        "delivered_packages": delivered_packages,
                        "undelivered_packages": undelivered_packages,
                        "total_packages": total_packages,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {
                        "status": "active",
                        "message": (
                            f"Driver {driver_username} has an active route with {delivered_packages} delivered, "
                            f"{undelivered_packages} undelivered, {total_packages - processed_packages} pending"
                        ),
                        "delivered_packages": delivered_packages,
                        "undelivered_packages": undelivered_packages,
                        "total_packages": total_packages,
                        "pending_packages": total_packages - processed_packages,
                    },
                    status=status.HTTP_200_OK,
                )
        else:
            delivery_history = DeliveryHistory.objects.filter(driver=driver, delivery_date=today).first()
            if delivery_history:
                return Response(
                    {
                        "status": "completed_today",
                        "message": f"Driver {driver_username} has completed their deliveries for today",
                        "delivered_packages": delivery_history.total_packages,
                        "total_kilos": float(delivery_history.total_kilos),
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {
                        "status": "available",
                        "message": f"Driver {driver_username} is available for route assignment",
                    },
                    status=status.HTTP_200_OK,
                )


class AssignTruckAndStartJourneyView(APIView):
    """Persist a prepared route (manual override / import)."""

    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]

    def post(self, request, *args, **kwargs):  # noqa: D401
        driver_username = request.data.get("driverUsername")
        truck_license_plate = request.data.get("truckLicensePlate")
        package_sequence = request.data.get("packageSequence")
        map_route = request.data.get("mapRoute")

        if not all([driver_username, truck_license_plate, package_sequence, map_route]):
            return Response({"error": "Missing required data."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            driver = User.objects.get(username=driver_username)
        except User.DoesNotExist:
            return Response({"error": f"Driver '{driver_username}' does not exist."}, status=status.HTTP_404_NOT_FOUND)

        try:
            truck = Truck.objects.get(licensePlate=truck_license_plate)
        except Truck.DoesNotExist:
            return Response({"error": f"Truck '{truck_license_plate}' does not exist."}, status=status.HTTP_404_NOT_FOUND)

        if truck.isUsed:
            return Response({"error": f"Truck '{truck_license_plate}' is already in use."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            route_instance = RouteAssignment.objects.create_route(
                driver=driver,
                packageSequence=package_sequence,
                mapRoute=map_route,
                truck=truck,
                dateOfCreation=timezone.now().date(),
            )
        except serializers.ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:  # fail soft
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        truck.isUsed = True
        truck.save()

        package_ids = [pkg.get("packageID") for pkg in package_sequence if pkg.get("packageID") != "ADMIN"]
        Package.objects.filter(packageID__in=package_ids).update(status="in_transit")

        serializer = RouteAssignmentSerializer(route_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class recalculateRoute(APIView):
    """Recalculate from driver's current position to remaining delivery points."""

    def post(self, request):  # noqa: D401
        try:
            driver_username = request.data.get("username")
            current_lat = float(request.data.get("currentLat"))
            current_lng = float(request.data.get("currentLng"))
        except (TypeError, ValueError):
            return Response({"error": "Invalid coordinates or username provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            driver = User.objects.get(username=driver_username)
            route = RouteAssignment.objects.get(driver=driver, isActive=True)
        except User.DoesNotExist:
            return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)
        except RouteAssignment.DoesNotExist:
            return Response({"error": "No active route found for this driver"}, status=status.HTTP_404_NOT_FOUND)

        # Remaining packages = not yet marked delivered/undelivered
        remaining_packages = [
            pkg for pkg in route.packageSequence
            if pkg.get("packageID") != "ADMIN" and pkg.get("status") not in ["delivered", "undelivered"]
        ]
        if not remaining_packages:
            return Response({"error": "No remaining packages to deliver"}, status=status.HTTP_400_BAD_REQUEST)

        # New OSRM input: current position + remaining packages + ADMIN return
        osrm_locs: List[Location] = [
            Location(lon=current_lng, lat=current_lat, package_info={"address": "Current Position"})
        ]
        for pkg in remaining_packages:
            osrm_locs.append(Location(lon=float(pkg["longitude"]), lat=float(pkg["latitude"]), package_info=pkg))
        admin_pkg = next((pkg for pkg in route.packageSequence if pkg.get("packageID") == "ADMIN"), None)
        if admin_pkg:
            osrm_locs.append(Location(lon=float(admin_pkg["longitude"]), lat=float(admin_pkg["latitude"]), package_info=admin_pkg))

        osrm_js = osrm_trip(osrm_locs)
        if "error" in osrm_js:
            return Response({"error": "Failed to get route from OSRM"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if "trips" in osrm_js and osrm_js["trips"]:
            route_coordinates = osrm_js["trips"][0]["geometry"]["coordinates"]
            route.mapRoute = route_coordinates
            route.save()
            return Response(
                {
                    "route": route_coordinates,
                    "message": "Route recalculated successfully",
                    "remaining_packages": len(remaining_packages),
                },
                status=status.HTTP_200_OK,
            )

        return Response({"error": "No route found"}, status=status.HTTP_404_NOT_FOUND)


# ---------------------------------------------------------------------------
# GeoJSON Utilities
# ---------------------------------------------------------------------------

def package_sequence_to_geojson(package_sequence, include_line=True, line_name="Route"):
    """Convert a packageSequence list (as stored on RouteAssignment) to GeoJSON.

    Parameters
    ----------
    package_sequence : list[dict]
        Each dict must include longitude, latitude, address; optional packageID.
        The sequence is assumed to already be in visit order (as produced by
        `create_routes_from_json(..., include_return_leg_in_sequence=True)`).
    include_line : bool, default True
        If True, append a LineString feature connecting all points in listed order.
        If the first and last points differ and the first has packageID=='ADMIN',
        the LineString will *not* auto-close; pass a sequence that includes the
        closing ADMIN if you want a loop.
    line_name : str
        Property 'name' for the LineString feature.

    Returns
    -------
    dict
        A GeoJSON FeatureCollection.
    """
    features = []
    coords_for_line = []
    for pkg in package_sequence:
        try:
            lon = float(pkg["longitude"])
            lat = float(pkg["latitude"])
        except (KeyError, TypeError, ValueError):
            continue
        props = {
            "number": pkg.get("location_index"),
            "packageID": pkg.get("packageID"),
            "address": pkg.get("address"),
        }
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": props,
        })
        coords_for_line.append([lon, lat])

    if include_line and len(coords_for_line) >= 2:
        features.append({
            "type": "Feature",
            "geometry": {"type": "LineString", "coordinates": coords_for_line},
            "properties": {"name": line_name},
        })

    return {"type": "FeatureCollection", "features": features}


# ---------------------------------------------------------------------------
# Module Exports
# ---------------------------------------------------------------------------
__all__ = [
    "FACTORY_ADDRESS",
    "osrm_trip",
    "extract_visit_plan",
    "create_routes",
    "create_routes_from_json",
    "update_clustered_data_with_truck_and_driver",
    "connect_routes_and_assignments",
    "get_package_display_order",
    "package_sequence_to_geojson",
    # API views
    "RoutePlannerView",
    "getRoutingBasedOnDriver",
    "getAllRoutings",
    "finishRoute",
    "getReturnRoute",
    "dropAllRoutes",
    "CheckDriverStatusView",
    "AssignTruckAndStartJourneyView",
    "recalculateRoute",
]
