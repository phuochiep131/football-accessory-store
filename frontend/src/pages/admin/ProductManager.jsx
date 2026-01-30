import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
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
  UploadCloud,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_BECKEND_API_URL || "http://localhost:5000/api";
const CLOUD_NAME = "detransaw";
const UPLOAD_PRESET = "web_upload";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  const initialFormState = {
    product_name: "",
    price: 0, // This can be treated as a base price or display price
    discount: 0,
    category_id: "",
    image_url: "",
    description: "",
    color: "",
    material: "",
    warranty: "",
    origin: "",
    sizes: [{ size: "", quantity: 0, price: 0 }], // Added price to initial size state
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/categories`),
      ]);

      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCategories(
        Array.isArray(categoriesRes.data) ? categoriesRes.data : [],
      );
    } catch {
      toast.error("Không thể kết nối đến Server!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning("File ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
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
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData,
      );
      return res.data.secure_url;
    } catch {
      throw new Error("Lỗi khi upload ảnh lên Cloudinary.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    // Ensure deep copy and handle number fields correctly
    newSizes[index] = {
      ...newSizes[index],
      [field]:
        field === "quantity" || field === "price" ? Number(value) : value,
    };
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
  };

  const addSizeRow = () => {
    // Default price for new size could be the base price or 0
    setFormData((prev) => ({
      ...prev,
      sizes: [
        ...prev.sizes,
        { size: "", quantity: 0, price: Number(prev.price) || 0 },
      ],
    }));
  };

  const removeSizeRow = (index) => {
    if (formData.sizes.length === 1) {
      toast.warning("Phải có ít nhất một size!");
      return;
    }
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
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
      discount: product.discount || 0,
      category_id: safeCategoryId,
      image_url: product.image_url || "",
      description: product.description || "",
      color: product.color || "",
      material: product.material || "",
      warranty: product.warranty || "",
      origin: product.origin || "",
      sizes:
        product.sizes && product.sizes.length > 0
          ? product.sizes
          : [{ size: "", quantity: 0, price: product.price || 0 }],
    });

    setImagePreview(product.image_url || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Đang xử lý dữ liệu...");

    if (formData.sizes.length === 0) {
      toast.dismiss(toastId);
      toast.error("Vui lòng thêm ít nhất một size!");
      setIsSubmitting(false);
      return;
    }

    try {
      let finalImageUrl = formData.image_url;

      if (selectedImageFile) {
        finalImageUrl = await uploadToCloudinary(selectedImageFile);
      }

      const payload = {
        ...formData,
        image_url: finalImageUrl,
      };

      if (editingId) {
        await axios.put(`${API_BASE}/products/${editingId}`, payload, {
          withCredentials: true,
        });
        toast.success("Cập nhật sản phẩm thành công!", { id: toastId });
      } else {
        await axios.post(`${API_BASE}/products`, payload, {
          withCredentials: true,
        });
        toast.success("Thêm sản phẩm mới thành công!", { id: toastId });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Lỗi xảy ra!";
      toast.error("Lỗi: " + msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    const toastId = toast.loading("Đang xóa...");
    try {
      await axios.delete(`${API_BASE}/products/${id}`, {
        withCredentials: true,
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Đã xóa sản phẩm", { id: toastId });
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi khi xóa";
      toast.error("Xóa thất bại: " + msg, { id: toastId });
    }
  };

  const getCategoryName = (catData) => {
    if (!catData) return "---";
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

  const calculateTotalStock = (sizes) => {
    if (!sizes || !Array.isArray(sizes)) return 0;
    return sizes.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  };

  const filteredProducts = products.filter((p) => {
    const pName = (p.product_name || "").toLowerCase();
    const matchesSearch = pName.includes(searchTerm.toLowerCase());

    let pCatId = "";
    if (p.category_id) {
      pCatId =
        typeof p.category_id === "object" ? p.category_id._id : p.category_id;
    }
    const matchesCategory =
      categoryFilter === "All" || pCatId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-10 relative">
      <Toaster position="top-right" richColors closeButton />

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-blue-600" /> Quản lý Sản phẩm
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {loading
              ? "Đang tải..."
              : `Tổng số: ${filteredProducts.length} sản phẩm`}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all"
        >
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4 border border-gray-100">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
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
            onClick={fetchData}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            title="Tải lại dữ liệu"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="py-4 px-6 w-24">Ảnh</th>
                <th className="py-4 px-6">Tên sản phẩm</th>
                <th className="py-4 px-6">Danh mục</th>
                <th className="py-4 px-6">Giá hiển thị & Kho</th>
                <th className="py-4 px-6">Chi tiết Size</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const totalStock = calculateTotalStock(product.sizes);
                  return (
                    <tr
                      key={product._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "";
                              }}
                            />
                          ) : (
                            <ImageIcon size={24} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-800 text-base mb-1">
                          {product.product_name}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2 max-w-[250px]">
                          {product.description || "Chưa có mô tả"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100 whitespace-nowrap">
                          {getCategoryName(product.category_id)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-800">
                            {formatCurrency(product.price)}
                          </span>
                          <div className="mt-1">
                            {totalStock > 0 ? (
                              <span className="text-xs text-green-600 font-medium">
                                Tổng sẵn: {totalStock}
                              </span>
                            ) : (
                              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">
                                Hết hàng
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 max-w-[250px]">
                          {product.sizes && product.sizes.length > 0 ? (
                            product.sizes.map((s, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-[11px] bg-gray-50 px-2 py-1 rounded border border-gray-100"
                              >
                                <span className="font-bold text-gray-700">
                                  {s.size}
                                </span>
                                <span className="text-gray-500">
                                  SL: {s.quantity}
                                </span>
                                <span className="text-blue-600 font-medium">
                                  {formatCurrency(s.price || product.price)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">---</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 bg-white border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-sm"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">
                    Thông tin cơ bản
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="VD: iPhone 15"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá hiển thị (VNĐ){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giảm giá (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Quản lý Size, Số lượng & Giá{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={addSizeRow}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        <Plus size={14} /> Thêm Size
                      </button>
                    </div>

                    {/* Header for Size Rows */}
                    <div className="flex gap-2 text-xs font-semibold text-gray-500 mb-1 px-1">
                      <span className="flex-1">Size</span>
                      <span className="w-20">Số lượng</span>
                      <span className="w-28">Giá riêng (VNĐ)</span>
                      <span className="w-6"></span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2 max-h-[250px] overflow-y-auto">
                      {formData.sizes.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            required
                            placeholder="Size"
                            value={item.size}
                            onChange={(e) =>
                              handleSizeChange(index, "size", e.target.value)
                            }
                            className="flex-1 border rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                          />
                          <input
                            required
                            type="number"
                            placeholder="SL"
                            value={item.quantity}
                            onChange={(e) =>
                              handleSizeChange(
                                index,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="w-20 border rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                            min="0"
                          />
                          <input
                            required
                            type="number"
                            placeholder="Giá riêng"
                            value={item.price}
                            onChange={(e) =>
                              handleSizeChange(index, "price", e.target.value)
                            }
                            className="w-28 border rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                            min="0"
                          />
                          <button
                            type="button"
                            onClick={() => removeSizeRow(index)}
                            className="text-red-500 hover:text-red-700 p-1 w-6 flex justify-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">
                    Hình ảnh & Chi tiết
                  </h4>

                  <div className="flex flex-col gap-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Hình ảnh sản phẩm
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="relative w-full h-48 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
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
                            Xóa ảnh
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Màu sắc
                      </label>
                      <input
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chất liệu
                      </label>
                      <input
                        name="material"
                        value={formData.material}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xuất xứ
                      </label>
                      <input
                        name="origin"
                        value={formData.origin}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bảo hành
                      </label>
                      <input
                        name="warranty"
                        value={formData.warranty}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Hủy bỏ
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
                  {isSubmitting
                    ? "Đang xử lý..."
                    : editingId
                      ? "Lưu thay đổi"
                      : "Tạo sản phẩm"}
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
