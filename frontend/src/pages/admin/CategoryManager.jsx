import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FolderTree,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Save,
  X,
  Loader2,
  RefreshCcw,
  UploadCloud,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/categories";
const CLOUD_NAME = "detransaw";
const UPLOAD_PRESET = "web_upload";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image Upload States
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  // --- FIX LỖI REACT: Khởi tạo giá trị mặc định là chuỗi rỗng "", KHÔNG ĐƯỢC để null/undefined ---
  const initialFormState = {
    name: "",
    description: "",
    image: "", // Quan trọng: Phải là chuỗi rỗng
    is_active: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- 1. FETCH DATA ---
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      toast.error("Không thể kết nối đến Server!");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- 2. UPLOAD HANDLERS ---
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB");
        return;
      }
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview("");
    // Khi xóa ảnh, set về chuỗi rỗng để tránh lỗi uncontrolled
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );
      return res.data.secure_url;
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      throw new Error("Lỗi khi upload ảnh lên Cloudinary");
    }
  };

  // --- 3. FORM HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setSelectedImageFile(null);
    setImagePreview("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat._id);

    // --- FIX LỖI REACT: Fallback về "" nếu dữ liệu DB là null ---
    setFormData({
      name: cat.name || "",
      description: cat.description || "",
      image: cat.image || "",
      is_active: cat.is_active ?? true, // Nếu null thì mặc định true
    });

    setImagePreview(cat.image || "");
    setSelectedImageFile(null);
    setIsModalOpen(true);
  };

  // --- 4. SAVE (CREATE / UPDATE) ---
  const handleSave = async (e) => {
    e.preventDefault();

    // Validate cơ bản để tránh lỗi 400 từ Backend
    if (!formData.name.trim()) {
      toast.error("Tên danh mục không được để trống!");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Đang xử lý...");

    try {
      let finalImageUrl = formData.image;

      if (selectedImageFile) {
        finalImageUrl = await uploadToCloudinary(selectedImageFile);
      }

      // Chuẩn bị payload sạch sẽ, bỏ parent_id
      const payload = {
        name: formData.name,
        description: formData.description,
        image: finalImageUrl, // String URL
        is_active: formData.is_active,
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload, {
          withCredentials: true,
        });
        toast.success("Cập nhật thành công!", { id: toastId });
      } else {
        await axios.post(API_URL, payload, {
          withCredentials: true,
        });
        toast.success("Thêm mới thành công!", { id: toastId });
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      // Log lỗi ra console để debug nếu cần
      console.error(error);

      if (error.response && error.response.status === 401) {
        toast.error("Hết phiên đăng nhập hoặc không đủ quyền!", {
          id: toastId,
        });
      } else {
        // Hiển thị lỗi chi tiết từ backend (nếu có)
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        toast.error("Lỗi: " + msg, { id: toastId });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa danh mục này?")) return;

    const toastId = toast.loading("Đang xóa...");
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success("Đã xóa danh mục", { id: toastId });
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi khi xóa";
      toast.error(msg, { id: toastId });
    }
  };

  const filteredCategories = categories.filter((c) =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen pb-10">
      <Toaster position="top-right" richColors closeButton />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FolderTree className="text-blue-600" /> Quản lý Danh mục
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "Đang tải..." : `Tổng số: ${categories.length} danh mục`}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all"
        >
          <Plus size={18} /> Thêm danh mục
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100 flex gap-2">
        <div className="relative w-full md:w-1/2">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button
          onClick={fetchCategories}
          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="py-4 px-6 w-24">Ảnh</th>
                <th className="py-4 px-6">Tên danh mục</th>
                <th className="py-4 px-6">Mô tả</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr
                    key={cat._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={20} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      {cat.name}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 truncate max-w-[250px]">
                      {cat.description || "---"}
                    </td>
                    <td className="py-4 px-6">
                      {cat.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                          <CheckCircle size={12} /> Hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium border border-gray-200">
                          <XCircle size={12} /> Đang ẩn
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 bg-white border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-sm"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-2 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    Chưa có danh mục nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Giày bóng đá"
                />
              </div>

              {/* Upload Image Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ảnh đại diện
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative w-full h-40 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="bg-white text-blue-600 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:bg-blue-50"
                      >
                        Thay đổi
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-white text-red-600 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="bg-blue-100 p-3 rounded-full mb-2">
                      <UploadCloud className="text-blue-600" size={24} />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Nhấn để tải ảnh lên
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      PNG, JPG (Max 5MB)
                    </span>
                  </button>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mô tả ngắn..."
                ></textarea>
              </div>

              {/* Active Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium text-gray-700 select-none cursor-pointer"
                >
                  Kích hoạt (Hiển thị)
                </label>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-200"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
