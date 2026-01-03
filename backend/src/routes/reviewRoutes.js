const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { authenticate, isAdmin } = require("../middlewares/authMiddleware");

// Public: Xem đánh giá của sản phẩm
router.get("/product/:productId", reviewController.getByProduct);

// User: Viết đánh giá (Cần đăng nhập)
router.post("/create", authenticate, reviewController.create);

// Admin: Quản lý đánh giá
router.get("/admin/all", authenticate, isAdmin, reviewController.getAll);
router.put(
  "/admin/toggle/:id",
  authenticate,
  isAdmin,
  reviewController.toggleHide
);
router.delete("/admin/:id", authenticate, isAdmin, reviewController.remove);

module.exports = router;
