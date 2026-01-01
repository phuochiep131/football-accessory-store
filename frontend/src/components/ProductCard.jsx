import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, ShoppingCart, Star, Check, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // State hiệu ứng nút mua
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const hasDiscount = product.discount && product.discount > 0;
  const originalPrice = product.price;
  const currentPrice = hasDiscount
    ? originalPrice * (1 - product.discount / 100)
    : originalPrice;

  // Xử lý thêm vào giỏ
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;

    setIsAdding(true);
    // Gọi hàm addToCart từ Context (đã được sửa ở trên)
    const success = await addToCart(product._id, 1);
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
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10 skew-x-[-10deg]">
            -{product.discount}%
          </span>
        )}

        <Link to={`/product/${product._id}`}>
          <img
            src={
              product.image_url || "https://placehold.co/400x400?text=PitchPro"
            }
            alt={product.product_name}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        {/* Nút yêu thích / xem nhanh (Vẫn giữ hiệu ứng hover ở góc phải) */}
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

        {/* --- NÚT MUA HÀNG (CỐ ĐỊNH) --- */}
        {/* mt-auto để đẩy nút xuống đáy nếu content ngắn */}
        <div className="mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer
                ${
                  isAdded
                    ? "bg-green-600 text-white"
                    : "bg-gray-900 text-white hover:bg-green-600"
                }`}
          >
            {isAdding ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isAdded ? (
              <>
                <Check size={18} /> <span className="text-sm">Đã thêm</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} />{" "}
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
