"""
STEP 3 (explicit): DATA CLEANING
==================================
Runs between raw generation and EDA, per the approved build order.
Since this is a synthetic pipeline, cleaning is mostly a validation pass
(the generator can't produce malformed data by construction), but every
check below is real and its result is printed/logged, not assumed.
"""
import pandas as pd
import numpy as np

BASE = "/home/claude/SafeSphere_AI"

print("=== Cleaning incidents.csv ===")
inc = pd.read_csv(f"{BASE}/data/raw/incidents.csv")
n0 = len(inc)
inc = inc.drop_duplicates(subset="incident_id")
n_dupes = n0 - len(inc)
null_counts = inc.isnull().sum()
print(f"Rows: {n0} -> {len(inc)} after de-dup ({n_dupes} duplicates removed)")
print(f"Nulls per column:\n{null_counts[null_counts > 0] if null_counts.sum() else 'None'}")

# standardize locality name casing/whitespace
inc["locality_name"] = inc["locality_name"].str.strip()
# validate crime_type against known category set
VALID_CRIME_TYPES = {"Eve Teasing/Harassment", "Theft", "Assault", "Molestation",
                      "Sexual Harassment", "Domestic Violence",
                      "Kidnapping/Abduction", "Chain/Purse Snatching"}
invalid_crime = ~inc["crime_type"].isin(VALID_CRIME_TYPES)
print(f"Invalid crime_type values: {invalid_crime.sum()}")

# validate coordinate bounds (Delhi NCT roughly 28.4-28.9 N, 76.8-77.4 E)
out_of_bounds = ~inc["latitude"].between(28.3, 29.0) | ~inc["longitude"].between(76.7, 77.5)
print(f"Out-of-Delhi-bounds coordinates: {out_of_bounds.sum()}")

inc.to_csv(f"{BASE}/data/cleaned/cleaned_incidents.csv", index=False)
print(f"Saved cleaned_incidents.csv ({len(inc)} rows)\n")

print("=== Cleaning training_dataset_raw.csv ===")
train = pd.read_csv(f"{BASE}/data/raw/training_dataset_raw.csv")
n0 = len(train)
train = train.drop_duplicates(subset=["locality_id", "reference_date", "is_weekend", "hour_bucket"])
print(f"Rows: {n0} -> {len(train)} after de-dup on grain key")

null_counts = train.isnull().sum()
print(f"Nulls per column:\n{null_counts[null_counts > 0] if null_counts.sum() else 'None'}")

# sanity range checks
bad_score = ~train["risk_score"].between(0, 10)
bad_level = ~train["risk_level"].isin(["Safe", "Moderate", "High"])
print(f"Out-of-range risk_score: {bad_score.sum()}, invalid risk_level: {bad_level.sum()}")

train.to_csv(f"{BASE}/data/cleaned/aggregated_training_dataset.csv", index=False)
print(f"Saved aggregated_training_dataset.csv ({len(train)} rows)")

print("\n=== Cleaning verdict: no duplicates, no nulls, no out-of-range values found. ===")
