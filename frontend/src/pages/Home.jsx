import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// --- ICONS ---
import { BiFootball, BiTime } from "react-icons/bi";
import {
  FaFire,
  FaRunning,
  FaTshirt,
  FaChevronRight,
  FaShieldAlt,
  FaChevronDown, // Import thêm icon mũi tên xuống cho nút Xem thêm
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

// --- COMPONENT & ASSETS ---
import ProductCard from "../components/ProductCard"; // Import Component Card mới
import MainBanner from "../assets/banner_to.jpg";
import TopBanner from "../assets/top_banner.jpg";
import BottomBanner from "../assets/bottom_banner.jpg";

const API_URL = "http://localhost:5000/api";

// --- HELPER CATEGORY ---
const getCategoryStyle = (name) => {
  if (!name)
    return {
      icon: <GiTrophyCup size={30} />,
      color: "bg-gray-100 text-gray-600",
    };
  const lower = name.toLowerCase();

  if (lower.includes("giày"))
    return {
      icon: <GiSoccerKick size={30} />,
      color: "bg-green-100 text-green-700",
    };
  if (
    name.toLowerCase() === "bóng đá" ||
    (lower.includes("bóng") &&
      !lower.includes("giày") &&
      !lower.includes("tất") &&
      !lower.includes("áo"))
  )
    return {
      icon: <BiFootball size={30} />,
      color: "bg-orange-100 text-orange-600",
    };
  if (lower.includes("găng"))
    return { icon: <GiGloves size={30} />, color: "bg-blue-100 text-blue-600" };
  if (lower.includes("bảo vệ") || lower.includes("ống đồng"))
    return {
      icon: <FaShieldAlt size={26} />,
      color: "bg-teal-100 text-teal-700",
    };
  if (lower.includes("áo"))
    return { icon: <FaTshirt size={26} />, color: "bg-red-100 text-red-600" };
  if (lower.includes("túi") || lower.includes("balo"))
    return {
      icon: <GiBackpack size={30} />,
      color: "bg-purple-100 text-purple-700",
    };
  if (lower.includes("vớ") || lower.includes("tất"))
    return { icon: <GiSocks size={30} />, color: "bg-pink-100 text-pink-600" };
  if (lower.includes("tập luyện"))
    return {
      icon: <FaRunning size={28} />,
      color: "bg-yellow-100 text-yellow-700",
    };
  if (lower.includes("còi"))
    return {
      icon: <GiWhistle size={30} />,
      color: "bg-yellow-100 text-yellow-700",
    };
  if (lower.includes("bình nước"))
    return {
      icon: <GiWaterBottle size={30} />,
      color: "bg-cyan-100 text-cyan-700",
    };

  return {
    icon: <GiTrophyCup size={30} />,
    color: "bg-gray-100 text-gray-600",
  };
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE SỐ LƯỢNG HIỂN THỊ ---
  const [visibleCount, setVisibleCount] = useState(8); // Mặc định hiện 8 sản phẩm

  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, productRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/products`),
        ]);
        setCategories(categoryRes.data);
        const allProducts = productRes.data;

        // Lọc sản phẩm sale
        const saleItems = Array.isArray(allProducts)
          ? allProducts.filter((p) => p.discount && p.discount > 0)
          : [];

        setProducts(allProducts);
        setFlashSaleProducts(saleItems.slice(0, 4));
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- HÀM XEM THÊM ---
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-green-600 gap-2">
        <FaRunning className="animate-bounce" size={30} /> Đang tải sân bóng...
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-12 font-sans">
      {/* --- 1. HERO SECTION (Giữ nguyên Banner Tĩnh) --- */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[460px]">
          <div className="md:col-span-8 relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
            <img
              src={MainBanner}
              alt="Main Banner"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-8 text-white">
              <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full w-fit mb-4 uppercase">
                Bộ sưu tập mới
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 italic">
                BỨT TỐC &<br />
                GHI BÀN
              </h2>
              <p className="mb-6 text-lg text-gray-200">
                Giảm đến 50% cho giày Nike & Adidas chính hãng
              </p>
              <button className="bg-white text-green-700 px-6 py-3 rounded-full font-bold hover:bg-green-50 transition w-fit uppercase flex items-center gap-2">
                Khám phá ngay <FaChevronRight size={12} />
              </button>
            </div>
          </div>
          <div className="md:col-span-4 flex flex-col gap-4 h-full">
            <div className="flex-1 rounded-2xl overflow-hidden shadow-md relative cursor-pointer group">
              <img
                src={TopBanner}
                alt="Sub 1"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden shadow-md relative cursor-pointer group">
              <img
                src={BottomBanner}
                alt="Sub 2"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. CATEGORIES --- */}
      <section className="container mx-auto px-4 py-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase border-l-4 border-yellow-500 pl-3">
          <GiTrophyCup className="text-yellow-500" size={28} /> Danh mục thi đấu
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const style = getCategoryStyle(cat.name);
            return (
              <Link to={`/category/${cat._id}`} key={cat._id} className="group">
                <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-green-200 flex flex-col items-center gap-3 cursor-pointer h-full">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:-translate-y-1 ${style.color}`}
                  >
                    {style.icon}
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-green-600 text-center line-clamp-1 uppercase">
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- 3. FLASH SALE (Giữ nguyên dạng card riêng để có thanh progress bar) --- */}
      {flashSaleProducts.length > 0 && (
        <section className="bg-white py-8 border-y border-gray-200 mb-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-black text-red-600 italic flex items-center gap-2 uppercase">
                  <FaFire className="text-red-600 animate-pulse" /> Giờ Vàng Giá
                  Sốc
                </h2>
                <div className="flex items-center gap-2 text-white bg-black px-4 py-1.5 rounded-lg text-sm font-bold shadow-inner">
                  <BiTime size={20} />
                  <span>{String(timeLeft.hours).padStart(2, "0")}</span> :
                  <span>{String(timeLeft.minutes).padStart(2, "0")}</span> :
                  <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                </div>
              </div>
              <Link
                to="/flash-sale"
                className="text-green-600 font-bold flex items-center hover:underline"
              >
                Xem tất cả Deal <FaChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashSaleProducts.map((product) => {
                const currentPrice =
                  product.price * (1 - product.discount / 100);
                const soldMock = Math.floor(Math.random() * 50) + 10;
                return (
                  <div
                    key={product._id}
                    className="border border-red-100 rounded-lg p-3 hover:shadow-lg transition-shadow relative bg-white"
                  >
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded skew-x-[-10deg]">
                      - {product.discount}%
                    </div>
                    <img
                      src={product.image_url || "https://placehold.co/300x300"}
                      alt={product.product_name}
                      className="w-full h-40 object-contain mb-3 rounded"
                    />
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 h-10">
                      {product.product_name}
                    </h4>
                    <div className="flex flex-col">
                      <span className="text-red-600 font-black text-lg">
                        {formatCurrency(currentPrice)}
                      </span>
                      <span className="text-gray-400 text-xs line-through">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    {/* Progress Bar riêng cho Flash Sale */}
                    <div className="mt-3 relative h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-orange-500"
                        style={{ width: `${(soldMock / 100) * 100}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold z-10 uppercase">
                        Đã bán {soldMock}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* --- 4. FEATURED PRODUCTS (Dùng ProductCard & Logic Load More) --- */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-gray-200 pb-4">
          <h3 className="text-2xl font-bold text-gray-800 uppercase border-l-4 border-green-600 pl-3">
            Hàng Tuyển Chọn
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              "Giày cỏ nhân tạo",
              "Giày cỏ tự nhiên",
              "Áo đấu 2024",
              "Găng thủ môn",
            ].map((tab, idx) => (
              <button
                key={idx}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  idx === 0
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Sản Phẩm sử dụng ProductCard component */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, visibleCount).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* Nút Xem Thêm */}
        {visibleCount < products.length && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="bg-white border-2 border-green-600 text-green-600 px-8 py-2.5 rounded-full font-bold hover:bg-green-600 hover:text-white transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm uppercase text-sm"
            >
              Xem thêm sản phẩm <FaChevronDown size={14} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
