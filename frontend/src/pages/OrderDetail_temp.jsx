import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CreditCard,
  User,
  Phone,
  Package,
  Star,
  X,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE REVIEW MODAL ---
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedItemToReview, setSelectedItemToReview] = useState(null);
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
      } catch (err) {
        toast.error("Lỗi tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  // --- MỞ MODAL ĐÁNH GIÁ ---
  const openReviewModal = (item) => {
    setSelectedItemToReview(item);
    setRating(5);
    setComment("");
    setIsReviewModalOpen(true);
  };

  // --- GỬI ĐÁNH GIÁ ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.warning("Vui lòng nhập nội dung!");

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/reviews/create`,
        {
          product_id: selectedItemToReview.product_id._id,
          order_id: order._id, // Quan trọng: Gửi kèm Order ID
          rating,
          comment,
        },
        { withCredentials: true }
      );

      toast.success("Đánh giá thành công!");
      setIsReviewModalOpen(false);
      // Có thể thêm logic disable nút đánh giá sau khi thành công nếu muốn (cần reload lại data)
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

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Không tìm thấy đơn hàng</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <Toaster position="top-right" richColors closeButton />

      <div className="max-w-4xl mx-auto px-4">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách
        </button>

        {/* --- DANH SÁCH SẢN PHẨM --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Package size={18} /> Sản phẩm ({items.length})
            </h3>
            {/* Hiển thị trạng thái đơn hàng */}
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
            {items.map((item) => (
              <div
                key={item._id}
                className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
              >
                <img
                  src={item.product_id.image_url}
                  alt={item.product_id.product_name}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {item.product_id.product_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Số lượng: x{item.quantity}
                  </p>
                  <p className="text-blue-600 font-bold mt-1">
                    {formatCurrency(item.unit_price)}
                  </p>
                </div>

                {/* NÚT ĐÁNH GIÁ (Chỉ hiện khi đã giao hàng) */}
                {order.order_status === "delivered" && (
                  <button
                    onClick={() => openReviewModal(item)}
                    className="px-4 py-2 border border-yellow-400 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors flex items-center gap-2 text-sm font-bold"
                  >
                    <Star size={16} /> Viết đánh giá
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- CÁC THÔNG TIN KHÁC (Giữ nguyên code cũ của bạn) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thông tin người nhận */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} /> Địa chỉ nhận hàng
            </h4>
            <p className="text-gray-600">{order.shipping_address}</p>
            <p className="text-gray-500 text-sm mt-2">
              Ghi chú: {order.note || "Không có"}
            </p>
          </div>
          {/* Thông tin thanh toán */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} /> Tổng thanh toán
            </h4>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(order.total_amount)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Đã bao gồm phí vận chuyển
            </p>
          </div>
        </div>
      </div>

      {/* --- MODAL VIẾT ĐÁNH GIÁ --- */}
      {isReviewModalOpen && selectedItemToReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Đánh giá sản phẩm
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-3 mb-6 bg-gray-50 p-3 rounded-lg">
              <img
                src={selectedItemToReview.product_id.image_url}
                className="w-12 h-12 rounded object-cover"
                alt=""
              />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedItemToReview.product_id.product_name}
                </p>
                <p className="text-xs text-gray-500">
                  Chất lượng sản phẩm thế nào?
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitReview}>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      fill={s <= rating ? "#FACC15" : "none"}
                      className={
                        s <= rating ? "text-yellow-400" : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
              <div className="text-center mb-4 text-sm font-medium text-yellow-600">
                {rating === 5
                  ? "Cực kỳ hài lòng!"
                  : rating === 4
                  ? "Hài lòng"
                  : rating === 3
                  ? "Bình thường"
                  : "Không hài lòng"}
              </div>

              <textarea
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-4"
                rows="4"
                placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-70"
              >
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
