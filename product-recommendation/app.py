"""FastAPI service for the trained product recommender."""
from __future__ import annotations

from pathlib import Path
import base64
import hashlib
import hmac
import joblib
import numpy as np
import re
import secrets
import sqlite3
import time
import pandas as pd
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sklearn.metrics.pairwise import linear_kernel

ROOT = Path(__file__).parent
DATABASE = ROOT / "users.db"
SESSION_COOKIE = "smart_recommend_session"
SESSION_SECRET = secrets.token_bytes(32)
SESSION_TTL = 60 * 60 * 24 * 7
bundle = joblib.load(ROOT / "artifacts" / "recommender.joblib")
vectorizer, matrix = bundle["vectorizer"], bundle["matrix"]
catalog = bundle.get("catalog") if isinstance(bundle.get("catalog"), pd.DataFrame) else pd.read_csv(ROOT / "artifacts" / "clean_catalog.csv").fillna("")

app = FastAPI(title="Product Recommendation API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class RecommendationRequest(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    k: int = Field(default=5, ge=1, le=20)
    department: str | None = Field(default=None, pattern="^(Apparel|Electronics)$")

class ProductListResponse(BaseModel):
    products: list[dict]
    total: int

class AuthRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)

def database_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection

def initialize_database():
    with database_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

initialize_database()

def normalize_email(email: str) -> str:
    value = email.strip().lower()
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
        raise HTTPException(422, "Enter a valid email address")
    return value

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 210_000)
    return f"{base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(derived).decode()}"

def verify_password(password: str, stored: str) -> bool:
    try:
        salt_value, hash_value = stored.split("$", 1)
        salt = base64.urlsafe_b64decode(salt_value.encode())
        expected = base64.urlsafe_b64decode(hash_value.encode())
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 210_000)
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False

def session_value(user_id: int) -> str:
    payload = f"{user_id}:{int(time.time()) + SESSION_TTL}".encode()
    encoded = base64.urlsafe_b64encode(payload).decode().rstrip("=")
    signature = hmac.new(SESSION_SECRET, encoded.encode(), hashlib.sha256).hexdigest()
    return f"{encoded}.{signature}"

def user_from_session(cookie: str | None):
    if not cookie or "." not in cookie:
        return None
    encoded, signature = cookie.rsplit(".", 1)
    expected = hmac.new(SESSION_SECRET, encoded.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return None
    try:
        user_id, expires = base64.urlsafe_b64decode((encoded + "===").encode()).decode().split(":")
        if int(expires) < time.time():
            return None
        with database_connection() as connection:
            return connection.execute("SELECT id, email FROM users WHERE id = ?", (int(user_id),)).fetchone()
    except (ValueError, TypeError, UnicodeDecodeError):
        return None

def set_session(response: Response, user_id: int):
    response.set_cookie(SESSION_COOKIE, session_value(user_id), httponly=True, samesite="lax", max_age=SESSION_TTL, path="/")

def serialize(frame):
    results = frame.copy()
    results["image_url"] = results.all_images.str.extract(r"(https?[^'\"\s,]+)", expand=False).fillna("")
    electronic_images = results["department"].eq("Electronics") & results["image_url"].eq("")
    results.loc[electronic_images, "image_url"] = results.loc[electronic_images, "asin"].map(
        lambda asin: f"https://images-na.ssl-images-amazon.com/images/P/{asin}.01.LZZZZZZZ.jpg"
    )
    return results[["asin", "title", "brand", "category", "department", "description", "price", "rating", "rating_count_num", "product_url", "image_url", "score"]].to_dict("records")

def rank(query: str, k: int, exclude: str | None = None, department: str | None = None):
    q_clean = query.strip().lower()
    q_tokens = [w for w in re.findall(r"[a-zA-Z0-9]+", q_clean) if len(w) > 1]
    if not q_tokens:
        q_tokens = [q_clean]

    relevance = linear_kernel(vectorizer.transform([query]), matrix).ravel()
    titles_lower = catalog["title"].str.lower().to_numpy()
    brands_lower = catalog["brand"].str.lower().to_numpy()

    token_overlap_scores = np.zeros(len(catalog))
    phrase_bonus = np.ones(len(catalog))

    for i, t in enumerate(titles_lower):
        matched_tokens = sum(1 for tok in q_tokens if tok in t)
        overlap_ratio = matched_tokens / max(len(q_tokens), 1)
        token_overlap_scores[i] = overlap_ratio

        if q_clean in t:
            phrase_bonus[i] = 4.0 if t.startswith(q_clean) else 3.0
        elif overlap_ratio == 1.0 and len(q_tokens) >= 2:
            phrase_bonus[i] = 2.2
        elif overlap_ratio >= 0.5:
            phrase_bonus[i] = 1.3

        if relevance[i] < 0.1 and overlap_ratio > 0:
            relevance[i] = max(relevance[i], 0.35 * overlap_ratio)

    first_q_tok = q_tokens[0] if q_tokens else ""
    brand_bonus = np.array([1.5 if b == first_q_tok or b.startswith(first_q_tok) else 1.0 for b in brands_lower])

    accessory_words = {"case", "cover", "tempered", "glass", "strap", "protector", "guard", "pouch", "skin", "sleeve", "adapter", "cable", "charger", "stand"}
    q_is_accessory = any(tok in accessory_words for tok in q_tokens)

    accessory_penalty = np.ones(len(catalog))
    if not q_is_accessory:
        accessory_penalty = np.array([
            0.60 if any(f" {w} " in f" {t} " or t.startswith(f"{w} ") for w in accessory_words) else 1.0
            for t in titles_lower
        ])

    adjusted_relevance = relevance * phrase_bonus * brand_bonus * accessory_penalty * (0.8 + 0.4 * token_overlap_scores)
    scores = 0.92 * adjusted_relevance + 0.08 * catalog["popularity"].to_numpy(dtype=float)
    scores[(relevance == 0) & (token_overlap_scores == 0)] = -1

    if exclude:
        scores[catalog.index[catalog.asin == exclude]] = -1
    if department:
        scores[catalog.department != department] = -1

    top = np.argsort(scores)[::-1][:k]
    top = [i for i in top if scores[i] >= 0]
    result = catalog.iloc[top].copy()
    result["score"] = np.round(scores[top], 4)
    return serialize(result)

@app.get("/health")
def health():
    return {"status": "ok", "products": len(catalog)}

@app.post("/api/auth/register", status_code=201)
def register(request: AuthRequest, response: Response):
    email = normalize_email(request.email)
    try:
        with database_connection() as connection:
            cursor = connection.execute(
                "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                (email, hash_password(request.password)),
            )
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        raise HTTPException(409, "An account with this email already exists")
    set_session(response, user_id)
    return {"user": {"id": user_id, "email": email}}

@app.post("/api/auth/login")
def login(request: AuthRequest, response: Response):
    email = normalize_email(request.email)
    with database_connection() as connection:
        user = connection.execute("SELECT id, email, password_hash FROM users WHERE email = ?", (email,)).fetchone()
    if user is None or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(401, "Email or password is incorrect")
    set_session(response, user["id"])
    return {"user": {"id": user["id"], "email": user["email"]}}

@app.get("/api/auth/me")
def current_user(request: Request):
    user = user_from_session(request.cookies.get(SESSION_COOKIE))
    if user is None:
        raise HTTPException(401, "Not authenticated")
    return {"user": {"id": user["id"], "email": user["email"]}}

@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie(SESSION_COOKIE, path="/")
    return {"status": "ok"}

@app.get("/api/products", response_model=ProductListResponse)
def products(
    department: str | None = Query(default=None, pattern="^(Apparel|Electronics)$"),
    limit: int = Query(default=24, ge=1, le=100),
):
    filtered = catalog if department is None else catalog[catalog.department == department]
    scores = filtered.copy()
    scores["score"] = scores["popularity"].astype(float).round(4)
    return {"products": serialize(scores.head(limit)), "total": len(filtered)}

@app.get("/api/search-suggestions")
def search_suggestions(
    q: str = Query(min_length=1, max_length=120),
    department: str | None = Query(default=None, pattern="^(Apparel|Electronics)$"),
    limit: int = Query(default=8, ge=1, le=12),
):
    search_text = q.strip().lower()
    filtered = catalog if department is None else catalog[catalog.department == department]
    title = filtered["title"].astype(str).str.lower()
    brand = filtered["brand"].astype(str).str.lower()
    category = filtered["category"].astype(str).str.lower()

    starts_with = title.str.startswith(search_text) | brand.str.startswith(search_text)
    contains = title.str.contains(search_text, regex=False) | brand.str.contains(search_text, regex=False) | category.str.contains(search_text, regex=False)
    matches = filtered[contains].copy()
    matches["suggestion_rank"] = starts_with[contains].astype(int) * 2 + matches["popularity"].astype(float)
    matches["score"] = matches["popularity"].astype(float).round(4)
    matches = matches.sort_values("suggestion_rank", ascending=False)
    return {"suggestions": serialize(matches.head(limit))}

@app.post("/api/recommend")
def recommend(request: RecommendationRequest):
    return {"query": request.query, "department": request.department, "results": rank(request.query, request.k, department=request.department)}

@app.get("/api/products/{asin}/similar")
def similar(asin: str, k: int = Query(5, ge=1, le=20)):
    product = catalog[catalog.asin == asin]
    if product.empty:
        raise HTTPException(404, "Product ASIN not found")
    query = " ".join(product.iloc[0][["title", "brand", "category", "description"]].astype(str))
    return {"asin": asin, "results": rank(query, k, exclude=asin)}

# Mount last: a root mount otherwise captures /api routes before FastAPI can match them.
app.mount("/", StaticFiles(directory=ROOT / "frontend", html=True), name="frontend")
