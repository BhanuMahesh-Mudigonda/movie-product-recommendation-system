import sys, pandas as pd, pickle
with open('featured_movie_catalogue.pkl', 'rb') as f:
    fc = pickle.load(f)
print("Featured 'te' movies:")
print(fc[fc['language_code']=='te'][['title', 'category']])
