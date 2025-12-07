import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  Heart,
  Phone,
  LogIn,
  UserPlus,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Package,
  UserCircle,
  Trophy,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import defaultAvatar from "../assets/react.svg";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useAuth();
  const { currentUser } = state;

  const handleLoginClick = () => {
    navigate("/login", { state: { from: location } });
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/api/auth/logout", {
        withCredentials: true,
      });
      dispatch({ type: "AUTH_FAILURE" });
      navigate("/");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --- MENU CỐ ĐỊNH CHO BÓNG ĐÁ ---
  const categories = [
    { name: "Giày cỏ nhân tạo", path: "/category/giay-co-nhan-tao" },
    { name: "Áo đấu CLB", path: "/category/ao-dau" },
    { name: "Găng thủ môn", path: "/category/gang-tay" },
    { name: "Bóng thi đấu", path: "/category/bong-da" },
    { name: "Phụ kiện", path: "/category/phu-kien" },
  ];

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50 font-sans">
      {/* TOP BAR - Đổi màu sang Đen/Xám */}
      <div className="bg-gray-900 text-white text-xs py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p className="hidden md:block font-medium">
            ⚽ PitchPro - Chuyên đồ bóng đá chính hãng | Đổi size trong 7 ngày
          </p>
          <div className="flex items-center gap-4 mx-auto md:mx-0">
            <span className="flex items-center gap-1 hover:text-green-400 cursor-pointer">
              <Phone size={14} /> Hotline: 0909 888 999
            </span>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex justify-between items-center w-full md:w-auto">
            <Link
              to="/"
              className="text-2xl font-black text-gray-900 flex items-center gap-1 italic tracking-tighter"
            >
              PITCH<span className="text-green-600">PRO</span>{" "}
              <Trophy className="text-yellow-500 mb-1" size={20} />
            </Link>
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:max-w-xl">
            <input
              type="text"
              placeholder="Tìm tên cầu thủ, đội bóng, loại giày..."
              className="w-full py-2 pl-4 pr-12 border-2 border-gray-200 rounded-full focus:outline-none focus:border-green-600 focus:ring-0 transition-all"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 text-white p-1.5 rounded-full hover:bg-green-700 transition-colors">
              <Search size={20} />
            </button>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-6">
            <div className="relative group z-20">
              <div className="flex flex-col items-center cursor-pointer pb-2 md:pb-0">
                {currentUser ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={currentUser.avatar || defaultAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <User
                    size={24}
                    className="text-gray-600 group-hover:text-green-600 transition-colors"
                  />
                )}
                <span className="text-xs text-gray-500 mt-1 group-hover:text-green-600 flex items-center gap-0.5 max-w-[100px] truncate">
                  {currentUser ? currentUser.fullname : "Tài khoản"}{" "}
                  <ChevronDown size={10} />
                </span>
              </div>

              {/* Dropdown giữ nguyên logic, chỉ đổi màu hover */}
              <div className="absolute right-0 top-full mt-0 w-60 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block">
                {/* ... (Giữ nguyên logic menu dropdown user, đổi hover:bg-blue thành hover:bg-green nếu thích) ... */}
                {currentUser ? (
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {currentUser.fullname}
                      </p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    <button
                      onClick={handleLoginClick}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md"
                    >
                      <LogIn size={16} /> Đăng nhập
                    </button>
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/cart"
              className="flex flex-col items-center cursor-pointer group relative"
            >
              <div className="relative">
                <ShoppingCart
                  size={24}
                  className="text-gray-600 group-hover:text-green-600 transition-colors"
                />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  2
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-1">Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* NAVIGATION MENU */}
      <nav
        className={`bg-gray-100 border-t border-gray-200 transition-all duration-300 ${
          isMobileMenuOpen ? "block" : "hidden md:block"
        }`}
      >
        <div className="container mx-auto px-4">
          <ul className="flex flex-col md:flex-row md:items-center md:gap-8 py-2 md:py-0">
            <li className="py-2 md:py-3 border-b md:border-none">
              <Link
                to="/products"
                className="font-bold text-green-700 hover:text-green-800 flex items-center gap-2 uppercase text-sm"
              >
                <Menu size={18} /> Tất cả sản phẩm
              </Link>
            </li>
            {categories.map((cat, index) => (
              <li key={index} className="py-2 md:py-3 border-b md:border-none">
                <Link
                  to={cat.path}
                  className="text-gray-700 font-bold hover:text-green-600 transition-colors block text-sm uppercase"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li className="py-2 md:py-3 md:ml-auto text-red-600 font-bold hover:text-red-700 cursor-pointer uppercase text-sm italic">
              🔥 Xả Kho Cuối Mùa
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
