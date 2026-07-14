# Raksha AI -- Risk Prediction Service

Locality-level women's safety risk prediction for Delhi, built from a
GPS-only input contract: `{latitude, longitude}` in, full risk breakdown out.

## Quick facts
- 272 real-anchored Delhi localities across 15 real Police Districts
- 139,800-incident synthetic history (2022-2025), non-linear archetype x
  time-of-day world model with per-locality "personality"
- Final model: RandomForest, **80.6% accuracy / 0.805 macro F1** (tuned,
  held-out test set) -- see `docs/model_card.md` for the full investigation
  into how this was reached honestly (not by tuning noise to hit a number)
- Leakage-free: see `docs/leakage_audit.md`
- Frozen API contract: see `docs/api_contract.md`

## Run locally
```bash
cd api
pip install -r requirements.txt
uvicorn app:app --reload
# POST http://localhost:8000/predict-risk {"latitude": 28.6139, "longitude": 77.2090}
```

## Project structure
```
SafeSphere_AI/
├── data/{raw,cleaned,processed}/   # datasets at each pipeline stage
├── scripts/                        # full pipeline, run in order (see below)
├── models/                         # trained regressor + calibrated classifier
├── artifacts/                      # locality_lookup.json, feature_columns.json, metadata
├── reports/{eda,evaluation}/       # all charts, comparisons, audits
├── api/                            # FastAPI service (self-contained, deployable)
├── docs/                           # model card, API contract, leakage audit, data dictionary, architecture
├── render.yaml, .gitignore
```

## Pipeline (run in order to reproduce from scratch)
```
scripts/generate_localities.py
scripts/generate_incidents.py
scripts/build_training_dataset.py
scripts/feature_engineering.py
scripts/feature_selection.py
scripts/compare_models.py         # model comparison + hyperparameter tuning
scripts/train_model.py            # final regressor + calibrated classifier
scripts/evaluate_model.py         # confusion matrix, ROC, PR, calibration
scripts/explainability.py         # permutation importance + partial dependence
scripts/build_artifacts.py        # locality_lookup.json + metadata
```

## Deploy
Render picks up `render.yaml` automatically (Docker build from `api/`).
