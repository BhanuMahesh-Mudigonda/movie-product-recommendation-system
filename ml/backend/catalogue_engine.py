import os
import re
import pandas as pd
import numpy as np
from difflib import SequenceMatcher


# ============================================================
# MOVIEMIND MASTER CATALOGUE ENGINE
# ============================================================

class MovieMindCatalogueEngine:

    def __init__(self):
        print("\n" + "=" * 90)
        print("MOVIEMIND MASTER CATALOGUE ENGINE")
        print("=" * 90)

        base_dir = os.path.dirname(
            os.path.dirname(
                os.path.dirname(os.path.abspath(__file__))
            )
        )

        self.catalogue_path = os.path.join(
            base_dir,
            "backend",
            "data",
            "catalogue",
            "moviemind_master_catalogue.csv"
        )

        print("\nLoading master catalogue...")
        print(self.catalogue_path)

        if not os.path.exists(self.catalogue_path):
            raise FileNotFoundError(
                f"Master catalogue not found:\n{self.catalogue_path}"
            )

        # ----------------------------------------------------
        # LOAD DATA
        # ----------------------------------------------------

        self.movies = pd.read_csv(
            self.catalogue_path,
            low_memory=False
        )

        print(f"\nMovies loaded: {len(self.movies):,}")

        # ----------------------------------------------------
        # CLEAN TEXT COLUMNS
        # ----------------------------------------------------

        text_columns = [
            "title",
            "original_title",
            "genres",
            "language",
            "overview",
            "poster_url",
            "director",
            "actors",
            "runtime",
            "country",
            "trailer"
        ]

        for column in text_columns:
            if column in self.movies.columns:
                self.movies[column] = (
                    self.movies[column]
                    .fillna("")
                    .astype(str)
                    .str.strip()
                )

        # ----------------------------------------------------
        # NUMERIC COLUMNS
        # ----------------------------------------------------

        numeric_columns = [
            "moviemind_id",
            "year",
            "rating",
            "vote_count",
            "popularity"
        ]

        for column in numeric_columns:
            if column in self.movies.columns:
                self.movies[column] = pd.to_numeric(
                    self.movies[column],
                    errors="coerce"
                )

        # ----------------------------------------------------
        # SEARCH NORMALIZATION
        # ----------------------------------------------------

        self.movies["search_title"] = (
            self.movies["title"]
            .fillna("")
            .astype(str)
            .apply(self.normalize_text)
        )

        self.movies["search_original_title"] = (
            self.movies["original_title"]
            .fillna("")
            .astype(str)
            .apply(self.normalize_text)
        )

        print("Search index created.")

        print("\n" + "=" * 90)
        print("CATALOGUE ENGINE READY 🔥")
        print(f"TOTAL MOVIES: {len(self.movies):,}")
        print("=" * 90)

    # ========================================================
    # TEXT NORMALIZATION
    # ========================================================

    @staticmethod
    def normalize_text(text):
        if not text:
            return ""

        text = str(text).lower()
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        text = re.sub(r"\s+", " ", text)

        return text.strip()

    # ========================================================
    # LANGUAGE FORMAT
    # ========================================================

    @staticmethod
    def format_language(language):

        language_map = {
            "en": "English",
            "te": "Telugu",
            "ta": "Tamil",
            "hi": "Hindi",
            "ml": "Malayalam",
            "kn": "Kannada",
            "bn": "Bengali",
            "mr": "Marathi",
            "fr": "French",
            "es": "Spanish",
            "de": "German",
            "ja": "Japanese",
            "ko": "Korean",
            "zh": "Chinese",
            "ru": "Russian",
            "it": "Italian",
            "pt": "Portuguese",
            "ar": "Arabic",
            "Unknown": "Unknown"
        }

        if not language:
            return "Unknown"

        language = str(language).strip()

        return language_map.get(
            language.lower(),
            language
        )

    # ========================================================
    # CLEAN MOVIE RESPONSE
    # ========================================================

    def movie_to_dict(self, movie):

        def safe_value(value, default=None):

            if value is None:
                return default

            try:
                if pd.isna(value):
                    return default
            except Exception:
                pass

            if isinstance(value, str):
                value = value.strip()

                if value == "" or value.lower() == "nan":
                    return default

                return value

            if isinstance(value, np.integer):
                return int(value)

            if isinstance(value, np.floating):
                value = float(value)

                if np.isnan(value) or np.isinf(value):
                    return default

                return value

            if isinstance(value, np.bool_):
                return bool(value)

            return value

        rating = safe_value(movie.get("rating"))

        if rating is not None:
            try:
                rating = round(float(rating), 1)
            except Exception:
                rating = None

        year = safe_value(movie.get("year"))

        if year is not None:
            try:
                year = int(float(year))
            except Exception:
                year = None

        return {

            "moviemind_id": safe_value(
                movie.get("moviemind_id")
            ),

            "tmdb_id": safe_value(
                movie.get("tmdb_id")
            ),

            "title": safe_value(
                movie.get("title"),
                "Unknown Title"
            ),

            "original_title": safe_value(
                movie.get("original_title")
            ),

            "year": year,

            "release_date": safe_value(
                movie.get("release_date")
            ),

            "genres": safe_value(
                movie.get("genres"),
                ""
            ),

            "rating": rating,

            "vote_count": safe_value(
                movie.get("vote_count")
            ),

            "popularity": safe_value(
                movie.get("popularity")
            ),

            "language": self.format_language(
                safe_value(movie.get("language"), "")
            ),

            "overview": safe_value(
                movie.get("overview"),
                ""
            ),

            "poster_url": safe_value(
                movie.get("poster_url")
            ),

            "director": safe_value(
                movie.get("director")
            ),

            "actors": safe_value(
                movie.get("actors")
            ),

            "runtime": safe_value(
                movie.get("runtime")
            ),

            "country": safe_value(
                movie.get("country")
            ),

            "trailer": safe_value(
                movie.get("trailer")
            ),

            "source": safe_value(
                movie.get("source")
            )
        }

    # ========================================================
    # SEARCH MOVIES
    # ========================================================

    def search_movies(self, query, limit=20):

        if not query or not str(query).strip():
            return []

        query_normalized = self.normalize_text(query)

        if not query_normalized:
            return []

        # ----------------------------------------------------
        # EXACT TITLE MATCH
        # ----------------------------------------------------

        exact = self.movies[
            self.movies["search_title"]
            == query_normalized
        ]

        # ----------------------------------------------------
        # TITLE STARTS WITH QUERY
        # ----------------------------------------------------

        starts = self.movies[
            self.movies["search_title"]
            .str.startswith(query_normalized, na=False)
        ]

        # ----------------------------------------------------
        # TITLE CONTAINS QUERY
        # ----------------------------------------------------

        contains = self.movies[
            self.movies["search_title"]
            .str.contains(
                query_normalized,
                na=False,
                regex=False
            )
        ]

        # ----------------------------------------------------
        # ORIGINAL TITLE SEARCH
        # ----------------------------------------------------

        original = self.movies[
            self.movies["search_original_title"]
            .str.contains(
                query_normalized,
                na=False,
                regex=False
            )
        ]

        # ----------------------------------------------------
        # COMBINE RESULTS
        # ----------------------------------------------------

        results = pd.concat([
            exact,
            starts,
            contains,
            original
        ])

        results = results.drop_duplicates(
            subset=["moviemind_id"]
        )

        # ----------------------------------------------------
        # SORT BEST RESULTS
        # ----------------------------------------------------

        results = results.copy()

        results["rating_sort"] = (
            pd.to_numeric(
                results["rating"],
                errors="coerce"
            )
            .fillna(0)
        )

        results["popularity_sort"] = (
            pd.to_numeric(
                results["popularity"],
                errors="coerce"
            )
            .fillna(0)
        )

        results = results.sort_values(
            by=[
                "rating_sort",
                "popularity_sort"
            ],
            ascending=[
                False,
                False
            ]
        )

        results = results.head(limit)

        return [
            self.movie_to_dict(movie)
            for _, movie in results.iterrows()
        ]

    # ========================================================
    # GET MOVIE BY ID
    # ========================================================

    def get_movie(self, moviemind_id):

        try:
            moviemind_id = int(moviemind_id)
        except Exception:
            return None

        result = self.movies[
            self.movies["moviemind_id"]
            == moviemind_id
        ]

        if result.empty:
            return None

        movie = result.iloc[0]

        return self.movie_to_dict(movie)

    # ========================================================
    # FIND SIMILAR MOVIES
    # ========================================================

    def get_similar_movies(
        self,
        moviemind_id,
        limit=10
    ):

        try:
            moviemind_id = int(moviemind_id)
        except Exception:
            return []

        current_movie = self.movies[
            self.movies["moviemind_id"]
            == moviemind_id
        ]

        if current_movie.empty:
            return []

        movie = current_movie.iloc[0]

        current_genres = set(
            str(movie.get("genres", ""))
            .lower()
            .split("|")
        )

        current_genres.discard("")

        current_language = str(
            movie.get("language", "")
        ).strip().lower()

        current_year = movie.get("year")

        candidates = self.movies[
            self.movies["moviemind_id"]
            != moviemind_id
        ].copy()

        # ----------------------------------------------------
        # GENRE SIMILARITY SCORE
        # ----------------------------------------------------

        def genre_score(genres):

            genres_set = set(
                str(genres)
                .lower()
                .split("|")
            )

            genres_set.discard("")

            if not current_genres:
                return 0

            intersection = len(
                current_genres.intersection(
                    genres_set
                )
            )

            union = len(
                current_genres.union(
                    genres_set
                )
            )

            if union == 0:
                return 0

            return intersection / union

        candidates["genre_score"] = (
            candidates["genres"]
            .apply(genre_score)
        )

        # ----------------------------------------------------
        # LANGUAGE SCORE
        # ----------------------------------------------------

        candidates["language_score"] = (
            candidates["language"]
            .astype(str)
            .str.lower()
            .eq(current_language)
            .astype(float)
        )

        # ----------------------------------------------------
        # YEAR SCORE
        # ----------------------------------------------------

        if pd.notna(current_year):

            current_year = float(current_year)

            candidates["year_difference"] = (
                pd.to_numeric(
                    candidates["year"],
                    errors="coerce"
                )
                .sub(current_year)
                .abs()
            )

            candidates["year_score"] = (
                1
                / (
                    1
                    + candidates["year_difference"]
                    .fillna(100)
                )
            )

        else:

            candidates["year_score"] = 0

        # ----------------------------------------------------
        # RATING SCORE
        # ----------------------------------------------------

        candidates["rating_score"] = (
            pd.to_numeric(
                candidates["rating"],
                errors="coerce"
            )
            .fillna(0)
            / 10
        )

        # ----------------------------------------------------
        # FINAL SIMILARITY SCORE
        # ----------------------------------------------------

        candidates["similarity_score"] = (

            candidates["genre_score"] * 0.55

            + candidates["language_score"] * 0.15

            + candidates["year_score"] * 0.10

            + candidates["rating_score"] * 0.20
        )

        # ----------------------------------------------------
        # BEST MOVIES
        # ----------------------------------------------------

        similar = candidates.sort_values(
            by="similarity_score",
            ascending=False
        ).head(limit)

        return [
            self.movie_to_dict(movie)
            for _, movie in similar.iterrows()
        ]


# ============================================================
# GLOBAL ENGINE INSTANCE
# ============================================================

catalogue_engine = MovieMindCatalogueEngine()
