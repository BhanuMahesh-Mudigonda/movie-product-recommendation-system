from ml.intelligence.movie_title_resolver import resolve_movie_title
import os
import pickle
import re


BASE_CATALOGUE_FILE = "ml/models/movie_catalogue_base.pkl"
RICH_METADATA_FILES = [
    "ml/models/movie_enrichment.pkl",
    "ml/models/featured_movie_metadata.pkl"
]


def clean_title(title):
    return re.sub(r"\s*\(\d{4}\)$", "", str(title)).strip()


def extract_year(title):
    match = re.search(r"\((\d{4})\)$", str(title))

    if match:
        return int(match.group(1))

    return None


def load_pickle_dataframe(file_path):

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    with open(file_path, "rb") as file:
        return pickle.load(file)


def find_base_movie(title, year=None):

    catalogue = load_pickle_dataframe(BASE_CATALOGUE_FILE)

    search_title = clean_title(title).lower()

    matches = catalogue[
        catalogue["title"]
        .astype(str)
        .apply(lambda x: clean_title(x).lower() == search_title)
    ]

    if not matches.empty:

        if year is not None:

            year_matches = matches[
                matches["title"]
                .astype(str)
                .apply(extract_year) == int(year)
            ]

            if not year_matches.empty:
                return year_matches.iloc[0].to_dict()

        return matches.iloc[0].to_dict()

    # Smart Title Resolver fallback
    resolved = resolve_movie_title(title, year)

    if (
        resolved.get("status") == "resolved"
        and resolved.get("best_match")
    ):
        movie_id = resolved["best_match"]["movieId"]

        resolved_match = catalogue[
            catalogue["movieId"] == movie_id
        ]

        if not resolved_match.empty:
            return resolved_match.iloc[0].to_dict()

    return None

def find_rich_metadata(imdb_id=None, movie_id=None):

    for file_path in RICH_METADATA_FILES:

        metadata = load_pickle_dataframe(file_path)

        if imdb_id:

            matches = metadata[
                metadata["imdbID"].astype(str) == str(imdb_id)
            ]

            if not matches.empty:
                result = matches.iloc[0].to_dict()
                result["_metadata_source"] = file_path
                return result

        if movie_id is not None and "movieId" in metadata.columns:

            matches = metadata[
                metadata["movieId"] == movie_id
            ]

            if not matches.empty:
                result = matches.iloc[0].to_dict()
                result["_metadata_source"] = file_path
                return result

    return None

def split_text_list(value):

    if value is None:
        return []

    if not isinstance(value, str):
        return []

    if value.strip() in ["", "N/A", "nan"]:
        return []

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


def merge_movie_metadata(title, year=None):

    base_movie = find_base_movie(title, year)

    if base_movie is None:
        return {
            "status": "base_movie_not_found",
            "movie": None
        }

    movie_id = base_movie.get("movieId")
    imdb_id = base_movie.get("imdbID")
    tmdb_id = base_movie.get("tmdbId")

    rich_movie = find_rich_metadata(
        imdb_id=imdb_id,
        movie_id=movie_id
    )

    movie_year = extract_year(base_movie["title"])

    merged_movie = {

        "identity": {
            "movie_id": int(movie_id) if movie_id is not None else None,
            "title": clean_title(base_movie["title"]),
            "year": movie_year,
            "imdb_id": imdb_id,
            "tmdb_id": tmdb_id
        },

        "basic_metadata": {
            "language": None,
            "genres": base_movie.get("genres", "").split("|"),
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

        "metadata_sources": {
            "base_catalogue": True,
            "rich_metadata": False,
            "rich_metadata_source": None
        }
    }

    if rich_movie:

        merged_movie["basic_metadata"]["language"] = rich_movie.get("Language")

        merged_movie["basic_metadata"]["runtime"] = rich_movie.get("Runtime")

        merged_movie["basic_metadata"]["country"] = rich_movie.get("Country")

        merged_movie["basic_metadata"]["rating"] = rich_movie.get("imdbRating")

        if rich_movie.get("Genre"):
            merged_movie["basic_metadata"]["genres"] = split_text_list(
                rich_movie.get("Genre")
            )

        merged_movie["presentation"]["poster"] = rich_movie.get("Poster")

        merged_movie["presentation"]["plot"] = rich_movie.get("Plot")

        merged_movie["presentation"]["director"] = rich_movie.get("Director")

        merged_movie["presentation"]["actors"] = split_text_list(
            rich_movie.get("Actors")
        )

        merged_movie["metadata_sources"]["rich_metadata"] = True

        merged_movie["metadata_sources"]["rich_metadata_source"] = (
            rich_movie.get("_metadata_source")
        )

        status = "merged_rich_metadata"

    else:

        status = "base_metadata_only"

    return {
        "status": status,
        "movie": merged_movie
    }


if __name__ == "__main__":

    examples = [
        ("Toy Story", 1995),
        ("12 Monkeys", 1995),
        ("Jumanji", 1995),
        ("Some Unknown Movie", None)
    ]

    for title, year in examples:

        result = merge_movie_metadata(title, year)

        print("\n" + "=" * 70)
        print("MOVIEMIND METADATA MERGER")
        print("=" * 70)

        print("SEARCH:", title, year)
        print("STATUS:", result["status"])

        if result["movie"]:

            movie = result["movie"]

            print("TITLE:", movie["identity"]["title"])
            print("YEAR:", movie["identity"]["year"])
            print("GENRES:", movie["basic_metadata"]["genres"])
            print("LANGUAGE:", movie["basic_metadata"]["language"])
            print("RATING:", movie["basic_metadata"]["rating"])
            print("DIRECTOR:", movie["presentation"]["director"])
            print("ACTORS:", movie["presentation"]["actors"][:3])

            poster = movie["presentation"]["poster"]

            print(
                "POSTER:",
                "AVAILABLE" if poster else "NOT AVAILABLE"
            )

            print(
                "RICH METADATA:",
                movie["metadata_sources"]["rich_metadata"]
            )

        else:
            print("Movie not found")
