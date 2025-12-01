import { BiGridAlt, BiSearch, BiFootball } from "react-icons/bi";
import { FaUser, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="w-full sticky top-0 z-50 bg-white">
      {/* Top Header - Màu đen tạo cảm giác cao cấp */}
      <div className="w-full h-20 flex items-center justify-between px-4 md:px-8 lg:px-16 shadow-md bg-white">
        {/* LOGO: Dùng Gradient Xanh Lá - Đen */}
        <Link to="/">
          <div className="flex-shrink-0 cursor-pointer flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-slate-800 flex items-center justify-center shadow-lg text-white">
              <BiFootball className="text-2xl" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900 italic">
              SPORT<span className="text-emerald-600">ZONE</span>
            </span>
          </div>
        </Link>

        {/* SEARCH & CATEGORY */}
        <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8 gap-4">
          <button className="flex items-center gap-1 font-semibold text-slate-700 hover:text-emerald-600 transition-colors  cursor-pointer">
            <BiGridAlt className="text-2xl" />
            <span className="text-sm">Danh mục</span>
          </button>

          <div className="relative w-full group">
            <input
              type="text"
              placeholder="Tìm kiếm giày, áo đấu..."
              className="w-full h-11 pl-5 pr-12 bg-slate-100 border-2 border-transparent focus:border-emerald-500 rounded-full focus:outline-none text-slate-700 transition-all"
            />
            <button className="absolute right-1 top-1 bg-emerald-600 w-9 h-9 rounded-full flex items-center justify-center hover:bg-emerald-700 text-white transition-colors  cursor-pointer">
              <BiSearch className="text-lg" />
            </button>
          </div>
        </div>

        {/* CART & ACCOUNT */}
        <div className="flex items-center gap-6">
          <Link to="/cart">
            <div className="relative cursor-pointer group">
              <FaShoppingCart className="text-2xl text-slate-800 group-hover:text-emerald-600 transition-colors" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                3
              </span>
            </div>
          </Link>

          <Link to="/login">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                <FaUser />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Decoration Bar - Màu cỏ sân vận động */}
      <div className="w-full h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600"></div>
    </div>
  );
};

export default Navbar;
