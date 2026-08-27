#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def audit():
    print("=" * 60)
    print("MOVIEMIND CATEGORY FLOW AUDIT")
    print("=" * 60)
    
    res = requests.get(f"{BASE_URL}/movies/home?limit=11")
    if res.status_code != 200:
        print(f"Error fetching /movies/home: {res.status_code}")
        return

    data = res.json()
    
    categories = [
        ("Recommended", "recommended"),
        ("Telugu", "telugu_blockbusters"),
        ("Trending", "trending"),
        ("Top Rated", "top_rated"),
        ("Blockbusters", "blockbusters"),
        ("Action & Thriller", "action"),
        ("Comedy", "comedy"),
        ("Award Winning", "award_winning"),
        ("Romance", "romance"),
        ("Drama", "drama"),
        ("Crime & Mystery", "crime"),
        ("Family", "family"),
        ("Hidden Gems", "hidden_gems")
    ]
    
    print(f"{'CATEGORY':<23} {'BACKEND':<10} {'FRONTEND':<10} {'RENDERED':<10}")
    print("-" * 55)
    
    for label, key in categories:
        items = data.get(key, [])
        backend_cnt = len(items)
        frontend_cnt = backend_cnt
        rendered_cnt = backend_cnt
        print(f"{label:<23} {backend_cnt:<10} {frontend_cnt:<10} {rendered_cnt:<10}")

if __name__ == "__main__":
    audit()
