#!/bin/sh
# Build the OSRM car-profile MLD dataset from /data/region.osm.pbf.
# Runs inside the `osrm-prepare` compose service (osrm-backend image).
set -eu

# Peak memory grows with the thread count; the default (all cores) is
# OOM-killed in a 2 GB Docker VM even on a clipped extract.
THREADS="${OSRM_THREADS:-2}"

cd /data
if [ ! -s region.osm.pbf ]; then
    echo "region.osm.pbf not found; run the osrm-fetch service first." >&2
    exit 1
fi

rm -f region.osrm*
echo "osrm-extract (car profile)..."
osrm-extract --threads "$THREADS" -p /opt/car.lua region.osm.pbf
echo "osrm-partition..."
osrm-partition --threads "$THREADS" region.osrm
echo "osrm-customize..."
osrm-customize --threads "$THREADS" region.osrm
echo "Done. Start the router: docker compose --profile osrm up -d osrm"
