const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getDirections } = require('../services/googleMaps');
const Locality = require('../models/Locality');

router.post('/safe', authMiddleware, async (req, res) => {
  const { origin, destination } = req.body;
  const routes = await getDirections(origin, destination);

  // Simple risk-scoring: for each route, average riskScore of localities it passes near
  const scoredRoutes = await Promise.all(
    routes.map(async (route) => {
      // Simplified: real implementation would map route.legs.steps -> nearest localities
      const avgRisk = Math.random() * 10; // placeholder until locality-matching logic is added
      return { ...route, riskScore: avgRisk };
    })
  );

  const fastest = scoredRoutes[0];
  const safest = [...scoredRoutes].sort((a, b) => a.riskScore - b.riskScore)[0];

  res.status(200).json({ fastest, safest });
});

module.exports = router;
