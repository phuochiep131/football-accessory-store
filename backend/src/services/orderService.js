const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

async function createOrder(userId, orderData) {
  const { 
    shipping_address, 
    note, 
    fullname, 
    phone_number, 
    payment_method 
  } = orderData;

  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) throw new Error("Không tìm thấy giỏ hàng");

  const cartItems = await CartItem.find({ cart_id: cart._id }).populate("product_id");
  if (cartItems.length === 0) throw new Error("Giỏ hàng trống, không thể đặt hàng");

  let merchandiseSubtotal = 0;
  const processedItems = [];

  for (const item of cartItems) {
    const product = item.product_id;

    if (product.quantity < item.quantity) {
      throw new Error(`Sản phẩm "${product.product_name}" không đủ số lượng tồn kho.`);
    }

    let originalPrice = product.price;
    let discount = product.discount || 0;
    let finalPrice = originalPrice * (1 - discount / 100);

    merchandiseSubtotal += finalPrice * item.quantity;

    processedItems.push({
      product_id: product._id,
      quantity: item.quantity,
      unit_price: finalPrice, 
      subtotal: finalPrice * item.quantity
    });
  }

  const shipping_fee = merchandiseSubtotal > 5000000 ? 0 : 30000;
  
  const total_amount = merchandiseSubtotal + shipping_fee;

  const newOrder = new Order({
    user_id: userId,
    fullname: fullname,           
    phone_number: phone_number,  
    shipping_address: shipping_address,
    payment_method: payment_method || 'COD',
    shipping_fee: shipping_fee, 
    total_amount: total_amount,  
    note: note,
    order_status: "pending",   
    payment_status: "pending"   
  });

  await newOrder.save();

  for (const item of processedItems) {
    const orderDetail = new OrderDetail({
      order_id: newOrder._id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    });
    await orderDetail.save();

    await Product.findByIdAndUpdate(item.product_id, {
      $inc: { quantity: -item.quantity },
    });
  }

  await CartItem.deleteMany({ cart_id: cart._id });

  return newOrder;
}

async function rollbackOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order || order.order_status === "cancelled") return;

  order.order_status = "cancelled";
  order.payment_status = "failed"; 
  await order.save();

  const items = await OrderDetail.find({ order_id: orderId });
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product_id, {
      $inc: { quantity: item.quantity },
    });
  }
}

async function getOrdersByUser(userId) {
  return await Order.find({ user_id: userId }).sort({ createdAt: -1 });
}

async function getAllOrders() {
  return await Order.find()
    .populate("user_id", "fullname email")
    .sort({ createdAt: -1 });
}

async function updateOrderStatus(orderId, status) {
  const allowedStatus = ["pending", "processing", "shipping", "delivered", "cancelled"];
  if (!allowedStatus.includes(status)) throw new Error("Trạng thái không hợp lệ");

  return await Order.findByIdAndUpdate(orderId, { order_status: status }, { new: true });
}

async function getOrderById(orderId) {
  const order = await Order.findById(orderId).populate("user_id", "fullname email phone_number");
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  
  const items = await OrderDetail.find({ order_id: orderId }).populate("product_id");
  
  return { order, items };
}

async function cancelOrder(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) throw new Error("Không tìm thấy đơn hàng.");
  
  if (order.order_status !== "pending") throw new Error("Không thể hủy đơn này vì đã được xử lý.");

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
  rollbackOrder,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  cancelOrder,
};