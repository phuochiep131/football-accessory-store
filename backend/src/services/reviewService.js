const Review = require("../models/Review");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");

// 1. Tạo đánh giá (có kiểm tra điều kiện)
async function createReview(userId, data) {
  const { product_id, order_id, rating, comment } = data;

  // 1. Kiểm tra đơn hàng cụ thể này có tồn tại và đã giao chưa
  const order = await Order.findOne({
    _id: order_id,
    user_id: userId,
    order_status: "delivered",
  });

  if (!order) {
    throw new Error("Đơn hàng không hợp lệ hoặc chưa hoàn thành.");
  }

  // 2. Kiểm tra xem user đã đánh giá sản phẩm này trong đơn hàng này chưa
  const existingReview = await Review.findOne({
    user_id: userId,
    product_id: product_id,
    order_id: order_id, // Check kỹ theo đơn hàng này
  });

  if (existingReview) {
    throw new Error("Bạn đã đánh giá sản phẩm này rồi.");
  }

  // 3. Tạo review
  const newReview = new Review({
    user_id: userId,
    product_id,
    order_id, // Lưu order_id
    rating,
    comment,
  });

  await newReview.save();
  return newReview;
}

// 2. Lấy đánh giá theo sản phẩm (Public - Chỉ lấy cái chưa ẩn)
async function getReviewsByProduct(productId) {
  return await Review.find({ product_id: productId, is_hidden: false })
    .populate("user_id", "fullname avatar") // Lấy tên và avatar người review
    .sort({ createdAt: -1 });
}

// 3. Admin: Lấy tất cả đánh giá (để quản lý)
async function getAllReviews() {
  return await Review.find()
    .populate("user_id", "fullname email")
    .populate("product_id", "product_name image_url")
    .sort({ createdAt: -1 });
}

// 4. Admin: Ẩn/Hiện đánh giá
async function toggleVisibility(reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Không tìm thấy đánh giá");

  review.is_hidden = !review.is_hidden;
  await review.save();
  return review;
}

// 5. Admin: Xóa đánh giá
async function deleteReview(reviewId) {
  return await Review.findByIdAndDelete(reviewId);
}

module.exports = {
  createReview,
  getReviewsByProduct,
  getAllReviews,
  toggleVisibility,
  deleteReview,
};
