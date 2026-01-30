import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Package,
  Star,
  Send,
  CheckCircle,
  Clock,
  Truck,
  ShoppingBag,
  ChevronUp,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_BECKEND_API_URL || "http://localhost:5000/api";

// Component hiển thị quy trình đơn hàng (Stepper)
const OrderTimeline = ({ status }) => {
  const steps = [
    { key: "pending", label: "Đã đặt", icon: Clock },
    { key: "processing", label: "Đóng gói", icon: Package },
    { key: "shipping", label: "Vận chuyển", icon: Truck },
    { key: "delivered", label: "Giao thành công", icon: CheckCircle },
  ];

  // Map status to index
  let activeIndex = 0;
  if (status === "processing") activeIndex = 1;
  else if (status === "shipping") activeIndex = 2;
  else if (status === "delivered") activeIndex = 3;
  else if (status === "cancelled") activeIndex = -1; // Xử lý riêng

  if (status === "cancelled") {
    return (
      <div className="w-full bg-red-50 p-4 rounded-xl border border-red-200 text-center text-red-700 font-bold mb-6">
        ĐƠN HÀNG ĐÃ BỊ HỦY
      </div>
    );
  }

  return (
    <div className="w-full mb-8 px-2">
      <div className="flex items-center justify-between relative">
        {/* Line Background */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        {/* Active Line */}
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              className="flex flex-col items-center bg-white px-2"
            >
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive
                    ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200"
                    : "bg-white border-gray-300 text-gray-300"
                }`}
              >
                <Icon size={18} />
              </div>
              <span
                className={`text-[10px] md:text-xs font-bold mt-2 uppercase ${
                  isActive ? "text-green-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Review
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [reviewedIds, setReviewedIds] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await axios.get(`${API_BASE}/orders/detail/${id}`, {
          withCredentials: true,
        });
        setOrder(res.data.order);
        setItems(res.data.items);        
      } catch {
        toast.error("Lỗi tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  const toggleReviewForm = (productId) => {
    if (activeReviewId === productId) {
      setActiveReviewId(null);
    } else {
      setActiveReviewId(productId);
      setRating(5);
      setComment("");
    }
  };

  const handleSubmitReview = async (productId) => {
    if (!comment.trim())
      return toast.warning("Vui lòng nhập nội dung đánh giá!");

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/reviews/create`,
        { product_id: productId, order_id: order._id, rating, comment },
        { withCredentials: true }
      );
      toast.success("Đánh giá thành công!");
      setReviewedIds((prev) => [...prev, productId]);
      setActiveReviewId(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Lỗi khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải...
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Không tìm thấy đơn hàng
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <Toaster position="top-right" richColors closeButton />

      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} className="mr-2" /> Quay lại
        </button>

        {/* --- HEADER: Mã đơn & Trạng thái --- */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl font-black text-gray-900">
                ĐƠN HÀNG #{order._id.slice(-6).toUpperCase()}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Ngày đặt:{" "}
                {new Date(order.order_date || order.createdAt).toLocaleString(
                  "vi-VN"
                )}
              </p>
            </div>
            <div className="mt-2 md:mt-0 text-right">
              <span className="text-sm text-gray-500 block">
                Tổng thanh toán
              </span>
              <span className="text-2xl font-black text-green-600">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>

          {/* TIMELINE */}
          <OrderTimeline status={order.order_status} />
        </div>

        {/* --- LIST ITEM --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <ShoppingBag size={18} className="text-gray-700" />
            <span className="font-bold text-gray-700">
              Sản phẩm ({items.length})
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const productId = item.product_id._id;
              const isReviewed = reviewedIds.includes(productId);
              const isFormOpen = activeReviewId === productId;

              return (
                <div key={item._id} className="transition-all">
                  <div
                    className={`p-4 flex flex-col sm:flex-row gap-4 items-start ${
                      isFormOpen ? "bg-blue-50/20" : ""
                    }`}
                  >
                    {/* Ảnh sản phẩm */}
                    <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0">
                      <img
                        src={item.product_id.image_url}
                        alt={item.product_id.product_name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    {/* Thông tin sản phẩm */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">
                        {item.product_id.product_name}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                          Size: {item.size}
                        </span>
                        <span>x{item.quantity}</span>
                      </div>
                      <p className="text-blue-600 font-bold">
                        {formatCurrency(item.unit_price)}
                      </p>
                    </div>

                    {/* Nút đánh giá */}
                    {order.order_status === "delivered" && (
                      <div className="mt-2 sm:mt-0 w-full sm:w-auto">
                        {isReviewed ? (
                          <button
                            disabled
                            className="w-full sm:w-auto px-4 py-2 bg-gray-50 text-green-600 rounded-lg flex items-center justify-center gap-2 text-xs font-bold border border-green-100"
                          >
                            <CheckCircle size={14} /> Đã đánh giá
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleReviewForm(productId)}
                            className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                              isFormOpen
                                ? "bg-gray-800 text-white border-gray-800"
                                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {isFormOpen ? (
                              <>
                                Đóng <ChevronUp size={14} />
                              </>
                            ) : (
                              <>
                                <Star size={14} /> Viết đánh giá
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Form đánh giá */}
                  {isFormOpen && (
                    <div className="px-4 pb-6 pt-2 bg-blue-50/20 animate-in fade-in slide-in-from-top-2">
                      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm max-w-2xl mx-auto">
                        <h4 className="text-sm font-bold text-gray-800 mb-4 text-center uppercase">
                          Đánh giá sản phẩm này
                        </h4>
                        <div className="flex justify-center gap-2 mb-4">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              onClick={() => setRating(s)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                size={32}
                                fill={s <= rating ? "#FACC15" : "none"}
                                className={
                                  s <= rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }
                              />
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
                            placeholder="Chia sẻ cảm nhận của bạn..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                          <button
                            onClick={() => handleSubmitReview(productId)}
                            disabled={submitting}
                            className="bg-black text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-70"
                          >
                            {submitting ? "Gửi..." : <Send size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- INFO GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <MapPin size={18} /> Địa chỉ nhận hàng
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <span className="font-bold text-gray-800">Người nhận:</span>{" "}
                {order.fullname}
              </p>
              <p>
                <span className="font-bold text-gray-800">Số điện thoại:</span>{" "}
                {order.phone_number}
              </p>
              <p>
                <span className="font-bold text-gray-800">Địa chỉ:</span>{" "}
                {order.shipping_address}
              </p>
              {order.note && (
                <p className="italic bg-gray-50 p-2 rounded text-gray-500 mt-2">
                  " {order.note} "
                </p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <CreditCard size={18} /> Thanh toán
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Phương thức</span>
                <span className="font-bold text-gray-800">
                  {order.payment_method === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : order.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tiền hàng</span>
                <span className="font-medium">
                  {formatCurrency(
                    order.total_amount - (order.shipping_fee || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span className="font-medium text-green-600">
                  {order.shipping_fee > 0
                    ? formatCurrency(order.shipping_fee)
                    : "Miễn phí"}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center mt-2">
                <span className="font-bold text-gray-900 text-base">
                  Tổng cộng
                </span>
                <span className="font-black text-xl text-green-600">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
