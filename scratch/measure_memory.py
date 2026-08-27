#!/usr/bin/env python3
import os
import resource
import time
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

def get_memory_mb():
    # maxrss in KB on macOS, bytes on Linux
    usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    if sys.platform == "darwin":
        return usage / (1024 * 1024) # MB on macOS
    return usage / 1024 # MB on Linux

start_mem = get_memory_mb()
print(f"[MEMORY DIAGNOSTIC] Initial Process RAM: {start_mem:.2f} MB")

t0 = time.time()
from ml.backend.main import app
t1 = time.time()

end_mem = get_memory_mb()
print(f"[MEMORY DIAGNOSTIC] Loaded ml.backend.main in {t1 - t0:.2f}s")
print(f"[MEMORY DIAGNOSTIC] Final Process Peak RAM: {end_mem:.2f} MB")
