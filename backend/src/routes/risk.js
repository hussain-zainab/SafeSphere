const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const RiskCache = require('../models/RiskCache');
const Locality = require('../models/Locality');
const { getPrediction } = require('../services/mlClient');

const ONE_HOUR = 60 * 60 * 1000;

router.post('/predict', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }

    // Call ML service
    const prediction = await getPrediction({ lat: latitude, lng: longitude });

    // Locality ko naam ke basis pe find/create krna h (upsert)
    let locality = await Locality.findOne({ name: prediction.locality });
    if (!locality) {
      locality = await Locality.create({
        name: prediction.locality,
        district: prediction.district,
        lat: latitude,
        lng: longitude,
        currentRiskScore: prediction.risk_score,
        riskLevel: prediction.risk_level,
      });
    } else {
      locality.currentRiskScore = prediction.risk_score;
      locality.riskLevel = prediction.risk_level;
      locality.lastUpdated = new Date();
      await locality.save();
    }

    // Save in Cache (history/analytics ke liye)
    await RiskCache.create({
      localityId: locality._id,
      riskScore: prediction.risk_score,
      riskLevel: prediction.risk_level,
      topFactors: prediction.top_factors,
    });

    res.status(200).json({
      riskLevel: prediction.risk_level,
      riskScore: prediction.risk_score,
      locality: prediction.locality,
      topFactors: prediction.top_factors,
    });
  } catch (err) {
    console.error('Risk predict error:', err.message);
    res.status(500).json({ error: 'Failed to compute risk prediction' });
  }
});

router.get('/locality/:name', async (req, res) => {
  const locality = await Locality.findOne({ name: req.params.name });
  if (!locality) return res.status(404).json({ error: 'Locality not found' });
  res.status(200).json(locality);
});

module.exports = router;