#!/bin/sh
# Download a Geofabrik extract into the osrm-data volume and optionally clip it
# to a bounding box. Runs inside the `osrm-fetch` compose service.
#
#   OSRM_PBF_URL   extract to download (default: Northern California)
#   OSRM_BBOX      minlon,minlat,maxlon,maxlat to clip to; empty = whole extract
#   OSRM_FORCE_DOWNLOAD=1  re-download even if the extract is already cached
set -eu

cd /data
echo "Installing curl and osmctools..."
apt-get update -qq >/dev/null
apt-get install -y -qq --no-install-recommends ca-certificates curl osmctools >/dev/null

if [ ! -s source.osm.pbf ] || [ -n "${OSRM_FORCE_DOWNLOAD:-}" ]; then
    echo "Downloading ${OSRM_PBF_URL} ..."
    curl -fL --retry 3 -o source.osm.pbf.part "${OSRM_PBF_URL}"
    mv source.osm.pbf.part source.osm.pbf
else
    echo "Using cached source.osm.pbf (set OSRM_FORCE_DOWNLOAD=1 to refresh)."
fi
ls -lh source.osm.pbf

if [ -n "${OSRM_BBOX:-}" ]; then
    # osmconvert with a bounded hash fits in a 2 GB Docker VM (osmium extract
    # and osmconvert --complete-ways were OOM-killed there on the NorCal file).
    # Roads crossing the box edge are cut at the edge, so keep a margin around
    # the area you route in.
    echo "Clipping to bbox ${OSRM_BBOX} ..."
    osmconvert source.osm.pbf -b="${OSRM_BBOX}" --hash-memory=300 -o=region.osm.pbf
else
    cp source.osm.pbf region.osm.pbf
fi
ls -lh region.osm.pbf
echo "Done. Next: docker compose --profile osrm-setup run --rm osrm-prepare"
