const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authenticate, isAdmin } = require("../middlewares/authMiddleware");

// Chỉ Admin mới được xem thống kê
router.get("/stats", authenticate, isAdmin, dashboardController.getStats);

module.exports = router;
