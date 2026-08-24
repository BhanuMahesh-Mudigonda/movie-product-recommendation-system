import nbformat

notebook_path = "/Users/apple/Desktop/Bhanu/CAPSTONE PROJECT/ml/notebooks/01_dataset_inspection.ipynb"
with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = nbformat.read(f, as_version=4)

# Section 23.25
md_23_25 = """### 23.25 — Item-Based Recommendation Scoring

**Concept Explanation**
To recommend items, we need a mathematical formula to predict how much a user will like a candidate movie based on their past ratings of similar movies.

**Why We Use It**
Not all similar movies are equal. If a user rated a similar movie 1 star, we shouldn't strongly recommend the candidate movie. We need a weighted approach.

**How It Works**
The scoring formula is mathematically defined as a Weighted Average of the user's past ratings, weighted by item similarity:

$$ \\text{Predicted Score} = \\frac{\\sum (\\text{Similarity} \\times \\text{User Rating})}{\\sum \\text{Similarity}} $$

For example, if Movie A is a candidate, and it is similar to Movie X (similarity 0.8, user rated 5) and Movie Y (similarity 0.4, user rated 2):
- Weighted Sum = (0.8 × 5) + (0.4 × 2) = 4.0 + 0.8 = 4.8
- Similarity Sum = 0.8 + 0.4 = 1.2
- Final Score = 4.8 / 1.2 = 4.0

#### Flowchart
```text
[ Rated Movie X (User Rating: 5) ] --- Similarity (0.8) --→ [ Candidate Movie A ]
[ Rated Movie Y (User Rating: 2) ] --- Similarity (0.4) --→ [ Candidate Movie A ]
                                                                     ↓
                                                         [ Final Score Calculation ]
```"""

code_23_25 = """import pandas as pd

def demonstrate_scoring_logic(user_id, candidate_movie_id, top_k_neighbors=5):
    # This function breaks down the calculation step-by-step for a single candidate movie.
    if user_id not in user_to_index or candidate_movie_id not in movie_to_index:
        return "Invalid User or Movie"
        
    user_ratings = cf_train[cf_train['userId'] == user_id]
    rated_movies = set(user_ratings['movieId'].values)
    
    # Get candidate movie vector
    cand_idx = movie_to_index[candidate_movie_id]
    cand_vector = movie_user_matrix[cand_idx]
    
    # Find similar movies to the candidate
    distances, indices = item_knn.kneighbors(cand_vector, n_neighbors=top_k_neighbors + 1)
    
    distances = distances.flatten()
    indices = indices.flatten()
    
    print(f"Scoring Breakdown for Candidate Movie ID: {candidate_movie_id}")
    print("-" * 50)
    
    weighted_sum = 0
    sim_sum = 0
    
    for dist, idx in zip(distances, indices):
        sim_movie_id = int(movie_ids[idx])
        if sim_movie_id == candidate_movie_id:
            continue
            
        similarity = 1 - dist
        if similarity <= 0:
            continue
            
        # Check if the user has rated this similar movie
        if sim_movie_id in rated_movies:
            user_rating = user_ratings[user_ratings['movieId'] == sim_movie_id]['rating'].iloc[0]
            contribution = similarity * user_rating
            
            weighted_sum += contribution
            sim_sum += similarity
            
            print(f"Similar Movie {sim_movie_id}:")
            print(f"  Similarity to Candidate: {similarity:.4f}")
            print(f"  User's Rating: {user_rating}")
            print(f"  Contribution: {similarity:.4f} * {user_rating} = {contribution:.4f}\\n")
            
    if sim_sum > 0:
        final_score = weighted_sum / sim_sum
        print("-" * 50)
        print(f"Total Weighted Sum: {weighted_sum:.4f}")
        print(f"Total Similarity Sum: {sim_sum:.4f}")
        print(f"Predicted Final Score: {weighted_sum:.4f} / {sim_sum:.4f} = {final_score:.4f}")
    else:
        print("No rated similar movies found to calculate a score.")

# Demonstrate with a user and a known movie ID
# Note: For demonstration, we pick a candidate movie the user hasn't rated, 
# but that is similar to ones they HAVE rated.
# We will use the top recommended movie from the previous cell's output.
test_recommendations = recommend_item_based(test_user_id, top_k=1)
if not test_recommendations.empty:
    top_candidate_id = test_recommendations.iloc[0]['movieId']
    demonstrate_scoring_logic(test_user_id, top_candidate_id, top_k_neighbors=200)
"""

obs_23_25 = """### Observation
The breakdown output shows exactly how the "black box" prediction works. The candidate movie receives a score exclusively based on the user's historical ratings of similar items. By dividing the total weighted sum by the total similarity, we normalize the score to stay within the 0.5 – 5.0 rating scale, making it mathematically stable and interpreitable.

### Viva Explanation
**"To calculate the recommendation score for a candidate movie, we use a weighted average. We sum the user's ratings for similar movies, heavily weighting the movies that share the highest cosine similarity with the candidate. We then divide by the total similarity to normalize the score. This explicit mathematical formulation is explainable, solving the 'black box' problem often found in Deep Learning models, and allows us to justify exactly why a movie was recommended."**"""

# Append cells
nb.cells.extend([
    nbformat.v4.new_markdown_cell(md_23_25),
    nbformat.v4.new_code_cell(code_23_25),
    nbformat.v4.new_markdown_cell(obs_23_25)
])

with open(notebook_path, 'w', encoding='utf-8') as f:
    nbformat.write(nb, f)

print("Section 23.25 appended successfully!")
