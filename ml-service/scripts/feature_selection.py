import pandas as pd, numpy as np

df = pd.read_csv('/home/claude/SafeSphere_AI/data/processed/training_dataset_engineered.csv')

# Drop features with low importance/MI from the diagnostic pass, and drop
# raw identifiers / anything not available at inference time from lat/long alone
DROP_COLS = ['locality_id','locality_name','reference_date','rep_hour',
             'school_density','market_density']  # weak importance (<0.03) per prior run
# NOTE: school_density/market_density kept in artifacts for the API's
# "top_factors" explanation text, just excluded from the trained feature set
# since they contributed <2% importance each and add noise/variance to the
# encoder without meaningfully helping the model.

KEEP_NUM = ['police_station_dist_km','hospital_dist_km','metro_dist_km',
            'population_density_proxy','month','reports_last_30d','reports_last_365d',
            'historical_crime_baseline','temperature_proxy','hour_sin','hour_cos',
            'is_night','safety_amenity_score','locality_hotspot_percentile','report_trend_ratio']
KEEP_CAT = ['road_type','area_type','day_of_week','is_weekend','season','weather_condition']
TARGETS = ['risk_score','risk_level']
ID_COLS = ['locality_id','locality_name','district','latitude','longitude']

final_cols = ID_COLS + KEEP_NUM + KEEP_CAT + TARGETS
final_df = df[final_cols].copy()
final_df.to_csv('/home/claude/SafeSphere_AI/data/processed/training_dataset_selected.csv', index=False)
print("Selected feature set shape:", final_df.shape)
print("Numeric features kept:", len(KEEP_NUM))
print("Categorical features kept:", len(KEEP_CAT))
print(final_df.columns.tolist())
