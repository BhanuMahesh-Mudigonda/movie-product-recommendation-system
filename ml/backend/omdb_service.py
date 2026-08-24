import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv("ml/backend/.env")

OMDB_API_KEY = os.getenv("OMDB_API_KEY")
OMDB_URL = "https://www.omdbapi.com/"


def normalize_query(query: str):
    query = query.strip()

    if not query:
        return ""

    query = re.sub(r"[\.\-_]+", " ", query)
    query = re.sub(r"\s+", " ", query)

    return query.strip()


def build_search_queries(query: str):
    original = query.strip()

    if not original:
        return []

    queries = []

    def add(value):
        value = value.strip()

        if value and value.lower() not in {
            q.lower() for q in queries
        }:
            queries.append(value)

    add(original)

    # Remove punctuation
    compact = "".join(
        ch for ch in original
        if ch.isalnum()
    )

    add(compact)

    # Abbreviation variants
    if compact.isalpha() and 2 <= len(compact) <= 6:
        add(" ".join(compact))
        add(".".join(compact))

    return queries


def search_movies(query: str, page: int = 1):
    global OMDB_DISABLED
    if not query or not query.strip():
        return []

    if not OMDB_API_KEY or OMDB_DISABLED:
        return []

    results = []
    seen_ids = set()

    queries = build_search_queries(query)

    for search_query in queries:

        params = {
            "apikey": OMDB_API_KEY,
            "s": search_query,
            "page": page,
            "type": "movie"
        }

        try:
            response = httpx.get(
                OMDB_URL,
                params=params,
                timeout=1.5
            )

            response.raise_for_status()
            data = response.json()

        except Exception as e:
            print(f"OMDB API Error: {e}")
            if hasattr(e, 'response') and e.response is not None and e.response.status_code == 401:
                OMDB_DISABLED = True
                print("OMDB API KEY EXPIRED OR UNAUTHORIZED. DISABLING OMDB FALLBACK.")
            continue

        if data.get("Response") != "True":
            continue

        for movie in data.get("Search", []):

            imdb_id = movie.get("imdbID")

            if not imdb_id:
                continue

            if imdb_id in seen_ids:
                continue

            seen_ids.add(imdb_id)
            results.append(movie)

    return results


OMDB_DISABLED = False

def get_movie_details(imdb_id: str = None, title: str = None, year: str = None):
    global OMDB_DISABLED
    if not OMDB_API_KEY or OMDB_DISABLED:
        return None
        
    if not imdb_id and not title:
        return None

    params = {
        "apikey": OMDB_API_KEY,
        "plot": "full"
    }
    
    if imdb_id:
        params["i"] = imdb_id
    elif title:
        params["t"] = title
        if year:
            params["y"] = year

    try:
        response = httpx.get(
            OMDB_URL,
            params=params,
            timeout=1.5
        )

        response.raise_for_status()
        data = response.json()

    except Exception as e:
        print(f"OMDB API Error: {e}")
        if hasattr(e, 'response') and e.response is not None and e.response.status_code == 401:
            OMDB_DISABLED = True
            print("OMDB API KEY EXPIRED OR UNAUTHORIZED. DISABLING OMDB FALLBACK.")
        return None

    if data.get("Response") != "True":
        return None

    return data
