const mongoose = require('mongoose');

const sosEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lat: Number,
  lng: Number,
  timestamp: { type: Date, default: Date.now },
  contactsNotified: [String],
});

module.exports = mongoose.model('SosEvent', sosEventSchema);
