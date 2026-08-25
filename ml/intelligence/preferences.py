import re


LANGUAGES = {
    "telugu": [
        "telugu", "tollywood", "telugu movie", "telugu movies"
    ],
    "hindi": [
        "hindi", "bollywood", "hindi movie", "hindi movies"
    ],
    "english": [
        "english", "hollywood", "english movie", "english movies"
    ],
    "tamil": [
        "tamil", "kollywood", "tamil movie", "tamil movies"
    ],
    "malayalam": [
        "malayalam", "mollywood", "malayalam movie"
    ],
    "kannada": [
        "kannada", "sandalwood", "kannada movie"
    ]
}


VIEWING_CONTEXTS = {
    "family": [
        "with family",
        "family movie",
        "watch with parents",
        "with parents",
        "family"
    ],
    "friends": [
        "with friends",
        "with my friends",
        "friends night",
        "friend group"
    ],
    "solo": [
        "alone",
        "by myself",
        "solo",
        "myself"
    ],
    "couple": [
        "with my partner",
        "with girlfriend",
        "with boyfriend",
        "date night",
        "couple"
    ]
}


CONTENT_BOUNDARIES = {
    "family_safe": [
        "family safe",
        "clean movie",
        "no adult content",
        "no sexual content",
        "safe for family",
        "kids friendly"
    ],
    "avoid_violence": [
        "no violence",
        "avoid violence",
        "not violent"
    ],
    "avoid_horror": [
        "no horror",
        "avoid horror",
        "not scary"
    ],
    "no_restriction": []
}


def count_matches(text, phrase):
    pattern = r'\b' + re.escape(phrase.lower()) + r'\b'
    return len(re.findall(pattern, text))


def detect_from_categories(user_input, categories, default_value):
    text = user_input.lower()

    scores = {}

    for category, keywords in categories.items():
        score = 0

        for keyword in keywords:
            matches = count_matches(text, keyword)

            if " " in keyword and matches > 0:
                score += matches * 2
            else:
                score += matches

        scores[category] = score

    best_category = max(scores, key=scores.get)

    if scores[best_category] == 0:
        return {
            "value": default_value,
            "confidence": 0
        }

    return {
        "value": best_category,
        "confidence": scores[best_category]
    }


def detect_preferences(user_input):
    language = detect_from_categories(
        user_input,
        LANGUAGES,
        "any"
    )

    viewing_context = detect_from_categories(
        user_input,
        VIEWING_CONTEXTS,
        "any"
    )

    content_boundary = detect_from_categories(
        user_input,
        CONTENT_BOUNDARIES,
        "no_restriction"
    )

    return {
        "language": language,
        "viewing_context": viewing_context,
        "content_boundary": content_boundary
    }


if __name__ == "__main__":
    examples = [
        "I am stressed because of exams. Suggest a Telugu movie",
        "I want a family safe Hindi movie to watch with my parents",
        "I am watching alone and want an English movie",
        "Suggest a Tamil movie with no horror",
        "I want a fun movie with my friends"
    ]

    for example in examples:
        result = detect_preferences(example)

        print("\nUSER:", example)
        print("LANGUAGE:", result["language"])
        print("VIEWING CONTEXT:", result["viewing_context"])
        print("CONTENT BOUNDARY:", result["content_boundary"])
