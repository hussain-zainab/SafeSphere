const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const RiskCache = require('../models/RiskCache');
const Locality = require('../models/Locality');
const { getPrediction } = require('../services/mlClient');

const ONE_HOUR = 60 * 60 * 1000;

router.post('/predict', authMiddleware, async (req, res) => {
  const { lat, lng, localityId } = req.body;

  // Check cache first
  const cached = await RiskCache.findOne({ localityId }).sort({ computedAt: -1 });
  if (cached && Date.now() - cached.computedAt.getTime() < ONE_HOUR) {
    return res.status(200).json(cached);
  }

  // Cache stale/missing -> call ML service
  const prediction = await getPrediction({ lat, lng });

  const newCache = await RiskCache.create({
    localityId,
    riskScore: prediction.risk_score,
    riskLevel: prediction.risk_level,
    topFactors: prediction.top_factors,
  });

  await Locality.findByIdAndUpdate(localityId, {
    currentRiskScore: prediction.risk_score,
    riskLevel: prediction.risk_level,
    lastUpdated: new Date(),
  });

  res.status(200).json(newCache);
});

router.get('/locality/:name', async (req, res) => {
  const locality = await Locality.findOne({ name: req.params.name });
  if (!locality) return res.status(404).json({ error: 'Locality not found' });
  res.status(200).json(locality);
});

module.exports = router; 
