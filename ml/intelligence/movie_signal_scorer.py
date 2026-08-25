from ml.intelligence.movie_intelligence_tagger import (
    tag_movie_intelligence
)


def clamp_score(score):
    return max(0, min(100, score))


def calculate_signals(intelligence):

    scores = {
        "motivation_score": 0,
        "comfort_score": 0,
        "friendship_score": 0,
        "family_safe_score": 0,
        "entertainment_score": 0
    }

    emotions = intelligence.get(
        "emotion_tags",
        []
    )

    situations = intelligence.get(
        "situation_tags",
        []
    )

    contexts = intelligence.get(
        "viewing_contexts",
        []
    )

    boundaries = intelligence.get(
        "content_boundaries",
        []
    )

    energy = intelligence.get(
        "energy",
        "balanced"
    )


    # -------------------------
    # MOTIVATION SIGNAL
    # -------------------------

    if "motivated" in emotions:
        scores["motivation_score"] += 40

    if "hopeful" in emotions:
        scores["motivation_score"] += 25

    if "motivation" in situations:
        scores["motivation_score"] += 25

    if "career_pressure" in situations:
        scores["motivation_score"] += 10


    # -------------------------
    # COMFORT SIGNAL
    # -------------------------

    if "comforting" in emotions:
        scores["comfort_score"] += 40

    if "emotional" in emotions:
        scores["comfort_score"] += 15

    if "feeling_alone" in situations:
        scores["comfort_score"] += 25

    if energy == "balanced":
        scores["comfort_score"] += 10


    # -------------------------
    # FRIENDSHIP SIGNAL
    # -------------------------

    if "friendship" in situations:
        scores["friendship_score"] += 60

    if "comforting" in emotions:
        scores["friendship_score"] += 10

    if "friends" in contexts:
        scores["friendship_score"] += 30


    # -------------------------
    # FAMILY SAFE SIGNAL
    # -------------------------

    if "family_time" in situations:
        scores["family_safe_score"] += 40

    if "family" in contexts:
        scores["family_safe_score"] += 30

    if "generally_safe" in boundaries:
        scores["family_safe_score"] += 30

    if "potentially_sensitive" in boundaries:
        scores["family_safe_score"] -= 40


    # -------------------------
    # ENTERTAINMENT SIGNAL
    # -------------------------

    if "happy" in emotions:
        scores["entertainment_score"] += 35

    if "excited" in emotions:
        scores["entertainment_score"] += 35

    if energy == "high_energy":
        scores["entertainment_score"] += 35

    if energy == "positive_energy":
        scores["entertainment_score"] += 30

    if "celebration" in situations:
        scores["entertainment_score"] += 25

    if "friends" in contexts:
        scores["entertainment_score"] += 15


    # -------------------------
    # FINAL SCORE NORMALIZATION
    # -------------------------

    for key in scores:
        scores[key] = clamp_score(
            scores[key]
        )

    return scores


def score_movie(movie):

    intelligence = tag_movie_intelligence(
        movie
    )

    signals = calculate_signals(
        intelligence
    )

    return {
        "movie_intelligence": intelligence,
        "recommendation_signals": signals
    }


if __name__ == "__main__":

    sample_movie = {
        "identity": {
            "title": "Jersey"
        },

        "basic_metadata": {
            "genres": [
                "Drama",
                "Sport"
            ]
        },

        "presentation": {
            "plot": (
                "A struggling former cricketer "
                "tries to achieve his dream and "
                "make a comeback for his family."
            )
        }
    }


    result = score_movie(
        sample_movie
    )

    print("\n" + "=" * 65)
    print("MOVIEMIND AUTOMATIC SIGNAL SCORER")
    print("=" * 65)

    print(
        "MOVIE:",
        sample_movie["identity"]["title"]
    )

    print("\nINTELLIGENCE:")

    print(
        "Emotion Tags:",
        result["movie_intelligence"]["emotion_tags"]
    )

    print(
        "Situation Tags:",
        result["movie_intelligence"]["situation_tags"]
    )

    print(
        "Energy:",
        result["movie_intelligence"]["energy"]
    )

    print("\nRECOMMENDATION SIGNALS:")

    for signal, score in result[
        "recommendation_signals"
    ].items():

        print(
            signal + ":",
            score
        )
