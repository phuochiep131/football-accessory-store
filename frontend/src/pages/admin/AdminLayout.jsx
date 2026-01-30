import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  LogOut,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronDown,
  MessageSquare,
  Zap
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useAuth();
  const { currentUser } = state;
const API_URL = import.meta.env.VITE_BEKCEND_API_URL || "http://localhost:5000/api";
  // Hàm đăng xuất
  const handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`, {
        withCredentials: true,
      });
      dispatch({ type: "AUTH_FAILURE" });
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  // Danh sách menu
  const menuItems = [
    {
      path: "/admin/dashboard",
      name: "Tổng quan",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: "/admin/categories",
      name: "Danh mục",
      icon: <Settings size={20} />, // Đổi icon cho hợp lý hơn
    },
    {
      path: "/admin/products",
      name: "Sản phẩm",
      icon: <Package size={20} />,
    },
    {
      path: "/admin/orders",
      name: "Đơn hàng",
      icon: <ShoppingCart size={20} />,
    },
    {
      path: "/admin/users",
      name: "Người dùng",
      icon: <Users size={20} />,
    },
    {
      path: "/admin/reviews",
      name: "Đánh giá",
      icon: <MessageSquare size={20} />,
    },
    {
      path: "/admin/flash-sales",
      name: "Flash Sale",
      icon: <Zap size={20} />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl transition-all duration-300 z-50">
        {/* Brand Logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <span className="font-black text-xl italic text-white">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">
                PITCH<span className="text-blue-500">PRO</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Quản lý cửa hàng
          </p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-white/20"></div>
                )}

                <span
                  className={`${
                    isActive
                      ? "text-white"
                      : "group-hover:text-blue-400 transition-colors"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User & Logout Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
              {currentUser?.fullname?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentUser?.fullname || "Admin User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {currentUser?.email || "admin@pitchpro.com"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg transition-all text-sm font-medium"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* HEADER (Top Bar) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex justify-between items-center px-8 z-40 sticky top-0">
          {/* Left: Search Bar (Giả lập) */}
          <div className="hidden md:flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng, sản phẩm..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm transition-all outline-none"
              />
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-gray-600">
            <Menu size={24} />
          </button>

          {/* Right: Actions */}
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-gray-200"></div>

            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  Quản trị viên
                </p>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                  Online
                </span>
              </div>
              <ChevronDown
                size={16}
                className="text-gray-400 group-hover:text-gray-600"
              />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
