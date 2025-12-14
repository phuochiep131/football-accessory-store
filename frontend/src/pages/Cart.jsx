import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Thêm axios
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Tag,
  Truck,
  ShieldCheck,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Cart = () => {
  // --- STATE ---
  const [cartItems, setCartItems] = useState([]); // Bắt đầu bằng mảng rỗng
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  // --- 1. FETCH CART (GET API) ---
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/cart`, { withCredentials: true });

      // Map dữ liệu từ Backend (Nested object) sang phẳng để dễ render
      if (res.data && res.data.items) {
        const formattedItems = res.data.items.map((item) => ({
          id: item._id, // ID của CartItem (để xóa/sửa)
          name: item.product_id.product_name,
          price: item.product_id.price, // Giá gốc
          // Tính giá sau giảm
          currentPrice: item.product_id.discount
            ? item.product_id.price * (1 - item.product_id.discount / 100)
            : item.product_id.price,
          image:
            item.product_id.image_url ||
            "https://placehold.co/200x200/png?text=No+Image",
          quantity: item.quantity,
          category: item.product_id.category_id?.category_name || "Sản phẩm",
        }));
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
      // Nếu chưa login (401), đá về login
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // --- 2. UPDATE QUANTITY (PUT API) ---
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      // Gọi API cập nhật
      await axios.put(
        `${API_URL}/cart/update/${itemId}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      // Cập nhật UI ngay lập tức
      setCartItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === itemId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );
    } catch (error) {
      alert(
        "Lỗi cập nhật: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // --- 3. REMOVE ITEM (DELETE API) ---
  const removeItem = async (itemId) => {
    const confirm = window.confirm(
      "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?"
    );
    if (confirm) {
      try {
        await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
          withCredentials: true,
        });
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );
      } catch (error) {
        alert("Lỗi khi xóa sản phẩm");
      }
    }
  };

  // --- 4. CHECKOUT (POST ORDER API) ---
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Gọi API tạo đơn hàng
      const orderData = {
        shipping_address: "Địa chỉ mặc định (User Profile)",
        note: "Khách hàng đặt qua Web",
      };

      const res = await axios.post(`${API_URL}/orders/create`, orderData, {
        withCredentials: true,
      });

      alert("Đặt hàng thành công! Mã đơn: " + res.data.order._id);
      setCartItems([]); // Xóa sạch giỏ hàng trên UI
      // navigate("/profile"); // Có thể điều hướng về trang đơn hàng
    } catch (error) {
      alert(error.response?.data?.error || "Đặt hàng thất bại");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Mock coupon
  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "PITCHPRO") {
      setDiscount(50000);
      alert("Áp dụng mã thành công: -50.000đ");
    } else {
      alert("Mã giảm giá không hợp lệ!");
      setDiscount(0);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Tính toán tổng tiền
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.currentPrice * item.quantity,
    0
  );
  const shippingFee = subtotal > 5000000 ? 0 : 30000;
  const total = subtotal + shippingFee - discount;

  // --- RENDER ---
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải giỏ hàng...
      </div>
    );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-gray-500 mb-8">
            Hãy khám phá các sản phẩm tuyệt vời của chúng tôi nhé!
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            <ArrowLeft size={20} /> Quay lại mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      {/* Header đơn giản */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-black text-gray-900 flex items-center gap-1 italic tracking-tighter"
          >
            PITCH<span className="text-green-600">PRO</span>
          </Link>
          <div className="text-gray-500 text-sm hidden sm:block">
            <span className="text-blue-600 font-medium">Giỏ hàng</span> / Thanh
            toán
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          Giỏ hàng{" "}
          <span className="text-lg font-normal text-gray-500">
            ({cartItems.length} sản phẩm)
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- LEFT COLUMN: CART ITEMS --- */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-500 border-b border-gray-200">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Thành tiền</div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-center group hover:bg-blue-50/30 transition-colors"
                  >
                    {/* Product Info */}
                    <div className="col-span-1 md:col-span-6 flex items-start gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-blue-600 mb-1 font-medium">
                          {item.category}
                        </div>
                        <h3 className="text-base font-medium text-gray-900 line-clamp-2 mb-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="hidden md:block col-span-2 text-center text-gray-600 font-medium">
                      {formatCurrency(item.currentPrice)}
                      {item.price > item.currentPrice && (
                        <div className="text-xs text-gray-400 line-through">
                          {formatCurrency(item.price)}
                        </div>
                      )}
                    </div>

                    {/* Quantity Control */}
                    <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden text-sm font-medium text-gray-500">
                        Số lượng:
                      </span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-100 text-gray-600 rounded-r-lg transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end">
                      <span className="md:hidden text-sm font-medium text-gray-500">
                        Tổng:
                      </span>
                      <div className="text-right">
                        <div className="text-blue-600 font-bold">
                          {formatCurrency(item.currentPrice * item.quantity)}
                        </div>
                        <div className="md:hidden text-xs text-gray-400">
                          {formatCurrency(item.currentPrice)}/sp
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Miễn phí vận chuyển
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Cho đơn hàng trên 5.000.000₫
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Bảo hành chính hãng
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    100% sản phẩm có nguồn gốc rõ ràng
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:hidden">
              <Link
                to="/"
                className="text-blue-600 font-medium flex items-center gap-2 hover:underline"
              >
                <ArrowLeft size={16} /> Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Cộng giỏ hàng
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  ) : (
                    <span className="font-medium">
                      {formatCurrency(shippingFee)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span className="font-medium">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-gray-900">
                      Tổng cộng
                    </span>
                    <div className="text-right">
                      <span className="block text-2xl font-bold text-blue-600">
                        {formatCurrency(total)}
                      </span>
                      <span className="text-xs text-gray-400 font-normal">
                        (Đã bao gồm VAT)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Tag size={16} /> Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã (VD: PITCHPRO)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              <button
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <span className="animate-pulse">Đang xử lý...</span>
                ) : (
                  <>
                    Tiến hành thanh toán <CreditCard size={20} />
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/"
                  className="text-sm text-gray-500 hover:text-blue-600 hover:underline"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
