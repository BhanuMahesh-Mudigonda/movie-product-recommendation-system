from typing import Optional, Dict
import pandas as pd
from pathlib import Path
import joblib

try:
    from omdb_service import get_movie_details
    from tmdb_service import get_tmdb_id_from_imdb, get_tmdb_movie_details, extract_trailer, extract_watch_providers, search_tmdb_by_title
except ImportError:
    from ml.backend.omdb_service import get_movie_details
    from ml.backend.tmdb_service import get_tmdb_id_from_imdb, get_tmdb_movie_details, extract_trailer, extract_watch_providers, search_tmdb_by_title

# In-memory cache to prevent repeated API calls
# Structure: { "tt1234567": {...unified_movie_object...}, "272417_2022": {...} }
_MOVIE_CACHE = {}

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

class UniversalMovieResolver:
    def __init__(self):
        try:
            self.movie_enrichment = pd.read_pickle(MODEL_DIR / "movie_enrichment.pkl")
            if "movieId" in self.movie_enrichment.columns:
                self.movie_enrichment = self.movie_enrichment.drop_duplicates(subset=["movieId"])
                self.movie_enrichment.set_index("movieId", inplace=True)
            else:
                self.movie_enrichment = pd.DataFrame()
        except Exception as e:
            print(f"Warning: Could not load movie_enrichment.pkl - {e}")
            self.movie_enrichment = pd.DataFrame()
            
        try:
            self.movie_catalogue_base = pd.read_pickle(MODEL_DIR / "movie_catalogue_base.pkl")
            if "movieId" in self.movie_catalogue_base.columns:
                self.movie_catalogue_base = self.movie_catalogue_base.drop_duplicates(subset=["movieId"])
                self.movie_catalogue_base.set_index("movieId", inplace=True)
            else:
                self.movie_catalogue_base = pd.DataFrame()
        except Exception as e:
            print(f"Warning: Could not load movie_catalogue_base.pkl - {e}")
            self.movie_catalogue_base = pd.DataFrame()

    def _get_cache_key(self, base_info: dict) -> str:
        imdb_id = base_info.get("imdbID")
        if imdb_id and str(imdb_id) != "nan":
            return f"imdb_{imdb_id}"
        
        movie_id = base_info.get("movieId")
        year = base_info.get("year") or base_info.get("Year") or ""
        if movie_id:
            return f"local_{movie_id}_{year}"
            
        return ""

    def resolve_and_enrich(self, base_info: dict) -> dict:
        """
        Takes basic info (like from featured_catalogue, search results, or recommendation results)
        and builds a unified movie object.
        """
        cache_key = self._get_cache_key(base_info)
        
        if cache_key and cache_key in _MOVIE_CACHE:
            return _MOVIE_CACHE[cache_key].copy()

        # 1. Start with the base info
        movie_id = base_info.get("movieId")
        if movie_id and not pd.isna(movie_id):
            movie_id = int(movie_id)
        else:
            movie_id = None
            
        imdb_id = base_info.get("imdbID")
        if pd.isna(imdb_id):
            imdb_id = None
            
        # Unified Object skeleton
        unified = {
            "movieId": movie_id,
            "title": str(base_info.get("title") or base_info.get("Title") or "").strip() or None,
            "year": str(base_info.get("year") or base_info.get("Year") or "").strip() or None,
            "poster": base_info.get("Poster") or base_info.get("poster") or base_info.get("poster_url") or base_info.get("image"),
            "imdbID": imdb_id,
            "imdbRating": base_info.get("imdbRating") or base_info.get("rating"),
            "genre": base_info.get("Genre") or base_info.get("genres") or base_info.get("genre"),
            "director": base_info.get("Director") or base_info.get("director"),
            "cast": base_info.get("Actors") or base_info.get("actors") or base_info.get("cast"),
            "runtime": base_info.get("Runtime") or base_info.get("runtime"),
            "language": base_info.get("Language") or base_info.get("language"),
            "country": base_info.get("Country") or base_info.get("country"),
            "plot": base_info.get("Plot") or base_info.get("plot"),
            "trailer": base_info.get("trailer"),
            "whereToWatch": base_info.get("whereToWatch") or [],
            "recommendationScore": base_info.get("score") or base_info.get("recommendationScore"),
            "recommendationReason": base_info.get("reason") or base_info.get("recommendationReason"),
        }
        
        # Format "N/A" to None
        for k, v in unified.items():
            if v == "N/A":
                unified[k] = None

        # 2. Local Enrichment (Priority 2)
        if movie_id and not self.movie_enrichment.empty and movie_id in self.movie_enrichment.index:
            local_e = self.movie_enrichment.loc[movie_id]
            # only overwrite if the unified field is empty
            for field, local_key in [
                ("poster", "Poster"),
                ("imdbRating", "imdbRating"),
                ("genre", "Genre"),
                ("director", "Director"),
                ("cast", "Actors"),
                ("runtime", "Runtime"),
                ("language", "Language"),
                ("country", "Country"),
                ("plot", "Plot"),
                ("imdbID", "imdbID") # in case enrichment has the imdbID
            ]:
                val = local_e.get(local_key)
                if val and str(val) != "nan" and val != "N/A":
                    if not unified[field]:
                        unified[field] = val
                        
        if not unified["imdbID"] and movie_id and not self.movie_catalogue_base.empty and movie_id in self.movie_catalogue_base.index:
            base_e = self.movie_catalogue_base.loc[movie_id]
            val = base_e.get("imdbID")
            if val and str(val) != "nan" and val != "N/A":
                unified["imdbID"] = val
                
        # Format OMDB/TMDB search fallback if imdbID still missing but we have title
        try:
            if not unified["imdbID"] and unified["title"]:
                # Maybe OMDB can find it by title and year
                omdb_data = get_movie_details(unified["title"], year=unified["year"])
                if omdb_data and omdb_data.get("Response") == "True" and omdb_data.get("imdbID"):
                    unified["imdbID"] = omdb_data.get("imdbID")
                    # Pre-fill some OMDB data since we just fetched it
                    for field, omdb_key in [
                        ("poster", "Poster"),
                        ("imdbRating", "imdbRating"),
                        ("genre", "Genre"),
                        ("director", "Director"),
                        ("cast", "Actors"),
                        ("runtime", "Runtime"),
                        ("language", "Language"),
                        ("country", "Country"),
                        ("plot", "Plot")
                    ]:
                        val = omdb_data.get(omdb_key)
                        if val and val != "N/A" and not unified[field]:
                            unified[field] = val
                            
                # If OMDB failed (e.g. key expired), try TMDB search
                if not unified["imdbID"] and not unified["poster"]:
                    tmdb_search = search_tmdb_by_title(unified["title"], year=unified["year"])
                    if tmdb_search:
                        unified["tmdb_id"] = tmdb_search.get("id")
                        if tmdb_search.get("poster_path") and not unified["poster"]:
                            unified["poster"] = f"https://image.tmdb.org/t/p/w500{tmdb_search['poster_path']}"
                        if tmdb_search.get("overview") and not unified["plot"]:
                            unified["plot"] = tmdb_search.get("overview")
                        if tmdb_search.get("vote_average") and not unified["imdbRating"]:
                            unified["imdbRating"] = str(round(tmdb_search.get("vote_average"), 1))
        except Exception as e:
            print(f"[RESOLVER EXTERNAL SEARCH ERROR] {unified.get('title')}: {e}")

        # 3. OMDB Details (Priority 3/4)
        try:
            if unified["imdbID"]:
                omdb_data = get_movie_details(unified["imdbID"])
                if omdb_data:
                    for field, omdb_key in [
                        ("poster", "Poster"),
                        ("imdbRating", "imdbRating"),
                        ("genre", "Genre"),
                        ("director", "Director"),
                        ("cast", "Actors"),
                        ("runtime", "Runtime"),
                        ("language", "Language"),
                        ("country", "Country"),
                        ("plot", "Plot"),
                        ("title", "Title"),
                        ("year", "Year")
                    ]:
                        val = omdb_data.get(omdb_key)
                        if val and val != "N/A":
                            if not unified[field] or (field == "poster" and not unified[field].startswith("http")):
                                unified[field] = val
        except Exception as e:
            print(f"[RESOLVER OMDB ERROR] {unified.get('imdbID')}: {e}")
                            
        # 4. TMDB Details (Priority 5 for trailer/watch-providers/posters)
        try:
            tmdb_id = unified.get("tmdb_id")
            if not tmdb_id and unified["imdbID"]:
                tmdb_id = get_tmdb_id_from_imdb(unified["imdbID"])
                
            if tmdb_id:
                tmdb_data = get_tmdb_movie_details(tmdb_id)
                if tmdb_data:
                    # Poster fallback
                    if not unified["poster"] and tmdb_data.get("poster_path"):
                        unified["poster"] = f"https://image.tmdb.org/t/p/w500{tmdb_data['poster_path']}"
                    
                    # Backdrop
                    if tmdb_data.get("backdrop_path"):
                        unified["backdrop_path"] = tmdb_data["backdrop_path"]
                    
                    # Watch providers
                    providers = extract_watch_providers(tmdb_data)
                    if providers:
                        unified["whereToWatch"] = providers
                        
                    # Trailer
                    trailer = extract_trailer(tmdb_data)
                    if trailer:
                        unified["trailer"] = trailer
        except Exception as e:
            print(f"[RESOLVER TMDB ERROR] {unified.get('title')}: {e}")

        # Cache the result
        if cache_key:
            _MOVIE_CACHE[cache_key] = unified.copy()
            
        return unified

# Singleton instance for the application
resolver = UniversalMovieResolver()

def resolve_movie(base_info: dict) -> dict:
    return resolver.resolve_and_enrich(base_info)
