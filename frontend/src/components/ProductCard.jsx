import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Eye,
  ShoppingCart,
  Star,
  Check,
  Loader2,
  ListFilter,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // 1. Tính giá sau giảm
  const hasDiscount = product.discount && product.discount > 0;
  const originalPrice = product.price;
  const currentPrice = hasDiscount
    ? originalPrice * (1 - product.discount / 100)
    : originalPrice;

  // 2. Tính tổng số lượng tồn kho từ mảng sizes
  const totalStock = useMemo(() => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.reduce((acc, item) => acc + item.quantity, 0);
    }
    return 0; // Hoặc product.quantity nếu bạn giữ field cũ để backup
  }, [product.sizes]);

  const isOutOfStock = totalStock === 0;

  // 3. Kiểm tra xem sản phẩm có nhiều size không
  // Nếu > 1 size: Cần vào trang chi tiết để chọn.
  // Nếu = 1 size: Có thể thêm nhanh.
  const hasMultipleSizes = product.sizes && product.sizes.length > 1;

  // Xử lý logic nút bấm
  const handleButtonClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Nếu hết hàng thì không làm gì
    if (isOutOfStock || isAdding) return;

    // TRƯỜNG HỢP 1: Có nhiều size -> Chuyển hướng sang trang chi tiết
    if (hasMultipleSizes) {
      navigate(`/product/${product._id}`);
      return;
    }

    // TRƯỜNG HỢP 2: Chỉ có 1 size duy nhất (Bóng, Balo...) -> Thêm ngay
    setIsAdding(true);

    // Lấy size duy nhất đó (ví dụ: "Free size" hoặc "5")
    const singleSize = product.sizes[0]?.size || "Default";

    // Gọi hàm addToCart (Lưu ý: Bạn cần update Context để nhận thêm tham số size)
    const success = await addToCart(product._id, 1, singleSize);

    setIsAdding(false);

    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full font-sans">
      {/* --- Image Area --- */}
      <div className="relative aspect-square bg-gray-50 p-6 overflow-hidden">
        {/* Badge Giảm giá */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10 skew-x-[-10deg]">
            -{product.discount}%
          </span>
        )}

        {/* Badge Hết hàng */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
            <span className="bg-gray-900 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
              Hết hàng
            </span>
          </div>
        )}

        <Link to={`/product/${product._id}`}>
          <img
            src={
              product.image_url || "https://placehold.co/400x400?text=No+Image"
            }
            alt={product.product_name}
            className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 ${
              isOutOfStock ? "grayscale opacity-70" : ""
            }`}
          />
        </Link>

        {/* Action Buttons (Hover) */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-20">
          <button className="bg-white p-2 rounded-full shadow-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Heart size={18} />
          </button>
          <button className="bg-white p-2 rounded-full shadow-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="currentColor" />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium ml-1">
            (5 đánh giá)
          </span>
        </div>

        {/* Tên sản phẩm */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-gray-800 font-bold text-sm md:text-base line-clamp-2 mb-2 h-10 md:h-12 leading-tight group-hover:text-green-600 transition-colors uppercase">
            {product.product_name}
          </h3>
        </Link>

        {/* Giá tiền */}
        <div className="mb-3">
          <span className="text-gray-400 text-xs line-through h-4 block">
            {hasDiscount ? formatCurrency(originalPrice) : ""}
          </span>
          <span className="text-red-600 font-black text-lg md:text-xl">
            {formatCurrency(currentPrice)}
          </span>
        </div>

        {/* --- SMART ACTION BUTTON --- */}
        <div className="mt-auto">
          <button
            onClick={handleButtonClick}
            disabled={isAdding || isOutOfStock}
            className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm 
                ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" // Style khi hết hàng
                    : isAdded
                    ? "bg-green-600 text-white"
                    : "bg-gray-900 text-white hover:bg-green-600" // Style mặc định
                }`}
          >
            {/* LOGIC HIỂN THỊ ICON VÀ TEXT TRONG NÚT */}
            {isAdding ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isAdded ? (
              <>
                <Check size={18} /> <span className="text-sm">Đã thêm</span>
              </>
            ) : isOutOfStock ? (
              <span className="text-sm uppercase">Tạm hết hàng</span>
            ) : hasMultipleSizes ? (
              // Nếu nhiều size -> Hiện icon List -> Bấm vào sẽ chuyển trang
              <>
                <ListFilter size={18} />
                <span className="text-sm uppercase">Tùy chọn</span>
              </>
            ) : (
              // Nếu 1 size -> Hiện icon Giỏ hàng -> Bấm vào thêm ngay
              <>
                <ShoppingCart size={18} />
                <span className="text-sm uppercase">Thêm vào giỏ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
