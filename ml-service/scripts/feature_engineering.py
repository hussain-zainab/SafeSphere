"""
STEP 4-5: EDA + FEATURE ENGINEERING (quick diagnostic pass)
"""
import numpy as np, pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import mutual_info_classif
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv('/home/claude/SafeSphere_AI/data/raw/training_dataset_raw.csv')

HOUR_MAP = {"early_morning":7, "midday":12, "evening":18, "late_evening":22, "night":2}
df['rep_hour'] = df['hour_bucket'].map(HOUR_MAP)
df['hour_sin'] = np.sin(2*np.pi*df['rep_hour']/24)
df['hour_cos'] = np.cos(2*np.pi*df['rep_hour']/24)
df['is_night'] = df['hour_bucket'].isin(['late_evening','night']).astype(int)

df['safety_amenity_score'] = (df['market_density']*0.3 + df['school_density']*0.2
                               - df['police_station_dist_km']*1.5 - df['hospital_dist_km']*0.7
                               - df['metro_dist_km']*0.5)

# locality relative hotspot rank (percentile of historical_crime_baseline across localities)
loc_baseline = df.groupby('locality_id')['historical_crime_baseline'].first()
loc_pct = loc_baseline.rank(pct=True)
df['locality_hotspot_percentile'] = df['locality_id'].map(loc_pct)

df['report_trend_ratio'] = df['reports_last_30d'] / (df['reports_last_365d']/12 + 0.5)

# explicit interaction: archetype-night flag combos
df['archetype_night_interaction'] = df['area_type'] + "_" + df['is_night'].astype(str)
df['archetype_weekend_interaction'] = df['area_type'] + "_" + df['is_weekend'].astype(str)

df.to_csv('/home/claude/SafeSphere_AI/data/processed/training_dataset_engineered.csv', index=False)

num_cols = ['police_station_dist_km','hospital_dist_km','metro_dist_km','market_density',
            'school_density','population_density_proxy','month','reports_last_30d',
            'reports_last_365d','historical_crime_baseline','temperature_proxy',
            'hour_sin','hour_cos','is_night','safety_amenity_score',
            'locality_hotspot_percentile','report_trend_ratio']
cat_cols = ['road_type','area_type','day_of_week','is_weekend','season','weather_condition',
            'archetype_night_interaction','archetype_weekend_interaction']

X_num = df[num_cols]
X_cat = pd.get_dummies(df[cat_cols], drop_first=True)
X = pd.concat([X_num, X_cat], axis=1)
y = df['risk_level']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

clf = RandomForestClassifier(n_estimators=400, max_depth=18, min_samples_leaf=3, random_state=42, n_jobs=-1)
clf.fit(X_train, y_train)
pred = clf.predict(X_test)

print("=== ENGINEERED-FEATURE MODEL PERFORMANCE ===")
print('Accuracy:', accuracy_score(y_test, pred))
print('Macro F1:', f1_score(y_test, pred, average='macro'))
print(classification_report(y_test, pred))
print("Confusion matrix (rows=true, cols=pred), classes:", sorted(y.unique()))
print(confusion_matrix(y_test, pred, labels=sorted(y.unique())))

print("\n=== TOP 15 FEATURE IMPORTANCES (RandomForest) ===")
imp = pd.Series(clf.feature_importances_, index=X.columns).sort_values(ascending=False)
print(imp.head(15))

print("\n=== MUTUAL INFORMATION (top 10, numeric features only) ===")
le = LabelEncoder()
y_enc = le.fit_transform(y)
mi = mutual_info_classif(X_num.fillna(0), y_enc, random_state=42)
mi_series = pd.Series(mi, index=num_cols).sort_values(ascending=False)
print(mi_series.head(10))

imp.to_csv('/home/claude/SafeSphere_AI/reports/feature_importance.csv')
mi_series.to_csv('/home/claude/SafeSphere_AI/reports/mutual_information.csv')
