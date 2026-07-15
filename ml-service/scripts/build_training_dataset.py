"""
STEP 3: BUILD TRAINING DATASET (aggregation from incident history)
=====================================================================
Produces data/raw/training_dataset_raw.csv.

Grain: one row per (locality x quarterly reference-date x weekend-flag x
hour-bucket). This mirrors the real production design: a nightly/periodic
job aggregates incidents.csv into locality-time statistics, and the model
is trained on those aggregates -- never on raw incident rows.

reports_last_30d / reports_last_365d are computed via genuine rolling
windows over incidents.csv as-of each reference date (searchsorted on
sorted per-locality incident date arrays) -- never independently
generated, per requirement #3.

TARGET GENERATION: risk_score is computed from the SAME latent world_model
process that generated the incidents (so real, learnable signal exists),
but with an INDEPENDENT noise term added on top (target_noise, drawn
fresh here, unrelated to the day_noise used in generate_incidents.py).
This is what prevents risk_score from being a deterministic function of
reports_last_30d/365d or any other single aggregated feature.
"""
import numpy as np
import pandas as pd
from datetime import date, timedelta
import sys, os

sys.path.append(os.path.dirname(__file__))
from world_model import true_risk, MONTH_TO_SEASON

RNG_SEED = 99
rng = np.random.default_rng(RNG_SEED)

BASE = "/home/claude/SafeSphere_AI/data/raw"
locality_df = pd.read_csv(f"{BASE}/locality_profiles.csv")
incidents_df = pd.read_csv(f"{BASE}/incidents.csv", parse_dates=["date"])
weather_df = pd.read_csv(f"{BASE}/city_daily_weather.csv", parse_dates=["date"])
weather_lookup = weather_df.set_index("date")["weather"].to_dict()

HOUR_BUCKETS = {
    "early_morning": 7, "midday": 12, "evening": 18,
    "late_evening": 22, "night": 2,
}

WEEKDAY_NAMES_WEEKDAY = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
WEEKDAY_NAMES_WEEKEND = ["Saturday", "Sunday"]

# quarterly reference dates -- start 2023-01-01 so a full 365d rolling
# window always exists (incidents start 2022-01-01)
ref_dates = pd.date_range("2023-01-01", "2025-10-01", freq="QS")
print(f"Reference dates ({len(ref_dates)}): {[d.strftime('%Y-%m') for d in ref_dates]}")

# Pre-sort incident dates per locality for fast rolling-window counts
incidents_by_locality = {
    loc_id: np.sort(grp["date"].values)
    for loc_id, grp in incidents_df.groupby("locality_id")
}
# Full-history daily rate (static "historical_crime_baseline" per locality,
# computed once over the whole 4yr window -- legitimate, not leakage, since
# it represents the locality's known long-run baseline as of "today" in the
# app's production use)
full_history_days = (incidents_df["date"].max() - incidents_df["date"].min()).days + 1

def rolling_counts(loc_id, ref_date):
    dates = incidents_by_locality.get(loc_id, np.array([], dtype="datetime64[ns]"))
    ref = np.datetime64(ref_date)
    lo30 = ref - np.timedelta64(30, "D")
    lo365 = ref - np.timedelta64(365, "D")
    n30 = np.searchsorted(dates, ref) - np.searchsorted(dates, lo30)
    n365 = np.searchsorted(dates, ref) - np.searchsorted(dates, lo365)
    return int(n30), int(n365)

def temperature_proxy(season, weather, rng_local):
    base_temp = {"winter": 12, "spring": 24, "summer": 36, "monsoon": 29, "autumn": 26}[season]
    adj = {"Foggy": -2, "Cold-Clear": -3, "Rainy": -3, "Hot-Hazy": +3}.get(weather, 0)
    return round(base_temp + adj + rng_local.normal(0, 2.0), 1)

rows = []
for _, loc in locality_df.iterrows():
    loc_id = loc["locality_id"]
    archetype = loc["area_type"]
    personality = dict(baseline_tendency=loc["baseline_tendency"],
                        volatility=loc["volatility"],
                        night_sensitivity=loc["night_sensitivity"],
                        weekend_sensitivity=loc["weekend_sensitivity"])
    loc_rng = np.random.default_rng(abs(hash(("training", loc_id))) % (2**32))

    dates_arr = incidents_by_locality.get(loc_id, np.array([], dtype="datetime64[ns]"))
    historical_crime_baseline = round(len(dates_arr) / full_history_days * 30, 3)  # incidents per 30d, long-run

    for ref_date in ref_dates:
        n30, n365 = rolling_counts(loc_id, ref_date)
        month = ref_date.month
        season = MONTH_TO_SEASON[month]
        weather = weather_lookup.get(pd.Timestamp(ref_date), "Clear")

        for is_weekend in [False, True]:
            day_of_week = loc_rng.choice(WEEKDAY_NAMES_WEEKEND if is_weekend else WEEKDAY_NAMES_WEEKDAY)
            for bucket, rep_hour in HOUR_BUCKETS.items():
                # ground-truth latent risk (shared process with incident generation)
                latent = true_risk(archetype, rep_hour, is_weekend, season, weather, personality)

                # INDEPENDENT target noise -- fresh draw, not reused from incident
                # generation. Reduced from 0.22 -> 0.13 coefficient: the original
                # value, stacked with threshold jitter below, was compounding into
                # more irreducible randomness than intended (empirically capped
                # accuracy ~70% with well-distributed, non-leaky feature importances).
                # Still nonzero -- classes must stay realistically non-separable.
                target_noise = loc_rng.lognormal(mean=0, sigma=0.13 * personality["volatility"])
                latent_noisy = latent * target_noise

                rows.append(dict(
                    locality_id=loc_id, locality_name=loc["locality_name"], district=loc["district"],
                    latitude=loc["latitude"], longitude=loc["longitude"],
                    police_station_dist_km=loc["police_station_dist_km"],
                    hospital_dist_km=loc["hospital_dist_km"], metro_dist_km=loc["metro_dist_km"],
                    market_density=loc["market_density"], school_density=loc["school_density"],
                    road_type=loc["road_type"], area_type=archetype,
                    population_density_proxy=loc["population_density_proxy"],
                    reference_date=ref_date.strftime("%Y-%m-%d"),
                    day_of_week=day_of_week, is_weekend=is_weekend, hour_bucket=bucket,
                    month=month, season=season,
                    weather_condition=weather,
                    temperature_proxy=temperature_proxy(season, weather, loc_rng),
                    reports_last_30d=n30, reports_last_365d=n365,
                    historical_crime_baseline=historical_crime_baseline,
                    _latent_risk=latent_noisy,  # kept temporarily to compute global scaling below
                ))

raw_train_df = pd.DataFrame(rows)
print(f"\nTotal training rows generated: {len(raw_train_df)}")

# Rescale latent risk to 0-10 using robust percentile scaling (avoids single
# outlier locality compressing everyone else into a tiny range)
lo, hi = raw_train_df["_latent_risk"].quantile([0.01, 0.99])
scaled = (raw_train_df["_latent_risk"] - lo) / (hi - lo) * 10
raw_train_df["risk_score"] = scaled.clip(0, 10).round(2)

# risk_level with JITTERED, DATA-DRIVEN (quantile) thresholds.
# Jitter magnitude reduced (0.35/0.45 -> 0.18/0.22) to stop compounding with
# the reduced target_noise above -- still nonzero so boundaries overlap
# realistically rather than being perfectly separable.
q_low = raw_train_df["risk_score"].quantile(0.37)
q_high = raw_train_df["risk_score"].quantile(0.70)
jitter_low = rng.normal(0, 0.18, size=len(raw_train_df))
jitter_high = rng.normal(0, 0.22, size=len(raw_train_df))
boundary_low = q_low + jitter_low
boundary_high = q_high + jitter_high
risk_level = np.where(raw_train_df["risk_score"] < boundary_low, "Safe",
              np.where(raw_train_df["risk_score"] < boundary_high, "Moderate", "High"))
raw_train_df["risk_level"] = risk_level

raw_train_df = raw_train_df.drop(columns=["_latent_risk"])

print("\nClass balance:")
print(raw_train_df["risk_level"].value_counts(normalize=True).round(3))
print("\nRisk score distribution:")
print(raw_train_df["risk_score"].describe())

out_path = f"{BASE}/training_dataset_raw.csv"
raw_train_df.to_csv(out_path, index=False)
print(f"\nSaved to {out_path}")
