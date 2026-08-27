#!/usr/bin/env python3
"""
Automated Production Readiness & End-to-End Validation Script for MovieMind
"""

import sys
import urllib.request
import json
import subprocess
from pathlib import Path

# Add project root to sys.path for absolute module imports
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

def print_step(title):
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def test_python_imports():
    print_step("1. VALIDATING PYTHON DEPLOYMENT IMPORTS")
    modules = [
        ("PyJWT", "import jwt"),
        ("Passlib CryptContext", "from passlib.context import CryptContext"),
        ("Email Validator", "import email_validator"),
        ("PyArrow", "import pyarrow"),
        ("Auth Router", "from ml.backend.auth.router import router"),
        ("Catalogue Engine", "from ml.backend.catalogue_engine import catalogue_engine"),
        ("Discovery Engine", "from ml.backend.discovery_engine import search_discovery_movies"),
    ]
    all_passed = True
    for name, code in modules:
        try:
            exec(code)
            print(f"  ✅ {name}: SUCCESS")
        except Exception as e:
            print(f"  ❌ {name}: FAILED -> {e}")
            all_passed = False
    return all_passed

def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "MovieMind-Validator/1.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def test_movie_api():
    print_step("2. VALIDATING MOVIE API (PORT 8000)")
    baseUrl = "http://127.0.0.1:8000"
    endpoints = [
        ("/health", "Health Endpoint"),
        ("/movies/home?limit=5", "Home Recommendations"),
        ("/movies/search?q=Inception&limit=5", "Movie Search"),
        ("/recommend/1?top_k=5", "Personalized Recommendations"),
    ]
    all_passed = True
    for path, desc in endpoints:
        try:
            status, data = fetch_json(f"{baseUrl}{path}")
            if status == 200:
                print(f"  ✅ {desc} ({path}): HTTP 200 OK")
            else:
                print(f"  ❌ {desc} ({path}): HTTP {status}")
                all_passed = False
        except Exception as e:
            print(f"  ❌ {desc} ({path}): FAILED -> {e}")
            all_passed = False
    return all_passed

def test_product_api():
    print_step("3. VALIDATING PRODUCT API (PORT 8001)")
    baseUrl = "http://127.0.0.1:8001"
    endpoints = [
        ("/health", "Health Endpoint"),
        ("/api/products?limit=5", "Product Catalog"),
        ("/api/products?department=Electronics&limit=5", "Electronics Category"),
        ("/api/products?department=Apparel&limit=5", "Fashion Category"),
    ]
    all_passed = True
    for path, desc in endpoints:
        try:
            status, data = fetch_json(f"{baseUrl}{path}")
            if status == 200:
                print(f"  ✅ {desc} ({path}): HTTP 200 OK")
            else:
                print(f"  ❌ {desc} ({path}): HTTP {status}")
                all_passed = False
        except Exception as e:
            print(f"  ❌ {desc} ({path}): FAILED -> {e}")
            all_passed = False
    return all_passed

def test_frontend_build():
    print_step("4. VALIDATING FRONTEND BUILD INTEGRITY")
    frontend_dir = Path(__file__).resolve().parents[1] / "frontend"
    try:
        res = subprocess.run(["npm", "run", "build"], cwd=frontend_dir, capture_output=True, text=True, check=True)
        print("  ✅ Frontend production build succeeded in dist/")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Frontend build failed:\n{e.stderr}")
        return False

def main():
    print("\n🚀 MOVIEMIND SYSTEM-WIDE PRODUCTION READINESS AUDIT 🚀")
    step1 = test_python_imports()
    step2 = test_movie_api()
    step3 = test_product_api()
    step4 = test_frontend_build()

    print_step("FINAL VALIDATION SUMMARY")
    print(f"  1. Python Imports: {'PASSED ✅' if step1 else 'FAILED ❌'}")
    print(f"  2. Movie API:      {'PASSED ✅' if step2 else 'FAILED ❌'}")
    print(f"  3. Product API:    {'PASSED ✅' if step3 else 'FAILED ❌'}")
    print(f"  4. Frontend Build: {'PASSED ✅' if step4 else 'FAILED ❌'}")

    if step1 and step2 and step3 and step4:
        print("\n🎉 ALL PRODUCTION CHECKS PASSED SUCCESSFULLY! 🎉\n")
        sys.exit(0)
    else:
        print("\n❌ SOME CHECKS FAILED. SEE DETAILS ABOVE. ❌\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
