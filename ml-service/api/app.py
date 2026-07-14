from fastapi import FastAPI, HTTPException
from schemas import RiskPredictRequest, RiskPredictResponse
from predict import predict_risk

app = FastAPI(
    title="Raksha AI - Risk Prediction Service",
    description="Locality-level women's safety risk prediction from GPS coordinates.",
    version="1.0.0",
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict-risk", response_model=RiskPredictResponse)
def predict_risk_endpoint(payload: RiskPredictRequest):
    try:
        result = predict_risk(payload.latitude, payload.longitude)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
