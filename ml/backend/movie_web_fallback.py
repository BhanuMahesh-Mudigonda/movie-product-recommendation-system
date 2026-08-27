import re
import httpx
from urllib.parse import quote


WIKIPEDIA_SUMMARY_URL = (
    "https://en.wikipedia.org/api/rest_v1/page/summary/"
)


def clean_html(text):
    if not text:
        return ""

    return re.sub(
        r"<[^>]+>",
        "",
        text
    )


def build_candidates(query: str):

    query = query.strip()

    candidates = [
        query,
        f"{query} film",
        f"{query} movie"
    ]

    special_titles = {
        "avatar": [
            "Avatar (2009 film)"
        ],
        "pushpa": [
            "Pushpa: The Rise"
        ],
        "baahubali": [
            "Baahubali: The Beginning",
            "Baahubali 2: The Conclusion"
        ],
        "bahubali": [
            "Baahubali: The Beginning",
            "Baahubali 2: The Conclusion"
        ],
        "the godfather": [
            "The Godfather (1972 film)"
        ]
    }

    key = query.lower()

    if key in special_titles:
        candidates = (
            special_titles[key]
            + candidates
        )

    seen = set()
    unique = []

    for item in candidates:

        normalized = item.strip()

        if (
            normalized
            and normalized.lower()
            not in seen
        ):

            seen.add(
                normalized.lower()
            )

            unique.append(
                normalized
            )

    return unique


def search_web_movie(query: str):

    if not query or not query.strip():
        return None

    candidates = build_candidates(query)

    headers = {
        "User-Agent":
            "MovieMind-Recommendation-System/1.0"
    }

    for candidate in candidates:

        try:

            encoded_title = quote(
                candidate.replace(" ", "_")
            )

            url = (
                WIKIPEDIA_SUMMARY_URL
                + encoded_title
            )

            response = httpx.get(
                url,
                headers=headers,
                timeout=3.0,
                follow_redirects=True
            )

            if response.status_code != 200:
                continue

            data = response.json()

            title = clean_html(
                data.get("title")
            )

            extract = clean_html(
                data.get("extract")
            )

            description = clean_html(
                data.get("description")
            )

            if not title:
                continue

            combined_text = (
                title
                + " "
                + extract
                + " "
                + description
            )

            year_match = re.search(
                r"\b(18|19|20)\d{2}\b",
                combined_text
            )

            year = (
                year_match.group(0)
                if year_match
                else None
            )

            original_image = (
                data.get(
                    "originalimage",
                    {}
                ).get(
                    "source"
                )
            )

            thumbnail = (
                data.get(
                    "thumbnail",
                    {}
                ).get(
                    "source"
                )
            )

            trailer_query = quote(
                f"{title} official trailer"
            )

            return {
                "title": title,
                "year": year,
                "poster":
                    original_image
                    or thumbnail,
                "overview": extract,
                "description": description,
                "trailer":
                    "https://www.youtube.com/results?search_query="
                    + trailer_query,
                "source":
                    "wikipedia_rest_fallback"
            }

        except Exception as e:

            print(
                f"[WIKIPEDIA FALLBACK ERROR] "
                f"{candidate}: {e}"
            )

            continue

    return None
