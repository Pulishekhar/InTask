// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');

// Protect all admin routes and restrict to 'admin' role
router.use(protect);
router.use(restrictTo('admin'));

// Admin dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;