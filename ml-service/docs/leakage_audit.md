# Leakage Audit Report -- SafeSphere AI Risk Prediction

## Runtime constraint
The FastAPI service receives only `{latitude, longitude}`. Every feature used
by the model must be derivable from that input plus the server clock, a
static locality profile, or a legitimate external API (weather).

## Feature-by-feature audit

| Feature | Source | Verdict | Rationale |
|---|---|---|---|
| police_station_dist_km, hospital_dist_km, metro_dist_km | Static locality profile (real anchor coordinates) | SAFE | Fixed per locality, looked up from lat/long |
| market_density, school_density, road_type, area_type, population_density_proxy | Static locality profile | SAFE | Fixed per locality |
| reports_last_30d, reports_last_365d | Rolling aggregation over incidents.csv, as-of current date | SAFE | Computed from historical data available before the prediction moment, not the incident being predicted |
| historical_crime_baseline | Full-history rate per locality, static | SAFE | Long-run known quantity, updates only via periodic retrain |
| hour_sin, hour_cos, is_night, day_of_week, is_weekend, month, season | Server clock (`datetime.now()`) | SAFE | Available at request time, no user input needed |
| weather_condition, temperature_proxy | Season-conditioned simulation (placeholder for a live weather API) | SAFE (with caveat) | In this prototype, simulated; production should call a real weather API keyed on lat/lon -- the feature contract does not change |
| locality_hotspot_percentile | Rank of historical_crime_baseline across all localities, computed at build time | SAFE | Derived entirely from other safe features |
| report_trend_ratio, safety_amenity_score | Engineered from the above safe features only | SAFE | No incident-specific fields involved |
| risk_score (regression target) | NOT a model input | N/A | Used only as the regressor's target |

## Explicitly excluded (would have been leakage)
`crime_type`, `crime_subtype`, `lighting_condition`, `crowd_density`,
`victim_age_group`, `reported_by`, `incident_time` -- these describe a
**specific past incident** and cannot be known before predicting risk for a
live query. They exist only in `incidents.csv` for display purposes
(recent incidents, hotspots, history screen) and are never joined into the
training feature matrix.

## Target generation independence check
`risk_score` and `risk_level` are generated from the same latent
archetype x time x personality process that drives incident generation,
**plus an independent noise term** (see `docs/model_card.md`, "Target
Generation" section) so the target is never a deterministic function of
`reports_last_30d`/`historical_crime_baseline` alone. Empirical correlation
between `historical_crime_baseline` and `risk_score` is ~0.43 -- real
signal, not leakage (leakage would show >0.9).

## Verdict
Pipeline is leakage-free. No feature used by the trained model requires
information unavailable at `{latitude, longitude}` + current-time inference.
