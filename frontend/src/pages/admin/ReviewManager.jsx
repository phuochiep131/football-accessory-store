import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Star, Eye, EyeOff, Trash2, MessageSquare } from "lucide-react";

const API_URL = "http://localhost:5000/api/reviews";

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch Data ---
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/all`, {
        withCredentials: true,
      });
      setReviews(res.data);
    } catch (error) {
      toast.error("Lỗi tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // --- 2. Toggle Hide/Show ---
  const toggleVisibility = async (id) => {
    try {
      await axios.put(
        `${API_URL}/admin/toggle/${id}`,
        {},
        { withCredentials: true }
      );
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, is_hidden: !r.is_hidden } : r))
      );
      toast.success("Đã cập nhật trạng thái");
    } catch (error) {
      toast.error("Lỗi cập nhật");
    }
  };

  // --- 3. Delete ---
  const deleteReview = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa vĩnh viễn đánh giá này?"))
      return;
    try {
      await axios.delete(`${API_URL}/admin/${id}`, { withCredentials: true });
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("Đã xóa đánh giá");
    } catch (error) {
      toast.error("Lỗi xóa");
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <Toaster position="top-right" richColors closeButton />

      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Đánh giá</h2>
        <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full font-bold">
          {reviews.length}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
            <tr>
              <th className="py-4 px-6">Sản phẩm</th>
              <th className="py-4 px-6">Người dùng</th>
              <th className="py-4 px-6">Đánh giá</th>
              <th className="py-4 px-6">Nội dung</th>
              <th className="py-4 px-6">Ngày</th>
              <th className="py-4 px-6 text-center">Trạng thái</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {reviews.map((rv) => (
              <tr
                key={rv._id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-6 max-w-[200px]">
                  <div className="flex items-center gap-3">
                    <img
                      src={rv.product_id?.image_url}
                      alt=""
                      className="w-10 h-10 object-cover rounded bg-gray-100"
                    />
                    <span className="font-medium text-gray-800 line-clamp-2">
                      {rv.product_id?.product_name || "SP đã xóa"}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="font-bold text-gray-800">
                    {rv.user_id?.fullname}
                  </p>
                  <p className="text-xs text-gray-400">{rv.user_id?.email}</p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < rv.rating ? "currentColor" : "none"}
                        className={i >= rv.rating ? "text-gray-300" : ""}
                      />
                    ))}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="line-clamp-2 max-w-[250px]" title={rv.comment}>
                    {rv.comment}
                  </p>
                </td>
                <td className="py-4 px-6 text-xs">
                  {new Date(rv.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="py-4 px-6 text-center">
                  {rv.is_hidden ? (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                      Đã ẩn
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">
                      Hiển thị
                    </span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => toggleVisibility(rv._id)}
                      className={`p-2 rounded-lg border transition-colors ${
                        rv.is_hidden
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                      title={rv.is_hidden ? "Hiện lại" : "Ẩn đi"}
                    >
                      {rv.is_hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => deleteReview(rv._id)}
                      className="p-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Xóa vĩnh viễn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewManager;
