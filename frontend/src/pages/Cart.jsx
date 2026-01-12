import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
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
  ArrowRight,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const navigate = useNavigate();
  const { fetchCartCount } = useCart();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/cart`, { withCredentials: true });

      if (res.data && res.data.items) {
        const formattedItems = res.data.items.map((item) => ({
          id: item._id,
          name: item.product_id.product_name,
          price: item.product_id.price,
          currentPrice: item.product_id.discount
            ? item.product_id.price * (1 - item.product_id.discount / 100)
            : item.product_id.price,
          image:
            item.product_id.image_url ||
            "https://placehold.co/200x200/png?text=No+Image",
          quantity: item.quantity,
          size: item.size,
          category: item.product_id.category_id?.name || "Sản phẩm",
        }));
        setCartItems(formattedItems);
        fetchCartCount();
      }
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
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

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `${API_URL}/cart/update/${itemId}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );

      setCartItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === itemId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );
      fetchCartCount();
    } catch (error) {
      alert(
        "Lỗi cập nhật: " + (error.response?.data?.message || error.message)
      );
    }
  };

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
        fetchCartCount();
      } catch {
        alert("Lỗi khi xóa sản phẩm");
      }
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.currentPrice * item.quantity,
    0
  );
  const shippingFee = subtotal > 5000000 ? 0 : 30000;
  const total = subtotal + shippingFee - discount;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải giỏ hàng...
      </div>
    );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full border border-gray-100">
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
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <ArrowLeft size={20} /> Quay lại mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
          Giỏ hàng{" "}
          <span className="text-lg font-medium text-gray-500">
            ({cartItems.length} sản phẩm)
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- LIST ITEMS --- */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Thành tiền</div>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-center group"
                  >
                    <div className="col-span-1 md:col-span-6 flex items-start gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain mix-blend-multiply p-2"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-blue-600 mb-1 font-bold uppercase tracking-wide">
                          {item.category}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded border border-gray-200">
                            Size: {item.size}
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={12} /> Xóa
                        </button>
                      </div>
                    </div>

                    <div className="hidden md:block col-span-2 text-center">
                      <div className="font-bold text-gray-900">
                        {formatCurrency(item.currentPrice)}
                      </div>
                      {item.price > item.currentPrice && (
                        <div className="text-xs text-gray-400 line-through">
                          {formatCurrency(item.price)}
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden text-sm font-medium text-gray-500">
                        Số lượng:
                      </span>
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-200 text-gray-600 rounded-l-lg transition-colors disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-200 text-gray-600 rounded-r-lg transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end">
                      <span className="md:hidden text-sm font-medium text-gray-500">
                        Tổng:
                      </span>
                      <div className="text-right">
                        <div className="text-blue-600 font-black text-lg">
                          {formatCurrency(item.currentPrice * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-full">
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    Miễn phí vận chuyển
                  </h4>
                  <p className="text-sm text-gray-500">
                    Đơn hàng trên 5.000.000₫
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    Bảo hành chính hãng
                  </h4>
                  <p className="text-sm text-gray-500">Đổi trả trong 7 ngày</p>
                </div>
              </div>
            </div>
          </div>

          {/* --- ORDER SUMMARY --- */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wide border-b border-gray-100 pb-4">
                Cộng giỏ hàng
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-bold">Miễn phí</span>
                  ) : (
                    <span className="font-bold text-gray-900">
                      {formatCurrency(shippingFee)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Tag size={14} /> Giảm giá
                    </span>
                    <span className="font-bold">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-gray-900">
                      Tổng cộng
                    </span>
                    <div className="text-right">
                      <span className="block text-2xl font-black text-red-600">
                        {formatCurrency(total)}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        (Đã bao gồm VAT)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-gray-700 uppercase mb-2 block">
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã (VD: PITCHPRO)"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-medium uppercase"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-gray-100 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              <button
                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 mb-4 disabled:opacity-50 transform hover:-translate-y-1"
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
              >
                Tiến hành thanh toán <ArrowRight size={20} />
              </button>

              <div className="text-center">
                <Link
                  to="/"
                  className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
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
