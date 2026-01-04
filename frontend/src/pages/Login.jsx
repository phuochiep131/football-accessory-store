import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Facebook,
  Chrome,
  Trophy,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useAuth();

  const stateData = location.state;

  const [formData, setFormData] = useState({
    username: stateData?.username || "",
    password: stateData?.password || "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    axios
      .post(
        `http://localhost:5000/api/auth/login`,
        {
          username: formData.username,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.data && response.data.user) {
          dispatch({ type: "AUTH_SUCCESS", payload: response.data.user });

          setTimeout(() => {
            setIsLoading(false);
            if (stateData?.action === "redirect") {
              navigate(stateData.url);
            } else {
              navigate("/");
            }
          }, 500);
        } else {
          setError("Phản hồi từ máy chủ không hợp lệ.");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Lỗi chi tiết:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Tên đăng nhập hoặc mật khẩu không chính xác.";
        setError(msg);
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
        <div className="hidden md:flex md:w-1/2 bg-green-900 relative flex-col justify-between p-12 text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop"
              alt="Football Background"
              className="w-full h-full object-cover opacity-40 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-transparent to-transparent"></div>
          </div>

          <div className="relative z-10">
            <Link
              to="/"
              className="text-3xl font-black flex items-center gap-2 mb-6 italic tracking-wider"
            >
              PITCH<span className="text-yellow-400">PRO</span>
              <Trophy className="text-yellow-400" size={28} />
            </Link>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Chinh phục mọi <br />
              sân cỏ
            </h2>
            <p className="text-green-100 text-lg">
              Giày chính hãng, phụ kiện đỉnh cao cho đam mê của bạn.
            </p>
          </div>          
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white relative">
          <div className="flex justify-end mb-8">
            <Link
              to="/"
              className="text-sm font-semibold text-gray-500 hover:text-green-600 flex items-center gap-1 transition-colors"
            >
              Trang chủ <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Đăng nhập
            </h2>            
          </div>                    

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
                <span className="font-bold">!</span> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User
                    size={20}
                    className="text-gray-400 group-focus-within:text-green-600 transition-colors"
                  />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên đăng nhập"
                  className="pl-11 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock
                    size={20}
                    className="text-gray-400 group-focus-within:text-green-600 transition-colors"
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="pl-11 pr-11 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-green-600 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-600 cursor-pointer font-medium"
                >
                  Ghi nhớ tôi
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-bold text-green-600 hover:text-green-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "ĐĂNG NHẬP NGAY"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">Thành viên mới? </span>
            <Link
              to="/register"
              className="font-bold text-green-600 hover:text-green-700 hover:underline"
            >
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
