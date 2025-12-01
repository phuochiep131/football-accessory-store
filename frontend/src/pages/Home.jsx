import { BiFootball } from "react-icons/bi";
import { FaFire, FaRunning, FaTshirt, FaShoppingCart } from "react-icons/fa";
import { GiSoccerKick, GiWhistle, GiGloves, GiTrophyCup } from "react-icons/gi";
import { Link } from "react-router-dom";

const Home = () => {
  const products = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Sản phẩm ${i + 1}`,
    price: "500.000 đ",
    oldPrice: "750.000 đ",
    sold: 10 + i * 5,
  }));

  // Data giả lập Danh mục (Category 1 -> 8)
  const categories = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Danh mục ${i + 1}`,
    icon: [
      <GiSoccerKick />,
      <FaTshirt />,
      <GiWhistle />,
      <GiGloves />,
      <FaRunning />,
      <GiTrophyCup />,
      <BiFootball />,
      <FaFire />,
    ][i % 8],
  }));

  return (
    // Container chính, giữ màu nền xám nhạt cho đồng bộ
    <div className="w-full bg-slate-50 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-12">
        {/* --- 1. SECTION BANNER --- */}
        <div className="w-full h-[350px] md:h-[450px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl flex items-center px-8 md:px-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-600 via-slate-900 to-black"></div>

          <div className="relative z-10 text-white max-w-xl">
            <span className="inline-block py-1 px-3 bg-emerald-500 rounded text-xs font-bold mb-4 text-black">
              NEW SEASON 2025
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-6 italic">
              Bứt phá <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Mọi Giới Hạn
              </span>
            </h1>
            <p className="text-gray-300 mb-8 text-lg">
              Trang bị đẳng cấp cho những trận cầu đỉnh cao.
            </p>
            <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-emerald-400 hover:text-black transition-all transform hover:scale-105 shadow-lg">
              MUA NGAY
            </button>
          </div>

          {/* Decoration Circle (Hiệu ứng ánh sáng xanh) */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600 blur-[100px] opacity-30 rounded-full"></div>
        </div>

        {/* --- 2. SECTION DANH MỤC --- */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black uppercase text-slate-800 border-l-4 border-emerald-500 pl-3">
              Danh Mục Nổi Bật
            </h2>
            <a
              href="#"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Xem tất cả
            </a>
          </div>

          <Link to="/products">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer border border-slate-100 flex flex-col items-center justify-center gap-3 group h-32"
                >
                  <div className="text-3xl text-slate-400 group-hover:text-emerald-600 transition-colors">
                    {cat.icon}
                  </div>
                  <span className="font-bold text-slate-700 text-sm text-center group-hover:text-black uppercase">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </Link>
        </div>

        {/* --- 3. SECTION SẢN PHẨM (BEST SELLER) --- */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-100 p-2 rounded-full">
              <FaFire className="text-orange-600 text-xl" />
            </div>
            <h2 className="text-2xl font-black uppercase text-slate-800">
              Sản Phẩm Bán Chạy
            </h2>
          </div>

          <Link to="/product/:id">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="group relative">
                  {/* Card Image Placeholder */}
                  <div className="w-full h-64 bg-gray-200 rounded-xl mb-4 overflow-hidden relative">
                    {/* Sau này thay div này bằng thẻ img */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-slate-100 group-hover:bg-slate-200 transition-colors">
                      <BiFootball className="text-5xl opacity-20 mb-2" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Image
                      </span>
                    </div>
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                      -30%
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors cursor-pointer">
                      {product.name}
                    </h3>

                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-sm line-through">
                          {product.oldPrice}
                        </span>
                        <span className="text-red-600 font-black text-xl">
                          {product.price}
                        </span>
                      </div>
                      {/* Nút thêm vào giỏ hàng */}
                      <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <FaShoppingCart />
                      </button>
                    </div>

                    {/* Thanh đã bán */}
                    <div className="pt-2">
                      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-red-500 w-2/3"></div>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
                        <span>Đã bán: {product.sold}</span>
                        <span className="text-emerald-600 font-bold">
                          Còn hàng
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Link>

          {/* Nút xem thêm */}
          <div className="mt-10 flex justify-center">
            <button className="border-2 border-slate-900 text-slate-900 font-bold py-2 px-10 rounded-full hover:bg-slate-900 hover:text-white transition-all">
              XEM THÊM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
