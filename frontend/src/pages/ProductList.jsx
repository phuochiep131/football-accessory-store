import { useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaShoppingCart,
  FaSearch,
} from "react-icons/fa";
import { BiFootball, BiSliderAlt } from "react-icons/bi";

// --- Dữ liệu giả lập ---

// 1. Sản phẩm (tạo 12 sản phẩm để lấp đầy trang)
const products = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Sản phẩm ${i + 1}`,
  price: (Math.floor(Math.random() * 10) + 5) * 100000, // Giá ngẫu nhiên
  oldPrice: (Math.floor(Math.random() * 10) + 15) * 100000, // Giá cũ ngẫu nhiên
}));

// 2. Dữ liệu bộ lọc
const brands = ["Nike", "Adidas", "Puma", "Mizuno", "Kamito", "Jogarbola"];
const sizes = ["39", "40", "41", "42", "43", "44", "45"];

// Hàm format tiền
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// --- Component Card Sản Phẩm (Tái sử dụng) ---
const ProductCard = ({ product }) => (
  <div className="group relative bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
    {/* Placeholder Ảnh */}
    <div className="w-full h-48 bg-slate-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
      <BiFootball className="text-5xl text-slate-300" />
      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
        -25%
      </span>
    </div>
    {/* Info */}
    <div className="space-y-2">
      <h3 className="font-bold text-slate-800 text-md h-12 line-clamp-2 group-hover:text-emerald-600 transition-colors">
        {product.name}
      </h3>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm line-through">
            {formatPrice(product.oldPrice)}
          </span>
          <span className="text-red-600 font-black text-lg">
            {formatPrice(product.price)}
          </span>
        </div>
        <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
          <FaShoppingCart />
        </button>
      </div>
    </div>
  </div>
);

// --- Component Chính Của Trang ---
const CategoryPage = () => {
  // State cho bộ lọc (ví dụ: filter nào đang mở)
  const [openFilters, setOpenFilters] = useState(["brand", "size"]);

  // Hàm toggle mở/đóng filter
  const toggleFilter = (filterName) => {
    setOpenFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((f) => f !== filterName)
        : [...prev, filterName]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* --- Breadcrumb --- */}
        <div className="mb-4 text-sm text-slate-500">
          <a href="/" className="hover:text-emerald-600">
            Trang chủ
          </a>{" "}
          /<span className="text-slate-800 font-medium"> Danh mục 1</span>
        </div>

        {/* --- Tiêu đề & Banner Danh Mục (Tùy chọn) --- */}
        <div className="w-full h-48 bg-gradient-to-r from-slate-900 to-emerald-800 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
          <h1 className="text-4xl font-black text-white uppercase italic tracking-widest">
            GIÀY ĐÁ BÓNG
          </h1>
        </div>

        {/* --- Layout 2 Cột (Filter & Grid) --- */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* CỘT TRÁI: SIDEBAR BỘ LỌC */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5 sticky top-24">
              <h3 className="text-xl font-black uppercase text-slate-800 border-l-4 border-emerald-500 pl-3 mb-5">
                Bộ Lọc
              </h3>

              {/* Lọc theo Thương hiệu */}
              <div className="border-t border-slate-200 py-5">
                <button
                  onClick={() => toggleFilter("brand")}
                  className="w-full flex justify-between items-center mb-3"
                >
                  <span className="font-bold text-slate-700">Thương hiệu</span>
                  {openFilters.includes("brand") ? (
                    <FaChevronDown size={12} />
                  ) : (
                    <FaChevronRight size={12} />
                  )}
                </button>
                {openFilters.includes("brand") && (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-black"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-emerald-600"
                        />
                        {brand}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Lọc theo Kích cỡ */}
              <div className="border-t border-slate-200 py-5">
                <button
                  onClick={() => toggleFilter("size")}
                  className="w-full flex justify-between items-center mb-4"
                >
                  <span className="font-bold text-slate-700">Kích cỡ</span>
                  {openFilters.includes("size") ? (
                    <FaChevronDown size={12} />
                  ) : (
                    <FaChevronRight size={12} />
                  )}
                </button>
                {openFilters.includes("size") && (
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => (
                      <label key={size} className="relative cursor-pointer">
                        <input
                          type="checkbox"
                          className="absolute opacity-0 peer"
                        />
                        <span className="w-full h-10 flex items-center justify-center rounded-lg border border-slate-300 text-sm font-bold text-slate-600 peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 hover:border-slate-500 transition-all">
                          {size}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Lọc theo Giá */}
              <div className="border-t border-slate-200 py-5">
                <span className="font-bold text-slate-700">Khoảng giá</span>
                <div className="mt-4">
                  {/* (Slider giá sẽ phức tạp, tạm dùng input) */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      className="w-1/2 p-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="number"
                      placeholder="Đến"
                      className="w-1/2 p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Nút lọc */}
              <button className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-slate-900 transition-all">
                ÁP DỤNG
              </button>
            </div>
          </aside>

          {/* CỘT PHẢI: LƯỚI SẢN PHẨM */}
          <main className="lg:w-3/4">
            {/* Header (Sắp xếp & Nút) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col md:flex-row justify-between items-center">
              <span className="font-bold text-slate-600 text-sm">
                Hiển thị {products.length} sản phẩm
              </span>

              <div className="flex items-center gap-4 mt-3 md:mt-0">
                {/* Nút bật/tắt filter trên mobile */}
                <button className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
                  <BiSliderAlt className="text-xl" />
                </button>

                <div className="relative">
                  <select className="appearance-none bg-slate-100 border border-slate-200 rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-emerald-500 transition-all">
                    <option>Sắp xếp: Mới nhất</option>
                    <option>Giá: Tăng dần</option>
                    <option>Giá: Giảm dần</option>
                    <option>Tên: A-Z</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Lưới sản phẩm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Phân trang (Pagination) */}
            <div className="mt-10 flex justify-center">
              <nav className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-lg bg-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-300">
                  Trước
                </button>
                <button className="w-10 h-10 rounded-lg bg-slate-900 text-white text-sm font-bold">
                  1
                </button>
                <button className="w-10 h-10 rounded-lg bg-white text-slate-700 text-sm font-bold hover:bg-slate-100">
                  2
                </button>
                <button className="w-10 h-10 rounded-lg bg-white text-slate-700 text-sm font-bold hover:bg-slate-100">
                  3
                </button>
                <button className="px-4 py-2 rounded-lg bg-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-300">
                  Sau
                </button>
              </nav>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
