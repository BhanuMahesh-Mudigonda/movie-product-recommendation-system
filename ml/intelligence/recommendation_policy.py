from ml.intelligence.user_context import build_user_context


SITUATION_POLICY = {
    "exam_stress": {
        "preferred_genres": ["Comedy", "Drama", "Family", "Motivation"],
        "avoid_genres": ["Horror", "Psychological Thriller"],
        "energy": "calming_or_motivating"
    },
    "breakup": {
        "preferred_genres": ["Drama", "Romance", "Comedy", "Feel Good"],
        "avoid_genres": ["Heavy Romance"],
        "energy": "emotional_comfort"
    },
    "friendship": {
        "preferred_genres": ["Comedy", "Drama", "Adventure", "Feel Good"],
        "avoid_genres": [],
        "energy": "social_connection"
    },
    "missing_friends": {
        "preferred_genres": ["Friendship", "Drama", "Comedy", "Feel Good"],
        "avoid_genres": ["Heavy Horror"],
        "energy": "nostalgic_comfort"
    },
    "family_time": {
        "preferred_genres": ["Family", "Comedy", "Drama", "Animation"],
        "avoid_genres": ["Adult", "Extreme Violence", "Horror"],
        "energy": "safe_shared_viewing"
    },
    "career_pressure": {
        "preferred_genres": ["Motivation", "Drama", "Biography", "Comedy"],
        "avoid_genres": ["Depressing Drama"],
        "energy": "inspiration"
    },
    "celebration": {
        "preferred_genres": ["Comedy", "Action", "Adventure", "Musical"],
        "avoid_genres": [],
        "energy": "high_energy"
    },
    "feeling_alone": {
        "preferred_genres": ["Feel Good", "Drama", "Comedy", "Friendship"],
        "avoid_genres": ["Heavy Horror"],
        "energy": "emotional_connection"
    },
    "motivation": {
        "preferred_genres": ["Biography", "Drama", "Sports", "Motivation"],
        "avoid_genres": [],
        "energy": "inspiring"
    },
    "weekend": {
        "preferred_genres": ["Comedy", "Action", "Adventure", "Thriller"],
        "avoid_genres": [],
        "energy": "entertainment"
    },
    "general": {
        "preferred_genres": [],
        "avoid_genres": [],
        "energy": "balanced"
    }
}


EMOTION_POLICY = {
    "happy": ["Comedy", "Adventure", "Musical"],
    "sad": ["Feel Good", "Comedy", "Drama"],
    "lonely": ["Friendship", "Feel Good", "Comedy"],
    "stressed": ["Comedy", "Family", "Feel Good"],
    "angry": ["Action", "Sports", "Thriller"],
    "excited": ["Adventure", "Action", "Comedy"],
    "bored": ["Thriller", "Comedy", "Adventure"],
    "nostalgic": ["Drama", "Friendship", "Romance"],
    "relaxed": ["Drama", "Comedy", "Family"],
    "confused": ["Motivation", "Drama", "Feel Good"],
    "unknown": []
}


def build_recommendation_policy(user_input):
    context = build_user_context(user_input)

    emotion = context["emotion"]["emotion"]
    situation = context["situation"]["situation"]

    language = context["language"]["value"]
    viewing_context = context["viewing_context"]["value"]
    content_boundary = context["content_boundary"]["value"]

    situation_rules = SITUATION_POLICY.get(
        situation,
        SITUATION_POLICY["general"]
    )

    emotion_genres = EMOTION_POLICY.get(emotion, [])

    preferred_genres = list(
        dict.fromkeys(
            situation_rules["preferred_genres"] + emotion_genres
        )
    )

    avoid_genres = situation_rules["avoid_genres"].copy()

    if content_boundary == "family_safe":
        avoid_genres.extend([
            "Adult",
            "Extreme Violence",
            "Horror"
        ])

    if content_boundary == "avoid_horror":
        avoid_genres.append("Horror")

    avoid_genres = list(dict.fromkeys(avoid_genres))

    return {
        "user_input": user_input,

        "user_context": {
            "emotion": emotion,
            "situation": situation,
            "language": language,
            "viewing_context": viewing_context,
            "content_boundary": content_boundary
        },

        "movie_requirements": {
            "language": language,
            "viewing_context": viewing_context,
            "preferred_genres": preferred_genres,
            "avoid_genres": avoid_genres,
            "energy": situation_rules["energy"]
        }
    }


if __name__ == "__main__":

    examples = [
        "I am stressed because of exams and want a Telugu movie",
        "I feel lonely and want a family safe English movie",
        "I miss my old friends and want a Hindi movie",
        "I am happy and want a Tamil movie with my friends",
        "I want a movie with no horror"
    ]

    for example in examples:

        result = build_recommendation_policy(example)
        requirements = result["movie_requirements"]

        print("\n" + "=" * 65)
        print("MOVIEMIND RECOMMENDATION POLICY")
        print("=" * 65)

        print("USER:", result["user_input"])
        print("LANGUAGE:", requirements["language"])
        print("VIEWING CONTEXT:", requirements["viewing_context"])
        print("PREFERRED GENRES:", requirements["preferred_genres"])
        print("AVOID GENRES:", requirements["avoid_genres"])
        print("RECOMMENDATION ENERGY:", requirements["energy"])
