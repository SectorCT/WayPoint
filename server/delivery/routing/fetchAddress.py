import requests
import os

GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_KEY","")

def getAddressByCoordinates(lat, lon):
    url = (
        f"https://api.geoapify.com/v1/geocode/reverse?"
        f"lat={lat}&lon={lon}&lang=bg&format=json&apiKey={GEOAPIFY_API_KEY}"
    )
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()

        if not data.get("results"):
            return None

        return data["results"][0].get("formatted")

    except requests.RequestException as e:
        print(f"Geoapify request error: {e}")
        return None
