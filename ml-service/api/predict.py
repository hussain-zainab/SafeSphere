"""
predict.py -- core inference logic for POST /predict-risk

Pipeline (matches the approved design end-to-end):
  {latitude, longitude}
    -> nearest-locality lookup (haversine against artifacts/locality_lookup.json)
    -> current server time -> temporal features (hour_bucket, day_of_week, season, is_weekend)
    -> weather (season-conditioned simulation; swap in a real weather API call here in production)
    -> full 36-feature vector, in the exact column order the model was trained on
    -> regressor -> risk_score ; calibrated classifier -> risk_level + confidence
    -> top_factors from global permutation importance, filtered to this locality's notable values
    -> nearby_hotspots from the 3 closest localities with High/Moderate risk history
"""
import json
import math
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

ARTIFACT_DIR = Path(__file__).parent.parent / "artifacts"
MODEL_DIR = Path(__file__).parent.parent / "models"

with open(ARTIFACT_DIR / "locality_lookup.json") as f:
    LOCALITY_LOOKUP = json.load(f)

FEATURE_COLUMNS = joblib.load(MODEL_DIR / "feature_columns.pkl")
CLASS_LABELS = joblib.load(MODEL_DIR / "class_labels.pkl")
REGRESSOR = joblib.load(MODEL_DIR / "risk_regressor.pkl")
CLASSIFIER = joblib.load(MODEL_DIR / "risk_classifier_calibrated.pkl")

# Coarse global feature-importance ranking (from permutation_importance.csv)
# used to build human-readable top_factors text. Order matters -- most
# important first.
IMPORTANCE_RANK = [
    "hour_sin", "hour_cos", "area_type", "historical_crime_baseline",
    "locality_hotspot_percentile", "is_night", "reports_last_365d",
    "police_station_dist_km", "metro_dist_km", "safety_amenity_score",
    "hospital_dist_km", "temperature_proxy",
]

FACTOR_LABELS = {
    "hour_sin": "time of day", "hour_cos": "time of day",
    "area_type": "area type ({area_type})",
    "historical_crime_baseline": "long-run locality report history",
    "locality_hotspot_percentile": "relative hotspot ranking vs other localities",
    "is_night": "night-time elevated risk",
    "reports_last_365d": "recent 12-month report volume",
    "police_station_dist_km": "distance to nearest police station",
    "metro_dist_km": "distance to nearest metro station",
    "safety_amenity_score": "nearby safety amenity coverage",
    "hospital_dist_km": "distance to nearest hospital",
    "temperature_proxy": "seasonal conditions",
}

SEASON_MAP = {12: "winter", 1: "winter", 2: "winter", 3: "spring", 4: "spring",
              5: "summer", 6: "summer", 7: "monsoon", 8: "monsoon", 9: "monsoon",
              10: "autumn", 11: "autumn"}
SEASON_TEMP_BASE = {"winter": 12, "spring": 24, "summer": 36, "monsoon": 29, "autumn": 26}
SEASON_WEATHER = {
    "winter": ["Foggy", "Cold-Clear", "Cloudy", "Clear"],
    "spring": ["Clear", "Cloudy"],
    "summer": ["Clear", "Cloudy"],
    "monsoon": ["Rainy", "Cloudy", "Clear"],
    "autumn": ["Clear", "Cloudy"],
}

MAX_COVERAGE_KM = 6.0  # beyond this, we still predict but flag low coverage confidence


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def find_nearest_locality(lat, lon):
    best_id, best_dist = None, float("inf")
    for loc_id, loc in LOCALITY_LOOKUP.items():
        d = haversine_km(lat, lon, loc["latitude"], loc["longitude"])
        if d < best_dist:
            best_dist, best_id = d, loc_id
    return best_id, best_dist


def build_feature_row(loc, now: datetime):
    hour = now.hour
    month = now.month
    season = SEASON_MAP[month]
    is_weekend = now.weekday() >= 5
    day_of_week = now.strftime("%A")

    if 5 <= hour < 9:
        bucket = "early_morning"
    elif 9 <= hour < 16:
        bucket = "midday"
    elif 16 <= hour < 20:
        bucket = "evening"
    elif 20 <= hour < 24:
        bucket = "late_evening"
    else:
        bucket = "night"
    is_night = 1 if (hour >= 21 or hour < 5) else 0

    hour_sin = math.sin(2 * math.pi * hour / 24)
    hour_cos = math.cos(2 * math.pi * hour / 24)

    # Weather: season-conditioned simulation. In production, replace this
    # block with a real weather API call keyed on lat/lon -- the feature
    # name and downstream pipeline do not need to change.
    weather = np.random.choice(SEASON_WEATHER[season])
    temperature_proxy = SEASON_TEMP_BASE[season] + np.random.normal(0, 2.0)

    safety_amenity_score = (loc["market_density"] * 0.3 + loc["school_density"] * 0.2
                             - loc["police_station_dist_km"] * 1.5
                             - loc["hospital_dist_km"] * 0.7
                             - loc["metro_dist_km"] * 0.5)
    report_trend_ratio = loc["reports_last_30d"] / (loc["reports_last_365d"] / 12 + 0.5)

    row = {c: 0 for c in FEATURE_COLUMNS}
    row["police_station_dist_km"] = loc["police_station_dist_km"]
    row["hospital_dist_km"] = loc["hospital_dist_km"]
    row["metro_dist_km"] = loc["metro_dist_km"]
    row["population_density_proxy"] = loc["population_density_proxy"]
    row["month"] = month
    row["reports_last_30d"] = loc["reports_last_30d"]
    row["reports_last_365d"] = loc["reports_last_365d"]
    row["historical_crime_baseline"] = loc["historical_crime_baseline"]
    row["temperature_proxy"] = temperature_proxy
    row["hour_sin"] = hour_sin
    row["hour_cos"] = hour_cos
    row["is_night"] = is_night
    row["safety_amenity_score"] = safety_amenity_score
    row["locality_hotspot_percentile"] = loc["locality_hotspot_percentile"]
    row["report_trend_ratio"] = report_trend_ratio
    row["is_weekend"] = int(is_weekend)

    for col in FEATURE_COLUMNS:
        if col == f"road_type_{loc['road_type']}":
            row[col] = 1
        if col == f"area_type_{loc['area_type']}":
            row[col] = 1
        if col == f"day_of_week_{day_of_week}":
            row[col] = 1
        if col == f"season_{season}":
            row[col] = 1
        if col == f"weather_condition_{weather}":
            row[col] = 1

    return pd.DataFrame([row])[FEATURE_COLUMNS], dict(bucket=bucket, season=season,
                                                        weather=weather, is_night=is_night)


def build_top_factors(loc, context):
    factors = []
    for feat in IMPORTANCE_RANK:
        if feat in ("hour_sin", "hour_cos"):
            if context["bucket"] in ("late_evening", "night") and "time of day" not in factors:
                factors.append(f"low-light hours ({context['bucket'].replace('_', ' ')})")
        elif feat == "area_type":
            factors.append(FACTOR_LABELS[feat].format(area_type=loc["area_type"]))
        elif feat == "is_night":
            if context["is_night"]:
                factors.append("night-time elevated risk")
        elif feat == "locality_hotspot_percentile":
            if loc["locality_hotspot_percentile"] > 0.6:
                factors.append("elevated relative hotspot ranking vs other localities")
        elif feat in FACTOR_LABELS:
            factors.append(FACTOR_LABELS[feat])
        if len(factors) >= 3:
            break
    return factors[:3] if factors else ["locality baseline risk profile"]


def find_nearby_hotspots(lat, lon, exclude_id, radius_km=3.0, top_n=3):
    candidates = []
    for loc_id, loc in LOCALITY_LOOKUP.items():
        if loc_id == exclude_id:
            continue
        d = haversine_km(lat, lon, loc["latitude"], loc["longitude"])
        if d <= radius_km:
            candidates.append((loc["locality_hotspot_percentile"], loc["locality_name"], d))
    candidates.sort(key=lambda x: -x[0])
    out = []
    for pct, name, d in candidates[:top_n]:
        level = "High" if pct > 0.7 else "Moderate" if pct > 0.4 else "Safe"
        out.append(f"{name} ({level})")
    return out


def predict_risk(latitude: float, longitude: float) -> dict:
    loc_id, dist_km = find_nearest_locality(latitude, longitude)
    loc = LOCALITY_LOOKUP[loc_id]
    now = datetime.now()

    X_row, context = build_feature_row(loc, now)

    risk_score = float(np.clip(REGRESSOR.predict(X_row)[0], 0, 10))
    proba = CLASSIFIER.predict_proba(X_row)[0]
    classes = list(CLASSIFIER.classes_)
    risk_level = classes[int(np.argmax(proba))]
    confidence = float(np.max(proba))

    coverage = "in_dataset" if dist_km <= MAX_COVERAGE_KM else "nearest_match_low_coverage"
    if coverage == "nearest_match_low_coverage":
        confidence = round(confidence * 0.85, 3)  # honest confidence discount for out-of-coverage areas

    top_factors = build_top_factors(loc, context)
    nearby_hotspots = find_nearby_hotspots(latitude, longitude, loc_id)

    explanation = (
        f"Risk driven primarily by {top_factors[0] if top_factors else 'locality baseline'} "
        f"in {loc['locality_name']} ({loc['area_type']} area). "
        f"{'Nearest police station is over 2km away.' if loc['police_station_dist_km'] > 2 else 'Police station coverage nearby is favorable.'}"
    )

    return dict(
        locality=loc["locality_name"],
        district=loc["district"],
        risk_score=round(risk_score, 2),
        risk_level=risk_level,
        confidence=round(confidence, 3),
        top_factors=top_factors,
        recent_incidents=loc["reports_last_30d"],
        nearby_hotspots=nearby_hotspots,
        coverage=coverage,
        explanation=explanation,
    )
