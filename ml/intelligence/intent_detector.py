import re

from ml.intelligence.taxonomy import EMOTIONS
from ml.intelligence.situations import SITUATIONS


def count_keyword_matches(text, keyword):
    pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
    return len(re.findall(pattern, text))


def detect_emotion(user_input):
    text = user_input.lower()

    scores = {}

    for emotion, data in EMOTIONS.items():
        score = 0

        for keyword in data["keywords"]:
            matches = count_keyword_matches(text, keyword)
            score += matches

        scores[emotion] = score

    best_emotion = max(scores, key=scores.get)

    if scores[best_emotion] == 0:
        return {
            "emotion": "unknown",
            "label": "Unknown",
            "confidence": 0
        }

    return {
        "emotion": best_emotion,
        "label": EMOTIONS[best_emotion]["label"],
        "confidence": scores[best_emotion]
    }


def detect_situation(user_input):
    text = user_input.lower()

    situation_keywords = {
        "friendship": [
            "friendship",
            "buddy",
            "best friend",
            "friends"
        ],
        "missing_friends": [
            "miss my friends",
            "missing friends",
            "missing my friends",
            "old friends"
        ],
        "breakup": [
            "breakup",
            "break up",
            "heartbreak",
            "ex",
            "separation"
        ],
        "family_time": [
            "family movie",
            "watch with family",
            "family",
            "parents"
        ],
        "exam_stress": [
            "exam stress",
            "exam",
            "exams",
            "study pressure",
            "college stress"
        ],
        "career_pressure": [
            "career pressure",
            "career",
            "job pressure",
            "placement",
            "future"
        ],
        "celebration": [
            "celebration",
            "celebrate",
            "party",
            "birthday"
        ],
        "feeling_alone": [
            "feeling alone",
            "alone",
            "lonely",
            "isolated",
            "no one"
        ],
        "motivation": [
            "need motivation",
            "motivation",
            "inspire me",
            "give up",
            "success"
        ],
        "weekend": [
            "weekend",
            "saturday",
            "sunday",
            "free time"
        ]
    }

    scores = {}

    for situation, keywords in situation_keywords.items():
        score = 0

        for keyword in keywords:
            matches = count_keyword_matches(text, keyword)

            if " " in keyword and matches > 0:
                score += matches * 3
            else:
                score += matches

        scores[situation] = score

    best_situation = max(scores, key=scores.get)

    if scores[best_situation] == 0:
        return {
            "situation": "general",
            "label": "General Entertainment",
            "confidence": 0
        }

    return {
        "situation": best_situation,
        "label": SITUATIONS[best_situation]["label"],
        "confidence": scores[best_situation]
    }


def analyze_user_intent(user_input):
    emotion_result = detect_emotion(user_input)
    situation_result = detect_situation(user_input)

    return {
        "user_input": user_input,
        "emotion": emotion_result,
        "situation": situation_result
    }


if __name__ == "__main__":
    examples = [
        "I am feeling lonely and missing my friends",
        "I have exam stress and need motivation",
        "I want to watch a movie with my family",
        "I am happy and want something fun",
        "I am going through a breakup",
        "I am stressed because of my exams",
        "I miss my old friends"
    ]

    for example in examples:
        result = analyze_user_intent(example)

        print("\nUSER:", result["user_input"])
        print("EMOTION:", result["emotion"])
        print("SITUATION:", result["situation"])
