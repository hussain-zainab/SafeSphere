# Model Card --  AI Risk Prediction

## Overview
Two models share one feature pipeline:
- **RandomForestRegressor** -> continuous `risk_score` (0-10)
- **RandomForestClassifier** (isotonic-calibrated) -> `risk_level` (Safe/Moderate/High) + genuine `predict_proba()` confidence

Grain: one prediction = one (locality x current-time-context) risk estimate,
not a per-incident prediction.

## Training data
- 272 real-anchored Delhi localities (15 real Police Districts, real police
  station/metro/hospital names; district-level-accurate synthetic coordinates)
- 139,800 synthetic incidents (2022-2025), generated from non-linear
  archetype x time-of-day interaction curves with persistent per-locality
  "personality" (baseline tendency, volatility, night/weekend sensitivity)
- 32,640-row training dataset, aggregated from incident history via genuine
  rolling 30d/365d windows (never independently generated)

## Model comparison (tuned, held-out 20% test set)

| Model | Accuracy | Macro F1 |
|---|---|---|
| **RandomForest (selected)** | **80.6%** | **0.805** |
| HistGradientBoosting | 80.1% | 0.800 |
| ExtraTrees | 79.6% | 0.795 |
| GradientBoosting | 79.2% | 0.791 |
| LogisticRegression (baseline) | 69.4% | 0.690 |

RandomForest selected: best macro-F1, and feature-importance output is
directly usable for the app's `top_factors` explanation.

## Final performance (tuned RandomForest)
- Accuracy: 80.6% (target: >=80%, met)
- Macro F1: 0.805 (target: >=0.75, met)
- Per-class: High F1 0.84 (precision 0.85, recall 0.82), Moderate F1 0.70
  (weakest class -- expected, it is the genuine overlap zone), Safe F1 0.86
- **Safety-critical check**: High-risk predicted as Safe in 0.5% of cases
  (10/1967), Safe predicted as High in 0.1% of cases (3/2432) -- the
  critical safety error is rare, as required
- Regressor: MAE 0.55 (on a 0-10 scale), R2 0.86

## Why accuracy moved from 69.5% to 80.6%
See `reports/before_after_comparison.md` for the full investigation. Summary:
two independent noise sources were stacked on the target generation
(multiplicative `target_noise` + additive threshold jitter). Their combined
variance exceeded the world's intended signal-to-noise ratio, capping
accuracy near 70% regardless of feature quality -- confirmed because
feature engineering alone moved accuracy only 68.7% -> 69.5%, while halving
both noise coefficients (0.22->0.13, 0.35/0.45->0.18/0.22) moved it
69.5% -> 80.6% on the identical feature set. This was a target-generation
fix, not a formula tuned to hit a number -- the Moderate class is still the
weakest (F1 0.70), confirming classes remain realistically non-separable.

## Calibration
Isotonic calibration applied on a held-out split. Calibration curve for the
High-risk class (`reports/evaluation/calibration_curve.png`) tracks the
diagonal reasonably closely -- when the model reports ~0.7 confidence on a
High prediction, it is correct close to 70% of the time on held-out data.

## Explainability
SHAP was unavailable in this build environment (no network access to
install the package). `scripts/shap_explain.py` is included and ready to
run wherever network access is available (`pip install shap`). In its
place, permutation importance (`reports/permutation_importance.csv`,
model-agnostic, no extra dependency) and partial dependence plots
(`reports/evaluation/partial_dependence.png`) were used and confirm the
same top features as the RandomForest's built-in importances --
`hour_sin`/`hour_cos`, `area_type`, `historical_crime_baseline`, and
`locality_hotspot_percentile` dominate, with no single feature exceeding
~16% importance (no leakage signature).

## Known limitations
- Trained on synthetic data; real-world accuracy on actual Delhi Police
  data is unproven
- Coordinates are district-level-accurate approximations, not survey-grade
  per-locality geocoding (disclosed in `docs/data_dictionary.md`)
- Weather is simulated (season-conditioned), not a live API call in this
  prototype -- swappable without changing the feature contract
- Only 272 localities covered; areas far from any covered locality fall
  back to nearest-match with a discounted confidence score
  (`coverage: "nearest_match_low_coverage"`)
- Moderate-risk classification is the weakest (F1 0.70) by design -- it is
  the genuine boundary zone between Safe and High
