import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// --- ICONS ---
import { BiFootball } from "react-icons/bi";
import {
  FaRunning,
  FaTshirt,
  FaChevronRight,
  FaShieldAlt,
  FaChevronDown,
} from "react-icons/fa";
import {
  GiSoccerKick,
  GiWhistle,
  GiGloves,
  GiTrophyCup,
  GiBackpack,
  GiWaterBottle,
  GiSocks,
} from "react-icons/gi";

// --- COMPONENTS & ASSETS ---
import ProductCard from "../components/ProductCard";
import MainBanner from "../assets/banner_to.jpg";
import TopBanner from "../assets/top_banner.jpg";
import BottomBanner from "../assets/bottom_banner.jpg";

const API_URL = "http://localhost:5000/api";

const getCategoryStyle = (name) => {
  if (!name)
    return {
      icon: <GiTrophyCup size={28} />,
      color: "bg-gray-100 text-gray-600",
    };
  const lower = name.toLowerCase();
  if (lower.includes("giày"))
    return {
      icon: <GiSoccerKick size={28} />,
      color: "bg-green-100 text-green-700",
    };
  if (
    name.toLowerCase() === "bóng đá" ||
    (lower.includes("bóng") && !lower.includes("giày"))
  )
    return {
      icon: <BiFootball size={28} />,
      color: "bg-orange-100 text-orange-600",
    };
  if (lower.includes("găng"))
    return { icon: <GiGloves size={28} />, color: "bg-blue-100 text-blue-600" };
  if (lower.includes("bảo vệ"))
    return {
      icon: <FaShieldAlt size={24} />,
      color: "bg-teal-100 text-teal-700",
    };
  if (lower.includes("áo"))
    return { icon: <FaTshirt size={24} />, color: "bg-red-100 text-red-600" };
  if (lower.includes("túi") || lower.includes("balo"))
    return {
      icon: <GiBackpack size={28} />,
      color: "bg-purple-100 text-purple-700",
    };
  if (lower.includes("vớ") || lower.includes("tất"))
    return { icon: <GiSocks size={28} />, color: "bg-pink-100 text-pink-600" };
  if (lower.includes("tập luyện"))
    return {
      icon: <FaRunning size={26} />,
      color: "bg-yellow-100 text-yellow-700",
    };
  if (lower.includes("còi"))
    return {
      icon: <GiWhistle size={28} />,
      color: "bg-yellow-100 text-yellow-700",
    };
  if (lower.includes("bình nước"))
    return {
      icon: <GiWaterBottle size={28} />,
      color: "bg-cyan-100 text-cyan-700",
    };
  return {
    icon: <GiTrophyCup size={28} />,
    color: "bg-gray-100 text-gray-600",
  };
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, productRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/products`),
        ]);
        setCategories(categoryRes.data);
        setProducts(productRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-green-600 gap-2 bg-gray-50">
        <FaRunning className="animate-bounce" size={30} /> Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      {/* --- 1. HERO SECTION (BANNER) --- */}
      {/* Quan trọng: h-auto để grid tự giãn theo nội dung, tránh bị đè */}
      <section className="container mx-auto px-4 py-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">
          {/* CỘT TRÁI (8 phần) */}
          <div className="md:col-span-8 flex flex-col gap-6">
            {/* Banner Chính (Trái - Trên) */}
            {/* Desktop cao 340px */}
            <div className="relative rounded-3xl overflow-hidden shadow-md group cursor-pointer h-[280px] md:h-[340px] w-full">
              <img
                src={MainBanner}
                alt="Main Banner"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex flex-col justify-center p-8 md:p-12 text-white">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 max-w-xl">
                  <span className="bg-yellow-400 text-black text-[10px] md:text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block shadow-sm">
                    New Season 2024
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black italic mb-3 leading-tight drop-shadow-lg">
                    BỨT TỐC & <br /> GHI BÀN
                  </h2>
                  <p className="text-gray-200 text-sm md:text-base mb-6 font-medium leading-relaxed drop-shadow-md hidden md:block">
                    Bộ sưu tập giày cỏ nhân tạo mới nhất. Giảm 50% cho thành
                    viên VIP.
                  </p>
                  <button className="bg-white text-green-800 px-6 py-2.5 rounded-full font-bold hover:bg-green-600 hover:text-white transition-all uppercase text-xs flex items-center gap-2 w-fit shadow-lg transform hover:-translate-y-1">
                    Mua ngay <FaChevronRight size={10} />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-md group cursor-pointer h-[520px] md:h-[540px] w-full">
              <img
                src={BottomBanner}
                alt="Sub Banner Left Bottom"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <div className="text-white w-full flex justify-between items-end">
                  <div>
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block">
                      HOT SALE
                    </span>
                    <h4 className="text-xl md:text-2xl font-black uppercase italic">
                      Siêu Sale Newcastle
                    </h4>
                    <p className="text-xs md:text-sm text-gray-200">
                      Áo đấu sân nhà 2024/25
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (4 phần) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Banner Phải 1 */}
            {/* Desktop cao 260px */}
            <div className="flex-1 rounded-3xl overflow-hidden shadow-md relative cursor-pointer group h-[180px] md:h-[260px] w-full">
              <img
                src={TopBanner}
                alt="Right Top"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-white z-10">
                <h4 className="text-xl md:text-2xl font-black uppercase italic drop-shadow-md">
                  Áo đấu CLB
                </h4>
                <p className="text-xs font-medium text-gray-200">
                  Mới nhất 2024
                </p>
              </div>
            </div>

            {/* Banner Phải 2 */}
            {/* Desktop cao 260px -> Tổng cột phải = 260 + 260 + 24(gap) = 544px (Khớp với cột trái) */}
            <div className="flex-1 rounded-3xl overflow-hidden shadow-md relative cursor-pointer group h-[180px] md:h-[260px] w-full">
              <img
                src={BottomBanner}
                alt="Right Bottom"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-white z-10">
                <h4 className="text-xl md:text-2xl font-black uppercase italic drop-shadow-md">
                  Găng Thủ Môn
                </h4>
                <p className="text-xs font-medium text-gray-200">
                  Dính bóng cực đỉnh
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. DANH MỤC SẢN PHẨM --- */}
      {/* relative z-10 để đảm bảo hiển thị đúng layer */}
      <section className="container mx-auto px-4 mt-8 mb-16 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1.5 h-10 bg-green-600 rounded-full"></div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            Danh mục nổi bật
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((cat) => {
            const style = getCategoryStyle(cat.name);
            return (
              <Link to={`/category/${cat._id}`} key={cat._id} className="group">
                <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-green-100 flex flex-col items-center gap-4 cursor-pointer h-full transform hover:-translate-y-1">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner ${style.color}`}
                  >
                    {style.icon}
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-green-700 text-center uppercase tracking-wide">
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- 3. SẢN PHẨM TUYỂN CHỌN --- */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">
              Hàng Tuyển Chọn
            </h3>
            <p className="text-gray-500 text-sm">
              Những sản phẩm được các cầu thủ tin dùng nhất tuần qua
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {["Tất cả", "Giày cỏ nhân tạo", "Áo đấu", "Găng tay"].map(
              (tab, idx) => (
                <button
                  key={idx}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                    idx === 0
                      ? "bg-black text-white border-black shadow-lg"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.slice(0, visibleCount).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {visibleCount < products.length && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              className="bg-white border-2 border-gray-200 text-gray-600 px-10 py-3.5 rounded-full font-bold hover:border-green-600 hover:text-green-600 hover:bg-green-50 transition-all inline-flex items-center gap-2 cursor-pointer uppercase text-xs tracking-widest shadow-sm hover:shadow-md"
            >
              Xem thêm sản phẩm <FaChevronDown size={12} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
