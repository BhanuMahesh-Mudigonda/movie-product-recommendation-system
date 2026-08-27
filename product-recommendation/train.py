"""Train a reproducible content-based product recommendation model."""
from __future__ import annotations

import json
import re
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

ROOT = Path(__file__).parent
ARTIFACTS = ROOT / "artifacts"
RANDOM_STATE = 42


def text(value: object) -> str:
    """Normalize nulls and common scrape encoding artifacts."""
    value = "" if pd.isna(value) else str(value)
    return re.sub(r"\s+", " ", value.replace("â€º", "> ").replace("Â®", "")).strip()


def number(value: object) -> float:
    match = re.search(r"[\d,.]+", text(value))
    return float(match.group().replace(",", "")) if match else 0.0


def build_catalog(products: pd.DataFrame, reviews: pd.DataFrame) -> pd.DataFrame:
    products = products.drop_duplicates("asin").copy()
    reviews = reviews.dropna(subset=["productASIN"]).copy()
    reviews["review_for_model"] = reviews["cleaned_review_text"].fillna(reviews["reviewText"]).map(text)
    review_summary = reviews.groupby("productASIN").agg(
        review_text=("review_for_model", lambda x: " ".join(x.head(12))),
        mean_review_rating=("rating", "mean"),
        review_count=("rating", "size"),
    ).reset_index()
    catalog = products.merge(review_summary, left_on="asin", right_on="productASIN", how="left")
    catalog["title"] = catalog["title"].map(text)
    catalog["brand"] = catalog["brand_name"].map(text)
    catalog["category"] = catalog["breadcrumbs"].map(text)
    catalog["description"] = catalog[["about_item", "product_description", "customer_review_summary"]].fillna("").agg(" ".join, axis=1).map(text)
    catalog["review_text"] = catalog["review_text"].fillna("").map(text)
    # Repeat high-signal short fields once so they carry meaningful weight in TF-IDF.
    catalog["model_text"] = (catalog["title"] + " " + catalog["title"] + " " + catalog["brand"] + " " +
                             catalog["category"] + " " + catalog["description"] + " " + catalog["review_text"])
    catalog["price"] = catalog["price_value"].map(number)
    catalog["rating"] = catalog["rating_stars"].map(number).where(lambda s: s > 0, catalog["mean_review_rating"]).fillna(0)
    catalog["rating_count_num"] = catalog["rating_count"].map(number).fillna(0)
    catalog["review_count"] = catalog["review_count"].fillna(0).astype(int)
    catalog["popularity"] = ((catalog["rating"].clip(0, 5) / 5) * np.log1p(catalog["rating_count_num"] + catalog["review_count"]))
    max_popularity = catalog["popularity"].max()
    catalog["popularity"] = catalog["popularity"] / max_popularity if max_popularity else 0
    catalog["department"] = "Apparel"
    columns = ["asin", "title", "brand", "category", "department", "description", "price", "rating", "rating_count_num", "review_count", "popularity", "product_url", "all_images", "model_text"]
    return catalog[columns].fillna("")


def build_electronics(electronics: pd.DataFrame) -> pd.DataFrame:
    """Map the electronics_product dataset into the unified search schema."""
    extracted_asin = electronics["link"].astype(str).str.extract(r"/dp/([A-Z0-9]{10})", expand=False)
    asin_series = extracted_asin.combine_first(pd.Series(["ELEC" + str(i) for i in electronics.index]))

    price_series = electronics["discount_price"].fillna(electronics.get("actual_price", 0)).map(number)
    rating_series = electronics["ratings"].map(number)
    rating_count_series = electronics["no_of_ratings"].map(number)

    catalog = pd.DataFrame({
        "asin": asin_series.map(text),
        "title": electronics["name"].map(text),
        "price": price_series,
        "rating": rating_series,
        "rating_count_num": rating_count_series,
        "product_url": electronics["link"].map(text),
        "all_images": electronics["image"].map(text),
    }).drop_duplicates("asin")
    catalog["brand"] = catalog.title.str.split().str[0]
    catalog["category"] = "Electronics"
    catalog["department"] = "Electronics"
    catalog["description"] = catalog.title
    catalog["review_count"] = 0
    catalog["model_text"] = catalog.title + " " + catalog.title + " " + catalog.brand + " electronics"
    catalog["popularity"] = (catalog.rating.clip(0, 5) / 5) * np.log1p(catalog.rating_count_num)
    maximum = catalog.popularity.max()
    catalog["popularity"] = catalog.popularity / maximum if maximum else 0
    return catalog[["asin", "title", "brand", "category", "department", "description", "price", "rating", "rating_count_num", "review_count", "popularity", "product_url", "all_images", "model_text"]]


def evaluate(catalog: pd.DataFrame, matrix, vectorizer: TfidfVectorizer) -> dict:
    """Offline proxy: does a held-out product title retrieve its catalog category?"""
    # The apparel scrape has several malformed separator encodings, but its labels
    # remain detailed while the electronics source intentionally uses one broad label.
    detailed = catalog[(catalog.department == "Apparel") & (catalog.category.str.len() > 5)]
    eligible = detailed.sample(min(120, len(detailed)), random_state=RANDOM_STATE)
    hits = []
    reciprocal_ranks = []
    for idx, row in eligible.iterrows():
        scores = linear_kernel(vectorizer.transform([row.title]), matrix).ravel()
        scores[idx] = -1
        top = np.argsort(scores)[::-1][:10]
        matches = (catalog.iloc[top].category == row.category).to_numpy()
        hits.append(matches[:5].mean())
        rank = np.flatnonzero(matches)
        reciprocal_ranks.append(1 / (rank[0] + 1) if len(rank) else 0)
    return {"evaluation": "held-out product-title category retrieval proxy", "samples": len(eligible),
            "precision_at_5": round(float(np.mean(hits)), 4), "mrr_at_10": round(float(np.mean(reciprocal_ranks)), 4)}


def main() -> None:
    ARTIFACTS.mkdir(exist_ok=True)
    apparel = build_catalog(pd.read_csv(ROOT / "products.csv", low_memory=False), pd.read_csv(ROOT / "reviews.csv", low_memory=False))
    electronics = build_electronics(pd.read_csv(ROOT / "electronics_product.csv", low_memory=False))
    catalog = pd.concat([apparel, electronics], ignore_index=True).drop_duplicates("asin")
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), min_df=1, max_df=0.92, sublinear_tf=True, max_features=30000)
    matrix = vectorizer.fit_transform(catalog.model_text)
    metrics = evaluate(catalog, matrix, vectorizer)
    joblib.dump({"vectorizer": vectorizer, "matrix": matrix, "catalog": catalog.drop(columns="model_text")}, ARTIFACTS / "recommender.joblib")
    (ARTIFACTS / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    catalog.drop(columns="model_text").to_csv(ARTIFACTS / "clean_catalog.csv", index=False)
    print(json.dumps({"products": len(catalog), "by_department": catalog.department.value_counts().to_dict(), "features": matrix.shape[1], **metrics}, indent=2))


if __name__ == "__main__":
    main()
