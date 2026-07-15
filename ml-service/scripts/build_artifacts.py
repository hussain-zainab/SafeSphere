"""
Build artifacts/locality_lookup.json and artifacts/inference_metadata.json
-- everything the FastAPI service needs, derived once at build time, to go
from {latitude, longitude} to a full feature vector at request time.
"""
import pandas as pd, numpy as np, json

BASE = "/home/claude/SafeSphere_AI"
loc_df = pd.read_csv(f"{BASE}/data/raw/locality_profiles.csv")
incidents_df = pd.read_csv(f"{BASE}/data/raw/incidents.csv", parse_dates=["date"])

# historical_crime_baseline (incidents per 30d, long-run) + rolling counts
# as of "today" (most recent date in the incident log) -- same definition
# used in training, computed fresh here as the production snapshot.
full_history_days = (incidents_df["date"].max() - incidents_df["date"].min()).days + 1
today = incidents_df["date"].max()

lookup = {}
for _, loc in loc_df.iterrows():
    loc_id = loc["locality_id"]
    dates_arr = np.sort(incidents_df.loc[incidents_df["locality_id"] == loc_id, "date"].values)
    baseline = round(len(dates_arr) / full_history_days * 30, 3)
    n30 = int(np.searchsorted(dates_arr, today) - np.searchsorted(dates_arr, today - np.timedelta64(30, "D")))
    n365 = int(np.searchsorted(dates_arr, today) - np.searchsorted(dates_arr, today - np.timedelta64(365, "D")))

    lookup[loc_id] = dict(
        locality_name=loc["locality_name"], district=loc["district"],
        latitude=float(loc["latitude"]), longitude=float(loc["longitude"]),
        area_type=loc["area_type"], road_type=loc["road_type"],
        police_station_dist_km=float(loc["police_station_dist_km"]),
        hospital_dist_km=float(loc["hospital_dist_km"]), nearest_hospital=loc["nearest_hospital"],
        metro_dist_km=float(loc["metro_dist_km"]), nearest_metro=loc["nearest_metro"],
        market_density=int(loc["market_density"]), school_density=int(loc["school_density"]),
        population_density_proxy=float(loc["population_density_proxy"]),
        historical_crime_baseline=baseline, reports_last_30d=n30, reports_last_365d=n365,
    )

# locality_hotspot_percentile needs the full distribution -- compute once here
baselines = pd.Series({k: v["historical_crime_baseline"] for k, v in lookup.items()})
pct = baselines.rank(pct=True)
for loc_id in lookup:
    lookup[loc_id]["locality_hotspot_percentile"] = round(float(pct[loc_id]), 4)

with open(f"{BASE}/artifacts/locality_lookup.json", "w") as f:
    json.dump(lookup, f, indent=2)

metadata = dict(
    data_snapshot_date=today.strftime("%Y-%m-%d"),
    n_localities=len(lookup),
    n_incidents_total=len(incidents_df),
    model_version="1.0.0",
    feature_count=36,
)
with open(f"{BASE}/artifacts/inference_metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print(f"Saved locality_lookup.json with {len(lookup)} localities")
print(f"Saved inference_metadata.json: {metadata}")
