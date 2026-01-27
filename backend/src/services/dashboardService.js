const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail"); // Model mới thêm
const User = require("../models/User");
const Product = require("../models/Product");

const getDashboardStats = async () => {
  const now = new Date();
  const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // 1. DOANH THU & ĐƠN HÀNG THÁNG NÀY (Lấy từ bảng Order)
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

  // 2. CÁC CHỈ SỐ TỔNG (Lấy từ Order, User, Product)
  const totalUsers = await User.countDocuments(); // Hoặc { role: "Customer" } nếu có role
  const totalProducts = await Product.countDocuments();

  // Tính tổng doanh thu toàn thời gian
  const totalRevenueData = await Order.aggregate([
    { $match: { order_status: "delivered" } },
    { $group: { _id: null, total: { $sum: "$total_amount" } } },
  ]);
  const revenueTotal = totalRevenueData[0]?.total || 0;

  // 3. BIỂU ĐỒ DOANH THU 12 THÁNG (Lấy từ Order)
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

  // 4. TOP SẢN PHẨM BÁN CHẠY (Phức tạp: Từ OrderDetail -> Order -> Product)
  const topProducts = await OrderDetail.aggregate([
    // Bước 1: Join với Order để check trạng thái đơn hàng
    {
      $lookup: {
        from: "orders", // Tên collection trong MongoDB (thường là số nhiều của model)
        localField: "order_id",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: "$order" },
    // Bước 2: Chỉ lấy đơn đã giao
    { $match: { "order.order_status": "delivered" } },
    // Bước 3: Group theo Product ID để tính tổng số lượng bán
    {
      $group: {
        _id: "$product_id",
        totalSold: { $sum: "$quantity" },
        revenue: { $sum: "$subtotal" }, // OrderDetail có field subtotal
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    // Bước 4: Join với Product để lấy tên và ảnh
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    // Bước 5: Format lại dữ liệu cho Frontend dễ dùng
    {
      $project: {
        name: "$productInfo.product_name", // Map product_name -> name
        image: "$productInfo.image_url", // Map image_url -> image
        totalSold: 1,
        revenue: 1,
      },
    },
  ]);

  // 5. HÀNG TỒN KHO > 3 THÁNG (Dead Stock)
  // Bước A: Tìm list ID sản phẩm đã bán được trong 3 tháng qua
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

  // Bước B: Tìm sản phẩm KHÔNG nằm trong danh sách đã bán & Tính tổng tồn kho
  const deadStockRaw = await Product.find({
    _id: { $nin: soldProductIds },
  })
    .limit(10)
    .select("product_name image_url price sizes");

  // Format lại dữ liệu Dead Stock và tính tổng quantity từ mảng sizes
  const deadStockProducts = deadStockRaw
    .map((p) => {
      const totalQty = p.sizes
        ? p.sizes.reduce((acc, curr) => acc + curr.quantity, 0)
        : 0;
      return {
        _id: p._id,
        name: p.product_name, // Map lại tên
        image: p.image_url, // Map lại ảnh
        price: p.price,
        quantity: totalQty, // Tổng số lượng tồn của tất cả các size
      };
    })
    .filter((p) => p.quantity > 0); // Chỉ lấy những sp thực sự còn hàng

  // 6. ĐƠN HÀNG GẦN ĐÂY
  const recentOrders = await Order.find()
    .sort({ order_date: -1 })
    .limit(5)
    // Lưu ý: User trong Order schema là ref 'User', field là 'user_id'
    .populate("user_id", "fullname email");

  return {
    stats: {
      revenueThisMonth,
      revenueTotal,
      ordersThisMonth,
      ordersTotal: await Order.countDocuments(),
      users: totalUsers,
      products: totalProducts,
    },
    chartData: monthlyRevenue,
    topProducts,
    deadStockProducts,
    recentOrders,
  };
};

module.exports = { getDashboardStats };
