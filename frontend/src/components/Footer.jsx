import { BiFootball } from "react-icons/bi";
import {
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaInstagram,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-white pt-16 pb-8 border-t-4 border-emerald-500">
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Cột 1: Logo & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <BiFootball className="text-xl" />
              </div>
              <span className="font-bold text-2xl italic">SPORTZONE</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Hệ thống bán lẻ dụng cụ bóng đá chính hãng hàng đầu. Đồng hành
              cùng đam mê sân cỏ của bạn.
            </p>
            <div className="flex gap-4 pt-2">
              <FaFacebook className="text-2xl hover:text-blue-500 cursor-pointer" />
              <FaTiktok className="text-2xl hover:text-white cursor-pointer" />
              <FaYoutube className="text-2xl hover:text-red-600 cursor-pointer" />
              <FaInstagram className="text-2xl hover:text-pink-500 cursor-pointer" />
            </div>
          </div>

          {/* Cột 2: Thông tin liên hệ */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-emerald-400 uppercase">
              Liên Hệ
            </h3>
            <div className="space-y-4 text-gray-300 text-sm">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-emerald-500" />
                <span>
                  126 Nguyễn Thiện Thành, Phường Hòa Thuận, Tỉnh Vĩnh Long
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-emerald-500" />
                <span>contact@sportzone.vn</span>
              </div>
              <div className="flex items-center gap-3">
                <FaPhoneAlt className="text-emerald-500" />
                <span>1900 123 456</span>
              </div>
            </div>
          </div>

          {/* Cột 3: Danh mục (Placeholder) */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-emerald-400 uppercase">
              Hỗ Trợ
            </h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>
                <a href="#" className="hover:text-emerald-400 transition">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition">
                  Hướng dẫn chọn size
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition">
                  Kiểm tra đơn hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition">
                  Liên hệ hợp tác
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Đăng ký tin */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-emerald-400 uppercase">
              Nhận Ưu Đãi
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Đăng ký để nhận mã giảm giá 10% cho đơn hàng đầu tiên.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full px-4 py-2 rounded-l bg-slate-800 border border-slate-700 focus:outline-none focus:border-emerald-500 text-white"
              />
              <button className="bg-emerald-600 px-4 py-2 rounded-r font-bold hover:bg-emerald-700 transition">
                GỬI
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-gray-500 text-sm">
          © 2025 SportZone - All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
