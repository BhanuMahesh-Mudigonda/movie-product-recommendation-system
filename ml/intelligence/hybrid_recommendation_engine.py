def calculate_hybrid_score(
    ml_score,
    context_score,
    ml_weight=0.70,
    context_weight=0.30
):

    if ml_score is None:
        ml_score = 0

    if context_score is None:
        context_score = 0

    hybrid_score = (
        (float(ml_score) * ml_weight)
        +
        (float(context_score) * context_weight)
    )

    return round(hybrid_score, 2)


def rank_movies_hybrid(
    movies_with_ml_scores,
    user_context,
    context_ranker
):

    ranked_movies = []

    context_ranked = context_ranker(
        [
            item["movie"]
            for item in movies_with_ml_scores
        ],
        user_context
    )

    context_scores = {}

    for item in context_ranked:

        movie = item["movie"]

        movie_id = movie["identity"].get(
            "movie_id"
        )

        context_scores[movie_id] = item[
            "context_score"
        ]

    for item in movies_with_ml_scores:

        movie = item["movie"]

        movie_id = movie["identity"].get(
            "movie_id"
        )

        ml_score = item.get(
            "ml_score",
            0
        )

        context_score = context_scores.get(
            movie_id,
            0
        )

        hybrid_score = calculate_hybrid_score(
            ml_score,
            context_score
        )

        ranked_movies.append({
            "movie": movie,
            "ml_score": ml_score,
            "context_score": context_score,
            "hybrid_score": hybrid_score
        })

    ranked_movies.sort(
        key=lambda item: item["hybrid_score"],
        reverse=True
    )

    return ranked_movies
