def generate_recommendation_signals(movie):

    intelligence = movie.get(
        "moviemind_intelligence",
        {}
    )

    emotion_tags = intelligence.get(
        "emotion_tags",
        []
    )

    situation_tags = intelligence.get(
        "situation_tags",
        []
    )

    energy = intelligence.get("energy")

    viewing_contexts = intelligence.get(
        "viewing_contexts",
        []
    )

    content_boundaries = intelligence.get(
        "content_boundaries",
        []
    )

    scores = {
        "motivation_score": 0,
        "comfort_score": 0,
        "friendship_score": 0,
        "family_safe_score": 0,
        "entertainment_score": 0,
        "intensity_score": 0
    }

    # Emotion signals

    if "motivated" in emotion_tags:
        scores["motivation_score"] += 40

    if "hopeful" in emotion_tags:
        scores["motivation_score"] += 25
        scores["comfort_score"] += 10

    if "emotional" in emotion_tags:
        scores["comfort_score"] += 10

    if "comforting" in emotion_tags:
        scores["comfort_score"] += 40

    if "happy" in emotion_tags:
        scores["entertainment_score"] += 20
        scores["comfort_score"] += 15

    if "excited" in emotion_tags:
        scores["entertainment_score"] += 30

    if "dark" in emotion_tags:
        scores["intensity_score"] += 20

    if "suspenseful" in emotion_tags:
        scores["intensity_score"] += 25

    # Situation signals

    if "motivation" in situation_tags:
        scores["motivation_score"] += 35

    if "career_pressure" in situation_tags:
        scores["motivation_score"] += 20

    if "family_time" in situation_tags:
        scores["family_safe_score"] += 25

    if "celebration" in situation_tags:
        scores["entertainment_score"] += 20

    if "intense_viewing" in situation_tags:
        scores["intensity_score"] += 25

    # Energy signals

    if energy == "high_energy":
        scores["entertainment_score"] += 20
        scores["intensity_score"] += 15

    elif energy == "positive_energy":
        scores["entertainment_score"] += 20
        scores["comfort_score"] += 15

    elif energy == "intense":
        scores["intensity_score"] += 30

    # Viewing context signals

    if "family" in viewing_contexts:
        scores["family_safe_score"] += 30

    if "friends" in viewing_contexts:
        scores["friendship_score"] += 20
        scores["entertainment_score"] += 15

    # Content safety adjustments

    if "generally_safe" in content_boundaries:
        scores["family_safe_score"] += 20

    if "potentially_sensitive" in content_boundaries:
        scores["family_safe_score"] -= 25

    if "crime_sensitive" in content_boundaries:
        scores["family_safe_score"] -= 30
        scores["intensity_score"] += 20

    if "intense_content" in content_boundaries:
        scores["family_safe_score"] -= 20
        scores["intensity_score"] += 20

    # Normalize scores

    for key in scores:
        scores[key] = max(
            0,
            min(100, scores[key])
        )

    return scores
