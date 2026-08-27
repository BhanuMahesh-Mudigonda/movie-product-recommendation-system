#!/usr/bin/env python3
import sys
import resource
import time
from pathlib import Path

def get_mem_mb():
    usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    if sys.platform == "darwin":
        return usage / (1024 * 1024)
    return usage / 1024

print("=" * 60)
print("LAZY LOADING MEMORY DIAGNOSTIC TEST")
print("=" * 60)

start_mem = get_mem_mb()
print(f"1. Initial Process Memory: {start_mem:.2f} MB")

import pandas as pd
import numpy as np

# Load only featured_metadata (0.21 MB) as used by /movies/home
BASE_DIR = Path(__file__).resolve().parents[1]
FEATURED_METADATA_PATH = BASE_DIR / "ml" / "models" / "featured_movie_metadata.pkl"

t0 = time.time()
featured_metadata = pd.read_pickle(FEATURED_METADATA_PATH)
t1 = time.time()

mem_home = get_mem_mb()
print(f"2. Loaded featured_metadata ({len(featured_metadata)} titles) in {t1 - t0:.4f}s")
print(f"3. Process Memory for Server Boot + /movies/home: {mem_home:.2f} MB")
print("=" * 60)
