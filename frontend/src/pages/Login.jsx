import { FaFacebook, FaGoogle } from "react-icons/fa";
import { BiFootball } from "react-icons/bi";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* LEFT: Image/Banner Section */}
        <div className="w-full md:w-1/2 bg-slate-900 relative hidden md:flex flex-col items-center justify-center p-12 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-800 to-slate-900 opacity-80"></div>
          {/* Pattern lưới mờ */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/50">
              <BiFootball className="text-4xl text-white" />
            </div>
            <h2 className="text-3xl font-black italic tracking-wider">
              SPORT<span className="text-emerald-400">ZONE</span>
            </h2>
            <p className="mt-4 text-gray-300">
              Đăng nhập để theo dõi đơn hàng và nhận ưu đãi riêng cho thành
              viên.
            </p>
          </div>
        </div>

        {/* RIGHT: Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Chào mừng trở lại!
          </h2>
          <p className="text-gray-500 mb-8">
            Vui lòng nhập thông tin đăng nhập của bạn.
          </p>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-emerald-600 w-4 h-4" />
                <span className="text-slate-600">Ghi nhớ đăng nhập</span>
              </label>
              <a
                href="#"
                className="text-emerald-600 font-bold hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>

            <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/30">
              ĐĂNG NHẬP
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <FaGoogle className="text-red-500" />
                <span className="text-sm font-medium text-slate-700">
                  Google
                </span>
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <FaFacebook className="text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  Facebook
                </span>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link to="/register">
              <span className="text-emerald-600 font-bold hover:underline cursor-pointer">
                Đăng ký ngay
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
