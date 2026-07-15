# Architecture -- SafeSphere AI Risk Prediction Service

```
React Native App
      | HTTPS (JWT)
      v
Node/Express API  <---->  FastAPI ML Service (this project)
      |                         |
      v                         v
MongoDB Atlas          artifacts/locality_lookup.json
                        models/*.pkl (regressor + calibrated classifier)

Request flow:
App --POST /api/risk/predict {lat,lng}--> Express
  Express checks risk_cache (fresh <1hr?)
    if stale: Express --POST /predict-risk {lat,lng}--> FastAPI
      FastAPI: nearest-locality lookup -> feature vector -> models -> response
    Express writes result -> MongoDB (risk_cache)
  Express --200 {riskLevel, score, factors}--> App
```

## Inference pipeline (matches the frozen API contract)
```
{latitude, longitude}
  -> nearest-locality lookup (haversine vs artifacts/locality_lookup.json)
  -> now() -> hour_bucket, hour_sin/cos, is_night, day_of_week, is_weekend, month, season
  -> weather (season-conditioned simulation; swap for a real weather API in production)
  -> 36-feature vector (docs/model_card.md)
  -> RandomForestRegressor -> risk_score
  -> Calibrated RandomForestClassifier -> risk_level, confidence
  -> top_factors (permutation-importance-ranked), nearby_hotspots (radius search)
  -> JSON response
```
