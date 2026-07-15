const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Report = require('../models/Report');

router.post('/', authMiddleware, async (req, res) => {
  const { crimeType, description, localityId } = req.body;
  const report = await Report.create({
    userId: req.user._id,
    localityId,
    crimeType,
    description,
  });
  res.status(201).json(report);
});

router.get('/', authMiddleware, async (req, res) => {
  const { localityId } = req.query;
  const filter = localityId ? { localityId } : {};
  const reports = await Report.find(filter).sort({ timestamp: -1 }).limit(20);
  res.status(200).json(reports);
});

module.exports = router;
