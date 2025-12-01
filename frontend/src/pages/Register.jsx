import { FaGoogle, FaFacebook } from "react-icons/fa";
import { BiFootball } from "react-icons/bi";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row-reverse">
        {/* RIGHT: Image Section (Đảo ngược so với Login để tạo sự khác biệt) */}
        <div className="w-full md:w-1/2 bg-emerald-900 relative hidden md:flex flex-col items-center justify-center p-12 text-white">
          {/* Background Gradient khác biệt chút */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-emerald-800 opacity-90"></div>

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
              <BiFootball className="text-4xl text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black italic tracking-wider">
              JOIN THE TEAM
            </h2>
            <p className="mt-4 text-emerald-100">
              Trở thành thành viên của SportZone ngay hôm nay để nhận hàng ngàn
              ưu đãi hấp dẫn.
            </p>
          </div>
        </div>

        {/* LEFT: Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Tạo tài khoản
          </h2>
          <p className="text-gray-500 mb-6">Điền thông tin để bắt đầu.</p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="0901234567"
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-start gap-2 mt-4">
              <input type="checkbox" className="mt-1 accent-emerald-600" />
              <span className="text-xs text-gray-500">
                Tôi đồng ý với{" "}
                <a href="#" className="text-emerald-600 font-bold">
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" className="text-emerald-600 font-bold">
                  Chính sách bảo mật
                </a>{" "}
                của SportZone.
              </span>
            </div>

            <button className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-slate-900 transition-all shadow-md mt-2">
              ĐĂNG KÝ NGAY
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            {/* <a href="#" className="text-emerald-600 font-bold hover:underline">
              Đăng nhập
            </a> */}
            <Link to="/login">
              <span className="text-emerald-600 font-bold hover:underline cursor-pointer">
                Đăng nhập
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
