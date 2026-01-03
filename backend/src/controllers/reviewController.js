const reviewService = require("../services/reviewService");

const create = async (req, res) => {
  try {
    const review = await reviewService.createReview(req.user.id, req.body);
    res.status(201).json({ message: "Đánh giá thành công!", review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getByProduct = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByProduct(
      req.params.productId
    );
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- ADMIN ---
const getAll = async (req, res) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleHide = async (req, res) => {
  try {
    await reviewService.toggleVisibility(req.params.id);
    res.status(200).json({ message: "Đã thay đổi trạng thái ẩn/hiện" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await reviewService.deleteReview(req.params.id);
    res.status(200).json({ message: "Đã xóa đánh giá" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { create, getByProduct, getAll, toggleHide, remove };
