def normalize_text(text):
    return str(text).strip().lower()


def get_context_preferences(user_context):

    context = normalize_text(user_context)

    preferences = {
        "motivation_score": 0,
        "comfort_score": 0,
        "friendship_score": 0,
        "family_safe_score": 0,
        "entertainment_score": 0,
        "intensity_score": 0
    }

    context_rules = {

        "motivation": {
            "motivation_score": 100
        },

        "career": {
            "motivation_score": 90
        },

        "study": {
            "motivation_score": 85,
            "comfort_score": 20
        },

        "sad": {
            "comfort_score": 100
        },

        "comfort": {
            "comfort_score": 100
        },

        "family": {
            "family_safe_score": 100,
            "entertainment_score": 40
        },

        "friends": {
            "friendship_score": 100,
            "entertainment_score": 70
        },

        "fun": {
            "entertainment_score": 100
        },

        "entertainment": {
            "entertainment_score": 100
        },

        "thriller": {
            "intensity_score": 100
        },

        "intense": {
            "intensity_score": 100
        }
    }

    for keyword, signals in context_rules.items():

        if keyword in context:

            for signal, weight in signals.items():

                preferences[signal] = max(
                    preferences[signal],
                    weight
                )

    return preferences


def calculate_context_match(movie, user_context):

    preferences = get_context_preferences(user_context)

    movie_signals = movie.get(
        "recommendation_signals",
        {}
    )

    total_weight = 0
    weighted_score = 0

    for signal, preference_weight in preferences.items():

        if preference_weight > 0:

            movie_score = movie_signals.get(
                signal,
                0
            )

            weighted_score += (
                movie_score * preference_weight
            )

            total_weight += preference_weight

    if total_weight == 0:
        return 0

    return round(
        weighted_score / total_weight,
        2
    )


def rank_movies_by_context(movies, user_context):

    ranked_movies = []

    for movie in movies:

        score = calculate_context_match(
            movie,
            user_context
        )

        ranked_movies.append({
            "movie": movie,
            "context_score": score
        })

    ranked_movies.sort(
        key=lambda item: item["context_score"],
        reverse=True
    )

    return ranked_movies
