from pydantic import BaseModel, Field
from typing import List


class RiskPredictRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, example=28.6139)
    longitude: float = Field(..., ge=-180, le=180, example=77.2090)


class RiskPredictResponse(BaseModel):
    locality: str
    district: str
    risk_score: float
    risk_level: str
    confidence: float
    top_factors: List[str]
    recent_incidents: int
    nearby_hotspots: List[str]
    coverage: str
    explanation: str
