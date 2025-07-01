const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { getAdminDashboard } = require("../controllers/dashboardController");

router.get("/admin", protect, restrictTo("admin"), getAdminDashboard);

module.exports = router;
