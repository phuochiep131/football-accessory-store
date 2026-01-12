import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Toaster, toast } from "sonner";
import {
  Star,
  CheckCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  MessageSquare,
  Clock,
  User,
  ChevronRight,
  AlertCircle,
  Minus,
  Plus,
  Loader2
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useAuth();

  // --- STATE ---
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // State tương tác
  const [selectedSize, setSelectedSize] = useState(null); // Lưu size đang chọn (String)
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [adding, setAdding] = useState(false);
  const { fetchCartCount } = useCart();

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, reviewRes] = await Promise.all([
          axios.get(`${API_URL}/products/${id}`),
          axios.get(`${API_URL}/reviews/product/${id}`),
        ]);

        const data = productRes.data;
        setProduct(data);
        setMainImage(
          data.image_url || "https://placehold.co/600x600/png?text=No+Image"
        );
        setReviews(reviewRes.data);
        
        // Tự động chọn size đầu tiên còn hàng (nếu có)
        if (data.sizes && data.sizes.length > 0) {
            const firstAvailable = data.sizes.find(s => s.quantity > 0);
            if (firstAvailable) setSelectedSize(firstAvailable.size);
        }

      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        toast.error("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
      window.scrollTo(0, 0);
      setQuantity(1);
    }
  }, [id]);

  // --- 2. LOGIC TÍNH TOÁN ---
  
  // Lấy thông tin của size đang chọn
  const currentSizeInfo = useMemo(() => {
      if (!product || !selectedSize) return null;
      return product.sizes.find(s => s.size === selectedSize);
  }, [product, selectedSize]);

  // Tính tổng tồn kho (để hiển thị khi chưa chọn size)
  const totalStock = useMemo(() => {
      if (!product || !product.sizes) return 0;
      return product.sizes.reduce((acc, item) => acc + item.quantity, 0);
  }, [product]);

  // Số lượng tồn kho thực tế để hiển thị và validate
  const currentStock = currentSizeInfo ? currentSizeInfo.quantity : totalStock;
  const isOutOfStock = currentStock === 0;

  // --- LOGIC HIỂN THỊ GIÁ ---
  const displayPrice = useMemo(() => {
      if (!product) return 0;
      
      // Nếu đã chọn size, lấy giá của size đó
      if (currentSizeInfo && currentSizeInfo.price) {
          return currentSizeInfo.price;
      }
      
      // Nếu chưa chọn size, lấy giá mặc định của sản phẩm (thường là giá thấp nhất)
      return product.price;
  }, [product, currentSizeInfo]);

  const discount = product?.discount || 0;
  const finalPrice = displayPrice * (1 - discount / 100);


  // --- 3. HANDLERS ---
  
  const handleQuantityChange = (type) => {
      if (type === 'decrease') {
          if (quantity > 1) setQuantity(quantity - 1);
      } else {
          if (quantity < currentStock) setQuantity(quantity + 1);
          else toast.warning(`Chỉ còn ${currentStock} sản phẩm trong kho!`);
      }
  };

  const handleAddToCart = async () => {
    if (!state.currentUser) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }

    // Validate chọn size
    if (!selectedSize && product.sizes.length > 0) {
        toast.error("Vui lòng chọn Size!");
        return;
    }

    try {
      setAdding(true);
      await axios.post(
        `${API_URL}/cart/add`,
        { 
            productId: id, 
            quantity: quantity,
            size: selectedSize // Gửi kèm size lên server
        },
        { withCredentials: true }
      );
      toast.success(`Đã thêm Size ${selectedSize} vào giỏ!`);
      fetchCartCount();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi thêm vào giỏ");
    } finally {
      setAdding(false);
    }
  };

  // --- LOADING / ERROR ---
  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500"><Loader2 className="animate-spin mr-2"/> Đang tải dữ liệu...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy sản phẩm</div>;

  // Specs List (Loại bỏ dòng Size cũ vì đã có bộ chọn riêng)
  const specsList = [
    { label: "Danh mục", value: product.category_id?.name },
    { label: "Màu sắc", value: product.color },
    { label: "Chất liệu", value: product.material },
    { label: "Xuất xứ", value: product.origin },
    { label: "Bảo hành", value: product.warranty },
  ].filter((item) => item.value);

  // Rating
  const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <Toaster position="top-right" richColors closeButton />

      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-green-600">Trang chủ</Link> 
          <ChevronRight size={14} />
          <span className="text-gray-900 font-bold">{product.product_name}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            
            {/* --- LEFT: IMAGES --- */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100 flex items-center justify-center group">
                {product.discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm">
                    -{product.discount}%
                  </span>
                )}
                <img
                  src={mainImage}
                  alt="Main"
                  className={`w-full h-full object-contain mix-blend-multiply p-6 transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                />
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-gray-900 text-white px-6 py-2 rounded-full font-bold uppercase shadow-lg transform -rotate-12 border-2 border-white">Hết hàng</span>
                    </div>
                )}
              </div>
            </div>

            {/* --- RIGHT: INFO --- */}
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase italic leading-tight">
                {product.product_name}
              </h1>

              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                  <span className="font-bold text-yellow-700">{averageRating || 5}</span>
                  <Star size={16} className="text-yellow-400 fill-current" />
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{reviews.length} đánh giá</span>
                <span className="text-gray-300">|</span>
                
                {/* Dynamic Stock Status */}
                <span className={`font-bold flex items-center gap-1 ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                  {isOutOfStock ? (
                      <><AlertCircle size={14} /> Hết hàng</>
                  ) : (
                      <><CheckCircle size={14} /> Còn {currentStock} sản phẩm</>
                  )}
                </span>
              </div>

              {/* Price Area */}
              <div className="bg-gray-50 p-5 rounded-2xl mb-6 flex items-center gap-4 border border-gray-100">
                <span className="text-4xl font-black text-red-600 tracking-tight">
                  {formatCurrency(finalPrice)}
                </span>
                {product.discount > 0 && (
                  <div className="flex flex-col">
                    <span className="text-gray-400 line-through text-sm font-medium">
                      {formatCurrency(displayPrice)}
                    </span>
                    <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-full w-fit mt-1">
                      Tiết kiệm {product.discount}%
                    </span>
                  </div>
                )}
              </div>

              {/* --- SIZE SELECTOR (NEW) --- */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800 text-sm uppercase">Chọn Size:</span>
                    {selectedSize && <span className="text-sm font-bold text-green-600">Size {selectedSize}</span>}
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {product.sizes?.map((item) => (
                        <button
                            key={item.size}
                            onClick={() => {
                                setSelectedSize(item.size);
                                setQuantity(1); // Reset số lượng khi đổi size
                            }}
                            disabled={item.quantity === 0}
                            className={`
                                min-w-[3rem] h-10 px-3 rounded-lg border font-bold text-sm transition-all relative
                                ${selectedSize === item.size 
                                    ? 'border-gray-900 bg-gray-900 text-white shadow-md transform -translate-y-1' 
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-900'
                                }
                                ${item.quantity === 0 ? 'opacity-40 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
                            `}
                        >
                            {item.size}
                            {/* Gạch chéo nếu hết hàng */}
                            {item.quantity === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-[1px] bg-gray-400 rotate-45"></div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                {!selectedSize && (
                     <p className="text-gray-500 text-xs mt-2 italic">* Vui lòng chọn size để xem giá chính xác</p>
                )}
              </div>

              {/* --- QUANTITY SELECTOR --- */}
              <div className="mb-8">
                <span className="font-bold text-gray-800 text-sm uppercase mb-2 block">Số lượng:</span>
                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                        <button 
                            onClick={() => handleQuantityChange('decrease')}
                            disabled={quantity <= 1 || isOutOfStock}
                            className="p-3 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                        <button 
                            onClick={() => handleQuantityChange('increase')}
                            disabled={quantity >= currentStock || isOutOfStock}
                            className="p-3 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    {selectedSize && currentStock < 10 && currentStock > 0 && (
                        <span className="text-orange-500 text-xs font-medium italic">
                            Chỉ còn {currentStock} sản phẩm!
                        </span>
                    )}
                </div>
              </div>

              {/* --- ACTIONS --- */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={adding || isOutOfStock || !selectedSize}
                  className="flex-1 bg-white border-2 border-gray-900 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-50 uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
                >
                  {adding ? "Đang xử lý..." : "Thêm vào giỏ"}
                </button>
                <button
                  onClick={async () => {
                      if (!selectedSize) {
                          toast.error("Vui lòng chọn Size!");
                          return;
                      }
                      await handleAddToCart();
                      if(!adding) navigate("/cart");
                  }}
                  disabled={adding || isOutOfStock || !selectedSize}
                  className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black uppercase shadow-xl shadow-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-95 hover:-translate-y-1"
                >
                  Mua ngay
                </button>
              </div>

               {/* Policies */}
               <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="flex items-center gap-3 text-sm p-3 bg-white rounded-xl text-gray-700 border border-gray-100 shadow-sm">
                  <div className="p-2 bg-green-50 text-green-600 rounded-full"><CheckCircle size={18} /></div>
                  <span className="font-medium">Chính hãng 100%</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-3 bg-white rounded-xl text-gray-700 border border-gray-100 shadow-sm">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><RotateCcw size={18} /></div>
                  <span className="font-medium">Đổi trả 7 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-3 bg-white rounded-xl text-gray-700 border border-gray-100 shadow-sm">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-full"><Truck size={18} /></div>
                  <span className="font-medium">Freeship đơn 500k</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-3 bg-white rounded-xl text-gray-700 border border-gray-100 shadow-sm">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-full"><ShieldCheck size={18} /></div>
                  <span className="font-medium">Bảo hành trọn đời</span>
                </div>
              </div>
            </div>
          </div>

          {/* Specs & Description */}
          <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-lg mb-6 uppercase border-l-4 border-green-600 pl-3">
              Thông tin chi tiết
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 text-gray-600 text-sm leading-loose whitespace-pre-line bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                {product.description || "Đang cập nhật mô tả..."}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 h-fit shadow-sm">
                <h4 className="font-bold mb-4 text-gray-800 border-b pb-2">Thông số kỹ thuật</h4>
                <table className="w-full text-sm text-left text-gray-600">
                  <tbody>
                    {specsList.map((spec, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 font-medium text-gray-500 w-1/3 align-top">{spec.label}</td>
                        <td className="py-3 pl-2 font-semibold text-gray-800 align-top">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* --- REVIEW SECTION --- */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <MessageSquare className="text-blue-600" />
                Đánh giá từ khách hàng
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Tổng hợp nhận xét từ những người đã mua hàng
              </p>
            </div>

            {/* Summary Box */}
            <div className="flex items-center gap-6 bg-gray-50 px-6 py-3 rounded-xl">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900">
                  {averageRating}/5
                </div>
                <div className="flex text-yellow-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={
                        i < Math.round(averageRating) ? "currentColor" : "none"
                      }
                      className={
                        i >= Math.round(averageRating) ? "text-gray-300" : ""
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="h-10 w-px bg-gray-300"></div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {reviews.length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-bold">
                  Lượt đánh giá
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <MessageSquare size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">
                  Chưa có đánh giá nào cho sản phẩm này.
                </p>
                <p className="text-sm text-gray-400">
                  Hãy mua hàng để để lại nhận xét nhé!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rv) => (
                  <div
                    key={rv._id}
                    className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Avatar */}
                    <div className="shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                        {rv.user_id?.avatar ? (
                          <img
                            src={rv.user_id.avatar}
                            alt="User"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={24} className="text-blue-300" />
                        )}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <div>
                          <h5 className="font-bold text-gray-900 text-sm">
                            {rv.user_id?.fullname || "Khách hàng ẩn danh"}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  fill={i < rv.rating ? "currentColor" : "none"}
                                  className={
                                    i >= rv.rating ? "text-gray-200" : ""
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100 font-medium flex items-center gap-1">
                              <CheckCircle size={10} /> Đã mua
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 mt-2 sm:mt-0 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(rv.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mt-2 bg-gray-50 p-3 rounded-lg rounded-tl-none border border-gray-100">
                        {rv.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;