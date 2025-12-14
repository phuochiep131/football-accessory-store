import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ShoppingBag,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/admin/all`, {
        withCredentials: true,
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- UPDATE STATUS ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/orders/admin/status/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      // Cập nhật UI
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, order_status: newStatus } : o
        )
      );
      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      alert("Lỗi cập nhật: " + error.response?.data?.error);
    }
  };

  // Helper: Màu sắc trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipping":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN") +
    " " +
    new Date(dateString).toLocaleTimeString("vi-VN");

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="text-blue-600" /> Quản lý Đơn hàng
        </h2>
        <span className="text-gray-500">Tổng số: {orders.length} đơn</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 uppercase text-xs font-bold border-b border-gray-200">
              <th className="py-4 px-4">Mã đơn</th>
              <th className="py-4 px-4">Khách hàng</th>
              <th className="py-4 px-4">Ngày đặt</th>
              <th className="py-4 px-4">Tổng tiền</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
              >
                <td className="py-4 px-4 font-mono text-xs text-blue-600 font-bold">
                  #{order._id.slice(-6).toUpperCase()}
                </td>
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">
                    {order.user_id?.fullname || "Guest"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {order.user_id?.email}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} /> {formatDate(order.order_date)}
                  </div>
                </td>
                <td className="py-4 px-4 font-bold text-gray-900">
                  {formatCurrency(order.total_amount)}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                      order.order_status
                    )}`}
                  >
                    {order.order_status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    value={order.order_status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang đóng gói</option>
                    <option value="shipping">Đang giao</option>
                    <option value="delivered">Đã giao</option>
                    <option value="cancelled">Hủy đơn</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500">
            Chưa có đơn hàng nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManager;
