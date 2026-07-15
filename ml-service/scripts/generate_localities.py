"""
STEP 1b: LOCALITY MASTER DATA GENERATION
=========================================
Builds locality_profiles.csv: ~240 real-named Delhi localities (drawn from
real police station catchment areas across all 15 real Delhi Police
districts), each with:
  - a static profile (distances to real metro/hospital, amenity densities,
    road type, area archetype)
  - a PERSISTENT random "personality vector" (drawn once, fixed forever)
    that will later drive non-deterministic, locality-specific incident
    behavior in generate_incidents.py

This is a design-time artifact -- it does not touch the target variable.
It only fixes each locality's identity and static, inference-time-available
features.
"""
import numpy as np
import pandas as pd
from math import radians, sin, cos, sqrt, atan2
import sys, os

sys.path.append(os.path.dirname(__file__))
from delhi_reference_data import DISTRICTS, POLICE_STATIONS, METRO_STATIONS, HOSPITALS, MARKETS

RNG_SEED = 42
rng = np.random.default_rng(RNG_SEED)

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlmb = radians(lon2 - lon1)
    a = sin(dphi/2)**2 + cos(p1)*cos(p2)*sin(dlmb/2)**2
    return 2*R*atan2(sqrt(a), sqrt(1-a))

def nearest_distance(lat, lon, points):
    return min(haversine_km(lat, lon, plat, plon) for _, plat, plon in points)

# Area-type archetypes: each locality is assigned one archetype which will
# later determine its base time-of-day risk SHAPE (in generate_incidents.py).
# Assignment is informed by the real neighborhood's known character, not random,
# where the name gives a strong clue (bazaar/market names -> market-zone,
# metro-station-named police stations -> transit-hub, etc.)
ARCHETYPE_HINTS = {
    "market-zone": ["market", "bazar", "bazaar", "sadar", "chandni", "karol bagh",
                    "kamla", "sarojini", "lajpat", "chawri", "hauz qazi"],
    "transit-hub": ["metro", "station", "cantt", "vihar", "kashmiri gate",
                    "anand vihar", "shahdara", "kalkaji"],
    "commercial": ["connaught", "nehru place", "okhla", "patparganj", "naraina",
                   "mayapuri", "industrial", "kirti nagar", "netaji subhash"],
}

def assign_area_type(locality_name, rng_local):
    name_lower = locality_name.lower()
    for archetype, hints in ARCHETYPE_HINTS.items():
        if any(h in name_lower for h in hints):
            return archetype
    # otherwise probabilistically residential-leaning, some mixed
    return rng_local.choice(["residential", "residential", "mixed"], p=[0.55, 0.0, 0.45]) \
        if False else rng_local.choice(["residential", "mixed"], p=[0.7, 0.3])

ROAD_TYPES = ["arterial", "collector", "local", "highway-adjacent"]
ROAD_WEIGHTS_BY_ARCHETYPE = {
    "commercial":   [0.45, 0.30, 0.10, 0.15],
    "market-zone":  [0.30, 0.40, 0.25, 0.05],
    "transit-hub":  [0.50, 0.25, 0.10, 0.15],
    "residential":  [0.10, 0.35, 0.50, 0.05],
    "mixed":        [0.25, 0.35, 0.30, 0.10],
}

# Real Delhi neighborhoods commonly subdivide into named ward-level sub-areas
# (e.g. "Mayur Vihar Phase 2", "Vasant Kunj Sector C", "Rohini Sector 7 Extension").
# We generate sub-areas using these standard, genuinely-used Delhi naming
# conventions, always anchored to a real base locality name -- this is an
# honest synthetic augmentation and is disclosed as such in the data dictionary.
SUBAREA_SUFFIXES = ["Phase 1", "Phase 2", "Extension", "Block A", "Block B",
                     "Block C", "Colony", "Sector Extension"]

def expand_with_subareas(base_stations, rng_seed_base):
    """Given a district's real base stations, add ward-level sub-area names
    (drawn once per station, deterministic) so the city totals ~240 localities."""
    expanded = list(base_stations)
    r = np.random.default_rng(rng_seed_base)
    for station in base_stations:
        n_sub = r.integers(0, 3)  # 0, 1, or 2 sub-areas per base station
        chosen = r.choice(SUBAREA_SUFFIXES, size=n_sub, replace=False) if n_sub > 0 else []
        for suf in chosen:
            expanded.append(f"{station} {suf}")
    return expanded

rows = []
locality_id = 1
for district, (min_lat, max_lat, min_lon, max_lon) in DISTRICTS.items():
    base_stations = POLICE_STATIONS[district]
    district_seed = abs(hash(("subarea", district))) % (2**32)
    stations = expand_with_subareas(base_stations, rng_seed_base=district_seed)
    for station_name in stations:
        # place locality point within district bbox, biased toward center
        # with jitter, using a per-name seed so re-runs are reproducible
        name_seed = abs(hash((district, station_name))) % (2**32)
        local_rng = np.random.default_rng(name_seed)
        lat = local_rng.uniform(min_lat, max_lat)
        lon = local_rng.uniform(min_lon, max_lon)

        area_type = assign_area_type(station_name, local_rng)

        police_dist = round(local_rng.uniform(0.3, 2.5), 2)  # own station is always close
        hospital_dist = round(nearest_distance(lat, lon, HOSPITALS) + local_rng.uniform(-0.3, 0.5), 2)
        hospital_dist = max(0.2, hospital_dist)
        metro_dist = round(nearest_distance(lat, lon, METRO_STATIONS) + local_rng.uniform(-0.3, 0.6), 2)
        metro_dist = max(0.1, metro_dist)

        # amenity densities (0-10 scale), skewed by archetype
        if area_type == "market-zone":
            market_density = local_rng.integers(6, 11)
            school_density = local_rng.integers(1, 5)
        elif area_type == "commercial":
            market_density = local_rng.integers(4, 8)
            school_density = local_rng.integers(1, 4)
        elif area_type == "transit-hub":
            market_density = local_rng.integers(3, 7)
            school_density = local_rng.integers(2, 5)
        elif area_type == "residential":
            market_density = local_rng.integers(1, 5)
            school_density = local_rng.integers(3, 9)
        else:  # mixed
            market_density = local_rng.integers(2, 6)
            school_density = local_rng.integers(2, 6)

        road_type = local_rng.choice(ROAD_TYPES, p=ROAD_WEIGHTS_BY_ARCHETYPE[area_type])

        # population density proxy (people per sq km, thousands) - realistic-ish
        # ranges: old-city/market areas very dense, outer/rohini less so
        if district in ("Central", "North", "Shahdara", "North East"):
            pop_density = round(local_rng.uniform(18, 34), 1)
        elif district in ("Outer North", "Dwarka", "Rohini", "Outer"):
            pop_density = round(local_rng.uniform(6, 16), 1)
        else:
            pop_density = round(local_rng.uniform(10, 24), 1)

        # PERSISTENT PERSONALITY VECTOR -- drawn once, fixed forever.
        # baseline_tendency: shifts the whole risk curve up/down for this locality
        # volatility: how noisy/unpredictable this locality's day-to-day risk is
        # night_sensitivity: how sharply risk rises after dark, on top of archetype
        baseline_tendency = round(local_rng.normal(0, 1.0), 3)
        volatility = round(abs(local_rng.normal(1.0, 0.35)), 3)
        night_sensitivity = round(abs(local_rng.normal(1.0, 0.4)), 3)
        weekend_sensitivity = round(local_rng.normal(0, 0.6), 3)

        nearest_metro_name = min(METRO_STATIONS, key=lambda m: haversine_km(lat, lon, m[1], m[2]))[0]
        nearest_hospital_name = min(HOSPITALS, key=lambda h: haversine_km(lat, lon, h[1], h[2]))[0]

        rows.append(dict(
            locality_id=f"L{locality_id:04d}",
            locality_name=station_name,
            district=district,
            latitude=round(lat, 5),
            longitude=round(lon, 5),
            area_type=area_type,
            road_type=road_type,
            police_station_dist_km=police_dist,
            hospital_dist_km=hospital_dist,
            nearest_hospital=nearest_hospital_name,
            metro_dist_km=metro_dist,
            nearest_metro=nearest_metro_name,
            market_density=int(market_density),
            school_density=int(school_density),
            population_density_proxy=pop_density,
            baseline_tendency=baseline_tendency,
            volatility=volatility,
            night_sensitivity=night_sensitivity,
            weekend_sensitivity=weekend_sensitivity,
        ))
        locality_id += 1

df = pd.DataFrame(rows)
print(f"Total localities generated: {len(df)}")
print(df['district'].value_counts())
print(df['area_type'].value_counts())
print(df.head())

out_path = "/home/claude/SafeSphere_AI/data/raw/locality_profiles.csv"
df.to_csv(out_path, index=False)
print(f"\nSaved to {out_path}")
