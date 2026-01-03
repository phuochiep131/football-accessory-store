const orderService = require("../services/orderService");
const paymentService = require("../services/paymentService"); 
const Payment = require("../models/Payment");
const Order = require('../models/Order');
const moment = require('moment');
const crypto = require("crypto");
const querystring = require('qs');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const create = async (req, res) => {
    try {
        // 1. Tạo Order
        const order = await orderService.createOrder(req.user.id, req.body);

        // 2. Xử lý VNPAY
        if (req.body.payment_method === 'VNPAY') {
            let date = new Date();
            let createDate = moment(date).format('YYYYMMDDHHmmss');
            let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = process.env.VNP_TMNCODE;
            vnp_Params['vnp_Locale'] = 'vn';
            vnp_Params['vnp_CurrCode'] = 'VND';
            vnp_Params['vnp_TxnRef'] = order._id.toString();
            vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + order._id;
            vnp_Params['vnp_OrderType'] = 'other';
            vnp_Params['vnp_Amount'] = Math.round(order.total_amount) * 100;
            vnp_Params['vnp_ReturnUrl'] = process.env.VNP_RETURNURL;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;

            vnp_Params = sortObject(vnp_Params);

            let signData = querystring.stringify(vnp_Params, { encode: false });
            let hmac = crypto.createHmac("sha512", process.env.VNP_HASHSECRET);
            let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
            vnp_Params['vnp_SecureHash'] = signed;
            
            let paymentUrl = process.env.VNP_URL + '?' + querystring.stringify(vnp_Params, { encode: false });
            
            // Tạm thời tạo payment record trạng thái pending cho VNPAY luôn để có dữ liệu
            const vnpPayment = await paymentService.createPayment({
                order_id: order._id,
                amount: order.total_amount,
                payment_method: 'VNPAY',
                payment_status: 'pending' // Chờ thanh toán
            });
            // CẬP NHẬT LẠI ORDER
            await Order.findByIdAndUpdate(order._id, { payment_id: vnpPayment._id });

            return res.status(201).json({ paymentUrl, order });
        }

        // 3. Xử lý COD (SỬA LẠI ĐOẠN NÀY)
        if (req.body.payment_method === 'COD') {
            // Tạo Payment record
            const newPayment = await paymentService.createPayment({
                order_id: order._id,
                amount: order.total_amount,
                payment_method: 'COD',
                payment_status: 'pending'
            });

            // --- BƯỚC QUAN TRỌNG: CẬP NHẬT NGƯỢC LẠI ORDER ---
            // Nếu không có bước này, order.payment_id sẽ mãi mãi là null
            order.payment_id = newPayment._id;
            await order.save();
        }

        res.status(201).json({ message: "Đặt hàng thành công!", order });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const secretKey = process.env.VNP_HASHSECRET;
        let signData = querystring.stringify(vnp_Params, { encode: false });
        
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];
            const amount = vnp_Params['vnp_Amount'] / 100;

            if (responseCode === "00") {
                // --- THANH TOÁN THÀNH CÔNG ---
                let payment = await Payment.findOne({ order_id: orderId });
                let paymentId = null;

                if (payment) {
                    payment.payment_status = 'completed';
                    payment.amount = amount;
                    payment.payment_method = 'VNPAY';
                    await payment.save();
                    paymentId = payment._id;
                } else {
                    const newPayment = await paymentService.createPayment({
                        order_id: orderId,
                        amount: amount,
                        payment_method: 'VNPAY',
                        payment_status: 'completed'
                    });
                    paymentId = newPayment._id;
                }

                // --- QUAN TRỌNG: Đảm bảo Order luôn trỏ tới Payment này ---
                await Order.findByIdAndUpdate(orderId, { 
                    payment_id: paymentId,
                    order_status: "processing" // Cập nhật trạng thái đơn luôn
                });
                
                // Redirect về trang thành công (Frontend URL)
                return res.redirect(`http://localhost:5173/payment-success?orderId=${orderId}`);
            } else {
                 // --- THẤT BẠI ---
                 let payment = await Payment.findOne({ order_id: orderId });
                 if(payment) {
                     payment.payment_status = 'failed';
                     await payment.save();
                 }
                 await orderService.rollbackOrder(orderId);
                 
                 // Redirect về trang thất bại
                 return res.redirect(`http://localhost:5173/payment-failed`);
            }
        } else {
            return res.status(200).json({ success: false, message: "Chữ ký không hợp lệ" });
        }
    } catch (err) {
        console.error("Lỗi verify:", err);
        res.status(500).json({ error: err.message });
    }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user.id);
    res.status(200).json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAllOrders = async (req, res) => {
  try {
    // Chỉ cần find và populate đúng, dữ liệu sẽ lên
    const orders = await Order.find()
      .populate('user_id', 'fullname email phone_number')
      .populate('payment_id') // Payment Model phải đúng Schema
      .sort({ createdAt: -1 }); // Order Schema phải có timestamps: true

    res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.status(200).json({ message: "Cập nhật trạng thái thành công!", order });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

const getOrderDetail = async (req, res) => {
  try {
    const data = await orderService.getOrderById(req.params.id);
    res.status(200).json(data);
  } catch (err) { res.status(404).json({ error: err.message }); }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const order = await orderService.cancelOrder(userId, orderId);
    res.status(200).json({ message: "Hủy đơn hàng thành công!", order });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

module.exports = {
  create,
  getMyOrders,
  getAllOrders,
  updateStatus,
  getOrderDetail,
  cancelOrder,
  verifyPayment,
};