# MovieMind Capstone Project - Production Deployment Guide

This repository contains the complete **MovieMind Movie + Product Recommendation System**.

Due to the heavy machine learning recommendation engines and master catalogue dataset (~108,143 titles + SVD latent matrices + vector norms), the MovieMind API requires approximately **835 MB of RAM** at startup.

---

## Deployment Architecture Overview

```text
                               ┌─────────────────────────────┐
                               │     Frontend Web App        │
                               │  (Vercel / Netlify / Cloud) │
                               └──────────────┬──────────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       │                                             │
                       ▼                                             ▼
        ┌─────────────────────────────┐               ┌─────────────────────────────┐
        │       MovieMind API         │               │     Product Recommender     │
        │ (Hugging Face / Railway /   │               │   (Railway / Render /       │
        │  Cloud Run / Fly.io)        │               │    Cloud Run)               │
        │  - RAM: 835MB Peak          │               │  - RAM: ~150MB              │
        └─────────────────────────────┘               └─────────────────────────────┘
```

---

## Option 1: Hugging Face Spaces (100% FREE - 16 GB RAM) ⭐ RECOMMENDED FOR CAPSTONE DEMO

Hugging Face Spaces provides **16 GB RAM CPU Docker containers for FREE**, which easily handles MovieMind's 835 MB RAM footprint without memory crashes.

### Steps:
1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Set Space Name: `moviemind-movie-api`.
3. Select SDK: **Docker** -> **Blank**.
4. Set Space Hardware: **CPU Basic (16 GB RAM - Free)**.
5. Clone your space repository locally or push your files:
   ```bash
   git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/moviemind-movie-api
   git push hf main
   ```
6. Your Space will build `Dockerfile.movie` automatically and publish a public URL:
   `https://YOUR_USERNAME-moviemind-movie-api.hf.space`

---

## Option 2: Railway.app (Scalable RAM Containers)

Railway automatically provisions scalable RAM (512MB - 8GB RAM).

### Steps:
1. Log into [Railway.app](https://railway.app) with GitHub.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `movie-product-recommendation-system`.
4. Set Config File / Dockerfile: `Dockerfile.movie`.
5. Set Environment Variable: `PORT = 8000`.
6. Railway automatically deploys your API and generates a domain:
   `https://moviemind-movie-api.up.railway.app`

---

## Option 3: Google Cloud Run (Serverless Container)

### Steps:
1. Build container image:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/moviemind-movie-api -f Dockerfile.movie
   ```
2. Deploy container to Cloud Run with 2GB RAM:
   ```bash
   gcloud run deploy moviemind-movie-api \
     --image gcr.io/YOUR_PROJECT_ID/moviemind-movie-api \
     --memory 2Gi \
     --platform managed \
     --allow-unauthenticated \
     --port 8000
   ```

---

## Frontend Deployment (Vercel / Netlify / Render)

1. Connect your GitHub repository to Vercel/Netlify.
2. Set Build Command: `cd frontend && npm run build`
3. Set Output Directory: `frontend/dist`
4. Environment Variables:
   - `VITE_API_URL` = `https://YOUR_BACKEND_URL`
   - `VITE_PRODUCT_API_URL` = `https://YOUR_PRODUCT_BACKEND_URL`

---

## Local Development Commands

### 1. Movie Backend (Port 8000)
```bash
python3 -m uvicorn ml.backend.main:app --host 0.0.0.0 --port 8000
```

### 2. Product Backend (Port 8001)
```bash
python3 -m uvicorn app:app --app-dir product-recommendation --host 0.0.0.0 --port 8001
```

### 3. Frontend Web App
```bash
cd frontend && npm run dev
```

### 4. Automated E2E System Audit
```bash
python3 scripts/validate_system.py
```
