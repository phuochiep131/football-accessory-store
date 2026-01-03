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
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE QUẢN LÝ ĐÁNH GIÁ ---
  const [activeReviewId, setActiveReviewId] = useState(null); // ID sản phẩm đang mở form
  const [reviewedIds, setReviewedIds] = useState([]); // Danh sách ID các sản phẩm đã đánh giá thành công trong phiên này
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

        // Gợi ý: Nếu backend của bạn có trả về trường 'is_reviewed' trong items,
        // bạn có thể setReviewedIds ngay tại đây để hiển thị đúng trạng thái kể cả khi f5 trang.
        // Ví dụ: setReviewedIds(res.data.items.filter(i => i.is_reviewed).map(i => i.product_id._id));
      } catch (err) {
        toast.error("Lỗi tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  // --- XỬ LÝ UI FORM ---
  const toggleReviewForm = (productId) => {
    if (activeReviewId === productId) {
      // Nếu đang mở form của sản phẩm này thì đóng lại
      setActiveReviewId(null);
    } else {
      // Mở form mới -> Reset dữ liệu nhập
      setActiveReviewId(productId);
      setRating(5);
      setComment("");
    }
  };

  // --- GỬI ĐÁNH GIÁ ---
  const handleSubmitReview = async (productId) => {
    if (!comment.trim())
      return toast.warning("Vui lòng nhập nội dung đánh giá!");

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/reviews/create`,
        {
          product_id: productId,
          order_id: order._id,
          rating,
          comment,
        },
        { withCredentials: true }
      );

      toast.success("Đánh giá thành công!");

      // 1. Thêm ID sản phẩm vào danh sách đã đánh giá để đổi giao diện nút
      setReviewedIds((prev) => [...prev, productId]);

      // 2. Đóng form
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
        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách
        </button>

        {/* --- DANH SÁCH SẢN PHẨM --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Package size={18} /> Sản phẩm ({items.length})
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                order.order_status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.order_status === "delivered"
                ? "Đã giao hàng"
                : order.order_status}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const productId = item.product_id._id;
              // Kiểm tra xem sản phẩm này đã được đánh giá chưa (trong phiên này)
              const isReviewed = reviewedIds.includes(productId);
              // Kiểm tra xem có đang mở form cho sản phẩm này không
              const isFormOpen = activeReviewId === productId;

              return (
                <div key={item._id} className="flex flex-col transition-all">
                  {/* Product Row */}
                  <div
                    className={`p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${
                      isFormOpen ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <img
                      src={item.product_id.image_url}
                      alt={item.product_id.product_name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 line-clamp-1">
                        {item.product_id.product_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Số lượng: x{item.quantity}
                      </p>
                      <p className="text-blue-600 font-bold mt-1">
                        {formatCurrency(item.unit_price)}
                      </p>
                    </div>

                    {/* ACTION BUTTON */}
                    {order.order_status === "delivered" && (
                      <div className="mt-2 sm:mt-0 self-end sm:self-center w-full sm:w-auto">
                        {isReviewed ? (
                          <button
                            disabled
                            className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center gap-2 text-sm font-bold cursor-not-allowed border border-gray-200"
                          >
                            <CheckCircle size={16} /> Đã đánh giá
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleReviewForm(productId)}
                            className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-bold border ${
                              isFormOpen
                                ? "bg-gray-200 text-gray-700 border-gray-300"
                                : "bg-white text-yellow-600 border-yellow-400 hover:bg-yellow-50"
                            }`}
                          >
                            {isFormOpen ? (
                              <>
                                {" "}
                                Đóng <ChevronUp size={16} />{" "}
                              </>
                            ) : (
                              <>
                                {" "}
                                <Star size={16} /> Viết đánh giá{" "}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* --- INLINE REVIEW FORM --- */}
                  {isFormOpen && (
                    <div className="px-4 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 bg-blue-50/30">
                      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative">
                        {/* Mũi tên chỉ lên trang trí */}
                        <div className="absolute -top-2 right-10 sm:right-16 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>

                        <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                          <Star
                            size={16}
                            className="text-yellow-500 fill-current"
                          />
                          Đánh giá sản phẩm này
                        </h4>

                        {/* Chọn sao */}
                        <div className="flex items-center gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              onClick={() => setRating(s)}
                              className="transition-transform hover:scale-110 focus:outline-none p-1"
                            >
                              <Star
                                size={28}
                                fill={s <= rating ? "#FACC15" : "none"}
                                className={
                                  s <= rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }
                              />
                            </button>
                          ))}
                          <span className="ml-3 text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            {rating === 5
                              ? "Tuyệt vời"
                              : rating === 4
                              ? "Hài lòng"
                              : rating === 3
                              ? "Bình thường"
                              : rating === 2
                              ? "Không hài lòng"
                              : "Tệ"}
                          </span>
                        </div>

                        {/* Nhập nội dung & Nút gửi */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <textarea
                            className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                            rows="2"
                            placeholder="Chất lượng sản phẩm thế nào? Bạn có hài lòng không?..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          ></textarea>
                          <button
                            onClick={() => handleSubmitReview(productId)}
                            disabled={submitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-70 flex sm:flex-col items-center justify-center gap-2 sm:min-w-[100px] transition-colors h-auto sm:h-auto min-h-[44px]"
                          >
                            {submitting ? (
                              <span className="text-xs">Gửi...</span>
                            ) : (
                              <>
                                <Send size={18} />
                                <span className="text-xs uppercase">Gửi</span>
                              </>
                            )}
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

        {/* --- THÔNG TIN ĐƠN HÀNG (GIỮ NGUYÊN) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" /> Địa chỉ nhận hàng
            </h4>
            <p className="text-gray-600 font-medium">
              {order.shipping_address}
            </p>
            <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
              Note:{" "}
              <span className="italic">{order.note || "Không có ghi chú"}</span>
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" /> Thanh toán
            </h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 text-sm">Tổng tiền hàng</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 text-sm">Phí vận chuyển</span>
              <span className="font-medium text-green-600">Miễn phí</span>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="font-bold text-gray-800">Thành tiền</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
