import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext"; // <--- 1. Import AuthContext
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
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Checkout = () => {
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();
  const { state: authState } = useAuth(); // <--- 2. Lấy thông tin user
  const { currentUser } = authState;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // --- STATE QUẢN LÝ CHẾ ĐỘ NHẬP LIỆU ---
  // 'default': Dùng thông tin từ Profile
  // 'new': Nhập mới hoàn toàn
  const [addressMode, setAddressMode] = useState("default");

  // Form State
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  // --- 3. EFFECT: TỰ ĐỘNG ĐIỀN THÔNG TIN ---
  useEffect(() => {
    if (addressMode === "default" && currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullname: currentUser.fullname || "",
        phone: currentUser.phone_number || "",
        address: currentUser.address || "",
        // Lưu ý: User model hiện tại chỉ có 1 trường address chung,
        // nên city/district ta để trống để user tự điền bổ sung nếu thiếu
        city: prev.city || "",
        district: prev.district || "",
        note: "",
      }));
    } else if (addressMode === "new") {
      // Nếu chọn nhập mới -> Reset form
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

  // 4. Load dữ liệu giỏ hàng
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
            currentPrice: item.product_id.discount
              ? item.product_id.price * (1 - item.product_id.discount / 100)
              : item.product_id.price,
            image: item.product_id.image_url || "https://placehold.co/200x200",
            quantity: item.quantity,
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

  // 5. Xử lý đặt hàng
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.fullname || !formData.phone || !formData.address) {
      toast.warning("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    setProcessing(true);
    try {
      const fullAddress = `${formData.address}, ${formData.district}, ${formData.city}`;

      const orderData = {
        shipping_address: fullAddress,
        phone_number: formData.phone,
        fullname: formData.fullname,
        note: formData.note,
        payment_method: paymentMethod,
      };

      await axios.post(`${API_URL}/orders/create`, orderData, {
        withCredentials: true,
      });

      toast.success("Đặt hàng thành công!");
      fetchCartCount();
      navigate("/my-orders");
    } catch (error) {
      console.error(error);
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
        Đang tải...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <Toaster position="top-right" richColors closeButton />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-black text-gray-900 flex items-center gap-1 italic"
          >
            PITCH<span className="text-green-600">PRO</span>
          </Link>
          <div className="flex items-center gap-2 text-sm hidden sm:flex">
            <span className="text-gray-400">Giỏ hàng</span>
            <span className="text-gray-300">/</span>
            <span className="text-blue-600 font-bold border-b-2 border-blue-600">
              Thanh toán
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400">Hoàn tất</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <form
          onSubmit={handlePlaceOrder}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* --- LEFT COLUMN --- */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* 1. Chọn địa chỉ (New Logic) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} /> Thông tin giao
                hàng
              </h3>

              {/* Tabs chọn chế độ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div
                  onClick={() => setAddressMode("default")}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                    addressMode === "default"
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`mt-1 p-1 rounded-full ${
                      addressMode === "default"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <Home size={16} />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 text-sm">
                      Địa chỉ mặc định
                    </span>
                    <span className="text-xs text-gray-500">
                      Sử dụng thông tin từ hồ sơ cá nhân của bạn.
                    </span>
                  </div>
                  {addressMode === "default" && (
                    <CheckCircle size={18} className="text-blue-600 ml-auto" />
                  )}
                </div>

                <div
                  onClick={() => setAddressMode("new")}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                    addressMode === "new"
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`mt-1 p-1 rounded-full ${
                      addressMode === "new"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <Plus size={16} />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 text-sm">
                      Địa chỉ mới
                    </span>
                    <span className="text-xs text-gray-500">
                      Nhập tên, số điện thoại và địa chỉ nhận hàng khác.
                    </span>
                  </div>
                  {addressMode === "new" && (
                    <CheckCircle size={18} className="text-blue-600 ml-auto" />
                  )}
                </div>
              </div>

              {/* Form nhập liệu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                      value={formData.fullname}
                      onChange={(e) =>
                        setFormData({ ...formData, fullname: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="tel"
                      placeholder="0912..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Số nhà, tên đường, tòa nhà..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Hà Nội"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Quận / Huyện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Cầu Giấy"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Ghi chú (Tùy chọn)
                  </label>
                  <div className="relative">
                    <FileText
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <textarea
                      rows="2"
                      placeholder="VD: Giao giờ hành chính..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Phương thức thanh toán */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="text-blue-600" size={20} /> Phương thức
                thanh toán
              </h3>

              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "COD"
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 accent-blue-600"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <Banknote size={24} />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <span className="text-sm text-gray-500">
                      Thanh toán tiền mặt cho shipper khi nhận được hàng.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "BANKING"
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 accent-blue-600"
                    checked={paymentMethod === "BANKING"}
                    onChange={() => setPaymentMethod("BANKING")}
                  />
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <QrCode size={24} />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block">
                      Chuyển khoản ngân hàng (QR Code)
                    </span>
                    <span className="text-sm text-gray-500">
                      Quét mã QR để thanh toán nhanh chóng.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100">
                Đơn hàng của bạn
              </h3>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] px-1.5 rounded-tl-md font-bold">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(item.currentPrice)}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.currentPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-bold">Miễn phí</span>
                  ) : (
                    <span>{formatCurrency(shippingFee)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
                <span className="text-base font-bold text-gray-800">
                  Tổng cộng
                </span>
                <span className="text-2xl font-black text-blue-600">
                  {formatCurrency(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {processing ? (
                  <>
                    {" "}
                    <Loader2 className="animate-spin" /> Đang xử lý...{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <CheckCircle size={20} /> Đặt hàng ngay ({cartItems.length}){" "}
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <Link
                  to="/cart"
                  className="text-sm text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={14} /> Quay lại giỏ hàng
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
