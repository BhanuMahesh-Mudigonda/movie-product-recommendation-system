MOVIE_SCHEMA = {
    "identity": {
        "movie_id": None,
        "title": None,
        "year": None,
        "imdb_id": None,
        "tmdb_id": None
    },

    "basic_metadata": {
        "language": None,
        "genres": [],
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
        "source": None,
        "last_updated": None,
        "cache_version": "1.0"
    }
}
