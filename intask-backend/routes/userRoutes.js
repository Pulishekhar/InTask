const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

router.patch('/:id/team', protect, restrictTo('admin'), userController.assignTeam);

module.exports = router;
