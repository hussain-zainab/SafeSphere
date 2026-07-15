const express = require('express');
const router = express.Router();
const { getNearbyPlaces } = require('../services/googleMaps');

router.get('/', async (req, res) => {
  const { lat, lng } = req.query;
  const [police, markets, metro] = await Promise.all([
    getNearbyPlaces(lat, lng, 'police'),
    getNearbyPlaces(lat, lng, 'shopping_mall'),
    getNearbyPlaces(lat, lng, 'subway_station'),
  ]);
  res.status(200).json({ police, markets, metro });
});

module.exports = router;
