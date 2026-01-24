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
  Zap, // Icon tia sét
  Flame, // Icon lửa
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

  // --- 1. KIỂM TRA FLASH SALE ---
  // Lưu ý: Dữ liệu flash_sale cần được gộp vào product từ trang Home (xem Bước 2)
  const flashSale = product.flash_sale; 
  const isFlashSaleActive = useMemo(() => {
    if (!flashSale) return false;
    // Kiểm tra thêm thời gian nếu cần, tạm thời coi như có flashSale là Active
    return true; 
  }, [flashSale]);

  // --- 2. TÍNH GIÁ & % GIẢM ---
  const originalPrice = product.price;
  let currentPrice, discountPercent;

  if (isFlashSaleActive) {
    // Logic giá Flash Sale (Ưu tiên)
    discountPercent = flashSale.discount_percent;
    // Nếu có sale_price cứng thì dùng, không thì tính theo %
    currentPrice = flashSale.sale_price 
      ? flashSale.sale_price 
      : originalPrice * (1 - discountPercent / 100);
  } else {
    // Logic giá thường
    discountPercent = product.discount || 0;
    currentPrice = originalPrice * (1 - discountPercent / 100);
  }

  const hasDiscount = discountPercent > 0;

  // Tính % đã bán cho thanh progress
  const soldPercent = isFlashSaleActive && flashSale.quantity > 0
    ? Math.min((flashSale.sold / flashSale.quantity) * 100, 100)
    : 0;

  // --- 3. KHO & SIZE ---
  const totalStock = useMemo(() => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.reduce((acc, item) => acc + item.quantity, 0);
    }
    return product.quantity || 0;
  }, [product.sizes, product.quantity]);

  const isOutOfStock = totalStock === 0;
  const hasMultipleSizes = product.sizes && product.sizes.length > 1;

  // --- 4. XỬ LÝ CLICK ---
  const handleButtonClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAdding) return;

    if (hasMultipleSizes) {
      navigate(`/product/${product._id}`);
      return;
    }

    setIsAdding(true);
    const singleSize = product.sizes?.[0]?.size || "Default";
    // Gọi hàm addToCart
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
      <div className="relative aspect-square bg-gray-50 p-6 overflow-hidden flex items-center justify-center">
        
        {/* BADGE GIẢM GIÁ: Nếu Flash Sale thì màu Vàng, thường thì màu Đỏ */}
        {hasDiscount && (
          <div className={`absolute top-0 right-0 px-2 py-1 rounded-bl-xl rounded-tr-xl z-10 shadow-sm font-black text-xs
            ${isFlashSaleActive ? "bg-yellow-400 text-red-700" : "bg-red-600 text-white"}`}>
             -{discountPercent}%
          </div>
        )}

        {/* Badge Hết hàng */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
            <span className="bg-gray-900 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
              Hết hàng
            </span>
          </div>
        )}

        <Link to={`/product/${product._id}`} className="w-full h-full flex items-center justify-center">
          <img
            src={product.image_url || "https://placehold.co/400x400?text=No+Image"}
            alt={product.product_name}
            className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 ${
              isOutOfStock ? "grayscale opacity-70" : ""
            }`}
          />
        </Link>

        {/* Action Buttons */}
        <div className="absolute left-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0 z-20">
          <button className="bg-white p-2 rounded-full shadow-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Heart size={18} />
          </button>
          <button className="bg-white p-2 rounded-full shadow-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        {/* Tên sản phẩm */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-gray-800 font-bold text-sm md:text-base line-clamp-2 mb-2 h-10 leading-tight group-hover:text-green-600 transition-colors uppercase">
            {product.product_name}
          </h3>
        </Link>

        {/* Giá tiền */}
        <div className="mb-3">
          <div className="flex items-end gap-2 flex-wrap">
              <span className="text-red-600 font-black text-lg md:text-xl">
                  {formatCurrency(currentPrice)}
              </span>
              {hasDiscount && (
                  <span className="text-gray-400 text-xs line-through mb-1">
                  {formatCurrency(originalPrice)}
                  </span>
              )}
          </div>

          {/* --- THANH TIẾN ĐỘ FLASH SALE (Mới thêm) --- */}
          {isFlashSaleActive && (
              <div className="mt-2 relative w-full h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                  <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${soldPercent}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-black uppercase tracking-wider z-10 drop-shadow-md">
                      Đã bán {flashSale.sold}
                  </div>
                  {/* Icon lửa nếu bán chạy */}
                  {soldPercent >= 80 && (
                      <div className="absolute right-0 top-0 h-full flex items-center pr-1">
                          <Flame size={10} className="text-yellow-200 fill-yellow-200 animate-pulse" />
                      </div>
                  )}
              </div>
          )}
        </div>

        {/* --- Button --- */}
        <div className="mt-auto">
          <button
            onClick={handleButtonClick}
            disabled={isAdding || isOutOfStock}
            className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm text-sm
                ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isAdded
                    ? "bg-green-600 text-white"
                    : "bg-gray-900 text-white hover:bg-green-600"
                }`}
          >
            {isAdding ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isAdded ? (
              <>
                <Check size={18} /> Đã thêm
              </>
            ) : isOutOfStock ? (
              "HẾT HÀNG"
            ) : hasMultipleSizes ? (
              <>
                <ListFilter size={18} /> TÙY CHỌN
              </>
            ) : (
              <>
                <ShoppingCart size={18} /> THÊM GIỎ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;