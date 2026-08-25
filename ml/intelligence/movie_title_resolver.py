import os
import pickle
import re
from difflib import SequenceMatcher


CATALOGUE_FILE = "ml/models/movie_catalogue_base.pkl"


def extract_year(title):
    match = re.search(r"\((\d{4})\)$", str(title))

    if match:
        return int(match.group(1))

    return None


def remove_year(title):
    return re.sub(
        r"\s*\(\d{4}\)$",
        "",
        str(title)
    ).strip()


def clean_title(title):

    title = remove_year(title)
    title = title.lower()

    title = title.replace("a.k.a.", " ")
    title = title.replace("aka", " ")

    title = re.sub(
        r"[^a-z0-9\s]",
        " ",
        title
    )

    title = re.sub(
        r"\s+",
        " ",
        title
    ).strip()

    return title


def extract_title_variants(title):

    title_without_year = remove_year(title)

    variants = [
        title_without_year
    ]

    aka_match = re.search(
        r"\(a\.k\.a\.\s*(.*?)\)",
        title_without_year,
        flags=re.IGNORECASE
    )

    if aka_match:

        alias = aka_match.group(1)

        main_title = re.sub(
            r"\s*\(a\.k\.a\.\s*.*?\)",
            "",
            title_without_year,
            flags=re.IGNORECASE
        ).strip()

        variants.append(main_title)
        variants.append(alias)

    cleaned_variants = []

    for variant in variants:

        cleaned = clean_title(variant)

        if cleaned and cleaned not in cleaned_variants:
            cleaned_variants.append(cleaned)

    return cleaned_variants


def load_catalogue():

    if not os.path.exists(CATALOGUE_FILE):

        raise FileNotFoundError(
            f"Catalogue not found: {CATALOGUE_FILE}"
        )

    with open(
        CATALOGUE_FILE,
        "rb"
    ) as file:

        return pickle.load(file)


def similarity_score(text1, text2):

    return SequenceMatcher(
        None,
        clean_title(text1),
        clean_title(text2)
    ).ratio()


def resolve_movie_title(user_title, year=None):

    catalogue = load_catalogue()

    search_title = clean_title(user_title)

    candidates = []

    for _, row in catalogue.iterrows():

        catalogue_title = row["title"]

        catalogue_year = extract_year(
            catalogue_title
        )

        if year is not None:

            if catalogue_year != int(year):
                continue

        title_variants = extract_title_variants(
            catalogue_title
        )

        best_score = 0

        for variant in title_variants:

            if search_title == variant:
                score = 1.0

            else:
                score = similarity_score(
                    search_title,
                    variant
                )

            best_score = max(
                best_score,
                score
            )

        if best_score >= 0.80:

            candidates.append({

                "title": catalogue_title,

                "movieId": row["movieId"],

                "imdbID": row.get("imdbID"),

                "tmdbId": row.get("tmdbId"),

                "year": catalogue_year,

                "score": round(
                    best_score,
                    3
                )

            })

    candidates.sort(

        key=lambda x: x["score"],

        reverse=True

    )

    if not candidates:

        return {

            "status": "not_found",

            "best_match": None,

            "candidates": []

        }

    return {

        "status": "resolved",

        "best_match": candidates[0],

        "candidates": candidates[:5]

    }


if __name__ == "__main__":

    examples = [

        ("12 Monkeys", 1995),

        ("Twelve Monkeys", 1995),

        ("Toy Story", 1995),

        ("Jumanji", 1995),

        ("Se7en", 1995),

        ("Seven", 1995)

    ]

    for title, year in examples:

        result = resolve_movie_title(
            title,
            year
        )

        print("\n" + "=" * 70)

        print(
            "MOVIEMIND SMART TITLE RESOLVER"
        )

        print("=" * 70)

        print("USER INPUT:", title)

        print("STATUS:", result["status"])

        if result["best_match"]:

            match = result["best_match"]

            print(
                "BEST MATCH:",
                match["title"]
            )

            print(
                "YEAR:",
                match["year"]
            )

            print(
                "MOVIE ID:",
                match["movieId"]
            )

            print(
                "CONFIDENCE:",
                match["score"]
            )

            print(
                "\nTOP CANDIDATES:"
            )

            for candidate in result["candidates"]:

                print(
                    "-",
                    candidate["title"],
                    "|",
                    candidate["score"]
                )

        else:

            print("No movie found")
