import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Toaster, toast } from "sonner";
import {
  MapPin,
  Phone,
  User,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Banknote,
  QrCode,
  FileText,
  Home,
  Plus,
  ShoppingBag,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Checkout = () => {
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();
  const { state: authState } = useAuth();
  const { currentUser } = authState;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [addressMode, setAddressMode] = useState("default");

  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    if (addressMode === "default" && currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullname: currentUser.fullname || "",
        phone: currentUser.phone_number || "",
        address: currentUser.address || "",
        city: prev.city || "",
        district: prev.district || "",
        note: "",
      }));
    } else if (addressMode === "new") {
      setFormData({
        fullname: "",
        phone: "",
        address: "",
        city: "",
        district: "",
        note: "",
      });
    }
  }, [addressMode, currentUser]);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const res = await axios.get(`${API_URL}/cart`, {
          withCredentials: true,
        });
        if (res.data && res.data.items) {
          const formattedItems = res.data.items.map((item) => ({
            id: item._id,
            name: item.product_id.product_name,
            price: item.product_id.price,
            currentPrice: item.price_at_time,
            image: item.product_id.image_url || "https://placehold.co/200x200",
            quantity: item.quantity,
            size: item.size,
          }));
          setCartItems(formattedItems);

          if (formattedItems.length === 0) {
            toast.error("Giỏ hàng đang trống!");
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Lỗi tải giỏ hàng:", error);
        toast.error("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchCartData();
  }, [navigate]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.currentPrice * item.quantity,
    0
  );
  const shippingFee = subtotal > 5000000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!formData.fullname || !formData.phone || !formData.address) {
      toast.warning("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setProcessing(true);
    try {
      const orderData = {
        shipping_address: `${formData.address}, ${formData.district}, ${formData.city}`,
        phone_number: formData.phone,
        fullname: formData.fullname,
        payment_method: paymentMethod,
        note: formData.note,
      };

      const res = await axios.post(`${API_URL}/orders/create`, orderData, {
        withCredentials: true,
      });

      if (paymentMethod === "VNPAY" && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        fetchCartCount();
        toast.success("Đặt hàng thành công!");
        navigate("/my-orders");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Đặt hàng thất bại.");
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-900 mr-2" /> Đang tải thông
        tin...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <Toaster position="top-right" richColors closeButton />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center text-gray-500 hover:text-gray-900 font-bold text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Quay lại giỏ hàng
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8">
          Thanh toán
        </h1>

        <form
          onSubmit={handlePlaceOrder}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* --- LEFT: INFORMATION --- */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* 1. SHIPPING INFO */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <MapPin className="text-blue-600" size={20} /> Địa chỉ nhận hàng
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div
                  onClick={() => setAddressMode("default")}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 relative overflow-hidden ${
                    addressMode === "default"
                      ? "border-blue-600 bg-blue-50/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`mt-1 p-1.5 rounded-full ${
                      addressMode === "default"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Home size={16} />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900">
                      Mặc định
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5 block">
                      Sử dụng thông tin từ hồ sơ
                    </span>
                  </div>
                  {addressMode === "default" && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl-xl">
                      <CheckCircle size={14} />
                    </div>
                  )}
                </div>

                <div
                  onClick={() => setAddressMode("new")}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 relative overflow-hidden ${
                    addressMode === "new"
                      ? "border-blue-600 bg-blue-50/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`mt-1 p-1.5 rounded-full ${
                      addressMode === "new"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Plus size={16} />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900">
                      Địa chỉ mới
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5 block">
                      Nhập địa chỉ giao hàng khác
                    </span>
                  </div>
                  {addressMode === "new" && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl-xl">
                      <CheckCircle size={14} />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none font-medium transition-all"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullname}
                      onChange={(e) =>
                        setFormData({ ...formData, fullname: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none font-medium transition-all"
                      placeholder="09xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    Địa chỉ cụ thể
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none font-medium transition-all"
                    placeholder="Số nhà, tên đường..."
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    Tỉnh / Thành phố
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none font-medium transition-all"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none font-medium transition-all"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    Ghi chú (Tùy chọn)
                  </label>
                  <div className="relative">
                    <FileText
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <textarea
                      rows="2"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none font-medium transition-all resize-none"
                      placeholder="Lời nhắn cho shipper..."
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PAYMENT METHOD */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <CreditCard className="text-blue-600" size={20} /> Phương thức
                thanh toán
              </h3>

              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
                    paymentMethod === "COD"
                      ? "border-green-500 bg-green-50/30"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <div className="p-2 bg-green-100 rounded-lg text-green-700">
                    <Banknote size={24} />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <span className="text-xs text-gray-500">
                      Trả tiền mặt khi shipper giao hàng.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
                    paymentMethod === "VNPAY"
                      ? "border-blue-500 bg-blue-50/30"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                  />
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                    <QrCode size={24} />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block">
                      Thanh toán qua VNPAY
                    </span>
                    <span className="text-xs text-gray-500">
                      Thẻ ATM / QR Code / Ví điện tử.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* --- RIGHT: ORDER SUMMARY --- */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wide flex items-center gap-2">
                <ShoppingBag size={20} /> Đơn hàng của bạn
              </h3>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-contain mix-blend-multiply p-1"
                      />
                      <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-md">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                        {item.name}
                      </h4>
                      <div className="text-xs text-gray-500 mt-1 mb-1 font-medium bg-white border border-gray-200 px-1.5 py-0.5 rounded w-fit">
                        Size: {item.size}
                      </div>
                      <div className="text-sm font-bold text-blue-600">
                        {formatCurrency(item.currentPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-bold">Miễn phí</span>
                  ) : (
                    <span className="font-bold text-gray-900">
                      {formatCurrency(shippingFee)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-dashed border-gray-300 pt-4 mt-4">
                <span className="font-bold text-gray-900 text-lg">
                  Tổng cộng
                </span>
                <span className="text-2xl font-black text-red-600">
                  {formatCurrency(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full mt-6 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:transform-none"
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} /> Đặt hàng ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
