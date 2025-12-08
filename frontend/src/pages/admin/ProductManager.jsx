import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  Filter,
  Image as ImageIcon,
  Save,
  X,
  Loader2,
  RefreshCcw,
  UploadCloud, // Icon cho nút upload đẹp
} from "lucide-react";

// --- CẤU HÌNH API BACKEND ---
const API_BASE = "http://localhost:5000/api";

// --- CẤU HÌNH CLOUDINARY (THAY THÔNG TIN CỦA BẠN VÀO ĐÂY) ---
const CLOUD_NAME = "detransaw";
const UPLOAD_PRESET = "web_upload"; 
const ProductManager = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATE UI & FILTER ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE CHO ẢNH & UPLOAD ---
  const [selectedImageFile, setSelectedImageFile] = useState(null); // File ảnh gốc
  const [imagePreview, setImagePreview] = useState(""); // Link blob để preview
  const fileInputRef = useRef(null); // Ref để chọc vào input file ẩn

  // --- FORM STATE ---
  const initialFormState = {
    product_name: "",
    price: 0,
    quantity: 0,
    discount: 0,
    category_id: "",
    image_url: "",
    description: "",
    size: "",
    color: "",
    material: "",
    warranty: "",
    origin: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // ========================================================================
  // 1. FETCH DỮ LIỆU (GET)
  // ========================================================================
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Lỗi kết nối danh mục:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Lỗi kết nối sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // ========================================================================
  // 2. XỬ LÝ ẢNH & UPLOAD CLOUDINARY
  // ========================================================================

  // Xử lý khi người dùng chọn file từ máy tính
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Lưu file vào state để tí nữa upload
      setSelectedImageFile(file);
      // 2. Tạo link ảo (blob) để hiển thị preview ngay lập tức
      setImagePreview(URL.createObjectURL(file));
      // 3. Reset input để nếu chọn lại file cũ vẫn trigger onChange
      e.target.value = "";
    }
  };

  // Xóa ảnh đang chọn hoặc ảnh cũ
  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  // Hàm Upload file lên Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.secure_url; // Trả về link ảnh HTTPS
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      throw new Error("Không thể upload ảnh lên Cloudinary. Kiểm tra cấu hình!");
    }
  };

  // ========================================================================
  // 3. XỬ LÝ FORM & CRUD
  // ========================================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setSelectedImageFile(null);
    setImagePreview("");
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setSelectedImageFile(null);

    // Xử lý category_id (vì có thể backend populate ra object)
    let safeCategoryId = "";
    if (product.category_id) {
      safeCategoryId =
        typeof product.category_id === "object"
          ? product.category_id._id
          : product.category_id;
    }

    setFormData({
      product_name: product.product_name || "",
      price: product.price || 0,
      quantity: product.quantity || 0,
      discount: product.discount || 0,
      category_id: safeCategoryId,
      image_url: product.image_url || "",
      description: product.description || "",
      size: product.size || "",
      color: product.color || "",
      material: product.material || "",
      warranty: product.warranty || "",
      origin: product.origin || "",
    });

    // Hiển thị ảnh cũ nếu có
    setImagePreview(product.image_url || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.image_url;

      // 1. NẾU CÓ CHỌN ẢNH MỚI -> UPLOAD LÊN CLOUDINARY
      if (selectedImageFile) {
        finalImageUrl = await uploadToCloudinary(selectedImageFile);
      }

      // 2. CHUẨN BỊ DATA
      const payload = {
        ...formData,
        image_url: finalImageUrl,
      };

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE}/products/${editingId}`
        : `${API_BASE}/products`;

      // 3. GỌI API BACKEND
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Lỗi khi lưu dữ liệu");

      // 4. THÀNH CÔNG
      alert(editingId ? "Cập nhật thành công!" : "Thêm mới thành công!");
      setIsModalOpen(false);
      fetchProducts(); // Tải lại danh sách
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        const result = await res.json();
        alert("Xóa thất bại: " + result.error);
      }
    } catch (error) {
      alert("Lỗi kết nối khi xóa");
    }
  };

  // ========================================================================
  // 4. HELPERS
  // ========================================================================
  const getCategoryName = (catData) => {
    if (!catData) return <span className="text-gray-400 italic">Chưa phân loại</span>;
    if (typeof catData === "object" && catData.name) return catData.name;
    const foundCat = categories.find((c) => c._id === catData);
    return foundCat ? foundCat.name : "---";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredProducts = products.filter((p) => {
    const pName = p.product_name || "";
    const matchesSearch = pName.toLowerCase().includes(searchTerm.toLowerCase());
    let pCatId = "";
    if (p.category_id) {
      pCatId = typeof p.category_id === "object" ? p.category_id._id : p.category_id;
    }
    const matchesCategory = categoryFilter === "All" || pCatId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // ========================================================================
  // 5. RENDER GIAO DIỆN
  // ========================================================================
  return (
    <div className="min-h-screen pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-blue-600" /> Quản lý Sản phẩm
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "Đang tải dữ liệu..." : `Tổng số: ${filteredProducts.length} sản phẩm`}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all"
        >
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4 border border-gray-100">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
          >
            <option value="All">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => { fetchProducts(); fetchCategories(); }}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Tải lại dữ liệu"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Đang tải dữ liệu từ Server...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="py-4 px-6 w-20">Ảnh</th>
                <th className="py-4 px-6">Tên sản phẩm</th>
                <th className="py-4 px-6">Danh mục</th>
                <th className="py-4 px-6">Giá & Kho</th>
                <th className="py-4 px-6">Chi tiết</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = ""; }}
                          />
                        ) : (
                          <ImageIcon size={24} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-800 text-base mb-1">{product.product_name}</div>
                      <div className="text-xs text-gray-500 line-clamp-2 max-w-[250px]">{product.description || "Chưa có mô tả"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100 whitespace-nowrap">
                        {getCategoryName(product.category_id)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-800">{formatCurrency(product.price)}</span>
                        <div className="mt-1">
                          {product.quantity > 0 ? (
                            <span className="text-xs text-green-600 font-medium">Sẵn: {product.quantity}</span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">Hết hàng</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs space-y-1 text-gray-500">
                        {product.origin && <div><span className="font-medium text-gray-700">Xuất xứ:</span> {product.origin}</div>}
                        {(product.size || product.color) && (
                          <div><span className="font-medium text-gray-700">Loại:</span> {product.size} - {product.color}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(product)} className="p-2 bg-white border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-sm">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-2 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 transition-all shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    <p>Không tìm thấy sản phẩm nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL (FORM) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">Thông tin cơ bản</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                    <input required name="product_name" value={formData.product_name} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: iPhone 15" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) <span className="text-red-500">*</span></label>
                      <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" min="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (%)</label>
                      <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" min="0" max="100" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                    <select required name="category_id" value={formData.category_id} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng kho <span className="text-red-500">*</span></label>
                    <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" min="0" />
                  </div>
                </div>

                {/* CỘT PHẢI: HÌNH ẢNH & CHI TIẾT */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">Hình ảnh & Chi tiết</h4>

                  {/* --- KHU VỰC UPLOAD ẢNH (CHÍNH) --- */}
                  <div className="flex flex-col gap-3">
                    <label className="block text-sm font-medium text-gray-700">Hình ảnh sản phẩm</label>

                    {/* Input file ẩn, chỉ dùng để kích hoạt qua Ref */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {imagePreview ? (
                      // 1. Trường hợp ĐÃ CÓ ẢNH (Preview hoặc ảnh cũ)
                      <div className="relative w-full h-48 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden group">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        
                        {/* Overlay nút chức năng khi hover */}
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
                            Xóa ảnh
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 2. Trường hợp CHƯA CÓ ẢNH -> Hiện ô click để upload
                      <button
                        type="button" // Type button để tránh submit form
                        onClick={() => fileInputRef.current.click()} // Kích hoạt input file
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                      >
                        <div className="bg-blue-100 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                          <UploadCloud className="text-blue-600" size={24} />
                        </div>
                        <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                          Nhấn để tải ảnh lên
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          PNG, JPG (Max 5MB)
                        </span>
                      </button>
                    )}

                    {/* Input nhập link ảnh dự phòng */}
                    <div className="mt-2">
                       <p className="text-xs text-gray-400 mb-1 text-center">- Hoặc dán link -</p>
                       <input 
                         name="image_url" 
                         value={formData.image_url} 
                         onChange={(e) => {
                           handleInputChange(e);
                           if(!selectedImageFile) setImagePreview(e.target.value);
                         }} 
                         className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                         placeholder="https://..." 
                       />
                     </div>
                  </div>

                  {/* Các trường thông tin phụ */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                      <input name="size" value={formData.size} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                      <input name="color" value={formData.color} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chất liệu</label>
                      <input name="material" value={formData.material} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Xuất xứ</label>
                      <input name="origin" value={formData.origin} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hành</label>
                    <input name="warranty" value={formData.warranty} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                {/* Full Width: Mô tả */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
                    <textarea name="description" rows="4" value={formData.description} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Buttons) */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Hủy bỏ</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-200">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {isSubmitting ? "Đang xử lý..." : (editingId ? "Lưu thay đổi" : "Tạo sản phẩm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;