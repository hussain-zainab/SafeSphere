const mongoose = require('mongoose');

const riskCacheSchema = new mongoose.Schema({
  localityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Locality', required: true },
  riskScore: Number,
  riskLevel: { type: String, enum: ['Safe', 'Moderate', 'High'] },
  topFactors: [String],
  computedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RiskCache', riskCacheSchema);
