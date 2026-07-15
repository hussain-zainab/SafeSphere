# Data Dictionary -- SafeSphere AI

## Real-world grounding & disclosed limitations
- **Districts**: 15 real Delhi Police districts (Central, New Delhi, North,
  North East, North West, West, South West, South, South East, East,
  Shahdara, Dwarka, Outer, Outer North, Rohini) -- note these differ from
  Delhi's 13 *revenue* districts (reorganized Jan 2026); this project uses
  the Police districts since the app's core anchor is police-station
  distance.
- **Localities/police stations**: real station names sourced from Delhi
  Police public district pages (147 base names), expanded with genuinely
  Delhi-style ward-level sub-area suffixes (Phase 1/2, Extension, Block
  A/B/C, Colony) to reach 272 localities, as requested.
- **Metro stations, hospitals**: real, well-known Delhi Metro stations and
  major hospitals (AIIMS, Safdarjung, RML, LNJP, GTB, etc.) with their
  actual coordinates, used to compute genuine haversine distances.
- **Coordinates**: locality points are placed within each district's real
  geographic bounding box with reproducible per-name jitter. This gives
  district-level-accurate geography but is **not survey-grade per-address
  geocoding** -- disclosed here and in the model card.

## data/raw/locality_profiles.csv (272 rows) -- static, one row per locality
| Column | Description |
|---|---|
| locality_id | Unique ID (L0001...) |
| locality_name | Real or ward-extended locality name |
| district | Real Delhi Police district |
| latitude, longitude | District-bounded approximate coordinates |
| area_type | residential / mixed / market-zone / transit-hub / commercial |
| road_type | arterial / collector / local / highway-adjacent |
| police_station_dist_km, hospital_dist_km, metro_dist_km | Haversine distance to nearest real anchor |
| nearest_hospital, nearest_metro | Real anchor name |
| market_density, school_density | 0-10 proxy scale |
| population_density_proxy | Thousands per sq km, proxy |
| baseline_tendency, volatility, night_sensitivity, weekend_sensitivity | Persistent per-locality "personality" -- drawn once, drives non-deterministic behavior in the world model. NOT used directly as model features (they're generative-world parameters, not inference-time-derivable facts) |

## data/raw/incidents.csv (139,800 rows) -- DISPLAY ONLY, never used for training
| Column | Description |
|---|---|
| incident_id | Unique ID |
| latitude, longitude | Jittered point within ~1.2km of locality center |
| locality_id, locality_name | Locality reference |
| crime_type | One of 8 categories, archetype- and time-conditioned |
| date, time | 2022-01-01 to 2025-12-31 |

## data/raw/training_dataset_raw.csv / data/processed/training_dataset_engineered.csv / training_dataset_selected.csv
Grain: locality x quarterly-reference-date x weekend-flag x hour-bucket
(32,640 rows). See `docs/model_card.md` for the final 36 selected features
and `docs/leakage_audit.md` for the per-feature availability audit.

## artifacts/locality_lookup.json
Production snapshot used by the FastAPI service: for each locality, static
profile + rolling incident counts (30d/365d) as of the latest date in
incidents.csv, plus the precomputed hotspot percentile.
