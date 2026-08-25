import os
import pickle
import re

from ml.intelligence.metadata_cache import (
    add_movie_to_cache,
    get_movie_from_cache
)


CATALOGUE_FILE = "ml/models/movie_catalogue_base.pkl"


def extract_year(title):
    match = re.search(r"\((\d{4})\)$", str(title))

    if match:
        return int(match.group(1))

    return None


def clean_title(title):
    return re.sub(r"\s*\(\d{4}\)$", "", str(title)).strip()


def load_catalogue():

    if not os.path.exists(CATALOGUE_FILE):
        raise FileNotFoundError(
            f"Movie catalogue not found: {CATALOGUE_FILE}"
        )

    with open(CATALOGUE_FILE, "rb") as file:
        catalogue = pickle.load(file)

    return catalogue


def find_movie_in_catalogue(title, year=None):

    catalogue = load_catalogue()

    search_title = clean_title(title).lower()

    matches = catalogue[
        catalogue["title"]
        .astype(str)
        .str.lower()
        .apply(lambda x: clean_title(x).lower() == search_title)
    ]

    if matches.empty:
        return None

    if year is not None:

        year_matches = matches[
            matches["title"]
            .astype(str)
            .apply(extract_year) == int(year)
        ]

        if not year_matches.empty:
            return year_matches.iloc[0].to_dict()

    return matches.iloc[0].to_dict()


def enrich_movie(title, year=None):

    cached_movie = get_movie_from_cache(title, year)

    if cached_movie:
        return {
            "status": "cache_hit",
            "movie": cached_movie
        }

    movie = find_movie_in_catalogue(title, year)

    if movie is None:
        return {
            "status": "not_found",
            "movie": None
        }

    movie_year = extract_year(movie["title"])

    record = {
        "identity": {
            "movie_id": int(movie["movieId"]),
            "title": clean_title(movie["title"]),
            "year": movie_year,
            "imdb_id": movie.get("imdbID"),
            "tmdb_id": movie.get("tmdbId")
        },

        "basic_metadata": {
            "language": None,
            "genres": movie.get("genres", "").split("|"),
            "runtime": None,
            "country": None,
            "rating": None,
            "vote_count": None
        },

        "presentation": {
            "poster": None,
            "plot": None,
            "director": None,
            "actors": []
        },

        "moviemind_intelligence": {
            "emotion_tags": [],
            "situation_tags": [],
            "energy": None,
            "viewing_contexts": [],
            "content_boundaries": []
        },

        "recommendation_signals": {
            "motivation_score": 0,
            "comfort_score": 0,
            "friendship_score": 0,
            "family_safe_score": 0,
            "entertainment_score": 0
        },

        "metadata_tracking": {
            "source": "movielens_base_catalogue",
            "last_updated": None,
            "cache_version": "1.0"
        }
    }

    cache_key = add_movie_to_cache(record)

    return {
        "status": "enriched_from_catalogue",
        "cache_key": cache_key,
        "movie": record
    }


if __name__ == "__main__":

    examples = [
        ("Toy Story", 1995),
        ("Jumanji", 1995),
        ("Jersey", 2019),
        ("Some Random Unknown Movie", None)
    ]

    for title, year in examples:

        result = enrich_movie(title, year)

        print("\n" + "=" * 65)
        print("MOVIEMIND METADATA ENRICHER")
        print("=" * 65)

        print("SEARCH:", title, year)
        print("STATUS:", result["status"])

        if result["movie"]:

            movie = result["movie"]

            print("TITLE:", movie["identity"]["title"])
            print("YEAR:", movie["identity"]["year"])
            print("MOVIE ID:", movie["identity"]["movie_id"])
            print("GENRES:", movie["basic_metadata"]["genres"])
            print("IMDB ID:", movie["identity"]["imdb_id"])
            print("TMDB ID:", movie["identity"]["tmdb_id"])

        else:
            print("Movie not found")
