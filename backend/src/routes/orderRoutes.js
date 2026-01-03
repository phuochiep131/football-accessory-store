const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate, isAdmin } = require("../middlewares/authMiddleware");

router.use(authenticate);

// User Routes
router.post("/create", orderController.create);
router.get("/my-orders", orderController.getMyOrders);
router.get("/detail/:id", orderController.getOrderDetail);
router.put("/cancel/:id", orderController.cancelOrder);
router.get('/vnpay-verify', orderController.verifyPayment);

// Admin Routes (Thêm đoạn này)
router.get("/admin/all", isAdmin, orderController.getAllOrders);
router.put("/admin/status/:id", isAdmin, orderController.updateStatus);

module.exports = router;
