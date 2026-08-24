import sys, pandas as pd, pickle
with open('featured_movie_catalogue.pkl', 'rb') as f:
    fc = pickle.load(f)
for _, row in fc[fc['language_code']=='te'].head().iterrows():
    print(f"{row['title']} - poster_url: {row.get('poster_url')} - poster: {row.get('poster')}")
