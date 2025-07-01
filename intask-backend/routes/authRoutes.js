// authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, verify } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/verify', protect, verify);

module.exports = router; // ← instead of `() => router`
