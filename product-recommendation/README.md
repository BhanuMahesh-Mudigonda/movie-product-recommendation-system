# Product Recommendation Engine

An end-to-end, content-based product recommender built from `products.csv`, `reviews.csv`, and `electronics_product.csv`. Apparel combines titles, brands, categories, descriptions, review summaries and cleaned review text; the electronics source supplies product names, prices, ratings and review counts. Both are searched through one TF-IDF index.

## Pipeline

Raw CSVs → cleaning and review aggregation → exploratory summary / quality checks → text feature engineering → TF-IDF representation → similarity ranking → offline retrieval evaluation → saved model artifact → FastAPI → browser frontend.

This dataset has product and review records but no user identity or interaction history, so collaborative filtering is not appropriate. Add click/cart/purchase events later to evolve this into a hybrid personalized model.

## Run

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python train.py
uvicorn app:app --reload
# In another terminal, start the React gateway:
node server.js
```

Open http://127.0.0.1:3000. The Node gateway serves the React frontend and proxies `/api` requests to FastAPI on port 8000. FastAPI docs are available at http://127.0.0.1:8000/docs.

The current raw data contains apparel and electronics. Add a books source and map it in `train.py` before exposing a populated books category.

## API

`POST /api/recommend` with `{"query":"wireless noise cancelling headphones", "k":5}` returns ranked product recommendations. `GET /api/products/{asin}/similar` returns related products.

## Evaluation and production next steps

`train.py` writes `artifacts/metrics.json`, using held-out product-title category retrieval as an offline proxy. For production, track search queries, impressions, clicks, add-to-cart and purchases; then evaluate CTR, conversion, coverage, latency and diversity. Retrain periodically and monitor catalog drift and no-result queries.
