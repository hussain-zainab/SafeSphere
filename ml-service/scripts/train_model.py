import pandas as pd, numpy as np, joblib
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, f1_score, classification_report, mean_absolute_error, r2_score

df = pd.read_csv('/home/claude/SafeSphere_AI/data/processed/training_dataset_selected.csv')

num_cols = ['police_station_dist_km','hospital_dist_km','metro_dist_km','population_density_proxy',
            'month','reports_last_30d','reports_last_365d','historical_crime_baseline',
            'temperature_proxy','hour_sin','hour_cos','is_night','safety_amenity_score',
            'locality_hotspot_percentile','report_trend_ratio']
cat_cols = ['road_type','area_type','day_of_week','is_weekend','season','weather_condition']

X_cat = pd.get_dummies(df[cat_cols], drop_first=True)
X = pd.concat([df[num_cols], X_cat], axis=1)
feature_columns = X.columns.tolist()
y_cls = df['risk_level']
y_reg = df['risk_score']

X_train, X_test, ycls_train, ycls_test, yreg_train, yreg_test = train_test_split(
    X, y_cls, y_reg, test_size=0.2, random_state=42, stratify=y_cls)
# further split train into fit/calibration so calibration doesn't require
# refitting (and storing) multiple copies of the base estimator
X_fit, X_calib, ycls_fit, ycls_calib = train_test_split(
    X_train, ycls_train, test_size=0.2, random_state=42, stratify=ycls_train)

print("=== HYPERPARAMETER TUNING: RandomForestClassifier ===")
param_dist = {
    'n_estimators': [200, 250],
    'max_depth': [16, 18, 20],
    'min_samples_leaf': [2, 3],
    'max_features': ['sqrt', 0.5],
}
base_rf = RandomForestClassifier(random_state=42, n_jobs=-1)
search = RandomizedSearchCV(base_rf, param_dist, n_iter=8, cv=2, scoring='f1_macro',
                             random_state=42, n_jobs=-1, verbose=1)
search.fit(X_fit, ycls_fit)
print("Best params:", search.best_params_)
print("Best CV macro-F1:", search.best_score_)
best_rf = search.best_estimator_
pred = best_rf.predict(X_test)
print("\nTest accuracy (uncalibrated, tuned model):", accuracy_score(ycls_test, pred))
print("Test macro F1:", f1_score(ycls_test, pred, average='macro'))
print(classification_report(ycls_test, pred))

# Calibrate on a HELD-OUT calibration split with cv='prefit' -- reuses the
# single already-tuned RF instance instead of refitting/storing 3 copies of
# it, which is both more correct (no data leakage between tuning and
# calibration) and keeps the artifact deployable (~100MB+ savings).
print("=== CALIBRATING CLASSIFIER (prefit, held-out calibration split) ===")
from sklearn.frozen import FrozenEstimator
calibrated = CalibratedClassifierCV(FrozenEstimator(best_rf), method='isotonic')
calibrated.fit(X_calib, ycls_calib)
pred_cal = calibrated.predict(X_test)
print("Calibrated test accuracy:", accuracy_score(ycls_test, pred_cal))
print("Calibrated test macro F1:", f1_score(ycls_test, pred_cal, average='macro'))

# Regressor for continuous risk_score
print("\n=== TRAINING REGRESSOR (risk_score) ===")
reg = RandomForestRegressor(n_estimators=150, max_depth=14, min_samples_leaf=3, random_state=42, n_jobs=-1)
reg.fit(X_train, yreg_train)
reg_pred = reg.predict(X_test)
print("Regressor MAE:", mean_absolute_error(yreg_test, reg_pred))
print("Regressor R2:", r2_score(yreg_test, reg_pred))

# Save everything
import os
os.makedirs('/home/claude/SafeSphere_AI/models', exist_ok=True)
joblib.dump(best_rf, '/home/claude/SafeSphere_AI/models/risk_classifier_raw.pkl')
joblib.dump(calibrated, '/home/claude/SafeSphere_AI/models/risk_classifier_calibrated.pkl')
joblib.dump(reg, '/home/claude/SafeSphere_AI/models/risk_regressor.pkl')
joblib.dump(feature_columns, '/home/claude/SafeSphere_AI/models/feature_columns.pkl')
joblib.dump(list(y_cls.unique()), '/home/claude/SafeSphere_AI/models/class_labels.pkl')

# Save train/test splits for downstream evaluation script
X_test.to_csv('/home/claude/SafeSphere_AI/data/processed/X_test.csv', index=False)
ycls_test.to_csv('/home/claude/SafeSphere_AI/data/processed/ycls_test.csv', index=False)
yreg_test.to_csv('/home/claude/SafeSphere_AI/data/processed/yreg_test.csv', index=False)
X_train.to_csv('/home/claude/SafeSphere_AI/data/processed/X_train.csv', index=False)

print("\nModels saved to /home/claude/SafeSphere_AI/models/")
