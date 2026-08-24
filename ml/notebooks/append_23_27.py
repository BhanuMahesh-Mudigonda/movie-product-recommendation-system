import nbformat

notebook_path = "/Users/apple/Desktop/Bhanu/CAPSTONE PROJECT/ml/notebooks/01_dataset_inspection.ipynb"
with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = nbformat.read(f, as_version=4)

# Section 23.27
md_23_27 = """### 23.27 — Item-Based CF Evaluation Setup

**Concept Explanation**
Before calculating precision and recall for our Item-Based model, we must prepare a controlled evaluation environment. We use the exact same test dataset that we held out during the User-Based CF evaluation.

**Why We Use It**
Evaluating recommendations against training data is a fatal methodological error. We must verify if the model can predict the *held-out* (future/unseen) movies that the user actually watched. Using a small sample initially prevents the notebook from crashing due to long execution times during pipeline validation.

**How It Works**
1. We load the `cf_test` dataset containing true future interactions.
2. We sample a small number of users (e.g., 10 users) who exist in both the training matrix and the test set.
3. We extract their `test_ground_truth` (the list of movies they actually liked in the test set).
4. We define `evaluation_users_sample` for the upcoming Precision/Recall/NDCG calculations.

#### Flowchart
```text
[ Full Test Set (cf_test) ]
       ↓
[ Select Small User Sample (10 Users) ]
       ↓
[ Extract Ground Truth Movies per User ]
       ↓
[ evaluation_users_sample prepared ]
```"""

code_23_27 = """# 1. Dependency Verification
assert 'cf_test' in locals(), "Dependency Error: 'cf_test' data is missing. Ensure the train-test split was executed."

# 2. Select a small controlled sample of 10 users who exist in both train and test
# This prevents the notebook from hanging during pipeline validation
test_user_pool = cf_test['userId'].unique()
valid_test_users = [u for u in test_user_pool if u in user_to_index][:10]

evaluation_users_sample = valid_test_users

# 3. Prepare Test Ground Truth dictionary
test_ground_truth = {}

for u_id in evaluation_users_sample:
    # Get the movies this user interacted with in the test set
    user_test_movies = cf_test[cf_test['userId'] == u_id]['movieId'].tolist()
    test_ground_truth[u_id] = set(user_test_movies)

print(f"✅ Prepared Evaluation Setup.")
print(f"Evaluation Sample Size: {len(evaluation_users_sample)} users.")
print(f"Sample Ground Truth mapping initialized successfully.")
"""

obs_23_27 = """### Observation
By extracting a controlled 10-user sample, we can quickly validate the evaluation pipeline (Precision/Recall/NDCG metrics) without running 200,000 expensive nearest-neighbor queries. The `test_ground_truth` maps each user to the actual movies they watched in the held-out test set, which serves as the gold standard for our metrics.

### Viva Explanation
**"To scientifically evaluate our Item-Based CF model, we strictly used the held-out test data (`cf_test`). We avoided evaluating against training data to prevent data leakage. We started with a controlled sample of 10 users to build and validate the evaluation pipeline quickly, ensuring that our infrastructure works before committing to a massively computationally expensive full-scale run."**"""

# Append cells
nb.cells.extend([
    nbformat.v4.new_markdown_cell(md_23_27),
    nbformat.v4.new_code_cell(code_23_27),
    nbformat.v4.new_markdown_cell(obs_23_27)
])

with open(notebook_path, 'w', encoding='utf-8') as f:
    nbformat.write(nb, f)

print("Section 23.27 appended successfully!")
