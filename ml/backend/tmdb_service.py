import os
import httpx
from dotenv import load_dotenv
from pathlib import Path

# --------------------------------------------------
# LOAD .ENV FROM SAME BACKEND FOLDER
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"


# --------------------------------------------------
# CHECK TMDB CONFIGURATION
# --------------------------------------------------

def is_tmdb_configured():
    return bool(
        TMDB_API_KEY
        and TMDB_API_KEY != "YOUR_TMDB_API_KEY"
    )


# --------------------------------------------------
# FAILURE CACHE FOR RESILIENCE
# --------------------------------------------------
_FAILED_TMDB_LOOKUPS = set()

# --------------------------------------------------
# SEARCH MOVIE BY TITLE
# --------------------------------------------------

def search_tmdb_by_title(title: str, year: str = None):
    if not is_tmdb_configured() or not title:
        return None

    cache_key = f"title_{title}_{year}"
    if cache_key in _FAILED_TMDB_LOOKUPS:
        return None

    try:
        params = {
            "api_key": TMDB_API_KEY,
            "query": title,
            "include_adult": "false"
        }

        if year and str(year).isdigit():
            params["year"] = str(year)

        response = httpx.get(
            f"{TMDB_BASE_URL}/search/movie",
            params=params,
            timeout=3.0
        )

        response.raise_for_status()

        data = response.json()

        results = data.get("results", [])

        if results:
            return results[0]

    except Exception as e:
        print(f"[TMDB SEARCH ERROR] {title}: {e}")
        _FAILED_TMDB_LOOKUPS.add(cache_key)

    return None


# --------------------------------------------------
# FIND TMDB MOVIE USING IMDB ID
# --------------------------------------------------

def get_tmdb_id_from_imdb(imdb_id: str):
    if not is_tmdb_configured() or not imdb_id:
        return None

    cache_key = f"imdb_{imdb_id}"
    if cache_key in _FAILED_TMDB_LOOKUPS:
        return None

    try:
        response = httpx.get(
            f"{TMDB_BASE_URL}/find/{imdb_id}",
            params={
                "api_key": TMDB_API_KEY,
                "external_source": "imdb_id"
            },
            timeout=3.0
        )

        response.raise_for_status()

        data = response.json()

        movies = data.get("movie_results", [])

        if movies:
            return movies[0].get("id")

    except Exception as e:
        print(f"[TMDB IMDB LOOKUP ERROR] {imdb_id}: {e}")
        _FAILED_TMDB_LOOKUPS.add(cache_key)

    return None


# --------------------------------------------------
# GET COMPLETE MOVIE DETAILS
# CAST + TRAILER + PROVIDERS
# --------------------------------------------------

def get_tmdb_movie_details(tmdb_id: int):
    if not is_tmdb_configured() or not tmdb_id:
        return None

    cache_key = f"tmdb_id_{tmdb_id}"
    if cache_key in _FAILED_TMDB_LOOKUPS:
        return None

    try:
        response = httpx.get(
            f"{TMDB_BASE_URL}/movie/{tmdb_id}",
            params={
                "api_key": TMDB_API_KEY,
                "append_to_response": "credits,videos,watch/providers"
            },
            timeout=3.0
        )

        response.raise_for_status()

        return response.json()

    except Exception as e:
        print(f"[TMDB DETAILS ERROR] {tmdb_id}: {e}")
        _FAILED_TMDB_LOOKUPS.add(cache_key)

    return None


# --------------------------------------------------
# POSTER URL
# --------------------------------------------------

def get_poster_url(poster_path):
    if not poster_path:
        return None

    return f"{TMDB_IMAGE_BASE_URL}/w500{poster_path}"


# --------------------------------------------------
# BACKDROP URL FOR HERO
# --------------------------------------------------

def get_backdrop_url(backdrop_path):
    if not backdrop_path:
        return None

    return f"{TMDB_IMAGE_BASE_URL}/original{backdrop_path}"


# --------------------------------------------------
# EXTRACT CAST
# --------------------------------------------------

def extract_cast(tmdb_data: dict, limit: int = 8):
    if not tmdb_data:
        return []

    cast = (
        tmdb_data
        .get("credits", {})
        .get("cast", [])
    )

    result = []

    for person in cast[:limit]:

        profile_path = person.get("profile_path")

        result.append({
            "name": person.get("name"),
            "character": person.get("character"),
            "profile": (
                f"{TMDB_IMAGE_BASE_URL}/w185{profile_path}"
                if profile_path
                else None
            )
        })

    return result


# --------------------------------------------------
# EXTRACT DIRECTOR
# --------------------------------------------------

def extract_director(tmdb_data: dict):
    if not tmdb_data:
        return None

    crew = (
        tmdb_data
        .get("credits", {})
        .get("crew", [])
    )

    for person in crew:

        if person.get("job") == "Director":
            return person.get("name")

    return None


# --------------------------------------------------
# EXTRACT TRAILER
# --------------------------------------------------

def extract_trailer(tmdb_data: dict):

    if not tmdb_data:
        return None

    videos = (
        tmdb_data
        .get("videos", {})
        .get("results", [])
    )

    # Official Trailer
    for video in videos:

        if (
            video.get("site") == "YouTube"
            and video.get("type") == "Trailer"
            and video.get("official")
        ):
            return (
                f"https://www.youtube.com/watch?v="
                f"{video.get('key')}"
            )

    # Any Trailer
    for video in videos:

        if (
            video.get("site") == "YouTube"
            and video.get("type") == "Trailer"
        ):
            return (
                f"https://www.youtube.com/watch?v="
                f"{video.get('key')}"
            )

    return None


# --------------------------------------------------
# EXTRACT WATCH PROVIDERS
# INDIA DEFAULT
# --------------------------------------------------

def extract_watch_providers(
    tmdb_data: dict,
    country: str = "IN"
):

    if not tmdb_data:
        return []

    results = (
        tmdb_data
        .get("watch/providers", {})
        .get("results", {})
    )

    country_data = results.get(country)

    if not country_data:
        return []

    providers = []

    seen = set()

    for category in ["flatrate", "rent", "buy"]:

        for provider in country_data.get(category, []):

            name = provider.get("provider_name")

            if name and name not in seen:

                seen.add(name)

                providers.append({
                    "provider": name,
                    "type": (
                        "stream"
                        if category == "flatrate"
                        else category
                    )
                })

    return providers
