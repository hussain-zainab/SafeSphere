const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  phone: { type: String, default: ''},
  emergencyContacts: [
    {
      name: String,
      phone: String,
    },
  ],
  lastLat: { type: Number, default: null },
  lastLng: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
