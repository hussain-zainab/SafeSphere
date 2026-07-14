import pandas as pd, numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, f1_score
import time

df = pd.read_csv('/home/claude/SafeSphere_AI/data/processed/training_dataset_selected.csv')

num_cols = ['police_station_dist_km','hospital_dist_km','metro_dist_km','population_density_proxy',
            'month','reports_last_30d','reports_last_365d','historical_crime_baseline',
            'temperature_proxy','hour_sin','hour_cos','is_night','safety_amenity_score',
            'locality_hotspot_percentile','report_trend_ratio']
cat_cols = ['road_type','area_type','day_of_week','is_weekend','season','weather_condition']

X_cat = pd.get_dummies(df[cat_cols], drop_first=True)
X = pd.concat([df[num_cols], X_cat], axis=1)
y = df['risk_level']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

models = {
    "LogisticRegression": (LogisticRegression(max_iter=1000), True),
    "RandomForest": (RandomForestClassifier(n_estimators=400, max_depth=18, min_samples_leaf=3, random_state=42, n_jobs=-1), False),
    "ExtraTrees": (ExtraTreesClassifier(n_estimators=400, max_depth=18, min_samples_leaf=3, random_state=42, n_jobs=-1), False),
    "GradientBoosting": (GradientBoostingClassifier(n_estimators=200, max_depth=4, learning_rate=0.1, random_state=42), False),
    "HistGradientBoosting": (HistGradientBoostingClassifier(max_iter=300, max_depth=8, random_state=42), False),
}

results = []
for name, (model, needs_scaling) in models.items():
    t0 = time.time()
    Xtr = X_train_scaled if needs_scaling else X_train
    Xte = X_test_scaled if needs_scaling else X_test
    model.fit(Xtr, y_train)
    pred = model.predict(Xte)
    acc = accuracy_score(y_test, pred)
    f1 = f1_score(y_test, pred, average='macro')
    elapsed = time.time() - t0
    results.append((name, acc, f1, elapsed))
    print(f"{name}: acc={acc:.4f}  macroF1={f1:.4f}  time={elapsed:.1f}s")

res_df = pd.DataFrame(results, columns=['model','accuracy','macro_f1','train_time_s']).sort_values('macro_f1', ascending=False)
res_df.to_csv('/home/claude/SafeSphere_AI/reports/model_comparison.csv', index=False)
print("\n=== RANKED ===")
print(res_df)
