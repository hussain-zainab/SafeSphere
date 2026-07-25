const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile', authMiddleware, async (req, res) => {
  res.status(200).json(req.user);
});

router.put('/contacts', authMiddleware, async (req, res) => {
  let { contacts } = req.body;

  // Agar frontend sirf phone numbers ka array bhej raha hai (strings),
  // to use objects mein convert kar do
  if (Array.isArray(contacts) && contacts.length > 0 && typeof contacts[0] === 'string') {
    contacts = contacts.map((phone) => ({ name: '', phone }));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { emergencyContacts: contacts },
    { new: true }
  );
  res.status(200).json(updatedUser);
});

module.exports = router;
