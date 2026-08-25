from ml.intelligence.intent_detector import analyze_user_intent
from ml.intelligence.preferences import detect_preferences


def build_user_context(user_input):
    intent = analyze_user_intent(user_input)
    preferences = detect_preferences(user_input)

    return {
        "user_input": user_input,

        "emotion": intent["emotion"],

        "situation": intent["situation"],

        "language": preferences["language"],

        "viewing_context": preferences["viewing_context"],

        "content_boundary": preferences["content_boundary"]
    }


def get_context_summary(context):
    return {
        "emotion": context["emotion"]["value"]
        if "value" in context["emotion"]
        else context["emotion"]["emotion"],

        "situation": context["situation"]["value"]
        if "value" in context["situation"]
        else context["situation"]["situation"],

        "language": context["language"]["value"],

        "viewing_context": context["viewing_context"]["value"],

        "content_boundary": context["content_boundary"]["value"]
    }


if __name__ == "__main__":

    examples = [
        "I am stressed because of exams and want a Telugu movie",
        "I miss my old friends and want something in Hindi",
        "I am feeling lonely and want a family safe English movie",
        "I am happy and want a Tamil movie with my friends"
    ]

    for example in examples:

        context = build_user_context(example)
        summary = get_context_summary(context)

        print("\n" + "=" * 60)
        print("MOVIEMIND USER CONTEXT")
        print("=" * 60)

        print("USER:", example)
        print("EMOTION:", summary["emotion"])
        print("SITUATION:", summary["situation"])
        print("LANGUAGE:", summary["language"])
        print("VIEWING CONTEXT:", summary["viewing_context"])
        print("CONTENT BOUNDARY:", summary["content_boundary"])
