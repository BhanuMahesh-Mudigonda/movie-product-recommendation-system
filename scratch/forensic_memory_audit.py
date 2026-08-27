#!/usr/bin/env python3
import sys
import resource
import time
import os
import gc
from pathlib import Path

def get_mem_mb():
    usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    if sys.platform == "darwin":
        return usage / (1024 * 1024)
    return usage / 1024

print("=" * 60)
print("MEMORY FORENSIC AUDIT")
print("=" * 60)

start_mem = get_mem_mb()
print(f"{'Component':<35} {'Memory Increase':<20} {'Total RSS':<15}")
print("-" * 70)
print(f"{'Python base':<35} {0.00:<20.2f} {start_mem:<15.2f} MB")

last_mem = start_mem

# 1. Imports
import pandas as pd
import numpy as np
import joblib

mem1 = get_mem_mb()
inc1 = mem1 - last_mem
last_mem = mem1
print(f"{'Imports (pandas/numpy/joblib)':<35} {inc1:<20.2f} {mem1:<15.2f} MB")

# 2. Paths
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "backend" / "data" / "catalogue"
MODEL_DIR = BASE_DIR / "ml" / "models"

# 3. Master Catalogue
master_csv = DATA_DIR / "moviemind_master_catalogue.csv"
if master_csv.exists():
    df_master = pd.read_csv(master_csv, low_memory=False)
    mem2 = get_mem_mb()
    inc2 = mem2 - last_mem
    last_mem = mem2
    print(f"{'Master catalogue CSV':<35} {inc2:<20.2f} {mem2:<15.2f} MB")

# 4. Multilingual Catalogue
multi_csv = DATA_DIR / "moviemind_multilingual_catalogue.csv"
if multi_csv.exists():
    df_multi = pd.read_csv(multi_csv, engine="python")
    mem3 = get_mem_mb()
    inc3 = mem3 - last_mem
    last_mem = mem3
    print(f"{'Multilingual catalogue CSV':<35} {inc3:<20.2f} {mem3:<15.2f} MB")

# 5. SVD Model
svd_path = MODEL_DIR / "svd_model.pkl"
if svd_path.exists():
    svd_model = joblib.load(svd_path)
    mem4 = get_mem_mb()
    inc4 = mem4 - last_mem
    last_mem = mem4
    print(f"{'SVD Model (svd_model.pkl)':<35} {inc4:<20.2f} {mem4:<15.2f} MB")

# 6. User Latent Matrix
user_lat_path = MODEL_DIR / "user_latent_matrix.pkl"
if user_lat_path.exists():
    user_lat = joblib.load(user_lat_path)
    mem5 = get_mem_mb()
    inc5 = mem5 - last_mem
    last_mem = mem5
    print(f"{'User Latent Matrix':<35} {inc5:<20.2f} {mem5:<15.2f} MB")

# 7. Movie Latent Matrix
movie_lat_path = MODEL_DIR / "movie_latent_matrix.pkl"
if movie_lat_path.exists():
    movie_lat = joblib.load(movie_lat_path)
    mem6 = get_mem_mb()
    inc6 = mem6 - last_mem
    last_mem = mem6
    print(f"{'Movie Latent Matrix':<35} {inc6:<20.2f} {mem6:<15.2f} MB")

# 8. Feature Pickles
feat_meta_path = MODEL_DIR / "featured_movie_metadata.pkl"
if feat_meta_path.exists():
    feat_meta = pd.read_pickle(feat_meta_path)
    mem7 = get_mem_mb()
    inc7 = mem7 - last_mem
    last_mem = mem7
    print(f"{'Featured Movie Metadata Pickle':<35} {inc7:<20.2f} {mem7:<15.2f} MB")

# 9. Matrix Normalization
if 'movie_lat' in locals():
    mat = np.asarray(movie_lat, dtype=np.float32)
    norms = np.linalg.norm(mat, axis=1, keepdims=True)
    norms[norms == 0] = 1e-10
    norm_mat = mat / norms
    del norms
    gc.collect()
    mem8 = get_mem_mb()
    inc8 = mem8 - last_mem
    last_mem = mem8
    print(f"{'Normalized Movie Latent Matrix':<35} {inc8:<20.2f} {mem8:<15.2f} MB")

print("=" * 60)
print(f"{'TOTAL PEAK MEMORY':<35} {get_mem_mb():<20.2f} MB")
print("=" * 60)
