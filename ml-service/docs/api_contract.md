# API Contract -- SafeSphere AI Risk Prediction Service

**This contract is frozen. It will not change after implementation.**

## POST /predict-risk

### Request
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```
No other fields. The mobile app never collects or sends any ML feature
manually -- everything is derived server-side from these two numbers plus
the current server time.

### Response
```json
{
  "locality": "Connaught Place",
  "district": "New Delhi",
  "risk_score": 5.4,
  "risk_level": "Moderate",
  "confidence": 0.78,
  "top_factors": ["low-light hours (late evening)", "area type (commercial)", "recent 12-month report volume"],
  "recent_incidents": 12,
  "nearby_hotspots": ["Barakhamba Road (High)", "Mandir Marg (Moderate)"],
  "coverage": "in_dataset",
  "explanation": "Risk driven primarily by low-light hours (late evening) in Connaught Place (commercial area). Nearest police station is over 2km away."
}
```

| Field | Type | Notes |
|---|---|---|
| locality | string | Nearest matched locality name |
| district | string | Real Delhi Police district |
| risk_score | float (0-10) | From the regressor |
| risk_level | string | Safe / Moderate / High |
| confidence | float (0-1) | Calibrated `predict_proba()` max, not fabricated |
| top_factors | list[string] | Up to 3 human-readable contributing factors |
| recent_incidents | int | Reports in the last 30 days for this locality |
| nearby_hotspots | list[string] | Up to 3 nearby localities with elevated risk |
| coverage | string | `in_dataset` or `nearest_match_low_coverage` |
| explanation | string | One-sentence natural-language summary |

## GET /health
Returns `{"status": "ok"}` -- for Render/uptime checks.

## Integration notes for Siddiqua's backend
- Express calls this endpoint with only `{latitude, longitude}` -- exactly
  matches the original `/api/risk/predict` design in the engineering PDF.
- Recommended caching: cache the response in `risk_cache` per locality for
  ~1 hour (per PDF section 8), since risk context changes slowly relative
  to that window.
- Errors return HTTP 500 with `{"detail": "Prediction failed: ..."}`.
