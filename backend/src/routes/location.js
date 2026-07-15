const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

router.post('/update', authMiddleware, async (req, res) => {
  const { lat, lng } = req.body;
  if (lat == null || lng == null) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }
  // Simple approach: store latest ping directly on user doc (extend schema if needed)
  await User.findByIdAndUpdate(req.user._id, { lastLat: lat, lastLng: lng });
  res.status(200).json({ message: 'Location updated' });
});

module.exports = router;
