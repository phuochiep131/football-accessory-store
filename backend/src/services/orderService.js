const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

// Tạo đơn hàng mới từ giỏ hàng
async function createOrder(userId, orderData) {
  const { shipping_address, note } = orderData;
  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) throw new Error("Không tìm thấy giỏ hàng");

  const cartItems = await CartItem.find({ cart_id: cart._id }).populate(
    "product_id"
  );
  if (cartItems.length === 0)
    throw new Error("Giỏ hàng trống, không thể đặt hàng");

  let total_amount = 0;

  for (const item of cartItems) {
    if (item.product_id.quantity < item.quantity) {
      throw new Error(
        `Sản phẩm "${item.product_id.product_name}" không đủ số lượng tồn kho.`
      );
    }
    total_amount += item.quantity * item.price_at_time;
  }

  const newOrder = new Order({
    user_id: userId,
    total_amount,
    shipping_address,
    note,
  });
  await newOrder.save();

  for (const item of cartItems) {
    const orderDetail = new OrderDetail({
      order_id: newOrder._id,
      product_id: item.product_id._id,
      quantity: item.quantity,
      unit_price: item.price_at_time,
      subtotal: item.quantity * item.price_at_time,
    });
    await orderDetail.save();

    await Product.findByIdAndUpdate(item.product_id._id, {
      $inc: { quantity: -item.quantity },
    });
  }

  await CartItem.deleteMany({ cart_id: cart._id });

  return newOrder;
}

// --- HÀM MỚI: HOÀN TÁC KHI THANH TOÁN THẤT BẠI ---
async function rollbackOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order || order.order_status === "cancelled") return;

  // 1. Cập nhật trạng thái thành đã hủy
  order.order_status = "cancelled";
  await order.save();

  // 2. Tìm chi tiết đơn hàng để cộng lại tồn kho
  const items = await OrderDetail.find({ order_id: orderId });
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product_id, {
      $inc: { quantity: item.quantity },
    });
  }
}

// Các hàm khác giữ nguyên
async function getOrdersByUser(userId) {
  return await Order.find({ user_id: userId }).sort({ order_date: -1 });
}

async function getAllOrders() {
  return await Order.find()
    .populate("user_id", "fullname email")
    .sort({ order_date: -1 });
}

async function updateOrderStatus(orderId, status) {
  const allowedStatus = ["pending", "processing", "shipping", "delivered", "cancelled"];
  if (!allowedStatus.includes(status)) throw new Error("Trạng thái không hợp lệ");

  return await Order.findByIdAndUpdate(orderId, { order_status: status }, { new: true });
}

async function getOrderById(orderId) {
  const order = await Order.findById(orderId).populate("user_id", "fullname email phone");
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  const items = await OrderDetail.find({ order_id: orderId }).populate("product_id");
  return { order, items };
}

async function cancelOrder(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) throw new Error("Không tìm thấy đơn hàng.");
  if (order.order_status !== "pending") throw new Error("Không thể hủy đơn này.");

  order.order_status = "cancelled";
  await order.save();

  const orderDetails = await OrderDetail.find({ order_id: order._id });
  for (const item of orderDetails) {
    await Product.findByIdAndUpdate(item.product_id, { $inc: { quantity: item.quantity } });
  }
  return order;
}

module.exports = {
  createOrder,
  rollbackOrder, // Export thêm hàm rollback
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  cancelOrder,
};