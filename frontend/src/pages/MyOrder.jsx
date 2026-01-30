import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Calendar,
  MapPin,
  ChevronRight,
  Loader2,
  ShoppingBag,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_BECKEND_API_URL || "http://localhost:5000/api";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE}/orders/my-orders`, {
          withCredentials: true,
        });
        setOrders(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      await axios.put(
        `${API_BASE}/orders/cancel/${orderId}`,
        {},
        { withCredentials: true }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, order_status: "cancelled" }
            : order
        )
      );
    } catch (error) {
      alert(error.response?.data?.error || "Lỗi khi hủy đơn hàng");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getOrderStatusInfo = (status) => {
    const map = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: Clock,
      },
      processing: {
        label: "Đang đóng gói",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Package,
      },
      shipping: {
        label: "Đang giao hàng",
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Truck,
      },
      delivered: {
        label: "Giao thành công",
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle2,
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      },
    };
    return (
      map[status] || {
        label: status,
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: Package,
      }
    );
  };

  const getPaymentStatusInfo = (status) => {
    const map = {
      pending: {
        label: "Chờ thanh toán",
        color: "text-yellow-600 bg-yellow-50",
      },
      completed: {
        label: "Đã thanh toán",
        color: "text-green-600 bg-green-50",
      },
      failed: { label: "Thanh toán thất bại", color: "text-red-600 bg-red-50" },
    };
    return (
      map[status] || {
        label: "Chưa cập nhật",
        color: "text-gray-500 bg-gray-50",
      }
    );
  };

  const getPaymentMethodText = (method) => {
    if (!method) return "Chưa chọn";
    const upper = method.toUpperCase();
    if (upper === "COD") return "Thanh toán khi nhận hàng (COD)";
    if (upper === "VNPAY") return "Ví VNPAY / Ngân hàng";
    return method;
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.order_status === filterStatus);

  const filterTabs = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xử lý" },
    { key: "processing", label: "Đang đóng gói" },
    { key: "shipping", label: "Đang giao" },
    { key: "delivered", label: "Hoàn thành" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* Left Side: Title */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-2 whitespace-nowrap">
              <Package className="text-green-600" size={28} /> Lịch sử đơn hàng
            </h1>
            {/* Ẩn mô tả trên mobile để tiết kiệm diện tích, hiện trên PC */}
            <p className="hidden md:block text-gray-500 text-sm mt-1">
              Quản lý trạng thái đơn hàng
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm w-full lg:w-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`
                  flex-auto lg:flex-none text-center
                  px-3 py-2 rounded-xl text-[11px] md:text-xs font-black uppercase tracking-tight
                  transition-all duration-200 cursor-pointer whitespace-nowrap
                  
                  ${
                    filterStatus === tab.key
                      ? "bg-green-600 text-white shadow-md shadow-green-100"
                      : "text-gray-500 hover:bg-gray-50 hover:text-green-700"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const statusInfo = getOrderStatusInfo(order.order_status);
              const StatusIcon = statusInfo.icon;
              const paymentStatus =
                order.payment_id?.payment_status || "pending";
              const paymentMethod =
                order.payment_id?.payment_method ||
                order.payment_method ||
                "COD";
              const paymentInfo = getPaymentStatusInfo(paymentStatus);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gray-50/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-green-700 font-bold text-sm shadow-sm">
                        #{order._id.slice(-4).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          <Calendar size={12} />
                          {formatDate(order.order_date || order.createdAt)}
                        </div>
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
                        >
                          <StatusIcon size={14} />
                          {statusInfo.label}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1 font-medium">
                        Tổng thanh toán
                      </div>
                      <div className="text-xl font-black text-green-600">
                        {formatCurrency(order.total_amount)}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-gray-100 rounded-full text-gray-500">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            Địa chỉ nhận hàng
                          </p>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {order.shipping_address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 p-2 rounded-full ${
                            paymentMethod === "COD"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-purple-50 text-purple-600"
                          }`}
                        >
                          {paymentMethod === "COD" ? (
                            <Banknote size={18} />
                          ) : (
                            <CreditCard size={18} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">
                            Thông tin thanh toán
                          </p>
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="text-sm text-gray-600">
                              {getPaymentMethodText(paymentMethod)}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded w-fit ${paymentInfo.color}`}
                            >
                              {paymentInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    {order.order_status === "pending" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                      >
                        Hủy đơn
                      </button>
                    )}

                    <Link
                      to={`/order/${order._id}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200"
                    >
                      Chi tiết đơn hàng <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="text-gray-300" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Không tìm thấy đơn hàng
              </h3>
              <p className="text-gray-500 mb-8 text-center max-w-md">
                {filterStatus === "all"
                  ? "Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!"
                  : `Bạn không có đơn hàng nào ở trạng thái "${
                      getOrderStatusInfo(filterStatus).label
                    }".`}
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold shadow-lg shadow-green-200 transform hover:-translate-y-1"
              >
                Mua sắm ngay <ChevronRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
