const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  localityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Locality' },
  crimeType: { type: String, required: true },
  description: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'reviewed'], default: 'pending' },
});

module.exports = mongoose.model('Report', reportSchema);
