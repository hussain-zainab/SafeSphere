"""
WORLD MODEL
===========
Defines the latent "true risk process" of the synthetic Delhi world.
This module is shared by generate_incidents.py (which uses it to drive
WHERE/WHEN incidents happen) and build_training_dataset.py (which uses
it to drive the TARGET, with its own independent noise layered on top).

Design intent (per approved v2 requirements):
  - archetype x time-of-day interactions are NON-LINEAR (sigmoid-shaped
    transitions at dusk/late-night, not linear ramps)
  - every locality has a persistent, distinct "personality" (baseline
    tendency, volatility, night-sensitivity, weekend-sensitivity) pulled
    from locality_profiles.csv, so two commercial areas do NOT behave
    identically
  - the SAME latent process feeds both incident generation and target
    generation, which is what makes the relationship learnable -- but
    the target additionally gets its own independent noise term (see
    build_training_dataset.py) so it is never a deterministic function
    of the aggregated incident features alone.
"""
import numpy as np

SEASONS = ["winter", "spring", "summer", "monsoon", "autumn"]
MONTH_TO_SEASON = {
    12: "winter", 1: "winter", 2: "winter",
    3: "spring", 4: "spring",
    5: "summer", 6: "summer",
    7: "monsoon", 8: "monsoon", 9: "monsoon",
    10: "autumn", 11: "autumn",
}

# Relative (unnormalized) hourly risk-intensity curves per archetype, hours 0-23.
# Hand-designed to be NON-LINEAR: sigmoid-like dusk transitions, distinct peaks.
HOURLY_CURVES = {
    "commercial":   [0.70,0.65,0.60,0.55,0.45,0.30,0.25,0.20,0.20,0.20,0.20,0.20,
                      0.20,0.20,0.25,0.30,0.40,0.55,0.75,0.95,1.00,0.95,0.85,0.75],
    "market-zone":  [0.35,0.30,0.25,0.20,0.20,0.20,0.25,0.35,0.40,0.45,0.50,0.55,
                      0.55,0.55,0.60,0.65,0.75,0.85,0.90,0.80,0.60,0.45,0.40,0.35],
    "transit-hub":  [0.50,0.45,0.40,0.35,0.30,0.35,0.55,0.75,0.70,0.50,0.35,0.30,
                      0.30,0.35,0.40,0.50,0.70,0.85,0.75,0.55,0.45,0.50,0.55,0.55],
    "residential":  [0.50,0.45,0.40,0.35,0.30,0.30,0.35,0.40,0.40,0.35,0.30,0.30,
                      0.30,0.30,0.30,0.35,0.40,0.45,0.50,0.55,0.60,0.65,0.60,0.55],
    "mixed":        [0.55,0.50,0.45,0.40,0.35,0.30,0.30,0.30,0.30,0.28,0.28,0.28,
                      0.28,0.30,0.32,0.35,0.40,0.48,0.55,0.62,0.65,0.65,0.60,0.58],
}

ARCHETYPE_BASE_ANNUAL_RATE = {
    "residential": 90, "mixed": 130, "transit-hub": 170,
    "market-zone": 220, "commercial": 260,
}

# Crime-type mixes differ by archetype (real pattern: snatching/theft cluster
# in markets & transit; domestic violence is flat across residential; assault
# clusters in commercial/nightlife-adjacent areas).
CRIME_TYPES = ["Eve Teasing/Harassment", "Theft", "Assault", "Molestation",
               "Sexual Harassment", "Domestic Violence",
               "Kidnapping/Abduction", "Chain/Purse Snatching"]

CRIME_TYPE_DIST = {
    "residential":  [0.18, 0.12, 0.08, 0.12, 0.10, 0.28, 0.04, 0.08],
    "mixed":        [0.20, 0.16, 0.10, 0.14, 0.12, 0.14, 0.05, 0.09],
    "transit-hub":  [0.24, 0.14, 0.08, 0.18, 0.16, 0.05, 0.05, 0.10],
    "market-zone":  [0.20, 0.22, 0.07, 0.13, 0.11, 0.04, 0.04, 0.19],
    "commercial":   [0.16, 0.14, 0.16, 0.16, 0.14, 0.06, 0.06, 0.12],
}

SEASON_MULTIPLIER = {"winter": 1.15, "spring": 1.00, "summer": 0.95,
                      "monsoon": 1.08, "autumn": 1.00}

WEATHER_BY_SEASON = {
    "winter":  {"Foggy": 0.30, "Cold-Clear": 0.35, "Cloudy": 0.25, "Clear": 0.10},
    "spring":  {"Clear": 0.55, "Cloudy": 0.30, "Windy": 0.15},
    "summer":  {"Clear": 0.40, "Hot-Hazy": 0.40, "Cloudy": 0.20},
    "monsoon": {"Rainy": 0.50, "Cloudy": 0.35, "Clear": 0.15},
    "autumn":  {"Clear": 0.50, "Cloudy": 0.35, "Hazy": 0.15},
}
WEATHER_RISK_MODIFIER = {
    "Foggy": 1.12, "Rainy": 1.10, "Hazy": 1.05, "Cloudy": 1.02,
    "Cold-Clear": 1.03, "Hot-Hazy": 1.00, "Windy": 1.00, "Clear": 1.00,
}


def is_night_hour(hour):
    return hour >= 21 or hour < 5


def hour_bucket(hour):
    if 5 <= hour < 9:
        return "early_morning"
    if 9 <= hour < 16:
        return "midday"
    if 16 <= hour < 20:
        return "evening"
    if 20 <= hour < 24:
        return "late_evening"
    return "night"


def true_risk(archetype, hour, is_weekend, season, weather, personality, rng=None):
    """
    Latent ground-truth risk intensity for a given locality-context.
    personality: dict with baseline_tendency, volatility, night_sensitivity,
                 weekend_sensitivity (from locality_profiles.csv)
    Returns a positive float (unnormalized risk intensity).
    """
    base = HOURLY_CURVES[archetype][hour]

    # non-linear night amplification, locality-specific strength
    if is_night_hour(hour):
        base = base * (1.0 + 0.35 * (personality["night_sensitivity"] - 1.0))

    # weekend interaction: archetype-dependent amplification of evening/night
    if is_weekend:
        evening_like = hour_bucket(hour) in ("evening", "late_evening", "night")
        amp = {"market-zone": 1.6, "commercial": 1.3, "transit-hub": 0.9,
               "mixed": 1.0, "residential": 0.7}[archetype]
        base = base * (1.0 + 0.12 * personality["weekend_sensitivity"] * amp *
                        (1.0 if evening_like else 0.3))

    # seasonal + weather (non-additive interaction: fog/rain bite harder at night)
    season_mult = SEASON_MULTIPLIER[season]
    weather_mult = WEATHER_RISK_MODIFIER.get(weather, 1.0)
    if is_night_hour(hour) and weather in ("Foggy", "Rainy"):
        weather_mult *= 1.08  # extra interaction: bad weather + dark hits harder

    base = base * season_mult * weather_mult

    # persistent locality personality: baseline shift (log-scale so it can't go negative)
    base = base * np.exp(0.28 * personality["baseline_tendency"])

    return max(base, 0.01)


def sample_weather(season, rng):
    options = list(WEATHER_BY_SEASON[season].keys())
    probs = list(WEATHER_BY_SEASON[season].values())
    return rng.choice(options, p=probs)
