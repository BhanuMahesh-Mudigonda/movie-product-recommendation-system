import re


GENRE_EMOTION_RULES = {
    "motivated": {
        "genres": ["sport"],
        "weight": 2
    },
    "happy": {
        "genres": ["comedy", "animation"],
        "weight": 2
    },
    "excited": {
        "genres": ["action", "adventure", "thriller"],
        "weight": 2
    },
    "emotional": {
        "genres": ["drama", "romance"],
        "weight": 2
    },
    "comforting": {
        "genres": ["family", "children"],
        "weight": 2
    },
    "dark": {
        "genres": ["crime", "horror", "thriller"],
        "weight": 2
    },
    "suspenseful": {
        "genres": ["mystery", "thriller"],
        "weight": 2
    }
}


PLOT_RULES = {
    "motivated": [
        "comeback",
        "overcome",
        "achievement",
        "determination",
        "never give up",
        "fights against all odds"
    ],
    "hopeful": [
        "second chance",
        "new beginning",
        "hope for the future",
        "finds hope"
    ],
    "emotional": [
        "family struggle",
        "loss of a loved one",
        "emotional journey",
        "personal loss"
    ],
    "comforting": [
        "heartwarming",
        "family bonds",
        "feel good"
    ],
    "dark": [
        "serial killer",
        "murder investigation",
        "violent crimes",
        "psychological darkness"
    ],
    "suspenseful": [
        "mystery",
        "investigation",
        "unknown threat",
        "race against time",
        "time travel"
    ]
}


SITUATION_RULES = {
    "motivation": {
        "genres": ["sport"],
        "keywords": [
            "comeback",
            "achievement",
            "determination",
            "overcome"
        ]
    },
    "career_pressure": {
        "genres": [],
        "keywords": [
            "career",
            "job",
            "professional failure",
            "career comeback"
        ]
    },
    "family_time": {
        "genres": [
            "children",
            "animation",
            "family"
        ],
        "keywords": [
            "family adventure",
            "family bonds"
        ]
    },
    "friendship": {
        "genres": [],
        "keywords": [
            "best friends",
            "friendship",
            "group of friends"
        ]
    },
    "celebration": {
        "genres": ["musical"],
        "keywords": [
            "celebration",
            "festival",
            "wedding celebration"
        ]
    },
    "intense_viewing": {
        "genres": [
            "crime",
            "horror",
            "thriller"
        ],
        "keywords": [
            "serial killer",
            "violent crimes",
            "psychological thriller"
        ]
    }
}


def normalize_text(value):
    return str(value or "").lower()


def get_genres(movie):

    basic = movie.get("basic_metadata", {})

    return [
        normalize_text(genre)
        for genre in basic.get("genres", [])
    ]


def build_movie_text(movie):

    presentation = movie.get("presentation", {})

    parts = [
        presentation.get("plot"),
        movie.get("identity", {}).get("title")
    ]

    return " ".join(
        normalize_text(part)
        for part in parts
        if part
    )


def contains_phrase(text, phrase):

    pattern = r"\b" + re.escape(
        phrase.lower()
    ) + r"\b"

    return bool(
        re.search(pattern, text)
    )


def detect_emotions(movie):

    genres = get_genres(movie)
    text = build_movie_text(movie)

    tags = []

    for tag, rule in GENRE_EMOTION_RULES.items():

        if any(
            genre in genres
            for genre in rule["genres"]
        ):
            tags.append(tag)

    for tag, keywords in PLOT_RULES.items():

        if any(
            contains_phrase(text, keyword)
            for keyword in keywords
        ):
            if tag not in tags:
                tags.append(tag)

    return tags


def detect_situations(movie):

    genres = get_genres(movie)
    text = build_movie_text(movie)

    tags = []

    for tag, rule in SITUATION_RULES.items():

        genre_match = any(
            genre in genres
            for genre in rule["genres"]
        )

        keyword_match = any(
            contains_phrase(text, keyword)
            for keyword in rule["keywords"]
        )

        if genre_match or keyword_match:
            tags.append(tag)

    return tags


def detect_energy(movie):

    genres = get_genres(movie)

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
            "crime",
            "horror"
        ]
    ):
        return "intense"

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

    genres = get_genres(movie)

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

    if any(
        genre in genres
        for genre in [
            "crime",
            "horror",
            "thriller"
        ]
    ):
        contexts.append("mature_audience")

    return contexts


def detect_content_boundaries(movie):

    genres = get_genres(movie)

    boundaries = []

    if "adult" in genres:
        boundaries.append("adult_content")

    if "horror" in genres:
        boundaries.append("horror_sensitive")

    if "crime" in genres:
        boundaries.append("crime_sensitive")

    if "thriller" in genres:
        boundaries.append("intense_content")

    if not boundaries:
        boundaries.append("generally_safe")

    return boundaries


def tag_movie_intelligence(movie):

    intelligence = {
        "emotion_tags": detect_emotions(movie),
        "situation_tags": detect_situations(movie),
        "energy": detect_energy(movie),
        "viewing_contexts": detect_viewing_contexts(movie),
        "content_boundaries": detect_content_boundaries(movie)
    }

    return intelligence


if __name__ == "__main__":

    from ml.intelligence.metadata_merger import (
        merge_movie_metadata
    )

    tests = [
        ("Jersey", 2019),
        ("Toy Story", 1995),
        ("Se7en", 1995),
        ("12 Monkeys", 1995)
    ]

    for title, year in tests:

        result = merge_movie_metadata(
            title,
            year
        )

        print("\n" + "=" * 70)
        print("MOVIEMIND UNIVERSAL MOVIE INTELLIGENCE")
        print("=" * 70)

        print("SEARCH:", title, year)

        if not result["movie"]:
            print("STATUS: movie_not_found")
            continue

        movie = result["movie"]

        intelligence = tag_movie_intelligence(
            movie
        )

        print(
            "TITLE:",
            movie["identity"]["title"]
        )

        print(
            "GENRES:",
            movie["basic_metadata"]["genres"]
        )

        print(
            "EMOTIONS:",
            intelligence["emotion_tags"]
        )

        print(
            "SITUATIONS:",
            intelligence["situation_tags"]
        )

        print(
            "ENERGY:",
            intelligence["energy"]
        )

        print(
            "VIEWING:",
            intelligence["viewing_contexts"]
        )

        print(
            "BOUNDARIES:",
            intelligence["content_boundaries"]
        )
