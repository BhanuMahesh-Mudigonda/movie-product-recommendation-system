import json
import os
from copy import deepcopy
from datetime import datetime

from ml.intelligence.movie_schema import MOVIE_SCHEMA


CACHE_FILE = "ml/data/intelligence/movie_metadata_cache.json"


def ensure_cache_exists():
    directory = os.path.dirname(CACHE_FILE)

    if not os.path.exists(directory):
        os.makedirs(directory)

    if not os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "w", encoding="utf-8") as file:
            json.dump({}, file, indent=4)


def load_cache():
    ensure_cache_exists()

    with open(CACHE_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_cache(cache):
    ensure_cache_exists()

    with open(CACHE_FILE, "w", encoding="utf-8") as file:
        json.dump(cache, file, indent=4, ensure_ascii=False)


def create_movie_record(
    title,
    movie_id=None,
    year=None,
    imdb_id=None,
    tmdb_id=None
):
    movie = deepcopy(MOVIE_SCHEMA)

    movie["identity"]["movie_id"] = movie_id
    movie["identity"]["title"] = title
    movie["identity"]["year"] = year
    movie["identity"]["imdb_id"] = imdb_id
    movie["identity"]["tmdb_id"] = tmdb_id

    movie["metadata_tracking"]["source"] = "moviemind_cache"
    movie["metadata_tracking"]["last_updated"] = datetime.now().isoformat()

    return movie


def build_cache_key(title, year=None):
    title = title.strip().lower()

    if year:
        return f"{title}_{year}"

    return title


def add_movie_to_cache(movie):
    cache = load_cache()

    title = movie["identity"]["title"]
    year = movie["identity"]["year"]

    key = build_cache_key(title, year)

    cache[key] = movie

    save_cache(cache)

    return key


def get_movie_from_cache(title, year=None):
    cache = load_cache()

    key = build_cache_key(title, year)

    return cache.get(key)


def cache_statistics():
    cache = load_cache()

    return {
        "total_movies": len(cache),
        "cache_file": CACHE_FILE
    }


if __name__ == "__main__":

    sample_movie = create_movie_record(
        title="Jersey",
        year=2019
    )

    sample_movie["basic_metadata"]["language"] = "Telugu"
    sample_movie["basic_metadata"]["genres"] = ["Drama", "Sport"]

    sample_movie["moviemind_intelligence"]["emotion_tags"] = [
        "motivated",
        "hopeful"
    ]

    sample_movie["moviemind_intelligence"]["situation_tags"] = [
        "career_pressure",
        "motivation"
    ]

    sample_movie["moviemind_intelligence"]["energy"] = "motivating"

    sample_movie["recommendation_signals"]["motivation_score"] = 95
    sample_movie["recommendation_signals"]["comfort_score"] = 75
    sample_movie["recommendation_signals"]["family_safe_score"] = 85

    key = add_movie_to_cache(sample_movie)

    print("Movie added to MovieMind Cache")
    print("Cache Key:", key)

    result = get_movie_from_cache("Jersey", 2019)

    print("\nRetrieved Movie:")
    print(result["identity"]["title"])
    print(result["basic_metadata"]["language"])
    print(result["moviemind_intelligence"]["emotion_tags"])

    print("\nCache Statistics:")
    print(cache_statistics())
