from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
import re

try:
    from omdb_service import search_movies, get_movie_details
    from movie_resolver import resolve_movie
    from tmdb_service import (
        search_tmdb_by_title,
        get_tmdb_movie_details,
        get_poster_url,
        get_backdrop_url,
        extract_cast,
        extract_director,
        extract_trailer
    )
    from movie_web_fallback import search_web_movie
except ImportError:
    from ml.backend.omdb_service import search_movies, get_movie_details
    from ml.backend.movie_resolver import resolve_movie
    from ml.backend.tmdb_service import (
        search_tmdb_by_title,
        get_tmdb_movie_details,
        get_poster_url,
        get_backdrop_url,
        extract_cast,
        extract_director,
        extract_trailer
    )


# =========================================================
# PATHS
# =========================================================

BACKEND_DIR = Path(__file__).resolve().parent
BASE_DIR = BACKEND_DIR.parent
MODEL_DIR = BASE_DIR / "models"
FEATURED_METADATA_PATH = BACKEND_DIR / "model_data" / "featured_movie_metadata.pkl"


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="Movie Recommendation API",
    description="Hybrid Movie Recommendation System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =========================================================
# LOAD MODELS
# =========================================================

item_knn = joblib.load(MODEL_DIR / "item_knn.pkl")
svd_model = joblib.load(MODEL_DIR / "svd_model.pkl")
user_latent_matrix = joblib.load(MODEL_DIR / "user_latent_matrix.pkl")
movie_latent_matrix = joblib.load(MODEL_DIR / "movie_latent_matrix.pkl")

# =========================================================
# FAST SIMILARITY PREPARATION
# Normalize movie vectors once during server startup.
# This avoids recalculating all vector norms for every request.
# =========================================================

movie_latent_matrix = np.asarray(
    movie_latent_matrix,
    dtype=np.float32
)

_movie_norms = np.linalg.norm(
    movie_latent_matrix,
    axis=1,
    keepdims=True
)

_movie_norms[
    _movie_norms == 0
] = 1e-10

normalized_movie_latent_matrix = (
    movie_latent_matrix / _movie_norms
)

movies = pd.read_pickle(MODEL_DIR / "movies_metadata.pkl")

user_id_to_index = joblib.load(
    MODEL_DIR / "user_id_to_index.pkl"
)

movie_id_to_svd_index = joblib.load(
    MODEL_DIR / "movie_id_to_svd_index.pkl"
)

movie_popularity = pd.read_pickle(
    MODEL_DIR / "movie_popularity.pkl"
)

movie_enrichment = pd.read_pickle(
    MODEL_DIR / "movie_enrichment.pkl"
)

featured_catalogue = pd.read_pickle(
    MODEL_DIR / "featured_movie_catalogue.pkl"
)

movie_catalogue_base = pd.read_pickle(
    MODEL_DIR / "movie_catalogue_base.pkl"
)
featured_metadata = pd.read_pickle(MODEL_DIR / "featured_movie_metadata.pkl")


# =========================================================
# LOAD FEATURED METADATA
# THIS CONTAINS POSTERS + DETAILS
# =========================================================

featured_metadata = pd.read_pickle(
    FEATURED_METADATA_PATH
)

print("=" * 50)
print("BASE CATALOGUE:", len(movie_catalogue_base))
print("FEATURED CATALOGUE:", len(featured_catalogue))
print("MOVIE ENRICHMENT:", len(movie_enrichment))
print("FEATURED METADATA:", len(featured_metadata))
print("=" * 50)


# =========================================================
# BASIC HELPERS
# =========================================================

def normalize_movie_title(title):
    value = str(title or "").lower().strip()

    value = re.sub(
        r"\s*\(\d{4}\)\s*$",
        "",
        value
    )

    value = re.sub(
        r"[^a-z0-9]+",
        " ",
        value
    )

    return " ".join(value.split())


def safe_value(value):
    if value is None:
        return None

    if isinstance(value, float) and pd.isna(value):
        return None

    value = str(value).strip()

    if value.lower() in [
        "",
        "n/a",
        "none",
        "nan",
        "null"
    ]:
        return None

    return value


def get_movie_key(movie):

    movie_id = movie.get("movieId")

    if movie_id is not None:

        try:
            if not pd.isna(movie_id):
                return f"id-{int(movie_id)}"
        except Exception:
            pass

    imdb_id = safe_value(
        movie.get("imdbID")
    )

    if imdb_id:
        return f"imdb-{imdb_id.lower()}"

    title = normalize_movie_title(
        movie.get("title")
        or movie.get("Title")
        or ""
    )

    year = safe_value(
        movie.get("year")
        or movie.get("Year")
    )

    return f"title-{title}-{year}"


# =========================================================
# FEATURED METADATA LOOKUP
# =========================================================

def get_featured_metadata(title, year=None):

    if not title:
        return None

    target_title = normalize_movie_title(title)

    target_year = safe_value(year)

    # First try exact title + year
    if target_year:

        for _, row in featured_metadata.iterrows():

            row_title = normalize_movie_title(
                row.get("Title", "")
            )

            row_year = safe_value(
                row.get("Year")
            )

            if (
                row_title == target_title
                and row_year == target_year
            ):
                return row.to_dict()

    # Second try title only
    for _, row in featured_metadata.iterrows():

        row_title = normalize_movie_title(
            row.get("Title", "")
        )

        if row_title == target_title:
            return row.to_dict()

    # Third try partial matching
    for _, row in featured_metadata.iterrows():

        row_title = normalize_movie_title(
            row.get("Title", "")
        )

        if (
            target_title in row_title
            or row_title in target_title
        ):
            return row.to_dict()

    return None


# =========================================================
# LANGUAGE HELPERS
# =========================================================

LANGUAGE_MAP = {
    "te": "telugu",
    "hi": "hindi",
    "ta": "tamil",
    "ml": "malayalam",
    "en": "english"
}


def movie_matches_language(movie, language_code):

    target_language = LANGUAGE_MAP.get(
        language_code,
        "english"
    )

    movie_language = safe_value(
        movie.get("Language")
        or movie.get("language")
    )

    if not movie_language:
        return False

    return target_language.lower() in movie_language.lower()


# =========================================================
# POSTER HELPERS
# =========================================================

def get_movie_poster(movie):

    poster = (
        movie.get("Poster")
        or movie.get("poster")
        or movie.get("poster_url")
        or movie.get("image")
    )

    return safe_value(poster)


def has_valid_poster(movie):

    poster = get_movie_poster(movie)

    if not poster:
        return False

    return True


# =========================================================
# MOVIE NORMALIZATION
# =========================================================

def normalize_movie_response(movie):

    if not movie:
        return None

    title = (
        movie.get("title")
        or movie.get("Title")
    )

    year = (
        movie.get("year")
        or movie.get("Year")
    )

    # ---------------------------------------------
    # FIRST PRIORITY:
    # OUR SAVED FEATURED METADATA
    # ---------------------------------------------

    metadata = get_featured_metadata(
        title,
        year
    )

    if metadata:

        movie["movieId"] = (
            movie.get("movieId")
            or metadata.get("movieId")
        )

        movie["title"] = (
            movie.get("title")
            or metadata.get("Title")
        )

        movie["year"] = (
            movie.get("year")
            or metadata.get("Year")
        )

        movie["imdbID"] = (
            movie.get("imdbID")
            or metadata.get("imdbID")
        )

        movie["Poster"] = (
            movie.get("Poster")
            or metadata.get("Poster")
        )

        movie["poster"] = (
            movie.get("poster")
            or metadata.get("Poster")
        )

        movie["imdbRating"] = (
            movie.get("imdbRating")
            or metadata.get("imdbRating")
        )

        movie["genre"] = (
            movie.get("genre")
            or movie.get("Genre")
            or metadata.get("Genre")
        )

        movie["Genre"] = movie["genre"]

        movie["director"] = (
            movie.get("director")
            or movie.get("Director")
            or metadata.get("Director")
        )

        movie["Director"] = movie["director"]

        movie["cast"] = (
            movie.get("cast")
            or movie.get("Actors")
            or metadata.get("Actors")
        )

        movie["Actors"] = movie["cast"]

        movie["runtime"] = (
            movie.get("runtime")
            or movie.get("Runtime")
            or metadata.get("Runtime")
        )

        movie["Runtime"] = movie["runtime"]

        movie["language"] = (
            movie.get("language")
            or movie.get("Language")
            or metadata.get("Language")
        )

        movie["Language"] = movie["language"]

        movie["country"] = (
            movie.get("country")
            or movie.get("Country")
            or metadata.get("Country")
        )

        movie["Country"] = movie["country"]

        movie["plot"] = (
            movie.get("plot")
            or movie.get("Plot")
            or metadata.get("Plot")
        )

        movie["Plot"] = movie["plot"]

    # ---------------------------------------------
    # NORMALIZE EXISTING VALUES
    # ---------------------------------------------

    poster = get_movie_poster(movie)

    movie["Poster"] = poster
    movie["poster"] = poster

    movie["title"] = (
        movie.get("title")
        or movie.get("Title")
    )

    movie["year"] = (
        movie.get("year")
        or movie.get("Year")
    )

    movie["genre"] = (
        movie.get("genre")
        or movie.get("Genre")
        or movie.get("genres")
    )

    movie["director"] = (
        movie.get("director")
        or movie.get("Director")
    )

    movie["cast"] = (
        movie.get("cast")
        or movie.get("Actors")
    )

    movie["runtime"] = (
        movie.get("runtime")
        or movie.get("Runtime")
    )

    movie["language"] = (
        movie.get("language")
        or movie.get("Language")
    )

    movie["country"] = (
        movie.get("country")
        or movie.get("Country")
    )

    movie["plot"] = (
        movie.get("plot")
        or movie.get("Plot")
    )

    return movie


# =========================================================
# ADD MOVIE
# ONLY ADD MOVIES WITH POSTERS
# =========================================================

def add_movie_if_valid(
    records,
    movie,
    used_movies,
    category_key
):

    if not movie:
        return False

    movie = normalize_movie_response(movie)

    if not movie:
        return False

    # Poster compulsory
    if not has_valid_poster(movie):
        return False

    movie_key = get_movie_key(movie)

    if movie_key in used_movies:
        return False

    movie["category"] = category_key

    used_movies.add(movie_key)

    records.append(movie)

    return True


# =========================================================
# SANITIZE RESPONSE
# =========================================================

def sanitize_records(records):

    sanitized = []

    for r in records:

        sanitized_r = {}

        for k, v in r.items():

            if isinstance(
                v,
                (list, dict, tuple)
            ):
                sanitized_r[k] = v

            elif pd.isna(v):
                sanitized_r[k] = None

            elif hasattr(v, "item"):
                sanitized_r[k] = v.item()

            else:
                sanitized_r[k] = v

        sanitized.append(sanitized_r)

    return sanitized


# =========================================================
# COSINE SIMILARITY
# =========================================================

def get_cosine_similarity(
    vec,
    matrix
):

    dot = np.dot(
        matrix,
        vec
    )

    norm_vec = np.linalg.norm(vec)

    norm_matrix = np.linalg.norm(
        matrix,
        axis=1
    )

    norms = norm_vec * norm_matrix

    norms[norms == 0] = 1e-10

    return dot / norms


# =========================================================
# CATALOGUE PREPARATION
# =========================================================

catalogue = movies[
    ["movieId", "title", "genres"]
].copy()

catalogue = catalogue.merge(
    movie_popularity,
    on="movieId",
    how="left"
)

catalogue = catalogue.merge(
    movie_enrichment,
    on="movieId",
    how="left",
    suffixes=("", "_omdb")
)

catalogue["rating_count"] = (
    catalogue["rating_count"]
    .fillna(0)
    .astype(int)
)

catalogue["avg_rating"] = (
    catalogue["avg_rating"]
    .fillna(0)
)

catalogue["weighted_score"] = (
    catalogue["weighted_score"]
    .fillna(0)
)


# =========================================================
# CATEGORY CANDIDATES
# =========================================================

def get_category_candidates(
    language,
    category_key
):

    language = str(language).lower().strip()

    category_key = str(
        category_key
    ).lower().strip()

    exact = featured_catalogue[
        (
            featured_catalogue[
                "language_code"
            ]
            .astype(str)
            .str.lower()
            == language
        )
        &
        (
            featured_catalogue[
                "category"
            ]
            .astype(str)
            .str.lower()
            == category_key
        )
    ].copy()

    fallback = featured_catalogue[
        featured_catalogue[
            "category"
        ]
        .astype(str)
        .str.lower()
        == category_key
    ].copy()

    combined = pd.concat(
        [exact, fallback],
        ignore_index=True
    )

    combined = combined.drop_duplicates(
        subset=["title"],
        keep="first"
    )

    return combined


# =========================================================
# BASE CATEGORY MOVIES
# =========================================================

def get_base_category_movies(
    category_key
):

    category_key = str(
        category_key
    ).lower()

    genre_map = {

        "trending": [],

        "new_releases": [],

        "blockbusters": [],

        "action": [
            "Action",
            "Thriller",
            "Crime",
            "Adventure"
        ],

        "drama": [
            "Drama",
            "Romance"
        ],

        "kids": [
            "Animation",
            "Children",
            "Fantasy",
            "Family"
        ]
    }

    keywords = genre_map.get(
        category_key,
        []
    )

    source = catalogue.copy()

    if keywords:

        pattern = "|".join(
            keywords
        )

        source = source[
            source["genres"]
            .astype(str)
            .str.contains(
                pattern,
                case=False,
                na=False
            )
        ]

    if category_key == "trending":

        source = source.sort_values(
            [
                "rating_count",
                "avg_rating"
            ],
            ascending=[
                False,
                False
            ]
        )

    elif category_key == "new_releases":

        source = source.sort_values(
            [
                "weighted_score",
                "rating_count"
            ],
            ascending=[
                False,
                False
            ]
        )

    elif category_key == "blockbusters":

        source = source.sort_values(
            [
                "rating_count",
                "weighted_score"
            ],
            ascending=[
                False,
                False
            ]
        )

    else:

        source = source.sort_values(
            [
                "weighted_score",
                "rating_count"
            ],
            ascending=[
                False,
                False
            ]
        )

    return source


# =========================================================
# CLEAN BASE RECORD
# =========================================================

def clean_movie_record(row):

    record = row.to_dict()

    for key in list(record.keys()):

        try:

            if pd.isna(record[key]):

                record[key] = None

        except Exception:

            pass

    return record


# =========================================================
# ENRICH RECOMMENDATION RESPONSE
# =========================================================

def enrich_movie_response(
    movie_id,
    title,
    genres,
    score=None,
    reason=None
):

    base_info = {

        "movieId": int(movie_id),

        "title": title,

        "genres": genres,

        "score": score,

        "reason": reason

    }

    match = catalogue[
        catalogue["movieId"] == movie_id
    ]

    if not match.empty:

        row = match.iloc[0]

        for field in row.index:

            value = row[field]

            try:

                if pd.notna(value):

                    base_info[field] = value

            except Exception:

                pass

    # First use our saved metadata
    enriched = normalize_movie_response(
        base_info
    )

    # If metadata found, do not unnecessarily call APIs
    if has_valid_poster(enriched):

        return enriched

    # Last fallback
    try:

        resolved = resolve_movie(
            base_info
        )

        if resolved:

            return normalize_movie_response(
                resolved
            )

    except Exception as e:

        print(
            "[RESOLVE ERROR]",
            title,
            e
        )

    return enriched



# =========================================================
# HOME ENDPOINT
# COMPLETE 161 ENRICHED MOVIE SHOWCASE
# ALL LANGUAGES MIXED - NO MOVIE LANGUAGE FILTER
# =========================================================

# =========================================================
# HOME ENDPOINT
# COMPLETE 161 ENRICHED MOVIE SHOWCASE
# ALL LANGUAGES MIXED
# NO LANGUAGE FILTER
# NO REPEATED MOVIES ACROSS HOME
# =========================================================


# =========================================================
# HOME ENDPOINT
# COMPLETE MOVIEMIND SHOWCASE
# 161 ENRICHED MOVIES
# NO POSTERLESS MOVIES
# NO DUPLICATES ACROSS HOME CATEGORIES
# TELUGU / INDIAN POPULAR PRIORITY
# =========================================================

@app.get("/movies/home")
def get_home_movies(
    limit: int = 11
):

    # -----------------------------------------------------
    # COMPLETE ENRICHED MOVIE POOL
    # -----------------------------------------------------

    movie_metadata = featured_metadata.copy()

    if movie_metadata.empty:
        return {
            "hero": [],
            "recommended": [],
            "trending": [],
            "new_releases": [],
            "top_rated": [],
            "blockbusters": [],
            "action": [],
            "romance": [],
            "drama": [],
            "crime": [],
            "comedy": [],
            "family": [],
            "award_winning": [],
            "hidden_gems": []
        }


    # -----------------------------------------------------
    # SAFE HELPERS
    # -----------------------------------------------------

    def to_number(value, default=0):

        if value is None:
            return default

        value = str(value).strip()

        if value.lower() in [
            "",
            "nan",
            "none",
            "n/a",
            "na",
            "null",
            "unknown",
            "not available"
        ]:
            return default

        try:
            cleaned = re.sub(
                r"[^0-9.]",
                "",
                value
            )

            return float(cleaned) if cleaned else default

        except Exception:
            return default


    def valid_text(value):

        if value is None:
            return False

        value = str(value).strip()

        return (
            value != ""
            and value.lower()
            not in [
                "nan",
                "none",
                "n/a",
                "na",
                "null",
                "unknown",
                "not available",
                "n/a"
            ]
        )


    def movie_title(row):

        return str(
            row.get("Title")
            or row.get("title")
            or ""
        ).strip()


    def movie_genre(row):

        return str(
            row.get("Genre")
            or row.get("genres")
            or ""
        ).lower()


    def movie_language(row):

        return str(
            row.get("Language")
            or row.get("language")
            or ""
        ).lower()


    def has_genre(row, keywords):

        genre = movie_genre(row)

        return any(
            str(keyword).lower() in genre
            for keyword in keywords
        )


    def has_poster(row):

        poster = (
            row.get("Poster")
            or row.get("poster")
            or row.get("poster_url")
            or row.get("image")
        )

        if not valid_text(poster):
            return False

        poster_text = str(poster).strip().lower()

        return poster_text.startswith(
            ("http://", "https://")
        )


    # -----------------------------------------------------
    # REMOVE POSTERLESS MOVIES ONLY FROM HOME SHOWCASE
    # DATASET / MODEL REMAINS UNTOUCHED
    # -----------------------------------------------------

    movie_metadata = movie_metadata[
        movie_metadata.apply(
            has_poster,
            axis=1
        )
    ].copy()


    # -----------------------------------------------------
    # SAFE NUMERIC COLUMNS
    # -----------------------------------------------------

    movie_metadata["_rating"] = movie_metadata.apply(
        lambda row: to_number(
            row.get("imdbRating", 0)
        ),
        axis=1
    )

    movie_metadata["_votes"] = movie_metadata.apply(
        lambda row: to_number(
            row.get("imdbVotes", 0)
        ),
        axis=1
    )

    movie_metadata["_year"] = movie_metadata.apply(
        lambda row: to_number(
            row.get("Year", 0)
        ),
        axis=1
    )

    movie_metadata["_boxoffice"] = movie_metadata.apply(
        lambda row: to_number(
            row.get("BoxOffice", 0)
        ),
        axis=1
    )


    # -----------------------------------------------------
    # CREATE UNIQUE MOVIE KEY
    # -----------------------------------------------------

    def movie_key(row):

        imdb_id = row.get("imdbID")

        if valid_text(imdb_id):
            return str(imdb_id).strip().lower()

        title = movie_title(row).lower()
        year = str(row.get("Year", "")).strip()

        return f"{title}-{year}"


    movie_metadata["_movie_key"] = movie_metadata.apply(
        movie_key,
        axis=1
    )

    movie_metadata = movie_metadata.drop_duplicates(
        subset=["_movie_key"],
        keep="first"
    ).copy()


    # -----------------------------------------------------
    # POPULAR INDIAN / TELUGU PRIORITY
    # THESE ARE ONLY PRIORITY MATCHES
    # IF AVAILABLE IN DATASET THEY APPEAR FIRST
    # -----------------------------------------------------

    priority_titles = [
        "salaar",
        "baahubali",
        "bahubali",
        "kgf",
        "pushpa",
        "rrr",
        "kalki",
        "devara",
        "arjun reddy",
        "eega",
        "magadheera",
        "ala vaikunthapurramuloo",
        "sye",
        "jersey"
    ]


    def priority_score(row):

        title = movie_title(row).lower()

        score = 0

        for index, keyword in enumerate(priority_titles):

            if keyword in title:
                score += (
                    len(priority_titles) - index
                ) * 10000

        language = movie_language(row)

        if "telugu" in language:
            score += 500

        if (
            "hindi" in language
            or "tamil" in language
            or "malayalam" in language
        ):
            score += 100

        return score


    movie_metadata["_priority"] = movie_metadata.apply(
        priority_score,
        axis=1
    )


    # -----------------------------------------------------
    # GLOBAL USED MOVIE TRACKER
    # ABSOLUTELY NO REPEATS BETWEEN HOME ROWS
    # -----------------------------------------------------

    used_movies = set()


    def prepare_unique_movies(
        dataframe,
        count,
        reason=None
    ):

        results = []

        if dataframe is None or dataframe.empty:
            return results

        for _, row in dataframe.iterrows():

            key = row.get("_movie_key")

            if key in used_movies:
                continue

            movie = normalize_movie_response(
                row.to_dict()
            )

            poster = (
                movie.get("poster")
                or movie.get("Poster")
                or movie.get("poster_url")
            )

            if not valid_text(poster):
                continue

            # Preserve language for frontend trailer logic
            movie["language"] = (
                row.get("Language")
                or row.get("language")
                or ""
            )

            movie["Language"] = movie["language"]

            # Preserve trailer search information
            movie["trailerQuery"] = (
                f'{movie_title(row)} '
                f'{row.get("Year", "")} '
                f'{movie["language"]} official trailer'
            ).strip()

            if reason:
                movie["recommendationReason"] = reason

            used_movies.add(key)

            results.append(movie)

            if len(results) >= count:
                break

        return sanitize_records(results)


    # -----------------------------------------------------
    # SORTED DATASETS
    # -----------------------------------------------------

    priority_df = movie_metadata.sort_values(
        [
            "_priority",
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            False,
            False
        ]
    )


    top_rated_df = movie_metadata.sort_values(
        [
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            False
        ]
    )


    trending_df = movie_metadata.sort_values(
        [
            "_votes",
            "_rating",
            "_priority"
        ],
        ascending=[
            False,
            False,
            False
        ]
    )


    latest_df = movie_metadata.sort_values(
        [
            "_year",
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            False,
            False
        ]
    )


    blockbuster_df = movie_metadata.sort_values(
        [
            "_boxoffice",
            "_votes",
            "_rating"
        ],
        ascending=[
            False,
            False,
            False
        ]
    )


    # -----------------------------------------------------
    # HERO
    # PRIORITY:
    # SALAAR → BAAHUBALI → KGF
    # THEN OTHER HIGH PRIORITY MOVIES
    # -----------------------------------------------------

    hero = prepare_unique_movies(
        priority_df,
        3,
        "Featured MovieMind pick"
    )


    # -----------------------------------------------------
    # RECOMMENDED
    # -----------------------------------------------------

    recommended = prepare_unique_movies(
        top_rated_df,
        limit,
        "Highly rated movie selected for you"
    )


    # -----------------------------------------------------
    # TRENDING
    # -----------------------------------------------------

    trending_movies = prepare_unique_movies(
        trending_df,
        limit,
        "Trending based on popularity and audience activity"
    )


    # -----------------------------------------------------
    # NEW RELEASES
    # -----------------------------------------------------

    new_releases = prepare_unique_movies(
        latest_df,
        limit,
        "Recent release from the MovieMind catalogue"
    )


    # -----------------------------------------------------
    # TOP RATED
    # -----------------------------------------------------

    top_rated_movies = prepare_unique_movies(
        top_rated_df,
        limit,
        "One of the highest rated movies in the catalogue"
    )


    # -----------------------------------------------------
    # BLOCKBUSTERS
    # -----------------------------------------------------

    blockbuster_movies = prepare_unique_movies(
        blockbuster_df,
        limit,
        "Major audience favourite and blockbuster selection"
    )


    # -----------------------------------------------------
    # GENRE CATEGORIES
    # -----------------------------------------------------

    action_df = movie_metadata[
        movie_metadata.apply(
            lambda row: has_genre(
                row,
                [
                    "action",
                    "thriller",
                    "adventure"
                ]
            ),
            axis=1
        )
    ].sort_values(
        [
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            False
        ]
    )


    romance_df = movie_metadata[
        movie_metadata.apply(
            lambda row: has_genre(
                row,
                [
                    "romance"
                ]
            ),
            axis=1
        )
    ].sort_values(
        [
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            False
        ]
    )


    drama_df = movie_metadata[
        movie_metadata.apply(
            lambda row: has_genre(
                row,
                [
                    "drama"
                ]
            ),
            axis=1
        )
    ].sort_values(
        [
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            False
        ]
    )


    crime_df = movie_metadata[
        movie_metadata.apply(
            lambda row: has_genre(
                row,
                [
                    "crime",
                    "mystery"
                ]
            ),
            axis=1
        )
    ].sort_values(
        [
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            False
        ]
    )


    comedy_df = movie_metadata[
        movie_metadata.apply(
            lambda row: has_genre(
                row,
                [
                    "comedy"
                ]
            ),
            axis=1
        )
    ].sort_values(
        [
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            False
        ]
    )


    family_df = movie_metadata[
        movie_metadata.apply(
            lambda row: has_genre(
                row,
                [
                    "family",
                    "animation",
                    "children"
                ]
            ),
            axis=1
        )
    ].sort_values(
        [
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            False
        ]
    )


    action_movies = prepare_unique_movies(
        action_df,
        limit,
        "Action-packed recommendation"
    )


    romance_movies = prepare_unique_movies(
        romance_df,
        limit,
        "Romance recommendation from the MovieMind catalogue"
    )


    drama_movies = prepare_unique_movies(
        drama_df,
        limit,
        "Strong story-driven recommendation"
    )


    crime_movies = prepare_unique_movies(
        crime_df,
        limit,
        "Crime and mystery recommendation"
    )


    comedy_movies = prepare_unique_movies(
        comedy_df,
        limit,
        "Feel-good comedy recommendation"
    )


    family_movies = prepare_unique_movies(
        family_df,
        limit,
        "Family entertainment recommendation"
    )


    # -----------------------------------------------------
    # AWARD WINNING STYLE
    # HIGH RATED + STRONG VOTES
    # -----------------------------------------------------

    award_df = movie_metadata[
        (
            movie_metadata["_rating"] >= 7.5
        )
        &
        (
            movie_metadata["_votes"] > 10000
        )
    ].sort_values(
        [
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            False
        ]
    )


    award_movies = prepare_unique_movies(
        award_df,
        limit,
        "Critically acclaimed and highly rated movie"
    )


    # -----------------------------------------------------
    # HIDDEN GEMS
    # GOOD RATING + LOWER VISIBILITY
    # -----------------------------------------------------

    hidden_df = movie_metadata[
        (
            movie_metadata["_rating"] >= 7.0
        )
        &
        (
            movie_metadata["_votes"] < 100000
        )
    ].sort_values(
        [
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            True
        ]
    )


    hidden_gems = prepare_unique_movies(
        hidden_df,
        limit,
        "A highly rated hidden gem worth discovering"
    )


    # -----------------------------------------------------
    # REMAINING MOVIES
    # IMPORTANT:
    # IF SOME OF THE 161 MOVIES ARE STILL UNUSED,
    # PUT THEM INTO EXISTING CATEGORY FLOW
    # -----------------------------------------------------

    remaining_df = movie_metadata[
        ~movie_metadata["_movie_key"].isin(
            used_movies
        )
    ].sort_values(
        [
            "_priority",
            "_rating",
            "_votes"
        ],
        ascending=[
            False,
            False,
            False
        ]
    )


    remaining_movies = prepare_unique_movies(
        remaining_df,
        len(remaining_df),
        "Explore more from the MovieMind movie catalogue"
    )


    # Add remaining movies progressively
    # so every valid enriched movie can be reached from Home

    category_order = [
        ("hidden_gems", hidden_gems),
        ("recommended", recommended),
        ("trending", trending_movies),
        ("blockbusters", blockbuster_movies),
        ("action", action_movies),
        ("drama", drama_movies),
        ("comedy", comedy_movies),
        ("family", family_movies)
    ]

    category_map = {
        "hidden_gems": hidden_gems,
        "recommended": recommended,
        "trending": trending_movies,
        "blockbusters": blockbuster_movies,
        "action": action_movies,
        "drama": drama_movies,
        "comedy": comedy_movies,
        "family": family_movies
    }

    index = 0

    while index < len(remaining_movies):

        for category_name, _ in category_order:

            if index >= len(remaining_movies):
                break

            category_map[category_name].append(
                remaining_movies[index]
            )

            index += 1




    # -----------------------------------------------------
    # FINAL CATEGORY BALANCING
    # Fill smaller categories with related movies
    # NO DUPLICATES
    # HERO IS NEVER MODIFIED
    # -----------------------------------------------------

    TARGET_CATEGORY_SIZE = 11

    category_priority_keywords = {
        "action": ["Action", "Adventure", "Thriller"],
        "romance": ["Romance", "Drama"],
        "drama": ["Drama", "Romance"],
        "crime": ["Crime", "Mystery", "Thriller"],
        "comedy": ["Comedy"],
        "family": ["Family", "Animation", "Children", "Fantasy"],
        "award_winning": ["Drama", "Biography", "History"],
        "hidden_gems": ["Drama", "Crime", "Comedy", "Thriller"]
    }


    # -----------------------------------------------------
    # GET ALL ALREADY USED MOVIES
    # -----------------------------------------------------

    used_titles = set()

    all_current_categories = {
        "hero": hero,
        "recommended": recommended,
        "trending": trending_movies,
        "new_releases": new_releases,
        "top_rated": top_rated_movies,
        "blockbusters": blockbuster_movies,
        "action": action_movies,
        "romance": romance_movies,
        "drama": drama_movies,
        "crime": crime_movies,
        "comedy": comedy_movies,
        "family": family_movies,
        "award_winning": award_movies,
        "hidden_gems": hidden_gems
    }


    for category_movies in all_current_categories.values():

        for movie in category_movies:

            title = str(
                movie.get("title")
                or movie.get("Title")
                or ""
            ).strip().lower()

            if title:
                used_titles.add(title)


    # -----------------------------------------------------
    # GET UNUSED VALID MOVIES
    # POSTER REQUIRED
    # -----------------------------------------------------

    remaining_movies = []

    for _, row in movie_metadata.iterrows():

        movie = normalize_movie_response(
            row.to_dict()
        )

        title = str(
            movie.get("title")
            or movie.get("Title")
            or ""
        ).strip()

        poster = str(
            movie.get("poster")
            or movie.get("Poster")
            or ""
        ).strip()

        if not title:
            continue

        if not poster:
            continue

        if poster.lower() in [
            "n/a",
            "nan",
            "none",
            "null",
            ""
        ]:
            continue

        if title.lower() in used_titles:
            continue

        remaining_movies.append(movie)


    # -----------------------------------------------------
    # FIND RELATED UNUSED MOVIES
    # -----------------------------------------------------

    def get_related_unused_movies(
        category_name,
        needed_count
    ):

        keywords = category_priority_keywords.get(
            category_name,
            []
        )

        related = []
        fallback = []

        for movie in remaining_movies:

            title = str(
                movie.get("title")
                or movie.get("Title")
                or ""
            ).strip().lower()

            if title in used_titles:
                continue

            genre = str(
                movie.get("genres")
                or movie.get("Genre")
                or ""
            ).lower()

            if any(
                keyword.lower() in genre
                for keyword in keywords
            ):
                related.append(movie)

            else:
                fallback.append(movie)


        selected = []


        # First select genre-related movies
        for movie in related:

            if len(selected) >= needed_count:
                break

            title = str(
                movie.get("title")
                or movie.get("Title")
                or ""
            ).strip().lower()

            if title not in used_titles:

                selected.append(movie)
                used_titles.add(title)


        # If related movies are not enough,
        # use remaining valid movies
        if len(selected) < needed_count:

            for movie in fallback:

                if len(selected) >= needed_count:
                    break

                title = str(
                    movie.get("title")
                    or movie.get("Title")
                    or ""
                ).strip().lower()

                if title not in used_titles:

                    selected.append(movie)
                    used_titles.add(title)


        return selected


    # -----------------------------------------------------
    # ONLY FILL SMALL CATEGORIES
    # HERO WILL NEVER CHANGE
    # -----------------------------------------------------

    category_lists = {
        "action": action_movies,
        "romance": romance_movies,
        "drama": drama_movies,
        "crime": crime_movies,
        "comedy": comedy_movies,
        "family": family_movies,
        "award_winning": award_movies,
        "hidden_gems": hidden_gems
    }


    for category_name, category_movies in category_lists.items():

        current_count = len(category_movies)

        if current_count < TARGET_CATEGORY_SIZE:

            needed = (
                TARGET_CATEGORY_SIZE
                - current_count
            )

            extra_movies = get_related_unused_movies(
                category_name,
                needed
            )

            category_movies.extend(
                extra_movies
            )


    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    return {
        "hero": hero,
        "recommended": recommended,
        "trending": trending_movies,
        "new_releases": new_releases,
        "top_rated": top_rated_movies,
        "blockbusters": blockbuster_movies,
        "action": action_movies,
        "romance": romance_movies,
        "drama": drama_movies,
        "crime": crime_movies,
        "comedy": comedy_movies,
        "family": family_movies,
        "award_winning": award_movies,
        "hidden_gems": hidden_gems
    }


# ROOT
# =========================================================

@app.get("/")
def root():

    return {

        "status": "online",

        "service":
        "Movie Recommendation API"

    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():

    return {

        "status": "healthy",

        "model":
        "Hybrid Recommendation",

        "featured_metadata_movies":
        len(featured_metadata)

    }


# =========================================================
# POPULAR
# =========================================================

@app.get("/movies/popular")
def get_popular_movies(
    limit: int = 20
):

    result = (
        catalogue
        .sort_values(
            [
                "rating_count",
                "avg_rating"
            ],
            ascending=[
                False,
                False
            ]
        )
        .head(limit)
    )

    return sanitize_records(
        result.to_dict(
            orient="records"
        )
    )


# =========================================================
# TOP RATED
# =========================================================

@app.get("/movies/top-rated")
def get_top_rated_movies(
    limit: int = 20
):

    result = catalogue[
        catalogue[
            "rating_count"
        ] >= 100
    ]

    result = (
        result
        .sort_values(
            [
                "avg_rating",
                "rating_count"
            ],
            ascending=[
                False,
                False
            ]
        )
        .head(limit)
    )

    return sanitize_records(
        result.to_dict(
            orient="records"
        )
    )


# =========================================================
# EXPLORE
# =========================================================

@app.get("/movies/explore")
def get_explore_movies(
    limit: int = 40
):

    result = catalogue[
        catalogue[
            "rating_count"
        ] > 0
    ]

    result = (
        result
        .sort_values(
            [
                "weighted_score",
                "rating_count"
            ],
            ascending=[
                False,
                False
            ]
        )
        .head(limit)
    )

    return sanitize_records(
        result.to_dict(
            orient="records"
        )
    )


# =========================================================
# MOVIES
# =========================================================

@app.get("/movies")
def get_movies(
    limit: int = 20
):

    result = movies[
        [
            "movieId",
            "title",
            "genres"
        ]
    ].head(limit)

    return sanitize_records(
        result.to_dict(
            orient="records"
        )
    )


# =========================================================
# DATASET ALPHABET BROWSE
# =========================================================

@app.get("/movies/browse")
def browse_movies(
    letter: str = "A",
    limit: int = 30
):

    selected_letter = (letter or "A").strip().upper()

    result = movies.copy()

    if selected_letter != "ALL":

        result = result[
            result["title"]
            .astype(str)
            .str.upper()
            .str.startswith(selected_letter)
        ]

    result = result[
        [
            "movieId",
            "title",
            "genres"
        ]
    ].head(limit)

    return sanitize_records(
        result.to_dict(
            orient="records"
        )
    )


# =========================================================
# SEARCH
# =========================================================

@app.get("/movies/search")
def search_movies_api(
    q: str,
    limit: int = 20
):

    if not q or not q.strip():
        return []

    query = q.lower().strip()
    results = []

    # =====================================================
    # MOVIEMIND FEATURED CATALOGUE SEARCH
    # Search ONLY movies available in our curated catalogue
    # =====================================================

    title_col = "title"

    featured_matches = featured_catalogue[
        featured_catalogue[title_col]
        .astype(str)
        .str.lower()
        .str.contains(
            query,
            na=False,
            regex=False
        )
    ].copy()

    # Remove duplicate titles
    featured_matches = featured_matches.drop_duplicates(
        subset=[title_col],
        keep="first"
    )

    for _, row in featured_matches.head(limit).iterrows():

        movie = normalize_movie_response(
            row.to_dict()
        )

        results.append(movie)

    return sanitize_records(results)


# =========================================================
# SIMILAR MOVIES
# =========================================================

# ---------------------------------------------------------
# EXTENDED / MISSING CATALOGUE SIMILAR MOVIES
# Used when a movie does not have a MovieLens movieId.
# ---------------------------------------------------------

@app.get("/similar/external")
def get_external_similar(
    title: str,
    year: str = None,
    language: str = None,
    top_k: int = 10
):

    try:

        missing_path = (
            MODEL_DIR
            / "featured_missing_movies.csv"
        )

        if not missing_path.exists():
            return {
                "title": title,
                "count": 0,
                "recommendations": []
            }

        extended_movies = pd.read_csv(
            missing_path
        )

        if extended_movies.empty:
            return {
                "title": title,
                "count": 0,
                "recommendations": []
            }

        query_title = str(title).strip().lower()

        candidates = extended_movies[
            extended_movies["title"]
            .astype(str)
            .str.lower()
            != query_title
        ].copy()

        if candidates.empty:
            return {
                "title": title,
                "count": 0,
                "recommendations": []
            }

        if language:
            language = str(language).strip().lower()

        category = None

        source_match = extended_movies[
            extended_movies["title"]
            .astype(str)
            .str.lower()
            == query_title
        ]

        if not source_match.empty:

            source_row = source_match.iloc[0]

            if not language:
                language = str(
                    source_row.get(
                        "language_code",
                        ""
                    )
                ).strip().lower()

            category = str(
                source_row.get(
                    "category",
                    ""
                )
            ).strip().lower()

        def similarity_score(row):

            score = 0

            row_language = str(
                row.get(
                    "language_code",
                    ""
                )
            ).strip().lower()

            row_category = str(
                row.get(
                    "category",
                    ""
                )
            ).strip().lower()

            if language and row_language == language:
                score += 100

            if category and row_category == category:
                score += 50

            if year:

                try:
                    year_difference = abs(
                        int(row.get("year"))
                        - int(year)
                    )

                    score += max(
                        0,
                        20 - year_difference
                    )

                except Exception:
                    pass

            return score

        candidates["similarity_score"] = (
            candidates.apply(
                similarity_score,
                axis=1
            )
        )

        candidates = candidates.sort_values(
            by=[
                "similarity_score",
                "year"
            ],
            ascending=[
                False,
                False
            ]
        )

        recommendations = []

        language_names = {
            "te": "Telugu",
            "hi": "Hindi",
            "ta": "Tamil",
            "ml": "Malayalam",
            "en": "English"
        }

        for _, row in candidates.head(
            top_k
        ).iterrows():

            language_code = str(
                row.get(
                    "language_code",
                    ""
                )
            ).strip().lower()

            row_language = language_names.get(
                language_code,
                language_code.upper()
            )

            movie = {
                "movieId": None,

                "title":
                    row.get("title"),

                "Title":
                    row.get("title"),

                "year":
                    row.get("year"),

                "Year":
                    row.get("year"),

                "language":
                    row_language,

                "Language":
                    row_language,

                "category":
                    row.get("category"),

                "genre": None,

                "poster": None,

                "Poster": None,

                "recommendationScore":
                    float(
                        row.get(
                            "similarity_score",
                            0
                        )
                    ),

                "recommendationReason":
                    "Recommended based on language, category and catalogue similarity.",

                "datasetAvailable":
                    False
            }

            recommendations.append(
                movie
            )

        return {
            "title": title,

            "count":
                len(recommendations),

            "recommendations":
                sanitize_records(
                    recommendations
                )
        }

    except Exception as error:

        print(
            f"External similar movies failed for {title}: {error}"
        )

        return {
            "title": title,
            "count": 0,
            "recommendations": []
        }


@app.get("/similar/{movie_id}")
def get_similar(
    movie_id: int,
    top_k: int = 10
):

    if movie_id not in movie_id_to_svd_index.index:

        raise HTTPException(
            status_code=404,
            detail="Movie not found in model."
        )

    idx = movie_id_to_svd_index[
        movie_id
    ]

    # =====================================================
    # FAST COSINE SIMILARITY
    # Movie vectors are already normalized at server startup.
    # Cosine similarity = dot product of normalized vectors.
    # =====================================================

    movie_vec = normalized_movie_latent_matrix[
        idx
    ]

    similarities = np.dot(
        normalized_movie_latent_matrix,
        movie_vec
    )

    top_indices = np.argsort(
        similarities
    )[::-1][:top_k + 1]

    recommendations = []

    for i in top_indices:

        if i == idx:

            continue

        m_id = int(
            movies.iloc[i]["movieId"]
        )

        movie = enrich_movie_response(

            movie_id=m_id,

            title=movies.iloc[i]["title"],

            genres=movies.iloc[i]["genres"],

            score=float(
                similarities[i]
            ),

            reason=(
                "Users who liked this movie "
                "had similar movie preferences."
            )
        )

        if movie:

            recommendations.append(
                movie
            )

        if len(
            recommendations
        ) >= top_k:

            break

    return {

        "movieId":
        movie_id,

        "count":
        len(recommendations),

        "recommendations":
        sanitize_records(
            recommendations
        )

    }


# =========================================================
# USER RECOMMENDATIONS
# =========================================================

@app.get("/recommend/{user_id}")
def recommend(
    user_id: int,
    top_k: int = 10
):

    if user_id not in user_id_to_index.index:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user_index = user_id_to_index[
        user_id
    ]

    scores = (
        user_latent_matrix[
            user_index
        ]
        @
        movie_latent_matrix.T
    )

    top_indices = np.argsort(
        scores
    )[::-1]

    recommendations = []

    for index in top_indices:

        movie_id = int(
            movies.iloc[index]["movieId"]
        )

        movie = enrich_movie_response(

            movie_id=movie_id,

            title=movies.iloc[index]["title"],

            genres=movies.iloc[index]["genres"],

            score=float(
                scores[index]
            ),

            reason=(
                "Recommended based on your "
                "personal rating history and "
                "movie preference pattern."
            )
        )

        if movie:

            recommendations.append(
                movie
            )

        if len(
            recommendations
        ) >= top_k:

            break

    return {

        "user_id":
        user_id,

        "count":
        len(recommendations),

        "recommendations":
        sanitize_records(
            recommendations
        )

    }


# =========================================================
# ANALYTICS
# =========================================================

@app.get("/analytics")
def analytics():

    num_users = len(user_id_to_index)
    num_movies = len(movie_id_to_svd_index)

    # Dynamically calculate genre distribution
    genre_counts = {}
    if 'genres' in movies.columns:
        for g_str in movies['genres'].dropna():
            if str(g_str).strip() in ['(no genres listed)', 'N/A', '']:
                continue
            for genre in str(g_str).split('|'):
                genre = genre.strip()
                if genre:
                    genre_counts[genre] = genre_counts.get(genre, 0) + 1
    
    top_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_genres_list = [{"name": k, "value": v} for k, v in top_genres]

    # Dynamically calculate rating distribution from featured metadata
    rating_counts = {'1 Star': 0, '2 Stars': 0, '3 Stars': 0, '4 Stars': 0, '5 Stars': 0}
    if 'imdbRating' in featured_metadata.columns:
        for r_str in featured_metadata['imdbRating'].dropna():
            try:
                r = float(r_str)
                if r <= 2.0: rating_counts['1 Star'] += 1
                elif r <= 4.0: rating_counts['2 Stars'] += 1
                elif r <= 6.0: rating_counts['3 Stars'] += 1
                elif r <= 8.0: rating_counts['4 Stars'] += 1
                else: rating_counts['5 Stars'] += 1
            except:
                pass

    total_ratings_counted = sum(rating_counts.values()) or 1
    rating_dist = [{"name": k, "value": round((v / total_ratings_counted) * 100, 1)} for k, v in rating_counts.items()]

    return {
        "stats": {
            "Total Users": f"{num_users:,}",
            "Total Movies": f"{len(movies):,}",
            "Model Movies": f"{num_movies:,}",
            "Matrix Sparsity": "99.84%",
            "Total Ratings": "25.6M+"
        },
        "charts": {
            "rating_distribution": rating_dist,
            "top_genres": top_genres_list
        }
    }


# =========================================================
# EXTERNAL OMDB SEARCH
# =========================================================

@app.get("/external/search")
def external_movie_search(
    q: str,
    page: int = 1
):

    if not q.strip():

        return {

            "query":
            q,

            "count":
            0,

            "results":
            []

        }

    results = search_movies(
        q,
        page
    )

    return {

        "query":
        q,

        "count":
        len(results),

        "results":
        results

    }


# =========================================================
# EXTERNAL MOVIE DETAILS
# =========================================================

@app.get("/external/movie/{imdb_id}")
def external_movie_details(
    imdb_id: str
):

    movie = get_movie_details(
        imdb_id
    )

    if movie is None:

        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )

    return movie


# =========================================================
# UNIVERSAL TMDB MOVIE SEARCH
# ANY MOVIE → POSTER + DETAILS + CAST + TRAILER
# =========================================================

@app.get("/universal/search")
def universal_movie_search(q: str):

    clean_query = q.strip()

    if not clean_query:
        return {
            "query": q,
            "found": False,
            "movie": None
        }

    # -------------------------------------------------
    # LOCAL CATALOGUE SEARCH
    # -------------------------------------------------

    search_text = clean_query.lower()

    matches = movies[
        movies["title"]
        .astype(str)
        .str.lower()
        .str.contains(
            re.escape(search_text),
            na=False
        )
    ].copy()

    if matches.empty:

        # -------------------------------------------------
        # FEATURED MISSING MOVIES FALLBACK
        # Search local missing/ambiguous movie catalogue first
        # -------------------------------------------------

        try:

            missing_path = (
                MODEL_DIR
                / "featured_missing_movies.csv"
            )

            if missing_path.exists():

                missing_movies = pd.read_csv(
                    missing_path
                )

                title_column = None

                for column in missing_movies.columns:

                    if column.lower() in [
                        "title",
                        "movie_title",
                        "name"
                    ]:
                        title_column = column
                        break

                if title_column:

                    missing_matches = missing_movies[
                        missing_movies[title_column]
                        .astype(str)
                        .str.lower()
                        .str.contains(
                            re.escape(clean_query.lower()),
                            na=False
                        )
                    ]

                    if not missing_matches.empty:

                        row = (
                            missing_matches
                            .iloc[0]
                            .to_dict()
                        )

                        movie = {
                            "movieId":
                                row.get("movieId"),

                            "title":
                                row.get(title_column)
                                or clean_query,

                            "Title":
                                row.get(title_column)
                                or clean_query,

                            "year":
                                row.get("year")
                                or row.get("Year"),

                            "Year":
                                row.get("Year")
                                or row.get("year"),

                            "poster":
                                row.get("Poster")
                                or row.get("poster"),

                            "Poster":
                                row.get("Poster")
                                or row.get("poster"),

                            "rating":
                                row.get("imdbRating")
                                or row.get("rating"),

                            "imdbRating":
                                row.get("imdbRating")
                                or row.get("rating"),

                            "genre":
                                row.get("Genre")
                                or row.get("genres"),

                            "Genre":
                                row.get("Genre")
                                or row.get("genres"),

                            "overview":
                                row.get("Plot")
                                or row.get("overview"),

                            "plot":
                                row.get("Plot")
                                or row.get("overview"),

                            "director":
                                row.get("Director"),

                            "cast": [],

                            "trailer": None,

                            "recommendationReason":
                                "Movie found in the extended local catalogue.",

                            "datasetAvailable": False
                        }

                        return sanitize_records([
                            {
                                "query": clean_query,
                                "found": True,
                                "movie": movie
                            }
                        ])[0]

        except Exception as error:

            print(
                f"Missing catalogue fallback failed for {clean_query}: {error}"
            )

        # -------------------------------------------------
        # EXTERNAL FALLBACK
        # Local MovieLens catalogue does not contain movie
        # -------------------------------------------------

        try:

            external_results = search_movies(
                clean_query,
                1
            )

            if external_results:

                first_result = external_results[0]

                imdb_id = (
                    first_result.get("imdbID")
                    or first_result.get("imdb_id")
                )

                if imdb_id:

                    full_movie = get_movie_details(
                        imdb_id
                    )

                    if full_movie:

                        actors_value = (
                            full_movie.get("Actors")
                            or ""
                        )

                        cast_list = [
                            x.strip()
                            for x in str(actors_value).split(",")
                            if x.strip()
                        ]

                        movie = {
                            "movieId": None,
                            "imdbID": imdb_id,

                            "title":
                                full_movie.get("Title")
                                or first_result.get("Title")
                                or clean_query,

                            "Title":
                                full_movie.get("Title")
                                or first_result.get("Title")
                                or clean_query,

                            "year":
                                full_movie.get("Year"),

                            "Year":
                                full_movie.get("Year"),

                            "poster":
                                full_movie.get("Poster"),

                            "Poster":
                                full_movie.get("Poster"),

                            "rating":
                                full_movie.get("imdbRating"),

                            "imdbRating":
                                full_movie.get("imdbRating"),

                            "voteCount":
                                full_movie.get("imdbVotes"),

                            "genre":
                                full_movie.get("Genre"),

                            "Genre":
                                full_movie.get("Genre"),

                            "runtime":
                                full_movie.get("Runtime"),

                            "overview":
                                full_movie.get("Plot"),

                            "plot":
                                full_movie.get("Plot"),

                            "director":
                                full_movie.get("Director"),

                            "cast":
                                cast_list,

                            "Actors":
                                full_movie.get("Actors"),

                            "Language":
                                full_movie.get("Language"),

                            "Country":
                                full_movie.get("Country"),

                            "trailer":
                                full_movie.get("Trailer"),

                            "recommendationReason":
                                "Movie details loaded on demand from external movie metadata.",

                            "datasetAvailable": False
                        }

                        return sanitize_records([
                            {
                                "query": clean_query,
                                "found": True,
                                "movie": movie
                            }
                        ])[0]

        except Exception as error:

            print(
                f"External fallback failed for {clean_query}: {error}"
            )

        return {
            "query": clean_query,
            "found": False,
            "movie": None
        }

    # -------------------------------------------------
    # SMART SEARCH RANKING V2
    # -------------------------------------------------

    def normalize_title(value):
        value = str(value).lower().strip()

        # Remove year
        value = re.sub(
            r"\s*\(\d{4}\)",
            "",
            value
        ).strip()

        # Convert "Godfather, The" -> "the godfather"
        value = re.sub(
            r"^(.*),\s*(the|a|an)$",
            r"\2 \1",
            value
        )

        # Remove punctuation
        value = re.sub(
            r"[^a-z0-9\s]",
            " ",
            value
        )

        # Normalize spaces
        value = re.sub(
            r"\s+",
            " ",
            value
        ).strip()

        # Remove leading articles
        value = re.sub(
            r"^(the|a|an)\s+",
            "",
            value
        ).strip()

        return value

    normalized_query = normalize_title(clean_query)

    matches["normalized_title"] = (
        matches["title"]
        .astype(str)
        .apply(normalize_title)
    )

    # Exact complete title
    matches["exact_match"] = (
        matches["normalized_title"]
        == normalized_query
    )

    # Query must be a complete word / phrase.
    # Example: Pushpa matches "Pushpa: The Rise"
    # but NOT "Pushpak".
    boundary_pattern = (
        r"(^|\s)"
        + re.escape(normalized_query)
        + r"($|\s)"
    )

    matches["word_match"] = (
        matches["normalized_title"]
        .str.contains(
            boundary_pattern,
            regex=True,
            na=False
        )
    )

    # Starts with complete query words
    matches["starts_with_query"] = (
        matches["normalized_title"]
        .str.startswith(
            normalized_query + " ",
            na=False
        )
        |
        (
            matches["normalized_title"]
            == normalized_query
        )
    )

    matches["title_length"] = (
        matches["normalized_title"]
        .str.len()
    )

    matches = matches.sort_values(
        by=[
            "word_match",
            "starts_with_query",
            "exact_match",
            "title_length",
            "movieId"
        ],
        ascending=[
            False,
            False,
            False,
            True,
            True
        ]
    )

    best = matches.iloc[0]

    movie_id = int(best["movieId"])
    title = str(best["title"])
    genres = str(best.get("genres", "Movie"))

    # Extract year from title
    year_match = re.search(
        r"\((\d{4})\)",
        title
    )

    year = (
        year_match.group(1)
        if year_match
        else None
    )

    # Remove year from display title
    clean_title = re.sub(
        r"\s*\(\d{4}\)",
        "",
        title
    ).strip()

    # -------------------------------------------------
    # FEATURED METADATA ENRICHMENT
    # -------------------------------------------------

    metadata = featured_metadata[
        featured_metadata["movieId"]
        .astype(str)
        .str.replace(".0", "", regex=False)
        == str(movie_id)
    ]

    metadata_row = (
        metadata.iloc[0].to_dict()
        if not metadata.empty
        else {}
    )

    actors_value = metadata_row.get("Actors", "")
    cast_list = (
        [x.strip() for x in str(actors_value).split(",") if x.strip()]
        if actors_value and str(actors_value) != "nan"
        else []
    )

    movie = {
        "movieId": movie_id,
        "tmdbId": None,

        "title": metadata_row.get("Title") or clean_title,
        "Title": metadata_row.get("Title") or clean_title,

        "year": metadata_row.get("Year") or year,
        "Year": metadata_row.get("Year") or year,

        "poster": metadata_row.get("Poster") or None,
        "Poster": metadata_row.get("Poster") or None,
        "backdrop": None,

        "rating": metadata_row.get("imdbRating") or None,
        "voteCount": metadata_row.get("imdbVotes") or None,

        "genre": metadata_row.get("Genre") or genres,
        "Genre": metadata_row.get("Genre") or genres,

        "runtime": metadata_row.get("Runtime") or None,

        "overview": metadata_row.get("Plot") or None,
        "plot": metadata_row.get("Plot") or None,

        "director": metadata_row.get("Director") or None,
        "cast": cast_list,

        "trailer": None,

        "recommendationReason":
            "Movie found in the MovieMind catalogue. "
            "Available local metadata has been enriched for the movie.",

        "datasetAvailable": True
    }

    return sanitize_records([
        {
            "query": clean_query,
            "found": True,
            "movie": movie
        }
    ])[0]

