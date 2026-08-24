import nbformat

notebook_path = "/Users/apple/Desktop/Bhanu/CAPSTONE PROJECT/ml/notebooks/01_dataset_inspection.ipynb"
with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = nbformat.read(f, as_version=4)

# Find the cell for 23.27 and fix the variable name from cf_test to test_ratings
for cell in nb.cells:
    if cell.cell_type == 'code' and "assert 'cf_test' in locals()" in cell.source:
        cell.source = cell.source.replace("'cf_test'", "'test_ratings'")
        cell.source = cell.source.replace("cf_test", "test_ratings")

with open(notebook_path, 'w', encoding='utf-8') as f:
    nbformat.write(nb, f)

print("Fixed test_ratings variable name in notebook.")
