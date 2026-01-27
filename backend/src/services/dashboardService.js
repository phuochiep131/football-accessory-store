const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const User = require("../models/User");
const Product = require("../models/Product");

const getDashboardStats = async () => {
  const now = new Date();
  const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // 1. DOANH THU & ĐƠN HÀNG THÁNG NÀY
  const thisMonthRevenueData = await Order.aggregate([
    {
      $match: {
        order_status: "delivered",
        order_date: { $gte: firstDayOfThisMonth },
      },
    },
    { $group: { _id: null, total: { $sum: "$total_amount" } } },
  ]);
  const revenueThisMonth = thisMonthRevenueData[0]?.total || 0;

  const ordersThisMonth = await Order.countDocuments({
    order_date: { $gte: firstDayOfThisMonth },
  });

  // 2. CÁC CHỈ SỐ TỔNG QUAN
  const totalUsers = await User.countDocuments();

  // --- SỬA LOGIC Ở ĐÂY: TÍNH TỔNG SỐ LƯỢNG TỒN KHO (ITEMS) ---
  const totalStockData = await Product.aggregate([
    { $unwind: "$sizes" }, // Tách mảng sizes ra thành từng dòng riêng biệt
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: "$sizes.quantity" }, // Cộng dồn quantity
      },
    },
  ]);
  const totalStock = totalStockData[0]?.totalQuantity || 0;
  // -----------------------------------------------------------

  // Tính tổng doanh thu toàn thời gian
  const totalRevenueData = await Order.aggregate([
    { $match: { order_status: "delivered" } },
    { $group: { _id: null, total: { $sum: "$total_amount" } } },
  ]);
  const revenueTotal = totalRevenueData[0]?.total || 0;

  // 3. BIỂU ĐỒ DOANH THU 12 THÁNG
  const monthlyRevenue = await Order.aggregate([
    { $match: { order_status: "delivered" } },
    {
      $group: {
        _id: { $month: "$order_date" },
        revenue: { $sum: "$total_amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 4. TOP SẢN PHẨM BÁN CHẠY
  const topProducts = await OrderDetail.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "order_id",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: "$order" },
    { $match: { "order.order_status": "delivered" } },
    {
      $group: {
        _id: "$product_id",
        totalSold: { $sum: "$quantity" },
        revenue: { $sum: "$subtotal" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $project: {
        name: "$productInfo.product_name",
        image: "$productInfo.image_url",
        totalSold: 1,
        revenue: 1,
      },
    },
  ]);

  // 5. HÀNG TỒN KHO > 3 THÁNG
  const soldItems = await OrderDetail.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "order_id",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: "$order" },
    {
      $match: {
        "order.order_status": "delivered",
        "order.order_date": { $gte: threeMonthsAgo },
      },
    },
    { $group: { _id: "$product_id" } },
  ]);

  const soldProductIds = soldItems.map((item) => item._id);

  const deadStockRaw = await Product.find({
    _id: { $nin: soldProductIds },
  })
    .limit(10)
    .select("product_name image_url price sizes");

  const deadStockProducts = deadStockRaw
    .map((p) => {
      const totalQty = p.sizes
        ? p.sizes.reduce((acc, curr) => acc + curr.quantity, 0)
        : 0;
      return {
        _id: p._id,
        name: p.product_name,
        image: p.image_url,
        price: p.price,
        quantity: totalQty,
      };
    })
    .filter((p) => p.quantity > 0);

  // 6. ĐƠN HÀNG GẦN ĐÂY
  const recentOrders = await Order.find()
    .sort({ order_date: -1 })
    .limit(5)
    .populate("user_id", "fullname email");

  return {
    stats: {
      revenueThisMonth,
      revenueTotal,
      ordersThisMonth,
      ordersTotal: await Order.countDocuments(),
      users: totalUsers,
      products: totalStock, // <-- TRẢ VỀ TỔNG SỐ LƯỢNG TỒN KHO THỰC TẾ
    },
    chartData: monthlyRevenue,
    topProducts,
    deadStockProducts,
    recentOrders,
  };
};

module.exports = { getDashboardStats };
