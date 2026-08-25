import re


EMOTION_RULES = {
    "motivated": [
        "sport",
        "success",
        "dream",
        "inspire",
        "inspiration",
        "achievement",
        "determination",
        "comeback",
        "struggle",
        "winner"
    ],

    "hopeful": [
        "hope",
        "dream",
        "future",
        "second chance",
        "overcome",
        "journey"
    ],

    "happy": [
        "comedy",
        "fun",
        "funny",
        "celebration",
        "joy",
        "entertainment"
    ],

    "emotional": [
        "drama",
        "family",
        "relationship",
        "loss",
        "love",
        "life"
    ],

    "comforting": [
        "family",
        "friendship",
        "feel good",
        "heartwarming",
        "home"
    ],

    "excited": [
        "action",
        "adventure",
        "thriller",
        "journey",
        "mission"
    ],

    "nostalgic": [
        "memory",
        "memories",
        "old friends",
        "childhood",
        "past"
    ]
}


SITUATION_RULES = {
    "motivation": [
        "sport",
        "dream",
        "success",
        "struggle",
        "comeback",
        "achievement"
    ],

    "career_pressure": [
        "career",
        "job",
        "success",
        "failure",
        "struggle",
        "dream"
    ],

    "friendship": [
        "friend",
        "friends",
        "friendship",
        "buddy"
    ],

    "family_time": [
        "family",
        "parents",
        "children",
        "home"
    ],

    "breakup": [
        "breakup",
        "heartbreak",
        "relationship",
        "separation"
    ],

    "feeling_alone": [
        "alone",
        "lonely",
        "isolation",
        "connection"
    ],

    "celebration": [
        "celebration",
        "party",
        "wedding",
        "festival",
        "fun"
    ]
}


def build_movie_text(movie):

    parts = []

    basic = movie.get("basic_metadata", {})
    presentation = movie.get("presentation", {})

    genres = basic.get("genres", [])

    if isinstance(genres, list):
        parts.extend(genres)

    parts.append(
        presentation.get("plot") or ""
    )

    parts.append(
        presentation.get("title") or ""
    )

    return " ".join(
        str(part)
        for part in parts
        if part
    ).lower()


def find_matching_tags(text, rules):

    tags = []

    for tag, keywords in rules.items():

        for keyword in keywords:

            if keyword.lower() in text:

                tags.append(tag)
                break

    return tags


def detect_energy(movie):

    basic = movie.get("basic_metadata", {})

    genres = [
        str(genre).lower()
        for genre in basic.get("genres", [])
    ]

    if any(
        genre in genres
        for genre in [
            "action",
            "adventure",
            "thriller"
        ]
    ):
        return "high_energy"

    if any(
        genre in genres
        for genre in [
            "comedy",
            "animation"
        ]
    ):
        return "positive_energy"

    if any(
        genre in genres
        for genre in [
            "drama",
            "romance"
        ]
    ):
        return "emotional"

    return "balanced"


def detect_viewing_contexts(movie):

    basic = movie.get("basic_metadata", {})
    genres = [
        str(genre).lower()
        for genre in basic.get("genres", [])
    ]

    contexts = ["solo"]

    if any(
        genre in genres
        for genre in [
            "children",
            "animation",
            "family"
        ]
    ):
        contexts.append("family")

    if any(
        genre in genres
        for genre in [
            "comedy",
            "adventure"
        ]
    ):
        contexts.append("friends")

    return contexts


def detect_content_boundaries(movie):

    basic = movie.get("basic_metadata", {})

    genres = [
        str(genre).lower()
        for genre in basic.get("genres", [])
    ]

    boundaries = []

    risky_genres = [
        "horror",
        "adult",
        "crime"
    ]

    if any(
        genre in genres
        for genre in risky_genres
    ):
        boundaries.append(
            "potentially_sensitive"
        )
    else:
        boundaries.append(
            "generally_safe"
        )

    return boundaries


def tag_movie_intelligence(movie):

    text = build_movie_text(movie)

    emotion_tags = find_matching_tags(
        text,
        EMOTION_RULES
    )

    situation_tags = find_matching_tags(
        text,
        SITUATION_RULES
    )

    intelligence = {
        "emotion_tags": emotion_tags,
        "situation_tags": situation_tags,
        "energy": detect_energy(movie),
        "viewing_contexts": detect_viewing_contexts(movie),
        "content_boundaries": detect_content_boundaries(movie)
    }

    return intelligence


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

    result = tag_movie_intelligence(
        sample_movie
    )

    print("\n" + "=" * 65)
    print("MOVIEMIND MOVIE INTELLIGENCE TAGGER")
    print("=" * 65)

    print(
        "MOVIE:",
        sample_movie["identity"]["title"]
    )

    print(
        "EMOTION TAGS:",
        result["emotion_tags"]
    )

    print(
        "SITUATION TAGS:",
        result["situation_tags"]
    )

    print(
        "ENERGY:",
        result["energy"]
    )

    print(
        "VIEWING CONTEXTS:",
        result["viewing_contexts"]
    )

    print(
        "CONTENT BOUNDARIES:",
        result["content_boundaries"]
    )
