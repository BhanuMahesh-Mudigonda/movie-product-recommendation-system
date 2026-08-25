from ml.intelligence.metadata_merger import merge_movie_metadata
from ml.intelligence.movie_intelligence_tagger import tag_movie_intelligence
from ml.intelligence.movie_signal_scorer import calculate_signals
from ml.intelligence.metadata_cache import add_movie_to_cache


def build_movie_intelligence(title, year=None):

    # STEP 1: Get merged metadata
    movie_result = merge_movie_metadata(title, year)

    if movie_result["movie"] is None:
        return {
            "status": movie_result["status"],
            "movie": None
        }

    movie = movie_result["movie"]

    # STEP 2: Extract movie information
    movie_title = movie["identity"]["title"]
    genres = movie["basic_metadata"]["genres"]
    plot = movie["presentation"]["plot"]

    # STEP 3: Generate MovieMind intelligence tags
    intelligence = tag_movie_intelligence(movie)
    # STEP 4: Add intelligence section
    movie["moviemind_intelligence"] = {
        "emotion_tags": intelligence["emotion_tags"],
        "situation_tags": intelligence["situation_tags"],
        "energy": intelligence["energy"],
        "viewing_contexts": intelligence["viewing_contexts"],
        "content_boundaries": intelligence["content_boundaries"]
    }

    # STEP 5: Generate recommendation signals
    signals = calculate_signals(intelligence)

    # STEP 6: Add signals
    movie["recommendation_signals"] = signals

    # STEP 7: Cache the completed movie intelligence
    cache_key = add_movie_to_cache(movie)

    return {
        "status": "built",
        "source_status": movie_result["status"],
        "cache_key": cache_key,
        "movie": movie
    }


if __name__ == "__main__":

    examples = [
        ("Toy Story", 1995),
        ("Jumanji", 1995),
        ("12 Monkeys", 1995),
        ("Se7en", 1995)
    ]

    for title, year in examples:

        result = build_movie_intelligence(title, year)

        print("\n" + "=" * 70)
        print("MOVIEMIND MOVIE INTELLIGENCE BUILDER")
        print("=" * 70)

        print("SEARCH:", title, year)
        print("STATUS:", result["status"])

        if result["movie"]:

            movie = result["movie"]

            print("SOURCE STATUS:",
                  result.get("source_status"))

            print("\nTITLE:",
                  movie["identity"]["title"])

            print("YEAR:",
                  movie["identity"]["year"])

            print("LANGUAGE:",
                  movie["basic_metadata"]["language"])

            print("GENRES:",
                  movie["basic_metadata"]["genres"])

            print("\nEMOTION TAGS:",
                  movie["moviemind_intelligence"]["emotion_tags"])

            print("SITUATION TAGS:",
                  movie["moviemind_intelligence"]["situation_tags"])

            print("ENERGY:",
                  movie["moviemind_intelligence"]["energy"])

            print("\nRECOMMENDATION SIGNALS:")

            for signal, score in movie[
                "recommendation_signals"
            ].items():

                print(signal + ":", score)

            print("\nCACHE KEY:",
                  result["cache_key"])

        else:
            print("Movie not found")
