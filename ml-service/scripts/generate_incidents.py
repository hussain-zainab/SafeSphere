"""
STEP 2: SYNTHETIC INCIDENT GENERATION
======================================
Generates data/raw/incidents.csv -- the raw historical incident log.
This is DISPLAY-ONLY data (recent incidents, hotspots, history screen).
It is never fed directly into the model; build_training_dataset.py
aggregates it into locality-time statistics first.

Each incident's day, hour, and crime_type are drawn from the shared
world_model's non-linear, archetype x time x season x weather x
personality risk process -- so realistic hotspots and quiet localities
emerge from the simulation rather than being hand-assigned.
"""
import numpy as np
import pandas as pd
from datetime import date
import sys, os

sys.path.append(os.path.dirname(__file__))
from world_model import (ARCHETYPE_BASE_ANNUAL_RATE, CRIME_TYPES,
                          CRIME_TYPE_DIST, MONTH_TO_SEASON, true_risk, sample_weather,
                          is_night_hour)

RNG_SEED = 7
rng = np.random.default_rng(RNG_SEED)

START_DATE = date(2022, 1, 1)
END_DATE = date(2025, 12, 31)
all_days = pd.date_range(START_DATE, END_DATE, freq="D")
N_DAYS = len(all_days)
print(f"Simulating {N_DAYS} days from {START_DATE} to {END_DATE}")

day_seasons = [MONTH_TO_SEASON[d.month] for d in all_days]
day_is_weekend = [d.dayofweek >= 5 for d in all_days]
city_weather = [sample_weather(s, rng) for s in day_seasons]

locality_df = pd.read_csv("/home/claude/SafeSphere_AI/data/raw/locality_profiles.csv")
print(f"Loaded {len(locality_df)} localities")

NIGHT_SHIFT = np.array([0.05, -0.04, 0.05, 0.06, 0.05, 0.02, -0.02, -0.07])

def blended_crime_dist(archetype, is_night):
    base = np.array(CRIME_TYPE_DIST[archetype])
    if is_night:
        blended = base + NIGHT_SHIFT * 0.4
    else:
        blended = base - NIGHT_SHIFT * 0.25
    blended = np.clip(blended, 0.01, None)
    return blended / blended.sum()

incident_rows = []
incident_counter = 1
locality_summary = []

for _, loc in locality_df.iterrows():
    archetype = loc["area_type"]
    personality = dict(baseline_tendency=loc["baseline_tendency"],
                        volatility=loc["volatility"],
                        night_sensitivity=loc["night_sensitivity"],
                        weekend_sensitivity=loc["weekend_sensitivity"])
    loc_rng = np.random.default_rng(abs(hash(("incidents", loc["locality_id"]))) % (2**32))

    annual_base = ARCHETYPE_BASE_ANNUAL_RATE[archetype] * np.exp(0.28 * personality["baseline_tendency"])
    total_4yr = loc_rng.lognormal(mean=np.log(max(annual_base * 4, 1)), sigma=0.12 * personality["volatility"])
    total_4yr = int(max(round(total_4yr), 15))

    day_weights = np.empty(N_DAYS)
    for i in range(N_DAYS):
        season = day_seasons[i]
        weekend = day_is_weekend[i]
        weather = city_weather[i]
        hourly_vals = [true_risk(archetype, h, weekend, season, weather, personality) for h in range(24)]
        day_mean = np.mean(hourly_vals)
        day_noise = loc_rng.lognormal(mean=0, sigma=0.15 * personality["volatility"])
        day_weights[i] = day_mean * day_noise
    day_probs = day_weights / day_weights.sum()

    day_indices = loc_rng.choice(N_DAYS, size=total_4yr, p=day_probs)
    day_idx_counts = pd.Series(day_indices).value_counts()

    for day_idx, n_incidents in day_idx_counts.items():
        d = all_days[day_idx]
        season = day_seasons[day_idx]
        weekend = day_is_weekend[day_idx]
        weather = city_weather[day_idx]
        hourly_vals = np.array([true_risk(archetype, h, weekend, season, weather, personality) for h in range(24)])
        hour_probs = hourly_vals / hourly_vals.sum()
        hours = loc_rng.choice(24, size=n_incidents, p=hour_probs)

        for h in hours:
            night = is_night_hour(h)
            crime_probs = blended_crime_dist(archetype, night)
            crime_type = loc_rng.choice(CRIME_TYPES, p=crime_probs)
            minute = loc_rng.integers(0, 60)
            lat_jitter = loc_rng.normal(0, 0.008)
            lon_jitter = loc_rng.normal(0, 0.008)

            incident_rows.append((
                f"INC{incident_counter:07d}",
                round(loc["latitude"] + lat_jitter, 5),
                round(loc["longitude"] + lon_jitter, 5),
                loc["locality_id"],
                loc["locality_name"],
                crime_type,
                d.strftime("%Y-%m-%d"),
                f"{h:02d}:{minute:02d}",
            ))
            incident_counter += 1

    locality_summary.append((loc["locality_id"], loc["locality_name"], archetype, total_4yr))

incidents_df = pd.DataFrame(incident_rows, columns=[
    "incident_id", "latitude", "longitude", "locality_id", "locality_name",
    "crime_type", "date", "time"
])

print(f"\nTotal incidents generated: {len(incidents_df)}")
summary_df = pd.DataFrame(locality_summary, columns=["locality_id", "locality_name", "area_type", "total_4yr"])
print("\nIncidents per archetype (4yr totals):")
print(summary_df.groupby("area_type")["total_4yr"].agg(["mean", "min", "max", "sum"]))

out_path = "/home/claude/SafeSphere_AI/data/raw/incidents.csv"
incidents_df.to_csv(out_path, index=False)
print(f"\nSaved to {out_path}")

weather_df = pd.DataFrame({
    "date": [d.strftime("%Y-%m-%d") for d in all_days],
    "season": day_seasons,
    "is_weekend": day_is_weekend,
    "weather": city_weather,
})
weather_df.to_csv("/home/claude/SafeSphere_AI/data/raw/city_daily_weather.csv", index=False)
print("Saved city_daily_weather.csv")
