import { useState } from "react";
import { FaTrash, FaArrowLeft, FaTicketAlt } from "react-icons/fa";
import { BiMinus, BiPlus } from "react-icons/bi";
import { Link } from "react-router-dom";

const Cart = () => {
  // Fake Data giỏ hàng
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Giày Bóng Đá Nike Mercurial",
      price: 2500000,
      qty: 1,
      size: "41",
      image: "https://via.placeholder.com/100",
    },
    {
      id: 2,
      name: "Áo Đấu Manchester United 2025",
      price: 1200000,
      qty: 2,
      size: "M",
      image: "https://via.placeholder.com/100",
    },
    {
      id: 3,
      name: "Găng Tay Thủ Môn Adidas",
      price: 850000,
      qty: 1,
      size: "9",
      image: "https://via.placeholder.com/100",
    },
  ]);

  // Hàm tính tổng tiền
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const shipping = 30000;
  const total = subtotal + shipping;

  // Hàm format tiền VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Breadcrumb / Title */}
        <div className="flex items-center gap-2 mb-8 text-slate-500 text-sm font-medium">
          <span className="hover:text-emerald-600 cursor-pointer">
            Trang chủ
          </span>{" "}
          / <span className="text-slate-900">Giỏ hàng</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-8 uppercase italic border-l-8 border-emerald-500 pl-4">
          Giỏ Hàng Của Bạn{" "}
          <span className="text-lg not-italic font-normal text-gray-500">
            ({cartItems.length} sản phẩm)
          </span>
        </h1>

        {/* Layout Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN: Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Header Table */}
              <div className="hidden md:grid grid-cols-12 bg-slate-100 py-4 px-6 text-sm font-bold text-slate-700 uppercase">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Thành tiền</div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 flex flex-col md:grid md:grid-cols-12 items-center gap-4"
                  >
                    {/* Product Info */}
                    <div className="col-span-6 flex items-center gap-4 w-full">
                      {/* Image Placeholder */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-gray-400">
                          IMG
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Size: {item.size}
                        </p>
                        <button className="text-red-500 text-sm flex items-center gap-1 mt-2 hover:underline">
                          <FaTrash /> Xóa
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center font-medium text-slate-600">
                      {formatPrice(item.price)}
                    </div>

                    {/* Quantity Control */}
                    <div className="col-span-2 flex justify-center">
                      <div className="flex items-center border border-slate-300 rounded-lg">
                        <button className="px-2 py-1 hover:bg-slate-100 text-slate-600">
                          <BiMinus />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">
                          {item.qty}
                        </span>
                        <button className="px-2 py-1 hover:bg-slate-100 text-slate-600">
                          <BiPlus />
                        </button>
                      </div>
                    </div>

                    {/* Total Item Price */}
                    <div className="col-span-2 text-right font-bold text-emerald-600 text-lg">
                      {formatPrice(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/">
              <div className="mt-6">
                <span className="flex items-center gap-2 text-slate-600 font-bold hover:text-emerald-600 transition cursor-pointer">
                  <FaArrowLeft />
                  TIẾP TỤC MUA SẮM
                </span>
              </div>
            </Link>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase border-b pb-4">
                Cộng Giỏ Hàng
              </h3>

              <div className="space-y-4 mb-6 text-slate-600">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-medium text-slate-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium text-slate-900">
                    {formatPrice(shipping)}
                  </span>
                </div>

                {/* Mã giảm giá */}
                <div className="pt-4">
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <FaTicketAlt className="absolute left-3 top-3 text-emerald-500" />
                      <input
                        type="text"
                        placeholder="Mã giảm giá"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                      />
                    </div>

                    <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 flex-shrink-0">
                      ÁP DỤNG
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4 flex justify-between items-end">
                  <span className="font-bold text-lg text-slate-800">
                    Tổng cộng:
                  </span>
                  <span className="font-black text-2xl text-red-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button className="w-full bg-emerald-600 text-white py-4 rounded-lg font-black uppercase text-lg shadow-lg hover:bg-emerald-500 hover:shadow-emerald-500/40 transition-all transform active:scale-95">
                THANH TOÁN NGAY
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  Chúng tôi chấp nhận thanh toán qua:
                </p>
                <div className="flex justify-center gap-2 mt-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                  {/* Có thể thêm icon Visa/Momo/Banking ở đây */}
                  <div className="h-6 w-10 bg-blue-900 rounded"></div>
                  <div className="h-6 w-10 bg-pink-600 rounded"></div>
                  <div className="h-6 w-10 bg-green-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
