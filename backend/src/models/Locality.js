const mongoose = require('mongoose');

const localitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  district: String,
  lat: Number,
  lng: Number,
  currentRiskScore: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['Safe', 'Moderate', 'High'], default: 'Safe' },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Locality', localitySchema);
