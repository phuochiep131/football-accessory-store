const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

const getStats = async (req, res) => {
  try {
    // 1. Tổng doanh thu (Chỉ tính đơn đã giao hoặc hoàn thành)
    // Lưu ý: trạng thái 'delivered' là hoàn thành
    const revenueData = await Order.aggregate([
      { $match: { order_status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // 2. Đếm số lượng
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: "Customer" });
    const totalProducts = await Product.countDocuments();

    // 3. Đơn hàng gần đây (5 đơn mới nhất)
    const recentOrders = await Order.find()
      .sort({ order_date: -1 })
      .limit(5)
      .populate("user_id", "fullname email");

    // 4. Biểu đồ doanh thu theo tháng (Aggregate nâng cao)
    const monthlyRevenue = await Order.aggregate([
      { $match: { order_status: "delivered" } },
      {
        $group: {
          _id: { $month: "$order_date" },
          revenue: { $sum: "$total_amount" },
        },
      },
      { $sort: { _id: 1 } }, // Sắp xếp theo tháng 1 -> 12
    ]);

    res.json({
      stats: {
        revenue: totalRevenue,
        orders: totalOrders,
        users: totalUsers,
        products: totalProducts,
      },
      recentOrders,
      chartData: monthlyRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getStats };
