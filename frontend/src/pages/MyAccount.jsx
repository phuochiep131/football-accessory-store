import { useState } from "react";
import {
  FaUserCircle,
  FaHistory,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaCamera,
  FaRegEdit,
} from "react-icons/fa";
import { BiFootball } from "react-icons/bi";

const MyProfile = () => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-2xl font-black uppercase text-slate-800">
          Hồ Sơ Của Tôi
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </p>
      </div>

      <div className="flex flex-col lg:flex-row p-6 gap-8">
        {/* Cột trái: Form thông tin */}
        <div className="flex-grow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                value="Nguyễn Văn A"
                className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value="nguyenvana@gmail.com"
                disabled
                className="w-full px-4 py-3 rounded-lg bg-slate-200 border border-slate-300 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value="0901234567"
              className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Ngày sinh
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Giới tính
              </label>
              <div className="flex gap-6 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    className="accent-emerald-600"
                    defaultChecked
                  />{" "}
                  Nam
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    className="accent-emerald-600"
                  />{" "}
                  Nữ
                </label>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <button className="bg-slate-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/30">
              LƯU THAY ĐỔI
            </button>
          </div>
        </div>

        {/* Cột phải: Avatar */}
        <div className="lg:w-1/3 flex flex-col items-center pt-5 lg:border-l lg:border-slate-200 lg:pl-8">
          <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center relative mb-4">
            <FaUserCircle className="text-8xl text-slate-400" />
            {/* Placeholder cho ảnh thật */}
          </div>
          <button className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-all">
            <FaCamera /> Chọn ảnh
          </button>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Dung lượng file tối đa 1 MB
            <br />
            Định dạng: .JPEG, .PNG
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Component cho Tab "Đơn hàng của tôi" ---
const MyOrders = () => {
  // Dữ liệu giả lập
  const orders = [
    {
      id: "#SZN123",
      date: "10/11/2025",
      status: "Đang giao",
      total: "2.500.000 đ",
    },
    {
      id: "#SZN115",
      date: "05/11/2025",
      status: "Đã hoàn thành",
      total: "1.200.000 đ",
    },
    { id: "#SZN101", date: "28/10/2025", status: "Đã hủy", total: "850.000 đ" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-2xl font-black uppercase text-slate-800">
          Đơn Hàng Của Tôi
        </h2>
      </div>

      <div className="p-6">
        {/* Bảng đơn hàng */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm font-bold text-slate-700 uppercase">
              <tr>
                <th className="p-4 rounded-l-lg">Mã Đơn</th>
                <th className="p-4">Ngày Đặt</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4">Tổng Tiền</th>
                <th className="p-4 rounded-r-lg">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="text-slate-600">
                  <td className="p-4 font-bold text-slate-800">{order.id}</td>
                  <td className="p-4">{order.date}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === "Đang giao"
                          ? "bg-blue-100 text-blue-600"
                          : order.status === "Đã hoàn thành"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-red-600">{order.total}</td>
                  <td className="p-4">
                    <button className="text-emerald-600 font-bold hover:underline">
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Component cha: UserProfile (Chứa layout chính) ---
const UserProfile = () => {
  // State để quản lý tab nào đang active
  const [activePage, setActivePage] = useState("profile"); // 'profile', 'orders', 'address'

  // Hàm render nội dung dựa trên state
  const renderPage = () => {
    switch (activePage) {
      case "profile":
        return <MyProfile />;
      case "orders":
        return <MyOrders />;
      case "address":
        return (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
            <h2 className="text-2xl font-black uppercase text-slate-800">
              Sổ Địa Chỉ
            </h2>
            {/* Bạn có thể code tiếp phần Địa chỉ ở đây */}
          </div>
        );
      default:
        return <MyProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* --- Breadcrumb --- */}
        <div className="mb-8 text-sm text-slate-500">
          <a href="/" className="hover:text-emerald-600">
            Trang chủ
          </a>{" "}
          /
          <span className="text-slate-800 font-medium"> Tài khoản của tôi</span>
        </div>

        {/* --- Layout 2 Cột --- */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* CỘT TRÁI: NAVIGATION SIDEBAR */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5 sticky top-24">
              {/* User Info Header */}
              <div className="flex items-center gap-3 pb-5 border-b border-slate-200">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                  <FaUserCircle className="text-3xl text-slate-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-500">Tài khoản của</span>
                  <h3 className="font-bold text-slate-800">Nguyễn Văn A</h3>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="mt-4 space-y-2">
                <button
                  onClick={() => setActivePage("profile")}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg font-bold text-left transition-all ${
                    activePage === "profile"
                      ? "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <FaUserCircle className="text-lg" />
                  Thông tin tài khoản
                </button>

                <button
                  onClick={() => setActivePage("orders")}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg font-bold text-left transition-all ${
                    activePage === "orders"
                      ? "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <FaHistory className="text-lg" />
                  Quản lý đơn hàng
                </button>

                <button
                  onClick={() => setActivePage("address")}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg font-bold text-left transition-all ${
                    activePage === "address"
                      ? "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <FaMapMarkerAlt className="text-lg" />
                  Sổ địa chỉ
                </button>

                <div className="pt-4 border-t border-slate-100">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg font-bold text-left text-red-500 hover:bg-red-50 transition-all">
                    <FaSignOutAlt className="text-lg" />
                    Đăng xuất
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* CỘT PHẢI: CONTENT AREA */}
          <div className="lg:w-3/4">{renderPage()}</div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
