import re


# =========================================================
# MOVIEMIND DISCOVERY ENGINE
# Search Intent Taxonomy
# =========================================================

DISCOVERY_THEMES = {

    "father_daughter": {
        "label": "Father & Daughter",
        "category": "Relationships & Family",
        "keywords": [
            "father daughter",
            "dad daughter",
            "father and daughter",
            "daughter emotional",
            "father emotional"
        ]
    },

    "father_son": {
        "label": "Father & Son",
        "category": "Relationships & Family",
        "keywords": [
            "father son",
            "dad son",
            "father and son"
        ]
    },

    "mother_daughter": {
        "label": "Mother & Daughter",
        "category": "Relationships & Family",
        "keywords": [
            "mother daughter",
            "mom daughter",
            "mother and daughter"
        ]
    },

    "mother_son": {
        "label": "Mother & Son",
        "category": "Relationships & Family",
        "keywords": [
            "mother son",
            "mom son",
            "mother and son"
        ]
    },

    "family": {
        "label": "Family Bonds",
        "category": "Relationships & Family",
        "keywords": [
            "family",
            "family bond",
            "family emotional",
            "parents",
            "parent child"
        ]
    },

    "friendship": {
        "label": "Friendship",
        "category": "Relationships & Family",
        "keywords": [
            "friendship",
            "friends",
            "best friends",
            "friend",
            "buddies"
        ]
    },

    "college_life": {
        "label": "College & Student Life",
        "category": "College & Youth",
        "keywords": [
            "college life",
            "college",
            "student life",
            "campus",
            "university",
            "hostel"
        ]
    },

    "school_life": {
        "label": "School Memories",
        "category": "College & Youth",
        "keywords": [
            "school life",
            "school",
            "childhood friends",
            "school memories"
        ]
    },

    "nostalgia": {
        "label": "Nostalgia",
        "category": "College & Youth",
        "keywords": [
            "nostalgia",
            "nostalgic",
            "memories",
            "childhood",
            "old memories"
        ]
    },

    "coming_of_age": {
        "label": "Coming of Age",
        "category": "College & Youth",
        "keywords": [
            "coming of age",
            "growing up",
            "youth",
            "teenage"
        ]
    },

    "pets": {
        "label": "Pets & Animals",
        "category": "Pets & Animals",
        "keywords": [
            "pet",
            "pets",
            "dog",
            "cat",
            "animal",
            "animal friendship",
            "pet love"
        ]
    },

    "emotional": {
        "label": "Emotional",
        "category": "Emotions & Healing",
        "keywords": [
            "emotional",
            "touching",
            "heart touching",
            "tearjerker",
            "deep"
        ]
    },

    "sad": {
        "label": "Sad & Heartfelt",
        "category": "Emotions & Healing",
        "keywords": [
            "sad",
            "heartbreak",
            "heartbroken",
            "crying",
            "pain"
        ]
    },

    "lonely": {
        "label": "Lonely Nights",
        "category": "Emotions & Healing",
        "keywords": [
            "lonely",
            "alone",
            "loneliness",
            "isolated"
        ]
    },

    "breakup_healing": {
        "label": "Breakup Healing",
        "category": "Emotions & Healing",
        "keywords": [
            "breakup",
            "break up",
            "healing",
            "moving on",
            "heartbreak recovery"
        ]
    },

    "feel_good": {
        "label": "Feel Good",
        "category": "Emotions & Healing",
        "keywords": [
            "feel good",
            "feelgood",
            "happy movie",
            "uplifting",
            "comfort movie"
        ]
    },

    "comfort": {
        "label": "Comfort Movies",
        "category": "Emotions & Healing",
        "keywords": [
            "comfort",
            "comfort movie",
            "relaxing",
            "cozy"
        ]
    },

    "motivation": {
        "label": "Inspiration & Motivation",
        "category": "Inspiration & Motivation",
        "keywords": [
            "motivation",
            "motivational",
            "inspiration",
            "inspirational",
            "inspire me"
        ]
    },

    "failure_success": {
        "label": "Failure to Success",
        "category": "Inspiration & Motivation",
        "keywords": [
            "failure",
            "after failure",
            "success story",
            "comeback",
            "never give up"
        ]
    },

    "underdog": {
        "label": "Underdog Stories",
        "category": "Inspiration & Motivation",
        "keywords": [
            "underdog",
            "against all odds",
            "struggle",
            "overcoming"
        ]
    },

    "dreams": {
        "label": "Dreams & Ambition",
        "category": "Inspiration & Motivation",
        "keywords": [
            "dream",
            "dreams",
            "ambition",
            "goal",
            "aspiration"
        ]
    },

    "self_discovery": {
        "label": "Self Discovery",
        "category": "Inspiration & Motivation",
        "keywords": [
            "self discovery",
            "find yourself",
            "life journey",
            "personal growth"
        ]
    },

    "romance": {
        "label": "Love & Romance",
        "category": "Love & Romance",
        "keywords": [
            "romance",
            "romantic",
            "love story",
            "love"
        ]
    },

    "first_love": {
        "label": "First Love",
        "category": "Love & Romance",
        "keywords": [
            "first love",
            "young love",
            "first relationship"
        ]
    },

    "travel": {
        "label": "Travel & Road Trips",
        "category": "Life Journeys",
        "keywords": [
            "travel",
            "road trip",
            "journey",
            "adventure travel"
        ]
    },

    "childhood": {
        "label": "Childhood",
        "category": "Life Journeys",
        "keywords": [
            "childhood",
            "childhood memories",
            "growing up"
        ]
    },

    "biography": {
        "label": "Biographies & True Stories",
        "category": "True Stories",
        "keywords": [
            "biography",
            "biopic",
            "true story",
            "based on true story"
        ]
    }
}


LANGUAGE_ALIASES = {
    "telugu": "te",
    "hindi": "hi",
    "tamil": "ta",
    "english": "en"
}


def normalize_text(value):
    value = str(value or "").lower().strip()

    value = re.sub(
        r"[^a-z0-9\s&]",
        " ",
        value
    )

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value.strip()


def detect_discovery_intent(query):

    query_text = normalize_text(query)

    detected_themes = []

    for theme_key, theme_data in DISCOVERY_THEMES.items():

        for keyword in theme_data["keywords"]:

            normalized_keyword = normalize_text(
                keyword
            )

            if normalized_keyword in query_text:

                detected_themes.append({
                    "key": theme_key,
                    "label": theme_data["label"],
                    "category": theme_data["category"],
                    "matched_keyword": keyword
                })

                break

    detected_languages = []

    for language_name, language_code in LANGUAGE_ALIASES.items():

        if language_name in query_text:

            detected_languages.append({
                "name": language_name,
                "code": language_code
            })

    return {
        "query": query,
        "normalized_query": query_text,
        "themes": detected_themes,
        "languages": detected_languages
    }


# =========================================================
# THEME SEMANTIC EXPANSION
# Used for matching movie metadata
# =========================================================

THEME_EXPANSIONS = {

    "father_daughter": [
        "father",
        "dad",
        "daughter",
        "family",
        "parent",
        "parenting",
        "relationship"
    ],

    "father_son": [
        "father",
        "dad",
        "son",
        "family",
        "parent",
        "relationship"
    ],

    "mother_daughter": [
        "mother",
        "mom",
        "daughter",
        "family",
        "parent"
    ],

    "mother_son": [
        "mother",
        "mom",
        "son",
        "family",
        "parent"
    ],

    "family": [
        "family",
        "parents",
        "father",
        "mother",
        "children",
        "home",
        "family bond"
    ],

    "friendship": [
        "friend",
        "friends",
        "friendship",
        "best friend",
        "companionship",
        "bond"
    ],

    "college_life": [
        "college",
        "student",
        "campus",
        "university",
        "hostel",
        "classmate",
        "youth"
    ],

    "school_life": [
        "school",
        "student",
        "teacher",
        "classmate",
        "childhood"
    ],

    "nostalgia": [
        "memory",
        "memories",
        "childhood",
        "past",
        "growing up",
        "reunion"
    ],

    "pets": [
        "dog",
        "cat",
        "pet",
        "animal",
        "horse",
        "companion"
    ],

    "emotional": [
        "emotional",
        "heart",
        "love",
        "loss",
        "family",
        "life",
        "relationship"
    ],

    "sad": [
        "loss",
        "death",
        "grief",
        "heartbreak",
        "pain",
        "tragedy"
    ],

    "lonely": [
        "alone",
        "lonely",
        "isolation",
        "solitude",
        "loss"
    ],

    "breakup_healing": [
        "breakup",
        "heartbreak",
        "relationship",
        "moving on",
        "healing",
        "love"
    ],

    "feel_good": [
        "happy",
        "joy",
        "friendship",
        "family",
        "comedy",
        "hope",
        "uplifting"
    ],

    "motivation": [
        "dream",
        "success",
        "struggle",
        "challenge",
        "achievement",
        "inspiration"
    ],

    "failure_success": [
        "failure",
        "struggle",
        "comeback",
        "success",
        "dream",
        "determination"
    ],

    "underdog": [
        "underdog",
        "struggle",
        "against",
        "challenge",
        "victory",
        "success"
    ],

    "dreams": [
        "dream",
        "goal",
        "ambition",
        "success",
        "aspiration"
    ],

    "self_discovery": [
        "journey",
        "identity",
        "life",
        "discover",
        "purpose",
        "growth"
    ],

    "romance": [
        "love",
        "romance",
        "relationship",
        "couple",
        "lover"
    ],

    "first_love": [
        "first love",
        "young love",
        "school",
        "college",
        "romance"
    ],

    "travel": [
        "travel",
        "journey",
        "road",
        "trip",
        "adventure"
    ],

    "childhood": [
        "childhood",
        "child",
        "growing up",
        "memory",
        "friends"
    ],

    "biography": [
        "true story",
        "biography",
        "biopic",
        "real life"
    ]
}


def get_theme_keywords(theme_keys):

    keywords = []

    for theme_key in theme_keys:

        keywords.extend(
            THEME_EXPANSIONS.get(
                theme_key,
                []
            )
        )

    return list(
        dict.fromkeys(keywords)
    )


def get_movie_search_text(movie):

    fields = [
        "title",
        "original_title",
        "genres",
        "overview",
        "plot",
        "Genre",
        "Plot",
        "Title",
        "keywords"
    ]

    values = []

    for field in fields:

        value = movie.get(field, "")

        if value is None:
            continue

        values.append(
            str(value).lower()
        )

    return " ".join(values)


def get_theme_match_details(
    movie,
    theme_keys
):

    text = get_movie_search_text(movie)

    details = {}
    total_score = 0

    for theme_key in theme_keys:

        keywords = get_theme_keywords(
            [theme_key]
        )

        matched = []

        for keyword in keywords:

            keyword = str(keyword).lower()

            if keyword in text:
                matched.append(keyword)

        theme_score = len(matched)

        details[theme_key] = {
            "score": theme_score,
            "matched": matched
        }

        total_score += theme_score

    return total_score, details


def calculate_discovery_relevance(
    movie,
    theme_keys
):

    total_matches, details = get_theme_match_details(
        movie,
        theme_keys
    )

    if not theme_keys:
        return 0, [], details

    matched_themes = [
        key
        for key, value in details.items()
        if value["score"] > 0
    ]

    matched_keywords = []

    for value in details.values():
        matched_keywords.extend(
            value["matched"]
        )

    # ---------------------------------------------
    # Single theme
    # ---------------------------------------------

    if len(theme_keys) == 1:

        relevance = total_matches * 12

    # ---------------------------------------------
    # Multiple themes
    # Require strong thematic combination
    # ---------------------------------------------

    else:

        coverage = (
            len(matched_themes)
            / len(theme_keys)
        )

        relevance = (
            total_matches * 10
            + coverage * 40
        )

        # Huge bonus when every requested theme matches
        if len(matched_themes) == len(theme_keys):
            relevance += 35

        # Penalty for weak partial matches
        elif len(matched_themes) == 1:
            relevance -= 20

    matched_keywords = list(
        dict.fromkeys(matched_keywords)
    )

    return (
        round(relevance, 3),
        matched_keywords,
        details
    )



# =========================================================
# DISCOVERY RANKING V3
# WEIGHTED INTENT-SPECIFIC KEYWORD SCORING
# =========================================================

def get_keyword_weight(keyword, theme_key):

    keyword = str(keyword).lower().strip()

    # Generic words should NOT dominate ranking
    generic_words = {
        "love",
        "life",
        "family",
        "relationship",
        "heart",
        "emotional",
        "dream",
        "past"
    }

    if keyword in generic_words:
        return 2

    # Strong relationship intent words
    relationship_words = {
        "father",
        "daughter",
        "mother",
        "son",
        "brother",
        "sister",
        "parent",
        "parents",
        "dad",
        "mom"
    }

    if keyword in relationship_words:
        return 15

    # Strong context-specific words
    strong_words = {
        "college",
        "campus",
        "university",
        "student",
        "classmate",
        "pet",
        "dog",
        "cat",
        "animal",
        "failure",
        "success",
        "struggle",
        "motivation"
    }

    if keyword in strong_words:
        return 10

    # Default meaningful keyword
    return 6



# =========================================================
# DISCOVERY RANKING V4
# CORE vs SUPPORTING INTENT KEYWORDS
# =========================================================

DISCOVERY_THEME_PRIORITY = {

    "pet": {
        "core": [
            "pet",
            "dog",
            "cat",
            "animal",
            "puppy",
            "kitten",
            "companion"
        ],
        "supporting": [
            "love",
            "relationship",
            "bond",
            "friendship",
            "family"
        ]
    },

    "motivation": {
        "core": [
            "motivation",
            "inspiration",
            "determination",
            "perseverance",
            "dream",
            "success"
        ],
        "supporting": [
            "life",
            "journey",
            "challenge",
            "hope"
        ]
    },

    "failure": {
        "core": [
            "failure",
            "defeat",
            "loss",
            "rejection",
            "struggle",
            "setback"
        ],
        "supporting": [
            "challenge",
            "comeback",
            "dream",
            "success"
        ]
    },

    "college": {
        "core": [
            "college",
            "campus",
            "university",
            "student",
            "classmate"
        ],
        "supporting": [
            "youth",
            "friendship",
            "romance",
            "life"
        ]
    },

    "nostalgia": {
        "core": [
            "nostalgia",
            "memory",
            "memories",
            "childhood",
            "past",
            "reunion"
        ],
        "supporting": [
            "youth",
            "growing up",
            "life",
            "friendship"
        ]
    }
}


def get_v4_theme_keywords(theme_key):

    config = DISCOVERY_THEME_PRIORITY.get(
        theme_key,
        {}
    )

    core = config.get(
        "core",
        []
    )

    supporting = config.get(
        "supporting",
        []
    )

    # Fallback to existing theme dictionary
    if not core and not supporting:

        core = get_theme_keywords(
            [theme_key]
        )

    return {
        "core": [
            str(x).lower()
            for x in core
        ],
        "supporting": [
            str(x).lower()
            for x in supporting
        ]
    }


def calculate_v4_theme_match(
    text,
    theme_key
):

    keywords = get_v4_theme_keywords(
        theme_key
    )

    core_matches = []
    supporting_matches = []

    for keyword in keywords["core"]:

        if keyword in text:
            core_matches.append(
                keyword
            )

    for keyword in keywords["supporting"]:

        if keyword in text:
            supporting_matches.append(
                keyword
            )

    score = (
        len(core_matches) * 15
        + len(supporting_matches) * 4
    )

    return {
        "score": score,
        "core_matches": core_matches,
        "supporting_matches": supporting_matches
    }


def calculate_v4_discovery_relevance(
    movie,
    theme_keys
):

    if not theme_keys:
        return 0, [], {}

    text = get_movie_search_text(
        movie
    )

    details = {}

    total_score = 0
    total_core_matches = 0
    matched_keywords = []

    for theme_key in theme_keys:

        result = calculate_v4_theme_match(
            text,
            theme_key
        )

        details[theme_key] = result

        total_score += result["score"]

        total_core_matches += len(
            result["core_matches"]
        )

        matched_keywords.extend(
            result["core_matches"]
        )

        matched_keywords.extend(
            result["supporting_matches"]
        )

    matched_theme_count = sum(
        1
        for value in details.values()
        if value["score"] > 0
    )

    # ---------------------------------------------
    # MULTI-THEME COMBINATION BONUS
    # ---------------------------------------------

    if len(theme_keys) >= 2:

        if matched_theme_count == len(theme_keys):
            total_score += 35

        elif matched_theme_count >= 2:
            total_score += 15

    # ---------------------------------------------
    # CORE INTENT BONUS
    # ---------------------------------------------

    total_score += (
        total_core_matches * 8
    )

    # Deduplicate
    matched_keywords = list(
        dict.fromkeys(
            matched_keywords
        )
    )

    return (
        round(total_score, 3),
        matched_keywords,
        details
    )


def calculate_weighted_discovery_relevance(
    movie,
    theme_keys
):

    text = get_movie_search_text(movie)

    if not theme_keys:
        return 0, [], {}

    relevance = 0
    matched_keywords = []
    details = {}

    matched_theme_count = 0

    for theme_key in theme_keys:

        keywords = get_theme_keywords(
            [theme_key]
        )

        theme_score = 0
        theme_matches = []

        for keyword in keywords:

            keyword = str(keyword).lower()

            if keyword in text:

                weight = get_keyword_weight(
                    keyword,
                    theme_key
                )

                theme_score += weight
                relevance += weight

                theme_matches.append(keyword)
                matched_keywords.append(keyword)

        details[theme_key] = {
            "score": theme_score,
            "matched": theme_matches
        }

        if theme_score > 0:
            matched_theme_count += 1

    # -------------------------------------------------
    # MULTI-THEME COVERAGE BONUS
    # -------------------------------------------------

    if len(theme_keys) >= 2:

        coverage = (
            matched_theme_count
            / len(theme_keys)
        )

        relevance += coverage * 25

        # Strong bonus only when all requested
        # themes have meaningful evidence
        if matched_theme_count == len(theme_keys):
            relevance += 30

    matched_keywords = list(
        dict.fromkeys(matched_keywords)
    )

    return (
        round(relevance, 3),
        matched_keywords,
        details
    )


def calculate_theme_score(
    movie,
    theme_keys
):

    text = get_movie_search_text(movie)

    keywords = get_theme_keywords(
        theme_keys
    )

    score = 0
    matched_keywords = []

    for keyword in keywords:

        keyword = str(keyword).lower()

        if keyword in text:

            score += 1
            matched_keywords.append(keyword)

    return score, matched_keywords


# =========================================================
# REAL DATASET DISCOVERY SEARCH
# MovieLens + Featured Metadata + Multilingual Catalogue
# =========================================================

import numpy as np
import pandas as pd



def get_full_language_name(language):

    if language is None:
        return None

    value = str(language).strip()

    if not value:
        return None

    language_map = {
        "te": "Telugu",
        "telugu": "Telugu",

        "hi": "Hindi",
        "hindi": "Hindi",

        "ta": "Tamil",
        "tamil": "Tamil",

        "ml": "Malayalam",
        "malayalam": "Malayalam",

        "en": "English",
        "english": "English",

        "kn": "Kannada",
        "kannada": "Kannada",

        "bn": "Bengali",
        "bengali": "Bengali",

        "mr": "Marathi",
        "marathi": "Marathi",

        "gu": "Gujarati",
        "gujarati": "Gujarati",

        "pa": "Punjabi",
        "punjabi": "Punjabi"
    }

    # Handle multiple languages like:
    # "Telugu, Tamil" or "te, ta"
    parts = [
        part.strip()
        for part in value.split(",")
        if part.strip()
    ]

    converted = []

    for part in parts:

        normalized = part.lower()

        converted.append(
            language_map.get(
                normalized,
                part
            )
        )

    return ", ".join(converted)


def normalize_discovery_language(language):

    if not language:
        return None

    value = str(language).lower().strip()

    aliases = {
        "telugu": ["telugu", "te"],
        "hindi": ["hindi", "hi"],
        "tamil": ["tamil", "ta"],
        "english": ["english", "en"]
    }

    for name, values in aliases.items():

        if value == name or value in values:
            return name

    return value


def movie_matches_language(
    movie,
    language
):

    language = normalize_discovery_language(
        language
    )

    if not language:
        return True

    language_values = {
        "telugu": ["telugu", "te"],
        "hindi": ["hindi", "hi"],
        "tamil": ["tamil", "ta"],
        "english": ["english", "en"]
    }

    accepted = language_values.get(
        language,
        [language]
    )

    movie_language = " ".join([
        str(movie.get("Language", "")),
        str(movie.get("language", "")),
        str(movie.get("original_language", ""))
    ]).lower()

    return any(
        value in movie_language
        for value in accepted
    )


def calculate_quality_score(movie):

    score = 0.0

    # Featured metadata IMDb rating
    imdb_rating = pd.to_numeric(
        movie.get("imdbRating"),
        errors="coerce"
    )

    if pd.notna(imdb_rating):
        score += float(imdb_rating) * 0.6

    # TMDB rating
    tmdb_rating = pd.to_numeric(
        movie.get("vote_average"),
        errors="coerce"
    )

    if pd.notna(tmdb_rating):
        score += float(tmdb_rating) * 0.5

    # TMDB popularity
    popularity = pd.to_numeric(
        movie.get("popularity"),
        errors="coerce"
    )

    if pd.notna(popularity):
        score += min(
            np.log1p(float(popularity)),
            5
        ) * 0.2

    return round(score, 3)


def search_discovery_movies(
    query,
    movies=None,
    featured_metadata=None,
    multilingual_catalogue=None,
    language=None,
    limit=20
):

    # ---------------------------------------------
    # DETECT USER INTENT
    # ---------------------------------------------

    intent = detect_discovery_intent(
        query
    )

    theme_keys = [
        item["key"]
        for item in intent["themes"]
    ]

    detected_languages = [
        item["name"]
        for item in intent["languages"]
    ]

    selected_language = language

    if (
        not selected_language
        and detected_languages
    ):
        selected_language = (
            detected_languages[0]
        )

    results = []

    # =============================================
    # 1. FEATURED FULL METADATA
    # Best semantic quality because Plot exists
    # =============================================

    if (
        featured_metadata is not None
        and not featured_metadata.empty
    ):

        for _, row in featured_metadata.iterrows():

            movie = row.to_dict()

            if not movie_matches_language(
                movie,
                selected_language
            ):
                continue

            theme_score, matched, match_details = (
                calculate_v4_discovery_relevance(
                    movie,
                    theme_keys
                )
            )

            if theme_score <= 0:
                continue

            # Strong multi-theme filtering:
            # For queries with multiple themes, avoid weak matches.
            if len(theme_keys) >= 2:

                matched_theme_count = sum(
                    1
                    for value in match_details.values()
                    if value["score"] > 0
                )

                minimum_required = 2

                if matched_theme_count < minimum_required:
                    continue

            quality_score = (
                calculate_quality_score(movie)
            )

            total_score = (
                theme_score
                + quality_score
                + 8
            )

            results.append({
                "source": "featured",
                "movieId": movie.get("movieId"),
                "tmdb_id": None,
                "title": (
                    movie.get("Title")
                    or movie.get("title")
                ),
                "year": (
                    movie.get("Year")
                    or movie.get("year")
                ),
                "genres": (
                    movie.get("Genre")
                    or movie.get("genres")
                ),
                "language": get_full_language_name(
                    movie.get("Language")
                    or movie.get("language")
                    or movie.get("original_language")
                ),
                "overview": (
                    movie.get("Plot")
                    or movie.get("overview")
                ),
                "poster": (
                    movie.get("Poster")
                    or movie.get("poster")
                ),
                "rating": (
                    movie.get("imdbRating")
                    or movie.get("vote_average")
                ),
                "matched_keywords": matched,
                "theme_score": theme_score,
                "quality_score": quality_score,
                "discovery_score": round(
                    total_score,
                    3
                )
            })

    # =============================================
    # 2. MULTILINGUAL CATALOGUE
    # Large language-aware discovery source
    # =============================================

    if (
        multilingual_catalogue is not None
        and not multilingual_catalogue.empty
    ):

        catalogue = multilingual_catalogue

        if selected_language:

            language_map = {
                "telugu": "te",
                "hindi": "hi",
                "tamil": "ta",
                "malayalam": "ml",
                "kannada": "kn",
                "english": "en",
                "bengali": "bn",
                "marathi": "mr",
                "gujarati": "gu",
                "punjabi": "pa",
                "urdu": "ur",
                "odia": "or",
                "assamese": "as"
            }

            language_code = language_map.get(
                normalize_discovery_language(
                    selected_language
                )
            )

            if language_code:

                catalogue = catalogue[
                    catalogue[
                        "original_language"
                    ]
                    .astype(str)
                    .str.lower()
                    == language_code
                ]

        for _, row in catalogue.iterrows():

            movie = row.to_dict()

            theme_score, matched, match_details = (
                calculate_v4_discovery_relevance(
                    movie,
                    theme_keys
                )
            )

            if theme_score <= 0:
                continue

            # Strong multi-theme filtering:
            # For queries with multiple themes, avoid weak matches.
            if len(theme_keys) >= 2:

                matched_theme_count = sum(
                    1
                    for value in match_details.values()
                    if value["score"] > 0
                )

                minimum_required = 2

                if matched_theme_count < minimum_required:
                    continue

            quality_score = (
                calculate_quality_score(movie)
            )

            total_score = (
                theme_score
                + quality_score
            )

            results.append({
                "source": "multilingual",
                "movieId": None,
                "tmdb_id": movie.get("tmdb_id"),
                "title": movie.get("title"),
                "year": (
                    str(movie.get(
                        "release_date",
                        ""
                    ))[:4]
                ),
                "genres": movie.get("genres"),
                "language": get_full_language_name(
                    movie.get(
                        "original_language"
                    )
                ),
                "overview": movie.get(
                    "overview"
                ),
                "poster": movie.get(
                    "poster_url"
                ),
                "rating": movie.get(
                    "vote_average"
                ),
                "matched_keywords": matched,
                "theme_score": theme_score,
                "quality_score": quality_score,
                "discovery_score": round(
                    total_score,
                    3
                )
            })

    # =============================================
    # 3. MOVIELENS
    # Title + Genre coverage
    # =============================================

    if (
        movies is not None
        and not movies.empty
    ):

        for _, row in movies.iterrows():

            movie = row.to_dict()

            theme_score, matched, match_details = (
                calculate_v4_discovery_relevance(
                    movie,
                    theme_keys
                )
            )

            if theme_score <= 0:
                continue

            results.append({
                "source": "movielens",
                "movieId": movie.get("movieId"),
                "tmdb_id": None,
                "title": movie.get("title"),
                "year": None,
                "genres": movie.get("genres"),
                "language": None,
                "overview": None,
                "poster": None,
                "rating": None,
                "matched_keywords": matched,
                "theme_score": theme_score,
                "quality_score": 0,
                "discovery_score": theme_score
            })

    # =============================================
    # REMOVE DUPLICATES
    # =============================================

    seen_titles = set()
    unique_results = []

    for movie in sorted(
        results,
        key=lambda x: x["discovery_score"],
        reverse=True
    ):

        title = normalize_text(
            movie.get("title")
        )

        if not title:
            continue

        if title in seen_titles:
            continue

        seen_titles.add(title)
        unique_results.append(movie)

    return {
        "query": query,
        "intent": intent,
        "language": selected_language,
        "count": len(unique_results),
        "results": unique_results[:limit]
    }
