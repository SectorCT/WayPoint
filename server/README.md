# WayPoint backend

Django 5.2 + Django REST Framework API, served under `/v1/`, with JWT auth, Postgres 16 and Docker Compose.

## Run locally

```powershell
cd server
docker compose up -d --build
docker compose exec web python manage.py all   # wipe and seed demo data
```

The API is at `http://localhost:8000/v1/`. No extra setup is needed: every setting has a development default in `docker-compose.yml`. To override any of them, copy `.env.example` to `.env`. `.env` is gitignored.

The seed data creates the manager `sarah.chen@waypoint.delivery` and the truckers `mike.rodriguez@`, `james.wong@`, `carlos.martinez@`, `david.kim@` and `antonio.garcia@` (all `@waypoint.delivery`). Every password is `radiradi`, and the company ID is `SFLOGISTICS2024`.

### Configuration

| Variable | Default (compose) | Notes |
|---|---|---|
| `DEBUG` | `True` | Defaults to `False` outside compose. When it is off, `SECRET_KEY` must be set. |
| `SECRET_KEY` | insecure placeholder | Required in production. |
| `ALLOWED_HOSTS` | `*` | Comma-separated. |
| `CORS_ALLOWED_ORIGINS` / `CORS_ALLOW_ALL_ORIGINS` | – / follows `DEBUG` | Applies to browser clients only. |
| `TIME_ZONE` | `Europe/Sofia` | Defines "today" for delivery dates. |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | dev values | Postgres applies them only when the volume is first created. |
| `OSRM_BASE_URL` / `OSRM_PROFILE` / `OSRM_TIMEOUT_S` | public demo server / `driving` / `20` | See below. |

### Migrations

Containers only run `migrate`. After changing models, generate the migration yourself and commit it:

```powershell
docker compose exec web python manage.py makemigrations
```

### Tests

```powershell
docker compose exec web python manage.py test
```

## Permissions

Every endpoint requires a JWT (`Authorization: Bearer <access>`), except `auth/login/`, `auth/register/`, `auth/logout/` and `auth/token/refresh/`.

- **Manager endpoints** only see data from the manager's own company.
- **Trucker endpoints** act on the caller's own route. Any `username` or `driver_username` in the request must match the caller.
- **Status codes:** anonymous requests get 401 and the wrong role gets 403.

## Email notifications

When a package is marked delivered, or dropped at an office, its recipient gets an email. Packages without `recipientEmail` are skipped. `recipientEmail` is an optional field on `POST /v1/delivery/packages/create/`.

**Until SMTP is configured,** `EMAIL_HOST_USER` is empty and emails are printed to the server log instead of being sent. You can see them with `docker compose logs web`.

**To send real email:**
1. Fill in the `EMAIL_*` variables in `server/.env`. With Gmail, turn on 2-step verification and use an [App Password](https://myaccount.google.com/apppasswords) as `EMAIL_HOST_PASSWORD`. `DEFAULT_FROM_EMAIL` defaults to `EMAIL_HOST_USER`.
2. Restart the web container: `docker compose up -d web`.
3. Check the setup:

   ```powershell
   docker compose exec web python manage.py send_test_email you@example.com --office
   ```

## Self-hosted OSRM

By default, route planning uses the public OSRM demo server. That server is rate-limited, has no uptime guarantee, and isn't meant for application use. Instead, you can run your own router with the car profile and the MLD algorithm.

**One-time setup:** download a Geofabrik extract, clip it, and preprocess it into the `osrm-data` volume.

```powershell
docker compose --profile osrm-setup run --rm osrm-fetch     # download + clip
docker compose --profile osrm-setup run --rm osrm-prepare   # extract -> partition -> customize
docker compose --profile osrm up -d osrm                    # start the router
```

**Using the router:** put `OSRM_BASE_URL=http://osrm:5000` in `server/.env`, then run `docker compose up -d web`. For debugging, the router is also published on `http://127.0.0.1:5001`.

**What to expect:**
- **Default region:** the Northern California extract, about 0.6 GB to download. It is clipped (`OSRM_BBOX`) with `osmconvert` to the seed-data area (`-122.25,37.25,-121.78,37.52`), which leaves a 59 MB extract. The clip itself takes about 20 s and runs in 2 GB.
- **Clipped build:** even the clipped build is **not** possible in a 2 GB Docker VM. `osrm-extract` on the clipped extract ran the VM out of memory and hung the Docker engine. Give Docker at least 4 GB. On Windows, set `memory=4GB` (or more) under `[wsl2]` in `~/.wslconfig`, run `wsl --shutdown`, and restart Docker Desktop. Other WSL distros share the same memory.
- **Threads:** `OSRM_THREADS` (default 2) caps preprocessing threads. Peak memory grows with the thread count.
- **Full build:** preprocessing the whole of NorCal without clipping (`OSRM_BBOX=`) needs about 6–8 GB.

**Another region**, e.g. Bulgaria: set `OSRM_PBF_URL=https://download.geofabrik.de/europe/bulgaria-latest.osm.pbf` and either an empty `OSRM_BBOX` (about 0.1 GB download) or a box. Add `OSRM_FORCE_DOWNLOAD=1` so the cached extract is replaced, then rerun the three commands.

**The profile segment:** the public server expects the profile `driving` in the URL (`/trip/v1/driving/...`). A self-hosted `osrm-routed` serves a single dataset and ignores that segment, so the default `OSRM_PROFILE=driving` works for both.
