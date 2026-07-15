const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile', authMiddleware, async (req, res) => {
  res.status(200).json(req.user);
});

router.put('/contacts', authMiddleware, async (req, res) => {
  const { contacts } = req.body; // array of {name, phone}
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { emergencyContacts: contacts },
    { new: true }
  );
  res.status(200).json(updatedUser);
});

module.exports = router;
