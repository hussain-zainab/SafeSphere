const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { verifyUser } = require('../controllers/authController');

router.post('/verify', authMiddleware, verifyUser);

module.exports = router;
