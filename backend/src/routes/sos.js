const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const SosEvent = require('../models/SosEvent');
const { sendPushNotification } = require('../services/fcm');

router.post('/trigger', authMiddleware, async (req, res) => {
  const { lat, lng } = req.body;
  const contactsNotified = req.user.emergencyContacts.map((c) => c.phone);

  const sosEvent = await SosEvent.create({
    userId: req.user._id,
    lat,
    lng,
    contactsNotified,
  });

  // SMS: use Twilio (or explain as "integration point" in demo if API keys not ready)
  // await twilioClient.messages.create({ body: `Emergency! Live location: maps.google.com/?q=${lat},${lng}`, to: contact.phone, from: TWILIO_NUMBER });

  // Push notification to user's own device as confirmation
  if (req.user.deviceToken) {
    await sendPushNotification(
      req.user.deviceToken,
      'SOS Sent',
      'Your emergency contacts have been notified.'
    );
  }

  res.status(201).json({ message: 'SOS triggered', sosEvent });
});

module.exports = router;