import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ShoppingBag, Calendar, Loader2, PlusCircle, AlertCircle, User, Phone,
  Wallet, QrCode // <--- Thêm icon Wallet và QrCode
} from "lucide-react";
import { toast } from "sonner"; 

const API_URL = "http://localhost:5000/api";

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // --- 1. FETCH DỮ LIỆU ---
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/admin/all`, { withCredentials: true });
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      toast.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ... (Giữ nguyên các hàm handleOrderStatusChange, handleCreatePayment...)
  // Để gọn code mình ẩn bớt, bạn giữ nguyên logic cũ nhé
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
        await axios.put(`${API_URL}/orders/admin/status/${orderId}`, { status: newStatus }, { withCredentials: true });
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, order_status: newStatus } : o));
        toast.success(`Cập nhật: ${newStatus}`);
    } catch{ toast.error("Lỗi cập nhật"); }
  };

  const handlePaymentStatusChange = async (paymentId, newStatus, orderId) => {
    setProcessingId(orderId);
    try {
      await axios.put(`${API_URL}/payments/status/${paymentId}`, { status: newStatus }, { withCredentials: true });
      setOrders((prev) => prev.map((order) => {
          if (order._id === orderId && order.payment_id) {
             return { ...order, payment_id: { ...order.payment_id, payment_status: newStatus } };
          }
          return order;
      }));
      toast.success("Đã cập nhật thanh toán!");
    } catch { toast.error("Lỗi cập nhật"); } 
    finally { setProcessingId(null); }
  };

  const handleCreatePayment = async (order) => {
      // (Giữ nguyên logic cũ của bạn)
      if(!window.confirm("Tạo record thanh toán?")) return;
      setProcessingId(order._id);
      try {
          const res = await axios.post(`${API_URL}/payments/create`, {
              order_id: order._id, amount: order.total_amount,
              payment_method: order.payment_method || 'COD', payment_status: 'pending'
          }, { withCredentials: true });
          setOrders((prev) => prev.map((o) => o._id === order._id ? { ...o, payment_id: res.data.payment } : o));
          toast.success("Đã tạo!");
      } catch { toast.error("Lỗi tạo"); } finally { setProcessingId(null); }
  };

  // --- HELPER MỚI: HIỂN THỊ PHƯƠNG THỨC THANH TOÁN ---
  const PaymentMethodBadge = ({ method }) => {
    const isVNPAY = method === 'VNPAY';
    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold w-fit mb-2 ${
            isVNPAY 
            ? "bg-blue-50 text-blue-700 border-blue-200" 
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}>
            {isVNPAY ? <QrCode size={14} /> : <Wallet size={14} />}
            {isVNPAY ? "VNPAY QR" : "TIỀN MẶT (COD)"}
        </div>
    );
  };

  // --- HELPER CŨ ---
  const getStatusColor = (s) => ({
      pending: "bg-yellow-100 text-yellow-800", processing: "bg-blue-100 text-blue-800",
      shipping: "bg-purple-100 text-purple-800", delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
  }[s] || "bg-gray-100");

  const getPaymentColor = (s) => ({
      completed: "text-green-700 bg-green-50 border-green-200 ring-green-500",
      pending: "text-orange-600 bg-orange-50 border-orange-200 ring-orange-400", // Pending màu cam cho nổi
      failed: "text-red-700 bg-red-50 border-red-200 ring-red-500"
  }[s] || "text-gray-600");

  const formatCurrency = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN") + " " + new Date(d).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'});

  if (loading) return <div className="min-h-screen flex justify-center items-center text-blue-600"><Loader2 className="animate-spin mr-2"/> Đang tải...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><ShoppingBag className="text-blue-600" /> Quản lý Đơn hàng</h2>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">Tổng đơn: {orders.length}</div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left bg-white">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th className="py-4 px-4 border-b w-24">Mã đơn</th>
              <th className="py-4 px-4 border-b">Khách hàng</th>
              <th className="py-4 px-4 border-b text-right">Tổng tiền</th>
              <th className="py-4 px-4 border-b text-center">Trạng thái</th>
              <th className="py-4 px-4 border-b w-64">Thanh toán</th> 
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600 divide-y divide-gray-100">
            {orders.map((order) => {
              const paymentInfo = order.payment_id; 
              const hasPaymentRecord = paymentInfo && typeof paymentInfo === 'object' && (paymentInfo._id || paymentInfo.payment_status);
              const isProcessing = processingId === order._id;

              // Lấy phương thức thanh toán: Ưu tiên trong Payment record, nếu không có thì lấy trong Order
              const paymentMethod = hasPaymentRecord ? paymentInfo.payment_method : (order.payment_method || 'COD');

              return (
                <tr key={order._id} className="hover:bg-blue-50/30">
                  <td className="py-4 px-4 font-mono text-xs text-blue-600 font-bold align-top">#{order._id.slice(-6).toUpperCase()}</td>
                  
                  <td className="py-4 px-4 align-top">
                    <div className="font-bold text-gray-900 flex items-center gap-1"><User size={14}/> {order.user_id?.fullname || "Khách lạ"}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Phone size={12}/> {order.phone_number || "--"}</div>
                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Calendar size={10}/> {formatDate(order.createdAt || order.order_date)}</div>
                  </td>

                  <td className="py-4 px-4 text-right font-bold text-gray-900 align-top">{formatCurrency(order.total_amount)}</td>
                  
                  <td className="py-4 px-4 text-center align-top">
                        <select
                            className={`text-center py-1 px-2 rounded-full text-xs font-bold border cursor-pointer outline-none ${getStatusColor(order.order_status)}`}
                            value={order.order_status}
                            onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                        >
                            <option value="pending">Chờ xử lý</option>
                            <option value="processing">Đang đóng gói</option>
                            <option value="shipping">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                  </td>

                  <td className="py-4 px-4 align-top bg-gray-50/50">
                    <div className="flex flex-col">
                        {/* --- PHẦN MỚI: HIỂN THỊ BADGE RÕ RÀNG --- */}
                        <PaymentMethodBadge method={paymentMethod} />
                        
                        {hasPaymentRecord ? (
                            <div className="relative w-full">
                                {isProcessing && <div className="absolute inset-0 bg-white/80 z-10 flex justify-center items-center"><Loader2 className="animate-spin w-4 h-4 text-blue-600"/></div>}
                                <select
                                    className={`w-full border rounded-md px-2 py-1.5 text-xs font-bold outline-none cursor-pointer focus:ring-2 ${getPaymentColor(paymentInfo.payment_status)}`}
                                    value={paymentInfo.payment_status}
                                    onChange={(e) => handlePaymentStatusChange(paymentInfo._id, e.target.value, order._id)}
                                >
                                    <option value="pending">⏳ Chờ thanh toán</option>
                                    <option value="completed">✅ Đã thanh toán</option>
                                    <option value="failed">❌ Thất bại</option>
                                </select>
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleCreatePayment(order)} disabled={isProcessing}
                                className="flex justify-center items-center gap-1 w-full border border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                            >
                                {isProcessing ? <Loader2 className="animate-spin w-3 h-3"/> : <PlusCircle size={14} />} Tạo Record
                            </button>
                        )}
                        {!hasPaymentRecord && <div className="flex items-center gap-1 text-[10px] text-orange-500 italic mt-1"><AlertCircle size={10}/> Thiếu dữ liệu</div>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManager;