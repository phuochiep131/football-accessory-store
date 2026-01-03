import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { Toaster, toast } from "sonner";
import {
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Banknote,
  QrCode,
  FileText,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Checkout = () => {
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD | BANKING

  // 1. Load dữ liệu giỏ hàng để hiển thị lại
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

          // Nếu giỏ hàng rỗng thì đá về trang chủ
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

    // Có thể fetch thêm thông tin user để điền sẵn vào form (nếu API user có trả về)
    fetchCartData();
  }, [navigate]);

  // 2. Tính toán tiền
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.currentPrice * item.quantity,
    0
  );
  const shippingFee = subtotal > 5000000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  // 3. Xử lý đặt hàng
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.fullname || !formData.phone || !formData.address) {
      toast.warning("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    setProcessing(true);
    try {
      // Ghép địa chỉ đầy đủ
      const fullAddress = `${formData.address}, ${formData.district}, ${formData.city}`;

      const orderData = {
        shipping_address: fullAddress,
        phone_number: formData.phone, // Backend cần nhận trường này
        fullname: formData.fullname, // Backend cần nhận trường này (nếu chưa có trong user model)
        note: formData.note,
        payment_method: paymentMethod,
        // Backend thường sẽ tự lấy items từ giỏ hàng trong DB nên không cần gửi items ở đây
        // Trừ khi logic backend của bạn khác.
      };

      const res = await axios.post(`${API_URL}/orders/create`, orderData, {
        withCredentials: true,
      });

      toast.success("Đặt hàng thành công!");

      // Reset giỏ hàng trên UI (Context)
      fetchCartCount();

      // Chuyển hướng đến trang thành công hoặc lịch sử đơn hàng
      // navigate("/order-success", { state: { orderId: res.data.order._id } });
      navigate("/my-orders"); // Tạm thời chuyển về trang đơn hàng của tôi
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || "Đặt hàng thất bại. Vui lòng thử lại."
      );
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

      {/* Header đơn giản cho Checkout */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-black text-gray-900 flex items-center gap-1 italic"
          >
            PITCH<span className="text-green-600">PRO</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
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
          {/* --- LEFT COLUMN: INFO & PAYMENT --- */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* 1. Thông tin giao hàng */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} /> Thông tin giao
                hàng
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Ghi chú đơn hàng (Tùy chọn)
                  </label>
                  <div className="relative">
                    <FileText
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <textarea
                      rows="2"
                      placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                {/* Option 1: COD */}
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
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
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

                {/* Option 2: Banking */}
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
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
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

          {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100">
                Đơn hàng của bạn
              </h3>

              {/* List Items */}
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

              {/* Calculation */}
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
                {/* Nếu có discount truyền từ Cart qua thì hiển thị ở đây */}
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
