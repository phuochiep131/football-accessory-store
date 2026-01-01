import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
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

// --- IMPORT CONTEXT ---
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import defaultAvatar from "../assets/react.svg";

// Đảm bảo URL API đúng với Backend của bạn
const API_URL = "http://localhost:5000/api";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- STATE DANH MỤC (Lấy từ DB) ---
  const [categories, setCategories] = useState([]);

  // --- STATE TÌM KIẾM ---
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // --- STATE SCROLL ---
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { state, dispatch } = useAuth();
  const { currentUser } = state;

  // --- 1. GỌI API LẤY DANH MỤC TỪ CSDL ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data); // Gán dữ liệu từ DB vào state
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        // Fallback data nếu lỗi API (để demo không bị trắng trang)
        setCategories([
          { _id: "1", name: "Giày Đá Bóng" },
          { _id: "2", name: "Áo Đấu" },
          { _id: "3", name: "Phụ Kiện" },
        ]);
      }
    };
    fetchCategories();
  }, []);

  // --- XỬ LÝ SCROLL ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (keyword.trim().length > 1) {
        try {
          const res = await axios.get(
            `${API_URL}/products?keyword=${encodeURIComponent(keyword.trim())}`
          );
          setSuggestions(res.data.slice(0, 5));
          setShowSuggestions(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
    setKeyword("");
  };

  const handleLoginClick = () => {
    navigate("/login", { state: { from: location } });
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`, { withCredentials: true });
      dispatch({ type: "AUTH_FAILURE" });
      navigate("/");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActiveCategory = (catId) =>
    location.pathname === `/category/${catId}`;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // --- LOGIC CHIA DANH MỤC (CHỐNG VỠ GIAO DIỆN) ---
  // Hiển thị tối đa 5 items, còn lại đưa vào "Xem thêm"
  const MAX_VISIBLE_CATS = 5;
  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATS);
  const hiddenCategories = categories.slice(MAX_VISIBLE_CATS);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-all duration-300 font-sans">
      {/* --- TOP BAR --- */}
      <div
        className="bg-gray-900 text-white text-xs overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          height: isScrollingDown ? "0px" : "32px",
          opacity: isScrollingDown ? 0 : 1,
        }}
      >
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
          <p className="hidden md:block font-medium">
            ⚽ PitchPro - Chuyên đồ bóng đá chính hãng | Đổi size trong 7 ngày
          </p>
          <div className="flex items-center gap-4 mx-auto md:mx-0">
            <span className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition-colors">
              <Phone size={14} /> Hotline: 0909 888 999
            </span>
          </div>
        </div>
      </div>

      {/* --- MAIN HEADER --- */}
      <div className="container mx-auto px-4 py-4 bg-white relative z-50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
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
          <div className="relative w-full md:max-w-xl" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Tìm tên cầu thủ, đội bóng, giày..."
                className="w-full py-2 pl-4 pr-12 border-2 border-gray-200 rounded-full focus:outline-none focus:border-green-600 focus:ring-0 transition-all"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 text-white p-1.5 rounded-full hover:bg-green-700 transition-colors"
              >
                <Search size={20} />
              </button>
            </form>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-xl mt-2 border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <ul>
                  {suggestions.map((product) => {
                    const price =
                      product.price * (1 - (product.discount || 0) / 100);
                    return (
                      <li
                        key={product._id}
                        onClick={() => handleSuggestionClick(product._id)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 flex items-center gap-3"
                      >
                        <img
                          src={
                            product.image_url || "https://placehold.co/50x50"
                          }
                          alt={product.product_name}
                          className="w-10 h-10 object-contain rounded border"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-800 line-clamp-1 uppercase">
                            {product.product_name}
                          </h4>
                          <span className="text-xs font-bold text-red-600">
                            {formatCurrency(price)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
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

              {/* Dropdown User */}
              <div className="absolute right-0 top-full mt-0 w-60 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
                {currentUser ? (
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="font-bold text-gray-800 truncate">
                        {currentUser.fullname}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <div className="p-1">
                      {(currentUser.role === "Admin" ||
                        currentUser.role === "admin") && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded mb-1 font-semibold"
                        >
                          <LayoutDashboard size={16} /> Quản trị
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded"
                      >
                        <UserCircle size={16} /> Hồ sơ
                      </Link>
                      <Link
                        to="/my-orders"
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded"
                      >
                        <Package size={16} /> Đơn mua
                      </Link>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded text-left"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    <button
                      onClick={handleLoginClick}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded"
                    >
                      <LogIn size={16} /> Đăng nhập
                    </button>
                    <Link
                      to="/register"
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded"
                    >
                      <UserPlus size={16} /> Đăng ký
                    </Link>
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
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-1">Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* --- MENU CATEGORY --- */}
      <nav
        className={`bg-gray-100 border-gray-200 transition-all duration-500 ease-in-out origin-top overflow-visible ${
          isMobileMenuOpen ? "block h-auto" : "hidden md:block"
        }`}
        style={{
          height: isMobileMenuOpen ? "auto" : isScrollingDown ? "0px" : "48px",
          opacity: isMobileMenuOpen ? 1 : isScrollingDown ? 0 : 1,
          borderTopWidth: isScrollingDown ? "0px" : "1px",
        }}
      >
        <div className="container mx-auto px-4">
          <ul className="flex flex-col md:flex-row md:items-center md:gap-6 py-2 md:py-0">
            {/* Mobile Auth Section */}
            <li className="md:hidden border-b border-gray-200 pb-2 mb-2">
              {/* (Mobile Auth UI logic tương tự bên trên - đã rút gọn cho gọn code) */}
              {!currentUser && (
                <button
                  onClick={handleLoginClick}
                  className="w-full py-2 bg-green-600 text-white rounded"
                >
                  Đăng nhập ngay
                </button>
              )}
            </li>

            {/* DANH MỤC HIỂN THỊ TRỰC TIẾP (Top 5) */}
            {visibleCategories.map((cat) => (
              <li
                key={cat._id}
                className="py-2 md:py-3 border-b md:border-none"
              >
                <Link
                  to={`/category/${cat._id}`}
                  className={`block text-sm uppercase font-bold transition-colors ${
                    isActiveCategory(cat._id)
                      ? "text-green-600 border-b-2 border-green-600 md:pb-[10px]"
                      : "text-gray-700 hover:text-green-600"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              </li>
            ))}

            {/* MENU "XEM THÊM" (Nếu có > 5 danh mục) */}
            {hiddenCategories.length > 0 && (
              <li className="relative group py-2 md:py-3 border-b md:border-none hidden md:block">
                <span className="flex items-center gap-1 text-sm uppercase font-bold text-gray-700 hover:text-green-600 cursor-pointer">
                  Xem thêm <ChevronDown size={14} />
                </span>
                <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-b-lg border border-gray-100 hidden group-hover:block z-50">
                  <ul className="py-2">
                    {hiddenCategories.map((cat) => (
                      <li key={cat._id}>
                        <Link
                          to={`/category/${cat._id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            )}

            {/* Mobile: Hiển thị hết danh mục ẩn khi mở menu */}
            {isMobileMenuOpen &&
              hiddenCategories.map((cat) => (
                <li key={`mb-${cat._id}`} className="py-2 border-b">
                  <Link
                    to={`/category/${cat._id}`}
                    className="block text-sm uppercase font-bold text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}

            <li className="py-2 md:py-3 md:ml-auto text-red-600 font-bold hover:text-red-700 cursor-pointer uppercase text-sm italic animate-pulse">
              🔥 Xả Kho Cuối Mùa
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
